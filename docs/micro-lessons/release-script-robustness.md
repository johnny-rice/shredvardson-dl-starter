# Make Release Scripts Robust to Empty Commits

## Problem
Release scripts fail when `changeset:version` creates no changes, causing `git commit` to exit with error code 1 due to empty commit.

## Solution
Use conditional commit logic that skips commit when no changes are staged:

```bash
# ❌ Before: fails on empty commits
"release": "pnpm changeset:version && git add -A && git commit -m 'chore(release): version bumps'"

# ✅ After: robust commit handling
"release:preflight": "test -z \"$(git status --porcelain)\" || (echo 'Working tree not clean. Commit, stash, or clean untracked files.' && exit 1)"
"release": "pnpm changeset:version && git add -A && git diff --cached --quiet || git commit -m 'chore(release): version bumps'"
```

## Key Improvements
- `git status --porcelain` detects both staged and untracked files
- `git diff --cached --quiet` checks if staging area has changes
- `||` operator skips commit when no changes are staged
- `;` separator continues to next step regardless of commit result

## Context
- Essential for automated release workflows
- Prevents CI failures on no-op version bumps
- Handles both manual and automated release scenarios

**Tags:** `release,git,empty-commits,robust-scripts,ci,automation,coderabbit`