---
title: 'Always Validate CLI Arguments Before Shell Command Construction'
date: 2025-10-21
category: security
tags: [security, validation, command-injection, path-traversal]
severity: critical
---

## Problem

Using CLI arguments directly in shell commands or file paths allows **command injection** and **path traversal** attacks:

```typescript
// ❌ CRITICAL SECURITY ISSUE
const migrationName = process.argv[2];
execSync(`tsx migrate.ts create "${migrationName}"`);
// Attack: tsx migrate.ts create "foo; rm -rf /"

// ❌ CRITICAL SECURITY ISSUE
const userFlow = process.argv[2];
const testFile = join(testDir, `${userFlow}.spec.ts`);
// Attack: ../../../etc/passwd
```

## Solution

**Always validate input with allowlist patterns before use:**

```typescript
// ✅ SECURE: Validate migration name
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Migration name required');
  process.exit(1);
}

// Allowlist: alphanumeric and underscores only
if (!/^[a-zA-Z0-9_]+$/.test(migrationName)) {
  console.error('Invalid migration name: use only letters, numbers, and underscores');
  process.exit(1);
}

// Now safe to use in shell command
execSync(`tsx migrate.ts create "${migrationName}"`);
```

```typescript
// ✅ SECURE: Validate file path component
const userFlow = process.argv[2];

if (!/^[a-zA-Z0-9_-]+$/.test(userFlow)) {
  console.error('Invalid flow name: use only letters, numbers, hyphens, and underscores');
  process.exit(1);
}

// Now safe to use in path construction
const testFile = join(testDir, `${userFlow}.spec.ts`);
```

## Validation Patterns

| Use Case                  | Regex Pattern             | Rationale                                   |
| ------------------------- | ------------------------- | ------------------------------------------- |
| Database/migration names  | `^[a-zA-Z0-9_]+$`         | No path separators, no shell metacharacters |
| File names (with hyphens) | `^[a-zA-Z0-9_-]+$`        | Allows kebab-case, prevents traversal       |
| Strict identifiers        | `^[a-zA-Z][a-zA-Z0-9_]*$` | Must start with letter (variable-like)      |

## Why This Matters

- **Command injection**: Attacker executes arbitrary shell commands
- **Path traversal**: Attacker reads/writes files outside intended directory
- **No second chances**: Vulnerability is exploitable immediately upon deployment

## Defense in Depth

Even with validation, use additional protections:

```typescript
// 1. Validation (primary defense)
if (!/^[a-zA-Z0-9_]+$/.test(name)) process.exit(1);

// 2. Use arrays instead of string commands (prevents shell injection)
execSync(['tsx', 'migrate.ts', 'create', name]); // Node.js doesn't support this syntax

// 3. Verify resolved path is within expected directory
const resolved = path.resolve(testDir, `${name}.spec.ts`);
if (!resolved.startsWith(path.resolve(testDir))) {
  throw new Error('Path traversal detected');
}
```

## Detection Pattern

Search for these dangerous patterns:

- `process.argv[X]` used directly in `execSync()` string
- `process.argv[X]` used in `path.join()` or template literals for file paths
- Missing validation between input capture and usage

## Files Fixed

- `.claude/skills/supabase-integration/scripts/create-migration.ts:22-29`
- `.claude/skills/test-scaffolder/scripts/scaffold-e2e.ts:21-25`

## References

- [OWASP: Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [OWASP: Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
