# mova-bridge

Open-source toolkit for building AI agents that execute human-in-the-loop business contracts via **MOVA**.

---

## What is MOVA?

MOVA is a contract execution runtime for regulated business workflows — invoice approvals, AML triage, purchase order sign-off, customer complaint handling, crypto trade review, and more.

Each contract runs a defined sequence of steps:

1. **AI analysis** — a vision/language model extracts data and produces a risk assessment
2. **Automated verification** — business rules, duplicate checks, sanctions screening via connectors
3. **Human decision gate** — an operator reviews the analysis and chooses an action (approve / reject / escalate / etc.)
4. **Signed audit receipt** — an immutable record of who decided, what was chosen, the reason, and the timestamp

The **contract executor** that powers all of this is a proprietary Rust service owned and operated by **Sergii Miasoiedov**. It is currently available **free of charge**. A paid subscription model may be introduced in the future based on user feedback.

---

## Ecosystem

Three open components plug into the MOVA runtime:

```
┌─────────────────────────────────────────────┐
│              OpenClaw agent                 │
│                                             │
│  ┌──────────┐   ┌───────────┐   ┌────────┐ │
│  │  Skill   │ + │  Plugin   │ + │  Keys  │ │
│  │ (SKILL.md│   │openclaw-  │   │(API key│ │
│  │ on Claw- │   │mova)      │   │ in     │ │
│  │ hHub)    │   │           │   │config) │ │
│  └──────────┘   └─────┬─────┘   └────────┘ │
└────────────────────────┼────────────────────┘
                         │ native tool calls
                         ▼
              ┌─────────────────────┐
              │   MOVA Runtime      │
              │  (api.mova-lab.eu)  │
              │                     │
              │  Connectors ────────┼──► Your ERP / CRM / AML
              └─────────────────────┘
```

### Skills — what the agent knows

Skills are instruction sets for the OpenClaw agent, published on [ClawhHub](https://clawhub.ai). Each skill teaches the agent when and how to run a specific contract type.

| Skill | Description |
|---|---|
| [mova-invoice-ocr](https://clawhub.ai/skills/mova-invoice-ocr) | Invoice OCR + duplicate check + VAT validation + human approval |
| [mova-po-approval](https://clawhub.ai/skills/mova-po-approval) | Purchase order lookup + budget check + manager sign-off |
| [mova-aml-triage](https://clawhub.ai/skills/mova-aml-triage) | PEP/sanctions screening + transaction history + compliance decision |
| [mova-complaints-handler](https://clawhub.ai/skills/mova-complaints-handler) | Customer complaint classification + policy check + resolution routing |
| [mova-crypto-review](https://clawhub.ai/skills/mova-crypto-review) | Crypto trade review + wallet balance + portfolio risk assessment |
| [mova-connector-setup](https://clawhub.ai/skills/mova-connector-setup) | Register your real system endpoints to replace sandbox mocks |

### Plugin — the tool bridge

The **`openclaw-mova`** plugin gives OpenClaw native tools to call MOVA:

```bash
openclaw plugins install openclaw-mova
```

Available tools after install:

| Tool | What it does |
|---|---|
| `mova_hitl_start_invoice` | Submit invoice, run AI analysis, return decision point |
| `mova_hitl_start_po` | Submit purchase order for approval |
| `mova_hitl_start_aml` | Submit transaction for AML triage |
| `mova_hitl_start_complaint` | Submit customer complaint for handling |
| `mova_hitl_start_trade` | Submit crypto trade for review |
| `mova_hitl_decide` | Record a human decision on an open contract |
| `mova_hitl_audit` | Fetch the signed audit receipt |
| `mova_hitl_audit_compact` | Fetch the compact audit journal (JSONL sidecar) |
| `mova_list_connectors` | List available connectors and registered overrides |
| `mova_register_connector` | Register your endpoint for a connector |
| `mova_delete_connector_override` | Revert a connector back to the sandbox mock |

Plugin source: [`openclaw-plugin/`](openclaw-plugin/)

### Connectors — your real data

By default every contract runs against a **sandbox mock** that returns realistic test data. To use live data from your own systems, register an HTTPS endpoint per connector:

```
mova-bridge call mova_register_connector \
  --connector-id connector.erp.invoice_post_v1 \
  --endpoint https://your-erp.example.com/api/invoices \
  --label "Production ERP" \
  --auth-header X-Api-Key \
  --auth-value YOUR_KEY
```

Once registered, all contracts in your org call your endpoint — no code changes, no redeployment.

MOVA has 40+ connectors across ERP, CRM, AML screening, market data, HR, and more. Full list via:

```bash
mova-bridge call mova_list_connectors
```

---

## Getting started

### 1. Install the Python bridge

```bash
pip install mova-bridge
```

### 2. Get an API key

```bash
mova-bridge call mova_register --org-name "My Team"
export MOVA_API_KEY=mova_...
```

### 3. Install the OpenClaw plugin

```bash
openclaw plugins install openclaw-mova
openclaw config set plugins.entries.mova.config.apiKey $MOVA_API_KEY
```

### 4. Add a skill from ClawhHub

In your OpenClaw agent settings, install the skill for the workflow you need (e.g. `mova-invoice-ocr`). The agent will then know how to run contracts when users ask.

---

## Repository structure

```
openclaw-plugin/     OpenClaw plugin source (TypeScript) + built bundle
release/clawhub/     SKILL.md files for all published ClawhHub skills
src/mova_bridge/     Python bridge server (FastAPI) — local dev / self-hosting
docs/                GitHub Pages — hosts plugin tarballs for distribution
ADDING_CONTRACTS.md  Guide: how to add a new contract type end-to-end
```

---

## License

Code in this repository is MIT-0 (no attribution required).

The **MOVA contract execution runtime** (`api.mova-lab.eu`) is a proprietary service owned and operated by **Sergii Miasoiedov**. It is currently free to use. A subscription model may be introduced in the future based on user feedback and operational costs.
