# Deploying Skills to OpenClaw — Checklist

Lessons learned from deploying `mova-invoice-ocr`. Follow this exactly for every new skill.

---

## 1. SKILL.md format

### Frontmatter rules

- `metadata` **must be a single-line JSON string** — the OpenClaw parser does not support multi-line YAML for metadata
- **Do NOT add `requires.bins`** — OpenClaw gates skill loading on binary checks; if the binary isn't found in expected dirs the skill shows `✗ missing` and never loads
- `description` can use YAML `>` multi-line scalar — that's fine

```yaml
---
name: my-skill-name
description: One sentence trigger description. Include key trigger phrases so the agent knows when to activate.
license: MIT-0
---

# Skill instructions here...
```

**NOT like this (will break):**
```yaml
# WRONG — multi-line metadata breaks the parser
metadata:
  openclaw:
    requires:
      bins:
        - name: my-binary   ← skill will show ✗ missing and never load
```

### Instructions body

- Write plain markdown — the agent reads this as natural language
- Show exec commands in indented code blocks (4 spaces), not fenced ` ``` `
- Add explicit rules at the bottom: what NOT to do (no HTTP, no bash wrapping, no invented results)

---

## 2. Binary (CLI tool) setup on server

The binary must be in a standard system PATH directory, not just a venv:

```bash
# Install the package
pip install my-package --target /home/mova/.mova-venv/...
# OR install in venv
/home/mova/.mova-venv/bin/pip install my-package

# Create symlink in /usr/local/bin (standard PATH, always found)
sudo ln -s /home/mova/.mova-venv/bin/my-binary /usr/local/bin/my-binary

# Verify
which my-binary   # should return /usr/local/bin/my-binary
```

Why symlink matters: OpenClaw exec wraps commands in `sh -lc`. When the agent uses `bash -lc '...'`, the inner bash loads `/etc/profile` which may reset PATH and drop the venv. `/usr/local/bin` is always in the default PATH.

---

## 3. openclaw.json — exec config

Add the binary to `safeBins` and `safeBinTrustedDirs`:

```json
"tools": {
  "exec": {
    "security": "allowlist",
    "ask": "off",
    "pathPrepend": ["/home/mova/.mova-venv/bin"],
    "safeBins": ["my-binary"],
    "safeBinTrustedDirs": ["/usr/local/bin", "/home/mova/.mova-venv/bin"],
    "safeBinProfiles": {
      "my-binary": {}
    }
  }
}
```

If `safeBinTrustedDirs` is missing, OpenClaw doctor will warn:
> `tools.exec.safeBins entry 'my-binary' resolves to '/usr/local/bin/my-binary' outside trusted safe-bin dirs`

---

## 4. Skill file location

Put the skill in **workspace/skills** — this has the highest priority:

```
~/.openclaw/workspace/skills/my-skill-name/SKILL.md   ← USE THIS
~/.openclaw/skills/my-skill-name/SKILL.md              ← lower priority, also works
```

```bash
mkdir -p /home/mova/.openclaw/workspace/skills/my-skill-name
cp SKILL.md /home/mova/.openclaw/workspace/skills/my-skill-name/SKILL.md
```

---

## 5. Verify the skill loaded

```bash
# Check skill status — must show ✓ ready
openclaw skills list | grep my-skill-name

# Full diagnostics
openclaw doctor
```

Expected output:
```
Skills (N/53 ready)
│ ✓ ready  │ 📦 my-skill-name  │ ...description...  │ openclaw-workspace │
```

If it shows `✗ missing`:
- Check for `requires.bins` in frontmatter → remove it
- Check binary symlink → `which my-binary`
- Check `safeBinTrustedDirs` in openclaw.json

---

## 6. Apply changes

```bash
# After any change to SKILL.md or openclaw.json:
sudo systemctl restart openclaw

# After restart, the user must start a NEW session in the chat:
# Send: /new
# Sessions are snapshotted at start — old sessions don't see skill updates
```

---

## 7. How exec works (important for writing instructions)

OpenClaw exec already wraps commands in `sh -lc`. So tell the agent:

```
# RIGHT — exec runs this directly:
mova-bridge call mova_hitl_start --file-url URL

# WRONG — double shell wrapping breaks PATH:
bash -lc 'mova-bridge call mova_hitl_start --file-url URL'
```

Add this to SKILL.md and soul.md explicitly. LLMs tend to wrap in bash by default.

---

## 8. soul.md — system prompt

Keep soul.md in sync with the skill. Key rules to always include:

```markdown
## CRITICAL
- Run exec commands directly: my-binary call ... (NOT wrapped in bash or sh)
- NEVER make HTTP requests manually
- NEVER invent or simulate results — if exec fails, show the exact error
```

File location: `/home/mova/.openclaw/soul.md`

---

## Quick deploy checklist

```
[ ] SKILL.md frontmatter: single-line metadata, no requires.bins
[ ] Binary symlinked to /usr/local/bin/
[ ] openclaw.json: safeBins + safeBinTrustedDirs updated
[ ] Skill copied to workspace/skills/<name>/SKILL.md
[ ] openclaw restarted: sudo systemctl restart openclaw
[ ] Skill verified: openclaw skills list | grep <name>  → ✓ ready
[ ] User sends /new in chat to start fresh session
```
