"""
MOVA Contract Bridge — MCP server (thin HTTP client over MOVA API).

Contains ZERO contracts, policies, runtime logic, or episodes locally.
All operations are delegated to the MOVA API.

Environment variables:
  MOVA_API_KEY    Required (after registration). Your MOVA API key.
  MOVA_API_URL    Optional. Defaults to the production endpoint.
  LLM_KEY         OpenRouter key for AI steps.
  LLM_MODEL       Model for AI steps (default: openai/gpt-4o-mini).
  OCR_LLM_MODEL   Model for OCR step (default: qwen/qwen3-vl-32b-instruct).
"""
from __future__ import annotations

import json
import os
import uuid
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

_VERSION = "0.3.0"
_DEFAULT_API_URL = "https://api.mova-lab.eu"

mcp = FastMCP("mova-bridge")

# Force IPv4 — VPS has no working IPv6, httpx would wait 60s for timeout otherwise.
_client = httpx.Client(transport=httpx.HTTPTransport(local_address="0.0.0.0"))


# ── HTTP helpers ───────────────────────────────────────────────────────────────

def _api_url() -> str:
    return os.environ.get("MOVA_API_URL", _DEFAULT_API_URL).rstrip("/")


def _headers(require_key: bool = True, with_llm: bool = False) -> dict[str, str]:
    key = os.environ.get("MOVA_API_KEY", "")
    if require_key and not key:
        raise ValueError(
            "MOVA_API_KEY is not set.\n"
            "Call mova_register to create an account and get your key,\n"
            "then set MOVA_API_KEY in your MCP configuration."
        )
    h = {"X-Client": f"mova-bridge/{_VERSION}", "Content-Type": "application/json"}
    if key:
        h["Authorization"] = f"Bearer {key}"
    if with_llm:
        llm_key = os.environ.get("LLM_KEY", "")
        llm_model = os.environ.get("LLM_MODEL", "openai/gpt-4o-mini")
        if llm_key:
            h["X-LLM-Key"] = llm_key
        if llm_model:
            h["X-LLM-Model"] = llm_model
    return h


def _get(path: str, params: dict | None = None, timeout: int = 30) -> Any:
    try:
        r = _client.get(
            f"{_api_url()}{path}",
            headers=_headers(),
            params={k: v for k, v in (params or {}).items() if v},
            timeout=timeout,
        )
        return _handle(r)
    except ValueError as e:
        return {"ok": False, "error": str(e)}


def _post(path: str, body: dict, require_key: bool = True, timeout: int = 30) -> Any:
    try:
        r = _client.post(
            f"{_api_url()}{path}",
            headers=_headers(require_key=require_key),
            content=json.dumps(body),
            timeout=timeout,
        )
        return _handle(r)
    except ValueError as e:
        return {"ok": False, "error": str(e)}


def _handle(r: httpx.Response) -> Any:
    if r.status_code == 401:
        return {"ok": False, "error": "Invalid API key. Call mova_register for a new key or check your MOVA_API_KEY setting."}
    if r.status_code == 402:
        return {"ok": False, "error": "Insufficient balance. Contact your MOVA administrator to top up."}
    if r.status_code == 404:
        return {"ok": False, "error": "Not found. Check the contract ID or episode ID."}
    if r.status_code == 429:
        return {"ok": False, "error": "Rate limit exceeded. Slow down and retry."}
    if r.status_code >= 400:
        try:
            detail = r.json().get("error", r.json().get("detail", r.text))
        except Exception:
            detail = r.text
        return {"ok": False, "error": f"API error {r.status_code}: {detail}"}
    try:
        return r.json()
    except Exception:
        return {"ok": True, "raw": r.text}


# ── MCP tools ──────────────────────────────────────────────────────────────────

@mcp.tool(name="mova_register")
def mova_register(org_name: str) -> str:
    """Register a new MOVA account and get an API key.

    Call this once to get started. Returns your api_key — save it and set it
    as the MOVA_API_KEY environment variable in your MCP configuration.
    Your account starts with $1.00 free credit to try the platform.

    Args:
        org_name: Your organisation or team name, e.g. "Acme Risk Team".

    Returns JSON with your api_key, org_id, and initial balance.
    """
    result = _post("/api/v1/accounts/register", {"org_name": org_name}, require_key=False)
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_list_contracts")
def mova_list_contracts(domain: str = "", keyword: str = "") -> str:
    """List available MOVA contracts (tasks).

    Args:
        domain: Filter by domain, e.g. 'finance', 'compliance', 'ecommerce', 'sales'.
        keyword: Free-text search in contract titles and descriptions.

    Returns JSON list of contracts with title, domain, and description.
    """
    result = _get("/api/v1/tasks", {"category": domain, "keyword": keyword})
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_get_contract")
def mova_get_contract(contract_id: str) -> str:
    """Get full details for a specific contract including required inputs and cost estimate.

    Args:
        contract_id: Contract ID, e.g. 'agent.aml.alert_triage_l1'.
                     Call mova_list_contracts first to see available IDs.

    Returns JSON with contract details, limits, connectors, and cost estimate.
    """
    result = _get(f"/api/v1/tasks/{contract_id}")
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_price_estimate")
def mova_price_estimate(contract_id: str) -> str:
    """Get a cost estimate before executing a contract.
    Always call this before mova_execute and show the result to the user.

    Args:
        contract_id: Contract ID to estimate, e.g. 'agent.aml.alert_triage_l1'.

    Returns JSON with median and p95 cost in USD and estimated duration.
    """
    result = _get(f"/api/v1/tasks/{contract_id}")
    if not result.get("ok"):
        return json.dumps(result, ensure_ascii=False, indent=2)

    contract  = result.get("contract", {})
    estimate  = result.get("cost_estimate", {})
    title     = contract.get("meta", {}).get("title", contract_id)
    connectors = contract.get("connector_refs", [])

    return json.dumps({
        "ok": True,
        "contract_id": contract_id,
        "title": title,
        "estimate": {
            "median_usd": estimate.get("median_usd"),
            "p95_usd":    estimate.get("p95_usd"),
            "duration_p50_ms": estimate.get("duration_p50_ms"),
            "currency":   "USD",
        },
        "connectors_used": len(connectors),
        "note": (
            "Cost increases if the agent makes connector calls. "
            "You are billed only after a fulfilled execution."
        ),
    }, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_execute")
def mova_execute(contract_id: str, inputs: dict) -> str:
    """Execute a MOVA contract.

    IMPORTANT: Always call mova_price_estimate first and confirm the cost with the user.

    Args:
        contract_id: Contract ID to execute, e.g. 'agent.aml.alert_triage_l1'.
        inputs: Input payload matching the contract's required fields.
                Call mova_get_contract to see the expected input fields.

    Returns JSON with the agent decision, verdict (fulfilled/failed), episode_id
    (your audit receipt), cost, and connector calls made.
    Save the episode_id — it is your permanent audit reference.
    """
    result = _post(
        f"/api/v1/tasks/{contract_id}/run",
        {"inputs": inputs},
        timeout=120,
    )
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_get_episode")
def mova_get_episode(episode_id: str) -> str:
    """Retrieve the full audit record for a past execution by episode ID.

    Args:
        episode_id: Episode ID from a previous mova_execute call, e.g. 'ep-abc123def456'.

    Returns JSON with the full decision, reasoning, all connector calls made,
    budget usage, verdict, and timestamps.
    """
    result = _get(f"/api/v1/jobs/{episode_id}")
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_list_episodes")
def mova_list_episodes(
    contract_id: str = "",
    status: str = "",
    limit: int = 20,
) -> str:
    """List past executions for your organisation.

    Args:
        contract_id: Filter by contract ID (optional).
        status: Filter by verdict: 'fulfilled', 'failed' (optional).
        limit: Max results to return (default 20, max 100).

    Returns JSON list of episodes with verdict, cost, and timestamps.
    """
    key = os.environ.get("MOVA_API_KEY", "")
    if not key:
        return json.dumps({"ok": False, "error": "MOVA_API_KEY not set. Call mova_register first."})

    # Derive org_id from auth — use a placeholder, server resolves from API key
    result = _get(
        "/api/v1/orgs/_me/jobs",
        {"task_id": contract_id, "status": status, "limit": limit},
    )
    # Fallback: if _me is not supported, try via spend endpoint to discover org_id
    if not result.get("ok"):
        # Try getting org_id from the account
        spend = _get("/api/v1/orgs/_me/spend")
        org_id = spend.get("org_id", "")
        if org_id:
            result = _get(
                f"/api/v1/orgs/{org_id}/jobs",
                {"task_id": contract_id, "status": status, "limit": limit},
            )
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_usage")
def mova_usage() -> str:
    """Get spend and execution statistics for your organisation.

    Returns JSON with total spend, execution count, and balance remaining.
    """
    result = _get("/api/v1/orgs/_me/spend")
    return json.dumps(result, ensure_ascii=False, indent=2)


# ── HITL contract steps (invoice) ─────────────────────────────────────────────

_INVOICE_STEPS = [
    {
        "step_id": "analyze",
        "step_type": "ai_task",
        "title": "OCR Extract and Validate Invoice",
        "next_step_id": "verify",
        "config": {
            "model": os.environ.get("OCR_LLM_MODEL", "qwen/qwen3-vl-32b-instruct"),
            "api_key_env": "OCR_LLM_KEY",
            "system_prompt": (
                "You are an invoice OCR and validation agent. "
                "The user message contains the invoice image. Extract all fields and validate. "
                "Return ONLY a JSON object with: "
                "document_id, vendor_name, vendor_iban, vendor_tax_id, "
                "total_amount (number), currency (ISO-4217), "
                "invoice_date (ISO-8601), due_date (ISO-8601), "
                "po_reference (null if missing), subtotal (number), tax_amount (number), "
                "line_items (array of {description, quantity, unit_price, amount}), "
                "review_decision (pass_to_ap/hold_for_review/reject), "
                "vendor_status (known/unknown/blocked), po_match (matched/partial/not_found), "
                "duplicate_flag (bool), ocr_confidence (0.0-1.0), "
                "risk_score (0.0-1.0), findings (list of {code, severity, summary}), "
                "requires_human_approval (bool), decision_reasoning (string)."
            ),
        },
    },
    {
        "step_id": "verify",
        "step_type": "verification",
        "title": "Risk Snapshot",
        "next_step_id": "decide",
        "config": {"recommended_action": "review"},
    },
    {
        "step_id": "decide",
        "step_type": "decision_point",
        "title": "AP Decision Gate",
        "config": {
            "decision_kind": "invoice_approval",
            "question": "Invoice processing complete. Select action:",
            "required_actor": {"actor_type": "human"},
            "options": [
                {"option_id": "approve",             "label": "Approve — process payment"},
                {"option_id": "reject",              "label": "Reject — notify vendor"},
                {"option_id": "escalate_accountant", "label": "Escalate to accountant"},
                {"option_id": "request_info",        "label": "Request more information"},
            ],
            "route_map": {
                "approve":             "__end__",
                "reject":              "__end__",
                "escalate_accountant": "__end__",
                "request_info":        "__end__",
                "_default":            "__end__",
            },
        },
    },
]


_PO_STEPS = [
    {
        "step_id": "analyze",
        "step_type": "ai_task",
        "title": "PO Risk Analysis",
        "next_step_id": "verify",
        "config": {
            "model": os.environ.get("LLM_MODEL", "openai/gpt-4o-mini"),
            "api_key_env": "LLM_KEY",
            "system_prompt": (
                "You are a procurement risk analyst. "
                "Review the purchase order data provided and run all connector checks. "
                "Return ONLY a JSON object with: "
                "po_id, review_decision (approve/hold/reject/escalate), "
                "approval_tier (manager/director/board), "
                "budget_check ({within_budget, utilization_pct, budget_remaining}), "
                "vendor_status (registered/pending/blacklisted), "
                "authority_check ({adequate, reason}), "
                "anomaly_flags (array), "
                "findings (array of {code, severity, summary}), "
                "requires_human_approval (bool), "
                "recommended_action (approve/hold/reject/escalate), "
                "decision_reasoning (string), "
                "risk_score (0.0-1.0)."
            ),
        },
    },
    {
        "step_id": "verify",
        "step_type": "verification",
        "title": "Procurement Risk Snapshot",
        "next_step_id": "decide",
        "config": {"recommended_action": "review"},
    },
    {
        "step_id": "decide",
        "step_type": "decision_point",
        "title": "Procurement Decision Gate",
        "config": {
            "decision_kind": "procurement_review",
            "question": "AI analysis complete. Select the procurement decision:",
            "required_actor": {"actor_type": "human"},
            "options": [
                {"option_id": "approve",   "label": "Approve PO"},
                {"option_id": "hold",      "label": "Hold for review"},
                {"option_id": "reject",    "label": "Reject PO"},
                {"option_id": "escalate",  "label": "Escalate to director/board"},
            ],
            "route_map": {
                "approve":  "__end__",
                "hold":     "__end__",
                "reject":   "__end__",
                "escalate": "__end__",
                "_default": "__end__",
            },
        },
    },
]


def _hitl_post(path: str, body: dict, timeout: int = 180) -> Any:
    try:
        r = _client.post(
            f"{_api_url()}{path}",
            headers=_headers(with_llm=True),
            content=json.dumps(body),
            timeout=timeout,
        )
        return _handle(r)
    except ValueError as e:
        return {"ok": False, "error": str(e)}


def _hitl_get(path: str, timeout: int = 30) -> Any:
    try:
        r = _client.get(
            f"{_api_url()}{path}",
            headers=_headers(),
            timeout=timeout,
        )
        return _handle(r)
    except ValueError as e:
        return {"ok": False, "error": str(e)}


def _run_steps(contract_id: str) -> dict:
    """Execute analyze → verify → decide steps in sequence.
    Returns final status dict. Stops early if waiting_human."""
    for step_id in ["analyze", "verify", "decide"]:
        result = _hitl_post(
            f"/api/v1/contracts/{contract_id}/step",
            {"envelope": {
                "kind": "env.step.execute_v0",
                "envelope_id": f"env-{uuid.uuid4().hex[:8]}",
                "contract_id": contract_id,
                "actor": {"actor_type": "system", "actor_id": "mova_runtime"},
                "payload": {"step_id": step_id},
            }},
        )
        if not result.get("ok"):
            return result
        status = result.get("status", "")
        if status == "waiting_human":
            # Get decision point details
            dp_resp = _hitl_get(f"/api/v1/contracts/{contract_id}/decision")
            dp = dp_resp.get("decision_point", {})
            return {
                "ok": True,
                "status": "waiting_human",
                "contract_id": contract_id,
                "question": dp.get("question", "Select action:"),
                "options": dp.get("options", []),
                "recommended": dp.get("recommended_option_id"),
            }
    # All steps done — return audit
    audit = _hitl_get(f"/api/v1/contracts/{contract_id}/audit")
    receipt = audit.get("audit_receipt", {})
    return {
        "ok": True,
        "status": "completed",
        "contract_id": contract_id,
        "audit_receipt": receipt,
    }


# ── HITL MCP tools ─────────────────────────────────────────────────────────────

@mcp.tool(name="mova_hitl_start")
def mova_hitl_start(file_url: str, document_id: str = "") -> str:
    """Start a HITL invoice processing contract (OCR → validate → human decision).

    Call this immediately when the user sends an invoice image or asks to process
    an invoice. Do NOT ask for confirmation — just call it.

    Args:
        file_url: Direct HTTPS URL to the invoice image (JPEG or PNG).
        document_id: Optional invoice ID (auto-generated if not provided).

    Returns JSON. If status is "waiting_human" — show the user the decision options
    and wait for their choice, then call mova_hitl_decide.
    If status is "completed" — show the audit_receipt summary.
    """
    doc_id = document_id or f"INV-{uuid.uuid4().hex[:8].upper()}"
    contract_id = f"ctr-invoice-{uuid.uuid4().hex[:8]}"

    # Build and start contract
    body = {
        "envelope": {
            "kind": "env.contract.start_v0",
            "envelope_id": f"env-{uuid.uuid4().hex[:8]}",
            "contract_id": contract_id,
            "actor": {"actor_type": "human", "actor_id": "user"},
            "payload": {
                "template_id": "tpl.finance.invoice_ocr_hitl_v0",
                "policy_profile_ref": "policy.hitl.finance.invoice_ocr_v0",
                "initial_inputs": [
                    {"key": "document_id", "value": doc_id},
                    {"key": "document_type", "value": "invoice"},
                    {"key": "file_url", "value": file_url},
                ],
            },
        },
        "steps": _INVOICE_STEPS,
    }

    start = _hitl_post("/api/v1/contracts", body)
    if not start.get("ok"):
        return json.dumps(start, ensure_ascii=False, indent=2)

    result = _run_steps(contract_id)
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_hitl_decide")
def mova_hitl_decide(contract_id: str, option: str, reason: str = "") -> str:
    """Submit a human decision for a HITL invoice contract.

    Call this after mova_hitl_start returns status "waiting_human".

    Args:
        contract_id: Contract ID from mova_hitl_start.
        option: Decision option ID: "approve", "reject", "escalate_accountant", "request_info".
        reason: Reason for the decision (brief plain text).

    Returns JSON with final audit receipt.
    """
    dp_resp = _hitl_get(f"/api/v1/contracts/{contract_id}/decision")
    dp = dp_resp.get("decision_point", {})

    result = _hitl_post(
        f"/api/v1/contracts/{contract_id}/decision",
        {"envelope": {
            "kind": "env.decision.submit_v0",
            "envelope_id": f"env-{uuid.uuid4().hex[:8]}",
            "contract_id": contract_id,
            "decision_point_id": dp.get("decision_point_id", ""),
            "actor": {"actor_type": "human", "actor_id": "user"},
            "payload": {
                "selected_option_id": option,
                "selection_reason": reason or "decision via mova-bridge",
            },
        }},
    )
    if not result.get("ok"):
        return json.dumps(result, ensure_ascii=False, indent=2)

    audit = _hitl_get(f"/api/v1/contracts/{contract_id}/audit")
    receipt = audit.get("audit_receipt", {})
    return json.dumps({
        "ok": True,
        "status": "completed",
        "contract_id": contract_id,
        "decision": option,
        "audit_receipt": receipt,
    }, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_hitl_status")
def mova_hitl_status(contract_id: str) -> str:
    """Get the current status of a HITL invoice contract.

    Args:
        contract_id: Contract ID from mova_hitl_start.
    """
    result = _hitl_get(f"/api/v1/contracts/{contract_id}")
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_hitl_audit")
def mova_hitl_audit(contract_id: str) -> str:
    """Get the full audit receipt for a completed HITL invoice contract.

    Args:
        contract_id: Contract ID from mova_hitl_start.
    """
    result = _hitl_get(f"/api/v1/contracts/{contract_id}/audit")
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool(name="mova_hitl_start_po")
def mova_hitl_start_po(po_id: str, approver_employee_id: str = "") -> str:
    """Start a HITL purchase order approval contract (risk analysis → human decision).

    Call this when the user wants to submit a PO for approval or review.

    Args:
        po_id: Purchase order ID in the ERP system (e.g. "PO-2026-001").
        approver_employee_id: Optional employee ID for authority check (e.g. "EMP-1042").

    Returns JSON. If status is "waiting_human" — show the AI risk analysis and decision
    options (approve/hold/reject/escalate), wait for the user's choice, then call
    mova_hitl_decide with the selected option.
    If status is "completed" — show the audit_receipt summary.
    """
    contract_id = f"ctr-po-{uuid.uuid4().hex[:8]}"

    initial_inputs = [
        {"key": "po_id", "value": po_id},
        {"key": "contract_type", "value": "po_approval"},
    ]
    if approver_employee_id:
        initial_inputs.append({"key": "approver_employee_id", "value": approver_employee_id})

    body = {
        "envelope": {
            "kind": "env.contract.start_v0",
            "envelope_id": f"env-{uuid.uuid4().hex[:8]}",
            "contract_id": contract_id,
            "actor": {"actor_type": "human", "actor_id": "user"},
            "payload": {
                "template_id": "tpl.erp.po_approval_hitl_v0",
                "policy_profile_ref": "policy.hitl.erp.po_approval_v0",
                "initial_inputs": initial_inputs,
            },
        },
        "steps": _PO_STEPS,
    }

    start = _hitl_post("/api/v1/contracts", body)
    if not start.get("ok"):
        return json.dumps(start, ensure_ascii=False, indent=2)

    result = _run_steps(contract_id)
    return json.dumps(result, ensure_ascii=False, indent=2)


# ── CLI call mode ──────────────────────────────────────────────────────────────

def _cli_call(args: list[str]) -> None:
    """CLI call mode: mova-bridge call <tool> [--key value ...]
    Calls a tool function and prints JSON result to stdout.
    """
    import sys
    if not args:
        print(json.dumps({"ok": False, "error": "Usage: mova-bridge call <tool> [--key value ...]"}))
        sys.exit(1)

    tool_name = args[0]
    kwargs: dict = {}
    i = 1
    while i < len(args):
        if args[i].startswith("--"):
            key = args[i][2:].replace("-", "_")
            val = args[i + 1] if i + 1 < len(args) else ""
            kwargs[key] = val
            i += 2
        else:
            i += 1

    dispatch = {
        "mova_hitl_start":  lambda: mova_hitl_start(**kwargs),
        "mova_hitl_decide": lambda: mova_hitl_decide(**kwargs),
        "mova_hitl_status": lambda: mova_hitl_status(**kwargs),
        "mova_hitl_audit":  lambda: mova_hitl_audit(**kwargs),
        "mova_execute":     lambda: mova_execute(kwargs.get("contract_id", ""), json.loads(kwargs.get("inputs", "{}"))),
        "mova_list_contracts": lambda: mova_list_contracts(),
        "mova_usage":       lambda: mova_usage(),
    }

    fn = dispatch.get(tool_name)
    if fn is None:
        print(json.dumps({"ok": False, "error": f"Unknown tool: {tool_name}"}))
        sys.exit(1)

    print(fn())


# ── Entry point ────────────────────────────────────────────────────────────────

def main() -> None:
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "call":
        _cli_call(sys.argv[2:])
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
