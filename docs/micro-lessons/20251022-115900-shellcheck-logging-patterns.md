# ShellCheck Best Practices for Bash Logging Utilities

**Date:** 2025-10-22
**Context:** Phase 4A Skills Observability implementation
**Tags:** #bash #shellcheck #logging #best-practices #SC2155 #SC2064

## Problem

When implementing bash logging utilities, common ShellCheck warnings can appear:

- **SC2155**: Declare and assign separately to avoid masking return values
- **SC2064**: Use single quotes in traps to delay variable expansion

These violations can cause:

- Lost error detection (SC2155)
- Incorrect variable capture in traps (SC2064)
- Subtle bugs that only manifest at runtime

## Solution

### Pattern 1: Separate Declare and Assign (SC2155)

**❌ Bad:**

```bash
local end_time=$(python3 -c 'import time; print(int(time.time() * 1000))')
```

**Problem:** If the Python command fails, the error is masked and `end_time` is set to empty string silently.

**✅ Good:**

```bash
# Declare and assign separately to catch failures
local end_time
end_time=$(python3 -c 'import time; print(int(time.time() * 1000))')
```

**Why:** With `set -e`, the script will exit if the command fails. Without it, you can check `$?` after assignment.

### Pattern 2: Delay Variable Expansion in Traps (SC2064)

**❌ Bad:**

```bash
trap "log_skill_invocation $skill $action" EXIT
```

**Problem:** Variables are expanded when trap is **set**, not when it **fires**. This captures the wrong values (often empty strings).

**✅ Good:**

```bash
trap 'log_skill_invocation "$skill" "$action"' EXIT
```

**Why:** Single quotes delay expansion until the trap fires, ensuring you capture the actual runtime values.

## Real-World Example

**Before (has bugs):**

```bash
#!/bin/bash
set -euo pipefail

LOG_FILE=".logs/usage.csv"
START_TIME=$(date +%s%3N)  # SC2155: Masks errors on macOS

log_invocation() {
  local exit_code=$?
  local end_time=$(date +%s%3N)  # SC2155: Masks errors
  echo "$START_TIME,$end_time,$exit_code" >> "$LOG_FILE"
}

setup_logging() {
  local skill=$1
  trap "log_invocation $skill" EXIT  # SC2064: Expands too early
}

setup_logging "git"
# ... later $skill changes but trap still has "git" hardcoded
```

**After (ShellCheck compliant):**

```bash
#!/bin/bash
set -euo pipefail

LOG_FILE=".logs/usage.csv"
# Declare separately
START_TIME
START_TIME=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))

log_invocation() {
  local skill=$1
  local exit_code=$?

  # Declare and assign separately
  local end_time
  end_time=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))

  echo "$START_TIME,$skill,$end_time,$exit_code" >> "$LOG_FILE"
}

setup_logging() {
  local skill=$1
  # Use single quotes to delay expansion
  trap 'log_invocation "$skill"' EXIT
}

setup_logging "git"
```

## When to Apply

✅ **Always:**

- Use separate declare/assign for any command that might fail
- Use single quotes in traps when referencing variables
- Enable ShellCheck in CI/pre-commit hooks

⚠️ **Optional:**

- Simple variable assignments with no command substitution can use combined form
- Static strings in traps can use double quotes (no variables to expand)

## Related Patterns

- **Cross-platform timestamps**: Use Python 3 fallback for `date +%s%3N` (not POSIX)
- **Error handling**: Always use `set -euo pipefail` for strict error checking
- **Logging utilities**: Export functions for reuse across scripts

## References

- [ShellCheck SC2155](https://www.shellcheck.net/wiki/SC2155)
- [ShellCheck SC2064](https://www.shellcheck.net/wiki/SC2064)
- Implementation: `scripts/utils/skill-logger.sh`
- ADR: `docs/adr/003-phase-4a-skills-observability.md`

## Impact

**Before fix:**

- 2 ShellCheck warnings (SC2155, SC2064)
- Potential runtime bugs (masked errors, wrong variables in traps)

**After fix:**

- ✅ Zero ShellCheck warnings
- ✅ Errors properly propagated
- ✅ Trap captures correct runtime values
- ✅ CodeRabbit approval

## Tags

#bash #shellcheck #logging #error-handling #traps #best-practices #phase-4a
