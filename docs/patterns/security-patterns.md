# Security Patterns

**Category:** Security & Data Protection
**Impact:** Critical - Prevents injection attacks, credential leaks, unauthorized access
**Lessons Synthesized:** 12 micro-lessons

## Overview

This guide consolidates security patterns that prevent common vulnerabilities across the application stack: command injection, SQL injection, RLS bypasses, credential leakage, and insecure operations.

## Core Principles

1. **Defense in Depth:** Multiple layers of protection (validation + safe APIs + verification)
2. **Fail Closed:** Reject invalid input, don't try to sanitize
3. **Least Privilege:** Minimal permissions, explicit role specifications
4. **Secure by Default:** Safe patterns as the default, not opt-in

---

## Pattern 1: Input Validation Before Processing

**Problem:** User input used directly in commands, queries, or paths enables injection attacks.

**Impact:** Critical (10/10) - Command injection, SQL injection, path traversal

**Source Lessons:**
- `20251022-093043-input-validation-cli-scripts.md`
- `20251103-145000-input-validation-before-sanitization.md`
- `sql-identifier-validation.md`

### ✅ Correct Pattern

```typescript
import { z } from 'zod';

// Define allowlist schemas at module level
const identifierSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/, {
  message: 'Identifier must contain only alphanumeric, underscore, hyphen'
});

const filePathSchema = z.string().regex(/^[a-zA-Z0-9_/.-]+$/, {
  message: 'File path contains invalid characters'
});

const sqlIdentifierSchema = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
  message: 'SQL identifier must start with letter/underscore, contain only alphanumeric/underscore'
});

// Validate at API boundaries
function processSkill(skillName: string) {
  // Validate BEFORE any processing
  const validated = identifierSchema.parse(skillName);

  // Now safe to use in file paths
  const configPath = path.join('.claude/skills', validated, 'config.yaml');

  // Safe to use in commands
  execFileSync('git', ['add', configPath]);
}

// SQL identifier validation
function buildQuery(tableName: string, columnName: string) {
  const table = sqlIdentifierSchema.parse(tableName);
  const column = sqlIdentifierSchema.parse(columnName);

  // Safe to use in query (but still use parameterized queries!)
  return `SELECT ${column} FROM ${table} WHERE id = $1`;
}
```

### Bash Equivalent

```bash
#!/bin/bash

validate_identifier() {
  local input="$1"
  local name="$2"

  if [[ ! "$input" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: Invalid $name: $input" >&2
    echo "Must contain only alphanumeric, underscore, hyphen" >&2
    exit 1
  fi
}

# Validate before use
skill_name="$1"
validate_identifier "$skill_name" "skill name"

# Now safe to use
config_file=".claude/skills/${skill_name}/config.yaml"
```

### Key Validation Patterns

| Input Type | Regex Pattern | Use Case |
|------------|---------------|----------|
| Identifier | `^[a-zA-Z0-9_-]+$` | File names, skill names, tags |
| File Path | `^[a-zA-Z0-9_/.-]+$` | Relative paths within project |
| SQL Identifier | `^[a-zA-Z_][a-zA-Z0-9_]*$` | Table names, column names |
| Branch Name | `^[a-zA-Z0-9/_-]+$` | Git branch names |
| Email | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | Email addresses |

### Key Points

- **Validate at API boundaries** (CLI entry, HTTP endpoints, function inputs)
- **Use allowlist patterns,** not blocklists
- **Fail closed:** Reject invalid input immediately
- **Use Zod for TypeScript** validation schemas
- **Validate BEFORE any processing** (parsing, sanitization, use)
- **Don't try to sanitize** user input - validate and reject

---

## Pattern 2: Command Injection Prevention

**Problem:** User input interpolated into shell commands enables arbitrary code execution.

**Impact:** Critical (10/10) - Remote code execution

**Source Lessons:**
- `shell-injection-prevention-execfilesync.md`
- `20251103-144900-git-double-dash-separator-conditional.md`
- `20251027-083654-destructive-operation-confirmation-guards.md`

### ✅ Correct Pattern

```typescript
import { execFileSync } from 'child_process';
import { z } from 'zod';

// ✅ CORRECT: Use execFileSync with argv array
function checkoutBranch(branchName: string) {
  // Validate input
  const validated = z.string().regex(/^[a-zA-Z0-9/_-]+$/).parse(branchName);

  // Use execFileSync with array (no shell interpolation)
  return execFileSync('git', ['checkout', validated], {
    encoding: 'utf-8'
  });
}

// ❌ WRONG: execSync with string interpolation
function checkoutBranchUnsafe(branchName: string) {
  // VULNERABLE! Input: "main; rm -rf /" executes both commands
  return execSync(`git checkout ${branchName}`);
}
```

### Conditional Git Separator

```bash
# Only use -- separator for commands that accept file paths
# git checkout: Can be branch OR file, needs disambiguation

# If input is a branch name (validated), no separator needed
git checkout "$branch_name"

# If input is a file path, use separator
git checkout -- "$file_path"

# git diff: Doesn't accept file paths as refs, no separator
git diff "$branch1" "$branch2"

# git diff with file filter: Needs separator
git diff "$branch" -- "$file_path"
```

### Destructive Operation Guards

```typescript
// Require explicit confirmation for destructive operations
function deleteResources(resourceIds: string[], confirmed: boolean = false) {
  if (!confirmed) {
    throw new Error(
      'Destructive operation requires explicit confirmation. ' +
      'Pass confirmed=true if you are sure.'
    );
  }

  // Validate all IDs
  const validated = resourceIds.map(id =>
    z.string().uuid().parse(id)
  );

  // Proceed with deletion
  for (const id of validated) {
    deleteResource(id);
  }
}

// Usage
deleteResources(['id1', 'id2'], true);  // Explicit confirmation
```

### Key Points

- **Use `execFileSync` with arrays,** never `execSync` with strings
- **Validate input before passing to commands**
- **Use `--` separator conditionally** (only for commands accepting paths)
- **Require explicit confirmation** for destructive operations
- **Log destructive operations** for audit trail

---

## Pattern 3: Secrets and Credential Protection

**Problem:** Secrets leak in logs, PR comments, error messages.

**Impact:** Critical (9/10) - Credential exposure

**Source Lessons:**
- `log-sanitization-pr-security.md`
- `20251027-083626-skill-verbose-env-pattern.md`
- `20251103-145100-eliminate-redundant-sanitization-passes.md`
- `20250124-193200-extract-security-utilities-proactively.md`

### ✅ Correct Pattern

```typescript
// Centralized sanitization utilities
// packages/security/src/sanitize.ts
export function sanitizeForLog(text: string): string {
  let sanitized = text;

  // JWT tokens (format: xxx.yyy.zzz)
  sanitized = sanitized.replace(
    /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
    '[REDACTED_JWT]'
  );

  // Bearer tokens
  sanitized = sanitized.replace(
    /Bearer [A-Za-z0-9_-]+/g,
    'Bearer [REDACTED]'
  );

  // API keys (common patterns)
  sanitized = sanitized.replace(
    /[a-zA-Z0-9_-]{32,}/g,
    (match) => match.length >= 32 ? '[REDACTED_API_KEY]' : match
  );

  // Supabase keys
  sanitized = sanitized.replace(
    /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    '[REDACTED_SUPABASE_KEY]'
  );

  return sanitized;
}

// Verbose output gating
export function debugLog(message: string) {
  if (process.env.SKILL_VERBOSE !== 'true') {
    return;  // Don't log unless explicitly enabled
  }

  // Sanitize before logging
  console.error('[DEBUG]', sanitizeForLog(message));
}

// Safe error logging
export function logError(error: Error) {
  console.error('Error:', error.message);  // Message only

  if (process.env.SKILL_VERBOSE === 'true') {
    // Full stack only in verbose mode, sanitized
    console.error(sanitizeForLog(error.stack || ''));
  }
}
```

### Single-Pass Sanitization

```typescript
// ❌ WRONG: Multiple sanitization passes (performance + missed patterns)
function logOutput(output: string) {
  let sanitized = output;
  sanitized = sanitized.replace(/JWT_PATTERN/g, '[REDACTED]');
  sanitized = sanitized.replace(/BEARER_PATTERN/g, '[REDACTED]');
  sanitized = sanitized.replace(/API_KEY_PATTERN/g, '[REDACTED]');
  console.log(sanitized);
}

// ✅ CORRECT: Single pass with comprehensive function
function logOutput(output: string) {
  console.log(sanitizeForLog(output));  // One pass, all patterns
}
```

### Environment Variable Handling

```typescript
// ✅ Never log raw environment variables
function configureService() {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('API_KEY not set');
  }

  // Don't log the key
  console.log('Configuring service...');  // No key in log

  return new Service(apiKey);
}

// ❌ WRONG: Logging config object with secrets
const config = {
  apiKey: process.env.API_KEY,
  endpoint: process.env.API_ENDPOINT
};
console.log('Config:', config);  // Leaks API key!
```

### Key Points

- **Centralize sanitization logic** in shared utility
- **Sanitize before logging** (not after)
- **Gate verbose output** behind `SKILL_VERBOSE` env var
- **Single-pass sanitization** for performance
- **Never log raw environment variables**
- **Extract security utilities proactively** into shared package

---

## Pattern 4: SQL Injection Prevention

**Problem:** User input concatenated into SQL queries enables unauthorized data access.

**Impact:** Critical (10/10) - Data breach

**Source Lessons:**
- `sql-identifier-validation.md`
- `postgres-function-security-patterns.md`

### ✅ Correct Pattern

```typescript
// ✅ Use parameterized queries (prevents injection)
async function getUser(userId: string) {
  // Validate ID format
  const validated = z.string().uuid().parse(userId);

  // Use parameterized query
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', validated)  // Automatically parameterized
    .single();

  return { data, error };
}

// If you must build dynamic queries, validate identifiers
async function getColumn(tableName: string, columnName: string) {
  // Validate SQL identifiers
  const table = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/).parse(tableName);
  const column = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/).parse(columnName);

  // Still use parameterized query for values
  const query = `SELECT ${column} FROM ${table} WHERE id = $1`;

  return await db.query(query, [userId]);
}
```

### Postgres Function Security

```sql
-- ✅ Mark functions as STABLE for query planner optimization
CREATE OR REPLACE FUNCTION get_user_projects(user_id UUID)
RETURNS TABLE (id UUID, name TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE  -- Function doesn't modify database
SECURITY DEFINER  -- Run with owner privileges
AS $$
BEGIN
  -- RLS is still enforced
  RETURN QUERY
  SELECT p.id, p.name, p.created_at
  FROM projects p
  WHERE p.owner_id = user_id;
END;
$$;

-- Set explicit role (best practice)
ALTER FUNCTION get_user_projects(UUID) OWNER TO authenticated;
```

### Key Points

- **Always use parameterized queries** for values
- **Validate SQL identifiers** if building dynamic queries
- **Use Supabase query builder** (auto-parameterized)
- **Mark functions as STABLE** if read-only
- **Use SECURITY DEFINER** carefully (RLS still applies)
- **Never concatenate user input** into SQL strings

---

## Pattern 5: RLS Policy Security

**Problem:** Missing or incorrect RLS policies allow unauthorized data access.

**Impact:** Critical (10/10) - Data breach, GDPR violation

**Source Lessons:**
- `postgres-function-security-patterns.md`
- `rls-policy-sql-syntax.md`
- `supabase-anon-rls-policies.md`

### ✅ Correct Pattern

```sql
-- ✅ CORRECT: Explicit role, auth.uid() check
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ✅ CORRECT: Anon users limited access
CREATE POLICY "Public profiles readable by anon"
  ON profiles
  FOR SELECT
  TO anon
  USING (is_public = true);

-- ❌ WRONG: No role specification (applies to all!)
CREATE POLICY "Users can read profiles"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);  -- Anon can bypass!

-- ❌ WRONG: Using current_user instead of auth.uid()
CREATE POLICY "Users can read own data"
  ON profiles
  FOR SELECT
  USING (current_user = id::text);  -- Doesn't work with JWT!
```

### RLS Policy Checklist

```sql
-- For every table, define policies for each role:

-- 1. authenticated role
CREATE POLICY "auth_select" ON table FOR SELECT TO authenticated USING (...);
CREATE POLICY "auth_insert" ON table FOR INSERT TO authenticated WITH CHECK (...);
CREATE POLICY "auth_update" ON table FOR UPDATE TO authenticated USING (...) WITH CHECK (...);
CREATE POLICY "auth_delete" ON table FOR DELETE TO authenticated USING (...);

-- 2. anon role (if public access needed)
CREATE POLICY "anon_select" ON table FOR SELECT TO anon USING (...);

-- 3. service_role (full access, use carefully)
-- Usually no policy needed, service_role bypasses RLS
```

### Testing RLS Policies

```typescript
// Test authenticated access
it('should allow user to read own profile', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', testUserId);

  expect(error).toBeNull();
  expect(data).toHaveLength(1);
});

// Test anon access
it('should allow anon to read public profiles only', async () => {
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await anonClient
    .from('profiles')
    .select('*');

  expect(error).toBeNull();
  expect(data.every(p => p.is_public)).toBe(true);
});

// Test denial
it('should deny user from reading other profiles', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', otherUserId);

  expect(data).toHaveLength(0);  // RLS blocked
});
```

### Key Points

- **Specify role explicitly:** `TO authenticated`, `TO anon`
- **Use `auth.uid()`** for JWT-based auth (not `current_user`)
- **Use `USING` for read permissions,** `WITH CHECK` for write permissions
- **Test policies with real JWT sessions**
- **Create policies for all roles** (authenticated, anon)
- **Use `service_role` carefully** (bypasses RLS)

---

## Pattern 6: Path Traversal Prevention

**Problem:** User-provided paths access files outside intended directory.

**Impact:** High (8/10) - Unauthorized file access

**Source Lessons:**
- Patterns from bash-safety-patterns.md

### ✅ Correct Pattern

```typescript
import path from 'path';
import fs from 'fs';

function readUserFile(userPath: string, baseDir: string): string {
  // Resolve to absolute path
  const resolved = path.resolve(baseDir, userPath);

  // Verify it's under base directory
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error(`Path traversal detected: ${userPath}`);
  }

  // Verify file exists
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${userPath}`);
  }

  // Now safe to read
  return fs.readFileSync(resolved, 'utf-8');
}

// Usage
const docsDir = path.join(process.cwd(), 'docs');
const content = readUserFile(userFilePath, docsDir);
```

### Bash Equivalent

```bash
validate_safe_path() {
  local user_path="$1"
  local base_dir="$2"

  # Resolve to absolute path
  local resolved
  resolved="$(cd "$(dirname "$user_path")" 2>/dev/null && pwd)/$(basename "$user_path")"

  # Verify it's under base directory
  if [[ "$resolved" != "$base_dir"* ]]; then
    echo "Error: Path traversal detected: $user_path" >&2
    exit 1
  fi

  echo "$resolved"
}

# Usage
docs_dir="$(pwd)/docs"
safe_path=$(validate_safe_path "$user_file" "$docs_dir")
cat "$safe_path"
```

### Key Points

- **Resolve to absolute path** with `path.resolve()`
- **Verify path starts with base directory**
- **Don't rely on string manipulation alone** (symlinks!)
- **Verify file exists** after validation
- **Log path traversal attempts** for security monitoring

---

## Security Checklist

Before deploying, verify:

- [ ] All user input validated with allowlist patterns
- [ ] Using `execFileSync` with arrays (not `execSync` with strings)
- [ ] Secrets sanitized before logging
- [ ] Verbose output gated behind `SKILL_VERBOSE`
- [ ] All SQL queries parameterized
- [ ] RLS policies defined for all roles
- [ ] RLS policies tested with real JWT sessions
- [ ] Path traversal protection on file operations
- [ ] Destructive operations require explicit confirmation
- [ ] Security utilities extracted to shared package

---

## Common Vulnerabilities & Fixes

| Vulnerability | Vulnerable Code | Secure Code |
|---------------|----------------|-------------|
| Command Injection | `execSync(\`git checkout ${branch}\`)` | `execFileSync('git', ['checkout', validated])` |
| SQL Injection | `query(\`SELECT * FROM users WHERE id='${id}'\`)` | `query('SELECT * FROM users WHERE id=$1', [id])` |
| Path Traversal | `readFile(userPath)` | `readFile(path.resolve(baseDir, validated))` |
| JWT Leak | `console.log(error)` | `console.log(sanitizeForLog(error.message))` |
| RLS Bypass | `CREATE POLICY ... USING (...)` | `CREATE POLICY ... TO authenticated USING (...)` |

---

## References

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Node.js Security Best Practices:** https://nodejs.org/en/docs/guides/security/

---

## Related Patterns

- [Bash Safety Patterns](./bash-safety-patterns.md) - Command execution, path handling
- [Testing Patterns](./testing-patterns.md) - RLS testing, security testing
- [Database Patterns](./database-patterns.md) - Query patterns, migrations

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 12 micro-lessons from security category
