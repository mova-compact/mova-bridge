---
name: mova-compliance-audit
description: Run a MOVA compliance audit on uploaded documents against regulatory frameworks (GDPR, PCI-DSS, ISO 27001, SOC 2). Trigger when the user uploads a document for compliance review, mentions a regulatory check, or asks to validate documents against a compliance standard. Each audit step is human-gated and produces a signed audit receipt.
license: MIT-0
---

# MOVA Compliance Audit

## What this skill does

Runs a multi-stage compliance audit with full human-in-the-loop control:

1. **Document ingestion** — OCR extraction and structure parsing
2. **Rules engine check** — automated comparison against the selected regulatory framework (GDPR, PCI-DSS, ISO 27001, SOC 2)
3. **Findings report** — checklist with pass/fail items and recommended actions
4. **Human gate** — compliance officer reviews findings and signs off or requests corrections

Every stage — upload, parse, check, report, sign-off — is recorded in the MOVA audit journal.

## When to trigger

Activate when the user:
- Uploads a document and mentions compliance, regulation, or audit
- Says "check GDPR compliance", "run PCI-DSS audit", "validate ISO 27001"
- Asks to prepare for a regulatory inspection

**Before starting**, confirm: "Запустить compliance-аудит через MOVA? (фреймворк: FRAMEWORK)"

If framework is not specified — ask once: GDPR, PCI-DSS, ISO 27001, or SOC 2.
If document URL is missing — ask once for a direct HTTPS link.

## Step 1 — Submit document for audit

Run exec:

    mova-bridge call mova_hitl_start_compliance \
      --document-url URL \
      --framework FRAMEWORK \
      --document-id DOC_ID \
      --org-name "ORG_NAME"

Replace URL, FRAMEWORK (gdpr / pci_dss / iso_27001 / soc2), DOC_ID, ORG_NAME. Wait for JSON output.

## Step 2 — Show findings and decision options

If `status = "waiting_human"` — show the audit findings summary:

    Document:   DOC_ID
    Framework:  FRAMEWORK
    Score:      PASS_COUNT / TOTAL_CHECKS passed
    Critical:   CRITICAL_COUNT critical findings
    Findings:   [list top findings with severity]

Then ask compliance officer to choose:

- **approve** — Sign off audit report as compliant
- **approve_with_conditions** — Approve with listed remediation items
- **reject** — Document fails compliance — block processing
- **request_corrections** — Return document for corrections

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Audit [DOC_ID] — CONTRACT_ID

    Framework:     FRAMEWORK
    Decision:      OPTION
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit_compact --contract-id CONTRACT_ID

## Connect your real compliance systems

By default MOVA uses a sandbox mock. To use your real infrastructure:

    # See available compliance connectors
    mova-bridge call mova_list_connectors --keyword compliance

    # Register your document extraction endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.ocr.document_extract_v1 \
      --endpoint https://your-ocr.example.com/api/extract \
      --label "Production OCR" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

    # Register your rules engine endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.compliance.rules_engine_v1 \
      --endpoint https://your-compliance.example.com/api/check \
      --label "Compliance Rules Engine" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

After registration all contracts in your org use your endpoint instead of the mock.
To revert: `mova-bridge call mova_delete_connector_override --connector-id CONNECTOR_ID`

If the user asks "how do I connect my real systems" — walk through these steps.

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate compliance results
- If exec fails — show the exact error, do not retry via HTTP
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
