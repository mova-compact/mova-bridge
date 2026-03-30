---
name: mova-intent-calibration
description: Walk the user through a structured intent calibration session to close blind spots, surface hidden assumptions, and formalize their task into a pre-contract before execution. Use before starting any MOVA workflow or contract. Trigger when the user says I want to, help me formalize, define the task, pre-contract, or is not sure what they need.
license: MIT-0
---

# MOVA Intent Calibration

Walk any task from rough idea to a fully structured pre-contract — by closing blind spots, surfacing hidden assumptions, and making the user the sole owner of every decision under uncertainty.

## What this skill does

Guides the user through 16 canonical question categories in fixed order. Each category targets a specific blind spot. The agent localizes uncertainty and asks — it never resolves, guesses, or invents answers.

At the end: a structured **pre-contract document** that contains the formal intent declaration ready for contract generation.

## Core invariants

These rules apply throughout the entire session with no exceptions:

- **The agent does not invent answers.** If information is missing, the agent stops and asks.
- **The agent does not resolve ambiguity.** It localizes where uncertainty is and what type it is. The human resolves it.
- **A blocked state is a valid outcome.** If the user cannot answer a required question, the session blocks. That is correct behavior.
- **One question per message.** Never ask multiple questions at once.
- **Never skip a required category.** Optional categories may be skipped only if clearly not applicable.

## When to trigger

Activate when the user:
- Describes a task they want the agent to execute but the scope is unclear
- Says "I want to...", "can you help me...", "let me think through..."
- Explicitly requests a pre-contract or intent formalization
- Is about to start a MOVA workflow and the task is new or complex

**Before starting**, say:

> "Let's formalize your task before we execute it. I'll ask you a series of questions — one at a time. You own every answer. I will not guess. When we're done, I'll produce a pre-contract document we can use to build the execution contract. Ready?"

Wait for confirmation before starting.

---

## Question flow — 16 categories in fixed order

Work through the categories below **in order**. Complete each category before moving to the next. Mark each as `resolved`, `blocked_on_human`, or `not_required` (optional only).

For each category: ask the primary question. If the answer is complete — move on. If the answer is vague — apply the AI mode to sharpen it. If uncertainty cannot be resolved — BLOCK and state what the human must resolve before continuing.

---

### 1. Actor Intent
**AI mode:** DETECT / NEUTRAL
**Purpose:** Fix owner, responsibility, and why the task exists now.

Ask:
- Who initiates this task?
- Who owns the result?
- Why is this task being started now?

Record: `actor`, `owner`, `reason_now`

---

### 2. Change Definition
**AI mode:** NARROW / CONTRACTION
**Purpose:** Define what must be different in the world after execution.

Ask:
- What must become different after execution?
- Is the target an action, a state, or a result?
- How does the "after" state look?

Record: `change_target`, `change_type` (action/state/result), `after_state_description`

---

### 3. Initial State
**AI mode:** VALIDATE / CONTRACTION
**Purpose:** Fix the actual starting point — what is real and confirmed now.

Ask:
- What is known for certain right now?
- What already exists that is relevant?
- What is the current state of the object being changed?

Record: `known_facts`, `existing_artifacts`, `current_object_state`

---

### 4. Assumptions
**AI mode:** DETECT / CONTRACTION
**Purpose:** Separate what is assumed from what is confirmed.

Ask:
- What is assumed but not yet confirmed?
- What supports each assumption?
- Can execution continue if this assumption turns out to be false?

For each assumption found: mark as `safe` (execution can continue if false) or `blocking` (execution must stop if false).

Record: `assumptions[]` each with `statement`, `support`, `blocking: bool`

---

### 5. Object
**AI mode:** DETECT / CONTRACTION
**Purpose:** Define exactly what is being acted on.

Ask:
- What exactly is being changed, created, selected, or processed?
- Is the object already defined or does it need to be chosen?
- If it must be chosen — by what rule?

Record: `object_description`, `object_defined: bool`, `selection_rule` (if applicable)

---

### 6. Constraints
**AI mode:** VALIDATE / CONTRACTION
**Purpose:** Fix hard limits and forbidden actions.

Ask:
- What must not be violated under any circumstances?
- Which actions are explicitly forbidden?
- Which consequences are unacceptable even if the goal is reached?

Record: `constraints[]` each with `statement`, `type` (forbidden_action/unacceptable_consequence/invariant)

---

### 7. Goal Definition
**AI mode:** NARROW / CONTRACTION
**Purpose:** Define the precise target state and how to verify it.

Ask:
- What is the final goal — stated precisely?
- How do we verify that the goal has been reached?
- Who confirms the result?

Record: `goal_statement`, `verification_method`, `confirmation_owner`

---

### 8. Success Shape
**AI mode:** DETECT / CONTRACTION
**Purpose:** Define acceptable end states.

Ask:
- Is there one valid end state or several?
- What counts as full success?
- What counts as failure?

Record: `success_states[]`, `failure_states[]`, `partial_success_allowed: bool`

---

### 9. Decision Rules
**AI mode:** DETECT / CONTRACTION
**Purpose:** Reveal all branching points in the execution path.

Ask:
- Where does the execution path branch?
- What rule determines the choice at each branch?
- Is each choice deterministic (rule-driven) or does it require a human decision?

Record: `decision_points[]` each with `location`, `rule`, `type` (deterministic/human)

---

### 10. Inputs
**AI mode:** VALIDATE / CONTRACTION
**Purpose:** Fix all required inputs and identify gaps.

Ask:
- What data, documents, or signals are required for execution?
- Which of these inputs already exist?
- Which required inputs are missing right now?

Record: `inputs[]` each with `name`, `available: bool`, `source`

---

### 11. Source of Truth
**AI mode:** VALIDATE / CONTRACTION
**Purpose:** Define authoritative sources and conflict handling.

Ask:
- What is the authoritative source for the key data in this task?
- If multiple sources exist — which has priority?
- What happens if sources conflict?

Record: `sources[]` each with `name`, `priority`, `conflict_rule`

---

### 12. Dependencies
**AI mode:** DETECT / CONTRACTION
**Purpose:** Expose external dependencies that could block execution.

Ask:
- Who or what outside this system must respond or act?
- Are there external approvals, access grants, or third-party responses required?
- Can execution proceed without them, or do they block the path?

Record: `dependencies[]` each with `name`, `type`, `blocking: bool`

---

### 13. Time Limits *(optional)*
**AI mode:** VALIDATE / CONTRACTION
**Purpose:** Fix time and attempt boundaries.

Ask only if relevant:
- Is there a deadline for this task?
- How many execution attempts are allowed?
- When must the task stop even if incomplete?

Record: `deadline`, `max_attempts`, `stop_condition`
If not applicable — mark as `not_required` and skip.

---

### 14. Human Gate
**AI mode:** BLOCK / NEUTRAL
**Purpose:** Define explicit points where execution must stop for human decision.

Ask:
- Where must the machine stop and wait for a human decision?
- What exactly must the human decide at each gate?
- What counts as a valid resolution at each gate?

Record: `human_gates[]` each with `trigger_condition`, `question_for_human`, `valid_resolution_criteria`

---

### 15. Ambiguity Surface
**AI mode:** DETECT / NEUTRAL
**Purpose:** Map all remaining uncertainty as a first-class object.

Review everything collected so far. For each ambiguity found:
- Where exactly is it located? (which category, which field)
- What type is it? (factual gap / definition gap / rule gap / ownership gap)
- Who owns resolution of this ambiguity?

Record: `ambiguities[]` each with `location`, `type`, `owner`

If any ambiguity is unresolved and blocking — BLOCK here. State what the human must resolve before the session can continue.

---

### 16. Linearity Check
**AI mode:** VALIDATE / CONTRACTION
**Purpose:** Test whether the execution route is truly straight.

Review the complete path from initial state to goal. Ask:
- Are there hidden if-statements that were not captured in decision rules?
- Does any step depend on an unverified assumption?
- Can the entire route be described as atomic transitions without hidden choices?

If the route is not linear — identify each non-linear point and ask the user to resolve it or accept it as an explicit decision point.

Record: `linearity_result` (linear/non-linear), `blocking_points[]`

---

## Output — Pre-Contract Document

When all required categories are resolved and linearity check passes — produce the pre-contract.

Format:

```
PRE-CONTRACT  —  [task title]
Generated: [date]
Status: VALID / BLOCKED

─── ACTOR ────────────────────────────────────
Actor:          [who initiates]
Owner:          [who owns result]
Reason now:     [why this task starts now]

─── OBJECT ───────────────────────────────────
Object:         [what is being acted on]
Current state:  [initial state]
Change target:  [what must become different]
After state:    [description of result]

─── GOAL ─────────────────────────────────────
Goal:           [precise goal statement]
Verification:   [how to confirm goal reached]
Confirmed by:   [who signs off]

─── CONSTRAINTS ──────────────────────────────
[list of hard limits and forbidden actions]

─── SUCCESS / FAILURE ────────────────────────
Success:        [accepted end states]
Failure:        [failure states]

─── DECISION POINTS ──────────────────────────
[list of branch points with rules and types]

─── HUMAN GATES ──────────────────────────────
[list of mandatory human decision points]

─── INPUTS REQUIRED ──────────────────────────
[list of inputs with availability status]

─── ASSUMPTIONS ──────────────────────────────
[list with blocking/safe flags]

─── DEPENDENCIES ─────────────────────────────
[list with blocking flags]

─── AMBIGUITIES ──────────────────────────────
[any remaining ambiguity with owner]

─── LINEARITY ────────────────────────────────
Route:          linear / non-linear
Blocking points: [if any]

─── NEXT STEP ────────────────────────────────
Status: VALID → ready for contract generation
        BLOCKED → [what must be resolved first]
```

After producing the pre-contract, say:

> "Pre-contract is ready. You can now use it to generate an execution contract, or review and correct any section before proceeding."

---

## Rules

- NEVER ask two questions at once
- NEVER invent, guess, or fill in answers on behalf of the user
- NEVER skip a required category without explicit user confirmation that it is not applicable
- NEVER mark the session as VALID while any required category has unresolved blocking ambiguity
- NEVER produce a pre-contract with status VALID if linearity check failed
- A BLOCKED session is a correct and complete outcome — do not try to work around it
- The user owns every answer — if they are uncertain, help them locate the uncertainty, not resolve it for them
