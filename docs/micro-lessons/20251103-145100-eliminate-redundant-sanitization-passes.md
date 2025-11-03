---
UsedBy: 0
Severity: normal
---

# Eliminate Redundant Sanitization with Single Final Pass

**Context.** Implemented sanitization at both individual function level (getRepositoryInfo, getRecentCommits) and final aggregation level (sanitizeForAIContext). While idempotent, this caused double-sanitization of remote URLs and commit messages, wasting CPU cycles.

**Rule.** **When aggregating data from multiple sources, apply sanitization once at the final aggregation point rather than at each individual source.**

**Example.**

```typescript
// ❌ INEFFICIENT: Double sanitization
export function getGitContext(options?: GitContextOptions): GitContext {
  const repository = getRepositoryInfo({ sanitize: true }); // Sanitizes remote
  const commits = getRecentCommits({ sanitize: true });     // Sanitizes messages

  const context = { repository, commits, ... };

  // Re-sanitizes everything (idempotent but wasteful)
  return sanitizeForAIContext(context);
}

// ✅ EFFICIENT: Single sanitization pass
export function getGitContext(options?: GitContextOptions): GitContext {
  const repository = getRepositoryInfo({ sanitize: false }); // Raw data
  const commits = getRecentCommits({ sanitize: false });     // Raw data

  const context = { repository, commits, ... };

  // Single comprehensive sanitization
  return sanitizeForAIContext(context);
}
```

**Guardrails.**

- Document which function is responsible for sanitization (prefer aggregation point)
- Keep sanitization functions idempotent so double-sanitization doesn't corrupt data
- Add comment explaining why individual functions skip sanitization
- Ensure final sanitization covers all fields (remote URLs, commit messages, file paths)
- Test both sanitize=true and sanitize=false paths to verify correctness

**Tags.** performance, sanitization, optimization, api-design, typescript
