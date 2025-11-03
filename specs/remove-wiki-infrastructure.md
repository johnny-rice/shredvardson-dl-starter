---
id: SPEC-255-remove-wiki-infrastructure
title: Remove wiki infrastructure to reduce documentation debt
type: spec
priority: p2
status: ready
lane: simple
issue: 255
plan: plans/remove-wiki-infrastructure.md
created: 2025-11-03
---

# Remove wiki infrastructure to reduce documentation debt

## Summary

Remove all wiki infrastructure (1,672 lines) to reduce documentation debt, eliminate maintenance burden, and optimize token usage for LLM context ingestion. The wiki contradicts PR #61's intent and adds no clear value over README.md and docs/.

## Problem Statement

The wiki infrastructure adds documentation debt without clear value:

- **1,672 lines** of wiki docs vs **408 lines** in README (4x bloat)
- **Contradicts PR #61** which removed `wiki-content/generated/` as duplicate
- **Regenerates deleted files** when `pnpm wiki:generate` runs
- **Nobody asked for it** - not part of original requirements
- **Wastes LLM tokens** when ingesting project context
- **Maintenance burden** - keeping wiki in sync with codebase

**Token optimization principle**: LLMs work best with concise, focused context. For starter templates:
- README.md answers 5 key questions for quick planning
- Detailed work happens in conversational context (more efficient)
- Deep-dive docs in `docs/` for specific needs

**Current state violates our own token optimization governance.**

## Proposed Solution

**Remove all wiki infrastructure:**

1. Delete `docs/wiki/WIKI-*.md` (10 files, 1,672 lines)
2. Delete `scripts/generate-wiki.js`
3. Delete `wiki-content/generated/` directory
4. Add `wiki-content/` to `.gitignore`
5. Remove `wiki:generate` script from `package.json`
6. Update README.md to remove wiki references
7. Remove GitHub Wiki pages if they exist

**Keep these instead:**
- ✅ README.md - Quick-start and overview (408 lines)
- ✅ docs/ - Technical guides for deep-dive
- ✅ Inline code comments - Context-specific guidance

## Acceptance Criteria

- [ ] All wiki files in `docs/wiki/` deleted
- [ ] Wiki generation script `scripts/generate-wiki.js` removed
- [ ] `wiki-content/generated/` directory removed
- [ ] `wiki-content/` added to `.gitignore`
- [ ] `wiki:generate` script removed from `package.json`
- [ ] README.md updated to remove wiki references
- [ ] No references to wiki remain in codebase
- [ ] GitHub Wiki pages removed (if exist)

## Technical Constraints

- Must verify no other scripts or processes depend on wiki generation
- Must ensure no broken links remain after removing wiki references
- Should preserve any unique content that exists only in wiki (migrate to docs/ if needed)

## Success Metrics

- **Token reduction**: Estimated 1,672 lines removed from LLM context
- **Maintenance burden**: Zero ongoing wiki sync effort
- **Documentation clarity**: Single source of truth (README + docs/)
- **Codebase simplicity**: Fewer files and scripts to maintain

## Out of Scope

- Restructuring existing docs/ content
- Major README.md rewrites (only remove wiki references)
- Changes to inline code documentation

## References

- **PR #61**: Previously removed `wiki-content/generated/` as duplicate
- **Token optimization research**: LLMs benefit from concise context
- **Best practices (2024-2025)**: Starter templates should use README as primary documentation