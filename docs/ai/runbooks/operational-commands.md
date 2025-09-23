# Operational Commands Runbook

**When to use:** Reference for LLM agents on operational workflow commands and best practices.

## Overview

This runbook covers the key operational commands (`/pr:assist`, `/ops:wiki-sync`, `/adr:draft`, `/ops:learning-capture`) and when to use each in your development workflow.

## Core Operational Commands

### `/pr:assist` - PR Preparation Assistant

**When to use:**
- Before opening any pull request
- After completing feature development
- When you need traceability metadata auto-filled

**What it does:**
- Scans for traceability artifacts (specs, plans, tasks)
- Auto-fills PR template with metadata and IDs
- Generates complete PR body with verification checklist
- Links issues and references properly

**Example usage:**
```bash
# After staging your changes
/pr:assist #123  # with specific issue number
/pr:assist       # auto-detects from branch name
```

**Produces:** `artifacts/pr-body.md` ready for `gh pr create --body-file`

### `/ops:wiki-sync` - Documentation Synchronization

**When to use:**
- Before major releases
- After PRD or documentation changes
- When preparing project updates
- As part of PR workflow for docs consistency

**What it does:**
- Compares docs/PRD.md with docs/wiki/WIKI-PRD.md
- Auto-regenerates wiki if out of sync
- Verifies all documentation is current
- Reports sync status

**Example usage:**
```bash
/ops:wiki-sync        # check and fix sync
/ops:wiki-sync --dry-run  # check only
```

**Produces:** `artifacts/wiki-sync-report.md` with status

### `/adr:draft` - Architecture Decision Record Creation

**When to use:**
- Changes to prompts, workflows, or security guardrails
- New dependencies or architectural changes
- Repository structure modifications
- Governance or policy changes

**What it does:**
- Creates properly formatted ADR
- Links to related issues and discussions
- Follows ADR template standards
- Enables governance tracking

**Example usage:**
```bash
/adr:draft           # creates new ADR
/adr:draft --template security  # use specific template
```

**Required for:** Changes touching `/packages/ai/prompts/**`, `/scripts/**`, `.github/workflows/**`, `docs/wiki/**`

### `/ops:learning-capture` - Knowledge Management

**When to use:**
- After receiving CodeRabbit feedback
- When discovering recurring patterns
- Converting external feedback to internal knowledge
- Building institutional memory

**What it does:**
- Converts CodeRabbit feedback to micro-lessons
- Creates or updates ADRs for patterns
- Links learnings to prevent repetition
- Updates learning index automatically

**Example usage:**
```bash
/ops:learning-capture    # process recent feedback
/ops:learning-capture --source coderabbit --pr 123
```

## Workflow Integration

### Simple Lane Workflow
1. Develop feature
2. Run `/ops:wiki-sync` (if docs changed)
3. Use `/pr:assist` for PR preparation
4. Apply `/ops:learning-capture` after code review

### Spec-Driven Workflow
1. Create spec
2. Use `/adr:draft` for architectural decisions
3. Develop according to spec
4. Run `/ops:wiki-sync` for documentation
5. Use `/pr:assist` with full traceability
6. Apply `/ops:learning-capture` for patterns

### Governance Enforcement
- **ADR Required:** Changes to prompts, workflows, security, repo structure
- **Override Available:** Use `override:adr` label for emergencies
- **Validation:** CI blocks PRs without required ADR references

## Command Dependencies

| Command | Requires | Produces | Next Step |
|---------|----------|----------|-----------|
| `/pr:assist` | Staged changes, optional issue # | `artifacts/pr-body.md` | `gh pr create` |
| `/ops:wiki-sync` | docs/PRD.md changes | `artifacts/wiki-sync-report.md` | Commit if updated |
| `/adr:draft` | Governance change context | `docs/decisions/ADR-*.md` | Link in PR |
| `/ops:learning-capture` | External feedback/patterns | `docs/micro-lessons/*.md` | Update index |

## Best Practices

1. **Always use `/pr:assist`** - Ensures proper metadata and traceability
2. **Run `/ops:wiki-sync`** - Keeps documentation consistent
3. **Draft ADRs early** - Better to have governance clarity upfront
4. **Capture learnings immediately** - Knowledge is freshest right after discovery
5. **Check command outputs** - Always verify artifacts before proceeding

## Troubleshooting

**`/pr:assist` fails:**
- Ensure changes are staged
- Check if branch name contains issue reference
- Verify traceability artifacts exist if using spec-driven

**`/ops:wiki-sync` reports errors:**
- Check PRD.md formatting
- Ensure wiki:generate script is available
- Verify file permissions

**ADR enforcement blocks PR:**
- Add ADR reference to PR body
- Use `override:adr` label for emergencies only
- Check if changes touch governed paths

**Learning capture fails:**
- Ensure feedback source is available
- Check micro-lesson template exists
- Verify write permissions to docs/micro-lessons/