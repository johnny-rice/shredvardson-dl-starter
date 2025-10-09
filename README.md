# dl-starter (Monorepo)

Lightweight, LLM-friendly Next.js starter template with Turborepo.

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

Comprehensive test infrastructure with unit, RLS, and E2E tests:

```bash
pnpm test           # Run all tests
pnpm test:unit      # Run unit tests only
pnpm test:e2e       # Run E2E tests only
pnpm test:coverage  # Generate coverage report
```

**Coverage Target**: 70% minimum (see [Testing Guide](docs/testing/TESTING_GUIDE.md))

**Test Stack**: Vitest 3.2.4 + Playwright 1.55.1 + React Testing Library 16.3.0

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

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs three parallel jobs on every push, PR, and manual trigger:

- **ci**: Main build pipeline (lint with zero warnings, typecheck, build, tests, artifact upload)
- **doctor**: Runs `starter-doctor.ts` to validate template integrity and configuration
- **spec-gate**: Runs specification gate checks on pull requests

**Manual runs**: Use GitHub's "Run workflow" button or `gh workflow run "CI" --ref your-branch`

**Node matrix**: Enable testing on Node 18 + 20 by checking "Enable Node.js matrix testing" when manually triggering

## Node & pnpm

Node 20 (see `.nvmrc` / `.node-version`). pnpm version is managed by `packageManager` in `package.json`.
