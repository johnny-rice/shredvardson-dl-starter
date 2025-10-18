# Epic System

Minimal hierarchy for organizing work in GitHub Issues.

## Overview

We use GitHub Issues as our primary unit of work tracking. To show hierarchy and relationships, we use one additional concept: **Epics**.

**Epic** = Multi-issue initiative (>3 days work OR spawns multiple PRs)

## Decision Tree

```
Is this >3 days of work OR spawns multiple PRs?
├─ YES → Create Epic Issue (label: epic)
│         - Body contains checklist linking to sub-issues
│         - Sub-issues reference "Parent Epic: #123" in body
│
└─ NO → Create regular Issue
         - Spec Lane (complex) OR Simple Lane (straightforward)
```

## Labels

### Epic & Lane Labels

- `epic` - Multi-issue initiative (>3 days work)
- `spec-lane` - Complex work requiring specification
- `simple-lane` - Straightforward implementation

### Status Labels

- `blocked` - Work is blocked by external dependency

### Domain Labels (add as needed)

- `db` - Database-related work
- `auth` - Authentication-related
- `ui` - User interface work
- `ci` - CI/CD and automation
- etc.

## Epic Format

**Title:** `Epic: [Brief Description]`

**Body:**

```markdown
# Epic: [Name]

[Brief description of the epic goal]

## Goal

[1-2 paragraphs explaining what we're building and why]

## Sub-Issues

### Phase 1: [Phase Name] (Priority)

- [ ] #123 - Issue title (~Xh estimate)
- [ ] #124 - Issue title (~Xh estimate)

### Phase 2: [Phase Name] (Priority)

- [ ] #125 - Issue title (~Xh estimate)

## Total Effort

**Critical Path:** ~X-Y hours
**Timeline:** X weeks

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Reference

- Link to research/specs/docs if relevant
```

**Example:** [#151 - Epic: Complete Design System](https://github.com/Shredvardson/dl-starter/issues/151)

## Regular Issue Format

**Title:** Clear, actionable description

**Body:**

- Problem statement
- Proposed solution
- Success criteria
- Implementation plan
- If part of Epic: `**Parent Epic:** #123` at end

## Lane Selection

### Spec Lane (Complex)

Use when:

- Novel architecture or design decisions
- Multiple approaches to consider
- Significant risk or unknowns
- Needs formal specification before implementation

### Simple Lane (Straightforward)

Use when:

- Clear path to implementation
- Well-understood problem
- Tactical, focused work
- Can start coding immediately

See [CLAUDE.md](../CLAUDE.md) for detailed lane decision rules.

## Workflow

### Creating an Epic

1. Identify multi-issue work (>3 days OR multiple PRs)
2. Create Epic issue with `epic` label
3. Create sub-issues for each phase/component
4. Link sub-issues to Epic in their bodies
5. Track progress via Epic checklist

### Working on Sub-Issues

1. Pick issue from Epic
2. Follow normal dev lane workflow (spec or simple)
3. Reference Epic in commits/PRs if relevant
4. Check off item in Epic when complete

### Closing an Epic

- Close Epic when all sub-issues are complete
- Epic remains as historical record

## GitHub Projects (Optional)

We use GitHub's native Projects for kanban view:

**Columns:**

- **Backlog** - Todo
- **Active** - In progress (limit to 1-2 items)
- **Done** - Closed issues (auto-populated)

**Rules:**

- Only work on 1-2 Active items at a time
- Active column = priority
- No complex automations - built-in "set status on close" sufficient

## What We DON'T Use

❌ Start/Target dates - Work until done
❌ Owner field - Always you (for now)
❌ Priority field - Active column = priority
❌ Roadmap view - Milestones + Epics provide this
❌ Effort estimates - Unreliable, use ranges (~X-Y hours)
❌ Complex automations - Keep it simple

## Examples

### Epic: Complete Design System (#151)

- **Epic Issue**: #151
- **Sub-Issues**: #145, #146, #147, #148, #149
- **Phases**: 3 phases (Designer Value, Code Quality, Protection)
- **Total Effort**: ~39-43 hours

### Regular Issue: Add UX Pattern Documentation (#145)

- **Type**: Regular issue (part of Epic #151)
- **Lane**: Spec lane (requires design decisions)
- **Parent**: Epic #151

## Migration from roadmap.md

The old `roadmap.md` has been replaced by:

1. **Epics** - For multi-issue initiatives
2. **Milestones** - For time-based grouping (optional)
3. **GitHub Projects** - For kanban view (optional)

Benefits:

- No manual syncing between roadmap and issues
- Clear hierarchy via Epic → Sub-Issue relationship
- Native GitHub features (no custom tooling)
- LLMs can parse structured issue data

## References

- [CLAUDE.md](../CLAUDE.md) - Full development workflow
- [Example Epic #151](https://github.com/Shredvardson/dl-starter/issues/151)
- GitHub's native "Parent issue" field (GA April 2025) - future enhancement
