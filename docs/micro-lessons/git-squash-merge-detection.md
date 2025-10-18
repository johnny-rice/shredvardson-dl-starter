# Git Squash Merge Detection

**Context:** GitHub's default merge method (squash merge) bypasses standard git merge detection, causing cleanup scripts to fail.

**Problem:** `git branch --merged` only works for standard merges, not squash merges where GitHub creates a new commit.

**Solution:** Use multi-method detection with fallbacks:

```bash
IS_MERGED=false

# Method 1: Standard git merge check
if git branch --merged origin/main | grep -q "  $BRANCH"; then
  IS_MERGED=true
fi

# Method 2: Remote branch deletion (GitHub squash merge indicator)
# Only if branch had upstream (was pushed)
if UPSTREAM_REF=$(git rev-parse --abbrev-ref "$BRANCH@{upstream}" 2>/dev/null); then
  UPSTREAM_REMOTE=${UPSTREAM_REF%%/*}
  UPSTREAM_BRANCH=${UPSTREAM_REF#*/}
  if [[ "$UPSTREAM_REMOTE" == "origin" ]] && ! git ls-remote --heads origin "$UPSTREAM_BRANCH" | grep -qF "$UPSTREAM_BRANCH"; then
    IS_MERGED=true
  fi
fi

# Method 3: PR status check (most reliable)
MERGED_PR=$(gh pr list --head "$BRANCH" --state merged --json number --jq '.[0].number' 2>/dev/null)
if [[ -n "$MERGED_PR" ]]; then
  IS_MERGED=true
fi
```

**Why it matters:**

- Prevents "branch not merged" errors on squash-merged PRs
- Enables automated cleanup workflows
- Supports GitHub's recommended merge strategy

**References:**

- Issue #123 - Fix git:finish for squash-merged PRs
- PR #122 - Implementation with CodeRabbit safety reviews

**Tags:** git, automation, squash-merge, cleanup
