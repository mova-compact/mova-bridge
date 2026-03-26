---
name: mova-credit-scoring
description: Submit a loan application for AI credit risk scoring and human-gated credit decision via MOVA HITL. Trigger when the user mentions a loan application, credit assessment, borrower review, or asks to score credit risk. Human credit officer approval is mandatory before any credit decision is issued.
license: MIT-0
metadata: {"openclaw":{"plugin":{"name":"MOVA","installCmd":"openclaw plugins install openclaw-mova"},"dataSentToExternalServices":[{"service":"MOVA API (api.mova-lab.eu)","data":"applicant ID, financial data (income, debt, requested amount), bureau score, AI risk band, human decision, audit metadata"},{"service":"Credit scoring model connector (read-only)","data":"applicant financial features evaluated against scoring model"},{"service":"Credit bureau connector (read-only)","data":"applicant ID used for bureau score and credit history lookup"}]}}
---

# MOVA Credit Scoring

Submit a loan application to MOVA for automated credit risk scoring — with explainable risk band, bureau check, and a mandatory human credit officer decision gate backed by a full audit trail.

## What it does

1. **Risk scoring** — AI evaluates income, debt-to-income ratio, bureau score, and repayment history against the scoring model
2. **Risk band** — applicant assigned a risk band (excellent / good / fair / poor / very_poor) with score 0–1000
3. **Credit limit recommendation** — AI suggests approved amount based on risk band and requested amount
4. **Human gate** — credit officer reviews the scoring breakdown and chooses: approve / approve at reduced limit / reject / request more info
5. **Audit receipt** — model version, all input features, the human identity, and the decision timestamp are logged for regulatory accountability

**Mandatory escalation rules enforced by policy:**
- Risk band poor or very_poor → mandatory human review, cannot auto-approve
- Requested amount above threshold → always routes to human gate
- Bureau score missing or frozen → request_info required, no auto-decision

## Requirements

**Plugin:** MOVA OpenClaw plugin must be installed in your OpenClaw workspace.

**Data flows:**
- Applicant ID + financial data → `api.mova-lab.eu` (MOVA platform, EU-hosted)
- Financial features → credit scoring model (server-side, read-only)
- Applicant ID → credit bureau (read-only, no data stored)
- Audit journal → MOVA R2 storage, signed
- No data sent to third parties beyond the above

## Demo

**Step 1 — Application submitted: APP-2026-0041, €25K, bureau score 612**
![Step 1](screenshots/01-input.jpg)

**Step 2 — AI scoring: risk band fair, DTI 0.017, approve_reduced recommended at €5K**
![Step 2](screenshots/02-analysis.jpg)

**Step 3 — Decision recorded: approve_reduced + audit receipt**
![Step 3](screenshots/03-audit.jpg)

## Quick start

Say "score credit application APP-2026-0041 for applicant CUST-1501" and provide:

```
applicant_id: CUST-1501
application_id: APP-2026-0041
requested_amount_eur: 25000
annual_income_eur: 48000
monthly_debt_eur: 800
bureau_score: 610
employment_status: employed
```

The agent submits the application, shows the AI risk band and score breakdown, then asks for the credit officer's decision.

## Why contract execution matters

- **Scoring rules are policy, not prompts** — poor risk bands and high amounts trigger mandatory gates that cannot be bypassed
- **Full explainability** — every contributing factor (income, debt ratio, bureau score) is surfaced with its weight
- **Immutable audit trail** — when a regulator or applicant challenges a rejection, the complete scoring chain with timestamps is in the system
- **EU AI Act / CRD VI / EBA GL ready** — credit decisions are high-risk AI outputs requiring human oversight, explainability, and a documented decision chain

## What the user receives

| Output | Description |
|--------|-------------|
| Credit score | 0–1000 numerical score |
| Risk band | excellent / good / fair / poor / very_poor |
| Debt-to-income ratio | Calculated from input data |
| Bureau result | Bureau score + credit history summary |
| Anomaly flags | high_dti, low_bureau_score, short_history, missing_bureau |
| Findings | Structured list with severity codes |
| Recommended credit limit | AI-suggested approved amount |
| Recommended action | AI-suggested decision |
| Decision options | approve / approve_reduced / reject / request_info |
| Audit receipt ID | Permanent signed record of the credit decision |
| Compact journal | Full event log: scoring → bureau check → human decision |

## When to trigger

Activate when the user:
- Mentions an application ID or loan request (e.g. "APP-2026-0041")
- Says "score credit", "credit assessment", "loan decision", "assess borrower", "credit risk review"
- Provides applicant financial data for a lending decision

**Before starting**, confirm: "Submit application [APP-ID] for MOVA credit scoring?"

If applicant ID or requested amount is missing — ask once.

## Step 1 — Submit loan application

Call tool `mova_hitl_start_credit` with:
- `application_id`: application reference (e.g. APP-2026-0041)
- `applicant_id`: customer/borrower ID
- `requested_amount_eur`: loan amount requested
- `annual_income_eur`: applicant annual income
- `monthly_debt_eur`: existing monthly debt obligations
- `bureau_score`: credit bureau score (optional)
- `employment_status`: employed / self_employed / unemployed / retired
- `loan_purpose`: optional (mortgage, personal, auto, business)

## Step 2 — Show scoring result and decision options

If `status = "waiting_human"` — show risk scoring summary and ask to choose:

```
Application:       APP-ID
Applicant:         CUST-ID
Score:             SCORE / 1000  (RISK_BAND)
DTI ratio:         DTI%
Bureau score:      BUREAU_SCORE
Recommended limit: EUR AMOUNT
Findings:          [list with severity]
Recommended action: ACTION ← RECOMMENDED
```

| Option | Description |
|---|---|
| `approve` | Approve at requested amount |
| `approve_reduced` | Approve at reduced credit limit |
| `reject` | Reject application |
| `request_info` | Request additional financial information |

Call tool `mova_hitl_decide` with:
- `contract_id`: from the response above — this is `ctr-crd-xxxxxxxx`, NOT the application ID
- `option`: chosen decision
- `reason`: credit officer reasoning

## Step 3 — Show audit receipt

Call tool `mova_hitl_audit` with `contract_id`.
Call tool `mova_hitl_audit_compact` with `contract_id` for the full signed scoring chain.

## Connect your real credit systems

By default MOVA uses a sandbox mock. To route scoring against your live infrastructure, call `mova_list_connectors` with `keyword: "credit"`.

Relevant connectors:

| Connector ID | What it covers |
|---|---|
| `connector.credit.scoring_model_v1` | Internal credit scoring model |
| `connector.credit.bureau_v1` | External credit bureau score and history |

Call `mova_register_connector` with `connector_id`, `endpoint`, optional `auth_header` and `auth_value`.

## Rules

- NEVER make HTTP requests manually
- NEVER invent or simulate credit scores — if a tool call fails, show the exact error
- Use MOVA plugin tools directly — do NOT use exec or shell
- CONTRACT_ID is `ctr-crd-xxxxxxxx` from the mova_hitl_start_credit response — NOT the application ID
