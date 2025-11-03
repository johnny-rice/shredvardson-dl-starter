---
UsedBy: 0
Severity: high
---

# Git `--` Separator Requires Conditional Logic

**Context.** Implementing defense-in-depth security for git command execution. Documentation claimed all commands used `--` separator to prevent flag injection, but actual implementation caused "unknown option: --" errors for commands like `rev-parse`, `remote`, and `status`.

**Rule.** **Only add the `--` separator for git commands that accept file paths as arguments (diff, log, show, add, rm, etc.), not for all git commands.**

**Example.**

```typescript
// ❌ WRONG: Breaks commands that don't support --
const result = spawnSync('git', ['--', ...args], { shell: false });
// Error: "unknown option: --" for git rev-parse --show-toplevel

// ✅ CORRECT: Conditional separator based on command
const COMMANDS_WITH_FILES = new Set(['diff', 'log', 'show', 'add', 'rm', 'mv']);
const needsSeparator = COMMANDS_WITH_FILES.has(args[0]);
const finalArgs = needsSeparator && hasFileArgs(args) ? insertSeparator(args) : args;
const result = spawnSync('git', finalArgs, { shell: false });
```

**Guardrails.**

- Maintain whitelist of commands that support `--` (diff, log, show, add, rm, mv, checkout, reset, restore, grep, blame)
- Only insert `--` when both: (1) command supports it, AND (2) file arguments are present
- Insert `--` at correct position: after flags, before file paths
- Test both with and without `--` to catch commands that don't support it
- Document why each command is/isn't in the whitelist

**Tags.** git, security, command-injection, defense-in-depth, typescript
