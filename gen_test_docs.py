"""Generate test documents (PNG) for mova-po-approval and mova-crypto-review skills."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 1100
BG = (255, 255, 255)
BLACK = (20, 20, 20)
GRAY = (120, 120, 120)
LIGHT = (245, 245, 245)
ACCENT = (30, 80, 180)
RED = (180, 30, 30)
GREEN = (20, 130, 60)

def get_font(size, bold=False):
    paths = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/Arial Bold.ttf" if bold else "C:/Windows/Fonts/Arial.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def hline(d, y, color=(200, 200, 200), width=1):
    d.line([(40, y), (W-40, y)], fill=color, width=width)

def text(d, x, y, s, size=16, bold=False, color=BLACK, align="left"):
    f = get_font(size, bold)
    if align == "right":
        bb = d.textbbox((0, 0), s, font=f)
        tw = bb[2] - bb[0]
        x = x - tw
    d.text((x, y), s, font=f, fill=color)
    bb = d.textbbox((0, 0), s, font=f)
    return bb[3] - bb[1]  # return height

def row(d, y, label, value, label_color=GRAY, value_color=BLACK):
    text(d, 50, y, label, size=13, color=label_color)
    text(d, 300, y, value, size=13, bold=True, color=value_color)

# ── PO Document ────────────────────────────────────────────────────────────────
def make_po():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Header
    d.rectangle([(0, 0), (W, 80)], fill=ACCENT)
    text(d, 50, 22, "PURCHASE ORDER", size=26, bold=True, color=(255,255,255))
    text(d, W-50, 30, "ACME PROCUREMENT SYSTEMS", size=13, color=(200,210,255), align="right")

    # PO Number badge
    d.rectangle([(50, 100), (400, 140)], fill=LIGHT, outline=(200,200,200))
    text(d, 65, 112, "PO NUMBER:", size=13, color=GRAY)
    text(d, 185, 108, "PO-2026-004", size=20, bold=True, color=ACCENT)

    text(d, 450, 112, "Date:", size=13, color=GRAY)
    text(d, 520, 112, "2026-03-20", size=13, bold=True)

    hline(d, 155, color=ACCENT, width=2)

    # Vendor / Bill To
    text(d, 50, 170, "VENDOR", size=12, bold=True, color=ACCENT)
    text(d, 400, 170, "BILL TO", size=12, bold=True, color=ACCENT)

    text(d, 50, 192, "TechSupply GmbH", size=15, bold=True)
    text(d, 50, 212, "VEND-5512", size=12, color=GRAY)
    text(d, 50, 228, "Berliner Str. 45, 10115 Berlin", size=12, color=GRAY)

    text(d, 400, 192, "Musterfirma AG", size=15, bold=True)
    text(d, 400, 212, "Cost Centre: CC-OPS-01", size=12, color=GRAY)
    text(d, 400, 228, "Approver: EMP-1042", size=12, color=GRAY)

    hline(d, 260)

    # Line items header
    d.rectangle([(40, 270), (W-40, 298)], fill=LIGHT)
    text(d, 55, 277, "ITEM", size=12, bold=True, color=GRAY)
    text(d, 250, 277, "DESCRIPTION", size=12, bold=True, color=GRAY)
    text(d, 560, 277, "QTY", size=12, bold=True, color=GRAY)
    text(d, 630, 277, "UNIT PRICE", size=12, bold=True, color=GRAY)
    text(d, W-80, 277, "AMOUNT", size=12, bold=True, color=GRAY, align="right")

    items = [
        ("001", "Server Hardware Dell R750", "2", "€8,500.00", "€17,000.00"),
        ("002", "Network Switch Cisco C9300", "3", "€4,200.00", "€12,600.00"),
        ("003", "UPS APC Smart 5000VA", "2", "€2,800.00", "€5,600.00"),
        ("004", "Installation & Config", "1", "€6,300.00", "€6,300.00"),
        ("005", "Annual Support Contract", "1", "€7,000.00", "€7,000.00"),
    ]
    y = 310
    for i, (num, desc, qty, up, amt) in enumerate(items):
        if i % 2 == 0:
            d.rectangle([(40, y-4), (W-40, y+22)], fill=(250,250,252))
        text(d, 55, y, num, size=12, color=GRAY)
        text(d, 250, y, desc, size=12)
        text(d, 565, y, qty, size=12)
        text(d, 635, y, up, size=12)
        text(d, W-50, y, amt, size=12, align="right")
        y += 34

    hline(d, y + 5)

    # Totals
    text(d, 600, y+15, "Subtotal:", size=13, color=GRAY)
    text(d, W-50, y+15, "€48,500.00", size=13, bold=True, align="right")
    text(d, 600, y+35, "VAT (19%):", size=13, color=GRAY)
    text(d, W-50, y+35, "€9,215.00", size=13, bold=True, align="right")

    d.rectangle([(490, y+55), (W-40, y+83)], fill=ACCENT)
    text(d, 510, y+63, "TOTAL:", size=14, bold=True, color=(255,255,255))
    text(d, W-55, y+63, "€57,715.00", size=16, bold=True, color=(255,255,255), align="right")

    # Warning flags
    y2 = y + 105
    d.rectangle([(40, y2), (W-40, y2+75)], fill=(255,248,240), outline=(255,180,80))
    text(d, 55, y2+8, "⚠  COMPLIANCE FLAGS", size=13, bold=True, color=(180,100,0))
    text(d, 55, y2+28, "• Combined vendor spend last 72h exceeds €50,000 threshold", size=12, color=RED)
    text(d, 55, y2+46, "• Split-PO pattern detected: 3 POs from VEND-5512 in 72h window", size=12, color=RED)

    # Footer
    d.rectangle([(0, H-50), (W, H)], fill=LIGHT)
    text(d, W//2 - 200, H-32, "This document requires procurement manager approval via MOVA HITL", size=11, color=GRAY)

    img.save("test_po_PO-2026-004.png", "PNG")
    print("Saved test_po_PO-2026-004.png")


# ── Trade Order Document ────────────────────────────────────────────────────────
def make_trade():
    img = Image.new("RGB", (W, H), (12, 18, 35))  # dark trading terminal background
    d = ImageDraw.Draw(img)

    TERM_GREEN = (0, 220, 100)
    TERM_RED = (220, 60, 60)
    TERM_BLUE = (60, 140, 255)
    TERM_WHITE = (220, 230, 245)
    TERM_GRAY = (100, 120, 150)
    TERM_YELLOW = (255, 210, 50)
    TERM_DIM = (40, 55, 80)

    # Header bar
    d.rectangle([(0, 0), (W, 70)], fill=(20, 30, 55))
    d.rectangle([(0, 68), (W, 72)], fill=TERM_BLUE)
    text(d, 50, 18, "MOVA TRADE REVIEW", size=22, bold=True, color=TERM_BLUE)
    text(d, W-50, 22, "RISK GATE REQUIRED", size=14, bold=True, color=TERM_YELLOW, align="right")

    # Trade ID
    text(d, 50, 90, "TRADE ORDER", size=11, color=TERM_GRAY)
    text(d, 50, 108, "TRD-2026-0002", size=28, bold=True, color=TERM_WHITE)
    d.rectangle([(350, 102), (520, 130)], fill=(180, 30, 30))
    text(d, 360, 110, "PENDING REVIEW", size=12, bold=True, color=(255,255,255))

    # Pair and side
    d.rectangle([(40, 155), (W-40, 215)], fill=TERM_DIM)
    text(d, 55, 165, "BTC / USDT", size=32, bold=True, color=TERM_WHITE)
    text(d, 380, 165, "BUY", size=32, bold=True, color=TERM_GREEN)
    text(d, 55, 202, "MARKET ORDER", size=13, color=TERM_GRAY)
    text(d, 380, 202, "SPOT  ·  1x LEVERAGE", size=13, color=TERM_GRAY)

    # Key metrics grid
    d.rectangle([(40, 230), (W-40, 350)], fill=TERM_DIM)
    metrics = [
        ("ORDER SIZE", "$25,000.00", TERM_YELLOW),
        ("BTC PRICE",  "$64,300.00", TERM_WHITE),
        ("BTC QTY",    "0.38864 BTC", TERM_WHITE),
        ("LEVERAGE",   "1x", TERM_GREEN),
        ("CHAIN",      "ETHEREUM", TERM_BLUE),
        ("ORDER TYPE", "MARKET", TERM_WHITE),
    ]
    for i, (label, val, col) in enumerate(metrics):
        cx = 40 + (i % 3) * 280 + 20
        cy = 245 + (i // 3) * 60
        text(d, cx, cy, label, size=11, color=TERM_GRAY)
        text(d, cx, cy+18, val, size=16, bold=True, color=col)

    # Wallet
    text(d, 50, 365, "WALLET ADDRESS", size=11, color=TERM_GRAY)
    text(d, 50, 382, "0xABCDEF1234567890abcdef1234567890ABCDEF12", size=13, bold=True, color=TERM_BLUE)

    hline(d, 410, color=(40, 60, 90), width=1)

    # Risk checks
    text(d, 50, 425, "AUTOMATED RISK CHECKS", size=13, bold=True, color=TERM_GRAY)

    checks = [
        ("SANCTIONS SCREEN (OFAC/EU/UN)", "PENDING", TERM_YELLOW),
        ("WALLET BALANCE",                "PENDING", TERM_YELLOW),
        ("PORTFOLIO CONCENTRATION",       "PENDING", TERM_YELLOW),
        ("MARKET VOLATILITY",             "PENDING", TERM_YELLOW),
    ]
    y = 450
    for label, status, col in checks:
        d.rectangle([(50, y), (840, y+26)], fill=(20, 30, 50))
        d.rectangle([(50, y), (53, y+26)], fill=col)
        text(d, 62, y+6, label, size=12, color=TERM_WHITE)
        text(d, W-60, y+6, status, size=12, bold=True, color=col, align="right")
        y += 34

    # Mandatory escalation notice
    d.rectangle([(40, y+15), (W-40, y+90)], fill=(40, 20, 20), outline=TERM_RED)
    text(d, 55, y+22, "⚠  MANDATORY HUMAN REVIEW REQUIRED", size=14, bold=True, color=TERM_RED)
    text(d, 55, y+45, "Order size $25,000 exceeds $10,000 automated approval threshold.", size=12, color=TERM_WHITE)
    text(d, 55, y+65, "Trade cannot be executed without human trader authorization.", size=12, color=TERM_GRAY)

    # Submit info
    y2 = y + 110
    text(d, 50, y2, "SUBMIT FOR REVIEW:", size=11, color=TERM_GRAY)
    text(d, 50, y2+18, "mova-bridge call mova_hitl_start_trade --trade-id TRD-2026-0002", size=12, color=TERM_BLUE)
    text(d, 50, y2+36, "  --wallet-address 0xABCDEF1234567890abcdef1234567890ABCDEF12", size=12, color=TERM_BLUE)
    text(d, 50, y2+54, "  --chain ethereum --token-pair BTC/USDT --side buy", size=12, color=TERM_BLUE)
    text(d, 50, y2+72, "  --order-type market --order-size-usd 25000 --leverage 1", size=12, color=TERM_BLUE)

    # Footer
    d.rectangle([(0, H-45), (W, H)], fill=(20, 30, 55))
    text(d, W//2 - 230, H-28, "Generated by MOVA Trade Risk System  ·  TRD-2026-0002  ·  2026-03-23", size=11, color=TERM_GRAY)

    img.save("test_trade_TRD-2026-0002.png", "PNG")
    print("Saved test_trade_TRD-2026-0002.png")


make_po()
make_trade()
