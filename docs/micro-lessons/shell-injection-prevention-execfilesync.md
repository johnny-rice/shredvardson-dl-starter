---
UsedBy: 1
Severity: high
---

# Shell Injection Prevention with execFileSync

**Context.** Scripts using execSync with string interpolation are vulnerable to shell injection when user input (like PR titles, branch names) gets embedded in shell commands.

**Rule.** **Use execFileSync with argv arrays instead of execSync with interpolated strings for user-controlled input.**

**Example.**

```typescript
// ❌ Shell injection risk with user-controlled title
const title = userInput; // Could be: `"; rm -rf / #`
const result = execSync(`gh pr create --title "${title}"`, { encoding: 'utf-8' });

// ✅ Safe argv array prevents injection
import { execFileSync } from 'node:child_process';
const result = execFileSync('gh', ['pr', 'create', '--title', title], { encoding: 'utf-8' });
```

**Guardrails.**

- Use execFileSync/spawn for any command with user-controlled parameters
- Never interpolate user input into shell command strings
- Always pass arguments as separate array elements, not embedded in strings

**Tags.** security,shell-injection,execfilesync,command-execution,user-input
