# Traceability Validation: Plans Require Parent Specs

## Context

**Issue:** PR #312 failed doctor check due to traceability validation errors
**Branch:** `claude/create-secure-prompting-guidelines-011CUtjhDQ2qi7e74tYkxKzz`
**Files Changed:** `specs/250-secure-prompting-guidelines.md`, `specs/292-auth-module-mvp.md`

**Problem:**
When running `pnpm tsx scripts/validate-traceability.ts`, got errors:

1. `250-secure-prompting-guidelines.md: Expected type 'spec', got 'docs'`
2. `Plan PLAN-292 references non-existent spec: SPEC-292`
3. `Issue #292 has plans/tasks but no spec`

The traceability system enforces strict parent-child relationships between specs, plans, and tasks.

## Rule

**Plans MUST have a `parentId` pointing to an existing spec.** Issues with plans or tasks MUST have at least one spec file. Always check `scripts/validate-traceability.ts` to understand validation requirements before creating plans or tasks.

## Example

### ❌ Before (Invalid)

```yaml
# plans/292-auth-module-mvp.md
---
id: PLAN-292
type: plan
issue: 292
parentId: SPEC-292  # ← Spec doesn't exist!
---
```

```yaml
# specs/250-secure-prompting-guidelines.md
---
id: SPEC-250
type: docs  # ← Wrong type!
---
```

### ✅ After (Valid)

```yaml
# specs/292-auth-module-mvp.md (NEW FILE CREATED)
---
id: SPEC-292
type: spec
issue: 292
# No parentId - specs are top-level
---
```

```yaml
# specs/250-secure-prompting-guidelines.md
---
id: SPEC-250
type: spec  # ← Fixed type
issue: 250
---
```

```yaml
# plans/292-auth-module-mvp.md
---
id: PLAN-292
type: plan
issue: 292
parentId: SPEC-292  # ← Now valid!
---
```

## Validation Rules

**Key requirements from `scripts/validate-traceability.ts`:**

```typescript
// Line 114-116: Plans MUST have parentId
if (expectedType !== 'spec' && !data.parentId) {
  this.errors.push(`${filename}: ${expectedType} must have parentId`);
}

// Line 134-137: Plan parentIds must reference existing specs
if (!this.graph.specs.has(plan.parentId)) {
  this.errors.push(`Plan ${planId} references non-existent spec: ${plan.parentId}`);
}

// Line 176-177: Issues with plans/tasks MUST have a spec
if (group.specs.length === 0) {
  this.errors.push(`Issue #${issue} has plans/tasks but no spec`);
}
```

## Guardrails

- **Before creating plans:** Check if parent spec exists; create spec first if missing
- **When fixing traceability errors:** Read the validation script to understand exact requirements
- **Spec types:** Must be `type: spec`, not `type: docs` or any other value
- **Hierarchy:** Specs → Plans → Tasks (each level must reference parent)
- **Validation command:** Run `pnpm tsx scripts/validate-traceability.ts` before committing

## Resolution Steps

1. Run validation to see exact errors: `pnpm tsx scripts/validate-traceability.ts`
2. For missing specs: Create spec file with proper frontmatter (`type: spec`, no `parentId`)
3. For wrong types: Fix `type` field to match expected value
4. For broken references: Ensure `parentId` points to existing artifact
5. Re-run validation to confirm all chains are valid
6. Commit fixes and push to trigger CI re-run

**Severity:** normal
**UsedBy:** 0
**Tags:** #traceability, #validation, #specs, #plans, #ci, #documentation, #git, #yaml
