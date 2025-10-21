# dl-starter

**Ship faster with AI.** Production-ready Next.js starter with built-in LLM collaboration tools, automated quality gates, and self-learning documentation that prevents repeat mistakes.

**Not just a template—a development methodology.** Two-lane workflow (simple vs. spec-driven), slash commands for common tasks, and a micro-lesson system that gets smarter with every PR.

## New App from Template (choose mode):

**Monorepo (portfolio)** – new app inside this repo

1. `pnpm i`
2. `pnpm tsx scripts/new-app.ts`
3. Fill `docs/product/PRD.md` MVP scope (acceptance + anti-goals)
4. `pnpm tsx scripts/starter-doctor.ts`
5. `pnpm turbo run dev --filter=<APP_SLUG>`
6. Plan → Scaffold Tests → Implement → Prepare PR (see `/prompts/tasks`)

**Export (new product repo)**

1. `pnpm i`
2. `pnpm tsx scripts/new-repo-from-template.ts`
3. `cd ../<APP_SLUG> && pnpm i`
4. Fill `docs/product/PRD.md` MVP scope
5. `pnpm tsx scripts/starter-doctor.ts`
6. `pnpm dev`

## Structure

- `apps/web/` - Next.js application
- `packages/ui/` - Shared UI components + design tokens
- `packages/types/` - Shared TypeScript types
- `packages/ai/` - AI utilities and prompts
- `packages/config/` - Shared ESLint/Prettier/TypeScript configs

## Why This Starter?

### 🤖 Built for Human-AI Collaboration with Skills

Most templates assume you're coding alone. This one assumes **you're pair programming with Claude**.

- **5 Discovery Commands + 11 Skills**: `/db`, `/test`, `/git`, `/spec`, `/code` - intuitive entry points
- **Progressive Disclosure**: Skills load only what's needed, saving 51-90% tokens
- **Self-Improving**: `skill-creator` meta-Skill lets you create new Skills from conversation
- **LLM-Optimized**: Skills work seamlessly with sub-agents for specialized tasks

**Real example:** Type `/db create user_preferences` → `supabase-integration` Skill generates migration, validates RLS policies, updates TypeScript types - all in one workflow.

#### How Skills Work

Skills use 3-tier progressive disclosure:

1. **Metadata** (always loaded): "This Skill handles database migrations"
2. **Instructions** (loaded when triggered): Step-by-step workflow
3. **Resources** (on-demand): Scripts executed, docs read only when needed

**Result**: Multi-step workflows that used to consume 3,200 tokens now use ~800 tokens (75% savings).

#### Built-In Skills (Coming Soon)

**Database & Backend**:

- `supabase-integration` - Migrations, RLS validation, type generation
- `dependency-manager` - Security updates and vulnerability scanning

**Development Workflow**:

- `test-scaffolder` - Generate tests from acceptance criteria (integrates with Test Generator sub-agent)
- `implementation-assistant` - Code generation with project standards
- `code-reviewer` - Automated quality gates before commit

**Git & Documentation**:

- `git-workflow` - Commits, PRs, branch management
- `documentation-sync` - Keep docs fresh automatically
- `learning-capturer` - Auto-save solutions as micro-lessons

**Advanced**:

- `project-scaffolder` - Generate components/routes/APIs with DL Starter conventions
- `skill-creator` (meta-skill) - Create new Skills from conversation
- `prd-analyzer` - Extract acceptance criteria from specs

See [Skills Documentation](.claude/skills/README.md) for complete catalog (available after Phase 1 implementation).

### ⚡ Automated Quality Gates (That Actually Help)

No more "oops, forgot to run tests" commits.

- **Pre-commit**: Auto-runs tests (<30s) before every commit
- **Pre-push**: Validates before pushing to remote
- **CI Pipeline**: Lint (zero warnings), typecheck, build, test, doctor checks
- **CodeRabbit**: Free AI code review on every PR

**The `/git:fix-pr` Command** - fetches all PR feedback (CI, CodeRabbit, doctor), categorizes issues (auto-fixable vs. manual), fixes them iteratively, and captures learnings. Turn CI failures into one-command fixes.

### 🧪 Testing That Doesn't Suck

Coverage-driven TDD with escape hatches for pragmatism.

- **70% coverage target** (configurable) with clear contracts
- **Vitest + Playwright + React Testing Library** - modern, fast, reliable
- **Test isolation helpers** - no more flaky tests from shared state
- **RLS test templates** - validate security policies, not just code

See [Testing Guide](docs/testing/TESTING_GUIDE.md) for the full philosophy.

### 🔍 Automated Quality Commands

One-command automation for critical quality checks using AI sub-agents.

- **`/security:scan`** - Scan for vulnerabilities (RLS policies, OWASP Top 10, secrets)
- **`/accessibility:audit`** - Validate WCAG 2.1 AA compliance with axe-core
- **`/db:migrate`** - Database migration workflow with RLS validation

**Cost-optimized:** Uses Haiku 4.5 sub-agents for 68% cost reduction vs Sonnet.

See [Automation Commands Guide](docs/automation-commands.md) for full details.

### 📚 Self-Organizing Knowledge

Documentation that **evolves with your codebase**, not against it.

- **Micro-Lessons**: 90-second notes on "gotchas" you encountered
- **Heat Ranking**: Most useful lessons rise to Top-10 automatically
- **ADR System**: Architectural decisions with full traceability
- **Wiki Auto-Sync**: GitHub Wiki stays in sync with your codebase

**Unlike static docs**, the micro-lesson system prevents knowledge rot:

- Old lessons fade (recency decay)
- Useful lessons get boosted (usage tracking)
- No single lesson monopolizes the top (capped contribution)

### 🏗️ Two Skill Workflows

**Quick Workflow** (80% of work) - Test → Code → Commit

```bash
/test           # test-scaffolder Skill generates failing tests
/code           # implementation-assistant implements to pass tests
/git commit     # git-workflow creates conventional commit
```

**Spec-Driven Workflow** (20% of work) - Specify → Test → Code → Commit

```bash
/spec           # prd-analyzer extracts acceptance criteria
                # Auto-chains to test-scaffolder
/code           # implementation-assistant implements
/git commit     # git-workflow creates commit
```

**Skill Chaining**: Skills automatically call other Skills when needed (e.g., `prd-analyzer` → `test-scaffolder`).

Don't over-engineer simple features. Don't under-engineer risky ones.

Decision framework built in:

- ✅ Bug fix? → Quick workflow
- ⚠️ Auth system? → Spec-driven workflow
- ✅ CSS tweak? → Quick workflow
- ⚠️ Payment integration? → Spec-driven workflow

See [CLAUDE.md](docs/ai/CLAUDE.md) for full decision rules.

### 📋 Epic System for Organizing Work

Track large initiatives with **minimal overhead**.

- **Epics** (`epic` label): Multi-issue work (>3 days OR multiple PRs)
- **Lane Labels**: `spec-lane` (complex) or `simple-lane` (straightforward)
- **Native GitHub**: No custom tooling, just labels + issues
- **Clear Hierarchy**: Epics link to sub-issues via checklist

**Example:** [Epic #151 - Complete Design System](https://github.com/Shredvardson/dl-starter/issues/151) organizes 5 issues across 3 phases.

See [Epic System Guide](docs/EPIC_SYSTEM.md) for details.

### 🔒 Security & Best Practices Baked In

From day one, not bolted on later.

- **Supabase RLS** with test templates
- **Sentry error tracking** (opt-in via env var)
- **Type-safe environment variables** with validation
- **Security scanning** via doctor checks
- **No hardcoded secrets** (validated in CI)

**Doctor checks** validate 23 different rules on every commit - from CLAUDE.md line limits to RLS policy coverage.

### 🎯 Database Migration Workflow That Works

Stop breaking prod with bad migrations.

- **Migration validation** catches destructive operations before they ship
- **Seed data scripts** for dev and test environments
- **RLS policy enforcement** with automated testing
- **Rollback strategies** documented per migration

See [Database Recipe](docs/recipes/db.md) for the complete workflow.

### When NOT to Use This Starter

**Use this if:** You're building a production SaaS, want to ship fast with AI assistance, and value automated quality over cowboy coding.

**Don't use this if:**

- You want a minimal starter (try create-next-app instead)
- You're building a static site (this is overkill)
- You hate documentation and structure (this won't work for you)
- You're prototyping and plan to throw it away (too much infrastructure)

**This starter has opinions.** If you agree with them, you'll ship 3x faster. If you don't, you'll fight the system.

### What Makes This Different?

| Feature                | create-next-app | vercel/commerce | **This Starter**                       |
| ---------------------- | --------------- | --------------- | -------------------------------------- |
| AI Collaboration Tools | ❌              | ❌              | ✅ 5 discovery commands + 11 Skills    |
| Self-Learning Docs     | ❌              | ❌              | ✅ Micro-lessons + heat ranking        |
| Automated PR Fixes     | ❌              | ❌              | ✅ `/git:fix-pr`                       |
| Testing Infrastructure | ⚠️ Basic        | ⚠️ Partial      | ✅ Full (70% coverage)                 |
| Database Migrations    | ❌              | ⚠️ Basic        | ✅ Validated + seeded                  |
| Quality Gates          | ❌              | ⚠️ Lint only    | ✅ 23 doctor checks                    |
| Skills Architecture    | ❌              | ❌              | ✅ Progressive disclosure (51-90% ↓)   |
| Two-Lane Workflow      | ❌              | ❌              | ✅ Quick + Spec-driven Skill workflows |
| Production Ready       | ⚠️ Starter      | ✅              | ✅ Battle-tested                       |

## 📘 Project Wiki

**For developers and AI agents** - comprehensive reference and best practices:

- [🏠 **Home**](https://github.com/Shredvardson/dl-starter/wiki/Home) - Mission, two-lane development model, guardrails
- [📋 **Spec System**](https://github.com/Shredvardson/dl-starter/wiki/Spec-System) - Kernel templates (Full/Micro) and examples
- [⚡ **Commands**](https://github.com/Shredvardson/dl-starter/wiki/Commands) - Complete slash command reference
- [✅ **Quality Gates**](https://github.com/Shredvardson/dl-starter/wiki/Quality-Gates) - Pipeline explanation and standards
- [🏗️ **Architecture**](https://github.com/Shredvardson/dl-starter/wiki/Architecture) - Stack, structure, and UI rules
- [🚀 **Getting Started**](https://github.com/Shredvardson/dl-starter/wiki/Getting-Started) - Setup and first contribution
- [🤖 **AI Collaboration**](https://github.com/Shredvardson/dl-starter/wiki/AI-Collaboration) - Best practices with Claude/GPT-5

## Docs for LLMs

- `CLAUDE.md` (operational workflow index + rules)
- `docs/llm/context-map.json` (monorepo routing map)
- `docs/llm/STARTER_MANIFEST.json` (what to customize per app)
- `docs/llm/DESIGN_CONSTITUTION.md` (architecture binding rules)

## Customize

- `apps/web/src/app/(marketing)/page.tsx` (copy)
- `packages/ui/styles/tokens.css` (brand hue / tokens)
- `app.config.ts` (feature toggles: billing/orgs/ai)

## Optional Integrations

- **Sentry**: Set `SENTRY_DSN` to enable error tracking (silent if not set)
- **Auth**: See [docs/recipes/auth.md](docs/recipes/auth.md)
- **Database**: See [docs/recipes/db.md](docs/recipes/db.md) - includes migration validation & seeding
- **Payments**: See [docs/recipes/stripe.md](docs/recipes/stripe.md)

## Testing

Comprehensive test infrastructure with unit, RLS, E2E, and CI script tests:

```bash
pnpm test            # Run all tests
pnpm test:unit       # Run unit tests only
pnpm test:e2e        # Run E2E tests only
pnpm test:coverage   # Generate coverage report
pnpm test:ci-scripts # Run CI script integration tests
```

**Coverage Target**: 70% minimum (see [Testing Guide](docs/testing/TESTING_GUIDE.md))

**Test Stack**: Vitest 3.2.4 + Playwright 1.55.1 + React Testing Library 16.3.0

**CI Script Tests**: Integration tests for CI validation scripts (spec validation, lane detection, etc.)

See [docs/testing/TESTING_GUIDE.md](docs/testing/TESTING_GUIDE.md) for complete documentation.

## Scripts

### Development

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
```

### Database

```bash
pnpm db:start         # Start local Supabase
pnpm db:stop          # Stop local Supabase
pnpm db:reset         # Reset database with migrations
pnpm db:validate      # Validate migrations for safety
pnpm db:seed:dev      # Seed development data
pnpm db:seed:test     # Seed deterministic test data
```

See [docs/recipes/db.md](docs/recipes/db.md) for complete database workflow.

## CI Overview

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs parallel jobs on every push, PR, and manual trigger:

- **ci**: Main build pipeline (lint with zero warnings, typecheck, build, tests, artifact upload)
- **doctor**: Runs `starter-doctor.ts` to validate template integrity and configuration
- **spec-gate**: Runs specification gate checks on pull requests
- **e2e**: End-to-end test pipeline (if applicable to changes)
- **docs-check**: Documentation sync validation (advisory, non-blocking)

**Manual runs**: Use GitHub's "Run workflow" button or `gh workflow run "CI" --ref your-branch`

**Node matrix**: Enable testing on Node 18 + 20 by checking "Enable Node.js matrix testing" when manually triggering

## Node & pnpm

Node 20 (see `.nvmrc` / `.node-version`). pnpm version is managed by `packageManager` in `package.json`.
