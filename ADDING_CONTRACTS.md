# Adding a New Contract to MOVA

Step-by-step guide for adding a new HITL contract type — from server endpoint to published skill and plugin.

---

## Overview

Each MOVA contract type has three components:

| Component | Location | Purpose |
|---|---|---|
| Server endpoint | `src/mova_bridge/server.py` | Contract logic, AI tasks, audit |
| Plugin tool | `openclaw-plugin/src/index.ts` | Native OpenClaw tool the agent calls |
| Skill | `release/clawhub/mova-XXX/SKILL.md` | Instructions for the agent + ClawhHub listing |

---

## Step 1 — Add the server endpoint

In `src/mova_bridge/server.py`, add a new route:

```python
@app.post("/api/v1/contracts/hitl/start-xxx")
async def hitl_start_xxx(req: XxxRequest, api_key: str = Depends(verify_key)):
    # build and run the contract
    ...
```

Define the Pydantic model for the request, implement the contract steps (AI task → verification → decision point), and register the route. Follow the existing patterns in `server.py` (e.g., `start_po`, `start_trade`).

Test locally:
```bash
cd src/mova_bridge
uvicorn server:app --reload
curl -X POST http://localhost:8000/api/v1/contracts/hitl/start-xxx \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"xxx_id": "XXX-001", ...}'
```

---

## Step 2 — Add the tool to the OpenClaw plugin

Open `openclaw-plugin/src/index.ts` and add a new `api.registerTool(...)` block inside the `register(api)` function:

```typescript
api.registerTool({
  name: "mova_hitl_start_xxx",
  label: "MOVA: Submit XXX",
  description: "One-sentence description of what this tool does and when to call it.",
  parameters: Type.Object({
    xxx_id: Type.String({ description: "XXX identifier, e.g. XXX-2026-001" }),
    // ... other fields
  }),
  async execute(_id, p) {
    return toolResult(await movaPost(cfg(), "/api/v1/contracts/hitl/start-xxx", p));
  },
});
```

**Rules for parameters:**
- Use `Type.String`, `Type.Number`, `Type.Boolean`, `Type.Union`, `Type.Array`, `Type.Optional`
- Always add `description` strings — the agent uses them to fill values correctly
- Optional fields: wrap in `Type.Optional(...)`

---

## Step 3 — Rebuild and bump the plugin version

**Bump the version** in `openclaw-plugin/package.json`:
```json
"version": "0.2.0"
```

**Rebuild the bundle:**
```bash
cd openclaw-plugin
node node_modules/esbuild/bin/esbuild src/index.ts \
  --bundle \
  --external:openclaw \
  --format=esm \
  --platform=node \
  --outfile=dist/index.js
```

**Repack:**
```bash
npm pack
# produces openclaw-mova-0.2.0.tgz
```

**Copy to docs for GitHub Pages:**
```bash
cp openclaw-mova-0.2.0.tgz ../docs/
```

**Commit and push:**
```bash
cd ..
git add openclaw-plugin/package.json openclaw-plugin/dist/ docs/openclaw-mova-0.2.0.tgz
git commit -m "feat(plugin): add mova_hitl_start_xxx tool, bump to 0.2.0"
git tag plugin-v0.2.0
git push && git push origin plugin-v0.2.0
```

---

## Step 4 — Republish the plugin to ClawhHub

1. Go to **clawhub.ai/publish-plugin**
2. Upload `openclaw-mova-0.2.0.tgz`
3. Fill in:
   - **Список изменений:** what was added
   - **Исходный коммит:** full commit SHA (`git rev-parse plugin-v0.2.0`)
   - **Ссылка на источник:** `https://github.com/mova-compact/mova-bridge/tree/plugin-v0.2.0/openclaw-plugin`
4. Publish

Users update the plugin with:
```bash
openclaw plugins update mova
```

---

## Step 5 — Write the skill

Create `release/clawhub/mova-xxx/SKILL.md`. Use an existing skill as a template (e.g., `mova-po-approval/SKILL.md`).

Key sections:
- **Frontmatter**: `name`, `description` (trigger phrases for the agent), `license: MIT-0`, `metadata` (single-line JSON with plugin info)
- **What it does**: numbered steps
- **Step 1** — what parameters to pass to `mova_hitl_start_xxx`
- **Step 2** — how to show analysis, what options exist, call `mova_hitl_decide`
- **Step 3** — call `mova_hitl_audit` + `mova_hitl_audit_compact`
- **Connect your real systems** — list relevant connector IDs
- **Rules** — NEVER make HTTP requests manually, NEVER invent results, CONTRACT_ID comes from start response

**Frontmatter metadata template:**
```yaml
metadata: {"openclaw":{"primaryEnv":"MOVA_API_KEY","plugin":{"name":"MOVA","installCmd":"openclaw plugins install openclaw-mova","configKey":"plugins.entries.mova.config.apiKey"},"dataSentToExternalServices":[{"service":"MOVA API (api.mova-lab.eu)","data":"..."}]}}
```

---

## Step 6 — Publish the skill to ClawhHub

```bash
cd release/clawhub/mova-xxx
clawhub publish . --slug mova-xxx --name "MOVA XXX" --version 1.0.0
```

Or use `clawhub sync --all` to publish all skills at once.

---

## Quick checklist

```
[ ] server.py: new POST endpoint /api/v1/contracts/hitl/start-xxx
[ ] index.ts: new api.registerTool({ name: "mova_hitl_start_xxx", ... })
[ ] package.json: version bumped
[ ] esbuild: dist/index.js rebuilt
[ ] npm pack: new tgz created and copied to docs/
[ ] git: committed + tagged plugin-vX.Y.Z + pushed
[ ] ClawhHub: plugin republished with new tgz
[ ] SKILL.md: written in release/clawhub/mova-xxx/
[ ] ClawhHub: skill published with clawhub publish
```

---

## Plugin config reference

The plugin reads API key from OpenClaw config:
```
plugins.entries.mova.config.apiKey   — MOVA API key (required)
plugins.entries.mova.config.baseUrl  — override API base URL (default: https://api.mova-lab.eu)
```

Users set the key once:
```bash
openclaw config set plugins.entries.mova.config.apiKey sk-...
```

All `mova_hitl_*` tools share this config — no per-tool credentials needed.
