---
name: _shared/error-handling
when: Handling git errors and recovery in /git:branch, /git:fix-pr, and other git commands
purpose: Comprehensive error detection, messaging, and recovery patterns for common git failure modes
riskLevel: LOW
---

# Git Error Handling Patterns

This template contains common git error scenarios, detection, and remediation patterns used across git commands.

## Common Git Errors

### Repository Errors

#### Not a Git Repository

```bash
# Error: fatal: not a git repository (or any of the parent directories): .git
# Detection
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not a git repository"
  echo "Initialize with: git init"
  exit 1
fi
```

#### Repository Not Initialized

```bash
# Error: No commits yet
# Detection
if ! git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
  echo "⚠️  No commits in repository yet"
  echo "Create initial commit first"
  exit 1
fi
```

### Branch Errors

#### Branch Already Exists

```bash
# Error: fatal: A branch named 'feature/123' already exists
# Detection
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "⚠️  Branch already exists: $BRANCH_NAME"
  read -p "Switch to existing branch? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git switch "$BRANCH_NAME"
    exit 0
  else
    echo "❌ Choose a different branch name"
    exit 2
  fi
fi
```

#### Branch Does Not Exist

```bash
# Error: error: pathspec 'feature/123' did not match any file(s) known to git
# Detection
if ! git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "❌ Branch does not exist: $BRANCH_NAME"
  echo "Available branches:"
  git branch --list
  exit 1
fi
```

#### Protected Branch Operation

```bash
# Error: Attempting to modify main/master directly
# Detection
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  echo "❌ Cannot modify protected branch: $CURRENT_BRANCH"
  echo "Create a feature branch instead: /git:branch"
  exit 1
fi
```

### Working Directory Errors

#### Uncommitted Changes

```bash
# Error: error: Your local changes to the following files would be overwritten
# Detection and remediation
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  You have uncommitted changes:"
  git status --short
  echo ""
  echo "Options:"
  echo "  1. Commit changes: /git:commit"
  echo "  2. Stash changes: git stash"
  echo "  3. Discard changes: git restore ."
  exit 1
fi
```

#### Untracked Files

```bash
# Error: The following untracked working tree files would be overwritten
# Detection
if [[ -n "$(git ls-files -o --exclude-standard)" ]]; then
  echo "⚠️  You have untracked files"
  git ls-files -o --exclude-standard
  echo ""
  echo "Add them with: git add <file>"
  echo "Or ignore them with: .gitignore"
fi
```

### Remote Errors

#### Remote Branch Diverged

```bash
# Error: ! [rejected] branch -> branch (non-fast-forward)
# Detection
git fetch origin "$BRANCH_NAME" 2>/dev/null
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/"$BRANCH_NAME" 2>/dev/null)

if [[ -n "$REMOTE" && "$LOCAL" != "$REMOTE" ]]; then
  # Check if local is behind remote
  if git merge-base --is-ancestor HEAD origin/"$BRANCH_NAME" 2>/dev/null; then
    echo "⚠️  Local branch is behind remote"
    echo "Pull changes: git pull origin $BRANCH_NAME"
    exit 1
  else
    echo "⚠️  Branches have diverged"
    echo "Resolve with: git pull --rebase origin $BRANCH_NAME"
    exit 1
  fi
fi
```

#### Push Rejected

```bash
# Error: error: failed to push some refs
# Detection and safe push pattern
git pull origin "$BRANCH_NAME"
if [ $? -eq 0 ]; then
  git push origin "$BRANCH_NAME"
else
  echo "❌ Pull failed - resolve conflicts first"
  echo "Check status: git status"
  echo "Resolve conflicts, then: git add <file> && git commit"
  exit 1
fi
```

#### No Remote Configured

```bash
# Error: fatal: No configured push destination
# Detection
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ No remote repository configured"
  echo "Add remote with: git remote add origin <url>"
  exit 1
fi
```

### Merge Conflict Errors

#### Merge Conflicts Detected

```bash
# Error: CONFLICT (content): Merge conflict in <file>
# Detection
if ! git merge-base --is-ancestor origin/main HEAD 2>/dev/null; then
  echo "⚠️  Your branch may have conflicts with main"
  echo "Test merge: git merge origin/main --no-commit --no-ff"
fi

# After merge attempt
if git ls-files -u | grep -q .; then
  echo "❌ Merge conflicts detected:"
  git diff --name-only --diff-filter=U
  echo ""
  echo "Resolve conflicts manually, then:"
  echo "  1. git add <resolved-files>"
  echo "  2. git merge --continue"
  echo ""
  echo "Or abort: git merge --abort"
  exit 1
fi
```

### CI/GitHub Errors

#### PR Not Found

```bash
# Error: no pull requests found
# Detection
PR_NUMBER=$(gh pr view --json number -q '.number' 2>/dev/null)
if [[ -z "$PR_NUMBER" ]]; then
  echo "❌ No PR found for current branch"
  echo "Create one with: /git:prepare-pr"
  exit 1
fi
```

#### CI Checks Pending

```bash
# Error: Checks are still running
# Detection and wait pattern
MAX_WAIT=300  # 5 minutes
ELAPSED=0
INTERVAL=30

while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS=$(gh pr checks "$PR_NUMBER" --json state -q '.[].state' 2>/dev/null)

  if echo "$STATUS" | grep -q "PENDING\|QUEUED"; then
    echo "⏳ CI checks still running... ($ELAPSED/${MAX_WAIT}s)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
  else
    break
  fi
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "⏱️  CI checks timeout - still pending after ${MAX_WAIT}s"
  echo "Check manually: gh pr checks $PR_NUMBER"
  exit 1
fi
```

#### GitHub CLI Not Authenticated

```bash
# Error: gh: authentication required
# Detection
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ GitHub CLI not authenticated"
  echo "Login with: gh auth login"
  exit 1
fi
```

## Error Recovery Patterns

### Retry with Backoff

```bash
MAX_RETRIES=3
RETRY_COUNT=0
BACKOFF=2

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if git push origin "$BRANCH_NAME"; then
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "Retry $RETRY_COUNT/$MAX_RETRIES in ${BACKOFF}s..."
      sleep $BACKOFF
      BACKOFF=$((BACKOFF * 2))
    fi
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed after $MAX_RETRIES attempts"
  exit 1
fi
```

### Safe Abort Pattern

```bash
# Provide safe exit on errors
set -e  # Exit on error
trap 'echo "❌ Command failed at line $LINENO"; exit 1' ERR

# Or manual cleanup
cleanup() {
  echo "🧹 Cleaning up..."
  git reset --hard HEAD  # Revert to clean state
  git clean -fd  # Remove untracked files
}

trap cleanup EXIT
```

## Error Messages Best Practices

### Clear Error Messages

```bash
# ❌ Bad: Unclear error
echo "Error occurred"

# ✅ Good: Clear error with context
echo "❌ Failed to create branch: $BRANCH_NAME already exists"
echo "Switch to it with: git switch $BRANCH_NAME"
echo "Or choose a different name"
```

### Actionable Guidance

```bash
# ❌ Bad: Error without solution
echo "Uncommitted changes detected"

# ✅ Good: Error with next steps
echo "⚠️  Uncommitted changes detected"
echo ""
echo "Options:"
echo "  1. Commit: /git:commit"
echo "  2. Stash: git stash"
echo "  3. Discard: git restore ."
```

## Integration with Other Commands

This template is referenced by:

- `/git:branch` - Branch creation error handling
- `/git:fix-pr` - PR fixing error recovery
- `/git:commit` - Commit error handling
- `/git:prepare-pr` - PR creation error handling

## Debugging Tips

### Enable Verbose Git Output

```bash
# For debugging, enable verbose output
GIT_TRACE=1 git <command>
GIT_CURL_VERBOSE=1 git push  # For remote operations
```

### Check Git Configuration

```bash
# Verify git config
git config --list --show-origin
git config user.name
git config user.email
```

### Validate Repository State

```bash
# Full repository health check
git fsck --full
git status
git log --oneline -5
git remote -v
```
