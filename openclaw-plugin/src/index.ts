import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import { movaPost, movaGet, movaPut, movaDelete, json, type MovaConfig } from "./client.js";

export default definePluginEntry({
  id: "mova",
  name: "MOVA",
  description: "HITL contract execution — invoice OCR, PO approval, AML triage, complaints, crypto trade review, connector registry.",

  register(api) {
    function cfg(): MovaConfig {
      const c = api.pluginConfig as { apiKey?: string; baseUrl?: string };
      if (!c?.apiKey) throw new Error("MOVA API key not configured. Add it in OpenClaw plugin settings.");
      return {
        apiKey: c.apiKey,
        baseUrl: c.baseUrl ?? "https://api.mova-lab.eu",
      };
    }

    // ── Invoice OCR ──────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start",
      description: "Submit a financial document (invoice, receipt, bill) for OCR extraction and human-in-the-loop approval. Pass the HTTPS URL of the document image.",
      parameters: Type.Object({
        file_url: Type.String({ description: "Direct HTTPS URL to the document image (PDF, JPEG, PNG)" }),
      }),
      async execute(_id, p) {
        return json(await movaPost(cfg(), "/api/v1/contracts/hitl/start", { file_url: p.file_url }));
      },
    });

    // ── PO Approval ───────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_po",
      description: "Submit a purchase order for automated risk analysis and human procurement approval. Provide the PO number and approver employee ID.",
      parameters: Type.Object({
        po_id: Type.String({ description: "Purchase order number, e.g. PO-2026-001" }),
        approver_employee_id: Type.String({ description: "HR employee ID of the approver, e.g. EMP-1042" }),
      }),
      async execute(_id, p) {
        return json(await movaPost(cfg(), "/api/v1/contracts/hitl/start-po", {
          po_id: p.po_id,
          approver_employee_id: p.approver_employee_id,
        }));
      },
    });

    // ── Crypto Trade Review ──────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_trade",
      description: "Submit a crypto trade order for sanctions screening, portfolio risk analysis, and human decision gate. Mandatory escalation for orders ≥ $10,000 or leverage > 3x.",
      parameters: Type.Object({
        trade_id: Type.String({ description: "Trade order ID, e.g. TRD-2026-0001" }),
        wallet_address: Type.String({ description: "Wallet address to screen" }),
        chain: Type.String({ description: "Blockchain, e.g. ethereum, bitcoin, solana" }),
        token_pair: Type.String({ description: "Token pair, e.g. BTC/USDT" }),
        side: Type.Union([Type.Literal("buy"), Type.Literal("sell")]),
        order_type: Type.String({ description: "Order type: market, limit, stop" }),
        order_size_usd: Type.Number({ description: "Order size in USD" }),
        leverage: Type.Number({ description: "Leverage multiplier, 1 = no leverage" }),
      }),
      async execute(_id, p) {
        return json(await movaPost(cfg(), "/api/v1/contracts/hitl/start-trade", p));
      },
    });

    // ── AML Alert Triage ─────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_aml",
      description: "Submit an AML transaction monitoring alert for automated L1 triage: sanctions screening, PEP check, typology matching, and human compliance decision gate.",
      parameters: Type.Object({
        alert_id: Type.String({ description: "Alert ID, e.g. ALERT-1002" }),
        rule_id: Type.String({ description: "TM rule ID, e.g. TM-STRUCT-11" }),
        rule_description: Type.String({ description: "Human-readable rule description" }),
        risk_score: Type.Number({ description: "Risk score 0–100" }),
        customer_id: Type.String(),
        customer_name: Type.String(),
        customer_risk_rating: Type.Union([Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")]),
        customer_type: Type.Union([Type.Literal("individual"), Type.Literal("business")]),
        customer_jurisdiction: Type.String({ description: "ISO 3166-1 alpha-2 country code, e.g. DE" }),
        triggered_transactions: Type.Array(
          Type.Object({
            transaction_id: Type.String(),
            amount_eur: Type.Number(),
          }),
          { description: "Transactions that triggered the alert" }
        ),
        pep_status: Type.Boolean(),
        sanctions_match: Type.Boolean(),
        historical_alerts: Type.Optional(Type.Array(Type.String(), { description: "Prior alert IDs" })),
      }),
      async execute(_id, p) {
        return json(await movaPost(cfg(), "/api/v1/contracts/hitl/start-aml", p));
      },
    });

    // ── Complaints Handler ────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_start_complaint",
      description: "Submit a customer complaint for EU-compliant AI classification and human decision gate. Mandatory review for compensation claims, regulator threats, repeat customers.",
      parameters: Type.Object({
        complaint_id: Type.String({ description: "Complaint ID, e.g. CMP-2026-1001" }),
        customer_id: Type.String(),
        complaint_text: Type.String({ description: "Full complaint text" }),
        channel: Type.String({ description: "Submission channel: web, email, phone, chat, branch" }),
        product_category: Type.String({ description: "e.g. payments, mortgage, insurance" }),
        complaint_date: Type.String({ description: "ISO date, e.g. 2026-03-19" }),
        previous_complaints: Type.Optional(Type.Array(Type.String())),
        attachments: Type.Optional(Type.Array(Type.String())),
        customer_segment: Type.Optional(Type.String({ description: "retail, sme, corporate" })),
        preferred_language: Type.Optional(Type.String({ description: "ISO 639-1, e.g. en, de, fr" })),
      }),
      async execute(_id, p) {
        return json(await movaPost(cfg(), "/api/v1/contracts/hitl/start-complaint", p));
      },
    });

    // ── Human Decision ────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_decide",
      description: "Submit a human decision for a contract waiting at a human gate. Use the contract_id returned by mova_hitl_start* tools.",
      parameters: Type.Object({
        contract_id: Type.String({ description: "Contract ID from mova_hitl_start* response, e.g. ctr-inv-xxxxxxxx" }),
        option: Type.String({ description: "Decision option shown to the user, e.g. approve, reject, escalate" }),
        reason: Type.Optional(Type.String({ description: "Human reasoning for the decision" })),
      }),
      async execute(_id, p) {
        return json(await movaPost(cfg(), `/api/v1/contracts/${p.contract_id}/decide`, {
          option: p.option,
          reason: p.reason ?? "",
        }));
      },
    });

    // ── Status & Audit ────────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_hitl_status",
      description: "Get the current status of a MOVA contract.",
      parameters: Type.Object({
        contract_id: Type.String(),
      }),
      async execute(_id, p) {
        return json(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}`));
      },
    });

    api.registerTool({
      name: "mova_hitl_audit",
      description: "Get the full audit receipt for a completed MOVA contract.",
      parameters: Type.Object({
        contract_id: Type.String(),
      }),
      async execute(_id, p) {
        return json(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}/audit`));
      },
    });

    api.registerTool({
      name: "mova_hitl_audit_compact",
      description: "Get the compact audit journal for a contract — full signed event chain with timestamps.",
      parameters: Type.Object({
        contract_id: Type.String(),
      }),
      async execute(_id, p) {
        return json(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}/audit/compact`));
      },
    });

    // ── Connector Registry ────────────────────────────────────────────────────

    api.registerTool({
      name: "mova_list_connectors",
      description: "List all available MOVA connectors. Optionally filter by keyword. Shows which connectors have user overrides registered.",
      parameters: Type.Object({
        keyword: Type.Optional(Type.String({ description: "Filter keyword, e.g. erp, aml, ocr, market" })),
      }),
      async execute(_id, p) {
        const data = await movaGet(cfg(), "/api/v1/connectors") as { connectors: Array<{ connector_id: string; display_name: string; description: string }> };
        let list = data.connectors ?? [];
        if (p.keyword) {
          const kw = p.keyword.toLowerCase();
          list = list.filter(c =>
            c.connector_id.toLowerCase().includes(kw) ||
            c.display_name.toLowerCase().includes(kw) ||
            c.description.toLowerCase().includes(kw)
          );
        }
        return json({ connectors: list, total: list.length });
      },
    });

    api.registerTool({
      name: "mova_list_connector_overrides",
      description: "List all connector overrides registered for your org — shows which connectors point to your real systems instead of the sandbox mock.",
      parameters: Type.Object({}),
      async execute() {
        return json(await movaGet(cfg(), "/api/v1/connectors/overrides"));
      },
    });

    api.registerTool({
      name: "mova_register_connector",
      description: "Register your own HTTPS endpoint for a MOVA connector. After registration all contracts in your org will call your endpoint instead of the sandbox mock.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector ID, e.g. connector.erp.po_lookup_v1" }),
        endpoint: Type.String({ description: "Your HTTPS endpoint URL" }),
        label: Type.Optional(Type.String({ description: "Human-readable label for this endpoint" })),
        auth_header: Type.Optional(Type.String({ description: "Auth header name, e.g. X-Api-Key or Authorization" })),
        auth_value: Type.Optional(Type.String({ description: "Auth header value, e.g. Bearer token123" })),
      }),
      async execute(_id, p) {
        return json(await movaPut(cfg(), `/api/v1/connectors/${p.connector_id}/override`, {
          endpoint: p.endpoint,
          label: p.label,
          auth_header: p.auth_header,
          auth_value: p.auth_value,
        }));
      },
    });

    api.registerTool({
      name: "mova_delete_connector_override",
      description: "Remove a connector override — the connector reverts to the MOVA sandbox mock.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector ID to revert" }),
      }),
      async execute(_id, p) {
        return json(await movaDelete(cfg(), `/api/v1/connectors/${p.connector_id}/override`));
      },
    });
  },
});
