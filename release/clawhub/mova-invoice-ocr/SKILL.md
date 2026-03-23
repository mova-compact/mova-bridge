---
name: mova-invoice-ocr
description: >
  Submit any financial document — invoice, bill, receipt, or purchase order —
  to the MOVA contract platform for automated OCR extraction, risk scoring,
  and human-in-the-loop approval. Trigger when the user shares a document
  image URL or asks to process, extract, or review a financial document.
  Always confirm with the user before starting. After completion, return a
  structured summary and a signed audit receipt.
license: MIT-0

metadata:
  openclaw:
    primaryEnv: MOVA_API_KEY
    requires:
      env:
        - name: MOVA_API_KEY
          description: >
            Your MOVA API key. Register for free at https://mova-lab.eu
            to get your key and $1.00 free credit.
      bins:
        - name: mova-bridge
          install: pip install mova-bridge
          source: https://github.com/mova-compact/MOVA_Claw/tree/main/mova-bridge
---

# MOVA Invoice OCR — Agent Instructions

## What this skill does

Submits a financial document to the MOVA platform and guides the user through a three-step contract:

1. **OCR extraction** — vision model reads the document and returns structured data: vendor, amounts, dates, line items, VAT, IBAN
2. **Risk scoring** — automated check assigns a risk score (0.0–1.0) and flags anomalies
3. **Human approval gate** — user chooses: approve / reject / escalate / request more info
4. **Audit receipt** — immutable signed record of the full decision: who decided, which option, reason, timestamp

## When to trigger

Activate when the user:
- Shares an image URL of a financial document (invoice, bill, receipt, PO)
- Asks to "process", "extract", "check", "OCR", or "review" a document
- Mentions "pay this", "approve this invoice", "accounts payable"

**Before starting**, confirm: _"I'll submit this document to MOVA for OCR processing and risk review. Continue?"_

If the user has only sent a file (not a URL), ask once: _"Please share a direct HTTPS link to the image (e.g. via imgbb or Dropbox). Telegram photos cannot be accessed directly."_

---

## Step 1 — Submit the document

```
mova-bridge call mova_hitl_start --file-url URL
```

Replace `URL` with the HTTPS image link. The command returns JSON.

**On success** (`status: "waiting_human"`), show the user what was extracted:

```
✅ Document processed

Vendor:       [vendor_name]
Amount:       [total_amount] [currency]
Invoice date: [invoice_date]
Due date:     [due_date]
Risk score:   [risk_score] / 1.0  [findings if any]

Contract ID:  [contract_id]
```

Then present the decision options:

```
Please choose an action:
  1. approve — process payment
  2. reject — notify vendor
  3. escalate_accountant — forward to accountant
  4. request_info — ask vendor for clarification
```

---

## Step 2 — Record the decision

After the user chooses, run:

```
mova-bridge call mova_hitl_decide \
  --contract-id CONTRACT_ID \
  --option OPTION \
  --reason "REASON"
```

Use the user's exact words as the reason. If they gave none, use a short default like "Approved by user".

---

## Step 3 — Show the audit receipt

On `status: "completed"`, show:

```
✅ Done — Contract CONTRACT_ID

Decision:      OPTION
Reason:        "REASON"
Decided at:    TIMESTAMP
Steps:         3/3 completed
Audit receipt: AUDIT_RECEIPT_ID  (immutable, stored on MOVA platform)
```

The audit receipt is a permanent record. The user can re-fetch it at any time by asking "show audit for CONTRACT_ID".

---

## Other commands

```bash
# Re-fetch audit receipt
mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID

# Check status of an in-progress contract
mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
```

---

## What the user receives

| Output | Description |
|--------|-------------|
| Extracted fields | Vendor name, IBAN, tax ID, total, subtotal, VAT, line items, dates |
| Risk score | 0.0 (clean) – 1.0 (high risk), with flagged findings |
| Decision options | Approve / Reject / Escalate / Request info |
| Audit receipt ID | Permanent signed record of the decision |
| Event log | 5 signed envelopes: contract start, OCR, risk check, decision, completion |

> **Privacy note:** The document image must be accessible via a public HTTPS URL so the MOVA platform can process it.
> Use a trusted host (your own storage, Dropbox, imgbb). Do not share highly confidential documents via public URLs.
>
> **Audit retention:** Audit receipts are stored immutably on the MOVA platform. Review the MOVA privacy policy at https://mova-lab.eu before processing sensitive documents.
