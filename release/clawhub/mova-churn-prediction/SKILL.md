---
name: mova-churn-prediction
description: Run a MOVA churn prediction workflow — analyze customer behavior signals, generate a high-risk churn list, and route retention campaign decisions through a human approval gate. Trigger when the user asks to predict customer churn, requests a retention analysis, or provides customer activity data for risk scoring. Human sign-off is required before any targeted retention action is launched.
license: MIT-0
---

# MOVA Churn Prediction

## What this skill does

Runs a transparent churn risk assessment workflow:

1. **Behavior ingestion** — customer activity signals (logins, transactions, support tickets, feature usage)
2. **Churn model** — probability score per customer with contributing factor breakdown
3. **High-risk list** — ranked list of at-risk customers with recommended retention actions
4. **Human gate** — customer success manager reviews the list and approves the retention campaign

All input features, model version, prediction scores, and the human approval are recorded in the MOVA audit journal — providing investors and regulators with proof that retention actions are based on verified, consistent processes.

## When to trigger

Activate when the user:
- Asks to predict churn, run retention analysis, or identify at-risk customers
- Provides customer event data (CSV, segment ID, date range)
- Sets up a scheduled churn review (weekly / monthly)

**Before starting**, confirm: "Запустить анализ оттока клиентов через MOVA? (сегмент: SEGMENT, период: PERIOD)"

If required data is missing — ask once for: segment ID or customer cohort, analysis period (e.g. last 30 days), and minimum churn probability threshold.

## Step 1 — Submit customer data for churn analysis

Run exec:

    mova-bridge call mova_hitl_start_churn \
      --segment-id SEGMENT_ID \
      --period-days DAYS \
      --threshold THRESHOLD \
      --requestor-id REQUESTOR_ID

Replace SEGMENT_ID, DAYS (e.g. 30), THRESHOLD (e.g. 0.7 for 70% probability). Wait for JSON output.

## Step 2 — Show at-risk list and decision options

If `status = "waiting_human"` — show the churn summary:

    Segment:         SEGMENT_ID
    Period:          DAYS days
    Customers at risk: COUNT  (above THRESHOLD threshold)
    Avg churn score:   AVG_SCORE

    Top at-risk customers:
    [ID | Name | Score | Top factor]

Then ask customer success manager to choose:

- **launch_campaign** — Launch retention campaign for all high-risk customers
- **launch_selective** — Launch campaign for top-N only (specify N in reason)
- **defer** — Defer to next review cycle
- **escalate** — Escalate to VP of Customer Success

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Churn analysis [segment_id] — CONTRACT_ID

    Decision:      OPTION
    Customers:     COUNT analyzed
    Model version: MODEL_VERSION
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit_compact --contract-id CONTRACT_ID

## Connect your real data systems

By default MOVA uses a sandbox mock. To use your real infrastructure:

    # See available churn connectors
    mova-bridge call mova_list_connectors --keyword churn

    # Register your customer event stream endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.analytics.customer_events_v1 \
      --endpoint https://your-analytics.example.com/api/events \
      --label "Customer Event Stream" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

    # Register your churn model endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.ml.churn_model_v1 \
      --endpoint https://your-ml.example.com/api/predict \
      --label "Churn Prediction Model" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

After registration all contracts in your org use your endpoint instead of the mock.
To revert: `mova-bridge call mova_delete_connector_override --connector-id CONNECTOR_ID`

If the user asks "how do I connect my real systems" — walk through these steps.

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate churn scores
- Human approval is mandatory before any retention campaign is launched
- If exec fails — show the exact error, do not retry via HTTP
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
