#!/usr/bin/env bash
set -euo pipefail

# Branch cleanup script - safely removes merged local and remote branches
# Usage: bash scripts/cleanup-branches.sh [--dry-run|--current]
#   --dry-run: Show what would be deleted without actually doing it
#   --current: Clean up the current branch after switching to main (useful after merge)

# Verify gh CLI is available
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI (gh) is required but not installed"
  echo "📦 Install: https://cli.github.com/"
  exit 1
fi

DRY_RUN=false
CLEANUP_CURRENT=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - showing what would be deleted"
elif [[ "${1:-}" == "--current" ]]; then
  CLEANUP_CURRENT=true
  echo "🔄 CURRENT BRANCH MODE - cleaning up current branch after merge"
fi

echo "🧹 Cleaning up merged branches..."

# Handle --current mode (clean up the branch we're currently on)
if [[ "$CLEANUP_CURRENT" == "true" ]]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

  # If already on main, try to detect last merged branch
  if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo "📍 Already on main, looking for last merged PR..."

    # Get the last merged PR's branch from most recent commit
    LAST_PR_BRANCH=$(gh pr list --state merged --limit 1 --json headRefName --jq '.[0].headRefName' 2>/dev/null || echo "")

    if [[ -n "$LAST_PR_BRANCH" ]]; then
      CURRENT_BRANCH="$LAST_PR_BRANCH"
      echo "🔍 Found last merged PR branch: $CURRENT_BRANCH"
    else
      echo "❌ Could not detect last merged branch. Please checkout the feature branch first."
      exit 1
    fi
  fi

  if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" || "$CURRENT_BRANCH" == "release" ]]; then
    echo "❌ Cannot cleanup main/develop/release branch"
    exit 1
  fi

  echo "📍 Target branch: $CURRENT_BRANCH"

  # Fetch and switch to main
  git fetch -p
  git switch main >/dev/null 2>&1 || { echo "❌ Failed to switch to main"; exit 1; }
  git pull >/dev/null 2>&1 || { echo "❌ Failed to pull main"; exit 1; }

  # Check if branch exists locally
  if ! git show-ref --verify --quiet "refs/heads/$CURRENT_BRANCH"; then
    echo "ℹ️  Local branch '$CURRENT_BRANCH' doesn't exist (already cleaned up?)"
    BRANCH_EXISTS=false
  else
    BRANCH_EXISTS=true
  fi

  # Smart merge detection: check multiple indicators
  IS_MERGED=false

  # Method 1: Standard git merge check
  if [[ "$BRANCH_EXISTS" == "true" ]] && git branch --merged origin/main | grep -q "  $CURRENT_BRANCH"; then
    IS_MERGED=true
    echo "✅ Detected: Branch merged via standard merge"
  fi

  # Method 2: Check if remote branch was deleted (GitHub squash merge indicator)
  # Only use this method if branch had an upstream (was pushed before)
  if UPSTREAM_REF=$(git rev-parse --abbrev-ref "$CURRENT_BRANCH@{upstream}" 2>/dev/null); then
    UPSTREAM_REMOTE=${UPSTREAM_REF%%/*}
    UPSTREAM_BRANCH=${UPSTREAM_REF#*/}
    # Only apply this heuristic for origin remote (not forks)
    if [[ "$UPSTREAM_REMOTE" == "origin" ]] && ! git ls-remote --heads "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH" | grep -qF "$UPSTREAM_BRANCH"; then
      IS_MERGED=true
      echo "✅ Detected: Remote branch deleted (likely squash-merged PR)"
    fi
  fi

  # Method 3: Check if there's a merged PR for this branch
  MERGED_PR=$(gh pr list --head "$CURRENT_BRANCH" --state merged --json number --jq '.[0].number' 2>/dev/null || echo "")
  if [[ -n "$MERGED_PR" ]]; then
    IS_MERGED=true
    echo "✅ Detected: PR #$MERGED_PR is merged"
  fi

  if [[ "$IS_MERGED" == "true" ]]; then
    echo "🧹 Cleaning up branch '$CURRENT_BRANCH'..."

    # Delete local branch (force delete if squash-merged)
    if [[ "$BRANCH_EXISTS" == "true" ]]; then
      git branch -D "$CURRENT_BRANCH" 2>/dev/null && echo "  ✓ Deleted local branch" || echo "  ℹ️  Local branch already deleted"
    fi

    # Delete remote branch if it exists
    git push origin --delete "$CURRENT_BRANCH" >/dev/null 2>&1 && echo "  ✓ Deleted remote branch" || echo "  ℹ️  Remote branch already deleted"

    echo "🎉 Branch '$CURRENT_BRANCH' cleaned up!"
    exit 0
  else
    echo "⚠️  Branch '$CURRENT_BRANCH' is not merged yet"
    echo "💡 Tip: Check 'gh pr view <pr-number>' to see PR status"
    exit 1
  fi
fi

# Normal cleanup mode
git fetch -p
git switch main >/dev/null 2>&1 || { echo "❌ Failed to switch to main"; exit 1; }
git pull >/dev/null 2>&1 || { echo "❌ Failed to pull main"; exit 1; }

echo "✅ On main branch, fetched latest"

# 1. Clean local merged branches
echo ""
echo "📍 Local branches merged to origin/main:"
LOCAL_BRANCHES=$(git branch --merged origin/main | egrep -v '^\*|main$|develop$|release' || true)

if [[ -z "$LOCAL_BRANCHES" ]]; then
  echo "  ✨ No local merged branches to clean"
else
  while IFS= read -r branch; do
    branch=$(echo "$branch" | xargs) # trim whitespace
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "  [DRY RUN] Would delete local branch: $branch"
    else
      echo "  🗑️  Deleting local branch: $branch"
      git branch -d "$branch"
    fi
  done <<< "$LOCAL_BRANCHES"
fi

# 2. Clean remote merged branches (skip those with open PRs)
echo ""
echo "📍 Remote branches merged to origin/main:"
REMOTE_BRANCHES=$(git branch -r --merged origin/main | sed 's|  origin/||' | egrep -v '^main$|^develop$|^release' || true)

if [[ -z "$REMOTE_BRANCHES" ]]; then
  echo "  ✨ No remote merged branches to clean"
else
  while IFS= read -r branch; do
    branch=$(echo "$branch" | xargs) # trim whitespace
    
    # Check if branch has open PR
    OPEN_PRS=$(gh pr list --head "$branch" --state open --json number --jq 'length' 2>/dev/null || echo "0")
    
    if [[ "$OPEN_PRS" != "0" ]]; then
      echo "  ⏭️  Skip $branch (has open PR)"
    elif [[ "$DRY_RUN" == "true" ]]; then
      echo "  [DRY RUN] Would delete remote branch: $branch"
    else
      echo "  🗑️  Deleting remote branch: $branch"
      git push origin --delete "$branch" >/dev/null 2>&1 || echo "    ⚠️  Failed to delete $branch (may already be gone)"
    fi
  done <<< "$REMOTE_BRANCHES"
fi

echo ""
if [[ "$DRY_RUN" == "true" ]]; then
  echo "🔍 Dry run complete! Run without --dry-run to actually delete branches."
else
  echo "✅ Branch cleanup complete!"
  echo "💡 Tip: Use 'git prune-merged' alias for quick local cleanup"
fi