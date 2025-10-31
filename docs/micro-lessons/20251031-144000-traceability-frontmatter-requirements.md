---
title: Traceability Frontmatter Requirements (ID Prefixes and ParentIDs)
created: 2025-10-31
tags: [traceability, validation, frontmatter, spec-driven]
context: Issue #236 - Adding pgTAP RLS testing
reuse_count: 0
effectiveness_score: 0
---

## Problem

Created spec/plan/task files for Issue #236 but traceability validation failed with errors:

- "Missing required fields: id, type, issue"
- "Expected type 'spec', got 'feature'"
- "ID must start with 'SPEC-', got 'add-pgtap-rls-testing'"
- "plan must have parentId"

## Solution

Traceability files require specific frontmatter structure:

**Specs** (`specs/*.md`):

```yaml
---
id: SPEC-<descriptive-name>  # Must start with SPEC-
title: Feature name
type: spec                    # Must be 'spec' (not 'feature')
priority: p0|p1|p2
status: draft|ready|in-progress|completed
lane: simple|spec-driven
issue: 123                    # GitHub issue number
plan: plans/<filename>.md
tasks: tasks/<filename>.md
created: YYYY-MM-DD
---
```

**Plans** (`plans/*.md`):

```yaml
---
id: PLAN-<descriptive-name>   # Must start with PLAN-
parentId: SPEC-<descriptive-name>  # Links to parent spec
title: Feature name - Implementation Plan
type: plan                     # Must be 'plan'
spec: specs/<filename>.md
issue: 123
lane: spec-driven
created: YYYY-MM-DD
status: draft
---
```

**Tasks** (`tasks/*.md`):

```yaml
---
id: TASK-<descriptive-name>   # Must start with TASK-
parentId: PLAN-<descriptive-name>  # Links to parent plan
title: Feature name - Task Breakdown
type: task                     # Must be 'task'
spec: specs/<filename>.md
plan: plans/<filename>.md
issue: 123
created: YYYY-MM-DD
status: ready
total_estimate: 4h
---
```

## Key Points

1. **ID Prefixes Matter**: Each artifact type requires specific prefix (SPEC-, PLAN-, TASK-)
2. **Type Field**: Must match artifact type (spec/plan/task), NOT feature type
3. **ParentID Chain**: Plans link to specs, tasks link to plans
4. **Issue Number**: Required in all three files for full traceability
5. **Validation Script**: Run `pnpm tsx scripts/validate-traceability.ts` before committing

## Why This Matters

The traceability system establishes a complete chain from issue → spec → plan → tasks. This enables:

- Automated validation that nothing is orphaned
- Bidirectional navigation in documentation
- Coverage analysis (which issues have complete chains)
- CI/CD enforcement of spec-driven workflow

## Related

- Validation script: `scripts/validate-traceability.ts`
- Error patterns to watch for: Missing parentId, wrong type field, missing ID prefix
- Run validation in pre-commit hook to catch early
