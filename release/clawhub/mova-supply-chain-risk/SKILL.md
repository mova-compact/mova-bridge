---
name: mova-supply-chain-risk
description: Run a MOVA supply chain risk analysis — screen suppliers against sanctions lists, PEP registries, ESG ratings, and financial stability data, then route findings through a human approval gate. Trigger when the user provides a supplier list, asks to screen vendors, or requests a supply chain due diligence report. Mandatory human sign-off before any procurement decision.
license: MIT-0
---

# MOVA Supply Chain Risk Analysis

## What this skill does

Runs a full supplier due diligence workflow:

1. **Supplier ingestion** — accepts a list of supplier names, IDs, or a CSV
2. **Multi-source screening** — sanctions (OFAC/EU/UN), PEP registries, ESG ratings, financial stability, adverse media
3. **Risk report** — per-supplier risk band (low / medium / high / critical) with source citations
4. **Human gate** — procurement manager reviews findings and approves/blocks suppliers

All data sources, query timestamps, screening results, and the human decision are recorded in the MOVA audit journal — demonstrating supply chain transparency to auditors and partners.

## When to trigger

Activate when the user:
- Provides a supplier list (CSV, names, IDs)
- Says "screen these vendors", "run supply chain check", "due diligence on supplier"
- Asks to prepare a procurement risk report

**Before starting**, confirm: "Запустить анализ рисков цепочки поставок через MOVA? (поставщиков: COUNT)"

If supplier data is missing — ask once for: supplier names/IDs, country of registration, and procurement category.

## Step 1 — Submit supplier list for screening

Run exec:

    mova-bridge call mova_hitl_start_supply_chain \
      --suppliers '[{"id":"SUP-001","name":"Acme GmbH","country":"DE"},{"id":"SUP-002","name":"Delta LLC","country":"US"}]' \
      --category CATEGORY \
      --requestor-id REQUESTOR_ID

Replace with actual supplier data and category (raw_materials / logistics / technology / services). Wait for JSON output.

## Step 2 — Show risk report and decision options

If `status = "waiting_human"` — show the screening summary:

    Suppliers screened: COUNT
    Critical findings:  CRITICAL_COUNT
    High risk:          HIGH_COUNT
    Clean:              CLEAN_COUNT

    [Per-supplier table: ID | Name | Risk | Findings]

Then ask procurement manager to choose:

- **approve_all** — Approve all screened suppliers
- **approve_clean** — Approve only clean suppliers, block high-risk
- **reject_all** — Block entire batch pending further review
- **escalate** — Escalate to compliance team

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Supply chain audit — CONTRACT_ID

    Decision:      OPTION
    Suppliers:     COUNT screened
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit_compact --contract-id CONTRACT_ID

## Connect your real screening systems

By default MOVA uses a sandbox mock. To use your real infrastructure:

    # See available supply chain connectors
    mova-bridge call mova_list_connectors --keyword supply

    # Register your sanctions screening endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.screening.pep_sanctions_v1 \
      --endpoint https://your-screening.example.com/api/check \
      --label "Sanctions & PEP Screening" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

    # Register your ESG ratings endpoint
    mova-bridge call mova_register_connector \
      --connector-id connector.esg.ratings_v1 \
      --endpoint https://your-esg.example.com/api/ratings \
      --label "ESG Ratings Provider" \
      --auth-header X-Api-Key \
      --auth-value YOUR_KEY

After registration all contracts in your org use your endpoint instead of the mock.
To revert: `mova-bridge call mova_delete_connector_override --connector-id CONNECTOR_ID`

If the user asks "how do I connect my real systems" — walk through these steps.

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate screening results
- Human approval is mandatory before approving any supplier
- If exec fails — show the exact error, do not retry via HTTP
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
