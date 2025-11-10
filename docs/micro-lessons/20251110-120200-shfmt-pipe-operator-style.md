# shfmt Enforces Spaces Around Pipe Operators in Case Patterns

**Severity:** normal  
**UsedBy:** 0  
**Tags:** #bash #shfmt #formatting #case-statement

## Context

CodeRabbit suggested removing spaces around pipe operators in bash case patterns (`foo|bar` instead of `foo | bar`), claiming spaces break pattern matching. Applied the change, then CI failed with shfmt formatting errors.

## Problem

**Both `foo|bar)` and `foo | bar)` are valid bash syntax, but shfmt enforces the SPACED version for readability.**

```bash
# Both work in bash - identical behavior
case "$action" in
  foo|bar)  # Valid, matches "foo" or "bar"
    echo "matched"
    ;;
esac

case "$action" in
  foo | bar)  # Also valid, same matching
    echo "matched"
    ;;
esac

# But shfmt wants the spaced version
shfmt -d file.sh  # Fails if using foo|bar
```

## Rule

**Follow shfmt's default style (spaces around pipes) - don't blindly trust code review suggestions without verifying against actual linter requirements.**

## Example

```bash
# shfmt REJECTS this (no spaces)
case "$ACTION" in
performance-check|performance)
  run_check
  ;;
esac

# shfmt ACCEPTS this (spaces around |)
case "$ACTION" in
performance-check | performance)
  run_check
  ;;
esac
```

## Guardrails

- Run `shfmt -d` locally before pushing case statement changes
- Don't assume code review feedback is always correct
- Verify suggestions against actual tool requirements (shfmt, shellcheck, etc.)
- Both syntaxes work in bash - this is purely a style preference
- The spaced version is more readable anyway

## Related

- Issue #350: Skills test coverage  
- Files: `scripts/skills/design-system.sh:68,72,76`
- Regression: Removed spaces → broke lint → re-added spaces
