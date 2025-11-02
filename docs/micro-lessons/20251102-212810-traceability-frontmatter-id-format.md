# Traceability Frontmatter Requires Specific ID Format and Hierarchy

**Severity:** normal
**UsedBy:** 0
**Created:** 2025-11-02
**Context:** PR #265 - Fixing CI traceability validation failures
**Branch:** feature/263-socratic-planning-confidence-levels

## Problem

Traceability validation (`pnpm tsx scripts/validate-traceability.ts`) was failing with multiple errors when trying to validate spec/plan/task frontmatter:

```text
❌ Traceability validation failed:
  - 263-socratic-planning-confidence-levels.md: Missing required fields: id
  - Expected type 'spec', got 'enhancement'
  - Failed to parse: data.id.startsWith is not a function
  - plan must have parentId
  - task must have parentId
```

## Rule

**Traceability frontmatter requires string IDs with prefixes ("SPEC-", "PLAN-", "TASK-"), correct type values, and explicit parent-child hierarchy via parentId fields.**

## Context

The traceability system enforces a strict hierarchy:

1. **Specs** are the top-level documents (no parent)
2. **Plans** derive from specs (must reference parent spec)
3. **Tasks** derive from plans (must reference parent plan)

Each document type has specific requirements:

- IDs must be **strings** (not numbers) with type-specific prefixes
- Type field must match the document category exactly
- Child documents must declare their `parentId` to establish the chain

## Solution

### Spec File (`specs/XXX.md`)

```yaml
---
id: "SPEC-263"
type: spec
issue: 263
title: "Add confidence levels to Socratic planning"
priority: p2
status: ready
lane: spec-driven
---
```

### Plan File (`plans/XXX.md`)

```yaml
---
id: "PLAN-263"
type: plan
issue: 263
parentId: "SPEC-263"
title: "Add Confidence Levels - Implementation Plan"
spec: specs/263-socratic-planning-confidence-levels.md
lane: spec-driven
created: 2025-01-02
status: draft
---
```

### Tasks File (`tasks/XXX.md`)

```yaml
---
id: "TASK-263"
type: task
issue: 263
parentId: "PLAN-263"
title: "Add Confidence Levels - Task Breakdown"
spec: specs/263-socratic-planning-confidence-levels.md
plan: plans/263-socratic-planning-confidence-levels.md
created: 2025-01-02
status: ready
total_estimate: 24h
---
```

## Validation

Run the traceability validator to verify all chains:

```bash
pnpm tsx scripts/validate-traceability.ts
```

Expected output when valid:

```text
🔗 Traceability Validation Summary

📋 Specs: 15
🗺️  Plans: 13
✅ Tasks: 11
🔢 Total Issues: 15

✅ All traceability chains are valid
```

## Guardrails

**Common mistakes to avoid:**

1. ❌ Using numeric IDs: `id: 263` → ✅ Use string with prefix: `id: "SPEC-263"`
2. ❌ Wrong type values: `type: enhancement` → ✅ Use exact type: `type: spec`
3. ❌ Plural types: `type: tasks` → ✅ Use singular: `type: task`
4. ❌ Missing parentId in plans/tasks → ✅ Always include `parentId: "SPEC-XXX"` or `parentId: "PLAN-XXX"`
5. ❌ Mismatched prefixes: Plan with `id: "SPEC-263"` → ✅ Use correct prefix: `id: "PLAN-263"`

**ID prefix mapping:**

- Specs: `SPEC-XXX`
- Plans: `PLAN-XXX`
- Tasks: `TASK-XXX`

**Type values (exact match required):**

- Specs: `type: spec`
- Plans: `type: plan`
- Tasks: `type: task`

## Related Files

- `scripts/validate-traceability.ts` - Validation script that enforces these rules
- `specs/263-socratic-planning-confidence-levels.md` - First implementation using correct format
- `specs/integrate-sub-agents-workflow-commands.md` - Another example with correct format

## Tags

**Tags:** #traceability #frontmatter #yaml #spec-driven #validation #ci #documentation
