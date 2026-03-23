---
name: mova-complaints-handler
description: Submit a customer complaint for automated EU-compliant classification and human-in-the-loop handling decision via MOVA. Trigger when the user submits a complaint, mentions a complaint ID, or asks to process/review a customer complaint. Mandatory human review for compensation claims, regulator threats, repeat customers, or high-risk products.
license: MIT-0
---

# MOVA EU Consumer Complaints Handler

## What this skill does

Submits a customer complaint to MOVA for EU-compliant three-step handling:

1. **Classification** — AI analyses complaint text for sentiment, product risk, compensation claims, regulator threats, fraud signals, and repeat customer history
2. **Risk snapshot** — scores complaint complexity and surfaces mandatory review triggers
3. **Human decision gate** — complaints officer chooses: resolve / escalate / reject / flag for regulator

Mandatory human review: compensation claim, regulator threat, repeat customer, high-risk product, fraud signal.
Blocked: complaint text empty or invalid.

## When to trigger

Activate when the user:
- Submits or forwards a customer complaint
- Mentions a complaint ID (e.g. "CMP-2026-1002")
- Says "process this complaint", "handle complaint", "review customer complaint"

**Before starting**, confirm: "Запустить обработку жалобы [complaint_id] через MOVA?"

If details are missing — ask once for: complaint ID, customer ID, complaint text, channel, product category, date.

## Step 1 — Submit complaint

Run exec:

    mova-bridge call mova_hitl_start_complaint \
      --complaint-id CMP-2026-1001 \
      --customer-id CUST-991 \
      --complaint-text "I was charged twice for the same monthly service fee." \
      --channel web \
      --product-category payments \
      --complaint-date 2026-03-19 \
      --previous-complaints "[]" \
      --attachments '["statement_screenshot.pdf"]' \
      --customer-segment retail \
      --preferred-language en

## Step 2 — Show classification and decision options

If `status = "waiting_human"` — show the AI classification from `analysis`:

    Complaint:      COMPLAINT_ID — PRODUCT_CATEGORY
    Risk score:     SCORE / 1.0
    Sentiment:      [flags: compensation_claim, regulator_threat, etc.]
    Repeat customer: yes / no (prior complaints count)
    Findings:       [list findings]
    Draft hint:     RESPONSE_DIRECTION

Then ask to choose:

- **resolve** — Resolve — send standard response
- **escalate** — Escalate to complaints officer
- **reject** — Reject — incomplete or invalid
- **regulator_flag** — Flag for regulator reporting

Show `recommended` option if present (mark ← RECOMMENDED).

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Complaint [complaint_id] — CONTRACT_ID

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
