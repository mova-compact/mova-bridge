---
name: mova-credit-scoring
description: Run a MOVA credit scoring workflow — submit applicant data, get an automated risk score, and route the result through a human approval gate before issuing a credit decision. Trigger when the user submits loan application data, asks to score a borrower, or requests a credit risk assessment. Human sign-off is mandatory before any credit offer is issued.
license: MIT-0
---

# MOVA Credit Scoring

## What this skill does

Runs a transparent, auditable credit scoring workflow:

1. **Data ingestion** — applicant parameters (income, debt, history, bureau score)
2. **Scoring model** — automated risk calculation with explainability breakdown
3. **Risk snapshot** — score, recommended limit, risk band, key factors
4. **Human gate** — credit officer reviews model output and issues final decision

All inputs, model version, calculation parameters, and the human signature are recorded in the MOVA audit journal — required for regulatory accountability and dispute resolution.

## When to trigger

Activate when the user:
- Submits borrower or applicant data for evaluation
- Says "score this borrower", "run credit check", "assess loan risk"
- Provides a CSV or API payload with applicant financial parameters

**Before starting**, confirm: "Запустить кредитный скоринг через MOVA для [applicant_id]?"

If required fields are missing — ask once for: applicant ID, monthly income, total debt, credit history months, bureau score, requested loan amount.

## Step 1 — Submit applicant data for scoring

Run exec:

    mova-bridge call mova_hitl_start_credit \
      --applicant-id APPLICANT_ID \
      --monthly-income INCOME \
      --total-debt DEBT \
      --credit-history-months MONTHS \
      --bureau-score SCORE \
      --requested-amount AMOUNT \
      --loan-purpose PURPOSE

Wait for JSON output.

## Step 2 — Show score and decision options

If `status = "waiting_human"` — show the scoring summary:

    Applicant:       APPLICANT_ID
    Score:           SCORE / 1000  (RISK_BAND)
    Recommended:     RECOMMENDED_LIMIT CURRENCY
    Debt-to-income:  DTI_RATIO %
    Key factors:     [list top factors]
    Model version:   MODEL_VERSION

Then ask credit officer to choose:

- **approve** — Approve credit at recommended limit
- **approve_reduced** — Approve at reduced limit (specify amount in reason)
- **reject** — Reject application
- **request_info** — Request additional documents from applicant

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Credit decision [applicant_id] — CONTRACT_ID

    Decision:      OPTION
    Model version: MODEL_VERSION
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit_compact --contract-id CONTRACT_ID

## Connect your real scoring systems

By default MOVA uses a sandbox mock. To use your real infrastructure:

    # See available credit connectors
    mova-bridge call mova_list_connectors --keyword credit

    # Register your scoring model endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.credit.scoring_model_v1 \
      --endpoint https://your-scoring.example.com/api/score \
      --label "Production Scoring Model" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

    # Register your bureau data endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.credit.bureau_v1 \
      --endpoint https://your-bureau.example.com/api/report \
      --label "Credit Bureau" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

After registration all contracts in your org use your endpoint instead of the mock.
To revert: `mova-bridge call mova_delete_connector_override --connector-id CONNECTOR_ID`

If the user asks "how do I connect my real systems" — walk through these steps.

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate scoring results
- Human approval is mandatory — never auto-issue a credit decision
- If exec fails — show the exact error, do not retry via HTTP
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
