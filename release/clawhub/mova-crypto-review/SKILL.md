---
name: mova-crypto-review
description: Submit a crypto trade order for automated risk analysis and human-in-the-loop review via MOVA. Trigger when the user mentions a trade order, wallet address, token pair, or asks to review/approve a crypto trade. Mandatory human escalation for orders above $10,000 or leverage above 3x.
license: MIT-0
---

# MOVA Crypto Trade Review

## What this skill does

Submits a trade order to MOVA for a three-step risk review:

1. **Risk analysis** — AI checks market price & volatility, wallet balance, portfolio concentration, and runs sanctions/PEP screening (OFAC, EU, UN)
2. **Risk snapshot** — scores the trade (0.0–1.0) and surfaces anomaly flags
3. **Human decision gate** — trader chooses: approve / reject / escalate to human trader

Immediate rejection on sanctions hit or leverage > 10x. Mandatory escalation for orders ≥ $10,000 or leverage > 3x.

## When to trigger

Activate when the user:
- Mentions a trade order ID (e.g. "TRD-2026-001")
- Provides a wallet address and token pair with trade details
- Says "review this trade", "check this order", "approve trade"

**Before starting**, confirm: "Запустить проверку трейда [trade_id] через MOVA?"

If details are missing — ask once for: trade ID, wallet address, chain, token pair, side (buy/sell), order size in USD, leverage.

## Step 1 — Submit trade order

Run exec with all required fields:

    mova-bridge call mova_hitl_start_trade \
      --trade-id TRD-2026-0001 \
      --wallet-address 0xABC123... \
      --chain ethereum \
      --token-pair BTC/USDT \
      --side buy \
      --order-type market \
      --order-size-usd 25000 \
      --leverage 1

## Step 2 — Show risk analysis and decision options

If `status = "waiting_human"` — show the risk summary:

    Trade: TOKEN_PAIR SIDE ORDER_SIZE_USD USD
    Risk score:     SCORE / 1.0  (RISK_LEVEL)
    Sanctions:      clean / HIT (list name)
    Balance:        sufficient / insufficient
    Portfolio conc: CONCENTRATION_PCT%
    Findings:       [list findings if any]

Then ask user to choose:

- **approve** — Approve trade
- **reject** — Reject trade
- **escalate_human** — Escalate to human trader

Show `recommended` option if present (mark ← RECOMMENDED).

Then run exec:

    mova-bridge call mova_hitl_decide --contract-id CONTRACT_ID --option OPTION --reason "REASON"

## Step 3 — Show audit receipt

If `status = "completed"`:

    ✅ Trade [trade_id] — CONTRACT_ID

    Decision:      OPTION
    Risk score:    SCORE / 1.0
    Sanctions:     clean / HIT
    Audit receipt: AUDIT_RECEIPT_ID

## Other commands

    mova-bridge call mova_hitl_status --contract-id CONTRACT_ID
    mova-bridge call mova_hitl_audit --contract-id CONTRACT_ID

## What the user receives

| Output | Description |
|--------|-------------|
| Market check | Current price, 24h change, volatility score |
| Balance check | Wallet balance, available margin |
| Portfolio risk | Concentration %, VaR 1-day USD |
| Sanctions check | OFAC / EU / UN / PEP screening result |
| Anomaly flags | order_size_exceeds_threshold, high_leverage, sanctions_hit, etc. |
| Risk score | 0.0 (clean) – 1.0 (critical) |
| Decision options | approve / reject / escalate_human |
| Audit receipt ID | Permanent signed record of the trading decision |

## Rules

- NEVER make HTTP requests manually
- NEVER construct JSON payloads for MOVA API
- NEVER invent or simulate results — if exec fails, show the exact error
- Run exec command directly: mova-bridge call ... (not wrapped in bash)
