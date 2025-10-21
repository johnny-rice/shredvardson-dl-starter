---
name: _shared/branch-validation
when: Validating branch names and git state in /git:branch and /git:fix-pr
purpose: Reusable validation patterns for branch creation, name compliance, and git state checks
riskLevel: LOW
---

# Branch Validation Patterns

This template contains validation logic for branch operations used across multiple git commands.

## Pre-Branch Validation

### Current Branch Check
```bash
# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Ensure not on protected branches
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  echo "⚠️  Warning: You are on protected branch: $CURRENT_BRANCH"
  echo "Consider creating a feature branch instead."
fi
```

### Working Directory Status
```bash
# Check for uncommitted changes (handles repos without initial commit)
if git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
  if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes."
    echo "Please commit or stash them before proceeding."
    exit 1
  fi
else
  # No commits yet (no HEAD) - check for any tracked/modified files
  if [[ -n "$(git ls-files -m -o --exclude-standard)" ]]; then
    echo "⚠️  You have uncommitted changes."
    echo "Please commit or stash them before proceeding."
    exit 1
  fi
fi
```

## Branch Naming Validation

### Branch Type Validation
```bash
# Validate branch type
VALID_TYPES="feature|fix|chore|docs|refactor|test|ci|build"
if [[ ! "$TYPE" =~ ^($VALID_TYPES)$ ]]; then
  echo "❌ Invalid branch type: $TYPE"
  echo "Valid types: feature, fix, chore, docs, refactor, test, ci, build"
  exit 1
fi
```

### Issue Number Validation
```bash
# Validate issue number format (numeric)
if [[ ! "$ISSUE" =~ ^[0-9]+$ ]]; then
  echo "❌ Invalid issue number: $ISSUE"
  echo "Issue number must be numeric (e.g., 103, 42)"
  exit 1
fi
```

### Slug Validation
```bash
# Validate slug format (kebab-case, lowercase, no leading/trailing hyphens)
if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "❌ Invalid slug: $SLUG"
  echo "Slug must be lowercase, alphanumeric, kebab-case"
  echo "No leading or trailing hyphens allowed"
  echo "Example: add-user-authentication"
  exit 1
fi
```

## Branch Existence Check

### Local Branch Check
```bash
# Check if branch exists locally
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "⚠️  Branch already exists locally: $BRANCH_NAME"
  # Return true/false or handle switch logic
fi
```

### Remote Branch Check
```bash
# Check if branch exists on remote
if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
  echo "⚠️  Branch already exists on remote: $BRANCH_NAME"
  # Return true/false or handle pull logic
fi
```

## PR Validation

### Check PR Exists for Branch
```bash
# Check if PR exists for current branch
PR_NUMBER=$(gh pr view --json number -q '.number' 2>/dev/null)

if [[ -z "$PR_NUMBER" ]]; then
  echo "❌ No PR found for current branch"
  echo "Create a PR with: /git:prepare-pr"
  exit 1
fi
```

### Verify PR State
```bash
# Get PR state
PR_STATE=$(gh pr view "$PR_NUMBER" --json state -q '.state')

if [[ "$PR_STATE" == "MERGED" ]]; then
  echo "⚠️  PR #$PR_NUMBER is already merged"
  exit 1
elif [[ "$PR_STATE" == "CLOSED" ]]; then
  echo "⚠️  PR #$PR_NUMBER is closed"
  exit 1
fi
```

## Validation Checklists

### Before Creating Branch
- [ ] Git repository is initialized
- [ ] Working directory is clean (no uncommitted changes)
- [ ] Not on protected branch (main/master)
- [ ] Branch type is valid
- [ ] Issue number is numeric
- [ ] Slug is kebab-case format
- [ ] Branch name doesn't already exist

### Before Modifying PR
- [ ] PR exists for current branch
- [ ] PR is not merged or closed
- [ ] CI checks have run (or are running)
- [ ] No merge conflicts
- [ ] User has write permissions

### Before Committing
- [ ] Changes are staged
- [ ] Commit message is prepared
- [ ] No merge conflicts
- [ ] Tests pass (optional, but recommended)

## Integration with Other Commands

This template is referenced by:
- `/git:branch` - Branch creation validation
- `/git:fix-pr` - PR validation before fixing
- `/git:prepare-pr` - Pre-PR validation
- `/git:commit` - Pre-commit validation