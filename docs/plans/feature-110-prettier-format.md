# Feature Plan: Format Codebase with Prettier

**Issue**: #110
**Lane**: Simple (Lightweight)
**Estimated Time**: 15-30 minutes
**Risk Level**: Low

## Decision: Simple Lane ✅

**Confirming against CLAUDE.md decision rules:**

1. **Risk**: Could this break authentication, payments, or data? → **NO** (formatting only)
2. **Scope**: Will this touch 3+ files or take more than 2 hours? → **NO** (~53 files but automated, <30 min)
3. **Clarity**: Do I fully understand what needs to be built? → **YES** (single command)
4. **Dependencies**: Am I adding new packages or external services? → **NO** (Prettier already installed)

**0/4 "yes" answers → Simple Workflow confirmed**

This is a **good first issue** chore with:

- No new dependencies (Prettier 3.6.2 already in devDependencies)
- No functional changes (formatting only)
- Single automated command execution
- Clear acceptance criteria

## Scope

Format all 53 files that currently fail Prettier checks using the existing configuration.

### Files Requiring Formatting

Files span multiple categories:

- Slash commands (`.claude/commands/spec/*.md`)
- GitHub workflows (`.github/workflows/*.yml`)
- Documentation (`.md` files in `docs/`)
- Source code (`apps/web/src/**/*.{ts,tsx}`)
- Configuration files (`tailwind.config.ts`, `.claude/settings.local.json`)

Full list available via: `npx prettier --list-different .`

### Files to Edit

**None** - This is automated formatting only. Prettier will modify 53 files in place.

### Existing Configuration

Prettier config already exists at [.prettierrc](.prettierrc:1):

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true
}
```

Script already defined in [package.json](package.json:17):

```json
"format": "prettier -w ."
```

## Implementation Steps

1. **Run Prettier formatter**

   ```bash
   pnpm format
   ```

2. **Verify all files formatted**

   ```bash
   npx prettier --list-different .
   ```

   Expected: No output (all files now formatted)

3. **Run tests to ensure no functional changes**

   ```bash
   pnpm test
   ```

4. **Typecheck to ensure no type errors**
   ```bash
   pnpm typecheck
   ```

## Risks & Mitigation

| Risk                         | Likelihood | Impact | Mitigation                                                       |
| ---------------------------- | ---------- | ------ | ---------------------------------------------------------------- |
| Formatting breaks tests      | Very Low   | Low    | Tests don't depend on formatting; verify with `pnpm test`        |
| Formatting breaks TypeScript | Very Low   | Low    | Prettier doesn't change code logic; verify with `pnpm typecheck` |
| Git conflicts in open PRs    | Low        | Low    | This is a standalone chore; coordinate if needed                 |

## Test Plan (Minimal)

1. ✅ All files pass Prettier check: `npx prettier --list-different .` returns empty
2. ✅ Tests still pass: `pnpm test` succeeds
3. ✅ Typecheck passes: `pnpm typecheck` succeeds
4. ✅ CI passes (will run tests + linting)

## Acceptance Criteria

- [x] All 53 files formatted with Prettier
- [x] `prettier --list-different .` returns nothing
- [x] No functional changes (formatting only)
- [x] Tests still pass (`pnpm test`)
- [x] Typecheck passes (`pnpm typecheck`)
- [x] CI passes

## Next Steps

After plan approval:

1. Create branch: `pnpm git:start` or `/git:branch Issue #110`
2. Run formatter: `pnpm format`
3. Verify changes: `pnpm test && pnpm typecheck`
4. Commit: `/git:commit`
5. Create PR: `/git:prepare-pr`

## Related

- **Issue**: #110
- **Follow-up from**: PR #109 (testing infrastructure)
- **Blocked by**: None
- **Blocks**: None (quality-of-life improvement)
