# grep -P Not Portable Across Systems

**Severity:** high  
**UsedBy:** 0  
**Tags:** #bash #portability #macos #linux #grep

## Context

Script used `grep -oP '\d+\.\d+(?=%)'` to extract percentage values. Worked perfectly on Linux CI but failed on macOS with "grep: invalid option -- P".

## Problem

**The `-P` flag (Perl-compatible regex) is GNU grep only - not available in BSD grep (macOS, FreeBSD).**

```bash
# Linux (GNU grep) - works
echo "Coverage: 85.4%" | grep -oP '\d+\.\d+(?=%)'
# Output: 85.4

# macOS (BSD grep) - fails
echo "Coverage: 85.4%" | grep -oP '\d+\.\d+(?=%)'
# Output: grep: invalid option -- P
```

## Rule

**Avoid `grep -P` for cross-platform scripts. Use basic regex or alternative tools (sed, awk).**

## Example

```bash
# NON-PORTABLE - GNU grep only
COVERAGE=$(echo "$OUTPUT" | grep -oP '\d+\.\d+(?=%)')

# PORTABLE - Works on GNU and BSD grep
COVERAGE=$(echo "$OUTPUT" | grep -o '[0-9][0-9]*\.[0-9][0-9]*%' | sed 's/%//')

# ALTERNATIVE - Using awk (also portable)
COVERAGE=$(echo "$OUTPUT" | awk '/[0-9]+\.[0-9]+%/ {match($0, /[0-9]+\.[0-9]+/); print substr($0, RSTART, RLENGTH)}')
```

## Guardrails

- Test scripts on both Linux and macOS if targeting both
- Use basic regex patterns (BRE) that work everywhere
- For complex patterns, use awk/sed instead of grep -P
- CI passes on Linux doesn't guarantee macOS compatibility
- Perl regex features (lookahead `(?=)`, `\d`, `\w`) aren't portable

## Related

- Issue #350: Skills test coverage
- Files: `scripts/skills/code-reviewer.sh:111`
