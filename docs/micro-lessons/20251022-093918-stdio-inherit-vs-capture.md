---
title: "stdio: 'inherit' Prevents Output Capture in execSync"
date: 2025-10-21
category: nodejs
tags: [nodejs, child_process, execSync, stdio]
severity: medium
---

## Problem

Using `stdio: 'inherit'` forwards output directly to the parent process, making the captured variable **undefined or empty**:

```typescript
// ❌ BUG: output will be undefined/empty
const output = execSync('tsx migrate.ts apply', { encoding: 'utf-8', stdio: 'inherit' });
// output === undefined (or empty string)
```

## Solution

**Choose one approach based on your needs:**

### Option 1: Remove unused variable (keep inherit)

Use when you want output to appear in the terminal immediately:

```typescript
// ✅ Output streams to console, no capture
execSync('tsx migrate.ts apply', { encoding: 'utf-8', cwd: process.cwd(), stdio: 'inherit' });
// User sees output in real-time
```

### Option 2: Remove stdio (capture output)

Use when you need to process or validate the output:

```typescript
// ✅ Capture output for processing
const output = execSync('tsx migrate.ts apply', { encoding: 'utf-8', cwd: process.cwd() });
// output contains command results as string
```

## stdio Options Explained

| Option             | Behavior                       | Use Case                                      |
| ------------------ | ------------------------------ | --------------------------------------------- |
| `'inherit'`        | Forward to parent (no capture) | Interactive commands, progress indicators     |
| `'pipe'` (default) | Capture in variable            | Parsing output, validation, conditional logic |
| `'ignore'`         | Discard output                 | Background tasks, silent operations           |
| `[0, 1, 2]`        | Fine-grained control           | Custom stdin/stdout/stderr routing            |

## Why This Matters

- **Dead code**: Variable assigned but never usable
- **Logic errors**: Conditionals depending on captured output always fail
- **Performance**: Slight overhead for unused variable allocation

## Detection Pattern

Look for:

```typescript
const x = execSync(..., { stdio: 'inherit' });
// If x is never used, remove it
// If x is used, remove stdio: 'inherit'
```

## When to Use Each

**Use `stdio: 'inherit'`** when:

- Showing progress to user (build steps, migrations)
- Running interactive commands (prompts, TUIs)
- Wrapper scripts that forward output

**Capture output** when:

- Parsing command results (JSON, exit codes)
- Validating output format
- Conditional logic based on output
- Logging structured data

## Files Fixed

- `.claude/skills/supabase-integration/scripts/apply-migration.ts:13`
- `.claude/skills/supabase-integration/scripts/rollback-migration.ts:13`

## References

- [Node.js: child_process.execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options)
- [Node.js: stdio option](https://nodejs.org/api/child_process.html#optionsstdio)
