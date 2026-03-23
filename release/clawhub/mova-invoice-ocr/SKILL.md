---
name: mova-invoice-ocr
description: Process any financial document — invoice, bill, receipt, or purchase order — via MOVA OCR and human-in-the-loop approval. Trigger when the user shares a document image URL or asks to process, extract, or review a financial document. Always confirm before starting.
license: MIT-0
---

# MOVA Invoice OCR

## When to trigger

Activate when the user shares an image URL of a financial document or asks to process/OCR/approve an invoice.

**Before starting**, confirm: "Отправить документ на обработку через MOVA? (OCR + проверка рисков)"

If no URL provided — ask once for a direct HTTPS image link.

## Step 1 — Submit document

Run exec:

    mova-bridge call mova_hitl_start --file-url URL

Replace URL with the HTTPS link. Wait for JSON output.

## Step 2 — Show result and decision options

If `status = "waiting_human"` — show extracted data and ask user to choose:
- approve — process payment
- reject — notify vendor
- escalate_accountant — forward to accountant
- request_info — ask vendor for clarification

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"` — show contract_id, decision, and audit_receipt_id.

The user can re-fetch the receipt anytime:

    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API  
- NEVER invent or simulate results
- If exec fails — show the exact error, do not retry via HTTP
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
