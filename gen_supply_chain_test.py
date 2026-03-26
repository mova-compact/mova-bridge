"""Generate test PNG for mova-supply-chain-risk skill."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 620
BG = (13, 17, 28)
PANEL = (20, 27, 45)
PANEL2 = (26, 35, 58)
WHITE = (220, 232, 255)
GRAY = (100, 120, 155)
ACCENT = (50, 120, 255)
RED = (220, 60, 60)
RED_BG = (50, 15, 15)
ORANGE = (230, 140, 30)
ORANGE_BG = (45, 30, 10)
GREEN = (40, 200, 100)
GREEN_BG = (10, 40, 20)
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

# ── Header ──────────────────────────────────────────────────────────────────
d.rectangle([(0, 0), (W, 68)], fill=(18, 24, 42))
d.rectangle([(0, 66), (W, 70)], fill=ACCENT)
txt(d, 44, 16, "SUPPLY CHAIN SCREENING REQUEST", size=21, bold=True, color=WHITE)
txt(d, W-44, 20, "MOVA HITL  ·  RISK GATE REQUIRED", size=13, bold=True, color=ACCENT, align="right")

# ── Meta row ────────────────────────────────────────────────────────────────
d.rectangle([(0, 70), (W, 108)], fill=PANEL)
txt(d, 44, 82, "Batch ID:", size=12, color=GRAY)
txt(d, 130, 82, "SCR-2026-0031", size=12, bold=True, color=WHITE)
txt(d, 310, 82, "Date:", size=12, color=GRAY)
txt(d, 358, 82, "2026-03-25", size=12, bold=True, color=WHITE)
txt(d, 480, 82, "Category:", size=12, color=GRAY)
txt(d, 548, 82, "raw_materials", size=12, bold=True, color=WHITE)
txt(d, 690, 82, "Requestor:", size=12, color=GRAY)
txt(d, 766, 82, "EMP-2201", size=12, bold=True, color=WHITE)

# ── Suppliers table header ───────────────────────────────────────────────────
d.rectangle([(40, 120), (W-40, 148)], fill=PANEL2)
cols = [55, 170, 395, 510, 620, 740]
headers = ["ID", "Name", "Country", "Category", "Status", "Flags"]
for i, h in enumerate(headers):
    txt(d, cols[i], 129, h, size=11, bold=True, color=GRAY)

# ── Supplier rows ────────────────────────────────────────────────────────────
suppliers = [
    ("SUP-001", "Acme Technologies GmbH",   "DE", "raw_materials", "CLEAN",    "",                  GREEN,  GREEN_BG),
    ("SUP-002", "Delta Trading LLC",         "RU", "raw_materials", "SANCTIONS","OFAC SDN HIT",     RED,    RED_BG),
    ("SUP-003", "Meridian Logistics Co.",    "CN", "logistics",     "HIGH RISK","ESG F / adv.media", ORANGE, ORANGE_BG),
    ("SUP-004", "TechParts Iberia SL",       "ES", "raw_materials", "CLEAN",    "",                  GREEN,  GREEN_BG),
]

y = 152
for sup_id, name, country, cat, status, flags, scol, sbg in suppliers:
    d.rectangle([(40, y), (W-40, y+36)], fill=sbg if sbg != GREEN_BG else PANEL)
    if sbg == RED_BG:
        d.rectangle([(40, y), (W-40, y+36)], fill=RED_BG)
    elif sbg == ORANGE_BG:
        d.rectangle([(40, y), (W-40, y+36)], fill=ORANGE_BG)
    txt(d, cols[0], y+10, sup_id,  size=12, bold=True, color=GRAY)
    txt(d, cols[1], y+10, name,    size=12, color=WHITE)
    txt(d, cols[2], y+10, country, size=12, bold=True, color=WHITE)
    txt(d, cols[3], y+10, cat,     size=11, color=GRAY)
    # status badge
    sw = 90
    d.rectangle([(cols[4]-4, y+6), (cols[4]+sw, y+28)], fill=scol)
    txt(d, cols[4] + sw//2, y+10, status, size=11, bold=True, color=(10,10,10), align="center")
    txt(d, cols[5], y+10, flags, size=11, color=scol)
    y += 38

hline(d, y + 2)

# ── Mandatory escalation warning ────────────────────────────────────────────
wy = y + 14
d.rectangle([(40, wy), (W-40, wy+70)], fill=(45, 10, 10), outline=RED)
txt(d, 58, wy+10, "MANDATORY ESCALATION REQUIRED", size=14, bold=True, color=RED)
txt(d, 58, wy+32, "SUP-002 (Delta Trading LLC / RU) matched OFAC SDN list — immediate escalation,", size=12, color=WHITE)
txt(d, 58, wy+50, "batch cannot be approved without compliance team review.", size=12, color=GRAY)

# ── Footer ───────────────────────────────────────────────────────────────────
fy = wy + 84
d.rectangle([(0, fy), (W, H)], fill=(15, 20, 35))
txt(d, W//2, fy + 14, "MOVA Supply Chain Risk  ·  SCR-2026-0031  ·  2026-03-25  ·  Confidential", size=11, color=GRAY, align="center")

img.save("test_supply_chain_SCR-2026-0031.png", "PNG")
print("saved test_supply_chain_SCR-2026-0031.png")
