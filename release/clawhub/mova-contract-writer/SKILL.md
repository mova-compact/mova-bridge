---
name: mova-contract-writer
description: Translate a pre-contract (output of mova-intent-calibration) into a complete, valid MOVA contract — envelope, data schema references, instruction profile, and episode frame. Trigger when the user provides a pre-contract document and asks to generate a MOVA contract, formalize it, or turn it into executable form. Requires a completed pre-contract with status VALID.
license: MIT-0
---

# MOVA Contract Writer

Transform a fully calibrated pre-contract into a complete MOVA contract — structured JSON with envelope, instruction profile, and episode frame — ready for execution by any MOVA-compliant runtime.

## What this skill does

1. **Parses the pre-contract** — reads all sections produced by `mova-intent-calibration`
2. **Maps to MOVA constructs** — translates each pre-contract section into the correct MOVA artifact
3. **Drafts each artifact** — envelope (`env.*`), data schema references (`ds.*`), instruction profile, episode frame
4. **Human review gate** — each artifact is shown to the user for approval before the final contract is assembled
5. **Outputs the complete MOVA contract** — a single JSON document ready for submission to a MOVA runtime

## Requirements

- A completed pre-contract with `Status: VALID` from `mova-intent-calibration`
- MOVA spec available at `/home/mova/.openclaw/workspace/mova-spec/` for schema validation

## Pre-contract → MOVA mapping

| Pre-contract section | MOVA artifact | Notes |
|---------------------|--------------|-------|
| ACTOR (actor, owner, reason_now) | `env.*.roles[]` | actor = sender/initiator, owner = recipient/accountable |
| CHANGE DEFINITION (change_target, change_type, after_state) | `verb_id` in envelope | change_type maps to verb: action→create/update, state→route/record, result→analyze/publish |
| OBJECT (object_description, selection_rule) | `ds.*` schema reference + `input_data_refs[]` | describes what is being acted on |
| GOAL (goal_statement, verification_method, confirmation_owner) | Episode `result` contract | defines expected `result_status` and confirmation criteria |
| CONSTRAINTS (forbidden_action, invariant, unacceptable_consequence) | `ds.instruction_profile_core_v1` rules | each constraint → a `deny` or `transform` rule in instruction profile |
| SUCCESS/FAILURE states | Episode `result_status` allowed values | success → `completed`; failure → `failed`/`cancelled`/`partial` |
| DECISION POINTS (deterministic) | Inline in episode frame or envelope verb | deterministic rules go into policy; human decisions go to human gates |
| HUMAN GATES | `ds.instruction_profile_core_v1` HITL rules | `trigger_condition` maps to policy rule; pause execution and wait for human input |
| INPUTS (name, available, source) | `input_data_refs[]` + `input_envelopes[]` in episode | unavailable inputs → blocking dependency in instruction profile |
| DEPENDENCIES (name, type, blocking) | Instruction profile: `required_resources[]` or blocking rules | blocking deps → must be resolved before execution starts |
| ASSUMPTIONS | Episode `context` notes + instruction profile `on_violation` | blocking assumptions → deny rule; safe assumptions → warn rule |
| TIME LIMITS (deadline, max_attempts, stop_condition) | Instruction profile `limits` or episode `finished_at` constraint | encode as policy constraints |
| AMBIGUITIES | Annotation in `meta.ext` of the envelope | documented but not executable until resolved |
| LINEARITY CHECK | Validates that the episode frame has no hidden branches | non-linear → decision points must appear as explicit HITL gates |

## Verb selection guide

| Change type from pre-contract | Verb | Use when |
|-------------------------------|------|----------|
| Creating something new | `create` | after_state is a new record or artifact |
| Modifying existing data | `update` | after_state is a changed version of an existing record |
| Making a routing/selection decision | `route` | the task is choosing between options |
| Recording a fact or observation | `record` | the task produces an audit entry or episode |
| Publishing to a registry | `publish` | the task distributes a catalog or configuration |
| Analyzing data | `analyze` | the task produces findings, scores, or risk bands |
| Planning a sequence of steps | `plan` | the task produces a plan or strategy |
| Explaining a decision | `explain` | the task produces a human-readable justification |
| Summarizing content | `summarize` | the task condenses input into a shorter form |

## Step-by-step process

### Step 1 — Receive and validate the pre-contract

Ask: "Paste the pre-contract document (output of mova-intent-calibration)."

Check:
- Status must be `VALID` — if `BLOCKED`, stop here and tell the user to resolve the blocking items first
- All required sections must be present
- No unresolved blocking ambiguities

### Step 2 — Identify the core MOVA constructs

From the pre-contract, determine:

1. **Verb** — use the Verb selection guide above
2. **Envelope ID** — format: `env.[domain]_[operation]_v1` (e.g. `env.procurement_po_review_v1`)
3. **Primary data schema** — format: `ds.[domain]_[object]_v1` (e.g. `ds.procurement_po_v1`)
4. **Roles** — map actor → `initiator`, owner → `accountable`, confirmation_owner → `approver`
5. **Instruction profile ID** — format: `[domain]_policy_v1` (e.g. `procurement_po_policy_v1`)

Show the user this mapping and ask for confirmation before continuing.

### Step 3 — Draft the envelope

```json
{
  "envelope_id": "env.[domain]_[operation]_v1",
  "verb": "[verb from step 2]",
  "roles": {
    "initiator": "[actor from pre-contract]",
    "accountable": "[owner from pre-contract]",
    "approver": "[confirmation_owner from pre-contract]"
  },
  "payload": {
    "object_ref": {
      "data_type": "ds.[domain]_[object]_v1",
      "description": "[object_description from pre-contract]"
    }
  },
  "policy_profile_id": "[instruction profile ID]",
  "meta": {
    "reason": "[reason_now from pre-contract]",
    "goal": "[goal_statement from pre-contract]"
  }
}
```

Show to user. Ask to approve or edit.

### Step 4 — Draft the instruction profile

```json
{
  "schema_id": "ds.instruction_profile_core_v1",
  "profile_id": "[instruction profile ID]",
  "security_model_version": "mova_security_default_v1",
  "rules": [
    // One rule per CONSTRAINT from pre-contract
    {
      "rule_id": "constraint_[n]",
      "description": "[constraint statement]",
      "target": {
        "kind": "action",
        "verb_id": "[verb]"
      },
      "effect": "deny",   // deny for forbidden_action/unacceptable_consequence; warn for safe assumptions
      "condition": "[when this rule fires]",
      "rationale": "[why this constraint exists]"
    }
  ],
  "hitl_gates": [
    // One entry per HUMAN GATE from pre-contract
    {
      "gate_id": "gate_[n]",
      "trigger_condition": "[trigger_condition from pre-contract]",
      "question_for_human": "[question_for_human from pre-contract]",
      "valid_resolution_criteria": "[valid_resolution_criteria from pre-contract]",
      "on_no_response": "block"
    }
  ],
  "on_violation": "block"
}
```

Show to user. Ask to approve or edit.

### Step 5 — Draft the episode frame

```json
{
  "schema_id": "ds.mova_episode_core_v1",
  "episode_type": "execution/[domain]_[operation]",
  "mova_version": "6.0.0",
  "verb_id": "[verb from step 2]",
  "tool_id": 0,
  "executor": {
    "role": "ai_agent",
    "skill_id": "mova-contract-writer"
  },
  "input_envelopes": [
    { "envelope_type": "env.[domain]_[operation]_v1" }
  ],
  "input_data_refs": [
    // One entry per INPUTS REQUIRED that is available
    { "data_type": "ds.[domain]_[object]_v1", "data_id": "[from pre-contract inputs]" }
  ],
  "result_contract": {
    "success_statuses": ["completed"],
    "failure_statuses": ["failed", "cancelled"],
    "partial_allowed": [true/false from pre-contract partial_success_allowed],
    "verification_method": "[verification_method from pre-contract]",
    "confirmed_by": "[confirmation_owner from pre-contract]"
  },
  "context": {
    "assumptions": "[assumptions from pre-contract]",
    "ambiguities": "[any remaining ambiguities from pre-contract]"
  }
}
```

Show to user. Ask to approve or edit.

### Step 6 — Assemble and output the complete MOVA contract

When all three artifacts are approved, output the final contract:

```
MOVA CONTRACT  —  [task title from pre-contract]
Generated: [date]
Spec version: MOVA 6.0.0
Pre-contract: VALID

━━━ ENVELOPE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[envelope JSON]

━━━ INSTRUCTION PROFILE ━━━━━━━━━━━━━━━━━━━━━━
[instruction profile JSON]

━━━ EPISODE FRAME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[episode frame JSON]

━━━ CONTRACT SUMMARY ━━━━━━━━━━━━━━━━━━━━━━━━━
Verb:             [verb]
Envelope:         [envelope_id]
Policy profile:   [profile_id]
HITL gates:       [count]
Constraint rules: [count]
Open ambiguities: [count from pre-contract]
Status:           READY FOR EXECUTION / PENDING AMBIGUITY RESOLUTION
```

## Spec reference

All schema structures are validated against:
- `/home/mova/.openclaw/workspace/mova-spec/schemas/ds.mova_episode_core_v1.schema.json`
- `/home/mova/.openclaw/workspace/mova-spec/schemas/ds.instruction_profile_core_v1.schema.json`
- `/home/mova/.openclaw/workspace/mova-spec/docs/mova_core.md`
- `/home/mova/.openclaw/workspace/mova-spec/docs/mova_security_layer.md`

Use `mova-spec-guide` skill to look up any concept while drafting.

## Rules

- NEVER accept a pre-contract with status BLOCKED — stop and tell the user what to resolve first
- NEVER invent verb IDs, schema IDs, or policy values outside the MOVA verb catalog — read from spec
- NEVER skip the human review step for each artifact — the user must approve envelope, profile, and episode frame individually
- NEVER produce a contract with unresolved blocking ambiguities — mark it PENDING AMBIGUITY RESOLUTION
- If the pre-contract has optional sections marked not_required — omit the corresponding MOVA fields
- Generated IDs (envelope_id, profile_id, episode_type) follow MOVA naming conventions: lowercase, underscores, versioned with _v1
- tool_id = 0 unless the pre-contract specifies an external tool channel
