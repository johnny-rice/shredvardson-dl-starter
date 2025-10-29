# Implement Spec-Driven Workflow Commands

## Summary

Implement the missing `/specify`, `/plan`, and `/tasks` commands referenced in CLAUDE.md to enable automatic design discovery and spec-driven development workflows.

## Problem

**Current State:**

- ✅ prd-analyzer Skill has design discovery protocol documented
- ✅ CLAUDE.md references spec-driven workflow: `/specify` → `/plan` → `/tasks`
- ❌ These commands **don't exist** - only `/spec` (basic Skill invocation) exists
- ❌ No automatic lane detection (`lane: spec-driven`)
- ❌ Design discovery must be manually invoked

**Impact:**

- Users can't access the design discovery enhancement from Issue #209 Phase 2
- Spec-driven workflow in CLAUDE.md is broken
- Enhanced prd-analyzer capabilities are undiscoverable

## Solution

Create three missing commands that integrate prd-analyzer's design discovery protocol:

### 1. `/specify` Command

**Purpose:** Create new spec file with lane detection

**Behavior:**

- Prompt for feature name, priority, type
- Ask: "Is this complex/risky enough for spec-driven lane?" (yes/no)
- Create spec file with `lane: spec-driven` or `lane: fast` frontmatter
- Validate against YAML standards
- Output: spec file path

**Location:** `.claude/commands/spec/specify.md`

### 2. `/plan` Command

**Purpose:** Design planning with automatic discovery for spec-lane features

**Behavior:**

- Read spec file frontmatter
- Check `lane` field:
  - If `lane: spec-driven` → Trigger 3-phase design discovery (Understanding → Exploration → Design)
  - If `lane: fast` → Skip to basic planning
- Generate technical plan
- Create ADR if architectural decisions made
- Output: plan file, optional ADR

**Location:** `.claude/commands/spec/plan.md`

**Integration:** Uses prd-analyzer's design discovery protocol from SKILL.md

### 3. `/tasks` Command

**Purpose:** Generate implementation task breakdown

**Behavior:**

- Read spec and plan files
- Extract acceptance criteria
- Generate ordered task list with dependencies
- Estimate effort per task
- Flag risky tasks
- Output: tasks file

**Location:** `.claude/commands/spec/tasks.md`

**Integration:** Uses prd-analyzer's `breakdown` action

## Acceptance Criteria

- [ ] `/specify` creates spec with lane detection (interactive prompt)
- [ ] `/plan` automatically triggers design discovery for `lane: spec-driven`
- [ ] `/plan` skips discovery for `lane: fast` features
- [ ] `/tasks` generates task breakdown from spec+plan
- [ ] All three commands follow existing command YAML frontmatter standards
- [ ] Commands integrate with existing prd-analyzer Skill scripts
- [ ] CLAUDE.md workflow references remain valid
- [ ] Documentation updated with examples

## Implementation Plan

### Step 1: Create `/specify` Command

```yaml
---
name: '/specify'
version: '1.0.0'
lane: 'spec-driven'
skill: 'prd-analyzer'
---

Prompt:
1. Ask for feature name, type, priority
2. Decision: "Is this complex/risky? (auth, payments, db, multi-day)"
3. Set lane: spec-driven (yes) or lane: fast (no)
4. Create spec file with frontmatter
5. Validate with prd-analyzer
```

### Step 2: Create `/plan` Command

```yaml
---
name: '/plan'
version: '1.0.0'
lane: 'spec-driven'
skill: 'prd-analyzer'
---

Prompt:
1. Read spec frontmatter
2. Check lane field
3. If lane == 'spec-driven':
   - Phase 1: Understanding (AskUserQuestion pattern)
   - Phase 2: Exploration (2-3 options with trade-offs)
   - Phase 3: Design (incremental validation)
4. If lane == 'fast':
   - Basic planning only
5. Generate plan file
6. Create ADR if architecture decisions made
```

### Step 3: Create `/tasks` Command

```yaml
---
name: '/tasks'
version: '1.0.0'
lane: 'both'
skill: 'prd-analyzer'
---

Prompt:
1. Read spec and plan
2. Invoke prd-analyzer breakdown action
3. Generate task list with:
   - Dependencies
   - Effort estimates
   - Risk flags
4. Output tasks file
```

### Step 4: Integration Testing

Test full workflow:

```bash
/specify "Add payment processing"
→ Creates spec with lane: spec-driven

/plan specs/payment-processing.md
→ Triggers design discovery
→ 3-phase Socratic questioning
→ Creates plan + ADR

/tasks specs/payment-processing.md
→ Generates task breakdown
```

## Files to Create

1. `.claude/commands/spec/specify.md` - Spec creation with lane detection
2. `.claude/commands/spec/plan.md` - Planning with design discovery
3. `.claude/commands/spec/tasks.md` - Task breakdown generation

## Files to Update

1. `docs/ai/CLAUDE.md` - Ensure workflow references are accurate
2. `.claude/commands/QUICK_REFERENCE.md` - Add new commands
3. `.claude/skills/prd-analyzer/SKILL.md` - Document command integration points

## Out of Scope

- ❌ Changing prd-analyzer SKILL.md (already complete in #209)
- ❌ Modifying design discovery protocol (already documented)
- ❌ Creating new Skills (use existing prd-analyzer)

## Success Metrics

- [ ] Spec-driven workflow in CLAUDE.md is functional end-to-end
- [ ] Design discovery triggers automatically for spec-lane features
- [ ] Users can discover and use the enhanced prd-analyzer capabilities
- [ ] Commands follow progressive disclosure (low token overhead)
- [ ] Documentation is clear and includes examples

## References

- **Parent Issue:** #209 (Superpowers Integration)
- **prd-analyzer Skill:** `.claude/skills/prd-analyzer/SKILL.md`
- **CLAUDE.md Workflow:** `docs/ai/CLAUDE.md` lines 89-95
- **Design Discovery Protocol:** Issue #209 Phase 2

## Estimated Effort

**4-6 hours**

- `/specify`: 1-2 hours
- `/plan`: 2-3 hours (design discovery integration)
- `/tasks`: 1 hour
- Testing + documentation: 1 hour

## Priority

**P1** - High priority

**Reasoning:**

- CLAUDE.md references broken workflow
- Phase 2 enhancement from #209 is inaccessible
- Blocks spec-driven development for complex features
