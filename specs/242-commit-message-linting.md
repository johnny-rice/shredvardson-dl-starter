---
id: 'SPEC-242'
title: Add commit message linting with commitlint
type: spec
priority: p1
status: draft
lane: simple
issue: 242
created: 2025-11-09
---

# Add commit message linting with commitlint

## Summary

Implement commitlint with conventional commits standard to enforce consistent commit message format, enable automated changelog generation, and improve git history readability.

## Problem Statement

Currently, commit messages follow no enforced standard at commit-time, making it difficult to:
- Generate automated changelogs
- Understand commit intent from git history
- Automate semantic versioning
- Maintain consistent commit quality across the team

While the codebase has commit formatting patterns documented in `.claude/commands/git/shared/commit-formatting.md` and validation logic in `scripts/skills/git/commit.sh`, there's no hook that validates messages at commit-time.

## Proposed Solution

Add commitlint integration with a commit-msg hook in the existing Lefthook configuration:

1. **Install commitlint dependencies**
   - `@commitlint/cli` - Core validation engine
   - `@commitlint/config-conventional` - Standard conventional commits ruleset

2. **Create `.commitlintrc.json` configuration**
   - Extend conventional commits config
   - Enforce type enum (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
   - Set header max length to 100 characters
   - Use sentence-case for subject

3. **Add commit-msg hook to `lefthook.yml`**
   - Run commitlint on commit message file
   - Provide clear error messages for invalid formats
   - Fast execution (<1s) to avoid bypass fatigue

4. **Create documentation**
   - `docs/git/COMMIT_CONVENTIONS.md` with format guide and examples
   - Update PR template to note conventional commit requirement
   - Add migration guide for team onboarding

5. **Leverage existing patterns**
   - Integrate with existing Lefthook infrastructure
   - Follow escape hatch pattern (supports `--no-verify` and `LEFTHOOK=0`)
   - Maintain fast validation (<1s) like other pre-commit checks
   - Use existing Claude Code attribution footer pattern

## Acceptance Criteria

- [ ] commitlint installed as devDependency in root package.json
- [ ] `.commitlintrc.json` configuration file created with conventional commits rules
- [ ] commit-msg hook added to `lefthook.yml` running commitlint validation
- [ ] Invalid commit messages (wrong type, too long, incorrect format) are rejected
- [ ] Valid conventional commit messages pass through without issues
- [ ] Documentation created at `docs/git/COMMIT_CONVENTIONS.md` with:
  - [ ] Conventional commit format explanation
  - [ ] Examples for each commit type (feat, fix, docs, etc.)
  - [ ] When to use each type
  - [ ] Bypass instructions (`--no-verify`) for emergencies
- [ ] PR template updated to reference commit conventions
- [ ] Validation is fast (<1s) to avoid developer friction

## Technical Constraints

**Existing Infrastructure:**
- Lefthook 2.0.1 already configured with pre-commit and pre-push hooks
- Custom commit validation exists in `scripts/skills/git/commit.sh` using regex
- Required footer pattern: Claude Code attribution already enforced
- Auto-install via `prepare` script in package.json

**Integration Points:**
- Must work alongside existing pre-commit (Biome, markdownlint, config validation)
- Must work alongside existing pre-push (main branch protection, tests, lint)
- Should reuse existing commit formatting patterns from `.claude/commands/git/shared/commit-formatting.md`

**Performance Requirements:**
- Commit-msg validation must complete in <1s
- Should not significantly increase commit overhead
- Must support LEFTHOOK=0 and --no-verify escape hatches

**Validation Rules (align with existing patterns):**
- Conventional commit format: `type(scope): subject`
- Max 100 character header (existing pattern uses 72 for subject, bumped to 100 for total)
- Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Sentence-case subject line
- Imperative mood (existing pattern requirement)
- Optional Claude Code attribution footer (existing pattern)

## Success Metrics

- **Commit quality**: 100% of new commits follow conventional format
- **Team adoption**: <5% of commits use `--no-verify` bypass
- **Validation speed**: <1s average commit-msg hook execution time
- **Developer satisfaction**: No complaints about friction during normal workflow
- **Future readiness**: Enables automated changelog generation and semantic versioning

## Out of Scope

- **Rewriting existing commit history** - Apply to new commits only
- **Automated changelog generation** - Future enhancement, not part of this spec
- **Semantic versioning automation** - Future enhancement, not part of this spec
- **Grace period/warning mode** - Enforce immediately (team already familiar with conventional commits)
- **Custom commit types** - Use standard conventional commits types only
- **Interactive commit message editor** - Simple validation only, no editing

## References

### Similar Implementations Found

- [lefthook.yml](../lefthook.yml) - Existing Lefthook configuration with pre-commit and pre-push hooks
- [.claude/commands/git/shared/commit-formatting.md:209-224](../.claude/commands/git/shared/commit-formatting.md) - Comprehensive commit validation patterns with regex
- [scripts/skills/git/commit.sh:39-40](../scripts/skills/git/commit.sh) - Git commit skill with conventional format validation
- [docs/micro-lessons/196-lefthook-biome-quality-gates.md](../docs/micro-lessons/196-lefthook-biome-quality-gates.md) - Pattern for documenting hook optimizations

### Architecture Patterns

- **Layered validation strategy**: Pre-commit (instant) → Pre-push (comprehensive) → CI (final)
- **Auto-installing git hooks**: Via package.json prepare script (lefthook install)
- **Parallel execution**: For independent checks (typecheck + lint simultaneously)
- **Auto-staging fixed files**: Biome and markdownlint pattern
- **Escape hatch preservation**: SKIP_TESTS=1, --no-verify, LEFTHOOK=0

### External Standards

- [Conventional Commits Specification](https://www.conventionalcommits.org/) - Industry standard format
- [commitlint Documentation](https://commitlint.js.org/) - Tool documentation
- [Lefthook Documentation](https://github.com/evilmartians/lefthook) - Hook manager docs

### Related Issues

- Issue #242 - This specification