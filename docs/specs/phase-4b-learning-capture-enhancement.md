# Phase 4B: Learning Capture Enhancement

**Issue:** #170 (Phase 4B)
**Priority:** P1
**Estimated Effort:** 4-6 hours
**Status:** In Progress
**Date:** 2025-10-22

## Executive Summary

Enhance the existing learning capture system (`/ops:learning-capture`) with intelligent automation features to reduce friction and increase adoption. Build on the proven foundation of 74 micro-lessons captured organically over the project's lifetime.

## Context

### Current State

**Strengths:**

- 74 micro-lessons captured (proof of active learning culture)
- Automatic INDEX.md generation via `pnpm learn:index`
- Heat-based ranking system (recency + reuse + severity)
- Template-driven lesson creation
- Integration with git pre-push hooks

**Pain Points:**

- Manual context extraction (user must describe session)
- Manual tag selection (no suggestions)
- Manual INDEX.md regeneration (separate command)
- No search capability (users must browse INDEX.md)

### Phase 4B Goals

1. **Auto-detect session context** - Extract from git status, recent commits, open files
2. **Suggest tags** - Based on changed files, commit messages, and existing tag corpus
3. **Auto-update INDEX.md** - Regenerate index after creating new lesson
4. **Search micro-lessons** - Query by tags, keywords, or patterns

## Implementation Plan

### Task 1: Auto-Context Detection (2 hours)

**Deliverable:** Enhanced `/ops:learning-capture` with automatic context extraction

**Implementation:**

- Extract context from:
  - Current git branch name
  - Last 3 commit messages
  - Changed files in current branch
  - Active issue/PR numbers (from branch name or commits)
- Pre-populate learning template with discovered context
- Allow manual override/refinement

**Example Output:**

```markdown
# [Auto-detected Title from Issue #170: Learning Capture]

**Context:** Working on Phase 4B of Skills Architecture
**Branch:** feature/170-phase-4b-learning-capture
**Related Issues:** #170
**Changed Files:**

- docs/specs/phase-4b-learning-capture-enhancement.md
- .claude/commands/ops/learning-capture.md
```

### Task 2: Tag Suggestion (1.5 hours)

**Deliverable:** Intelligent tag suggestions based on session data

**Implementation:**

- Analyze corpus of existing tags from 74 lessons
- Extract tags from:
  - File paths (e.g., `scripts/` → `bash`, `scripts/skills/` → `skills`)
  - Commit message keywords
  - Issue labels
- Rank suggestions by relevance
- Present top 5-8 tags as suggestions

**Example:**

```bash
Suggested tags: #skills #learning #automation #phase-4b #170
Other common tags: #git #bash #typescript #testing
```

### Task 3: Auto INDEX.md Update (0.5 hours)

**Deliverable:** INDEX.md regenerates automatically after lesson creation

**Implementation:**

- Call `pnpm learn:index` after successful lesson creation
- Show updated INDEX.md ranking in output
- Commit INDEX.md changes along with new lesson

**Changes:**

- Modify `/ops:learning-capture` command to add hook
- Update git staging to include INDEX.md

### Task 4: Search Command (2 hours)

**Deliverable:** New `/learn search <query>` command

**Implementation:**

- Create `.claude/commands/ops/learn-search.md`
- Search by:
  - Tags (exact or partial match)
  - Title keywords
  - Content keywords
- Output ranked results with snippets
- Support filters: `--tag`, `--recent`, `--high-usage`

**Example Usage:**

```bash
/learn search git merge
# Returns:
# 1. pnpm-lock.yaml Merge Conflicts (git, merge, lockfile)
# 2. Constitution Checksum After Merge (git, merge, ci)

/learn search --tag skills --recent 7d
# Returns recent lessons tagged with 'skills' from last 7 days

/learn search --high-usage skills
# Returns lessons tagged with 'skills' ranked by reuse frequency
# Most-referenced lessons appear first
```

## Success Criteria

- [ ] `/ops:learning-capture` auto-detects context from git
- [ ] Tag suggestions presented based on session data
- [ ] INDEX.md regenerates automatically after lesson creation
- [ ] `/learn search` command functional with multiple query modes
- [ ] Documentation updated in ROADMAP.md and checklist
- [ ] Zero regression in existing learning capture workflow
- [ ] User feedback positive (minimum 3 user surveys with ≥4/5 satisfaction rating on learning capture workflow)

## Architecture Changes

### File Changes

**New Files:**

- `.claude/commands/ops/learn-search.md` (new search command)
- `scripts/tools/search-lessons.ts` (search implementation)

**Modified Files:**

- `.claude/commands/ops/learning-capture.md` (enhanced with auto-features)
- `scripts/generate-learnings-index.js` (if hooks needed)
- `docs/adr/002-skills-implementation-checklist.md` (Phase 4B complete)
- `ROADMAP.md` (Phase 4B status update)

### Integration Points

- **Git Integration:** Extract branch, commits, changed files
- **Tag Corpus:** Parse existing lessons for tag vocabulary
- **INDEX Generation:** Call existing `pnpm learn:index`
- **Search:** File system + simple text matching (no external deps)

## Testing Strategy

### Manual Testing

1. Create new learning with auto-context → verify context detected
2. Check tag suggestions → verify relevance to session
3. Create lesson → verify INDEX.md updates automatically
4. Search for existing lesson → verify found correctly
5. Search with filters → verify filtering works

### Automated Testing (Required)

Implement before merge:
- Automated tests for context extraction (mock git commands)
- Regression tests for existing learning capture functionality
- Tag suggestion accuracy tests (compare against corpus)

**Acceptance Criteria:**
- Test files added to `tests/specs/phase-4b/` directory
- All tests passing in CI pipeline (`pnpm test`)
- Coverage for critical paths: auto-context, tag suggestions, INDEX regeneration

### Validation Commands

```bash
# Test auto-context detection
/ops:learning-capture

# Test search (after implementation)
/learn search bash
/learn search --tag git --recent 7d
/learn search skills architecture

# Verify INDEX.md generation
pnpm learn:index
```

## Risk Mitigation

| Risk                        | Likelihood | Impact | Mitigation                             |
| --------------------------- | ---------- | ------ | -------------------------------------- |
| Auto-context too noisy      | Medium     | Low    | Allow manual override/edit             |
| Tag suggestions irrelevant  | Medium     | Low    | Show full tag list as fallback         |
| Search too slow (74+ files) | Low        | Low    | Simple grep-based search sufficient    |
| INDEX.md conflicts          | Low        | Medium | Auto-stage in pre-push hook (existing) |

## Rollout Plan

1. **Dev Branch:** `feature/170-phase-4b-learning-capture`
2. **Implementation Order:**
   - Task 1: Auto-context (foundational)
   - Task 2: Tag suggestions (builds on context)
   - Task 3: Auto INDEX.md (quick win)
   - Task 4: Search command (standalone)
3. **Testing:** Manual testing with real learning capture sessions
4. **Documentation:** Update ROADMAP.md, checklist, command docs
5. **Merge:** Single PR with all Phase 4B features

## Future Enhancements (Out of Scope)

- AI-powered lesson summarization
- Automatic lesson creation from commit messages
- Cross-referencing lessons by similarity
- Export lessons to knowledge base
- Integration with external note-taking tools

## References

- [ROADMAP.md](../../ROADMAP.md#phase-4b-learning-capture-enhancement)
- [ADR-002 Checklist](../adr/002-skills-implementation-checklist.md)
- [Existing Learning Command](../../.claude/commands/ops/learning-capture.md)
- [Learning Index Script](../../scripts/generate-learnings-index.js)
- [Micro-Lessons Directory](../micro-lessons/)

---

**Author:** Claude Code
**Reviewers:** @jonte
**Last Updated:** 2025-10-22
