# Skills Architecture

**Version:** 3.0.0 (Phase 3 - Git Workflow Consolidation)
**Status:** Active
**Token Savings:** 65% average (77% for pure automation)

## Overview

The Skills architecture enables **progressive disclosure** of LLM context, reducing token usage by 60-80% while maintaining zero context pollution. Skills delegate computation to bash scripts, invoking the LLM only when semantic understanding is truly needed.

## Core Principles

### 1. Progressive Disclosure

**Problem:** Traditional slash commands load entire prompt templates (2,000-5,000 tokens) even for simple validations.

**Solution:** Skills use a three-tier disclosure model:

```
Tier 1: Skill Metadata (skill.json)          → ~50 tokens
Tier 2: Skill Overview (.claude/commands/)   → ~500 tokens
Tier 3: Implementation Guide (only if needed) → ~2,000 tokens
```

### 2. Script Execution (Zero Token Cost)

**Pattern:** Bash scripts execute logic and return JSON.

**Benefits:**
- Fast validation (no LLM invocation)
- Structured output (easy parsing)
- Conditional LLM invocation (only when needed)
- Child skills exposed via JSON

**Example:**
```bash
#!/bin/bash
# Fast validation
if [[ -z "$INPUT" ]]; then
  jq -n '{ error: "Input required" }'
  exit 1
fi

# Execute logic
RESULT=$(expensive_computation)

# Return minimal JSON
jq -n --arg result "$RESULT" '{ status: "success", result: $result }'
```

### 3. Child Skills

Skills can expose "child skills" via JSON output, enabling:
- Deeper drill-down without loading context upfront
- Conditional workflows based on runtime state
- Guided user journeys

**Example:**
```json
{
  "status": "needs_review",
  "child_skills": [
    {
      "name": "analyze-failures",
      "description": "Deep analysis of PR failures",
      "requires_llm": true
    }
  ]
}
```

## Architecture

### Directory Structure

```
.claude/
├── commands/              # Skill definitions (Tier 2)
│   ├── git.md            # Unified git operations
│   ├── review.md         # Code quality automation
│   ├── docs.md           # Documentation sync
│   ├── test.md           # Testing workflows
│   ├── db.md             # Database operations
│   └── spec.md           # Specification analysis
│
scripts/
├── skills/               # Skill implementations (bash)
│   ├── git.sh           # Git router
│   ├── git/             # Git sub-skills
│   │   ├── branch.sh
│   │   ├── commit.sh
│   │   ├── pr.sh
│   │   ├── workflow.sh
│   │   └── tag.sh
│   ├── code-reviewer.sh
│   └── documentation-sync.sh
```

### Skill Definition Format

**File:** `.claude/commands/<skill>.md`

```markdown
---
skill: <name>
version: 1.0.0
category: <workflow|quality|data>
token_cost: <estimated tokens>
description: <brief description>
triggers:
  - <when to use>
---

# /<skill> - Title

**Purpose:** Brief description

**Usage:**
```bash
/<skill> <action> [flags]
```

**Actions:**
- `action1` - Description
- `action2` - Description

**Execution:**
```bash
bash scripts/skills/<skill>.sh "$@"
```
```

### Script Implementation Pattern

```bash
#!/bin/bash
set -euo pipefail

ACTION="${1:-}"
shift || true

case "$ACTION" in
  action1)
    # Fast validation
    if [[ ! -f "required_file" ]]; then
      jq -n '{ error: "File not found" }'
      exit 1
    fi

    # Execute logic
    RESULT=$(compute_result)

    # Return minimal JSON
    jq -n --arg result "$RESULT" '{
      status: "success",
      result: $result,
      next_steps: ["Do this next"]
    }'
    ;;

  action2)
    # Signal LLM needed
    jq -n '{
      status: "needs_analysis",
      message: "Please analyze X and Y",
      child_skills: [...]
    }'
    ;;

  "")
    jq -n '{
      error: "Action required",
      available_actions: ["action1", "action2"]
    }'
    exit 1
    ;;
esac
```

## Phase 3: Implemented Skills

### /git - Unified Git Workflow

**Consolidates:** 5+ separate git commands into one interface

**Actions:**
- `branch <issue>` - Create feature branch
- `commit [message]` - Smart commit with conventions
- `pr prepare` - Prepare and create PR
- `pr fix <number>` - Fix PR issues
- `workflow` - Full workflow automation
- `tag <version>` - Create release tag

**Token Savings:** 65% average (80% for branch, 77% for workflow)

**Example:**
```bash
/git branch Issue #123: Add feature     # Creates feature/123-add-feature
/git commit "feat: add component"        # Creates conventional commit
/git pr prepare                          # Creates PR with template
/git workflow                            # Shows workflow status
```

### /review - Code Quality Automation

**Consolidates:** 5 quality checks into one command

**Checks:**
1. TypeScript compilation
2. ESLint violations
3. Test execution
4. Coverage analysis (70% target)
5. Production build

**Flags:**
- `--fix` - Auto-fix ESLint issues

**Token Savings:** 73% vs manual checks + LLM interpretation

**Example:**
```bash
/review              # Run all quality checks
/review --fix        # Run checks and auto-fix
```

### /docs - Documentation Sync

**Actions:**
- `sync [--dry-run]` - Sync docs to GitHub wiki
- `validate` - Validate links and references

**Token Savings:** 67% vs manual sync workflow

**Example:**
```bash
/docs sync              # Sync documentation
/docs sync --dry-run    # Preview sync
/docs validate          # Check for broken links
```

## Token Savings Validation

### Pure Automation Scenarios

| Workflow | Old Tokens | New Tokens | Savings |
|----------|-----------|-----------|---------|
| Branch Creation | 2,500 | 500 | 80% ✅ |
| Workflow Status | 2,200 | 500 | 77% ✅ |
| Code Review | 1,500 | 400 | 73% ✅ |

**Average:** 77% savings

### LLM-Assisted Scenarios

| Workflow | Old Tokens | New Tokens | Savings |
|----------|-----------|-----------|---------|
| Commit Workflow | 2,800 | 1,300 | 53% |
| PR Preparation | 3,500 | 1,700 | 51% |

**Average:** 52% savings

### Composite Achievement

**Overall Average:** 65% token savings
**Zero Context Pollution:** ✅ Maintained
**User Experience:** ✅ Improved (unified interface)

## Best Practices

### When to Create a Skill

✅ **Create Skill when:**
- Workflow involves 3+ commands
- Significant validation can be scripted
- Common operation repeated frequently
- Token savings potential > 50%

❌ **Don't create Skill when:**
- One-time operation
- Requires extensive LLM reasoning
- Minimal token usage anyway

### Skill Design Patterns

#### 1. Router Pattern

For commands with multiple actions:

```bash
ACTION="${1:-}"
case "$ACTION" in
  action1) exec "$(dirname "$0")/subdir/action1.sh" "$@" ;;
  action2) exec "$(dirname "$0")/subdir/action2.sh" "$@" ;;
esac
```

#### 2. Progressive Disclosure Pattern

Return minimal JSON, expose child skills:

```json
{
  "status": "success",
  "result": "Brief result",
  "child_skills": [
    {
      "name": "deep-analysis",
      "description": "Detailed analysis",
      "requires_llm": true
    }
  ]
}
```

#### 3. Validation-First Pattern

Fast validation before expensive operations:

```bash
# Validate inputs (fast, no tokens)
if [[ -z "$REQUIRED" ]]; then
  jq -n '{ error: "Missing required input" }'
  exit 1
fi

# Execute (may use tokens if LLM needed)
...
```

## Command Consolidation Pattern

Phase 3 introduced **command consolidation** - merging related commands under a unified parent:

**Before:**
```bash
/git:branch
/git:commit
/git:prepare-pr
/git:fix-pr
/git:workflow
/git:tag-release
```

**After:**
```bash
/git branch
/git commit
/git pr prepare
/git pr fix
/git workflow
/git tag
```

**Benefits:**
- Single entry point (easier discovery)
- Consistent interface
- Better routing (script-based)
- Reduced slash command sprawl

## Migration Guide

### From Traditional Command to Skill

**1. Extract core logic to bash script**

```bash
# Old: Embedded in .md prompt
# New: scripts/skills/my-skill.sh
#!/bin/bash
set -euo pipefail

# Logic here
jq -n '{ status: "success" }'
```

**2. Create skill definition**

```markdown
---
skill: my-skill
version: 1.0.0
---

# /my-skill

**Execution:**
```bash
bash scripts/skills/my-skill.sh "$@"
```
```

**3. Update references**

Replace command usage:
```bash
# Old: /traditional:command arg1 arg2
# New: /skill action arg1 arg2
```

## Troubleshooting

### Skill Not Found

**Error:** `Skill 'foo' not found`

**Solution:**
1. Check `.claude/commands/foo.md` exists
2. Verify skill name in frontmatter matches filename
3. Re-index commands: `pnpm learn:index-commands`

### Script Execution Fails

**Error:** `Permission denied`

**Solution:**
```bash
chmod +x scripts/skills/my-skill.sh
```

### Invalid JSON Output

**Error:** `Failed to parse skill output`

**Solution:**
1. Test script directly: `bash scripts/skills/my-skill.sh`
2. Validate JSON: `bash scripts/skills/my-skill.sh | jq '.'`
3. Check for extra output (use `>&2` for logs)

## Roadmap

### Phase 4 (Planned)

**Focus:** Advanced Skills and orchestration

**Planned Skills:**
- `/deploy` - Deployment automation
- `/monitor` - System monitoring
- `/optimize` - Performance optimization
- `/security` - Security scanning

**New Patterns:**
- Cross-skill orchestration (chain Skills)
- Skill templates (generate custom Skills)
- Skill marketplace (share Skills)
- Advanced caching (LLM response memoization)

**Target:** 75% average token savings across all workflows

## References

- [Phase 1 Spec](docs/specs/phase-1-skills-architecture-foundation.md) - Foundation
- [Phase 2 Plan](docs/plans/phase-2-core-workflow-implementation.md) - Core workflows
- [Phase 3 Spec](docs/specs/phase-3-git-workflow-consolidation.md) - Consolidation
- [Token Measurement Tool](scripts/tools/measure-tokens.ts) - Validation
- [ADR 002](docs/adr/002-skills-architecture.md) - Architecture decision

## Contributing

### Adding New Skills

1. **Create spec:** `docs/specs/my-skill-spec.md`
2. **Implement script:** `scripts/skills/my-skill.sh`
3. **Create definition:** `.claude/commands/my-skill.md`
4. **Test:** `bash scripts/skills/my-skill.sh`
5. **Validate tokens:** `pnpm measure-tokens "/my-skill action"`
6. **Document:** Update this file

### Testing Skills

```bash
# Unit test (script only)
bash scripts/skills/my-skill.sh arg1 arg2

# Integration test (via slash command)
# In Claude Code:
/my-skill action args

# Token measurement
pnpm measure-tokens "/my-skill action args"
```

## License

MIT - See [LICENSE](LICENSE)

---

**Skills Architecture** - Intelligent token optimization through progressive disclosure

*Last Updated: 2025-01-21 (Phase 3)*
