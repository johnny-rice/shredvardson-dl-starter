---
id: 'SPEC-249'
title: Configure preview deployments (Vercel)
type: spec
priority: p1
status: draft
lane: simple
issue: 249
created: 2025-11-09
---

# Configure preview deployments (Vercel)

## Summary

Configure Vercel for automatic preview deployments on pull requests, enabling teams to test AI-generated UI changes in a live environment before merging to production.

## Problem Statement

Currently, PRs cannot be tested in a live environment before merging, making it difficult to:
- Test AI-generated UI changes in realistic conditions
- Share work-in-progress with stakeholders for feedback
- Catch environment-specific bugs before production
- Verify visual/UX changes without local setup

Without preview deployments, teams must either:
- Merge untested code and hope it works in production
- Set up complex local environments to simulate production
- Manually deploy to staging for every PR review

## Proposed Solution

Connect the GitHub repository to Vercel with automatic preview deployment configuration:

1. **Vercel Project Setup**
   - Create Vercel project linked to GitHub repository
   - Configure build settings (Next.js framework auto-detected)
   - Set up production branch (main) and preview branches (all others)

2. **GitHub Integration**
   - Install Vercel GitHub app
   - Grant repository access permissions
   - Configure deployment trigger rules (all PRs, all branches)

3. **Environment Variables**
   - Configure preview environment variables (non-production)
   - Set up production environment variables (protected)
   - Document which variables are safe for preview vs production only

4. **Deployment Comments**
   - Enable automatic PR comments with preview URLs
   - Configure deployment status checks
   - Set up deployment notifications

5. **Access Control**
   - Add team members to Vercel project
   - Configure preview deployment protection (optional: password protect)
   - Set up usage limits and monitoring

## Acceptance Criteria

- [ ] Vercel project created and connected to GitHub repository
- [ ] Vercel GitHub app installed with correct permissions
- [ ] Production deployment configured:
  - [ ] Deploys automatically on push to `main` branch
  - [ ] Uses production environment variables
  - [ ] Custom domain configured (if applicable)
- [ ] Preview deployments configured:
  - [ ] Automatically deploy on every PR (open, sync, reopened)
  - [ ] Each PR gets unique preview URL
  - [ ] Preview uses separate environment variables (non-production)
- [ ] GitHub integration working:
  - [ ] Vercel bot posts preview URLs in PR comments
  - [ ] Deployment status checks appear on PRs
  - [ ] Failed deployments block PR merge (optional)
- [ ] Environment variables configured:
  - [ ] Production variables set in Vercel dashboard
  - [ ] Preview variables set (safe test/dev values)
  - [ ] Sensitive variables properly protected
- [ ] Team access configured:
  - [ ] All team members added to Vercel project
  - [ ] Roles assigned (Admin, Member, Viewer)
  - [ ] Preview deployment access works for all team members
- [ ] Documentation updated:
  - [ ] DEPLOYMENT.md includes Vercel setup instructions
  - [ ] README.md links to preview deployment docs
  - [ ] Environment variables documented in .env.example

## Technical Constraints

**Vercel Configuration:**
- Framework: Next.js (auto-detected)
- Build command: `pnpm build` (or `pnpm turbo run build`)
- Output directory: `.next` (Next.js default)
- Install command: `pnpm install`
- Root directory: `/` or `/apps/web` (depending on monorepo structure)

**Environment Variables:**
```bash
# Preview Environment (non-production)
NEXT_PUBLIC_SUPABASE_URL=<preview-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-anon-key>
STRIPE_SECRET_KEY=<test-mode-stripe-key>
STRIPE_PUBLISHABLE_KEY=<test-mode-publishable-key>
RESEND_API_KEY=<test-resend-key>
ANTHROPIC_API_KEY=<dev-anthropic-key>

# Production Environment (protected)
NEXT_PUBLIC_SUPABASE_URL=<prod-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
STRIPE_SECRET_KEY=<live-mode-stripe-key>
STRIPE_PUBLISHABLE_KEY=<live-mode-publishable-key>
RESEND_API_KEY=<prod-resend-key>
ANTHROPIC_API_KEY=<prod-anthropic-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-key> # Production only!
```

**Deployment Triggers:**
- Production: Push to `main` branch
- Preview: PR open, PR synchronize, PR reopened
- No deployment: Draft PRs (optional configuration)

**Build Settings:**
- Node version: 20.x (or from `.nvmrc`)
- Package manager: pnpm
- Monorepo support: Enabled (Turborepo detected)
- Build timeout: 300 seconds (5 minutes)

**Access Control:**
- Team members need Vercel account
- Repository must have Vercel app installed
- Preview URLs are publicly accessible (unless password protected)

**Cost Considerations:**
- Vercel free tier: 100GB bandwidth, 6000 minutes build time
- Each preview deployment counts toward build minutes
- Consider limiting preview deployments to main project branches only

## Success Metrics

- **Deployment Success Rate**: >95% of PRs deploy successfully on first try
- **Team Adoption**: 100% of PRs reviewed via preview deployment
- **Feedback Speed**: Stakeholder feedback within 24 hours of PR creation
- **Bug Detection**: >50% of environment-specific bugs caught in preview (vs production)
- **Developer Experience**: <5 minutes from PR open to preview URL available

## Out of Scope

- **Custom domains for preview deployments** - Use Vercel-generated URLs only
- **Preview deployment analytics** - Basic deployment only (future: Vercel Analytics)
- **A/B testing on previews** - Single preview per PR only
- **Preview deployment caching strategies** - Use Vercel defaults
- **Automated E2E testing on previews** - Manual testing only (future: Playwright on preview)
- **Preview deployment retention policy** - Use Vercel defaults (90 days)
- **Multi-region preview deployments** - Single region only (Vercel default)
- **Preview deployment monitoring** - Basic status only (future: uptime monitoring)

## References

### Related Configuration

- [.github/workflows/](../.github/workflows/) - Existing CI/CD workflows
- [vercel.json](../vercel.json) - Vercel configuration file (if exists)
- [.env.example](../.env.example) - Environment variable reference (Issue #297)
- [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) - Deployment guide (Issue #297)

### External Documentation

- [Vercel Deployments Documentation](https://vercel.com/docs/deployments/overview)
- [Vercel Git Integration](https://vercel.com/docs/deployments/git)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo)

### Related Issues

- Issue #249 - This specification
- Issue #297 - MVP: Document deployment process (includes Vercel setup)
- Related: #292-296 - MVP features requiring preview testing

### Vercel Best Practices

- [Production Checklist](https://vercel.com/docs/deployments/production-checklist)
- [Security Best Practices](https://vercel.com/docs/security/deployment-protection)
- [Performance Optimization](https://vercel.com/docs/concepts/edge-network/overview)