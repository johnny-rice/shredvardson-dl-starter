# ADR-007: Migrate to Lefthook and Biome for Quality Gates

**Status:** Accepted
**Date:** 2025-10-25

## Context

Our git hook infrastructure had several pain points that negatively impacted developer experience:

### Problems with Manual Hooks

1. **Manual Installation Required**: New contributors had to manually run `cp .githooks/pre-push .git/hooks/` to set up quality gates
   - Frequently forgotten, leading to CI failures
   - No verification that hooks were properly installed
   - Difficult to update across team when hooks changed

2. **Sequential Execution**: All pre-push checks ran one-by-one
   - TypeScript typecheck: 8-12s
   - ESLint: 3-5s
   - CI scripts: 1-2s
   - Unit tests: 5-10s
   - **Total: 15-30s** with no parallelization

3. **No Pre-Commit Feedback**: Format and lint issues discovered only at push time
   - "Oops, forgot to format" commits common
   - Wasted time fixing trivial issues after commit
   - No instant feedback loop

4. **Hard to Maintain**: Bash scripts with no built-in parallelization primitives
   - Complex to add parallel execution
   - No structured configuration format
   - Difficult to skip specific checks

### Industry Context (2025)

Analysis of modern tooling landscape showed two clear best practices:

- **Lefthook** emerged as the leading git hook manager (555K weekly downloads)
  - Go binary (no runtime dependencies)
  - Built-in parallel execution
  - YAML configuration
  - Auto-installs via package.json prepare script

- **Biome** as a fast complementary linter (50-100x faster than ESLint)
  - Rust-based, handles format + lint in <1s
  - Not a replacement for ESLint (fewer rules, experimental type checking)
  - Perfect for pre-commit instant feedback

## Decision

We will migrate from manual git hooks to **Lefthook + Biome** with a layered validation strategy:

### Architecture

**Pre-commit** (instant feedback <1s):

- Biome: Format + lint staged files
- Auto-stage fixed files
- Micro-lessons index updates

**Pre-push** (comprehensive validation 8-15s):

- Lockfile sync check
- **Parallel execution**: TypeScript typecheck + ESLint (saves 5-8s)
- CI script validation
- Unit tests
- Main branch protection

**CI** (final enforcement):

- Full test suite
- Build validation
- Doctor checks

### Key Implementation Details

1. **Auto-installing**: Add `"prepare": "lefthook install"` to package.json
2. **Parallel typecheck + lint**: Use wait-based pattern with temp files for safe parallelization
   - Background both processes with `&`
   - Use `wait $PID` to capture exit codes
   - Trap EXIT/INT/TERM for cleanup
   - Avoids named pipe deadlocks and race conditions
3. **Biome configuration**: Match existing Prettier settings (single quotes, 2 spaces, semicolons)
4. **Backward compatibility**: Preserve `--no-verify` escape hatch

### Dependencies

- `lefthook@^2.0.1` - Git hook manager (Go binary)
- `@biomejs/biome@^2.3.0` - Fast linter/formatter (Rust-based)

## Consequences

### Benefits

✅ **Zero-friction onboarding**

- New contributors: `git clone` → `pnpm install` → hooks ready
- No manual setup, no forgotten steps
- Consistent experience across team

✅ **2x faster validation**

- Pre-push: 15-30s → 8-15s (parallel execution)
- Saves 7-15s per push × 20 pushes/week = 2-4 hours/year

✅ **Instant pre-commit feedback**

- Biome catches format/lint issues in <1s
- Prevents "oops forgot to format" commits
- Saves 15-30s per mistake × 10/week = 2-4 hours/year

✅ **Better developer experience**

- Clear error messages with fix instructions
- Auto-staging of fixed files (zero friction)
- Easy bypass with `--no-verify` when needed

✅ **Best-in-class tooling (2025)**

- Modern YAML configuration (easy to read/modify)
- Built-in parallelization (no custom bash complexity)
- Maintained by active communities

### Tradeoffs

⚠️ **Additional dependencies** (low risk)

- 2 new dev dependencies (+~10MB to node_modules)
- Go binary (lefthook) and Rust tools (biome) downloaded once
- Mitigation: Both are widely adopted, stable packages

⚠️ **Biome != ESLint replacement**

- Biome has fewer rules (280 vs 2000+)
- Type-aware rules still experimental (Biotype)
- Mitigation: Keep ESLint for pre-push/CI, use Biome only for pre-commit speed

⚠️ **Learning curve for team**

- New lefthook.yml syntax to learn
- Biome configuration separate from ESLint
- Mitigation: Comprehensive micro-lesson, similar concepts to existing hooks

⚠️ **Parallelization implementation** (mitigated)

- Parallel execution requires careful bash scripting
- Initial named pipe implementation had deadlock risks (since replaced)
- Current wait-based pattern with trap cleanup is production-safe
- Mitigation: Well-documented, tested implementation with proper error handling and cleanup

### Monitoring

Track these metrics to measure impact:

1. **Performance**
   - Pre-push time: Target 8-15s (down from 15-30s)
   - Pre-commit time: Target <1s
   - Measure via Lefthook output timing

2. **Adoption**
   - % of commits with `--no-verify`: Target <5%
   - Time to first commit after clone: Target <5min
   - Track via git logs + team surveys

3. **Quality**
   - Number of "forgot to format" commits: Target near 0
   - CI failures due to format/lint: Target 0
   - Track via CI logs

4. **Team Feedback**
   - Survey team after 2 weeks: "Is validation faster?"
   - Monitor Slack/Discord for friction points
   - Quarterly review of hook escape hatch usage

### Rollback Plan

If issues arise, we can quickly revert:

1. `git revert <commit>` to restore manual hooks
2. Remove `lefthook` and `@biomejs/biome` from package.json
3. Run `cp .githooks/pre-push .git/hooks/` manually
4. Old hooks backed up to `.git/hooks/*.old` for reference

Low-risk change with easy rollback path.

## References

- [ADR concept](https://adr.github.io/)
- **Issue**: #196 - Upgrade to Lefthook + Biome for 2x faster validation
- **PR**: #198
- **Analysis**: [Quality Gates Analysis](https://github.com/Shredvardson/dl-starter/issues/196) (Issue #196 body)
- **Micro-lesson**: [196-lefthook-biome-quality-gates.md](../micro-lessons/196-lefthook-biome-quality-gates.md)
- [Lefthook Documentation](https://lefthook.dev/configuration/)
- [Biome Documentation](https://biomejs.dev/)
- [Lefthook vs Husky Comparison](https://github.com/evilmartians/lefthook#why-lefthook)
