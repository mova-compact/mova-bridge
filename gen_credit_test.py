"""Generate test PNG for mova-credit-scoring skill."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 580
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

# ── Header ────────────────────────────────────────────────────────────────────
d.rectangle([(0, 0), (W, 68)], fill=(18, 24, 44))
d.rectangle([(0, 66), (W, 70)], fill=ACCENT)
txt(d, 44, 16, "CREDIT SCORING APPLICATION", size=21, bold=True, color=WHITE)
txt(d, W-44, 20, "MOVA HITL  ·  OFFICER APPROVAL REQUIRED", size=13, bold=True, color=ACCENT, align="right")

# ── Meta row ──────────────────────────────────────────────────────────────────
d.rectangle([(0, 70), (W, 112)], fill=PANEL)
meta = [
    (44,  "Application ID:", "APP-2026-0041"),
    (260, "Date:",           "2026-03-25"),
    (410, "Product:",        "Personal loan — 36 months"),
    (680, "Status:",         "PENDING REVIEW"),
]
for x, label, val in meta:
    txt(d, x, 82, label, size=12, color=GRAY)
    txt(d, x, 96, val,   size=12, bold=True, color=YELLOW if val == "PENDING REVIEW" else WHITE)

# ── Applicant block ───────────────────────────────────────────────────────────
d.rectangle([(40, 124), (440, 290)], fill=PANEL2)
txt(d, 58, 134, "APPLICANT", size=11, bold=True, color=GRAY)
hline(d, 152, 58, 422, (40,55,85))

app_rows = [
    ("Name:",             "Markus Weber"),
    ("Applicant ID:",     "CUST-1501"),
    ("Employment:",       "Employed — 4 years"),
    ("Annual income:",    "€48,000"),
    ("Monthly debt:",     "€820  (car loan)"),
    ("Loan purpose:",     "Home renovation"),
]
y = 160
for label, val in app_rows:
    txt(d, 58,  y, label, size=12, color=GRAY)
    txt(d, 200, y, val,   size=12, bold=True, color=WHITE)
    y += 20

# ── Loan request block ────────────────────────────────────────────────────────
d.rectangle([(460, 124), (W-40, 290)], fill=PANEL2)
txt(d, 478, 134, "LOAN REQUEST", size=11, bold=True, color=GRAY)
hline(d, 152, 478, W-58, (40,55,85))

loan_rows = [
    ("Requested amount:", "€25,000"),
    ("Term:",             "36 months"),
    ("Est. monthly pmt:", "€762"),
    ("DTI ratio:",        "29.8%"),
    ("Bureau score:",     "612  (Experian)"),
    ("Bureau date:",      "2026-03-10"),
]
y = 160
for label, val in loan_rows:
    txt(d, 478, y, label, size=12, color=GRAY)
    txt(d, 628, y, val,   size=12, bold=True, color=WHITE)
    y += 20

# ── Risk indicators ───────────────────────────────────────────────────────────
d.rectangle([(40, 302), (W-40, 394)], fill=PANEL)
txt(d, 58, 312, "RISK INDICATORS", size=11, bold=True, color=GRAY)
hline(d, 330, 58, W-58, (40,55,85))

indicators = [
    ("Bureau score band:",   "FAIR  (600–649)",    ORANGE),
    ("Debt-to-income:",      "29.8%  — elevated",  ORANGE),
    ("Employment stability:","Stable — 4 years",   GREEN),
    ("Prior defaults:",      "None on record",      GREEN),
]
y = 338
lx, vx = 58, 260
for i, (label, val, col) in enumerate(indicators):
    cx = lx if i % 2 == 0 else lx + 400
    vv = vx if i % 2 == 0 else vx + 400
    if i % 2 == 0 and i > 0:
        y += 24
    txt(d, cx, y, label, size=12, color=GRAY)
    txt(d, vv, y, val,   size=12, bold=True, color=col)

# ── Risk flag ─────────────────────────────────────────────────────────────────
d.rectangle([(40, 406), (W-40, 458)], fill=ORANGE_BG, outline=ORANGE)
txt(d, 58, 414, "SCORING NOTE", size=13, bold=True, color=ORANGE)
txt(d, 58, 432, "Bureau score 612 falls in FAIR band — automated approval not permitted.", size=12, color=WHITE)
txt(d, 58, 448, "Human credit officer review required before any decision is issued.", size=12, color=GRAY)

# ── Decision options ──────────────────────────────────────────────────────────
d.rectangle([(40, 470), (W-40, 524)], fill=PANEL2)
txt(d, 58, 480, "REQUIRED DECISION:", size=12, bold=True, color=GRAY)
options = [
    ("approve",         GREEN),
    ("approve_reduced", ACCENT),
    ("reject",          RED),
    ("request_info",    YELLOW),
]
ox = 250
for opt, col in options:
    bw = len(opt) * 8 + 18
    d.rectangle([(ox, 476), (ox+bw, 500)], fill=(28, 38, 60), outline=col)
    txt(d, ox + bw//2, 480, opt, size=11, bold=True, color=col, align="center")
    ox += bw + 14

# ── Footer ────────────────────────────────────────────────────────────────────
d.rectangle([(0, 536), (W, H)], fill=(15, 20, 36))
txt(d, W//2, 550, "MOVA Credit Scoring  ·  APP-2026-0041  ·  2026-03-25  ·  Confidential", size=11, color=GRAY, align="center")

img.save("test_credit_APP-2026-0041.png", "PNG")
print("saved test_credit_APP-2026-0041.png")
