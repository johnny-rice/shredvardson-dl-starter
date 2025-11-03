---
id: SPEC-add-command-discovery-protocol
title: Add Command Discovery Protocol to CLAUDE.md
type: spec
priority: p1
status: draft
lane: simple
issue: 274
created: 2025-11-03
---

# Add Command Discovery Protocol to CLAUDE.md

## Summary

Add a "Command Discovery Protocol" section to CLAUDE.md to prevent Claude from bypassing custom workflow commands in favor of native tools, ensuring quality gates, security checks, and sub-agent orchestration are triggered consistently.

## Problem Statement

Claude sometimes bypasses custom commands (like `/git:prepare-pr`) in favor of native tools (like `git push`), which skips:

- Quality gates (linting, type checks)
- Security checks (RLS validation)
- Workflow automation (PR templates)
- Sub-agent orchestration (test generation, documentation)
- Learning capture (micro-lessons)

**Example:** Recently pushed directly to main instead of using `/git:prepare-pr`, missing GitHub Actions, CodeRabbit review, and doctor checks.

**Root Cause:** Current CLAUDE.md has the Commands Index at line 61 (middle of document), where the "lost in the middle" effect reduces attention. No explicit "check before action" protocol exists.

## Proposed Solution

Add two reinforcement points for command discovery based on research findings:

### Part 1: Command Discovery Protocol (After Line 7)

Add forcing function at beginning of file (right after Mission & Guardrails):

```markdown
## ⚠️ Command Discovery Protocol

**ALWAYS check for custom commands BEFORE using native tools**

This project has custom commands/skills with built-in quality gates, sub-agent orchestration, and learning capture.

**The Process:**

1. About to do something (git operation, db migration, create test, etc.)?
2. Check: "Does `.claude/commands/QUICK_REFERENCE.md` have a command for this?"
3. If YES → Use the command (it triggers workflows, agents, validations)
4. If NO → Use native tools

**Common Examples:**

- Git operations → Check for `/git:*` commands FIRST
- Database changes → Check for `/db:*` commands FIRST
- Test creation → Check for `/test:*` commands FIRST
- Spec/implementation → Check for `/spec:*`, `/code` commands FIRST

**Why this matters:** Commands trigger sub-agents, quality gates, and learning capture that native tools bypass.
```

### Part 2: Enhanced Commands Index (Line 61)

Update Commands Index section header to reinforce message at point of lookup:

```markdown
## Commands Index (⚠️ Check These Before Native Tools)

**Before using git, gh, npm, or database tools, check this list.**

Custom commands include quality gates and PR workflows that native tools bypass.
```

## Acceptance Criteria

- [ ] Command Discovery Protocol section added after line 7 (after Mission & Guardrails)
- [ ] Section includes 4-step process checklist
- [ ] Section includes common examples (git, db, test, spec)
- [ ] Section includes rationale ("Why this matters")
- [ ] Commands Index header updated with warning and explanation
- [ ] Total line count ≤180 lines (target: 177 lines)
- [ ] Single PR with both changes
- [ ] Test: Ask Claude "I need to push code" - should mention checking commands first

## Technical Constraints

**Line Count Budget:**

- Current CLAUDE.md: 162 lines
- Available budget: 18 lines
- Part 1 content: ~15 lines
- Part 2 content: ~3 lines (header update only)
- Target total: 177 lines (3-line margin)

**Placement Strategy:**

- Part 1: After line 7 (early placement for maximum attention)
- Part 2: Line 61 update (reinforcement at point of command lookup)
- Two reinforcement points address "lost in the middle" effect

**Documentation Style:**

- Use imperative mood with strong verbs (ALWAYS, BEFORE)
- Bullet points for space efficiency
- No code examples in Part 1 (use markdown formatting instead)
- Match existing CLAUDE.md tone and structure

## Success Metrics

- **70-80% reduction** in command bypass incidents (based on prompt engineering research showing dual reinforcement effectiveness)
- **Zero regressions** in existing CLAUDE.md functionality
- **≤180 lines total** (maintain constraint)
- **Positive test response** when asking about git operations

## Out of Scope

- Changes to individual command documentation (already exists)
- Updates to agent prompts (separate from CLAUDE.md)
- Command alias creation (not needed for this fix)
- QUICK_REFERENCE.md updates (referenced but not modified)

## References

**Research Findings:**

- "Lost in the middle" effect: Placement matters more than content
- Explicit priority statements work better than implied hierarchy
- Anthropic recommends "check before action" patterns for Claude 4+
- Two reinforcement points better than one (beginning + point-of-use)

**Similar Implementations Found:**

- [CLAUDE.md:9-79](CLAUDE.md#L9-L79) - Existing Workflow Commands section (70 lines)
- [prompts/orchestrator.md:1-50](prompts/orchestrator.md#L1-L50) - Strong imperative language patterns (MUST, ALWAYS, NEVER)
- [prompts/planner.md:1](prompts/planner.md#L1) - MUST/ALWAYS constraint patterns

**Current CLAUDE.md Structure:**

- Line 1: Purpose
- Line 9-79: Workflow Commands (insertion point for Part 1: after line 7)
- Line 80-96: Tips
- Line 97-120: Testing
- Line 121-137: Running Tasks
- Line 138-151: Orchestrator
- Line 152-162: Contributing

**External Documentation:**

- Anthropic best practices: "Check before action" pattern
- Web research on LLM prompt engineering 2025 (dual reinforcement)

**Related Issues:**

- Issue #274 (this issue)
- Closed #275 (merged into #274 for single implementation)
