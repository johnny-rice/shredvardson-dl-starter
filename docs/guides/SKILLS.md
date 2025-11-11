# Skills System Guide

Comprehensive guide to the Skills system in dl-starter - a progressive disclosure architecture for automated workflows optimized for human-AI collaboration.

## Table of Contents

- [Overview](#overview)
- [What Are Skills?](#what-are-skills)
- [Skills Architecture](#skills-architecture)
- [Using Existing Skills](#using-existing-skills)
- [Creating New Skills](#creating-new-skills)
- [Testing Skills](#testing-skills)
- [Skills in CI/CD](#skills-in-cicd)
- [Integration with Claude Code](#integration-with-claude-code)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What Problem Do Skills Solve?

Traditional approach to AI-assisted development:

- **Verbose prompts**: 5,000+ tokens per workflow
- **Context pollution**: Every detail loaded every time
- **Inconsistency**: Manual workflows prone to errors
- **Poor UX**: Users memorize complex commands

Skills approach:

- **Progressive disclosure**: Load only what's needed (Tier 1 → 2 → 3)
- **Token efficiency**: 65% average token savings
- **Automation**: Scripts handle repetitive tasks
- **Discoverability**: `/git`, `/db`, `/test` - simple, memorable

### Key Benefits

- ✅ **65% token savings** on average (77% for pure automation, 52% for LLM-assisted)
- ✅ **Progressive disclosure**: Three-tier architecture (metadata → overview → implementation)
- ✅ **Script execution**: Bash scripts handle automation
- ✅ **Type safety**: JSON output for structured data
- ✅ **Testable**: BATS testing framework for validation
- ✅ **Discoverable**: Simple slash commands like `/git`, `/test`, `/db`

### Project Structure

```
.claude/
├── commands/                   # Slash command definitions (Tier 1 + 2)
│   ├── README.md
│   ├── QUICK_REFERENCE.md
│   ├── git.md                 # /git command
│   ├── db.md                  # /db command
│   ├── test.md                # /test command
│   ├── spec.md                # /spec command
│   └── [...]
├── skills/                     # Detailed implementation guides (Tier 3)
│   ├── README.md
│   ├── supabase-integration/  # Database workflows
│   ├── test-scaffolder/       # Test generation
│   ├── prd-analyzer/          # Spec analysis
│   └── [...]
└── agents/                     # Sub-agent configurations
    └── [...]

scripts/skills/                 # Executable bash scripts
├── git.sh                     # Git router
├── git/                       # Git sub-skills
│   ├── branch.sh
│   ├── commit.sh
│   ├── pr.sh
│   ├── workflow.sh
│   └── tag.sh
├── code-reviewer.sh
├── design-system.sh
├── documentation-sync.sh
└── __tests__/                 # BATS test files
    ├── git.bats
    ├── git-branch.bats
    └── [...]
```

---

## What Are Skills?

### Definition

**Skills** are automated workflows that combine:

1. **Progressive disclosure docs** (`.claude/commands/*.md`)
2. **Executable scripts** (`scripts/skills/*.sh`)
3. **LLM orchestration** (Claude Code integration)

### Three-Tier Architecture

```
┌─────────────────────────────────────────────┐
│ Tier 1: Metadata (~50 tokens)              │
│ - Skill name, version, category            │
│ - Brief description                         │
│ - Token cost estimate                       │
└─────────────────────────────────────────────┘
               ↓ (User invokes: /git)
┌─────────────────────────────────────────────┐
│ Tier 2: Overview (~500 tokens)             │
│ - Detailed usage instructions              │
│ - Available actions/sub-skills             │
│ - Examples                                  │
│ - Execution command                         │
└─────────────────────────────────────────────┘
               ↓ (If script needs guidance)
┌─────────────────────────────────────────────┐
│ Tier 3: Implementation Guide (~2,000 tokens)│
│ - Detailed implementation steps            │
│ - Error handling patterns                  │
│ - Best practices                            │
└─────────────────────────────────────────────┘
```

### Workflow Example

```
User: /git branch Issue #123: Add dark mode

1. Claude loads /git command (Tier 2, ~500 tokens)
2. Identifies action: "branch"
3. Executes: bash scripts/skills/git.sh branch "Issue #123: Add dark mode"
4. Script returns JSON: { "branch": "123-add-dark-mode", "status": "created" }
5. Claude presents result to user
```

**Token savings**: ~4,500 tokens (compared to traditional 5,000 token prompt)

---

## Skills Architecture

### Progressive Disclosure

**Why Progressive Disclosure?**

Traditional approach loads everything:

```
User: "Create a feature branch"
LLM Context: 5,000 tokens (entire git workflow guide)
```

Progressive approach loads on-demand:

```
User: "/git branch Issue #123"
Tier 1: 50 tokens (metadata)
Tier 2: 500 tokens (overview + execution)
Total: 550 tokens (89% savings)
```

### Skill Categories

| Category | Examples | Token Savings |
|----------|----------|---------------|
| **Pure Automation** | `/git branch`, `/db:migrate` | 77% |
| **LLM-Assisted** | `/spec:plan`, `/code` | 52% |
| **Hybrid** | `/git pr`, `/test` | 60% |

**Pure Automation**: Script does everything, LLM just invokes it
**LLM-Assisted**: LLM uses Tier 3 guide to assist user
**Hybrid**: Script + LLM collaboration

### Command Definition Format

**Example**: `.claude/commands/git.md`

```markdown
---
skill: git
version: 1.0.0
category: workflow
token_cost: 500
description: Unified git workflow automation with intelligent routing
---

# /git - Unified Git Workflow

**Purpose:** Consolidated git operations replacing 5+ separate commands

## Usage

\```bash
/git <action> [args]
\```

## Available Actions

- **branch** `<issue>` - Create feature branch from issue
- **commit** `[message]` - Smart commit with conventions
- **pr** `<subaction>` - Pull request operations
  - `create` - Create PR with template
  - `prepare` - Prepare PR for review
  - `fix` - Preview and apply PR fixes
- **workflow** - Full git workflow automation
- **tag** `<version>` - Create release tag

## Examples

\```bash
# Create branch from issue
/git branch Issue #123: Add dark mode

# Smart commit
/git commit

# Create PR
/git pr create

# Full workflow
/git workflow
\```

## Execution

\```bash
bash scripts/skills/git.sh "$@"
\```

## Output Format

All actions return JSON:

\```json
{
  "status": "success|error",
  "action": "branch|commit|pr|workflow|tag",
  "data": { ... },
  "error": "Error message if status=error"
}
\```

## Related

- Tier 3 Guide: `.claude/skills/git-workflow/`
- Tests: `scripts/skills/__tests__/git*.bats`
- Scripts: `scripts/skills/git/*.sh`
```

### Script Implementation Pattern

**Router Script** (`scripts/skills/git.sh`):

```bash
#!/bin/bash
set -euo pipefail

# Get action (first argument)
ACTION="${1:-}"
shift || true

# Route to sub-skill
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
    # No action provided - return error with available actions
    jq -n '{
      error: "Action required",
      available_actions: ["branch", "commit", "pr", "workflow", "tag"],
      usage: "/git <action> [args]"
    }'
    exit 1
    ;;
  *)
    # Unknown action
    jq -n --arg action "$ACTION" '{
      error: "Unknown action",
      action: $action,
      available_actions: ["branch", "commit", "pr", "workflow", "tag"]
    }'
    exit 1
    ;;
esac
```

**Sub-Skill Script** (`scripts/skills/git/branch.sh`):

```bash
#!/bin/bash
set -euo pipefail

ISSUE="${1:-}"

# Validate input
if [[ -z "$ISSUE" ]]; then
  jq -n '{
    error: "Issue required",
    usage: "/git branch <issue>",
    example: "/git branch Issue #123: Add dark mode"
  }'
  exit 1
fi

# Extract issue number and title
ISSUE_NUMBER=$(echo "$ISSUE" | grep -oE '#[0-9]+' | tr -d '#' || echo "")
TITLE=$(echo "$ISSUE" | sed -E 's/^[^:]*: ?//' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

if [[ -z "$ISSUE_NUMBER" ]]; then
  jq -n '{
    error: "Could not extract issue number",
    usage: "Issue format: Issue #123: Title"
  }'
  exit 1
fi

# Create branch name
BRANCH_NAME="${ISSUE_NUMBER}-${TITLE}"

# Create branch
if git checkout -b "$BRANCH_NAME" 2>/dev/null; then
  jq -n \
    --arg branch "$BRANCH_NAME" \
    --arg issue "$ISSUE_NUMBER" \
    '{
      status: "success",
      action: "branch",
      data: {
        branch: $branch,
        issue: $issue
      }
    }'
else
  jq -n \
    --arg branch "$BRANCH_NAME" \
    '{
      error: "Failed to create branch",
      branch: $branch
    }'
  exit 1
fi
```

### JSON Output Standard

**Success Response:**

```json
{
  "status": "success",
  "action": "branch",
  "data": {
    "branch": "123-add-dark-mode",
    "issue": "123"
  }
}
```

**Error Response:**

```json
{
  "error": "Issue required",
  "usage": "/git branch <issue>",
  "example": "/git branch Issue #123: Add dark mode"
}
```

**Complex Response:**

```json
{
  "status": "success",
  "action": "pr",
  "data": {
    "url": "https://github.com/org/repo/pull/123",
    "number": 123,
    "title": "Add dark mode",
    "state": "open"
  }
}
```

---

## Using Existing Skills

### Discovery

**1. Quick Reference:**

```bash
# View available commands
cat .claude/commands/QUICK_REFERENCE.md
```

**2. Command Help:**

```bash
# View command documentation
cat .claude/commands/git.md
```

**3. In Claude Code:**

```
User: "What skills are available?"
Claude: Lists all available slash commands with descriptions
```

### Available Skills

#### `/git` - Git Workflow Automation

**Actions:**

- `branch <issue>` - Create feature branch from issue
- `commit [message]` - Smart commit with conventions
- `pr create` - Create PR with template
- `pr prepare` - Prepare PR for review (traceability, formatting)
- `pr fix` - Preview and apply PR fixes
- `workflow` - Full git workflow (branch → commit → PR)
- `tag <version>` - Create release tag

**Examples:**

```bash
/git branch Issue #123: Add dark mode
/git commit
/git pr create
/git workflow
```

#### `/db` - Database Operations

**Actions:**

- `migrate create <name>` - Create new migration
- `migrate apply` - Apply pending migrations
- `migrate validate` - Validate migration syntax
- `types` - Generate TypeScript types from schema
- `seed` - Seed database with test data

**Examples:**

```bash
/db migrate create add_users_table
/db types
/db seed
```

#### `/test` - Testing Workflows

**Actions:**

- `unit` - Run unit tests
- `e2e` - Run E2E tests
- `coverage` - Generate coverage report
- `watch` - Run tests in watch mode
- `generate <file>` - Generate test for file

**Examples:**

```bash
/test unit
/test coverage
/test generate src/lib/utils.ts
```

#### `/spec` - Specification Analysis

**Actions:**

- `specify` - Create spec file from description
- `plan` - Generate implementation plan from spec
- `tasks` - Break down spec into tasks

**Examples:**

```bash
/spec specify
/spec plan docs/specs/feature.md
```

#### `/code` - Code Quality

**Actions:**

- `review` - Review current changes
- `lint` - Run linters
- `format` - Format code
- `refactor <file>` - Suggest refactorings

**Examples:**

```bash
/code review
/code refactor src/components/Button.tsx
```

#### `/design` - Design System

**Actions:**

- `audit` - Audit components for design system compliance
- `generate <component>` - Generate component from design
- `tokens` - List design tokens

**Examples:**

```bash
/design audit
/design generate Button
```

### Usage Patterns

**1. Simple Commands:**

```
User: /git branch Issue #123: Add dark mode
Claude: Executes script, returns: "Created branch 123-add-dark-mode"
```

**2. Interactive Commands:**

```
User: /git commit
Claude: Reviews changes, suggests commit message
User: Looks good!
Claude: Executes commit
```

**3. Multi-Step Workflows:**

```
User: /git workflow
Claude:
1. Analyzes current changes
2. Creates feature branch
3. Commits changes
4. Creates pull request
5. Returns PR URL
```

---

## Creating New Skills

### When to Create a Skill

Create a Skill when:

- ✅ Workflow is repeated frequently (>3 times)
- ✅ Process has clear steps (automatable)
- ✅ High token cost (>1,000 tokens traditionally)
- ✅ Consistency is critical (standards enforcement)
- ✅ Users would benefit from discoverability

Don't create a Skill for:

- ❌ One-off tasks
- ❌ Highly variable workflows (no clear pattern)
- ❌ Simple operations (<200 tokens)

### Step-by-Step Guide

#### 1. Plan the Skill

**Define:**

- **Name**: Short, memorable (e.g., `/deploy`, `/lint`)
- **Category**: workflow, testing, database, code, etc.
- **Actions**: Sub-commands (e.g., `start`, `stop`, `status`)
- **Input/Output**: What data does it need/return?
- **Automation level**: Pure, hybrid, or LLM-assisted?

**Example Plan:**

```
Skill: /lint
Category: code-quality
Actions:
  - run [files] - Run linters on files
  - fix [files] - Auto-fix linting issues
  - config - Show linter configuration
Automation: Pure automation (script does everything)
Input: File paths (optional)
Output: JSON with errors/warnings
```

#### 2. Create Command Definition

**File**: `.claude/commands/lint.md`

```markdown
---
skill: lint
version: 1.0.0
category: code-quality
token_cost: 300
description: Run and fix linting issues across the codebase
---

# /lint - Code Linting

**Purpose:** Automated linting with ESLint and Prettier

## Usage

\```bash
/lint <action> [files]
\```

## Available Actions

- **run** `[files]` - Run linters (default: all files)
- **fix** `[files]` - Auto-fix linting issues
- **config** - Show linter configuration

## Examples

\```bash
# Lint all files
/lint run

# Lint specific files
/lint run src/components/Button.tsx

# Auto-fix issues
/lint fix

# View configuration
/lint config
\```

## Execution

\```bash
bash scripts/skills/lint.sh "$@"
\```

## Output Format

\```json
{
  "status": "success|error",
  "action": "run|fix|config",
  "data": {
    "files": ["..."],
    "errors": 0,
    "warnings": 2,
    "fixed": 0
  }
}
\```
```

#### 3. Create Script

**Router** (`scripts/skills/lint.sh`):

```bash
#!/bin/bash
set -euo pipefail

ACTION="${1:-run}"
shift || true

case "$ACTION" in
  run)
    exec "$(dirname "$0")/lint/run.sh" "$@"
    ;;
  fix)
    exec "$(dirname "$0")/lint/fix.sh" "$@"
    ;;
  config)
    exec "$(dirname "$0")/lint/config.sh" "$@"
    ;;
  *)
    jq -n --arg action "$ACTION" '{
      error: "Unknown action",
      action: $action,
      available_actions: ["run", "fix", "config"]
    }'
    exit 1
    ;;
esac
```

**Sub-Script** (`scripts/skills/lint/run.sh`):

```bash
#!/bin/bash
set -euo pipefail

FILES=("${@:-.}")

# Run ESLint
ESLINT_OUTPUT=$(pnpm eslint "${FILES[@]}" --format json 2>&1 || true)

# Parse results
ERRORS=$(echo "$ESLINT_OUTPUT" | jq '[.[].errorCount] | add // 0')
WARNINGS=$(echo "$ESLINT_OUTPUT" | jq '[.[].warningCount] | add // 0')

# Return JSON
if [[ "$ERRORS" -eq 0 ]]; then
  jq -n \
    --argjson errors "$ERRORS" \
    --argjson warnings "$WARNINGS" \
    --argjson files "$(printf '%s\n' "${FILES[@]}" | jq -R . | jq -s .)" \
    '{
      status: "success",
      action: "run",
      data: {
        files: $files,
        errors: $errors,
        warnings: $warnings
      }
    }'
else
  jq -n \
    --argjson errors "$ERRORS" \
    --argjson warnings "$WARNINGS" \
    --arg output "$ESLINT_OUTPUT" \
    '{
      error: "Linting failed",
      errors: $errors,
      warnings: $warnings,
      details: $output
    }'
  exit 1
fi
```

#### 4. Add Tests

**Test File** (`scripts/skills/__tests__/lint.bats`):

```bash
#!/usr/bin/env bats

setup() {
  load test_helper/common
  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export LINT_SKILL="$SCRIPT_DIR/lint.sh"
}

@test "lint.sh: runs without errors" {
  run bash "$LINT_SKILL" run --help

  assert_success
}

@test "lint.sh: returns valid JSON" {
  run bash "$LINT_SKILL" run

  echo "$output" | jq . > /dev/null
}

@test "lint.sh: routes to fix action" {
  run bash "$LINT_SKILL" fix --help

  [[ "$output" =~ "fix" ]]
}

@test "lint.sh: shows error for unknown action" {
  run bash "$LINT_SKILL" invalid

  assert_failure
  echo "$output" | jq -e '.error' > /dev/null
  echo "$output" | jq -e '.available_actions' > /dev/null
}
```

#### 5. Document Implementation (Optional Tier 3)

If the Skill requires LLM assistance, create Tier 3 guide:

**File**: `.claude/skills/code-quality/linting-guide.md`

```markdown
# Linting Implementation Guide

**Tier 3 - Detailed Implementation**

This guide provides detailed instructions for using the linting skill...

[Comprehensive guide with examples, best practices, etc.]
```

#### 6. Test the Skill

```bash
# Run BATS tests
bats scripts/skills/__tests__/lint.bats

# Test manually
bash scripts/skills/lint.sh run
bash scripts/skills/lint.sh fix
bash scripts/skills/lint.sh invalid
```

#### 7. Integrate with Claude Code

Test in Claude Code:

```
User: /lint run
Claude: Executes script, parses JSON output, presents results
```

### Best Practices

**Scripts:**

- ✅ Use `set -euo pipefail` for safety
- ✅ Return JSON for structured output
- ✅ Validate inputs, provide helpful errors
- ✅ Use `exec` for sub-scripts (avoids nested processes)
- ✅ Add `--help` flag for documentation

**Commands:**

- ✅ Keep Tier 2 concise (≤500 tokens)
- ✅ Include examples for every action
- ✅ Document output format
- ✅ Link to Tier 3 if needed

**Testing:**

- ✅ Test all actions
- ✅ Test error handling
- ✅ Validate JSON output
- ✅ Test with various inputs

---

## Testing Skills

### BATS Testing Framework

**Installation:**

```bash
# macOS
brew install bats-core

# Ubuntu/Debian
sudo apt-get install bats

# npm (cross-platform)
npm install -g bats
```

### Test Structure

**Test File Template** (`scripts/skills/__tests__/example.bats`):

```bash
#!/usr/bin/env bats
# Tests for example.sh

setup() {
  # Run before each test
  load test_helper/common
  disable_skill_logging
  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export EXAMPLE_SKILL="$SCRIPT_DIR/example.sh"
}

teardown() {
  # Run after each test (optional)
  :
}

@test "example.sh: shows usage when no action provided" {
  run bash "$EXAMPLE_SKILL"

  assert_failure
  assert_output_contains "Action required"
}

@test "example.sh: returns valid JSON" {
  run bash "$EXAMPLE_SKILL" test-action

  echo "$output" | jq . > /dev/null
}

@test "example.sh: accepts valid actions" {
  run bash "$EXAMPLE_SKILL" valid-action

  assert_success
  assert_output_contains "success"
}
```

### Test Helpers

**Common Helpers** (`scripts/skills/__tests__/test_helper/common.bash`):

```bash
#!/usr/bin/env bash

# Disable logging for cleaner test output
disable_skill_logging() {
  export SKILL_LOG_DISABLED=1
}

# Assert command succeeds
assert_success() {
  if [ "$status" -ne 0 ]; then
    echo "Expected success, got status $status"
    echo "Output: $output"
    return 1
  fi
}

# Assert command fails
assert_failure() {
  if [ "$status" -eq 0 ]; then
    echo "Expected failure, got success"
    return 1
  fi
}

# Assert output contains text
assert_output_contains() {
  local expected="$1"
  if [[ ! "$output" =~ $expected ]]; then
    echo "Expected output to contain: $expected"
    echo "Actual output: $output"
    return 1
  fi
}

# Assert valid JSON output
assert_valid_json() {
  if ! echo "$output" | jq . > /dev/null 2>&1; then
    echo "Invalid JSON output:"
    echo "$output"
    return 1
  fi
}
```

### Running Tests

```bash
# Run all Skills tests
pnpm test:skills

# Run with verbose output
pnpm test:skills:verbose

# Run specific test file
bats scripts/skills/__tests__/git.bats

# Run with TAP output
bats -t scripts/skills/__tests__/git.bats

# Run single test
bats scripts/skills/__tests__/git.bats -f "creates branch"
```

### Test Examples

**Testing Error Handling:**

```bash
@test "git/branch.sh: requires issue parameter" {
  run bash "$BRANCH_SKILL"

  assert_failure
  assert_output_contains '"error"'
  assert_output_contains 'Issue required'
}
```

**Testing Valid Input:**

```bash
@test "git/branch.sh: creates branch from issue" {
  run bash "$BRANCH_SKILL" "Issue #123: Add feature" --dry-run

  assert_success
  assert_output_contains '123-add-feature'
}
```

**Testing JSON Output:**

```bash
@test "git/branch.sh: returns valid JSON" {
  run bash "$BRANCH_SKILL" "Issue #123: Test" --dry-run

  assert_valid_json
  echo "$output" | jq -e '.data.branch' > /dev/null
  echo "$output" | jq -e '.data.issue' > /dev/null
}
```

**Testing Routing:**

```bash
@test "git.sh: routes to branch sub-skill" {
  run bash "$GIT_SKILL" branch --help

  assert_success
  [[ "$output" =~ "branch" ]]
}
```

### Testing Best Practices

- ✅ Test happy path (valid inputs)
- ✅ Test error cases (invalid/missing inputs)
- ✅ Test edge cases (empty strings, special characters)
- ✅ Validate JSON output structure
- ✅ Test routing logic
- ✅ Use descriptive test names
- ✅ Isolate tests (no shared state)

---

## Skills in CI/CD

### CI Pipeline Integration

Skills are tested automatically in CI:

**GitHub Actions** (`.github/workflows/ci.yml`):

```yaml
- name: Run Skills tests
  run: pnpm test:skills
```

### Pre-commit Hooks

Skills can be used in git hooks:

**Example** (`.husky/pre-commit`):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting with skill
bash scripts/skills/lint.sh fix

# Stage fixes
git add -u
```

### Continuous Validation

Skills ensure consistency:

- **Git workflow**: Branch naming, commit messages, PR templates
- **Testing**: Coverage thresholds, test performance
- **Database**: Migration validation, RLS policies
- **Code quality**: Linting, formatting, type checking

---

## Integration with Claude Code

### How Claude Code Uses Skills

**1. Discovery:**

- Claude Code reads `.claude/commands/` directory
- Loads command metadata (Tier 1)
- Makes commands available via slash syntax

**2. Invocation:**

```
User: /git branch Issue #123
↓
Claude Code:
1. Loads .claude/commands/git.md (Tier 2)
2. Parses action: "branch"
3. Prepares execution: bash scripts/skills/git.sh branch "Issue #123"
```

**3. Execution:**

```
Claude Code:
4. Executes script
5. Captures JSON output
6. Parses response
```

**4. Presentation:**

```
Claude Code:
7. Formats output for user
8. Returns: "✅ Created branch 123-issue-title"
```

### Token Savings Analysis

**Traditional Approach:**

```
User: "Create a feature branch from Issue #123"
LLM Context:
- Full git workflow guide: 3,000 tokens
- Branch naming conventions: 500 tokens
- Issue parsing patterns: 800 tokens
- Error handling: 700 tokens
Total: 5,000 tokens
```

**Skills Approach:**

```
User: "/git branch Issue #123"
LLM Context:
- Command metadata (Tier 1): 50 tokens
- Command overview (Tier 2): 500 tokens
- [Script handles execution, no implementation tokens]
Total: 550 tokens (89% savings)
```

### Progressive Loading

**Scenario 1: Pure Automation**

```
User: /git branch Issue #123
Tier 1: 50 tokens (metadata)
Tier 2: 500 tokens (how to invoke)
Tier 3: 0 tokens (not needed, script does everything)
Savings: 89%
```

**Scenario 2: LLM-Assisted**

```
User: /spec plan docs/specs/feature.md
Tier 1: 50 tokens
Tier 2: 500 tokens
Tier 3: 2,000 tokens (LLM needs implementation guide)
Savings: 49% (vs 5,000 token traditional approach)
```

### Hybrid Skills

Some Skills combine automation + LLM:

**Example**: `/git pr create`

```
1. Script gathers context:
   - Current branch
   - Recent commits
   - Diff stats
   - Returns JSON

2. Claude analyzes context:
   - Summarizes changes
   - Suggests PR title/description

3. Script creates PR:
   - Uses GitHub CLI
   - Returns PR URL

Token usage: ~1,500 (vs ~4,000 traditional)
Savings: 62%
```

---

## Troubleshooting

### Common Issues

#### 1. Skill Not Found

**Symptoms**: `/skill-name` not recognized

**Solution**:

```bash
# Verify command file exists
ls -la .claude/commands/skill-name.md

# Check YAML frontmatter
head -10 .claude/commands/skill-name.md

# Verify format
---
skill: skill-name
version: 1.0.0
---
```

#### 2. Script Execution Fails

**Symptoms**: Script returns errors

**Solution**:

```bash
# Test script directly
bash scripts/skills/skill-name.sh action args

# Check permissions
chmod +x scripts/skills/skill-name.sh

# Enable debugging
bash -x scripts/skills/skill-name.sh action args
```

#### 3. Invalid JSON Output

**Symptoms**: JSON parsing errors

**Solution**:

```bash
# Validate JSON manually
bash scripts/skills/skill-name.sh action | jq .

# Check for stderr contamination
bash scripts/skills/skill-name.sh action 2>&1 | jq .

# Use jq for generation
jq -n --arg value "data" '{ key: $value }'
```

#### 4. Tests Failing

**Symptoms**: BATS tests fail

**Solution**:

```bash
# Run tests with verbose output
bats -t scripts/skills/__tests__/skill.bats

# Test specific case
bats scripts/skills/__tests__/skill.bats -f "test name"

# Check test helpers
source scripts/skills/__tests__/test_helper/common.bash
```

#### 5. High Token Usage

**Symptoms**: Skill uses more tokens than expected

**Solution**:

- Move implementation details to Tier 3
- Keep Tier 2 under 500 tokens
- Use scripts for automation (not LLM)
- Reduce examples in Tier 2

#### 6. Slow Execution

**Symptoms**: Skills take >5s to execute

**Solution**:

```bash
# Profile script execution
time bash scripts/skills/skill-name.sh action

# Optimize subprocess calls
# Bad: Multiple git calls
git branch
git status
git log

# Good: Single call with all info
git branch && git status && git log
```

### Debug Mode

**Enable Debug Logging:**

```bash
# In script
set -x  # Print commands before execution
set -v  # Print input lines as they're read
```

**Test with Debug:**

```bash
bash -x scripts/skills/skill-name.sh action args 2>&1 | tee debug.log
```

**Check Script Output:**

```bash
# Capture stdout and stderr separately
bash scripts/skills/skill-name.sh action 1>stdout.log 2>stderr.log

# Review logs
cat stdout.log
cat stderr.log
```

---

## Next Steps

- **[TESTING.md](./TESTING.md)** - Skills testing with BATS
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Skills system architecture
- **[../skills-architecture.md](../skills-architecture.md)** - Detailed Skills architecture document
- **[../.claude/commands/QUICK_REFERENCE.md](../../.claude/commands/QUICK_REFERENCE.md)** - Quick reference for all commands

---

## Additional Resources

- [BATS Documentation](https://bats-core.readthedocs.io)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [Bash Best Practices](https://google.github.io/styleguide/shellguide.html)
- [Progressive Disclosure in UX](https://www.nngroup.com/articles/progressive-disclosure/)
