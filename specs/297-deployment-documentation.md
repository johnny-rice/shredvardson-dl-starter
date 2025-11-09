---
id: 'SPEC-297'
title: 'MVP: Document deployment process and environment setup'
type: spec
priority: p1
status: draft
lane: simple
issue: 297
created: 2025-11-09
---

# MVP: Document deployment process and environment setup

## Summary

Create comprehensive deployment documentation (`DEPLOYMENT.md`) and environment variable reference (`.env.example`) to ensure smooth first deploys and prevent configuration mistakes.

## Problem Statement

Before shipping the first app, we need clear documentation for:
- How to deploy the application to production (Vercel)
- What environment variables are required and what they do
- How to set up third-party services (Supabase, Stripe, Resend, AI providers)
- First-deploy checklist to avoid common mistakes
- Troubleshooting guide for deployment issues

Without this documentation, deployments will be error-prone and time-consuming.

## Proposed Solution

Create two key documents:

1. **`DEPLOYMENT.md`** - Step-by-step deployment guide covering:
   - Prerequisites (accounts, CLI tools)
   - Vercel deployment via GitHub integration
   - Environment variable configuration
   - Database setup (Supabase migrations, RLS)
   - Third-party service setup (Stripe, Resend, AI providers, i18n)
   - First-deploy checklist
   - Post-deploy verification steps
   - Troubleshooting common issues

2. **`.env.example`** - Comprehensive environment variable reference with:
   - All required variables grouped by service
   - Description for each variable
   - Example values (non-sensitive)
   - Links to setup instructions

3. **Update existing docs** - Ensure consistency with:
   - README.md (link to DEPLOYMENT.md)
   - CONTRIBUTING.md (reference for local development setup)

## Acceptance Criteria

- [ ] `DEPLOYMENT.md` created in repository root with:
  - [ ] Prerequisites section (Node.js, pnpm, Vercel CLI, required accounts)
  - [ ] Step-by-step Vercel deployment guide with GitHub integration
  - [ ] Environment variable configuration section
  - [ ] Supabase setup guide (project creation, migrations, connection string)
  - [ ] Stripe setup guide (API keys, webhook configuration)
  - [ ] Email service setup (Resend API key, domain verification)
  - [ ] AI provider setup (Anthropic/OpenAI API keys)
  - [ ] i18n configuration (locale setup, content paths)
  - [ ] First-deploy checklist (pre-deploy verification steps)
  - [ ] Post-deploy verification (smoke tests, health checks)
  - [ ] Troubleshooting section (common errors and solutions)

- [ ] `.env.example` created in repository root with:
  - [ ] All environment variables from all services
  - [ ] Variables grouped by service (Database, Authentication, Payments, Email, AI, i18n)
  - [ ] Description comment for each variable
  - [ ] Example non-sensitive values
  - [ ] Links to detailed setup instructions in DEPLOYMENT.md

- [ ] Documentation quality checks:
  - [ ] Step numbering is clear and sequential
  - [ ] All links work (no broken references)
  - [ ] Code blocks have proper language tags
  - [ ] Screenshots/diagrams included for complex UI steps (optional)
  - [ ] Consistent formatting (follows existing doc style)

- [ ] Integration with existing docs:
  - [ ] README.md links to DEPLOYMENT.md in "Deployment" section
  - [ ] CONTRIBUTING.md references .env.example for local setup
  - [ ] Related MVP issues (#292-296) link to deployment guide

## Technical Constraints

**Services to Document:**
- Vercel - Hosting platform with GitHub integration
- Supabase - Database, auth, storage (migrations, RLS policies, connection strings)
- Stripe - Payment processing (API keys, webhook secrets, test vs live mode)
- Resend - Email service (API key, domain verification, sender addresses)
- Anthropic/OpenAI - AI providers (API keys, model selection, rate limits)
- i18n - Internationalization (supported locales, content paths)

**Environment Variable Categories:**
```bash
# Database (Supabase)
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication (Supabase Auth)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# AI Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=
NEXT_PUBLIC_SUPPORTED_LOCALES=

# Monitoring (optional)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Documentation Standards:**
- Follow existing markdown style (H1 for title, H2 for sections)
- Use checkbox lists for multi-step procedures
- Include code blocks with proper language tags (```bash, ```typescript, etc.)
- Add warning/info callouts for important notes (> ⚠️ or > 💡)
- Keep line length reasonable (<120 chars when possible)

**Related Issues:**
- #292 - Auth module (requires Supabase setup)
- #293 - Stripe integration (requires API keys)
- #294 - AI provider setup (requires Anthropic/OpenAI keys)
- #295 - Email service (requires Resend setup)
- #296 - i18n setup (requires locale configuration)

## Success Metrics

- **Completeness**: 100% of required environment variables documented
- **Clarity**: New team member can deploy from scratch in <1 hour following guide
- **Accuracy**: Zero deployment failures due to missing/incorrect environment variables
- **Maintenance**: Documentation stays up-to-date with new services/features

## Out of Scope

- **CI/CD pipeline automation** - Manual deployment only (future: GitHub Actions workflows)
- **Preview deployments for PRs** - Production deployment only (Issue #249)
- **Staging environment setup** - Production only (future: multi-environment strategy)
- **Database backup/restore procedures** - Initial deployment only (future: disaster recovery)
- **Monitoring and alerting setup** - Basic deployment only (future: Sentry, LogRocket)
- **Load testing and performance optimization** - Functional deployment only
- **Custom domain setup** - Vercel default domain only (future: custom domains)
- **SSL certificate management** - Vercel automatic SSL only

## References

### Documentation Structure Pattern

Follow existing documentation style from:
- [README.md](../README.md) - Project overview and quick start
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development setup guide
- [docs/testing/TESTING_GUIDE.md](../docs/testing/TESTING_GUIDE.md) - Comprehensive guide example

### Environment Variable Examples

Reference existing environment configuration:
- [.gitignore](../.gitignore) - Protected environment files
- [packages/web/next.config.ts](../packages/web/next.config.ts) - Next.js environment handling
- [docs/constitution.md](../docs/constitution.md) - Environment validation requirements

### Related Issues

- Issue #297 - This specification
- Issue #292 - MVP: Build authentication module (Supabase auth setup)
- Issue #293 - MVP: Integrate Stripe for payments (Stripe API keys)
- Issue #294 - MVP: Integrate AI provider (Anthropic/OpenAI keys)
- Issue #295 - MVP: Setup email service (Resend configuration)
- Issue #296 - MVP: Setup i18n for multi-language (Locale configuration)
- Issue #249 - Configure preview deployments (Future: PR previews)

### External Documentation

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Stripe Keys and Environments](https://stripe.com/docs/keys)
- [Resend Quick Start](https://resend.com/docs/send-with-nextjs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)