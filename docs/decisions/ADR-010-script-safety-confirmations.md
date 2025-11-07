# ADR-010: Script Safety Confirmations

## Status

Accepted

## Context

Destructive script operations (database resets, file deletions, SQL DROP/TRUNCATE) can cause irreversible data loss if executed accidentally. Current scripts lack safeguards against mistyped commands or accidental execution.

## Decision

Implement reusable confirmation helpers for both Bash and TypeScript scripts:

1. **Interactive Confirmation:** Require typing "yes" (not shortcuts like "y")
2. **Force Mode:** Support `FORCE=true` env var for CI/CD automation
3. **TTY Detection:** Fail safely in non-interactive mode without force flag
4. **Exit Code Semantics:** Use exit code 2 for safety blocks (vs 1 for errors)

## Consequences

### Positive

- Prevents accidental data loss from mistyped commands
- Works in both interactive and automated environments
- Consistent safety pattern across all scripts
- Clear distinction between errors and safety blocks

### Negative

- Extra step required for local destructive operations
- Developers must remember to use `FORCE=true` in CI/CD

## Implementation

- `scripts/utils/confirm.sh` - Bash helper
- `scripts/utils/confirm.ts` - TypeScript helper
- `docs/scripts/SAFETY.md` - Usage documentation

## References

- Issue #282: Add interactive confirmations to destructive script operations
- SPEC-282: Script Safety Confirmations
