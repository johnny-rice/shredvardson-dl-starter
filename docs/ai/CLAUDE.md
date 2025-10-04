# CLAUDE.md (Lean)

## Mission & Guardrails

See [docs/constitution.md](../constitution.md) for complete project mission, guardrails, and AI collaboration rules.

## Development Workflows

**Default: Simple Workflow** (80% of development work)  
**Conditional: Spec-Driven Workflow** (complex/risky work only)

### 🚀 Simple Workflow (Default - Start Here)

Plan → Scaffold tests → Implement → Refactor/Secure → Prepare PR → Self-critique → Docs & Release

**Use Simple Workflow for:**

- ✅ Bug fixes and small improvements
- ✅ Single-component changes
- ✅ Refactoring existing code
- ✅ Documentation updates
- ✅ UI tweaks and styling
- ✅ Adding props to existing components
- ✅ Quick prototypes and experiments
- ✅ **Anything you can complete in 1-2 hours**

**Commands:** `/dev:plan-feature` → existing implementation commands

### 🏗️ Spec-Driven Workflow (Complex/Risky Only)

Specify → Plan → Tasks → Implement → Refactor/Secure → Prepare PR → Self-critique → Docs & Release

**Use Spec-Driven Workflow ONLY when:**

- ⚠️ **Authentication or authorization systems**
- ⚠️ **Database schema changes or new models**
- ⚠️ **Payment or billing integration**
- ⚠️ **External API integrations**
- ⚠️ **New dependencies** (especially with security implications)
- ⚠️ **Multi-day features** with multiple components
- ⚠️ **Breaking changes** to existing APIs
- ⚠️ **Infrastructure or deployment changes**
- ⚠️ **When requirements are unclear** and need GPT-5 planning
- ⚠️ **Cross-cutting concerns** affecting multiple apps/packages

**Commands:** `/specify` → `/plan` → `/tasks` → existing implementation commands

### ❌ When NOT to Use Spec-Driven Workflow

**Don't over-engineer these common tasks:**

- Simple component creation
- Adding a new route or page
- Updating copy/text content
- CSS/styling adjustments
- Adding console logs or debug info
- Renaming variables or functions
- Adding TypeScript types for existing data
- Documentation updates
- Test file creation for existing features

### 🎯 Decision Framework

**Ask yourself:**

1. **Risk**: Could this break authentication, payments, or data?
2. **Scope**: Will this touch 3+ files or take more than 2 hours?
3. **Clarity**: Do I fully understand what needs to be built?
4. **Dependencies**: Am I adding new packages or external services?

**If 2+ answers are "yes" → Spec-Driven. Otherwise → Simple.**

**Reference**: All workflows must follow `docs/constitution.md` architectural decisions.

## Commands Index

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
- /ops:wiki-sync → ../../.claude/commands/ops/wiki-sync.md
- /ops:learning-capture → ../../.claude/commands/ops/learning-capture.md

### GitHub Integration

- /github:create-issue → ../../.claude/commands/github/create-issue.md
- /github:github-learning-capture → ../../.claude/commands/github/capture-learning.md
- /github:update-wiki → ../../.claude/commands/github/update-wiki.md
- /quality:run-linter → ../../.claude/commands/quality/run-linter.md
- /git:branch → ../../.claude/commands/git/branch.md
- /git:commit → ../../.claude/commands/git/commit.md
- /git:workflow → ../../.claude/commands/git/workflow.md
- /git:prepare-pr → ../../.claude/commands/git/prepare-pr.md
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

## Testing

See [Testing Guide](../testing/TESTING_GUIDE.md) for comprehensive testing patterns, coverage requirements, and best practices.

**Quick Commands:**
- `/test:scaffold` - Generate test scaffolding for new features
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:coverage` - Generate coverage report

## References

- [CONTRIBUTING.md](../../CONTRIBUTING.md) · [RELEASING.md](../../RELEASING.md) · [SECURITY.md](../../SECURITY.md)
- [Auth Recipe](../recipes/auth.md) · [Database Recipe](../recipes/db.md) · [Environment Setup](../recipes/env-setup.md) · [Stripe Recipe](../recipes/stripe.md) · [ShadCN Recipe](../recipes/shadcn.md)
- [Evaluations](../evaluations/INDEX.md) - Tool and workflow assessments
- [Decisions (ADRs)](../decisions/README.md) - Architectural decision records

## Testing Notes

This implementation has been tested with GPT-5's 3-part smoke test sequence for operational validation.
