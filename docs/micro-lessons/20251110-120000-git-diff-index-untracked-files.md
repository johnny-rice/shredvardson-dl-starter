# git diff-index Doesn't Detect Untracked Files

**Severity:** high  
**UsedBy:** 0  
**Tags:** #git #bash #testing #bug

## Context

Testing git workflow script that needed to determine if working tree is clean. Used `git diff-index --quiet HEAD` which passed tests locally but failed in CI with different file states.

## Problem

**`git diff-index` only detects changes to TRACKED files - it ignores untracked files entirely.**

```bash
# Create untracked file
echo "new" > untracked.txt

# git diff-index says tree is clean (WRONG!)
git diff-index --quiet HEAD && echo "clean" || echo "dirty"
# Output: clean

# But there IS an untracked file
git status --porcelain
# Output: ?? untracked.txt
```

## Rule

**Use `git status --porcelain` to detect ALL changes (tracked + untracked).**

## Example

```bash
# WRONG - Only detects tracked file changes
IS_CLEAN=$(git diff-index --quiet HEAD && echo "true" || echo "false")

# CORRECT - Detects both tracked changes AND untracked files
IS_CLEAN=$(test -z "$(git status --porcelain)" && echo "true" || echo "false")
```

## Guardrails

- Never use `git diff-index` alone for "is clean" checks
- Use `git status --porcelain` for complete working tree status
- Empty output from `git status --porcelain` means truly clean
- This caused 6 test failures - single bug cascaded through stage detection logic

## Related

- Issue #350: Skills test coverage
- Files: `scripts/skills/git/workflow.sh:14`
