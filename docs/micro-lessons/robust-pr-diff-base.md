# Use Robust PR Base Detection for Git Diffs

## Summary
Use `git merge-base` to compute the true PR base and diff with `${base}...HEAD`, with a fallback to `HEAD~1` if needed.

## When to use
- CI checks that need accurate changed files across multi-commit PRs, rebases, or squash merges.
- Local scripts that must match GitHub's PR diff behavior.

## Problem
`git diff --name-only HEAD~1` is fragile for multi-commit PRs and squash merges, often missing files or including unrelated changes.

## Solution
Use merge-base to find the correct diff point with fallback handling:

```typescript
// ❌ Fragile: only checks against previous commit
const changedFiles = execSync('git diff --name-only HEAD~1', { 
  encoding: 'utf8',
  stdio: 'pipe'
}).trim().split('\n').filter(f => f.length > 0);

// ✅ Robust: finds actual PR base with fallback
const baseRef = process.env.GITHUB_BASE_REF || 'origin/main';
let changedFiles: string[] = [];

try {
  // Find merge-base to diff against
  const base = execSync(`git merge-base ${baseRef} HEAD`, {stdio:'pipe', encoding:'utf8'}).trim();
  changedFiles = execSync(`git diff --name-only ${base}...HEAD`, {
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim().split('\n').filter(f => f.length > 0);
} catch (error) {
  // Fallback to HEAD~1 if merge-base fails
  changedFiles = execSync('git diff --name-only HEAD~1', { 
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim().split('\n').filter(f => f.length > 0);
}
```

## Why This Works
- Uses `GITHUB_BASE_REF` from GitHub Actions environment
- `git merge-base` finds the actual branch point
- `${base}...HEAD` shows all changes in the PR
- Fallback ensures compatibility with local development

## Context
- Essential for PR compliance checks
- Handles squash merges, multi-commit PRs, and rebases
- Works in both CI and local environments

**Tags:** `git,pr,diff,merge-base,github-actions,robust-diffing,coderabbit`