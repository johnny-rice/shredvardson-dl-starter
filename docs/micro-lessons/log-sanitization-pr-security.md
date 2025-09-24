---
UsedBy: 1
Severity: high
---

# Log Sanitization for Security in PR Bodies

**Context.** PR automation scripts capture command output that may contain JWT tokens, API keys, or secrets that shouldn't be exposed in PR descriptions, logs, or persistent artifacts.

**Rule.** **Always sanitize command output before including it in PR bodies, logs, or any persistent documentation.**

**Example.** 
```typescript
// ❌ Exposes secrets in PR body
const result = execSync('gh auth status --show-token', { encoding: 'utf-8' });
const prBody = `Auth status:\n${result}`;

// ✅ Sanitized output prevents leaks  
const sanitize = (output: string) => 
  output
    .replace(/[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}/g, '***JWT***')
    .replace(/\b(token|password|secret|api[_-]?key|github_pat|ghp_[A-Za-z0-9]+)=\S+/gi, '$1=***REDACTED***');

const result = execSync('gh auth status --show-token', { encoding: 'utf-8' });
const prBody = `Auth status:\n${sanitize(result)}`;
```

**Guardrails.**
- Always sanitize before writing to PR descriptions, commit messages, or logs
- Test sanitization with realistic tokens/secrets to ensure patterns match
- Include log truncation to prevent massive outputs from overwhelming PR bodies

**Tags.** security,pr-automation,sanitization,secrets,jwt,tokens