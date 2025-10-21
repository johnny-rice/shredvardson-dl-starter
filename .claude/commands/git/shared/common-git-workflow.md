---
name: _shared/common-git-workflow
when: Following git best practices across all git commands
purpose: Git workflow best practices including branch protection, commit hygiene, and push/pull patterns
riskLevel: LOW
---

# Common Git Workflow Patterns

This template contains standard git command sequences and best practices used across multiple git commands.

## Standard Git Operations

### Branch Validation
Before creating or switching branches:
1. Check git status for uncommitted changes
2. Ensure working directory is clean or changes are stashed
3. Verify current branch (avoid working on main/master directly)
4. Pull latest changes from remote

### Safe Branch Operations
```bash
# Check for uncommitted changes (handles repos without initial commit)
if git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
  if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes."
    echo "Please commit or stash them before creating a new branch."
    exit 1
  fi
else
  # No commits yet (no HEAD) - check for any tracked/modified files
  if [[ -n "$(git ls-files -m -o --exclude-standard)" ]]; then
    echo "⚠️  You have uncommitted changes."
    echo "Please commit or stash them before creating a new branch."
    exit 1
  fi
fi
```

### Branch Existence Check
```bash
# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "⚠️  Branch already exists: $BRANCH_NAME"
  # Handle switch-if-exists logic here
fi
```

## Branch Hygiene

### Always Pull Before Push
```bash
# Ensure local branch is up to date
git pull origin $(git branch --show-current)
```

### Remote Branch Synchronization
```bash
# Fetch latest from remote
git fetch origin

# Check if remote branch exists
if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
  echo "Remote branch exists, pulling latest..."
  git pull origin "$BRANCH_NAME"
fi
```

## Conflict Resolution

### Basic Conflict Handling
If conflicts occur during merge/pull:
1. Identify conflicted files: `git status`
2. Resolve conflicts manually
3. Stage resolved files: `git add <file>`
4. Continue operation: `git merge --continue` or `git rebase --continue`
5. If stuck, abort: `git merge --abort` or `git rebase --abort`

### Pull-Push Pattern
```bash
# Safe push pattern
git pull origin $(git branch --show-current)
if [ $? -eq 0 ]; then
  git push origin $(git branch --show-current)
else
  echo "❌ Pull failed. Resolve conflicts before pushing."
  exit 1
fi
```

## Best Practices

1. **Never force push to main/master** - Use `--force-with-lease` on feature branches only
2. **Commit before switching branches** - Avoid stashing unless necessary
3. **Pull before starting work** - Always start with latest changes
4. **Use descriptive branch names** - Follow project naming conventions
5. **Keep commits atomic** - One logical change per commit
6. **Write meaningful commit messages** - See commit-formatting.md

## Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| `fatal: not a git repository` | Not in git directory | Navigate to repo root |
| `error: Your local changes...` | Uncommitted changes | Commit or stash changes |
| `error: pathspec ... did not match` | Branch doesn't exist | Check branch name spelling |
| `CONFLICT (content): Merge conflict` | Conflicting changes | Resolve conflicts manually |
| `error: failed to push` | Remote has newer commits | Pull then push |

## Integration with Other Commands

This template is referenced by:
- `/git:branch` - Branch creation validation
- `/git:fix-pr` - Pre-check logic before applying fixes
- `/git:prepare-pr` - Pre-PR validation