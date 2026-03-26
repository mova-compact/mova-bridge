"""Generate test PNG for mova-contract-generation skill."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 580
BG = (13, 17, 28)
PANEL = (20, 27, 45)
PANEL2 = (26, 35, 56)
WHITE = (220, 232, 255)
GRAY = (100, 120, 155)
ACCENT = (60, 130, 255)
GREEN = (40, 200, 100)
ORANGE = (230, 140, 30)
YELLOW = (240, 200, 50)
PURPLE = (160, 100, 255)

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
txt(d, 44, 16, "CONTRACT GENERATION REQUEST", size=21, bold=True, color=WHITE)
txt(d, W-44, 20, "MOVA HITL  ·  LEGAL REVIEW REQUIRED", size=13, bold=True, color=ACCENT, align="right")

# ── Meta row ──────────────────────────────────────────────────────────────────
d.rectangle([(0, 70), (W, 112)], fill=PANEL)
meta = [
    (44,  "Request ID:",    "CTG-2026-0017"),
    (240, "Date:",          "2026-03-25"),
    (390, "Document type:", "NDA"),
    (560, "Jurisdiction:",  "DE  (German law)"),
    (710, "Status:",        "DRAFT PENDING"),
]
for x, label, val in meta:
    txt(d, x, 82, label, size=12, color=GRAY)
    txt(d, x, 96, val,   size=12, bold=True, color=YELLOW if val == "DRAFT PENDING" else WHITE)

# ── Parties ───────────────────────────────────────────────────────────────────
d.rectangle([(40, 124), (W-40, 218)], fill=PANEL2)
txt(d, 58, 134, "CONTRACTING PARTIES", size=11, bold=True, color=GRAY)
hline(d, 152, 58, W-58, (40,55,85))

d.rectangle([(56, 160), (420, 208)], fill=(28, 38, 62))
txt(d, 68, 166, "PARTY A  —  DISCLOSING", size=11, bold=True, color=ACCENT)
txt(d, 68, 182, "Vortex Analytics GmbH", size=14, bold=True, color=WHITE)
txt(d, 68, 198, "HRB 112233  ·  Berlin, Germany", size=11, color=GRAY)

d.rectangle([(440, 160), (W-56, 208)], fill=(28, 38, 62))
txt(d, 454, 166, "PARTY B  —  RECEIVING", size=11, bold=True, color=PURPLE)
txt(d, 454, 182, "NordStern Capital AG", size=14, bold=True, color=WHITE)
txt(d, 454, 198, "CHE-112.345.678  ·  Zurich, Switzerland", size=11, color=GRAY)

# ── Document parameters ───────────────────────────────────────────────────────
d.rectangle([(40, 230), (W-40, 358)], fill=PANEL)
txt(d, 58, 240, "DOCUMENT PARAMETERS", size=11, bold=True, color=GRAY)
hline(d, 258, 58, W-58, (40,55,85))

params = [
    ("Effective date:",        "2026-04-01"),
    ("Confidentiality period:","3 years from signing"),
    ("Scope of disclosure:",   "AI product roadmap, pricing models, customer data architecture"),
    ("Permitted purpose:",     "Due diligence for potential Series B investment"),
    ("Governing law:",         "German law — Deutsches Recht (BGB)"),
    ("Dispute resolution:",    "Arbitration — DIS Rules, Frankfurt"),
]
y = 266
for label, val in params:
    txt(d, 58,  y, label, size=12, color=GRAY)
    txt(d, 268, y, val,   size=12, bold=True, color=WHITE)
    y += 18

# ── Sections to generate ──────────────────────────────────────────────────────
d.rectangle([(40, 370), (W-40, 468)], fill=PANEL2)
txt(d, 58, 380, "SECTIONS TO GENERATE  (each requires human approval)", size=11, bold=True, color=GRAY)
hline(d, 398, 58, W-58, (40,55,85))

sections = [
    ("1", "Definitions & Scope of Confidential Information"),
    ("2", "Obligations of Receiving Party"),
    ("3", "Permitted Disclosures & Exceptions"),
    ("4", "Term, Termination & Survival"),
    ("5", "Governing Law & Dispute Resolution"),
]
y = 406
for i, (num, title) in enumerate(sections):
    d.rectangle([(56, y), (76, y+16)], fill=ACCENT)
    txt(d, 66, y+1, num, size=10, bold=True, color=WHITE, align="center")
    txt(d, 84, y+1, title, size=12, color=WHITE)
    y += 20

# ── Decision options ──────────────────────────────────────────────────────────
d.rectangle([(40, 480), (W-40, 530)], fill=PANEL2)
txt(d, 58, 490, "PER-SECTION REVIEW OPTIONS:", size=12, bold=True, color=GRAY)
options = [
    ("approve_section",  GREEN),
    ("edit_section",     ACCENT),
    ("reject_section",   ORANGE),
    ("escalate",         PURPLE),
]
ox = 290
for opt, col in options:
    bw = len(opt) * 8 + 18
    d.rectangle([(ox, 486), (ox+bw, 510)], fill=(28, 38, 60), outline=col)
    txt(d, ox + bw//2, 490, opt, size=11, bold=True, color=col, align="center")
    ox += bw + 14

# ── Footer ────────────────────────────────────────────────────────────────────
d.rectangle([(0, 542), (W, H)], fill=(15, 20, 36))
txt(d, W//2, 556, "MOVA Contract Generation  ·  CTG-2026-0017  ·  2026-03-25  ·  Confidential", size=11, color=GRAY, align="center")

img.save("test_contract_gen_CTG-2026-0017.png", "PNG")
print("saved test_contract_gen_CTG-2026-0017.png")
