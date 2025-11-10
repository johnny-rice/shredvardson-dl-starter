# CI-Driven Discovery of Pre-Existing Bugs

**Context.** While adding test coverage for utility packages (Issue #358), the CI pipeline failed on "Validate Database Migrations" - a check completely unrelated to the test files being added. Investigation revealed a broken import path in `scripts/db/migrate.ts` that existed before the PR.

**Rule.** **CI failures on unrelated code paths indicate pre-existing bugs that should be fixed in the same PR to unblock the original work.**

**Problem.** The migration validation script had an incorrect relative import:

```typescript
// scripts/db/migrate.ts (INCORRECT)
import { confirm } from './utils/confirm';
```

This failed because the script is in `scripts/db/`, so the correct path should be:

```typescript
// scripts/db/migrate.ts (CORRECT)
import { confirm } from '../utils/confirm';
```

**Why It Happened.**

1. The bug was introduced in a previous commit/PR
2. The migration validation workflow only runs on certain PRs
3. No one had triggered this specific code path recently
4. The error only surfaced when our test coverage PR triggered CI

**Solution Applied.**

1. Identified the root cause (incorrect relative import)
2. Fixed the import path: `'./utils/confirm'` → `'../utils/confirm'`
3. Verified the fix locally (script progressed past the import error)
4. Committed the fix as part of the same PR
5. Added override label (`override:adr`) since script changes require ADR but this was a bug fix

**Guardrails.**

- ✅ **Fix in same PR**: Don't defer pre-existing bugs to separate issues if they block your CI
- ✅ **Document in PR**: Note that the fix addresses a pre-existing issue, not introduced by your changes
- ✅ **Verify scope**: Use `git diff main...HEAD --name-only` to confirm your changes didn't touch the broken code
- ✅ **Test the fix**: Run the failing workflow step locally before pushing
- ✅ **Use override labels**: Apply `override:adr` or similar when fixing bugs in infrastructure code
- ⚠️ **Don't silently fix**: Always document unexpected fixes in commits and PR description

**Tags.** #ci #bug-discovery #import-paths #typescript #relative-imports #migration #issue-358 #pr-workflow

**Severity.** normal

**UsedBy.** 0
