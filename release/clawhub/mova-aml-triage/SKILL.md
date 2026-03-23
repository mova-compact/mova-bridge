---
name: mova-aml-triage
description: Submit an AML transaction monitoring alert for automated L1 triage and human-in-the-loop compliance decision via MOVA. Trigger when the user mentions an AML alert, transaction monitoring alert ID, or asks to triage/review a suspicious transaction alert. Mandatory human escalation on sanctions hit, PEP flag, or risk score above 85.
license: MIT-0
---

# MOVA AML Alert Triage

## What this skill does

Submits an AML alert to MOVA for automated L1 triage:

1. **AI analysis** — checks sanctions lists (OFAC/EU/UN), PEP status, transaction burst patterns, customer risk rating, historical alert history, typology matching
2. **Risk snapshot** — surfaces anomaly flags and triage recommendation
3. **Human decision gate** — compliance analyst chooses: clear / escalate to L2 / immediate escalate (account freeze)

Immediate escalation on: sanctions hit, PEP flag, or risk_score > 85.
False positive auto-clear only for risk_score ≤ 30 with no sanctions, no PEP, no prior alerts.

## When to trigger

Activate when the user:
- Mentions an alert ID (e.g. "ALERT-1002")
- Says "triage this alert", "review AML alert", "check transaction monitoring alert"
- Provides customer and transaction data for compliance review

**Before starting**, confirm: "Запустить L1 триаж алерта [alert_id] через MOVA?"

If details are missing — ask once for: alert ID, rule ID, risk score, customer ID, customer jurisdiction, triggered transactions.

## Step 1 — Submit alert for triage

Run exec with required fields:

    mova-bridge call mova_hitl_start_aml \
      --alert-id ALERT-1002 \
      --rule-id TM-STRUCT-11 \
      --rule-description "Multiple rapid transfers to new beneficiary" \
      --risk-score 91 \
      --customer-id CUST-78 \
      --customer-name "Atlas Trading GmbH" \
      --customer-risk-rating high \
      --customer-type business \
      --customer-jurisdiction DE \
      --triggered-transactions '[{"transaction_id":"TX-11","amount_eur":900},{"transaction_id":"TX-12","amount_eur":1100}]' \
      --pep-status false \
      --sanctions-match false \
      --historical-alerts '["A1","A2","A3"]'

## Step 2 — Show triage analysis and decision options

If `status = "waiting_human"` — show the AI triage summary from `analysis`:

    Alert:        ALERT_ID — RULE_DESCRIPTION
    Risk score:   RISK_SCORE_ASSESSMENT / 100  (TRIAGE_DECISION)
    Sanctions:    clean / HIT (list name)
    PEP:          no / YES (category)
    Typology:     matched / no match — DESCRIPTION
    Prior alerts: COUNT
    Findings:     [list findings]

Then ask analyst to choose:

- **clear** — Clear as false positive
- **escalate_l2** — Escalate to L2 analyst
- **immediate_escalate** — Immediate escalation — freeze account

Show `recommended` option if present (mark ← RECOMMENDED).

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Alert [alert_id] — CONTRACT_ID

    Decision:      OPTION
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit_compact --contract-id CONTRACT_ID

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate results — if exec fails, show the exact error
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
