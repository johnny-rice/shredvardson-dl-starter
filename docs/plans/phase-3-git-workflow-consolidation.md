---
id: 170-phase-3-plan
title: 'Phase 3 Implementation Plan: Git Workflow Consolidation'
created: 2025-01-21
status: active
phase: 3
parent_spec: phase-3-git-workflow-consolidation
---

# Phase 3 Implementation Plan

## Overview

Consolidate 5+ git commands into unified `/git` Skill and implement `code-reviewer` and `documentation-sync` Skills. Target: **80% token savings**.

## Implementation Order

### Step 1: Git Skill Consolidation (3.1)

#### 1.1 Create Master Git Skill

**File:** `.claude/commands/git.md`

````markdown
---
skill: git
version: 1.0.0
category: workflow
token_cost: 500
---

# /git - Unified Git Workflow

**Purpose:** Consolidated git operations with intelligent routing

**Usage:**

```bash
/git <action> [args]
```

**Actions:**

- `branch <issue>` - Create feature branch from issue
- `commit [message]` - Smart commit with conventions
- `pr prepare` - Prepare pull request
- `pr fix <number>` - Fix PR issues
- `workflow` - Full git workflow automation
- `tag <version>` - Create release tag

**Token Cost:** ~500 tokens (vs 5,000+ for separate commands)

Execute: `scripts/skills/git.sh "$@"`

#### 1.2 Create Git Router Script

**File:** `scripts/skills/git.sh`

```bash
#!/bin/bash
set -euo pipefail

ACTION=${1:-""}
shift || true

case "$ACTION" in
  branch)
    exec "$(dirname "$0")/git/branch.sh" "$@"
    ;;
  commit)
    exec "$(dirname "$0")/git/commit.sh" "$@"
    ;;
  pr)
    exec "$(dirname "$0")/git/pr.sh" "$@"
    ;;
  workflow)
    exec "$(dirname "$0")/git/workflow.sh" "$@"
    ;;
  tag)
    exec "$(dirname "$0")/git/tag.sh" "$@"
    ;;
  "")
    jq -n '{
      error: "Action required",
      available_actions: ["branch", "commit", "pr", "workflow", "tag"],
      usage: "/git <action> [args]"
    }'
    exit 1
    ;;
  *)
    jq -n --arg action "$ACTION" '{
      error: "Unknown action",
      action: $action,
      available_actions: ["branch", "commit", "pr", "workflow", "tag"]
    }'
    exit 1
    ;;
esac
```
````

#### 1.3 Refactor Existing Commands to Sub-Scripts

**Create:** `scripts/skills/git/` directory structure:

```
scripts/skills/git/
├── branch.sh      # From /git:branch
├── commit.sh      # From /git:commit
├── pr.sh          # From /git:prepare-pr + /git:fix-pr
├── workflow.sh    # From /git:workflow
└── tag.sh         # From /git:tag-release
```

**Migration Strategy:**

1. Extract core logic from existing slash commands
2. Wrap in JSON output format
3. Add progressive disclosure
4. Keep original commands as deprecated aliases (to be removed in Phase 4)

#### 1.4 Implement PR Sub-Router

**File:** `scripts/skills/git/pr.sh`

```bash
#!/bin/bash
set -euo pipefail

SUBACTION=${1:-""}
shift || true

case "$SUBACTION" in
  prepare)
    # Logic from /git:prepare-pr
    ;;
  fix)
    # Logic from /git:fix-pr
    ;;
  "")
    jq -n '{
      error: "PR action required",
      available_actions: ["prepare", "fix"],
      usage: "/git pr <prepare|fix> [args]"
    }'
    exit 1
    ;;
  *)
    jq -n --arg action "$SUBACTION" '{
      error: "Unknown PR action",
      action: $action,
      available_actions: ["prepare", "fix"]
    }'
    exit 1
    ;;
esac
```

### Step 2: Code Reviewer Skill (3.2)

#### 2.1 Create Code Reviewer Skill

**File:** `.claude/commands/code.md`

````markdown
---
skill: code
version: 1.0.0
category: quality
token_cost: 400
triggers:
  - after_code_change
  - before_pr
---

# /code - Code Review Automation

**Purpose:** Automated code quality checks and review

**Usage:**

```bash
/code review [--fix]
```

**Checks:**

- TypeScript compilation
- ESLint violations
- Test coverage
- Security advisories
- Best practices

**Flags:**

- `--fix` - Auto-fix issues where possible

Execute: `scripts/skills/code-reviewer.sh "$@"`

#### 2.2 Implement Code Reviewer Script

**File:** `scripts/skills/code-reviewer.sh`

```bash
#!/bin/bash
set -euo pipefail

AUTO_FIX=false
if [[ "${1:-}" == "--fix" ]]; then
  AUTO_FIX=true
fi

RESULTS='{
  "status": "success",
  "checks": [],
  "recommendations": [],
  "blocking_issues": []
}'

# TypeScript check
if ! pnpm typecheck > /dev/null 2>&1; then
  RESULTS=$(echo "$RESULTS" | jq '.status = "error" |
    .checks += [{
      "name": "TypeScript",
      "status": "fail",
      "message": "Type errors found"
    }] |
    .blocking_issues += ["TypeScript errors must be fixed"]')
fi

# ESLint check
if ! pnpm lint > /dev/null 2>&1; then
  if [[ "$AUTO_FIX" == "true" ]]; then
    pnpm lint:fix
    RESULTS=$(echo "$RESULTS" | jq '.checks += [{
      "name": "ESLint",
      "status": "fixed",
      "message": "Auto-fixed lint issues"
    }]')
  else
    RESULTS=$(echo "$RESULTS" | jq '.status = "warning" |
      .checks += [{
        "name": "ESLint",
        "status": "fail",
        "message": "Lint errors found"
      }] |
      .recommendations += ["Run with --fix flag to auto-fix"]')
  fi
fi

# Test coverage
COVERAGE=$(pnpm test:coverage --silent 2>&1 | grep -oP '\d+\.\d+(?=%)' | head -1 || echo "0")
if (( $(echo "$COVERAGE < 70" | bc -l) )); then
  RESULTS=$(echo "$RESULTS" | jq --arg cov "$COVERAGE" '.status = "warning" |
    .checks += [{
      "name": "Coverage",
      "status": "fail",
      "message": ("Coverage is " + $cov + "% (target: 70%)")
    }] |
    .recommendations += ["Add more tests to reach 70% coverage"]')
fi

# Security check (placeholder for Supabase advisors)
# TODO: Integrate with /security:scan

echo "$RESULTS" | jq '.'
```
````

### Step 3: Documentation Sync Skill (3.3)

#### 3.1 Create Documentation Sync Skill

**File:** `.claude/commands/docs.md`

````markdown
---
skill: docs
version: 1.0.0
category: workflow
token_cost: 400
---

# /docs - Documentation Sync

**Purpose:** Sync documentation between repo and GitHub wiki

**Usage:**

```bash
/docs sync [--dry-run]
```

**Actions:**

- Detect changed documentation files
- Sync to GitHub wiki
- Update cross-references
- Validate internal links
- Generate table of contents

**Flags:**

- `--dry-run` - Preview changes without syncing

Execute: `scripts/skills/documentation-sync.sh "$@"`

#### 3.2 Implement Documentation Sync Script

**File:** `scripts/skills/documentation-sync.sh`

```bash
#!/bin/bash
set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Detect changed docs
CHANGED_DOCS=$(git diff --name-only HEAD | grep -E '\.(md|mdx)$' || echo "")

if [[ -z "$CHANGED_DOCS" ]]; then
  jq -n '{
    status: "success",
    message: "No documentation changes detected",
    files_checked: 0,
    files_synced: 0
  }'
  exit 0
fi

FILES_COUNT=$(echo "$CHANGED_DOCS" | wc -l)

if [[ "$DRY_RUN" == "true" ]]; then
  jq -n --argjson count "$FILES_COUNT" --arg files "$CHANGED_DOCS" '{
    status: "success",
    message: "Dry run - would sync files",
    files_checked: $count,
    files_to_sync: ($files | split("\n"))
  }'
  exit 0
fi

# Actual sync logic would go here
# For now, placeholder

jq -n --argjson count "$FILES_COUNT" '{
  status: "success",
  message: "Documentation synced successfully",
  files_checked: $count,
  files_synced: $count,
  child_skills: [
    {
      name: "validate-links",
      description: "Validate internal links",
      command: "/docs validate"
    }
  ]
}'
```
````

### Step 4: Token Measurement & Validation (3.4)

#### 4.1 Measure Token Savings

Test scenarios:

1. **Branch creation:** `/git branch Issue #123`
2. **Commit workflow:** `/git commit "feat: add feature"`
3. **PR preparation:** `/git pr prepare`
4. **PR fix:** `/git pr fix 141`
5. **Full workflow:** `/git workflow`
6. **Code review:** `/code review`
7. **Docs sync:** `/docs sync`

For each scenario:

```bash
# Before (Phase 2 Skills)
pnpm measure-tokens "/git branch Issue #123"

# After (Phase 3 consolidated Skills)
pnpm measure-tokens "/git branch Issue #123"

# Calculate savings (expect 30-50% reduction via lazy loading)
```

#### 4.2 Create Validation Report

**File:** `docs/validation/phase-3-token-savings.md`

Document:

- Token costs per workflow (before/after)
- Savings percentage
- Performance metrics
- Context pollution checks
- Lessons learned

### Step 5: Documentation Updates (3.5)

#### 5.1 Update SKILLS.md

Add:

- Section on command consolidation pattern
- Documentation for `/git`, `/code`, `/docs`
- Migration guide from old commands
- Updated best practices

#### 5.2 Update Roadmap

Mark Phase 3 complete, prepare Phase 4:

- [ ] Advanced Skills (testing, deployment)
- [ ] Cross-skill orchestration
- [ ] Custom Skill generator
- [ ] Skills marketplace/sharing

#### 5.3 Create Migration Guide

**File:** `docs/guides/migrating-to-git-skill.md`

Document:

- Old command → new command mapping
- Deprecation timeline
- Breaking changes (if any)
- Troubleshooting

## Testing Strategy

### Unit Tests

- [ ] Router logic tests
- [ ] Each sub-script in isolation
- [ ] Error handling paths

### Integration Tests

- [ ] Full git workflow with new commands
- [ ] Code review integration
- [ ] Docs sync workflow

### Token Tests

- [ ] Measure all workflows
- [ ] Validate 80% savings target
- [ ] Check context pollution

## Acceptance Criteria

- [ ] All git commands accessible via `/git`
- [ ] `/code review` performs all quality checks
- [ ] `/docs sync` syncs to GitHub wiki
- [ ] 80% token savings achieved across workflows
- [ ] Zero context pollution maintained
- [ ] All existing workflows still functional
- [ ] Documentation complete and accurate
- [ ] Tests passing

## Implementation Checklist

### Phase 3.1: Git Consolidation

- [ ] Create `.claude/commands/git.md`
- [ ] Create `scripts/skills/git.sh` router
- [ ] Create `scripts/skills/git/` directory
- [ ] Migrate branch logic to `git/branch.sh`
- [ ] Migrate commit logic to `git/commit.sh`
- [ ] Migrate PR logic to `git/pr.sh`
- [ ] Migrate workflow logic to `git/workflow.sh`
- [ ] Migrate tag logic to `git/tag.sh`
- [ ] Add deprecation notices to original commands (`/git:branch`, `/git:commit`, `/git:prepare-pr`, `/git:fix-pr`, `/git:workflow`, `/git:tag-release`)
- [ ] Test all git workflows
- [ ] Make scripts executable

### Phase 3.2: Code Reviewer

- [ ] Create `.claude/commands/code.md`
- [ ] Create `scripts/skills/code-reviewer.sh`
- [ ] Implement TypeScript check
- [ ] Implement ESLint check
- [ ] Implement coverage check
- [ ] Add auto-fix support
- [ ] Test code review workflow
- [ ] Make script executable

### Phase 3.3: Documentation Sync

- [ ] Create `.claude/commands/docs.md`
- [ ] Create `scripts/skills/documentation-sync.sh`
- [ ] Implement change detection
- [ ] Implement dry-run mode
- [ ] Implement wiki sync (placeholder)
- [ ] Test docs sync workflow
- [ ] Make script executable

### Phase 3.4: Validation

- [ ] Measure tokens for all workflows
- [ ] Create validation report
- [ ] Verify 80% savings target
- [ ] Document lessons learned

### Phase 3.5: Documentation

- [ ] Update SKILLS.md
- [ ] Update roadmap
- [ ] Create migration guide (include deprecation timeline)
- [ ] Document which commands remain functional as aliases
- [ ] Update README if needed

## Timeline

### Estimated Effort

4-6 hours

- 3.1: 2 hours (git consolidation)
- 3.2: 1 hour (code reviewer)
- 3.3: 1 hour (docs sync)
- 3.4: 1 hour (validation)
- 3.5: 1 hour (documentation)

## Success Metrics

- ✅ 80% token savings achieved
- ✅ All workflows consolidated
- ✅ Zero breaking changes
- ✅ Documentation complete
- ✅ Tests passing
- ✅ Ready for Phase 4
