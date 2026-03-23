# mova-bridge

CLI and MCP client for the [MOVA](https://mova-lab.eu) contract execution API.

`mova-bridge` lets any AI agent — Claude Code, OpenClaw, or your own — submit documents to MOVA contracts, poll status, record human decisions, and retrieve signed audit receipts.

## Install

```bash
pip install mova-bridge
```

Requires Python 3.11+.

## Quick start

```bash
# Register and get your API key (free, $1 credit included)
mova-bridge call mova_register --org-name "My Team"

# Set your key
export MOVA_API_KEY=mova_...

# Submit an invoice for OCR + human approval
mova-bridge call mova_hitl_start --file-url https://example.com/invoice.jpg

# Record a decision
mova-bridge call mova_hitl_decide \
  --contract-id ctr-... \
  --option approve \
  --reason "Verified against PO-1234"

# Fetch the audit receipt at any time
mova-bridge call mova_hitl_audit --contract-id ctr-...
```

## What you get

| Step | What happens |
|------|-------------|
| OCR | Vision model extracts vendor, amounts, dates, line items, VAT |
| Risk score | Automated check — score 0.0–1.0, flagged anomalies |
| Human gate | You choose: approve / reject / escalate / request info |
| Audit receipt | Immutable signed record: who decided, which option, reason, timestamp |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MOVA_API_KEY` | Yes | Your MOVA API key |
| `MOVA_API_URL` | No | Override API endpoint (default: `https://api.mova-lab.eu`) |

## OpenClaw skill

The `release/clawhub/mova-invoice-ocr/` directory contains a ready-made skill for the [ClawhHub](https://clawhub.ai) marketplace. Install it in your OpenClaw agent to process invoices via Telegram or any other channel.

## License

MIT — see [LICENSE](LICENSE).
