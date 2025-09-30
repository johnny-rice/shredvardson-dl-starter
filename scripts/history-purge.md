# Git History Purge Guide

**When to use:** One-time cleanup to remove large files from git history permanently.

## Overview

This guide covers the process for purging large files (like the 19.5 MB backup bundle) from git history using `git filter-repo`. This is a destructive operation that rewrites history.

## Prerequisites

```bash
# Install git-filter-repo if not available
brew install git-filter-repo  # macOS
# or via Python package manager
python -m pip install git-filter-repo
```

## Pre-Purge Checklist

1. **Ensure clean working directory**
2. **Coordinate with team** (if applicable)
3. **Create backup branch** (optional but recommended)
4. **Verify large files** with audit script

```bash
# 1. Clean state
git status  # should be clean
git stash   # if needed

# 2. Backup (optional)
git branch backup-pre-purge

# 3. Audit current large files
pnpm run audit:large
```

## Purge Commands

### Target: backup-20250911.bundle

```bash
# Step 1: Ensure you're on main and up to date
git checkout main
git pull origin main

# Step 2: Execute the purge
git filter-repo --force --invert-paths --path backup-20250911.bundle

# Step 3: Force push the rewritten history
git push --force origin main

# Step 4: Verify cleanup
pnpm run audit:large
```

### General Purge Pattern

```bash
# Remove specific file
git filter-repo --force --invert-paths --path path/to/large/file.ext

# Remove multiple files
git filter-repo --force --invert-paths --path file1.ext --path file2.ext

# Remove entire directory
git filter-repo --force --invert-paths --path large-directory/
```

## Post-Purge Steps

### 1. Verify Repository State

```bash
# Check repository size
du -sh .git
ls -la  # verify files are gone

# Run full test suite
pnpm install
pnpm run build
pnpm run test
pnpm run doctor
```

### 2. Re-clone Instructions

**Important:** All contributors must re-clone after force-push

```bash
# Save any uncommitted work first
git stash

# Remove old clone
cd ..
rm -rf dl-starter-new

# Fresh clone
git clone git@github.com:Shredvardson/dl-starter.git dl-starter-new
cd dl-starter-new
pnpm install
```

### 3. Update Remote Tracking

If keeping existing clone (not recommended):

```bash
git fetch origin
git reset --hard origin/main
git clean -fdx
pnpm install
```

## Verification Checklist

- [ ] Repository size decreased significantly
- [ ] Target files no longer in git history
- [ ] `pnpm install` completes successfully
- [ ] `pnpm run build` passes
- [ ] `pnpm run test` passes
- [ ] `pnpm run doctor` shows no new failures
- [ ] All CI checks pass on main branch

## Recovery Plan

If purge causes issues:

```bash
# Option 1: Restore from backup branch
git checkout backup-pre-purge
git branch -M main
git push --force origin main

# Option 2: Revert to previous commit (if backup exists)
git reset --hard <commit-sha-before-purge>
git push --force origin main
```

## Repository Announcement Template

```markdown
# Repository History Purged - Re-clone Required

We've cleaned up the git history to remove large files (19.5 MB bundle).

**Action Required:** Please re-clone the repository:

1. Save any uncommitted work: `git stash`
2. Re-clone: `git clone git@github.com:Shredvardson/dl-starter.git`
3. Reinstall dependencies: `pnpm install`

**Benefits:**

- Faster clone times
- Reduced repository size
- Cleaner git history

**Questions?** Check scripts/history-purge.md or create an issue.
```

## Safety Notes

- **Destructive operation** - cannot be easily undone
- **Requires coordination** if multiple contributors
- **All clones become outdated** after force-push
- **CI/CD pipelines** may need cache clearing
- **Backup important work** before starting

## Testing the Purge Locally

```bash
# Test on a separate clone first
git clone git@github.com:Shredvardson/dl-starter.git test-purge
cd test-purge

# Run purge commands
git filter-repo --force --invert-paths --path backup-20250911.bundle

# Verify results
pnpm run audit:large
pnpm run doctor

# If successful, apply to main repository
cd ../dl-starter-new
# Repeat purge commands
```
