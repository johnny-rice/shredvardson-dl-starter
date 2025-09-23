# Check Git-Tracked Files Instead of File Presence

## Problem
Directory checks that use `readdirSync()` warn about generated files that exist but aren't tracked by git, creating false positives.

## Solution
Use `git ls-files` to check actual tracked files instead of file system presence:

```typescript
// ❌ Before: checks all files in directory
const files = readdirSync(artifactsPath);
const trackedFiles = files.filter(f => f !== '.keep');

// ✅ After: checks only git-tracked files
const trackedList = execSync('git ls-files -z -- artifacts', {encoding:'buffer'}).toString('utf8');
const trackedFiles = trackedList.split('\0').filter(p => p && !p.endsWith('artifacts/.keep'));
```

## Key Benefits
- No false positives from generated/temporary files
- Only warns about files actually committed to git
- Uses null-separated output (`-z`) to handle filenames with spaces
- More accurate for build artifact directories

## Context
- Essential for directories that contain generated files
- Particularly important for CI/CD artifact checks
- Prevents noise from legitimate temporary files

**Tags:** `git,file-checking,tracked-files,build-artifacts,false-positives,coderabbit`