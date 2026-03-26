"""Generate test PNG for mova-churn-prediction skill."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 600
BG = (13, 17, 28)
PANEL = (20, 27, 45)
PANEL2 = (26, 35, 56)
WHITE = (220, 232, 255)
GRAY = (100, 120, 155)
ACCENT = (60, 130, 255)
RED = (220, 60, 60)
RED_BG = (48, 14, 14)
ORANGE = (230, 140, 30)
ORANGE_BG = (44, 28, 10)
GREEN = (40, 200, 100)
YELLOW = (240, 200, 50)

def get_font(size, bold=False):
    paths = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/Arial Bold.ttf" if bold else "C:/Windows/Fonts/Arial.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def txt(d, x, y, s, size=14, bold=False, color=WHITE, align="left"):
    f = get_font(size, bold)
    if align == "right":
        bb = d.textbbox((0,0), s, font=f)
        x = x - (bb[2] - bb[0])
    elif align == "center":
        bb = d.textbbox((0,0), s, font=f)
        x = x - (bb[2] - bb[0]) // 2
    d.text((x, y), s, font=f, fill=color)

def hline(d, y, x0=40, x1=W-40, color=(40, 55, 85)):
    d.line([(x0, y), (x1, y)], fill=color, width=1)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# ── Header ────────────────────────────────────────────────────────────────────
d.rectangle([(0, 0), (W, 68)], fill=(18, 24, 44))
d.rectangle([(0, 66), (W, 70)], fill=ACCENT)
txt(d, 44, 16, "CHURN PREDICTION — AT-RISK CUSTOMERS", size=21, bold=True, color=WHITE)
txt(d, W-44, 20, "MOVA HITL  ·  CAMPAIGN APPROVAL REQUIRED", size=13, bold=True, color=ACCENT, align="right")

# ── Meta row ──────────────────────────────────────────────────────────────────
d.rectangle([(0, 70), (W, 112)], fill=PANEL)
meta = [
    (44,  "Segment:",    "SEG-ENTERPRISE"),
    (230, "Period:",     "Last 30 days"),
    (380, "Threshold:",  "≥ 0.70"),
    (530, "Model:",      "churn-v2.1.0"),
    (690, "Requestor:",  "EMP-0441"),
]
for x, label, val in meta:
    txt(d, x, 82, label, size=12, color=GRAY)
    txt(d, x, 96, val,   size=12, bold=True, color=WHITE)

# ── Summary stats ─────────────────────────────────────────────────────────────
d.rectangle([(40, 122), (W-40, 168)], fill=PANEL2)
stats = [
    ("Customers analyzed", "1,842", WHITE),
    ("At-risk (≥ 0.70)",   "23",    RED),
    ("Avg churn score",    "0.81",  ORANGE),
    ("Est. ARR at risk",   "€186K", YELLOW),
]
sw = (W - 80) // len(stats)
for i, (label, val, col) in enumerate(stats):
    sx = 40 + i * sw
    hline(d, 122, sx+10, sx+sw-10, (35,48,75))
    txt(d, sx + sw//2, 130, label, size=11, color=GRAY, align="center")
    txt(d, sx + sw//2, 146, val,   size=16, bold=True, color=col, align="center")
    if i > 0:
        d.line([(sx, 128), (sx, 162)], fill=(40,55,85), width=1)

# ── Table header ──────────────────────────────────────────────────────────────
d.rectangle([(40, 178), (W-40, 202)], fill=(30, 40, 65))
cols = [55, 155, 310, 430, 570, 720]
headers = ["ID", "Company", "Score", "Top factor", "ARR", "Action"]
for i, h in enumerate(headers):
    txt(d, cols[i], 186, h, size=11, bold=True, color=GRAY)

# ── Customer rows ─────────────────────────────────────────────────────────────
customers = [
    ("CUST-4401", "Vortex Analytics GmbH",   "0.94", "login_drop_80pct",     "€42K", "immediate",  RED,    RED_BG),
    ("CUST-2817", "Nordstern Capital",        "0.89", "no_logins_18d",        "€38K", "immediate",  RED,    RED_BG),
    ("CUST-6603", "Meridian Retail AG",       "0.83", "support_tickets_x5",   "€29K", "outreach",   ORANGE, ORANGE_BG),
    ("CUST-1155", "BluePeak Technologies",    "0.79", "feature_usage_drop",   "€24K", "outreach",   ORANGE, ORANGE_BG),
    ("CUST-3390", "Elara Consulting SRL",     "0.76", "billing_dispute_open", "€19K", "outreach",   ORANGE, ORANGE_BG),
    ("CUST-5521", "Tandem Logistics BV",      "0.73", "contract_near_expiry", "€16K", "monitor",    YELLOW, PANEL),
    ("CUST-0882", "Altas Software OU",        "0.71", "low_nps_score",        "€18K", "monitor",    YELLOW, PANEL),
]

y = 206
for cid, name, score, factor, arr, action, scol, sbg in customers:
    bg = sbg if sbg != PANEL else (22, 30, 48)
    d.rectangle([(40, y), (W-40, y+32)], fill=bg)
    txt(d, cols[0], y+8, cid,    size=11, bold=True, color=GRAY)
    txt(d, cols[1], y+8, name,   size=12, color=WHITE)
    # score badge
    d.rectangle([(cols[2]-2, y+5), (cols[2]+44, y+27)], fill=scol)
    txt(d, cols[2]+22, y+8, score, size=12, bold=True, color=(10,10,10), align="center")
    txt(d, cols[3], y+8, factor,  size=11, color=GRAY)
    txt(d, cols[4], y+8, arr,     size=12, bold=True, color=WHITE)
    txt(d, cols[5], y+8, action,  size=11, bold=True, color=scol)
    y += 34

hline(d, y + 4)

# ── Decision options ──────────────────────────────────────────────────────────
dy = y + 16
d.rectangle([(40, dy), (W-40, dy+58)], fill=PANEL2)
txt(d, 58, dy+8, "REQUIRED DECISION:", size=12, bold=True, color=GRAY)
options = [
    ("launch_campaign",   GREEN),
    ("launch_selective",  ACCENT),
    ("defer",             GRAY),
    ("escalate",          ORANGE),
]
ox = 250
for opt, col in options:
    bw = len(opt) * 8 + 18
    d.rectangle([(ox, dy+6), (ox+bw, dy+30)], fill=(28, 38, 60), outline=col)
    txt(d, ox + bw//2, dy+10, opt, size=11, bold=True, color=col, align="center")
    ox += bw + 14

# ── Footer ────────────────────────────────────────────────────────────────────
fy = dy + 68
d.rectangle([(0, fy), (W, H)], fill=(15, 20, 36))
txt(d, W//2, fy+14, "MOVA Churn Prediction  ·  SEG-ENTERPRISE  ·  2026-03-25  ·  Confidential", size=11, color=GRAY, align="center")

img.save("test_churn_SEG-ENTERPRISE.png", "PNG")
print("saved test_churn_SEG-ENTERPRISE.png")
