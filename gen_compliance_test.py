"""Generate test PNG for mova-compliance-audit skill."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 580
BG = (14, 19, 32)
PANEL = (20, 28, 46)
PANEL2 = (26, 36, 58)
WHITE = (220, 232, 255)
GRAY = (100, 120, 155)
ACCENT = (60, 130, 255)
RED = (220, 60, 60)
RED_BG = (48, 14, 14)
ORANGE = (230, 140, 30)
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

# ── Header ───────────────────────────────────────────────────────────────────
d.rectangle([(0, 0), (W, 68)], fill=(18, 24, 44))
d.rectangle([(0, 66), (W, 70)], fill=ACCENT)
txt(d, 44, 16, "COMPLIANCE AUDIT REQUEST", size=21, bold=True, color=WHITE)
txt(d, W-44, 20, "MOVA HITL  ·  HUMAN SIGN-OFF REQUIRED", size=13, bold=True, color=ACCENT, align="right")

# ── Meta row ─────────────────────────────────────────────────────────────────
d.rectangle([(0, 70), (W, 112)], fill=PANEL)
meta = [
    (44,  "Document ID:",  "DOC-2026-0088"),
    (260, "Date:",         "2026-03-25"),
    (420, "Framework:",    "GDPR 2016/679"),
    (636, "Status:",       "PENDING AUDIT"),
]
for x, label, val in meta:
    txt(d, x,  82, label, size=12, color=GRAY)
    txt(d, x,  96, val,   size=12, bold=True, color=WHITE if val != "PENDING AUDIT" else YELLOW)

# ── Document details block ────────────────────────────────────────────────────
d.rectangle([(40, 124), (W-40, 240)], fill=PANEL2)
txt(d, 58, 134, "DOCUMENT DETAILS", size=11, bold=True, color=GRAY)
hline(d, 152, 58, W-58, (40,55,85))

rows = [
    ("Organization:",    "Meridian FinTech GmbH"),
    ("Document type:",   "Privacy Policy & Data Processing Agreement"),
    ("Document URL:",    "https://meridian-fintech.de/legal/privacy-policy-v3.pdf"),
    ("Pages:",           "24"),
    ("Language:",        "EN / DE (bilingual)"),
]
y = 160
for label, val in rows:
    txt(d, 58,  y, label, size=12, color=GRAY)
    txt(d, 240, y, val,   size=12, bold=True, color=WHITE)
    y += 18

# ── Checklist scope ──────────────────────────────────────────────────────────
d.rectangle([(40, 252), (W-40, 378)], fill=PANEL)
txt(d, 58, 262, "AUDIT SCOPE  —  GDPR CHECKLIST", size=11, bold=True, color=GRAY)
hline(d, 280, 58, W-58, (40,55,85))

checks = [
    ("Art. 13 / 14", "Transparency & information obligations",          "?"),
    ("Art. 17",      "Right to erasure — documented procedure",         "?"),
    ("Art. 25",      "Data protection by design and by default",        "?"),
    ("Art. 28",      "Data processing agreement with sub-processors",   "?"),
    ("Art. 32",      "Security of processing — technical measures",     "?"),
    ("Art. 35",      "DPIA requirement assessment",                     "?"),
]
y = 288
for art, desc, status in checks:
    d.rectangle([(56, y), (160, y+18)], fill=(30, 42, 70))
    txt(d, 58,  y+2, art,    size=11, bold=True, color=ACCENT)
    txt(d, 168, y+2, desc,   size=11, color=WHITE)
    txt(d, W-58, y+2, status, size=11, bold=True, color=GRAY, align="right")
    y += 22

# ── Risk flag ────────────────────────────────────────────────────────────────
d.rectangle([(40, 390), (W-40, 450)], fill=RED_BG, outline=RED)
txt(d, 58, 400, "KNOWN RISK FLAGS", size=13, bold=True, color=RED)
txt(d, 58, 420, "No documented DPIA found for high-risk processing activities (profiling, automated decisions).", size=12, color=WHITE)
txt(d, 58, 436, "Sub-processor list incomplete — 3 vendors listed without signed DPA.", size=12, color=GRAY)

# ── Decision options ─────────────────────────────────────────────────────────
d.rectangle([(40, 462), (W-40, 516)], fill=PANEL2)
txt(d, 58, 472, "REQUIRED DECISION:", size=12, bold=True, color=GRAY)
options = ["approve", "approve_with_conditions", "reject", "request_corrections"]
ox = 200
for opt in options:
    col = GREEN if opt == "approve" else (ORANGE if "conditions" in opt else (RED if opt == "reject" else ACCENT))
    bw = len(opt) * 7 + 16
    d.rectangle([(ox, 468), (ox+bw, 492)], fill=(30, 38, 60), outline=col)
    txt(d, ox+bw//2, 472, opt, size=11, bold=True, color=col, align="center")
    ox += bw + 12

# ── Footer ───────────────────────────────────────────────────────────────────
d.rectangle([(0, 530), (W, H)], fill=(15, 20, 36))
txt(d, W//2, 544, "MOVA Compliance Audit  ·  DOC-2026-0088  ·  2026-03-25  ·  Confidential", size=11, color=GRAY, align="center")

img.save("test_compliance_DOC-2026-0088.png", "PNG")
print("saved test_compliance_DOC-2026-0088.png")
