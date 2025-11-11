# Bash Safety Patterns

**Category:** Infrastructure & Scripting
**Impact:** Critical - Prevents CI/CD failures, security vulnerabilities, data corruption
**Lessons Synthesized:** 15 micro-lessons

## Overview

This guide consolidates battle-tested patterns for writing safe, reliable bash scripts. These patterns prevent common pitfalls that cause CI failures, security vulnerabilities, and data corruption in production environments.

## Core Principles

1. **Defense in Depth:** Multiple layers of safety (validation + safe APIs + verification)
2. **Fail Fast:** Explicit error handling, proper exit codes
3. **ShellCheck Compliance:** Follow linting recommendations
4. **Portable:** Cross-platform compatibility

---

## Pattern 1: File Paths with Spaces Handling

**Problem:** File paths containing spaces break iteration, cause command failures in CI/CD.

**Impact:** Critical (9/10) - Common CI/CD failure point

**Source Lessons:**
- `20251109-151935-bash-file-paths-with-spaces.md`
- `awk-field-splitting-spaces.md`
- `github-actions-pr-body-escaping.md`

### ✅ Correct Pattern

```bash
# Use null-delimited output with find and read
while IFS= read -r -d '' file; do
  echo "Processing: $file"
  # Safe to use $file here, even with spaces
done < <(find . -name "*.md" -print0)

# Alternative: Use arrays with mapfile
mapfile -d '' files < <(find . -name "*.md" -print0)
for file in "${files[@]}"; do
  echo "Processing: $file"
done
```

### ❌ Anti-Pattern

```bash
# WRONG: Breaks on spaces, newlines, glob characters
for file in $(find . -name "*.md"); do
  echo "Processing: $file"  # Breaks if $file has spaces
done

# WRONG: IFS splitting on spaces
while read -r file; do
  echo "$file"  # Breaks on multi-word filenames
done < <(find . -name "*.md")
```

### Key Points

- **Always use `-print0` with `find`** and `-d ''` with `read`
- **Quote all variable references** in conditionals and commands
- **Use `IFS=` prefix** to prevent field splitting
- **Test with spaces:** Create test files like `"test file.md"` during development

### GitHub Actions Escaping

```yaml
# Escape multi-line variables properly
- name: Create PR
  env:
    PR_BODY: ${{ steps.generate.outputs.body }}
  run: |
    gh pr create --body "$PR_BODY"
```

---

## Pattern 2: JSON Output in Bash Scripts

**Problem:** Multiple JSON outputs or malformed JSON breaks API contracts, CI pipelines.

**Impact:** Critical (10/10) - Breaks integrations

**Source Lessons:**
- `20251022-100327-sequential-json-output-bug.md`
- `20251022-100250-jq-arg-vs-argjson.md`
- `gh-api-jq-piping.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Output exactly ONE JSON object per script

# Build JSON incrementally
declare -a lessons=()
while IFS= read -r -d '' file; do
  lessons+=("\"$(basename "$file")\"")
done < <(find docs/micro-lessons -name "*.md" -print0)

# Single JSON output at the end
printf '{"total":%d,"lessons":[%s]}\n' \
  "${#lessons[@]}" \
  "$(IFS=,; echo "${lessons[*]}")"
```

### ❌ Anti-Pattern

```bash
# WRONG: Multiple JSON outputs
for file in *.md; do
  printf '{"file":"%s"}\n' "$file"  # Multiple JSON objects!
done

# WRONG: Streaming JSON that's not newline-delimited
echo "{"
for file in *.md; do
  printf '  "file": "%s",\n' "$file"
done
echo "}"
```

### jq Integration Patterns

```bash
# ✅ Use --argjson for JSON values
category='{"name":"bash","severity":"high"}'
jq --argjson cat "$category" '.category = $cat' data.json

# ❌ WRONG: --arg converts to string
jq --arg cat "$category" '.category = $cat' data.json
# Result: .category = "{\"name\":\"bash\",...}" (escaped string!)

# ✅ Use external jq with gh api
gh api repos/owner/repo/pulls \
  | jq -r '.[] | select(.draft == false) | .number'

# ✅ For complex queries, use jq files
jq -f filter.jq data.json
```

### Key Points

- **One JSON object per script execution**
- **Use `--argjson` for JSON values,** `--arg` only for strings
- **Pipe `gh api` output to external `jq`**, don't use `gh api --jq` for complex queries
- **Validate JSON output** with `jq empty` before returning

---

## Pattern 3: Command Injection Prevention

**Problem:** User input in shell commands enables arbitrary code execution.

**Impact:** Critical (10/10) - Security vulnerability

**Source Lessons:**
- `20251022-093043-input-validation-cli-scripts.md`
- `shell-injection-prevention-execfilesync.md`
- `20251103-145000-input-validation-before-sanitization.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Validate input with allowlist patterns

validate_identifier() {
  local input="$1"
  if [[ ! "$input" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Error: Invalid identifier: $input" >&2
    echo "Must contain only alphanumeric, underscore, hyphen" >&2
    exit 1
  fi
}

# Always validate before use
skill_name="$1"
validate_identifier "$skill_name"

# Now safe to use
config_file=".claude/skills/${skill_name}/config.yaml"
```

### TypeScript/Node.js Equivalent

```typescript
import { execFileSync } from 'child_process';
import { z } from 'zod';

// ✅ CORRECT: Use execFileSync with argv array
const identifierSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/);

function runGitCommand(branch: string) {
  // Validate at boundary
  const validated = identifierSchema.parse(branch);

  // Use execFileSync with array arguments
  return execFileSync('git', ['checkout', validated], {
    encoding: 'utf-8'
  });
}

// ❌ WRONG: execSync with string interpolation
function runGitCommandUnsafe(branch: string) {
  return execSync(`git checkout ${branch}`);  // Vulnerable!
  // Input: "main; rm -rf /" would execute both commands
}
```

### Key Points

- **Validate with allowlist patterns:** `^[a-zA-Z0-9_-]+$`, `^[a-zA-Z0-9_/.-]+$`
- **Use `execFileSync` with argv arrays,** never `execSync` with interpolation
- **Validate at boundaries** (CLI entry, API endpoints) with Zod
- **Defense in depth:** Validation + safe APIs + path verification
- **Fail closed:** Reject invalid input, don't sanitize

---

## Pattern 4: ShellCheck Compliance

**Problem:** Subtle bugs from shell quoting, variable expansion, error handling.

**Impact:** Medium (7/10) - Prevents production bugs

**Source Lessons:**
- `20251022-115900-shellcheck-logging-patterns.md`
- `20251110-120200-shfmt-pipe-operator-style.md`
- `20251110-120100-grep-perl-regex-portability.md`

### ✅ Correct Patterns

```bash
# SC2155: Separate declare and assign to catch errors
# ❌ WRONG
local output=$(command_that_might_fail)

# ✅ CORRECT
local output
output=$(command_that_might_fail)

# SC2064: Use single quotes in traps to delay expansion
# ❌ WRONG
trap "rm -f $temp_file" EXIT  # $temp_file expanded immediately

# ✅ CORRECT
trap 'rm -f "$temp_file"' EXIT  # Expanded when trap fires

# SC2086: Quote variables in conditionals
# ❌ WRONG
if [ -f $config_file ]; then

# ✅ CORRECT
if [ -f "$config_file" ]; then

# Pipe operator style (shfmt)
# ✅ Pipe at end of line, not start
command1 \
  | command2 \
  | command3
```

### Portable Regex Patterns

```bash
# ✅ Use POSIX ERE with grep -E, not Perl regex
grep -E '\bword\b' file.txt  # Word boundaries

# ❌ Avoid grep -P (Perl regex, not portable)
grep -P '\bword\b' file.txt  # Not available on macOS
```

### Key Points

- **Separate `declare` and assignment** to catch command failures
- **Single quotes in traps** delay variable expansion
- **Quote all variable references** unless explicitly splitting
- **Use `grep -E` (POSIX ERE),** not `grep -P` (Perl, not portable)
- **Pipe operators at end of line,** not start (shfmt style)

---

## Pattern 5: Error Handling & Logging

**Problem:** Silent failures, lack of debugging context, credential leakage.

**Impact:** High (8/10) - Operational reliability

**Source Lessons:**
- `20251027-083626-skill-verbose-env-pattern.md`
- `20251022-093918-stdio-inherit-vs-capture.md`
- `log-sanitization-pr-security.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
set -euo pipefail  # Fail fast

# Configurable verbosity
VERBOSE="${SKILL_VERBOSE:-false}"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >&2
}

debug() {
  if [ "$VERBOSE" = "true" ]; then
    echo "[DEBUG] $*" >&2
  fi
}

# Sanitize output before logging
sanitize() {
  local output="$1"
  # Remove JWT tokens (format: xxx.yyy.zzz)
  output="${output//eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/[REDACTED_JWT]}"
  # Remove Bearer tokens
  output="${output//Bearer [A-Za-z0-9_-]*/Bearer [REDACTED]}"
  echo "$output"
}

# Example usage
log "Starting process..."
debug "Config: $config_file"

output=$(command 2>&1) || {
  log "Error: Command failed"
  log "$(sanitize "$output")"
  exit 1
}
```

### stdio Handling

```typescript
// ✅ Use stdio: 'inherit' for interactive commands
execFileSync('pnpm', ['install'], {
  stdio: 'inherit'  // Show output in real-time
});

// ✅ Use stdio: 'pipe' to capture output for processing
const output = execFileSync('git', ['status', '--porcelain'], {
  encoding: 'utf-8',
  stdio: 'pipe'  // Capture for parsing
});
```

### Key Points

- **Set `set -euo pipefail`** at script start
- **Gate verbose output** behind `SKILL_VERBOSE` env var
- **Sanitize before logging:** JWT, Bearer tokens, secrets
- **Use `stdio: 'inherit'`** for interactive commands, `'pipe'` for parsing
- **Log to stderr** (`>&2`), keep stdout for data

---

## Pattern 6: Configurable Timeouts

**Problem:** CI jobs hang indefinitely, no configurability for different environments.

**Impact:** High (8/10) - CI reliability

**Source Lessons:**
- `20251027-083728-configurable-execsync-timeouts-for-ci.md`
- `configurable-scripts.md`

### ✅ Correct Pattern

```typescript
import { execFileSync } from 'child_process';

// Make timeouts configurable
const DEFAULT_TIMEOUT_MS = 120_000;  // 2 minutes
const timeout = process.env.SKILL_EXEC_TIMEOUT_MS
  ? parseInt(process.env.SKILL_EXEC_TIMEOUT_MS, 10)
  : DEFAULT_TIMEOUT_MS;

try {
  execFileSync('pnpm', ['test'], {
    timeout,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ETIMEDOUT') {
    console.error(`Command timed out after ${timeout}ms`);
    console.error(`Increase timeout with SKILL_EXEC_TIMEOUT_MS env var`);
  }
  throw error;
}
```

### Bash Equivalent

```bash
#!/bin/bash
TIMEOUT="${SCRIPT_TIMEOUT:-120}"  # Default 120 seconds

timeout "$TIMEOUT" pnpm test || {
  exit_code=$?
  if [ $exit_code -eq 124 ]; then
    echo "Error: Command timed out after ${TIMEOUT}s" >&2
    echo "Increase with SCRIPT_TIMEOUT env var" >&2
  fi
  exit $exit_code
}
```

### Key Points

- **Make timeouts configurable** via environment variables
- **Document defaults** and how to override
- **Provide clear error messages** on timeout
- **Use appropriate defaults:** 2min for tests, 5min for builds

---

## Pattern 7: Path Resolution & Verification

**Problem:** Hardcoded paths break across environments, security risks from path traversal.

**Impact:** High (7/10) - Portability & security

**Source Lessons:**
- `hardcoded-paths.md`
- `consistent-path-resolution.md`
- `nested-relative-paths.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Resolve script directory (works with symlinks)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# All paths relative to project root
CONFIG_DIR="$PROJECT_ROOT/.claude"
DOCS_DIR="$PROJECT_ROOT/docs"

# Verify paths exist
if [ ! -d "$CONFIG_DIR" ]; then
  echo "Error: Config directory not found: $CONFIG_DIR" >&2
  exit 1
fi

# Prevent path traversal
validate_safe_path() {
  local path="$1"
  local base="$2"

  # Resolve to absolute path
  local resolved
  resolved="$(cd "$(dirname "$path")" && pwd)/$(basename "$path")"

  # Verify it's under base directory
  if [[ "$resolved" != "$base"* ]]; then
    echo "Error: Path traversal detected: $path" >&2
    exit 1
  fi
}

# Usage
user_file="$1"
validate_safe_path "$user_file" "$DOCS_DIR"
```

### TypeScript Equivalent

```typescript
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Prevent path traversal
function validateSafePath(userPath: string, baseDir: string): string {
  const resolved = path.resolve(baseDir, userPath);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error(`Path traversal detected: ${userPath}`);
  }
  return resolved;
}

// Usage
const docsDir = path.join(PROJECT_ROOT, 'docs');
const safePath = validateSafePath(process.argv[2], docsDir);
```

### Key Points

- **Resolve script directory** with `$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)`
- **All paths relative to project root,** not CWD
- **Verify paths exist** before use
- **Prevent path traversal:** Validate resolved path is under base directory
- **Use `path.resolve()`** in Node.js for absolute paths

---

## Pattern 8: Atomic File Operations

**Problem:** Partial writes corrupt files, race conditions.

**Impact:** Medium (7/10) - Data integrity

**Source Lessons:**
- `20250124-192600-atomic-file-writes-temp-rename-pattern.md`
- `safe-file-writing-patterns.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# Atomic file write: temp + rename

write_config_atomic() {
  local target="$1"
  local content="$2"

  # Write to temp file in same directory (same filesystem)
  local temp="${target}.tmp.$$"

  # Write content
  printf '%s' "$content" > "$temp" || {
    rm -f "$temp"
    return 1
  }

  # Atomic rename (same filesystem only)
  mv "$temp" "$target" || {
    rm -f "$temp"
    return 1
  }
}

# Usage
new_config='{"version":"2.0"}'
write_config_atomic "config.json" "$new_config"
```

### TypeScript Equivalent

```typescript
import fs from 'fs';
import path from 'path';

function writeFileAtomic(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  const temp = path.join(dir, `.${path.basename(filePath)}.tmp.${process.pid}`);

  try {
    // Write to temp file
    fs.writeFileSync(temp, content, 'utf-8');

    // Atomic rename
    fs.renameSync(temp, filePath);
  } catch (error) {
    // Clean up temp file on failure
    try {
      fs.unlinkSync(temp);
    } catch {}
    throw error;
  }
}
```

### Key Points

- **Write to temp file first,** then atomic rename
- **Temp file in same directory** (ensures same filesystem)
- **Clean up temp file on failure**
- **Use process PID** in temp filename to avoid conflicts

---

## Checklist for Bash Scripts

Before committing bash scripts, verify:

- [ ] `set -euo pipefail` at script start
- [ ] All variables quoted in conditionals: `[ -f "$file" ]`
- [ ] File iteration uses `-print0` and `-d ''`
- [ ] Single JSON output (if applicable)
- [ ] Input validation with allowlist patterns
- [ ] Use `execFileSync` with arrays (Node.js)
- [ ] Configurable timeouts via env vars
- [ ] Paths resolved relative to script/project root
- [ ] Error messages to stderr (`>&2`)
- [ ] ShellCheck passes with no warnings
- [ ] Secrets sanitized before logging

---

## Testing Strategies

```bash
# Create test fixtures with problematic names
mkdir -p test/fixtures
touch "test/fixtures/file with spaces.md"
touch "test/fixtures/file'with'quotes.md"
touch "test/fixtures/file\$with\$dollars.md"

# Run script and verify it handles all files
./scripts/process-files.sh test/fixtures

# Test path traversal protection
./scripts/process-files.sh "../../../etc/passwd" || echo "Correctly rejected"

# Test timeout behavior
SCRIPT_TIMEOUT=1 ./scripts/long-running.sh || echo "Correctly timed out"

# Verify JSON output
output=$(./scripts/generate-report.sh)
echo "$output" | jq empty || echo "Invalid JSON"
```

---

## References

- **ShellCheck:** https://www.shellcheck.net/
- **Google Shell Style Guide:** https://google.github.io/styleguide/shellguide.html
- **Bash Pitfalls:** https://mywiki.wooledge.org/BashPitfalls

---

## Related Patterns

- [Security Patterns](./security-patterns.md) - Input validation, sanitization
- [CI/CD Patterns](./ci-cd-patterns.md) - GitHub Actions, quality gates
- [Git Workflow Patterns](./git-workflow-patterns.md) - Safe git operations

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 15 micro-lessons from bash-scripting category
