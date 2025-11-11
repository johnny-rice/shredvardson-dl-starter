# Product Requirements Document: DL Starter Template

> **📌 Note:** This is the PRD for the **DL Starter template itself** (the meta-product). When creating a new app from this template, you'll create your own PRD specific to that app.

**Version**: 1.0
**Last Updated**: 2025-11-09
**Status**: Active

---

## Problem Statement

Building production-ready SaaS applications requires solving the same foundational problems repeatedly: authentication, testing infrastructure, database migrations, CI/CD pipelines, and quality gates. Most developers either start from scratch (wasting weeks) or use minimal templates that leave critical infrastructure gaps.

**Worse**, traditional development assumes solo coding. Modern development is **human-AI collaboration**, but existing templates provide no guidance on effectively working with AI assistants like Claude.

## Target Users

### Primary: Solo Developers & Small Teams (1-3 people)

- Building production SaaS applications
- Want to ship fast without cutting corners on quality
- Comfortable with AI pair programming (Claude Code)
- Value automation and guardrails over manual processes

### Secondary: AI-First Developers

- Developers who primarily work through AI assistants
- Need structured workflows to maintain quality with AI
- Want self-improving documentation that prevents repeat mistakes

### Anti-Personas (Who This Is NOT For)

- Developers building static sites (use Astro/Hugo)
- Rapid prototypers who plan to throw away code (too much infrastructure)
- Teams who prefer minimal structure (will fight the opinions)
- Projects without databases (unnecessary complexity)

## Solution: Production-Ready Starter with AI Collaboration Built In

A **Next.js monorepo starter template** that provides:

1. **Complete infrastructure** (auth, testing, DB migrations, CI/CD)
2. **AI collaboration tools** (slash commands, sub-agents, progressive disclosure)
3. **Self-improving docs** (micro-lessons that evolve with your codebase)
4. **Automated quality gates** (pre-commit, pre-push, CI checks)

**Not just a template—a development methodology.**

---

## MVP Scope (What's Included NOW)

### Core Infrastructure ✅

- **Next.js 15** monorepo with Turbo
- **TypeScript** strict mode with shared configs
- **Tailwind CSS** + shadcn/ui component library
- **Supabase** integration (auth + database)
- **Authentication module** (email/password, protected routes, password reset)

### Testing Infrastructure ✅

- **Vitest** for unit tests with React Testing Library
- **Playwright** for E2E tests + accessibility validation
- **Coverage contracts** (70% target with pragmatic exclusions)
- **pgTAP** for database-level RLS testing
- **Test isolation helpers** (no manual cleanup, no flaky tests)

### Quality Gates ✅

- **Pre-commit**: Biome formatting/linting (<1s), auto-stage fixes
- **Pre-push**: Tests + typecheck + lint (8-15s target)
- **CI/CD**: Full pipeline (lint, typecheck, build, test, doctor checks)
- **CodeRabbit**: Free AI code reviews on every PR

### Database Workflow ✅

- **Migration validation** (catches destructive operations)
- **Seed scripts** (dev and test environments)
- **RLS policy templates** with dual-layer validation
- **Type generation** from database schema

### Design System ✅

- **Semantic design tokens** (CSS variables for colors, spacing, typography)
- **Component playground** at `/design` route (live examples with code snippets)
- **shadcn/ui integration** (40+ components with consistent theming)
- **Accessibility built-in** (ARIA attributes, keyboard navigation, screen reader support)
- **External library patterns** (tremor, dnd-kit templates ready for integration)

### AI Collaboration Tools ✅

- **40+ slash commands** organized into Skills (git, db, test, spec, code, design, etc.)
- **5 discovery commands** as entry points (`/git`, `/db`, `/test`, `/spec`, `/code`)
- **Command discovery protocol** (check for custom commands before native tools)
- **Sub-agent architecture** (specialized agents for template-based tasks)
- **Spec-driven workflow** (`/specify`, `/plan`, `/tasks` with Socratic design discovery)
- **Claude Code Web delegation** (parallel task execution for tests, docs, type safety - 40-52 hours in batch)

### Documentation System ✅

- **Constitution** (binding architectural decisions)
- **CLAUDE.md** (AI workflow rules and command index)
- **Testing guides** (comprehensive philosophy and troubleshooting)
- **Recipe docs** (database, components, common workflows)
- **Design system docs** (component patterns, token usage, accessibility guidelines)
- **Micro-lessons system** (123+ lessons synthesized into 8 pattern guides)
- **Delegation workflow** (batch task generation in `delegation-packages/` directory)

### Security & Best Practices ✅

- **Row-Level Security (RLS)** with test templates
- **Secret scanning** (Gitleaks pre-commit + CI)
- **Type-safe env vars** with validation
- **Doctor checks** (23 rules validated on every commit)

---

## Explicit Non-Goals (What's NOT Included)

### Infrastructure Features (Post-MVP)

These are planned for **after** core MVP is stable:

- ⏳ **Payments integration** (Stripe) - Issue #293 (recipe doc exists)
- ⏳ **Email service** (Resend) - Issue #295 (planned)
- ⏳ **AI integration** (Vercel AI SDK) - Issue #294 (OpenAI + Anthropic)
- ⏳ **Internationalization (i18n)** - Issue #296 (next-intl)
- ⏳ **Deployment docs** - Issue #297 (Vercel + Supabase setup)
- ❌ **Multi-tenancy/organizations** - Beyond MVP scope
- ❌ **Advanced auth** (OAuth, SSO, MFA) - Basic email/password sufficient
- ❌ **File uploads** - Add when needed per project
- ❌ **Background jobs** - Add when needed per project

### Testing Features (In Scope for MVP)

These ARE part of MVP (Epic #303 - Autonomous AI-Powered E2E Testing):

- ✅ **Playwright MCP integration** - Already working (manual UI testing)
- ⏳ **Auth E2E tests** - Issue #304 (codify validated flows)
- ⏳ **Playwright native agents** - Issue #305 (planner, generator, healer)
- ⏳ **Self-healing test loop** - Issue #306 (automated PR fixes)
- ⏳ **Visual regression testing** - Issue #307 (screenshot comparison)
- ⏳ **Design token compliance** - Issue #308 (automated enforcement)

**Pragmatic Limits:**

- ❌ **100% code coverage** - 70% target is sufficient
- ❌ **Performance testing** - Add when performance issues arise
- ❌ **Cross-browser E2E** (Chrome only for MVP)

### Documentation (YAGNI)

- ❌ **Comprehensive API docs** - Code comments + TypeScript types sufficient
- ❌ **Video tutorials** - Written docs sufficient
- ❌ **Automated changelog** - Manual release notes sufficient

---

## Design Principles

### 1. Starter Template First, Production App Second

**Principle**: Keep it simple and demonstrable. Show patterns, don't build the world.

- ✅ One example of auth (email/password)
- ❌ Five auth providers (OAuth, SSO, MFA, etc.)
- ✅ One RLS policy template per table type
- ❌ Complex multi-tenant authorization framework

**Why**: Users will customize. Show them how, don't overwhelm them with options.

### 2. MVP Over Feature Completeness

**Principle**: Build only what's needed for acceptance criteria. Document the rest.

- ✅ Basic secret scanning (Gitleaks defaults + 2 custom rules)
- ❌ 13 custom rules for every possible secret type (use defaults)
- ✅ Pre-push hook runs tests (<15s)
- ❌ Pre-push hook runs tests + E2E + coverage report (too slow)

**Why**: 87% less code to maintain. Users can add complexity when needed.

**Reference**: See micro-lesson `docs/learning/mvp-scope-creep-detection.md`

### 3. AI Collaboration as First-Class Citizen

**Principle**: Optimize for human-AI pair programming, not solo human coding.

- ✅ Slash commands with quality gates built in
- ✅ Command discovery protocol (check commands before native tools)
- ✅ Sub-agents for specialized tasks (cost-optimized with Haiku)
- ❌ Assume developers read all docs and remember all commands

**Why**: Modern development IS AI collaboration. Template should make that excellent.

### 4. Automation Over Documentation

**Principle**: Encode knowledge in scripts and quality gates, not just docs.

- ✅ Doctor checks validate 23 rules on every commit
- ✅ Pre-push hook prevents 100% of lint/type/test failures before CI
- ✅ Migration validation catches destructive operations before deploy
- ❌ "Remember to run tests before pushing" in docs (humans forget)

**Why**: Machines enforce consistently. Humans forget under pressure.

### 5. Progressive Enhancement, Not Big Bang

**Principle**: Ship working features incrementally. Table non-critical enhancements.

- ✅ Auth module: Email/password working end-to-end
- ❌ Auth module: Email/password + OAuth + magic links + MFA (scope creep)
- ✅ Testing: 70% coverage with pragmatic exclusions
- ❌ Testing: 100% coverage with zero exclusions (diminishing returns)

**Why**: Perfect is the enemy of shipped. Iterate based on real usage.

### 6. Convention Over Configuration (With Escape Hatches)

**Principle**: Opinionated defaults, but allow bypass when needed.

- ✅ Pre-push hook runs tests (bypass with `--no-verify`)
- ✅ 70% coverage target (configurable in `vitest.config.ts`)
- ✅ Conventional commits enforced (bypass with `--no-verify`)
- ❌ Zero escape hatches (forces developers to work around system)

**Why**: Guardrails prevent mistakes. Escape hatches prevent frustration.

---

## Success Criteria

### For Template Maintainers (Us)

- ✅ New developer can clone and run locally in <15 minutes
- ✅ All CI checks pass on main branch (green build)
- ✅ Doctor checks validate 23 rules without manual intervention
- ✅ Test coverage meets 70% threshold with pragmatic exclusions
- ✅ Auth flow works end-to-end (signup → login → protected route)
- ✅ Database migrations run cleanly with RLS policies validated

### For Template Users (Developers Using This)

- ✅ Can scaffold new app with `pnpm tsx scripts/new-app.ts`
- ✅ Can understand two-lane workflow (simple vs. spec-driven) in <10 minutes
- ✅ Can find relevant slash commands via `QUICK_REFERENCE.md`
- ✅ Can deploy to Vercel + Supabase with recipe docs
- ✅ Pre-push hook catches 100% of lint/type/test failures before CI
- ✅ CodeRabbit provides helpful feedback on PRs (not just noise)

### For AI Collaboration (Claude)

- ✅ Command discovery protocol prevents bypass of quality gates
- ✅ Constitution prevents architectural rule violations
- ✅ Sub-agents can execute template-based tasks autonomously
- ✅ Doctor checks provide clear feedback when quality rules violated
- ✅ Slash commands include enough context to execute correctly

---

## Out of Scope (For This PRD)

### Features Documented for Later

These are **not anti-goals**—they're just **not MVP**. Recipe docs or specs exist for future implementation.

- **Stripe payments** - Recipe doc at `docs/recipes/stripe.md`
- **Email service (Resend)** - Planned, not yet implemented
- **Skills system** - Spec complete, implementation deferred
- **Micro-lessons system** - Deprecated, replaced with simpler approach

### True Anti-Goals (Don't Build)

These are things we **explicitly don't want**, even in future phases.

- ❌ **CMS integration** - Out of scope for starter template
- ❌ **GraphQL layer** - REST + tRPC sufficient
- ❌ **Multiple database support** - Supabase (Postgres) only
- ❌ **Mobile app** - Web only
- ❌ **Real-time collaboration features** - Beyond MVP scope

---

## Future Phases (Roadmap Preview)

### Phase 1: Skills System (Deferred)

Progressive disclosure architecture for AI collaboration:

- Metadata (always loaded) → Instructions (on-trigger) → Resources (on-demand)
- 11 built-in Skills (database, testing, git, documentation, etc.)
- 51-90% token reduction for multi-step workflows
- Spec complete, implementation deferred until proven necessary

### Phase 2: Stripe Integration (Planned)

Production-ready payments:

- Subscription management (create, cancel, update)
- Webhook handling with signature verification
- Customer portal integration
- Recipe doc exists at `docs/recipes/stripe.md`

### Phase 3: Email Service (Planned)

Transactional emails via Resend:

- Welcome emails, password reset, notifications
- Template system with brand consistency
- Tracking and analytics integration

### Phase 4: Advanced Auth (Maybe)

Only if strong user demand:

- OAuth providers (Google, GitHub)
- Magic link authentication
- Multi-factor authentication (MFA)

---

## Measures of Success (3-6 Months Post-Launch)

### Adoption Metrics

- **5+ developers** using template for production projects
- **10+ GitHub stars** (indicates external interest)
- **0 critical bugs** reported in core infrastructure (auth, migrations, CI)

### Quality Metrics

- **<5 minute setup time** for new developers (clone → local dev)
- **90%+ CI pass rate** on PRs (pre-push hook prevents most failures)
- **Zero RLS bypass incidents** (validation catches all missing policies)

### Efficiency Metrics

- **3x faster** to production vs. starting from create-next-app
- **50% fewer review cycles** (automated quality gates catch issues early)
- **90% fewer "how do I..." questions** (docs + slash commands + doctor checks)

---

## When to Revisit This PRD

### Required Reviews

- **Quarterly** (every 3 months) - Are principles still serving us?
- **After major features** - Does new feature align with MVP scope?
- **When users report confusion** - Are non-goals clear enough?

### Triggers for Updates

- ✅ User feedback indicates missing critical feature (re-evaluate non-goals)
- ✅ New AI capabilities unlock better collaboration patterns (update principles)
- ✅ Testing strategy needs adjustment (update coverage targets)
- ✅ Performance issues arise (add performance testing to scope)

**Next Review**: 2026-02-09

---

## Appendix: Key Documents

### For Human Developers

- [README.md](../README.md) - Quick start and feature overview
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Step-by-step setup (Issue #197, not yet created)
- [Testing Guide](./testing/TESTING_GUIDE.md) - Comprehensive testing philosophy
- [Database Recipe](./recipes/db.md) - Migration and RLS workflow

### For AI Assistants (Claude)

- [CLAUDE.md](./ai/CLAUDE.md) - Workflow rules and command index
- [Constitution](./constitution.md) - Binding architectural decisions
- [QUICK_REFERENCE.md](./.claude/commands/QUICK_REFERENCE.md) - Command discovery

### Contracts & Standards

- [Coverage Contract](./testing/coverage-contract.md) - Testing thresholds and philosophy
- [RLS Implementation Guide](./database/rls-implementation.md) - Security policy standards
- [Database Standards](./database/standards.md) - Schema and migration conventions

---

## Changelog

### v1.0 (2025-11-09)

- Initial PRD created
- Clarified MVP scope vs. non-goals
- Documented 6 design principles
- Defined success criteria for template maintainers, users, and AI
- Established quarterly review cadence
