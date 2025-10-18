# Discovered Bug Protocol (Legitimate Bypass)

**When to use:** You discover a bug DURING implementation of another issue that blocks your current work.

This is a **legitimate lane bypass** - fix immediately, document retroactively.

## Step-by-Step Workflow

### 1. Create Branch and Fix Immediately

```bash
# Don't block current work - fix it now
git checkout -b fix/descriptive-bug-name

# Make changes
git add -A
git commit -m "fix: Brief description

Discovered during Issue #X while working on [context].

[Explain the bug and fix]"

git push -u origin fix/descriptive-bug-name
```

### 2. Create PR with Proper Template

```bash
gh pr create --title "fix: Bug description" \
  --body "$(cat .github/pull_request_template.md)" \
  --base main

# Fill in PR template, noting "Discovered during #X"
```

### 3. Create Issue Retroactively

Use the `/github:create-issue` command, or manually:

```bash
gh issue create --title "Fix: Bug description" --label "bug" --body "
## Problem
[Describe the bug]

## Discovered During
Issue #X - [what you were working on]

## Root Cause
[Explain why it happened]

## Solution
PR #Y (already implemented)

## Impact
[How it affects users/workflow]
"
```

### 4. Link PR to Issue

```bash
# Get the issue number (e.g., #123)
gh pr edit <PR-NUMBER> --body "[Update summary to add: Fixes #<ISSUE-NUMBER>]"
```

## Commands to Use

- ✅ `/git:branch` - Create properly named branch
- ✅ `/github:create-issue` - Create retroactive issue
- ✅ `/git:prepare-pr` - Create PR with template

## Why This Bypass is Acceptable

- ✅ Bugs blocking current work should be fixed immediately
- ✅ Retroactive documentation maintains audit trail
- ✅ Faster than stopping to spec/plan a bug fix
- ✅ Issue → PR linkage preserves traceability

## Real Example

**Issue #123 / PR #122** - Discovered during Issue #60 post-merge cleanup:

1. Fixed `git:finish` bug in branch `fix/git-finish-squash-merge`
2. Created PR #122 with full template
3. Created Issue #123 retroactively
4. Linked PR #122 to Issue #123
5. **Result**: ✅ Full traceability, bug fixed immediately

## NOT Acceptable For

- ❌ **New features** (use proper lanes)
- ❌ **Architecture changes** (need ADR + spec)
- ❌ **Breaking changes** (need planning)
- ❌ **Security issues** (follow incident protocol)

## Comparison to Normal Workflows

| Scenario            | Workflow                 | Why                      |
| ------------------- | ------------------------ | ------------------------ |
| **Discovered bug**  | This bypass protocol     | Don't block current work |
| **Planned bug fix** | Simple workflow          | Follow normal process    |
| **New feature**     | Spec-driven (if complex) | Needs planning           |
| **Security issue**  | Incident response        | Critical path            |

## Quality Checklist

Even with bypass, maintain quality:

- [ ] Branch name follows convention (`fix/descriptive-name`)
- [ ] Commit message explains discovery context
- [ ] PR uses proper template
- [ ] Issue created (even if retroactive)
- [ ] PR linked to issue (`Fixes #X`)
- [ ] All tests pass
- [ ] Documentation updated if needed
