---
name: mova-contract-generation
description: Generate a legal document draft from a structured template via MOVA, with section-by-section human review gates before finalizing. Trigger when the user asks to generate a contract, NDA, agreement, or legal document from a template. Each section (parties, terms, pricing, conditions) passes through a human legal review gate. The final signed document is stored with a complete audit trail of every edit and approval.
license: MIT-0
---

# MOVA Contract Generation

## What this skill does

Runs a structured legal document generation workflow:

1. **Template selection** — choose document type (NDA, service agreement, supply contract, SLA)
2. **Data ingestion** — parties, dates, terms, pricing, special conditions
3. **Draft generation** — AI-populated document sections from template
4. **Section-by-section human gates** — legal reviewer approves/edits each section
5. **Final sign-off** — complete document approved and stored in repository

Every draft version, edit, reviewer identity, and approval timestamp is recorded in the MOVA audit journal — providing a complete chain of custody from template to signed document.

## When to trigger

Activate when the user:
- Asks to generate a contract, NDA, agreement, or legal document
- Provides party names, terms, and asks for a document draft
- Says "create an NDA", "draft a service agreement", "generate a supply contract"

**Before starting**, confirm: "Запустить генерацию документа через MOVA? (тип: DOC_TYPE)"

If required fields are missing — ask once for: document type, party A name, party B name, governing law jurisdiction, effective date, and key terms.

## Step 1 — Submit document parameters

Run exec:

    mova-bridge call mova_hitl_start_contract_gen \
      --doc-type DOC_TYPE \
      --party-a "PARTY_A_NAME" \
      --party-b "PARTY_B_NAME" \
      --jurisdiction JURISDICTION \
      --effective-date DATE \
      --terms '{"key": "value"}' \
      --template-id TEMPLATE_ID

Replace DOC_TYPE (nda / service_agreement / supply_contract / sla), parties, JURISDICTION (e.g. DE, US-NY, EU), DATE (ISO format), and any specific terms as JSON. Wait for JSON output.

## Step 2 — Review sections and provide decisions

If `status = "waiting_human"` — show the current section for review:

    Document:  DOC_TYPE — CONTRACT_ID
    Section:   SECTION_NAME (N of TOTAL)
    ──────────────────────────────────
    SECTION_CONTENT
    ──────────────────────────────────

Ask legal reviewer to choose:

- **approve_section** — Approve this section as written
- **edit_section** — Accept with edits (provide edited text in reason)
- **reject_section** — Reject and request redraft
- **escalate** — Escalate to senior legal counsel

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON_OR_EDITED_TEXT"

Repeat for each section until all are approved.

## Step 3 — Final sign-off and document storage

When all sections are approved and `status = "completed"`:

    ✅ Document generated — CONTRACT_ID

    Type:          DOC_TYPE
    Parties:       PARTY_A ↔ PARTY_B
    Sections:      SECTION_COUNT approved
    Document ID:   DOCUMENT_ID
    Audit receipt: AUDIT_RECEIPT_ID

    Retrieve final document:
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit_compact --contract-id CONTRACT_ID

## Connect your real document systems

By default MOVA uses a sandbox mock. To use your real infrastructure:

    # See available document connectors
    mova-bridge call mova_list_connectors --keyword document

    # Register your document template repository
    mova-bridge call mova_register_connector \
      --connector-id connector.legal.template_repository_v1 \
      --endpoint https://your-legal.example.com/api/templates \
      --label "Legal Template Repository" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

    # Register your document storage endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.legal.document_storage_v1 \
      --endpoint https://your-storage.example.com/api/documents \
      --label "Document Repository" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

After registration all contracts in your org use your endpoint instead of the mock.
To revert: `mova-bridge call mova_delete_connector_override --connector-id CONNECTOR_ID`

If the user asks "how do I connect my real systems" — walk through these steps.

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER fabricate legal document content or legal advice
- Human approval is required for every section — never auto-finalize a document
- If exec fails — show the exact error, do not retry via HTTP
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
