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

- **Pre-commit**: Instant feedback (<1s) with Biome
  - ⚡ Format & lint ([~35x faster than Prettier](https://biomejs.dev/), instant feedback)
  - 🔧 Auto-stages fixed files (zero friction)
  - 📚 Auto-update micro-lessons index
- **Pre-push**: Comprehensive validation (8-15s with parallel execution)
  - 🚫 Block direct pushes to main branch
  - 📦 Lockfile sync check when package.json changes
  - 🔎 TypeScript type checking + ✨ ESLint (parallel execution)
  - 🔧 CI script validation
  - 🧪 Unit tests
  - ⏭️ Bypass with `git push --no-verify` if needed
- **Auto-installing hooks**: Lefthook syncs on `pnpm install` (no manual setup!)
- **CI Pipeline**: Lint (zero warnings), typecheck, build, test, doctor checks
- **CodeRabbit**: Free AI code review on every PR

**Impact**: 2x faster validation (15-30s → 8-15s), instant commit feedback, zero setup for new contributors. Pre-push hook prevents 100% of lockfile sync issues, type errors, and lint failures before CI—saving 20-30 minutes per PR.

**The `/git:fix-pr` Command** - fetches all PR feedback (CI, CodeRabbit, doctor), categorizes issues (auto-fixable vs. manual), fixes them iteratively, and captures learnings. Turn CI failures into one-command fixes.

### 🧪 Testing That Doesn't Suck

Coverage-driven TDD with escape hatches for pragmatism.

- **70% coverage target** (configurable) with clear contracts
- **Vitest + Playwright + React Testing Library** - modern, fast, reliable
- **Test isolation helpers** - no more flaky tests from shared state
- **Dual-layer RLS testing** - validate security at both application (Vitest) and database (pgTAP) levels
- **Transaction-isolated database tests** - no manual cleanup, no side effects

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

Comprehensive test infrastructure with **5 test types** covering unit, dual-layer RLS security, E2E, and CI validation:

```bash
pnpm test            # Run all tests
pnpm test:unit       # Run unit tests only (pre-push hook)
pnpm test:rls        # Run database-level RLS tests (pgTAP)
pnpm test:e2e        # Run E2E tests only
pnpm test:coverage   # Generate coverage report
pnpm test:ci-scripts # Run CI script integration tests
```

### Test Types & What They Cover

**Unit Tests** (Vitest 3.2.4 + React Testing Library 16.3.0)

- Component rendering and interactions
- Utility functions and business logic
- Integration with mocked dependencies
- **Coverage target**: 70% lines/functions/statements, 65% branches

**RLS Security Tests - Application Level** (Vitest + Supabase Test Client)

- Row-Level Security from application perspective
- API endpoints respect RLS policies
- Client-side auth context handling
- **Templates ready** in `apps/web/tests/rls/` (requires tables)

**RLS Security Tests - Database Level** (pgTAP + basejump-supabase_test_helpers)

- RLS policies tested directly in Postgres
- Schema-wide validation (catches tables missing RLS)
- Transaction-isolated (automatic rollback, no cleanup)
- User isolation and anonymous access validation
- **Defense in depth**: Complements application-level RLS tests

**E2E Tests** (Playwright 1.56.1)

- Critical user flows (auth, navigation, CRUD)
- Accessibility validation (@axe-core/playwright)
- Cross-browser testing (Chrome + Mobile Chrome)
- **Smoke tests complete** (4 passing)

**CI Script Tests** (Bash + Integration)

- Spec validation (naming, structure, required files)
- Lane detection (simple vs. spec-driven)
- Pre-commit/pre-push hook validation
- **6/6 tests passing**

### TDD Workflow

1. **Contracts First** → Define security boundaries and user flows
2. **RLS Tests** → Security policy validation (templates ready)
3. **E2E Tests** → Critical user flows (smoke tests complete)
4. **Unit Tests** → Component and function testing

Use `/test unit <path>` to scaffold tests with the Test Generator sub-agent.

### Pre-Push Hook

Unit tests run automatically on `git push` (target: 8-15s). Bypass with `--no-verify` if needed.

See [Testing Guide](docs/testing/TESTING_GUIDE.md) for complete documentation, best practices, and troubleshooting.

## Scripts

### Development

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Build all packages
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
```

### UI Components

```bash
# List existing components
ls packages/ui/src/components/ui/

# Add shadcn component (from packages/ui/)
cd packages/ui
npx shadcn@latest add <component-name>

# Example: Add navigation-menu component
npx shadcn@latest add navigation-menu
```

**Always check existing components first before creating new ones!**
See [docs/COMPONENT_WORKFLOW.md](docs/COMPONENT_WORKFLOW.md) for the complete workflow.

### Database

```bash
pnpm db:start         # Start local Supabase
pnpm db:stop          # Stop local Supabase
pnpm db:reset         # Reset database with migrations
pnpm db:validate      # Validate migrations for safety
pnpm db:validate:rls  # Validate Row-Level Security policies (app-level)
pnpm db:rls:scaffold  # Generate RLS policies for a table
pnpm test:rls         # Run database-level RLS tests (pgTAP)
pnpm test:rls:watch   # Watch mode for RLS test development
pnpm db:seed:dev      # Seed development data
pnpm db:seed:test     # Seed deterministic test data
```

**Dual-Layer RLS Validation**:
- `db:validate:rls` - Application-level validation (runs in CI)
- `test:rls` - Database-level pgTAP tests with transaction isolation (runs in CI)

Both layers ensure comprehensive security coverage. See [RLS Implementation Guide](docs/database/rls-implementation.md) and [Testing Guide](docs/testing/TESTING_GUIDE.md#pgtap-rls-tests-database-level) for details.

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
