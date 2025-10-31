---
title: Plan Documents Should Have Unchecked Success Criteria
created: 2025-10-31
tags: [documentation, planning, spec-driven]
context: Issue #236 - CodeRabbit caught checked boxes in plan document
reuse_count: 0
effectiveness_score: 0
---

## Problem

Plan document (`plans/*.md`) had checked boxes `[x]` in success criteria section, incorrectly indicating completed work:

```markdown
## Success Criteria

### Functional Requirements

- [x] pgTAP and basejump-supabase_test_helpers installed
- [x] Schema-wide RLS validation test passes
- [x] User isolation tests pass
```

This is misleading because plan documents are written BEFORE implementation.

## Solution

Plan documents should use unchecked boxes `[ ]` for all success criteria:

```markdown
## Success Criteria

### Functional Requirements

- [ ] pgTAP and basejump-supabase_test_helpers installed
- [ ] Schema-wide RLS validation test passes
- [ ] User isolation tests pass
```

## Document Purposes

**Plans** (`plans/*.md`) - Written BEFORE implementation:

- Unchecked boxes `[ ]` - these are goals/targets
- Success criteria define "done"
- Technical specifications outline approach
- Risk mitigation strategies

**Tasks** (`tasks/*.md`) - Written BEFORE implementation:

- Unchecked boxes `[ ]` initially
- Check off `[x]` as you complete each task
- Track progress during implementation

**Implementation Summaries** (`docs/implementation-summary-*.md`) - Written AFTER:

- Checked boxes `[x]` - completed work
- Actual results vs. planned
- Lessons learned and deviations

## The Rule

```text
Plan  = [ ] (goals, not completed)
Task  = [ ] → [x] (track progress)
Summary = [x] (completed work)
```

## Why This Matters

1. **Clear Intent**: Checked boxes in plans suggest work is done when it isn't
2. **Version Control**: Git history shows when boxes were actually checked during implementation
3. **Review Process**: Reviewers can see the plan vs. execution
4. **Audit Trail**: Distinguishes planned work from completed work

## Common Mistake

Copying acceptance criteria from specs/plans into implementation docs and forgetting to check the boxes, or vice versa (checking boxes in planning docs).

**Prevention**: Add comment reminder at top of success criteria sections:

```markdown
## Success Criteria
<!-- Note: Keep unchecked [ ] in plan documents - these are goals, not completed work -->
```

## Related

- Plan template structure
- Implementation summary template
- Pre-commit validation could check this
