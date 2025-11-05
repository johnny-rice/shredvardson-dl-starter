# DL Starter Development Roadmap

> **Focus:** Ship revenue-generating apps, not perfect infrastructure.

**Project:** dl-starter-new
**Last Updated:** 2025-11-05
**Current Phase:** MVP-Ready Push

## Vision

Build a **production-ready starter** that enables rapid development of monetizable SaaS apps. The starter should have just enough infrastructure to ship quality apps fast, without over-engineering.

**Guiding Principle:** If it doesn't directly enable shipping the guitar exercise app, defer it.

---

## Current Focus: MVP-Ready Starter

**Goal:** Complete the 6 core features needed to ship any SaaS app.

**Timeline:** 2 weeks of focused work
**Target:** Start building guitar app by Nov 20, 2025

### Core MVP Features (Priority Order)

#### 1. Authentication Module ([#292](https://github.com/Shredvardson/dl-starter/issues/292))

**Status:** 🟡 Not Started
**Effort:** 2 days
**Owner:** Jonte + Claude

**Scope:**

- Sign up, sign in, password reset flows
- Protected routes with middleware
- User profile page
- Session management

**Why First:** Every app needs auth. No way around it.

---

#### 2. Stripe Integration ([#293](https://github.com/Shredvardson/dl-starter/issues/293))

**Status:** 🟡 Not Started
**Effort:** 1-2 days
**Owner:** Jonte + Claude

**Scope:**

- Subscription billing (recurring)
- One-time payments (products)
- Webhook handling
- Customer portal

**Why Next:** Can't make money without payments.

---

#### 3. AI Integration ([#294](https://github.com/Shredvardson/dl-starter/issues/294))

**Status:** 🟡 Not Started
**Effort:** 1 day
**Owner:** Jonte + Claude

**Scope:**

- Vercel AI SDK setup
- Chat API route (streaming)
- Generate API route (completion)
- Example UI component
- OpenAI + Anthropic support

**Why Next:** Guitar app needs AI (exercise generation, feedback).

---

#### 4. Email Service ([#295](https://github.com/Shredvardson/dl-starter/issues/295))

**Status:** 🟡 Not Started
**Effort:** 1 day
**Owner:** Jonte + Claude

**Scope:**

- Resend integration
- Welcome email template
- Password reset template
- Subscription confirmation template

**Why Next:** Can't onboard users without emails.

---

#### 5. Internationalization ([#296](https://github.com/Shredvardson/dl-starter/issues/296))

**Status:** 🟡 Not Started
**Effort:** Half day
**Owner:** Jonte + Claude

**Scope:**

- next-intl setup
- English + Swedish translations
- Language switcher component
- TypeScript autocomplete for keys

**Why Now:** Adding i18n later is painful. Do it once, right.

---

#### 6. Deployment Documentation ([#297](https://github.com/Shredvardson/dl-starter/issues/297))

**Status:** 🟡 Not Started
**Effort:** Half day
**Owner:** Jonte + Claude

**Scope:**

- `DEPLOYMENT.md` guide
- `.env.example` with all variables
- Vercel deployment checklist
- Environment setup docs

**Why Last:** Documents everything else. Do after features are done.

---

## What We Already Have ✅

### Infrastructure (Complete)

- ✅ Turborepo monorepo structure
- ✅ Shared ESLint, Prettier, Tailwind, TypeScript configs
- ✅ Environment validation (@t3-oss/env-nextjs)
- ✅ Supabase integration
- ✅ Package structure (ai, db, config, types, ui)

### DX & Quality (Complete)

- ✅ CI/CD GitHub Actions
- ✅ Linting and formatting
- ✅ Testing scaffold (Vitest)
- ✅ `/quality`, `/review`, `/docs` commands
- ✅ Git workflow automation
- ✅ Pre-commit hooks

### UI/Design System (Complete)

- ✅ Tailwind CSS
- ✅ CVA (class-variance-authority)
- ✅ `@ui/components` package with Tremor
- ✅ Dark mode (next-themes)
- ✅ Animations (framer-motion)
- ✅ Responsive layouts

**Bottom Line:** The infrastructure is done. We just need the user-facing features.

---

## Post-MVP Enhancements

**Milestone:** [Post-MVP Enhancements](https://github.com/Shredvardson/dl-starter/milestone/1)
**When:** After first app is shipped and generating revenue

### Nice-to-Have Features (Deferred)

- Analytics module (PostHog/Plausible) - Add when you have users to track
- Advanced security hardening - Add when you have security incidents
- Preview deployments - Add when you have a team
- Secret scanning - Add when deploying to production
- Dependency vulnerability scanning - Add when deploying to production
- Commit message linting - Add when team grows
- UI test suite (#200) - Add when refactoring frequently
- Kibo UI evaluation (#241) - Add when current components insufficient
- Context7 external library audit (#208) - Add when library choices matter
- Interactive script confirmations (#282) - Add when scripts cause issues
- Onboarding guide (#197) - Add after dogfooding the starter

### When to Do These

Only add post-MVP features when:

1. First app is live and making money
2. The feature solves a real pain point you experienced
3. You have time because core product is stable

Don't add features "just in case."

---

## Completed Phases (Historical)

### ✅ Phase 1-3: Skills Architecture

**Completed:** 2025-01-21

**What We Built:**

- Skills architecture (`/test`, `/db`, `/spec`, `/git`, `/review`, `/docs`)
- Token measurement tools
- Progressive disclosure model
- 65-77% token savings

**Value:** These are good. They work. We're keeping them.

**Deliverables:**

- [Phase 1 Spec](docs/specs/phase-1-skills-architecture-foundation.md)
- [Phase 2 Plan](docs/plans/phase-2-core-workflow-implementation.md)
- [Phase 3 Spec](docs/specs/phase-3-git-workflow-consolidation.md)
- [Skills Architecture Guide](docs/skills-architecture.md)

### ✅ Phase 4A-4B: Skills Observability & Learning

**Completed:** 2025-10-22

**What We Built:**

- Usage logging and analytics (`/skills stats`)
- Enhanced learning capture (`/ops:learning-capture`)
- Learn search command (`/learn`)
- 74-lesson knowledge base

**Value:** Lightweight tracking. Knowledge retention. Keep it.

**Deliverables:**

- [Phase 4A Spec](docs/specs/phase-4a-skills-observability.md)
- [Phase 4B Spec](docs/specs/phase-4b-learning-capture-enhancement.md)
- `scripts/tools/analyze-skill-usage.ts`
- `.claude/commands/ops/learning-capture.md` (v2.0)
- `.claude/commands/ops/learn-search.md`

### ❌ Phase 3 (Sub-Agent Testing): CANCELLED

**Status:** Closed (over-engineered for MVP needs)
**Date:** 2025-11-05

**What We Were Building:**

- Token usage tracking infrastructure
- Simulation testing frameworks
- Failure monitoring dashboards
- Performance optimization testing

**Why Cancelled:**

- Too complex for solo founder building MVPs
- Premature optimization
- Delays shipping real products
- The powerful sub-agent features are already available in Claude Code
- We were measuring/optimizing, not enabling

**What We're Keeping:**

- PR #288: Failure handling patterns documentation (good reference)
- Basic test infrastructure (useful for unit tests)

**What We're Dropping:**

- Monitoring dashboards
- Token optimization work
- Performance testing
- Real-world sub-agent testing

**Related Issues Closed:** #290, #291, #287, #286, #285, #283, #279, #267, #264, #203, #142

---

## Decision Log

### 2025-11-05: MVP Reset

**Decision:** Shift from infrastructure optimization to shipping apps.

**Rationale:**

- 2+ months on starter, need income
- Infrastructure is good enough
- Missing user-facing features (auth, payments, AI)
- Falling into perfectionist trap
- Over-consuming "best practices" content instead of shipping

**Impact:**

- Closed 11 optimization issues
- Deferred 12 nice-to-have issues to Post-MVP milestone
- Created 6 focused MVP issues (#292-#297)
- New timeline: 2 weeks to first app

**Approval:** Jonte (founder/designer)

---

## Success Criteria

### MVP-Ready Starter

- [ ] Authentication works (sign up, sign in, reset)
- [ ] Stripe integration works (subscription + one-time)
- [ ] AI integration works (chat + generation)
- [ ] Email sending works (3 templates)
- [ ] i18n works (EN + SV)
- [ ] Deployment documented
- [ ] Can clone repo and start guitar app in <1 day

### First App Shipped

- [ ] Guitar exercise app deployed to production
- [ ] At least 10 real users signed up
- [ ] At least $100 MRR (monthly recurring revenue)
- [ ] <5 bugs reported per week
- [ ] Personal validation that starter works in real-world use

---

## Timeline

**Week 1 (Nov 5-12):**

- Day 1-2: Authentication module (#292)
- Day 3-4: Stripe integration (#293)
- Day 5: AI integration (#294)

**Week 2 (Nov 13-19):**

- Day 1: Email service (#295)
- Day 2: i18n setup (#296)
- Day 3: Deployment docs (#297) + integration testing
- Day 4-5: Bug fixes, polish, final testing

**Week 3+ (Nov 20+):**

- Start building guitar exercise app
- Fix starter issues as discovered ("dogfooding")
- Ship first MVP
- Iterate based on real usage

---

## Notes

**For Future Jonte:**

When you're tempted to add a feature to the starter, ask:

1. Does the guitar app need this RIGHT NOW?
2. Have I shipped the first app yet?
3. Am I avoiding building features by "perfecting" infrastructure?

If answers are No, No, Yes → Don't add the feature.

**Remember:** Starter templates are never "done." Ship apps, make money, then improve the starter based on real needs you encounter.

The best way to validate a starter is to use it for real projects.

---

## References

### Documentation

- [SKILLS.md](SKILLS.md) - Skills architecture overview
- [docs/specs/](docs/specs/) - Feature specifications
- [docs/plans/](docs/plans/) - Implementation plans
- [docs/validation/](docs/validation/) - Validation reports
- [docs/adr/](docs/adr/) - Architecture decision records
- [docs/testing/](docs/testing/) - Testing guides and best practices

### Tools

- [Token Measurement](scripts/tools/measure-tokens.ts) - Validate token usage
- [Command Indexer](scripts/learn/index-commands.ts) - Index slash commands
- [Doctor](scripts/doctor/) - System health checks
- [Skill Usage Analytics](scripts/tools/analyze-skill-usage.ts) - Usage tracking

### Key Issues

- MVP Issues: #292, #293, #294, #295, #296, #297
- [Post-MVP Milestone](https://github.com/Shredvardson/dl-starter/milestone/1) - Nice-to-have features

---

**Last Updated:** 2025-11-05
**Next Review:** After first app ships (target: end of Nov 2025)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
