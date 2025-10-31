---
title: ADR Compliance - When to Use override:adr Label
created: 2025-10-31
tags: [adr, ci, workflow, architecture]
context: Issue #236 - Adding pgTAP test step to CI workflow
reuse_count: 0
effectiveness_score: 0
---

## Problem

Modified `.github/workflows/ci.yml` to add pgTAP test step. GitHub CI failed with:

```text
ADR Compliance: PR modifies 1 files requiring ADR documentation but no ADR reference found
💡 Add ADR reference (ADR-XXX) to PR description or use override:adr label for emergencies
```

## Solution

Use `override:adr` label when the change is incremental and doesn't require architectural documentation:

```bash
gh pr edit <PR_NUMBER> --add-label "override:adr"
```

## When to Use Override Label

✅ **Use `override:adr` for:**

- Incremental additions that follow existing patterns
- Adding a new CI step using established architecture
- Configuration changes that don't introduce new decisions
- Extending existing functionality without changing approach
- Emergency hotfixes (temporary, document later)

❌ **Do NOT use `override:adr` for:**

- New architectural patterns or approaches
- Changes that evaluate multiple alternatives
- Decisions that could impact future work
- Changes that establish new conventions
- Major refactors or redesigns

## Example: When Override is Appropriate

**Scenario**: Adding pgTAP test step to CI workflow

**Why override is OK:**

1. Mirrors existing `db:validate:rls` step architecture
2. No new architectural decision - just extending test suite
3. No alternatives were evaluated - straightforward addition
4. Follows established CI step patterns
5. Doesn't affect how tests are structured or run

**Alternative (if ADR was needed)**: Would document "Decision to add database-level testing layer", evaluate alternatives (pgTAP vs alternatives), and explain tradeoffs.

## ADR vs Override Decision Tree

```text
Change requires modifying infrastructure files?
├─ YES → Does it introduce a NEW pattern/approach?
│  ├─ YES → Write ADR
│  └─ NO → Incremental addition following existing pattern?
│     ├─ YES → Use override:adr label
│     └─ NO → Write ADR
└─ NO → No ADR needed
```

## Files That Trigger ADR Check

From `scripts/starter-doctor.ts`:

- `.github/workflows/*.yml`
- `lefthook.yml`
- `.claude/**/*`
- `scripts/ci/**/*`
- `docs/llm/**/*`

## Related

- ADR template: `docs/adr/` directory
- Doctor script: `scripts/starter-doctor.ts` (search for "ADR Compliance")
- Override label is tracked in CI logs for audit trail
