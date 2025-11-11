# Git Workflow Patterns

**Category:** Development Workflow
**Impact:** High - Prevents CI failures, merge conflicts, data loss
**Lessons Synthesized:** 10 micro-lessons

## Overview

This guide consolidates safe git operation patterns that prevent common failures in collaborative development, particularly in monorepo environments with pnpm lockfiles and CI/CD pipelines.

## Core Principles

1. **Safety First:** Validate before destructive operations
2. **Deterministic Builds:** Lockfile integrity, reproducible installs
3. **Fork-Safe:** Operations work correctly in fork-based workflows
4. **Atomic Operations:** Complete or fail cleanly

---

## Pattern 1: pnpm Lockfile Management

**Problem:** Lockfile conflicts block PRs, CI fails with "lockfile out of sync" errors.

**Impact:** Critical (9/10) - CI reliability, blocked PRs

**Source Lessons:**
- `pnpm-lock-merge-conflicts.md`
- `20250124-192500-pnpm-lockfile-sync-after-package-json-edit.md`
- `github-actions-pnpm-setup-reliability.md`
- `pnpm-version-mismatch-workflows.md`

### ✅ Correct Pattern

```bash
# ALWAYS run pnpm install after editing package.json
# This updates pnpm-lock.yaml to match package.json

# Edit package.json
pnpm add -D vitest

# Immediately run install to sync lockfile
pnpm install

# Commit both together
git add package.json pnpm-lock.yaml
git commit -m "feat: add vitest"
```

### Merge Conflict Resolution

```bash
# When merging main and lockfile conflicts occur:

# 1. Accept main's lockfile
git checkout --theirs pnpm-lock.yaml

# 2. Merge package.json manually (if needed)
git checkout --ours package.json  # Or merge manually

# 3. Regenerate lockfile
pnpm install

# 4. Verify integrity
pnpm install --frozen-lockfile

# 5. Commit resolution
git add pnpm-lock.yaml package.json
git commit -m "chore: resolve lockfile conflict"
```

### GitHub Actions Setup

```yaml
# ✅ CORRECT: Proper pnpm setup sequence
steps:
  # 1. Install pnpm FIRST
  - uses: pnpm/action-setup@v4
    with:
      version: 8
      run_install: false  # Don't auto-install yet

  # 2. Setup Node with pnpm cache
  - uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: 'pnpm'

  # 3. Now install dependencies
  - run: pnpm install --frozen-lockfile

# ❌ WRONG: Setup Node before pnpm
steps:
  - uses: actions/setup-node@v4  # Too early!
  - uses: pnpm/action-setup@v4
```

### Key Points

- **Run `pnpm install` immediately after editing `package.json`**
- **Commit lockfile and package.json together** in same commit
- **Accept main's lockfile** in merge conflicts, then regenerate
- **Use `--frozen-lockfile` in CI** to catch desync issues
- **Install pnpm before Node.js** in GitHub Actions
- **Use `run_install: false`** to control install timing

### Quick Reference

| Scenario | Command |
|----------|---------|
| After editing package.json | `pnpm install` |
| Lockfile conflict | `git checkout --theirs pnpm-lock.yaml && pnpm install` |
| Verify lockfile sync | `pnpm install --frozen-lockfile` |
| CI install | `pnpm install --frozen-lockfile` |
| Fresh clone | `pnpm install` |

---

## Pattern 2: Safe Git Operations with User Input

**Problem:** User-provided branch names or paths enable command injection or access outside repo.

**Impact:** Critical (9/10) - Security vulnerability

**Source Lessons:**
- `20251103-144900-git-double-dash-separator-conditional.md`
- `git-fork-safe-remote-operations.md`
- `git-tracked-files-check.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Validate branch name before use
validate_branch_name() {
  local branch="$1"
  if [[ ! "$branch" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
    echo "Error: Invalid branch name: $branch" >&2
    exit 1
  fi
}

branch="$1"
validate_branch_name "$branch"

# Only use -- separator for commands that accept file paths
# git checkout: Can be branch OR file, needs separator
git checkout -- "$branch"  # If $branch is a file path
git checkout "$branch"     # If $branch is a branch name (validated)

# git log: Needs separator to disambiguate paths
git log -- "$file_path"

# git diff: Doesn't accept file paths as refs, no separator needed
git diff "$branch1" "$branch2"

# git diff with file filter: Needs separator
git diff "$branch" -- "$file_path"
```

### Fork-Safe Remote Operations

```bash
#!/bin/bash
# Detect if we're in a fork
is_fork() {
  local origin_url
  origin_url=$(git remote get-url origin)

  local upstream_url
  upstream_url=$(git remote get-url upstream 2>/dev/null)

  [[ -n "$upstream_url" ]] && [[ "$origin_url" != "$upstream_url" ]]
}

# Push to correct remote
if is_fork; then
  remote="origin"  # Push to fork
else
  remote="origin"  # Push to main repo
fi

git push -u "$remote" "$branch_name"
```

### Verify File is Tracked

```bash
# Before operating on file, verify it's tracked by git
is_tracked() {
  local file="$1"
  git ls-files --error-unmatch "$file" &>/dev/null
}

if ! is_tracked "$file_path"; then
  echo "Error: File not tracked by git: $file_path" >&2
  exit 1
fi

# Now safe to operate on file
git diff "$file_path"
```

### Key Points

- **Validate branch names** with `^[a-zA-Z0-9/_-]+$` pattern
- **Use `--` separator conditionally:** Only for commands accepting file paths
- **Detect fork scenario** with `git remote get-url`
- **Verify files are tracked** before git operations
- **Use explicit remote names,** not just `origin`

---

## Pattern 3: Squash Merge Detection

**Problem:** Branch appears up-to-date but diverges after squash merge, causing rebase failures.

**Impact:** Medium (6/10) - Workflow friction

**Source Lessons:**
- `git-squash-merge-detection.md`
- `robust-pr-diff-base.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Detect if branch was squash-merged

detect_squash_merge() {
  local branch="$1"
  local base="${2:-main}"

  # Check if branch is merged
  if git merge-base --is-ancestor "$branch" "$base"; then
    echo "Branch $branch was merged into $base"
    return 0
  fi

  # Check if squash merged (commits missing but changes merged)
  local branch_commits
  branch_commits=$(git log "$base..$branch" --oneline)

  if [ -z "$branch_commits" ]; then
    # No new commits, but verify changes aren't in base
    local diff_count
    diff_count=$(git diff "$base...$branch" | wc -l)

    if [ "$diff_count" -eq 0 ]; then
      echo "Branch $branch was squash-merged into $base"
      return 0
    fi
  fi

  return 1
}

# Usage: Clean up squash-merged branches
if detect_squash_merge "feature/my-branch"; then
  git branch -D "feature/my-branch"
else
  echo "Branch has unmerged changes"
fi
```

### Robust PR Diff Base

```bash
# Find correct base for PR diff
find_pr_base() {
  local branch="$1"

  # Try merge-base with main
  local base
  base=$(git merge-base "$branch" main)

  # Verify base is reachable from main
  if git merge-base --is-ancestor "$base" main; then
    echo "$base"
  else
    # Fall back to main HEAD
    echo "main"
  fi
}

# Generate diff for PR
base=$(find_pr_base "$BRANCH_NAME")
git diff "$base...$BRANCH_NAME"
```

### Key Points

- **Check `merge-base --is-ancestor`** to detect merges
- **Compare diff to verify squash merge** (no commits but no diff)
- **Use `...` (three dots)** for diff since fork point, not `..` (two dots)
- **Verify base is reachable from main** before using

---

## Pattern 4: Handling Untracked Files in Diffs

**Problem:** `git diff --exit-code` doesn't detect untracked files, causing silent failures.

**Impact:** Medium (7/10) - CI quality gates

**Source Lessons:**
- `20251110-120000-git-diff-index-untracked-files.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Check for both tracked changes AND untracked files

has_changes() {
  # Check for modified tracked files
  if ! git diff --exit-code --quiet; then
    echo "Detected modified tracked files"
    return 0
  fi

  # Check for staged changes
  if ! git diff --cached --exit-code --quiet; then
    echo "Detected staged changes"
    return 0
  fi

  # Check for untracked files
  if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "Detected untracked files"
    return 0
  fi

  return 1
}

# Usage in CI quality gate
if has_changes; then
  echo "Error: Uncommitted changes detected" >&2
  git status
  exit 1
fi
```

### Alternative: Using git-diff-index

```bash
# Faster check using diff-index
has_uncommitted_changes() {
  # Refresh index first
  git update-index --refresh >/dev/null 2>&1 || true

  # Check both index and working tree
  ! git diff-index --quiet HEAD -- &&
    [ -z "$(git ls-files --others --exclude-standard)" ]
}
```

### Key Points

- **Check three states:** Modified files, staged changes, untracked files
- **Use `--exclude-standard`** to respect `.gitignore`
- **Use `git update-index --refresh`** before `diff-index` for accuracy
- **Combine multiple checks** for comprehensive detection

---

## Pattern 5: Phase-Based PR Strategy

**Problem:** Large PRs mix multiple concerns, making review and rollback difficult.

**Impact:** Medium (7/10) - Code review quality

**Source Lessons:**
- `20251022-142700-phase-based-pr-strategy.md`
- `20251109-223017-pr-review-iteration-pattern.md`

### ✅ Correct Pattern

```bash
# Phase 1: Infrastructure/Setup
git checkout -b feature/auth-phase-1-setup
# Add: Database schema, migrations, types
git commit -m "feat(auth): add database schema and types"

# Phase 2: Core Logic
git checkout -b feature/auth-phase-2-logic
git merge feature/auth-phase-1-setup
# Add: Authentication service, business logic
git commit -m "feat(auth): add authentication service"

# Phase 3: Integration
git checkout -b feature/auth-phase-3-integration
git merge feature/auth-phase-2-logic
# Add: API routes, UI components
git commit -m "feat(auth): add API routes and UI"

# Create PRs sequentially:
# 1. phase-1 → main (merge when ready)
# 2. phase-2 → main (depends on phase-1)
# 3. phase-3 → main (depends on phase-2)
```

### PR Review Iteration Pattern

```markdown
## PR Review Iteration Pattern

**Round 1: Accessibility & Critical Issues**
- [ ] Fix accessibility issues (aria-labels, semantic HTML)
- [ ] Address security concerns
- [ ] Fix critical bugs

**Round 2: Type Safety & Error Handling**
- [ ] Add precise TypeScript types
- [ ] Improve error handling
- [ ] Add input validation

**Round 3: Polish & Optimization**
- [ ] Refactor for clarity
- [ ] Add tests
- [ ] Update documentation

**Merge Criteria:**
- All rounds completed
- CI passing
- 2+ approvals
```

### Key Points

- **Separate phases:** Setup, logic, integration
- **Merge phases sequentially** to validate each
- **Create dependent PRs** using merge from previous phase
- **Iterate in rounds:** Accessibility first, then types, then polish
- **Define clear merge criteria** upfront

---

## Pattern 6: GitHub Actions PR Context

**Problem:** `gh pr view` in CI fails in some contexts, GitHub event payload more reliable.

**Impact:** Medium (6/10) - CI reliability

**Source Lessons:**
- `github-event-payload-over-cli.md`
- `github-step-summary-usage.md`
- `gh-cli-flag-compatibility.md`

### ✅ Correct Pattern

```yaml
# Access GitHub context via environment variables
name: PR Validation
on: pull_request

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # ✅ Use event payload (always available)
      - name: Get PR info
        env:
          PR_NUMBER: ${{ github.event.pull_request.number }}
          PR_TITLE: ${{ github.event.pull_request.title }}
          PR_AUTHOR: ${{ github.event.pull_request.user.login }}
        run: |
          echo "PR #$PR_NUMBER: $PR_TITLE by $PR_AUTHOR"

      # ✅ Use GitHub Step Summary for rich output
      - name: Report results
        run: |
          echo "## Validation Results" >> $GITHUB_STEP_SUMMARY
          echo "- ✅ Linting passed" >> $GITHUB_STEP_SUMMARY
          echo "- ✅ Tests passed" >> $GITHUB_STEP_SUMMARY

# ❌ WRONG: Using gh pr view (may fail)
      - name: Get PR info (unreliable)
        run: |
          gh pr view --json number,title
```

### Key Points

- **Use `github.event` context** for PR information in workflows
- **Use `GITHUB_STEP_SUMMARY`** for rich output in CI
- **Store context vars in `env:`** before using in bash
- **Avoid `gh pr view` in workflows** (use for local dev only)

---

## Pattern 7: Constitution/Artifact Regeneration

**Problem:** Checksums and generated artifacts outdated after merging main.

**Impact:** Medium (6/10) - Project-specific but critical

**Source Lessons:**
- `constitution-checksum-merge-invalidation.md`
- `20251022-142600-command-index-regeneration.md`
- `20251022-142630-constitution-checksum-command-index.md`
- `20251109-113443-constitution-checksum-regeneration-instability.md`
- `20251107-122933-constitution-checksum-timestamp-normalization.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# After merging main, regenerate checksums and artifacts

regenerate_artifacts() {
  echo "Regenerating command index..."
  pnpm run constitution:update

  # Verify checksum is stable (no timestamp drift)
  old_checksum=$(git show HEAD:.claude/constitution-checksum.txt)
  new_checksum=$(cat .claude/constitution-checksum.txt)

  if [ "$old_checksum" != "$new_checksum" ]; then
    echo "Checksum updated, committing..."
    git add .claude/constitution-checksum.txt .claude/command-index.json
    git commit -m "chore: regenerate constitution artifacts after merge"
  else
    echo "Checksum stable, no changes needed"
  fi
}

# Usage after merging main
git checkout feature-branch
git merge main
regenerate_artifacts
```

### Timestamp Normalization

```typescript
// When generating checksums, normalize timestamps
function generateChecksum(config: Config): string {
  // Remove timestamp fields before hashing
  const normalized = {
    ...config,
    generatedAt: undefined,
    lastModified: undefined
  };

  return createHash('sha256')
    .update(JSON.stringify(normalized, null, 2))
    .digest('hex');
}
```

### Key Points

- **Regenerate after merging main** to catch new constitution changes
- **Normalize timestamps** before checksum calculation
- **Verify stability** before committing regenerated artifacts
- **Automate in pre-push hook** to prevent forgetting

---

## Checklist for Git Operations

Before pushing commits, verify:

- [ ] Ran `pnpm install` after editing `package.json`
- [ ] Committed `package.json` and `pnpm-lock.yaml` together
- [ ] Validated branch names with allowlist pattern
- [ ] Used `--` separator correctly in git commands
- [ ] Checked for untracked files in CI quality gates
- [ ] Regenerated checksums after merging main
- [ ] PR is single-phase or phases are clearly marked
- [ ] Used GitHub event payload in workflows, not `gh pr view`

---

## Common Scenarios

### Scenario 1: Lockfile Out of Sync

```bash
# CI fails with "ERR_PNPM_LOCKFILE_IS_UP_TO_DATE"
# Solution: Regenerate lockfile locally and commit

pnpm install
git add pnpm-lock.yaml
git commit -m "chore: sync lockfile"
git push
```

### Scenario 2: Merge Conflict in Lockfile

```bash
# During merge, lockfile conflicts
# Solution: Accept main's lockfile, regenerate

git merge main
# Conflict in pnpm-lock.yaml

git checkout --theirs pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: resolve lockfile conflict"
```

### Scenario 3: Squash-Merged Branch

```bash
# Branch shows diverged after PR merged
# Solution: Detect squash merge, delete branch

if detect_squash_merge "feature-branch"; then
  git branch -D feature-branch
  git push origin --delete feature-branch
fi
```

### Scenario 4: Untracked Files Not Detected

```bash
# CI quality gate passes but untracked files exist
# Solution: Add untracked files check

if [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "Error: Untracked files detected"
  exit 1
fi
```

---

## References

- **pnpm Documentation:** https://pnpm.io/
- **Git Documentation:** https://git-scm.com/doc
- **GitHub Actions Context:** https://docs.github.com/en/actions/learn-github-actions/contexts

---

## Related Patterns

- [Bash Safety Patterns](./bash-safety-patterns.md) - Input validation, safe commands
- [CI/CD Patterns](./ci-cd-patterns.md) - GitHub Actions, quality gates
- [Monorepo Patterns](./monorepo-patterns.md) - pnpm workspace configuration

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 10 micro-lessons from git-operations category
