---
name: mova-po-approval
description: Submit a purchase order for automated risk analysis and procurement approval via MOVA HITL. Trigger when the user mentions a PO number, asks to approve/review a purchase order, or says anything like "check this PO", "approve purchase order", "PO review", "procurement approval".
license: MIT-0
---

# MOVA Purchase Order Approval

## What this skill does

Submits a PO to MOVA for a three-step procurement review:

1. **Risk analysis** — AI checks vendor registry, budget utilisation, authority level, and flags split-PO patterns
2. **Risk snapshot** — scores the PO (0.0–1.0) and surfaces anomaly flags
3. **Human decision gate** — procurement manager chooses: approve / hold / reject / escalate

After the decision, an immutable audit receipt is issued with the full decision log.

## When to trigger

Activate when the user:
- Mentions a PO number (e.g. "PO-2026-001")
- Asks to approve, review, or check a purchase order
- Says "procurement approval", "PO review", "check this PO"

**Before starting**, confirm: "Отправить PO [PO-ID] на проверку через MOVA?"

If no PO number provided — ask once: "Укажите номер заказа (PO ID) из вашей ERP-системы."

## Step 1 — Submit PO

Run exec:

    mova-bridge call mova_hitl_start_po --po-id PO-2026-001

If the user also provided an approver employee ID:

    mova-bridge call mova_hitl_start_po --po-id PO-2026-001 --approver-employee-id EMP-1042

## Step 2 — Show analysis and decision options

If `status = "waiting_human"` — show the risk summary and ask user to choose:

- **approve** — Approve PO
- **hold** — Hold for review
- **reject** — Reject PO
- **escalate** — Escalate to director/board

Show the `recommended` option if present (mark it as ← RECOMMENDED).

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"` — show:

    ✅ PO [po_id] — CONTRACT_ID

    Decision:      OPTION
    Risk score:    SCORE / 1.0
    Anomaly flags: FLAGS (if any)
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID

## What the user receives

| Output | Description |
|--------|-------------|
| Vendor status | registered / pending / blacklisted |
| Budget check | within budget, utilisation %, remaining |
| Anomaly flags | split_po_pattern, unregistered_vendor, budget_exceedance |
| Risk score | 0.0 (clean) – 1.0 (high risk) |
| Decision options | approve / hold / reject / escalate |
| Audit receipt ID | Permanent signed record of the procurement decision |

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate results — if exec fails, show the exact error
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
