---
name: mova-aml-triage
description: Submit an AML transaction monitoring alert for automated L1 triage and human-in-the-loop compliance decision via MOVA. Trigger when the user mentions an AML alert, transaction monitoring alert ID, or asks to triage/review a suspicious transaction alert. Mandatory human escalation on sanctions hit, PEP flag, or risk score above 85.
license: MIT-0
metadata: {"openclaw":{"primaryEnv":"MOVA_API_KEY","plugin":{"name":"MOVA","installCmd":"openclaw plugins install openclaw-mova","configKey":"plugins.entries.mova.config.apiKey"},"dataSentToExternalServices":[{"service":"MOVA API (api.mova-lab.eu)","data":"alert ID, rule ID, risk score, customer data, transaction list, PEP/sanctions flags, human decision, audit metadata"},{"service":"Sanctions screening connector (read-only)","data":"customer ID and transaction data screened against OFAC, EU, UN lists"},{"service":"Customer risk connector (read-only)","data":"customer ID for risk rating and prior alert history lookup"}]}}
---

# MOVA AML Alert Triage

Submit a transaction monitoring alert to MOVA for automated L1 triage — with typology matching, sanctions screening, and a human compliance decision gate backed by a tamper-proof audit trail.

## What it does

1. **AI triage** — checks sanctions lists (OFAC/EU/UN), PEP status, transaction burst patterns, customer risk rating, prior alert history, and typology matching (structuring, layering, smurfing, etc.)
2. **Risk snapshot** — surfaces anomaly flags and triage recommendation
3. **Human decision gate** — compliance analyst chooses: clear / escalate to L2 / immediate escalate
4. **Audit receipt** — every decision is signed, timestamped, and stored in an immutable compact journal

**Mandatory escalation rules enforced by policy:**
- Risk score > 85 → mandatory human escalation
- Sanctions hit → immediate escalation, no exceptions
- PEP flag → mandatory L2 escalation

## Requirements

**Plugin:** MOVA OpenClaw plugin must be installed and configured with your API key.
Get your key at [mova-lab.eu/register](https://mova-lab.eu/register).

**Data flows:**
- Alert data + customer ID + transactions → `api.mova-lab.eu` (MOVA platform, EU-hosted)
- Customer data → sanctions screening (OFAC, EU, UN — read-only, no data stored)
- Customer ID → risk rating and prior alert history (read-only)
- Audit journal → MOVA R2 storage, cryptographically signed, accessible only via your API key
- No data is sent to third parties beyond the above

## Quick start

Say "triage AML alert ALERT-1002" and provide the alert details:

```
https://raw.githubusercontent.com/mova-compact/mova-bridge/main/test_aml_ALERT-1002.png
```

## Demo

**Step 1 — Alert submitted: TM-STRUCT-11, risk 91, RISK HIGH flag**
![Step 1](screenshots/01-input.jpg)

**Step 2 — AI analysis: structuring typology matched, risk 91/100, escalate_l2 decision**
![Step 2](screenshots/02-analysis.jpg)

**Step 3 — Audit receipt + compact journal with full compliance event chain**
![Step 3](screenshots/03-audit.jpg)

## Why contract execution matters

- **Escalation rules are policy, not prompts** — risk_score > 85 and sanctions hits trigger mandatory gates that cannot be bypassed
- **Full typology matching** — AI identifies structuring, layering, and smurfing patterns against your transaction monitoring rules
- **Immutable audit trail** — when a regulator asks "who cleared or escalated ALERT-1002 and why?" — the answer is in the system with an exact timestamp and reason
- **AMLD6 / FATF ready** — AML decisions require the human oversight, full explainability, and documented decision chain required by AMLD6 and FATF guidance

## What the user receives

| Output | Description |
|--------|-------------|
| Risk score | 0–100 assessment with threshold evaluation |
| Typology match | Rule ID + description (structuring, layering, etc.) |
| Sanctions check | OFAC / EU / UN screening result |
| PEP status | PEP flag with category |
| Customer risk | Risk rating, burst intensity, jurisdiction risk |
| Anomaly flags | rapid_transfer, new_beneficiary, high_burst, sanctions_hit, pep_flag |
| Findings | Structured list with severity codes |
| Prior alerts | Historical alert count |
| Recommended action | AI-suggested triage decision |
| Decision options | clear / escalate_l2 / immediate_escalate |
| Audit receipt ID | Permanent signed record of the compliance decision |
| Compact journal | Full event log: triage → sanctions → human decision |

## When to trigger

Activate when the user:
- Mentions an alert ID (e.g. "ALERT-1002")
- Says "triage this alert", "review AML alert", "check transaction monitoring alert"
- Provides customer and transaction data for compliance review

**Before starting**, confirm: "Submit alert [alert_id] for MOVA L1 triage?"

If details are missing — ask once for: alert ID, rule ID, risk score, customer ID, customer jurisdiction, triggered transactions.

## Step 1 — Submit alert

Call tool `mova_hitl_start_aml` with:
- `alert_id`, `rule_id`, `rule_description`, `risk_score`
- `customer_id`, `customer_name`, `customer_risk_rating` (low/medium/high), `customer_type` (individual/business), `customer_jurisdiction` (ISO country code)
- `triggered_transactions`: array of `{transaction_id, amount_eur}`
- `pep_status`: boolean, `sanctions_match`: boolean
- `historical_alerts`: optional array of prior alert IDs

## Step 2 — Show analysis and decision options

If `status = "waiting_human"` — show AI triage summary and ask to choose:

- **clear** — Clear as false positive
- **escalate_l2** — Escalate to L2 analyst
- **immediate_escalate** — Immediate escalation — freeze account

Show `recommended` option if present (mark ← RECOMMENDED).

Call tool `mova_hitl_decide` with:
- `contract_id`: from the response above (NOT the alert ID)
- `option`: chosen decision
- `reason`: analyst reasoning

## Step 3 — Show audit receipt

Call tool `mova_hitl_audit` with `contract_id`.
Call tool `mova_hitl_audit_compact` with `contract_id` for the full signed event chain.

## Connect your real AML systems

By default MOVA uses a sandbox mock. To route checks against your live infrastructure, call `mova_list_connectors` with `keyword: "aml"`.

Relevant connectors:

| Connector ID | What it covers |
|---|---|
| `connector.screening.pep_sanctions_v1` | PEP & sanctions screening (OFAC, EU, UN) |
| `connector.aml.transaction_history_v1` | Transaction history from core banking |
| `connector.policy.aml_rules_v1` | AML rule engine / typology rules |
| `connector.risk.jurisdiction_v1` | Country FATF risk classification |

Call `mova_register_connector` with `connector_id`, `endpoint`, optional `auth_header` and `auth_value`.

## Rules

- NEVER make HTTP requests manually
- NEVER invent or simulate results — if a tool call fails, show the exact error
- Use MOVA plugin tools directly — do NOT use exec or shell
- CONTRACT_ID comes from the mova_hitl_start_aml response, not from the alert ID
