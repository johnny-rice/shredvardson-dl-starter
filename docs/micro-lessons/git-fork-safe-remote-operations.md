# Git Fork-Safe Remote Operations

**Context:** Git scripts that hardcode `origin` will delete fork-sourced branches when upstream tracking points to a fork remote.

**Problem:** Branch upstream may be `fork/feature` (not `origin/feature`), but hardcoded `origin` checks return "not found" → script treats as merged → deletes unmerged work.

**Solution:** Extract remote name from upstream ref and scope operations accordingly:

```bash
# ❌ WRONG - Deletes fork branches
if ! git ls-remote --heads origin "$BRANCH" | grep -q "$BRANCH"; then
  # Thinks branch is deleted, force-deletes it
fi

# ✅ CORRECT - Fork-safe
if UPSTREAM_REF=$(git rev-parse --abbrev-ref "$BRANCH@{upstream}" 2>/dev/null); then
  UPSTREAM_REMOTE=${UPSTREAM_REF%%/*}  # Extract 'fork' from 'fork/feature'
  UPSTREAM_BRANCH=${UPSTREAM_REF#*/}   # Extract 'feature' from 'fork/feature'

  # Only apply origin-specific heuristics to origin branches
  if [[ "$UPSTREAM_REMOTE" == "origin" ]] && ! git ls-remote --heads "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH" | grep -qF "$UPSTREAM_BRANCH"; then
    # Safe to assume merged if origin branch deleted
  fi
fi
```

**Why it matters:**

- Prevents data loss in fork/contributor workflows
- Supports open-source contribution patterns
- CodeRabbit caught this as a "Major" issue

**Key pattern:**

- Always check `@{upstream}` exists before using remote deletion as signal
- Parse remote name from upstream ref (don't assume origin)
- Skip origin-specific heuristics for non-origin remotes

**References:**

- Issue #123 - Fix git:finish for squash-merged PRs
- PR #122 - CodeRabbit review caught fork safety bug
- ADR-003 - Git workflow improvements

**Tags:** git, fork, remote, safety, open-source
