# CLAUDE.md (Lean)

## Mission & Guardrails

See [docs/constitution.md](../constitution.md) for complete project mission, guardrails, and AI collaboration rules.

## ⚠️ Command Discovery Protocol

**ALWAYS check for custom commands BEFORE using native tools**

This project has custom commands/skills with built-in quality gates, sub-agent orchestration, and learning capture.

**The Process:**

1. About to do something (git operation, db migration, create test, etc.)?
2. Check: "Does `.claude/commands/QUICK_REFERENCE.md` have a command for this?"
3. If YES → Use the command (it triggers workflows, agents, validations)
4. If NO → Use native tools

**Common Examples:**

- Git operations → Check for `/git:*` commands FIRST
- Database changes → Check for `/db:*` commands FIRST
- Test creation → Check for `/test:*` commands FIRST
- Spec/implementation → Check for `/spec:*`, `/code` commands FIRST

**Why this matters:** Commands trigger sub-agents, quality gates, and learning capture that native tools bypass.

## Development Workflows

**Default: Simple Workflow** (80% of development work)  
**Conditional: Spec-Driven Workflow** (complex/risky work only)

### 🚀 Simple Workflow (Default - Start Here)

Plan → Scaffold tests → Implement → Refactor/Secure → Prepare PR → Fix PR (if CI fails) → Self-critique → Docs & Release

**Use for:** Bug fixes, single-component changes, refactoring, docs, UI tweaks, anything completable in 1-2 hours.

**Commands:** `/dev:plan-feature` → existing implementation commands

### 🏗️ Spec-Driven Workflow (Complex/Risky Only)

Specify → Plan → Tasks → Implement → Refactor/Secure → Prepare PR → Fix PR (if CI fails) → Self-critique → Docs & Release

**Use ONLY for:** Auth/authorization systems, database schema changes, payment integration, external APIs, new security-sensitive dependencies, multi-day features, breaking API changes, infrastructure changes, unclear requirements needing planning, cross-cutting concerns.

**Commands:** `/specify` → `/plan` → `/tasks` → existing implementation commands

### 🎯 Decision Framework

**Ask yourself:**

1. **Risk**: Could this break authentication, payments, or data?
2. **Scope**: Will this touch 3+ files or take more than 2 hours?
3. **Clarity**: Do I fully understand what needs to be built?
4. **Dependencies**: Am I adding new packages or external services?

**If 2+ answers are "yes" → Spec-Driven. Otherwise → Simple.**

**When user says "Start working on issue XXX" or "Pick a suitable lane":**

- Assess using Decision Framework above
- **If Spec-Driven:** Run `/specify` → `/plan` → `/tasks` in sequence
- **If Simple:** Use `/dev:plan-feature` for lightweight planning

**Reference**: All workflows must follow `docs/constitution.md` architectural decisions.

### 🔥 Discovered Bug Protocol (Legitimate Bypass)

**When:** Bug discovered DURING implementation that blocks current work

**Quick flow:** Fix immediately → Create PR → Create issue retroactively → Link them

**Commands:** `/git:branch` → `/git:prepare-pr` → `/github:create-issue`

**Why acceptable:** Bugs should be fixed immediately. Retroactive docs maintain audit trail.

**NOT for:** New features, architecture changes, breaking changes, security issues.

**Full protocol:** [docs/workflows/discovered-bug-protocol.md](../workflows/discovered-bug-protocol.md)

## Commands Index (⚠️ Check These Before Native Tools)

**Before using git, gh, npm, or database tools, check this list.**

Custom commands include quality gates and PR workflows that native tools bypass.

### Spec-Driven Development (Complex Features)

- /specify → ../../.claude/commands/spec/specify.md
- /plan → ../../.claude/commands/spec/plan.md
- /tasks → ../../.claude/commands/spec/tasks.md

### Simple Development (Small Changes)

- /dev:init-new-app → ../../.claude/commands/dev/init-new-app.md
- /dev:plan-feature → ../../.claude/commands/dev/plan-feature.md
- /test:scaffold → ../../.claude/commands/test/scaffold.md
- /dev:implement → ../../.claude/commands/dev/implement.md
- /dev:refactor-secure → ../../.claude/commands/dev/refactor-secure.md

### Operational Assistant (Phase 6)

- /adr:draft → ../../.claude/commands/spec/adr-draft.md
- /pr:assist → ../../.claude/commands/git/pr-assistant.md
- /ops:learning-capture → ../../.claude/commands/ops/learning-capture.md

### GitHub Integration

- /github:create-issue → ../../.claude/commands/github/create-issue.md
- /github:github-learning-capture → ../../.claude/commands/github/capture-learning.md
- /quality:run-linter → ../../.claude/commands/quality/run-linter.md
- /git:branch → ../../.claude/commands/git/branch.md
- /git:commit → ../../.claude/commands/git/commit.md
- /git:workflow → ../../.claude/commands/git/workflow.md
- /git:prepare-pr → ../../.claude/commands/git/prepare-pr.md
- /git:fix-pr → ../../.claude/commands/git/fix-pr.md
- /review:self-critique → ../../.claude/commands/review/self-critique.md
- /review:ai-powered → AI-powered PR review via GitHub Action (mention-only)
- /security:scan → Advisory security review for vulnerabilities
- /docs:generate → ../../.claude/commands/docs/generate.md
- /git:tag-release → ../../.claude/commands/git/tag-release.md
- /README → ../../.claude/commands/README.md

## Learning Loop (Micro-Lessons + PR Checklist)

Minimal learnings capture system to reduce repeat mistakes and keep agent context lean.

**Micro-Lessons** (≤90s notes): Stored in `docs/micro-lessons/` using standardized template. Promote to Recipe when pattern repeats ≥2× or has high blast radius.

**Top-10 Index**: Auto-generated at `docs/micro-lessons/INDEX.md` via `pnpm learn:index`. Link agents to this index rather than inlining large context blocks.

**PR Checklist**: 6-item learning checklist in PR template covers common patterns (isolation hooks, boundary mocks, stable React keys, dead code removal, async assertions, memoization).

**Quality Gate**: Doctor checks that learnings index exists and is current when micro-lessons are present.

**What not to do**: No full transcripts, no giant pasted context blocks. Use file links and keep edits minimal.

**How to validate**: Run `pnpm doctor` before submitting changes.

## Pull Request Rules (MUST DO)

When you open a PR:

- **Documentation check runs automatically** via `/git:prepare-pr` — advisory/non-blocking, runs before commit (checks for gaps in slash commands, package.json scripts, env vars, API routes). Applies to both workflows.
- Use a **specific, action-oriented title** (e.g., `feat: add user auth with OAuth2`, `fix: resolve memory leak in cache`)
- Set the PR body from `.github/pull_request_template.md` and **fill sections**:
  - Summary (1–3 sentences), Scope, Verification (paste command results), Breaking changes/Migration
- If you only push commits (no PR), **create** the PR via CLI:

  ```bash
  gh pr create --title "feat: descriptive title" --body-file .github/pull_request_template.md
  ```

- Never leave placeholder text in a PR

## Security & Review Commands

See [docs/workflow-security.md](../workflow-security.md) for complete review commands, operational controls, and security guidelines.

## UI Components & Testing

**Components:** [Workflow](../COMPONENT_WORKFLOW.md) (existing → shadcn → approved libs → custom)

See [Testing Guide](../testing/TESTING_GUIDE.md) for comprehensive testing patterns, coverage requirements, and best practices.

**Quick:** `/test:scaffold` · `pnpm test` · `pnpm test:e2e` · `pnpm test:coverage` · **Scratch:** `docs/scratch/` ([README](../scratch/README.md))

## References

- [CONTRIBUTING.md](../../CONTRIBUTING.md) · [RELEASING.md](../../RELEASING.md) · [SECURITY.md](../../SECURITY.md)
- [Auth Recipe](../recipes/auth.md) · [Database Recipe](../recipes/db.md) · [Environment Setup](../recipes/env-setup.md) · [Stripe Recipe](../recipes/stripe.md) · [ShadCN Recipe](../recipes/shadcn.md)
- [Evaluations](../evaluations/INDEX.md) - Tool and workflow assessments
- [Decisions (ADRs)](../decisions/README.md) - Architectural decision records
