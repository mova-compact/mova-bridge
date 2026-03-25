import type { OpenClawPluginDefinition } from "openclaw/plugin-sdk";
import { Type } from "@sinclair/typebox";
import {
  movaPost, movaGet, movaPut, movaDelete,
  movaRunSteps, shortId,
  toolResult, type MovaConfig,
} from "./client.js";

// ── Step definitions ──────────────────────────────────────────────────────────

const INVOICE_STEPS = [
  {
    step_id: "analyze", step_type: "ai_task", title: "OCR Extract and Validate Invoice", next_step_id: "verify",
    config: {
      model: "qwen/qwen3-vl-32b-instruct", api_key_env: "OCR_LLM_KEY",
      system_prompt: "You are an invoice OCR and validation agent. The user message contains the invoice image. Extract all fields and validate. Return ONLY a JSON object with: document_id, vendor_name, vendor_iban, vendor_tax_id, total_amount (number), currency (ISO-4217), invoice_date (ISO-8601), due_date (ISO-8601), po_reference (null if missing), subtotal (number), tax_amount (number), line_items (array of {description, quantity, unit_price, amount}), review_decision (pass_to_ap/hold_for_review/reject), vendor_status (known/unknown/blocked), po_match (matched/partial/not_found), duplicate_flag (bool), ocr_confidence (0.0-1.0), risk_score (0.0-1.0), findings (list of {code, severity, summary}), requires_human_approval (bool), decision_reasoning (string).",
    },
  },
  { step_id: "verify", step_type: "verification", title: "Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide", step_type: "decision_point", title: "AP Decision Gate",
    config: {
      decision_kind: "invoice_approval", question: "Invoice processing complete. Select action:", required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve — process payment" },
        { option_id: "reject", label: "Reject — notify vendor" },
        { option_id: "escalate_accountant", label: "Escalate to accountant" },
        { option_id: "request_info", label: "Request more information" },
      ],
      route_map: { approve: "__end__", reject: "__end__", escalate_accountant: "__end__", request_info: "__end__", _default: "__end__" },
    },
  },
];

const PO_STEPS = [
  {
    step_id: "analyze", step_type: "ai_task", title: "PO Risk Analysis", next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini", api_key_env: "LLM_KEY",
      system_prompt: "You are a procurement risk analyst. Review the purchase order data provided and run all connector checks. Return ONLY a JSON object with: po_id, review_decision (approve/hold/reject/escalate), approval_tier (manager/director/board), budget_check ({within_budget, utilization_pct, budget_remaining}), vendor_status (registered/pending/blacklisted), authority_check ({adequate, reason}), anomaly_flags (array), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (approve/hold/reject/escalate), decision_reasoning (string), risk_score (0.0-1.0).",
    },
  },
  { step_id: "verify", step_type: "verification", title: "Procurement Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide", step_type: "decision_point", title: "Procurement Decision Gate",
    config: {
      decision_kind: "procurement_review", question: "AI analysis complete. Select the procurement decision:", required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve PO" },
        { option_id: "hold", label: "Hold for review" },
        { option_id: "reject", label: "Reject PO" },
        { option_id: "escalate", label: "Escalate to director/board" },
      ],
      route_map: { approve: "__end__", hold: "__end__", reject: "__end__", escalate: "__end__", _default: "__end__" },
    },
  },
];

const TRADE_STEPS = [
  {
    step_id: "analyze", step_type: "ai_task", title: "Trade Risk Analysis", next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini", api_key_env: "LLM_KEY",
      system_prompt: "You are a crypto trade risk analyst. Review the trade order data and run all risk checks. Return ONLY a JSON object with: trade_id, review_decision (approve/reject/escalate_human), risk_level (low/medium/high/critical), market_check ({price_usd, volatility_score, change_24h_pct}), balance_check ({sufficient, available_margin}), portfolio_risk ({concentration_pct, risk_level, var_1d_usd}), sanctions_check ({is_sanctioned, is_pep, list_name}), anomaly_flags (array), findings (array of {code, severity, summary}), rejection_reasons (array), requires_human_approval (bool), decision_reasoning (string), risk_score (0.0-1.0). IMMEDIATE REJECT: sanctions hit OR leverage > 10x. MANDATORY ESCALATE: order_size_usd >= 10000 OR leverage > 3.",
    },
  },
  { step_id: "verify", step_type: "verification", title: "Trade Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide", step_type: "decision_point", title: "Trading Decision Gate",
    config: {
      decision_kind: "trade_review", question: "Trade risk analysis complete. Select trading decision:", required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve trade" },
        { option_id: "reject", label: "Reject trade" },
        { option_id: "escalate_human", label: "Escalate to human trader" },
      ],
      route_map: { approve: "__end__", reject: "__end__", escalate_human: "__end__", _default: "__end__" },
    },
  },
];

const COMPLAINTS_STEPS = [
  {
    step_id: "analyze", step_type: "ai_task", title: "Complaint Classification & Risk Analysis", next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini", api_key_env: "LLM_KEY",
      system_prompt: "You are an EU financial services complaints handler. Review the complaint data and classify it. Return ONLY a JSON object with: complaint_id, triage_decision (routine/manual_review/blocked), product_risk (low/medium/high), sentiment_flags (array: compensation_claim, regulator_threat, fraud_signal, urgent), repeat_customer (bool), completeness_check ({text_present, channel_valid, product_identified}), anomaly_flags (array), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (auto_resolve/manual_review/reject_incomplete), decision_reasoning (string), risk_score (0.0-1.0), draft_response_hint (string). MANDATORY HUMAN REVIEW: compensation claim OR regulator threat OR repeat customer OR product_risk=high OR fraud_signal. BLOCKED: complaint_text empty or under 10 characters.",
    },
  },
  { step_id: "verify", step_type: "verification", title: "Complaint Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide", step_type: "decision_point", title: "Complaints Handler Decision Gate",
    config: {
      decision_kind: "complaint_review", question: "Complaint classification complete. Select handling decision:", required_actor: { actor_type: "human" },
      options: [
        { option_id: "resolve", label: "Resolve — send standard response" },
        { option_id: "escalate", label: "Escalate to complaints officer" },
        { option_id: "reject", label: "Reject — incomplete or invalid" },
        { option_id: "regulator_flag", label: "Flag for regulator reporting" },
      ],
      route_map: { resolve: "__end__", escalate: "__end__", reject: "__end__", regulator_flag: "__end__", _default: "__end__" },
    },
  },
];

const AML_STEPS = [
  {
    step_id: "analyze", step_type: "ai_task", title: "AML Alert Triage Analysis", next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini", api_key_env: "LLM_KEY",
      system_prompt: "You are an AML compliance analyst performing L1 alert triage. Review the alert data and run all connector checks. Return ONLY a JSON object with: alert_id, triage_decision (false_positive/manual_review/immediate_escalate), risk_score_assessment (0-100), sanctions_check ({is_sanctioned, list_name}), pep_check ({is_pep, pep_category}), typology_match ({matched, typology_code, description}), customer_risk ({rating, jurisdiction_risk, burst_intensity}), anomaly_flags (array), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (clear/escalate_l2/immediate_escalate), decision_reasoning (string), risk_score (0.0-1.0). IMMEDIATE ESCALATE: sanctions_match=true OR pep_status=true OR risk_score > 85. FALSE POSITIVE: risk_score <= 30 AND no sanctions AND no PEP AND no prior alerts.",
    },
  },
  { step_id: "verify", step_type: "verification", title: "AML Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide", step_type: "decision_point", title: "AML Triage Decision Gate",
    config: {
      decision_kind: "aml_triage", question: "AML L1 triage complete. Select compliance decision:", required_actor: { actor_type: "human" },
      options: [
        { option_id: "clear", label: "Clear — false positive" },
        { option_id: "escalate_l2", label: "Escalate to L2 analyst" },
        { option_id: "immediate_escalate", label: "Immediate escalation — freeze account" },
      ],
      route_map: { clear: "__end__", escalate_l2: "__end__", immediate_escalate: "__end__", _default: "__end__" },
    },
  },
];

// ── Intent Calibration schemas ────────────────────────────────────────────────

interface CalibrationField {
  field: string;
  question: string;
  example: string;
  required: boolean;
}

const CONTRACT_SCHEMAS: Record<string, CalibrationField[]> = {
  invoice: [
    { field: "file_url",     question: "Provide the direct HTTPS URL to the invoice document (PDF, JPEG or PNG).", example: "https://example.com/invoice.jpg", required: true },
    { field: "document_id",  question: "Provide a document ID, or reply 'skip' to auto-generate.", example: "INV-2026-0441", required: false },
  ],
  po: [
    { field: "po_id",                 question: "What is the purchase order number?",              example: "PO-2026-001", required: true },
    { field: "approver_employee_id",  question: "What is the HR employee ID of the approver?",     example: "EMP-1042",    required: true },
  ],
  trade: [
    { field: "trade_id",        question: "What is the trade order ID?",                          example: "TRD-2026-0001",  required: true },
    { field: "wallet_address",  question: "What is the wallet address to screen?",                example: "0xabc123…",      required: true },
    { field: "chain",           question: "Which blockchain network?",                            example: "ethereum",       required: true },
    { field: "token_pair",      question: "Which token pair?",                                    example: "BTC/USDT",       required: true },
    { field: "side",            question: "Buy or sell?",                                         example: "buy",            required: true },
    { field: "order_type",      question: "What order type?",                                     example: "market",         required: true },
    { field: "order_size_usd",  question: "What is the order size in USD?",                       example: "5000",           required: true },
    { field: "leverage",        question: "What leverage multiplier? (1 = no leverage)",          example: "1",              required: true },
  ],
  complaint: [
    { field: "complaint_id",      question: "What is the complaint ID?",                                               example: "CMP-2026-1001",              required: true },
    { field: "customer_id",       question: "What is the customer ID?",                                                example: "C-789",                       required: true },
    { field: "complaint_text",    question: "Provide the full complaint text.",                                        example: "Payment deducted twice…",     required: true },
    { field: "channel",           question: "Through which channel was the complaint submitted?",                      example: "web, email, phone, chat",     required: true },
    { field: "product_category",  question: "Which product or service category does this complaint concern?",          example: "payments, mortgage, insurance", required: true },
    { field: "complaint_date",    question: "What is the complaint date (ISO format)?",                                example: "2026-03-25",                  required: true },
  ],
  aml: [
    { field: "alert_id",               question: "What is the AML alert ID?",                                            example: "ALERT-1002",              required: true },
    { field: "rule_id",                question: "What is the transaction monitoring rule ID?",                           example: "TM-STRUCT-11",            required: true },
    { field: "rule_description",       question: "Describe the rule that triggered the alert.",                           example: "Structuring pattern",     required: true },
    { field: "risk_score",             question: "What is the risk score (0–100)?",                                       example: "72",                      required: true },
    { field: "customer_id",            question: "What is the customer ID?",                                              example: "C-1042",                  required: true },
    { field: "customer_name",          question: "What is the customer's full name?",                                     example: "Ivan Petrov",             required: true },
    { field: "customer_risk_rating",   question: "What is the customer risk rating?",                                     example: "low, medium, or high",    required: true },
    { field: "customer_type",          question: "Is the customer an individual or a business?",                          example: "individual",              required: true },
    { field: "customer_jurisdiction",  question: "What is the customer's jurisdiction (ISO 3166-1 alpha-2)?",             example: "DE",                      required: true },
    { field: "triggered_transactions", question: "List the triggered transactions as a JSON array.",                      example: '[{"transaction_id":"TXN-001","amount_eur":9800}]', required: true },
    { field: "pep_status",             question: "Is the customer a Politically Exposed Person (PEP)? (true/false)",      example: "false",                   required: true },
    { field: "sanctions_match",        question: "Is there a sanctions list match? (true/false)",                         example: "false",                   required: true },
  ],
};

const START_TOOL: Record<string, string> = {
  invoice:   "mova_hitl_start",
  po:        "mova_hitl_start_po",
  trade:     "mova_hitl_start_trade",
  complaint: "mova_hitl_start_complaint",
  aml:       "mova_hitl_start_aml",
};

// ── Plugin definition ─────────────────────────────────────────────────────────

const plugin: OpenClawPluginDefinition = {
  id: "mova",
  name: "MOVA",
  description: "HITL contract execution — invoice OCR, PO approval, AML triage, complaints, crypto trade review, connector registry.",

  register(api) {
    function cfg(): MovaConfig {
      const c = api.pluginConfig as { apiKey?: string; baseUrl?: string };
      if (!c?.apiKey) throw new Error("MOVA API key not configured. Set it with: openclaw config set plugins.entries.mova.config.apiKey YOUR_KEY");
      return { apiKey: c.apiKey, baseUrl: c.baseUrl ?? "https://api.mova-lab.eu" };
    }

    // ── Invoice OCR ───────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start",
      label: "MOVA: Submit Invoice",
      description: "Submit a financial document (invoice, receipt, bill) for OCR extraction and human-in-the-loop approval.",
      parameters: Type.Object({
        file_url: Type.String({ description: "Direct HTTPS URL to the document image (PDF, JPEG, PNG)" }),
        document_id: Type.Optional(Type.String({ description: "Optional document ID (auto-generated if not provided)" })),
      }),
      async execute(_id, p) {
        const config = cfg();
        const docId = (p.document_id as string | undefined) || `INV-${shortId().toUpperCase()}`;
        const contractId = `ctr-invoice-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.finance.invoice_ocr_hitl_v0",
              policy_profile_ref: "policy.hitl.finance.invoice_ocr_v0",
              initial_inputs: [
                { key: "document_id", value: docId },
                { key: "document_type", value: "invoice" },
                { key: "file_url", value: p.file_url },
              ],
            },
          },
          steps: INVOICE_STEPS,
        });
        return toolResult(await movaRunSteps(config, contractId));
      },
    });

    // ── PO Approval ───────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_po",
      label: "MOVA: Submit Purchase Order",
      description: "Submit a purchase order for automated risk analysis and human procurement approval.",
      parameters: Type.Object({
        po_id: Type.String({ description: "Purchase order number, e.g. PO-2026-001" }),
        approver_employee_id: Type.String({ description: "HR employee ID of the approver, e.g. EMP-1042" }),
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-po-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.erp.po_approval_hitl_v0",
              policy_profile_ref: "policy.hitl.erp.po_approval_v0",
              initial_inputs: [
                { key: "po_id", value: p.po_id },
                { key: "approver_employee_id", value: p.approver_employee_id },
              ],
            },
          },
          steps: PO_STEPS,
        });
        return toolResult(await movaRunSteps(config, contractId));
      },
    });

    // ── Crypto Trade Review ───────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_trade",
      label: "MOVA: Submit Trade Order",
      description: "Submit a crypto trade order for sanctions screening, portfolio risk analysis, and human decision gate. Mandatory escalation for orders ≥ $10,000 or leverage > 3x.",
      parameters: Type.Object({
        trade_id: Type.String({ description: "Trade order ID, e.g. TRD-2026-0001" }),
        wallet_address: Type.String({ description: "Wallet address to screen" }),
        chain: Type.String({ description: "Blockchain, e.g. ethereum, bitcoin, solana" }),
        token_pair: Type.String({ description: "Token pair, e.g. BTC/USDT" }),
        side: Type.Union([Type.Literal("buy"), Type.Literal("sell")]),
        order_type: Type.String({ description: "Order type: market, limit, stop" }),
        order_size_usd: Type.Number({ description: "Order size in USD" }),
        leverage: Type.Number({ description: "Leverage multiplier, 1 = no leverage" }),
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-trade-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.crypto.trade_review_hitl_v0",
              policy_profile_ref: "policy.hitl.crypto.trade_review_v0",
              initial_inputs: [
                { key: "trade_id", value: p.trade_id },
                { key: "wallet_address", value: p.wallet_address },
                { key: "chain", value: p.chain },
                { key: "token_pair", value: p.token_pair },
                { key: "side", value: p.side },
                { key: "order_type", value: p.order_type },
                { key: "order_size_usd", value: String(p.order_size_usd) },
                { key: "leverage", value: String(p.leverage) },
              ],
            },
          },
          steps: TRADE_STEPS,
        });
        return toolResult(await movaRunSteps(config, contractId));
      },
    });

    // ── AML Alert Triage ──────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_aml",
      label: "MOVA: Submit AML Alert",
      description: "Submit an AML transaction monitoring alert for automated L1 triage: sanctions screening, PEP check, typology matching, and human compliance decision gate.",
      parameters: Type.Object({
        alert_id: Type.String({ description: "Alert ID, e.g. ALERT-1002" }),
        rule_id: Type.String({ description: "TM rule ID, e.g. TM-STRUCT-11" }),
        rule_description: Type.String({ description: "Human-readable rule description" }),
        risk_score: Type.Number({ description: "Risk score 0–100" }),
        customer_id: Type.String(),
        customer_name: Type.String(),
        customer_risk_rating: Type.Union([Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")]),
        customer_type: Type.Union([Type.Literal("individual"), Type.Literal("business")]),
        customer_jurisdiction: Type.String({ description: "ISO 3166-1 alpha-2 country code, e.g. DE" }),
        triggered_transactions: Type.Array(
          Type.Object({ transaction_id: Type.String(), amount_eur: Type.Number() }),
          { description: "Transactions that triggered the alert" }
        ),
        pep_status: Type.Boolean(),
        sanctions_match: Type.Boolean(),
        historical_alerts: Type.Optional(Type.Array(Type.String())),
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-aml-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.aml.alert_triage_hitl_v0",
              policy_profile_ref: "policy.hitl.aml.alert_triage_v0",
              initial_inputs: [
                { key: "alert_id", value: p.alert_id },
                { key: "rule_id", value: p.rule_id },
                { key: "rule_description", value: p.rule_description },
                { key: "risk_score", value: String(p.risk_score) },
                { key: "customer_id", value: p.customer_id },
                { key: "customer_name", value: p.customer_name },
                { key: "customer_risk_rating", value: p.customer_risk_rating },
                { key: "customer_type", value: p.customer_type },
                { key: "customer_jurisdiction", value: p.customer_jurisdiction },
                { key: "triggered_transactions", value: JSON.stringify(p.triggered_transactions) },
                { key: "pep_status", value: String(p.pep_status) },
                { key: "sanctions_match", value: String(p.sanctions_match) },
                { key: "historical_alerts", value: JSON.stringify(p.historical_alerts ?? []) },
              ],
            },
          },
          steps: AML_STEPS,
        });
        return toolResult(await movaRunSteps(config, contractId));
      },
    });

    // ── Complaints Handler ────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_complaint",
      label: "MOVA: Submit Complaint",
      description: "Submit a customer complaint for EU-compliant AI classification and human decision gate.",
      parameters: Type.Object({
        complaint_id: Type.String({ description: "Complaint ID, e.g. CMP-2026-1001" }),
        customer_id: Type.String(),
        complaint_text: Type.String({ description: "Full complaint text" }),
        channel: Type.String({ description: "Submission channel: web, email, phone, chat, branch" }),
        product_category: Type.String({ description: "e.g. payments, mortgage, insurance" }),
        complaint_date: Type.String({ description: "ISO date, e.g. 2026-03-19" }),
        previous_complaints: Type.Optional(Type.Array(Type.String())),
        attachments: Type.Optional(Type.Array(Type.String())),
        customer_segment: Type.Optional(Type.String()),
        preferred_language: Type.Optional(Type.String()),
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-cmp-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.complaints.handler_hitl_v0",
              policy_profile_ref: "policy.hitl.complaints.handler_v0",
              initial_inputs: [
                { key: "complaint_id", value: p.complaint_id },
                { key: "customer_id", value: p.customer_id },
                { key: "complaint_text", value: p.complaint_text },
                { key: "channel", value: p.channel },
                { key: "product_category", value: p.product_category },
                { key: "complaint_date", value: p.complaint_date },
                { key: "previous_complaints", value: JSON.stringify(p.previous_complaints ?? []) },
                { key: "attachments", value: JSON.stringify(p.attachments ?? []) },
                { key: "customer_segment", value: p.customer_segment ?? "" },
                { key: "preferred_language", value: p.preferred_language ?? "en" },
              ],
            },
          },
          steps: COMPLAINTS_STEPS,
        });
        return toolResult(await movaRunSteps(config, contractId));
      },
    });

    // ── Human Decision ────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_decide",
      label: "MOVA: Submit Decision",
      description: "Submit a human decision for a contract waiting at a human gate. Use the contract_id returned by mova_hitl_start* tools.",
      parameters: Type.Object({
        contract_id: Type.String({ description: "Contract ID from mova_hitl_start* response, e.g. ctr-inv-xxxxxxxx" }),
        option: Type.String({ description: "Decision option, e.g. approve, reject, escalate" }),
        reason: Type.Optional(Type.String({ description: "Human reasoning for the decision" })),
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = p.contract_id as string;
        const dpResp = await movaGet(config, `/api/v1/contracts/${contractId}/decision`) as Record<string, unknown>;
        const dp = (dpResp.decision_point ?? {}) as Record<string, unknown>;

        const result = await movaPost(config, `/api/v1/contracts/${contractId}/decision`, {
          envelope: {
            kind: "env.decision.submit_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            decision_point_id: dp.decision_point_id ?? "",
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              selected_option_id: p.option,
              selection_reason: (p.reason as string | undefined) ?? "decision via MOVA plugin",
            },
          },
        }) as Record<string, unknown>;

        if (!result.ok) return toolResult(result);

        const audit = await movaGet(config, `/api/v1/contracts/${contractId}/audit`) as Record<string, unknown>;
        return toolResult({
          ok: true,
          status: "completed",
          contract_id: contractId,
          decision: p.option,
          audit_receipt: (audit as Record<string, unknown>).audit_receipt ?? {},
        });
      },
    });

    // ── Status & Audit ────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_status",
      label: "MOVA: Get Status",
      description: "Get the current status of a MOVA contract.",
      parameters: Type.Object({ contract_id: Type.String() }),
      async execute(_id, p) {
        return toolResult(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}`));
      },
    });

    api.registerTool({
      name: "mova_hitl_audit",
      label: "MOVA: Get Audit",
      description: "Get the full audit receipt for a completed MOVA contract.",
      parameters: Type.Object({ contract_id: Type.String() }),
      async execute(_id, p) {
        return toolResult(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}/audit`));
      },
    });

    api.registerTool({
      name: "mova_hitl_audit_compact",
      label: "MOVA: Get Compact Journal",
      description: "Get the compact audit journal for a contract — full signed event chain with timestamps.",
      parameters: Type.Object({ contract_id: Type.String() }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = p.contract_id as string;
        const res = await fetch(
          `${config.baseUrl.replace(/\/$/, "")}/api/v1/contracts/${contractId}/audit/compact/sidecar.jsonl`,
          { headers: { Authorization: `Bearer ${config.apiKey}` } }
        );
        const text = await res.text();
        return toolResult({ ok: res.ok, status: res.status, journal: text });
      },
    });

    // ── Intent Calibration ────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_calibrate_intent",
      label: "MOVA: Calibrate Intent",
      description: "Pre-flight check before starting a MOVA contract. Call this when the user's request is ambiguous or missing required fields. Pass collected answers; get back either the next required question (ASK) or confirmation that all inputs are ready (VALID). RULE: never guess or infer missing values — only pass values explicitly stated by the user.",
      parameters: Type.Object({
        contract_type: Type.String({
          description: "Contract type: invoice | po | trade | complaint | aml",
        }),
        answers: Type.Array(
          Type.Object({
            field: Type.String({ description: "Field name" }),
            value: Type.String({ description: "Value explicitly provided by the user" }),
          }),
          { description: "Answers collected so far from the user. Empty array on first call." }
        ),
      }),
      async execute(_id, p) {
        const contractType = p.contract_type as string;
        const schema = CONTRACT_SCHEMAS[contractType];

        if (!schema) {
          return toolResult({
            status: "UNKNOWN_CONTRACT_TYPE",
            message: `Unknown contract type: "${contractType}". Available: ${Object.keys(CONTRACT_SCHEMAS).join(", ")}`,
          });
        }

        const answersMap = new Map<string, string>(
          (p.answers as Array<{ field: string; value: string }>).map(a => [a.field, a.value.trim()])
        );

        const required = schema.filter(f => f.required);
        const missing  = required.filter(f => !answersMap.get(f.field));

        if (missing.length > 0) {
          const next = missing[0];
          return toolResult({
            status: "ASK",
            field: next.field,
            question: next.question,
            example: next.example,
            progress: `${required.length - missing.length} of ${required.length} required fields collected`,
            instruction: "Ask the user this question exactly. Do not attempt to answer it yourself.",
          });
        }

        // All required fields present — assemble resolved inputs
        const resolved: Record<string, string> = {};
        for (const f of schema) {
          const val = answersMap.get(f.field);
          if (val) resolved[f.field] = val;
        }

        return toolResult({
          status: "VALID",
          contract_type: contractType,
          resolved_inputs: resolved,
          next_tool: START_TOOL[contractType],
          instruction: `All required inputs collected. Call ${START_TOOL[contractType]} with these resolved_inputs.`,
        });
      },
    });

    // ── Connector Registry ────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_list_connectors",
      label: "MOVA: List Connectors",
      description: "List all available MOVA connectors. Optionally filter by keyword.",
      parameters: Type.Object({
        keyword: Type.Optional(Type.String({ description: "Filter keyword, e.g. erp, aml, ocr, market" })),
      }),
      async execute(_id, p) {
        const data = await movaGet(cfg(), "/api/v1/connectors") as {
          connectors: Array<{ connector_id: string; display_name: string; description: string }>;
        };
        let list = data.connectors ?? [];
        if (p.keyword) {
          const kw = (p.keyword as string).toLowerCase();
          list = list.filter(c =>
            c.connector_id.toLowerCase().includes(kw) ||
            c.display_name.toLowerCase().includes(kw) ||
            c.description.toLowerCase().includes(kw)
          );
        }
        return toolResult({ connectors: list, total: list.length });
      },
    });

    api.registerTool({
      name: "mova_list_connector_overrides",
      label: "MOVA: List Connector Overrides",
      description: "List all connector overrides registered for your org.",
      parameters: Type.Object({}),
      async execute() {
        return toolResult(await movaGet(cfg(), "/api/v1/connectors/overrides"));
      },
    });

    api.registerTool({
      name: "mova_register_connector",
      label: "MOVA: Register Connector",
      description: "Register your own HTTPS endpoint for a MOVA connector. After registration all contracts in your org will call your endpoint instead of the sandbox mock.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector ID, e.g. connector.erp.po_lookup_v1" }),
        endpoint: Type.String({ description: "Your HTTPS endpoint URL" }),
        label: Type.Optional(Type.String({ description: "Human-readable label" })),
        auth_header: Type.Optional(Type.String({ description: "Auth header name, e.g. X-Api-Key" })),
        auth_value: Type.Optional(Type.String({ description: "Auth header value" })),
      }),
      async execute(_id, p) {
        return toolResult(await movaPut(cfg(), `/api/v1/connectors/${p.connector_id}/override`, {
          endpoint: p.endpoint,
          label: p.label,
          auth_header: p.auth_header,
          auth_value: p.auth_value,
        }));
      },
    });

    api.registerTool({
      name: "mova_delete_connector_override",
      label: "MOVA: Remove Connector Override",
      description: "Remove a connector override — the connector reverts to the MOVA sandbox mock.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector ID to revert" }),
      }),
      async execute(_id, p) {
        return toolResult(await movaDelete(cfg(), `/api/v1/connectors/${p.connector_id}/override`));
      },
    });
  },
};

export default plugin;
