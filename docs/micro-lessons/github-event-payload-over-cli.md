# Prefer GitHub Event Payload Over CLI for Reliability

**Pattern:** Avoid hard dependencies on GitHub CLI in CI scripts by reading GitHub Actions event payload first, falling back to CLI only when necessary.

## Problem

GitHub CLI (`gh`) can fail in CI due to:

- CLI not installed
- Authentication issues
- Network timeouts
- Rate limiting

This causes false negatives that block legitimate merges.

## Solution

**Primary**: Read directly from `GITHUB_EVENT_PATH` JSON payload:

```typescript
function checkForOverrideLabel(): boolean {
  try {
    // Primary: GitHub event payload (no external deps)
    const evPath = process.env.GITHUB_EVENT_PATH;
    const eventName = process.env.GITHUB_EVENT_NAME;
    if (evPath && existsSync(evPath) && (eventName === 'pull_request' || eventName === 'pull_request_target')) {
      const eventData = JSON.parse(readFileSync(evPath, 'utf8'));
      const labels = (eventData.pull_request?.labels ?? []).map((l: any) => (l.name || '').toLowerCase());
      return labels.includes('override:adr');
    }

    // Fallback: gh CLI with proper auth
    const prNumber = process.env.GITHUB_PR_NUMBER || /* extract from GITHUB_REF */;
    if (!prNumber) return false;

    const env = { ...process.env, GH_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN };
    const result = execSync(`gh pr view ${prNumber} --json labels`, { env });
    // ... handle result
  } catch (error) {
    return false; // Graceful degradation
  }
}
```

## Benefits

1. **Reliability**: Event payload is always available in GitHub Actions
2. **Performance**: No external API calls for primary path
3. **Robustness**: Graceful fallback when event data unavailable
4. **Security**: Direct data access, no CLI authentication issues

## When to Use

- Reading PR metadata (labels, body, numbers) in CI
- Governance checks that must not have false negatives
- Any CI logic depending on GitHub state

## Anti-pattern

```typescript
// ❌ Hard dependency on CLI
const result = execSync('gh pr view --json labels');
```

## Application

Applied in ADR enforcement for reading `override:adr` labels without external dependencies.

---

**Tags:** `github-actions`, `robustness`, `cli-fallback`, `event-payload`, `ci-reliability`, `coderabbit`
