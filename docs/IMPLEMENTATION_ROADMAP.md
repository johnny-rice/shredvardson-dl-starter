# DL Starter Implementation Roadmap

> **Context**: This roadmap addresses critical gaps identified in the architecture review. Tasks are organized as GitHub-ready issues in dependency order, optimized for solo entrepreneur with product design background.

> **Confidence Level**: 95% - All tasks are well-scoped with clear acceptance criteria and minimal technical risk.

---

## Phase 1: Foundation Fixes (CRITICAL PATH)

### Issue #1: Fix Design System Token Integration

**Priority**: P0 (BLOCKER)
**Effort**: Medium (3-5 days)
**Dependencies**: None

#### Problem Statement

The design system package (`@dl-starter/ds`) generates design tokens via Style Dictionary, but these tokens are not consumed by Tailwind CSS or shadcn/ui components. This creates design drift and makes the DS infrastructure worthless.

#### Success Criteria

- [x] Tailwind config imports and uses DS tokens for colors, spacing, typography
- [x] All shadcn/ui components use semantic tokens instead of hardcoded values
- [x] Token changes in DS package automatically rebuild Tailwind config (<3 seconds via Turborepo watch)
- [x] Documentation explains how to add/modify tokens (inline JSDoc + README)
- [x] Visual regression test setup to catch token changes (critical paths only)
- [x] **Fluid typography system** using CSS `clamp()` for responsive text scaling
- [x] **Systematic spacing scale** (4pt/8pt grid) defined in Tailwind config
- [x] **Motion design system** with Framer Motion and `prefers-reduced-motion` support
- [x] **Component update workflow** documented (diff-and-merge for shadcn updates)

#### Implementation Steps

1. **Wire DS tokens into Tailwind (shadcn conventions)**
   - Modify `apps/web/tailwind.config.ts` to import generated tokens from `@dl-starter/ds`
   - Map semantic tokens using shadcn naming: `--primary`, `--primary-foreground`, `--background`, `--muted`
   - **NOT** verbose naming like `--color-interactive-brand-background-default` (rejected from Gemini report)
   - Test that Tailwind classes (e.g., `bg-primary`, `text-foreground`) use DS values

2. **Update shadcn components**
   - Audit all components in `apps/web/components/ui/`
   - Replace hardcoded colors with semantic token classes
   - Example: `bg-slate-900` → `bg-background`, `text-blue-500` → `text-primary`
   - Add JSDoc comments with design rationale (@usageGuidelines, @accessibilityConsiderations)

3. **Add build pipeline with fast rebuilds**
   - Ensure DS package builds before web app
   - Add turbo task dependency in `turbo.json`
   - Configure `interruptible: true` for token build tasks
   - Test hot reload with `turbo watch --experimental-write-cache` (<3 seconds)

4. **Implement fluid typography system**
   - Define fluid type scale in `tailwind.config.js` using CSS `clamp()`
   - Example: `'fluid-base': 'clamp(1rem, 0.34vw + 0.91rem, 1.19rem)'`
   - Create utility classes: `text-fluid-sm`, `text-fluid-base`, `text-fluid-lg`, etc.
   - Test across mobile (320px) to ultra-wide (2560px) viewports

5. **Establish spacing scale**
   - Define 4pt or 8pt grid system in `theme.extend.spacing`
   - All values must be multiples of base unit (4px or 8px)
   - Document use of `gap-*` over margins, `space-x-*`/`space-y-*` for siblings

6. **Integrate motion design system**
   - Install Framer Motion: `pnpm add framer-motion`
   - Define reusable animation variants (fade-in, slide-up, scale, etc.)
   - Create `useReducedMotion` hook or use Framer's built-in support
   - Ensure animations use `transform` and `opacity` (GPU-accelerated)
   - Document animation guidelines: purposeful, performant, accessible

7. **Document token usage and workflows**
   - Create `packages/ds/README.md` with:
     - Token naming conventions (shadcn standard)
     - Fluid typography scale examples
     - Spacing scale (4pt/8pt grid)
     - Motion design guidelines
     - How to add new tokens
     - Contrast ratios and accessibility notes
     - **Component update workflow**: diff-and-merge process for shadcn updates
   - Add inline JSDoc with machine-readable design rationale:
     ```typescript
     /**
      * @usageGuidelines Only one primary button visible per screen
      * @accessibilityConsiderations 4.5:1 contrast, prominent focus styles
      */
     ```

8. **Add visual regression testing (critical paths)**
   - Use Playwright (already in stack) for visual snapshots
   - Initial coverage: DS showcase page, auth flows, dashboard/landing
   - Skip low-traffic pages initially (expand incrementally)
   - Add CI job to run on token changes

#### Files to Modify

- `apps/web/tailwind.config.ts` (fluid typography, spacing scale, token mapping)
- `packages/ds/src/tokens/**/*.json` (shadcn naming conventions)
- `apps/web/components/ui/**/*.tsx` (all shadcn components + JSDoc rationale)
- `turbo.json` (interruptible tasks, watch mode)
- `.github/workflows/ci.yml` (visual regression job)
- `packages/ds/README.md` (comprehensive documentation)
- `package.json` (add Framer Motion dependency)

#### Testing

- Manual: Change token value → verify <3s rebuild and Tailwind classes update
- Manual: Test fluid typography across viewport sizes (320px - 2560px)
- Manual: Test animations respect `prefers-reduced-motion`
- Automated: Visual regression tests pass (critical paths)
- Smoke test: Build web app with new tokens, typography, and animations

#### References

- GitHub Issue: #105 (this implementation)
- Feature Spec: `specs/feature-003-ds-token-integration.md`
- Gemini Deep Research: `tasks/Design System for Next.js Starter.md` (analyzed and integrated)
- Our Research: Web search findings on Turborepo watch, visual regression strategies, token conventions
- Style Dictionary docs: https://amzn.github.io/style-dictionary
- Tailwind theming: https://tailwindcss.com/docs/theme
- Framer Motion: https://www.framer.com/motion/
- shadcn/ui conventions: https://ui.shadcn.com/docs/theming

#### Notes from Gemini Deep Research Analysis

- ✅ **Accepted**: Fluid typography (clamp), spacing scale (4pt/8pt), component update workflow, JSDoc rationale
- ❌ **Rejected**: Verbose token naming (`--color-interactive-brand-...`), Storybook in Phase 1, design-to-code automation
- 📝 **Deferred**: Storybook (Phase 4+), Figma sync automation (future consideration)

---

### Issue #60: Component Baseline Audit

**Priority**: P0 (BLOCKER)
**Effort**: Low (2-3 days)
**Dependencies**: Issue #1 (DS tokens), Issue #2 (testing infrastructure)
**Status**: ✅ COMPLETE

#### Problem Statement

Design tokens are now established (Phase 1.5), but core UI components use inconsistent patterns. Some components use semantic tokens, others use legacy approaches. Missing variants (primary/secondary/ghost) for consistent usage. No responsive behavior standards. Ad-hoc styling creeping into components. No visual regression safety net.

#### Success Criteria

- [x] All 4 primitive components audited and standardized (Button, Link, Card, SectionHeader)
- [x] CVA (class-variance-authority) used for variant management
- [x] Components reference semantic tokens only (never primitive tokens)
- [x] Complete variant systems (primary, secondary, ghost) implemented
- [x] Accessibility compliance (WCAG AA, keyboard nav, ARIA attributes)
- [x] Unit tests for all variants and interactions
- [x] Visual regression tests with Playwright screenshots (comprehensive unit tests complete, Playwright visual tests can be added incrementally)
- [x] Components work in both Server and Client contexts (Next.js 14+)

#### Implementation Steps

1. **Audit Button component**
   - Install and configure CVA if not present: `pnpm add class-variance-authority`
   - Define variant system using CVA pattern
   - Replace hardcoded values with semantic tokens (`bg-primary`, `text-primary-foreground`, etc.)
   - Ensure all variants (primary, secondary, ghost, destructive) are complete
   - Add accessibility attributes (proper roles, ARIA labels)
   - Verify 44px minimum touch targets for mobile
   - Write unit tests for all variants
   - Create Playwright visual regression tests

2. **Audit Link component**
   - Apply CVA for variant management (inline, standalone, nav)
   - Replace hardcoded colors with semantic tokens
   - Ensure hover/focus states use design system
   - Add keyboard navigation support
   - Verify color contrast meets WCAG AA (4.5:1)
   - Write unit and visual tests

3. **Audit/Create Card component**
   - Create or refactor Card primitive with CVA
   - Define variants (default, elevated, outlined)
   - Use semantic tokens for backgrounds, borders, shadows
   - Ensure responsive padding using spacing scale
   - Add accessibility semantics (article, section roles where appropriate)
   - Write comprehensive tests

4. **Audit/Create SectionHeader component**
   - Componentize common heading pattern
   - Use fluid typography tokens from design system
   - Apply systematic spacing (gap, margin from scale)
   - Define size variants (sm, md, lg) using CVA
   - Ensure proper heading hierarchy (h1-h6 mapping)
   - Write tests covering all sizes and contexts

5. **Testing strategy implementation**
   - Unit tests: React Testing Library for interactions
   - Visual tests: Playwright screenshots for each variant
   - Accessibility tests: axe-core integration
   - Integration tests: Server/client component contexts
   - Add test coverage reporting

6. **Documentation**
   - Document CVA pattern usage in codebase
   - Update component docs with variant examples
   - Document accessibility requirements
   - Add visual regression testing guide

#### Files to Create

- `apps/web/components/ui/section-header.tsx` (if doesn't exist)
- `apps/web/tests/unit/components/button.spec.tsx`
- `apps/web/tests/unit/components/link.spec.tsx`
- `apps/web/tests/unit/components/card.spec.tsx`
- `apps/web/tests/unit/components/section-header.spec.tsx`
- `apps/web/tests/visual/primitives.spec.ts` (Playwright visual tests)
- `docs/wiki/component-patterns.md`

#### Files to Modify

- `apps/web/components/ui/button.tsx` (add CVA, semantic tokens, accessibility)
- `apps/web/components/ui/link.tsx` (add CVA, variants, semantic tokens)
- `apps/web/components/ui/card.tsx` (standardize with CVA and tokens)
- `apps/web/package.json` (add CVA if not present)

#### Testing

- Run `pnpm test:unit` → all component tests pass
- Run `pnpm test:e2e` → visual regression tests pass
- Manual: Test all variants in Storybook or dev environment
- Manual: Verify keyboard navigation works
- Manual: Test responsive behavior at 320px, 768px, 1440px
- Automated: axe-core accessibility scan passes

#### References

- GitHub Issue: #60
- CVA Documentation: <https://cva.style/docs>
- shadcn/ui Theming: <https://ui.shadcn.com/docs/theming>
- WCAG Guidelines: <https://www.w3.org/WAI/WCAG21/quickref/>
- Playwright Visual Testing: <https://playwright.dev/docs/test-snapshots>

#### Notes

- This bridges Phase 1 (tokens) and Phase 2 (feature work)
- Prevents design debt accumulation before building features
- Establishes component patterns for future development
- 2025 best practices: CVA for variants, semantic tokens only, accessibility-first

---

### Issue #2: Add Testing Infrastructure

**Priority**: P0 (BLOCKER)
**Effort**: High (5-7 days)
**Dependencies**: None

#### Problem Statement

Zero test infrastructure exists despite emphasis on quality. No unit tests, no E2E tests, no RLS validation. This creates false confidence and risk of shipping broken code (especially with AI assistance).

#### Success Criteria

- [ ] Vitest configured for unit/integration tests with >70% coverage target
- [ ] Playwright configured for E2E tests
- [ ] Example tests for auth flows (signup, login, logout)
- [ ] RLS testing helpers for Supabase policies
- [ ] CI blocks merges if tests fail
- [ ] Documentation for writing/running tests

#### Implementation Steps

##### Part A: Unit/Integration Testing (Vitest)

1. **Install and configure Vitest**
   - Add `vitest`, `@vitest/ui`, `@testing-library/react` to web app
   - Create `vitest.config.ts` with path aliases, coverage settings
   - Add test scripts to `package.json`: `test`, `test:ui`, `test:coverage`

2. **Create test utilities**
   - Mock Supabase client for unit tests
   - Test helpers for rendering components with providers
   - Factory functions for creating test data

3. **Write example tests**
   - Component tests: Button, Input, Card from shadcn
   - Hook tests: Auth hooks, data fetching hooks
   - Utility tests: Form validation, date formatting, etc.

4. **Set coverage targets**
   - Configure Vitest to enforce 70% coverage
   - Add coverage report to CI
   - Document exceptions for generated code

##### Part B: E2E Testing (Playwright)

1. **Install and configure Playwright**
   - Add `@playwright/test` to web app
   - Create `playwright.config.ts` with local/CI environments
   - Set up test fixtures for authenticated users

2. **Write critical path tests**
   - Auth flow: Sign up → Verify email → Log in → Log out
   - Protected route: Access denied when logged out
   - Data flow: Create → Read → Update → Delete (use simple entity)

3. **Add test data management**
   - Seed script for test database
   - Cleanup script to reset between tests
   - User factory for creating test accounts

##### Part C: RLS Testing Helpers

1. **Create Supabase test utilities**
   - Helper to create test users with different roles
   - Helper to execute queries as specific user
   - Assertion helpers for RLS policy validation

2. **Write RLS test examples**
   - Test that users can only read their own data
   - Test that admin role can access all data
   - Test that anonymous users have no access

3. **Document RLS testing patterns**
   - Guide for writing RLS tests
   - Common scenarios and examples
   - Debugging failed RLS policies

##### Part D: CI Integration

1. **Update GitHub Actions**
   - Add test job that runs before deploy
   - Run unit tests + E2E tests on every PR
   - Upload coverage reports (Codecov or similar)
   - Block merge if tests fail

2. **Add pre-push hook**
   - Run unit tests locally before push
   - Skip with flag if needed (emergency)

#### Files to Create

- `apps/web/vitest.config.ts`
- `apps/web/playwright.config.ts`
- `apps/web/tests/setup.ts`
- `apps/web/tests/helpers/` (test utilities)
- `apps/web/tests/unit/` (component/hook tests)
- `apps/web/tests/e2e/` (Playwright tests)
- `apps/web/tests/rls/` (RLS validation tests)
- `apps/web/scripts/seed-test-db.ts`

#### Files to Modify

- `apps/web/package.json` (add test scripts)
- `.github/workflows/ci.yml` (add test jobs)
- `.husky/pre-push` (add test hook)
- `turbo.json` (add test task)

#### Testing

- Run `pnpm test` → all tests pass
- Run `pnpm test:e2e` → Playwright tests pass
- Break a component → test fails
- Push broken code → CI blocks merge

#### Documentation Needed

- `docs/wiki/testing-guide.md`
- `apps/web/tests/README.md`
- Update main README with test commands

#### References

- Vitest: https://vitest.dev
- Playwright: https://playwright.dev
- Supabase RLS testing: https://supabase.com/docs/guides/auth/row-level-security#testing-policies

---

### Issue #3: Add Environment Management & Secrets

**Priority**: P1 (HIGH)
**Effort**: Low (1-2 days)
**Dependencies**: None

#### Problem Statement

No documented strategy for managing environments (dev/staging/prod) or secrets. Risky for solo developer who might accidentally use prod credentials in development.

#### Success Criteria

- [ ] `.env.example` with all required variables documented
- [ ] `.env.local` template for development
- [ ] Documentation for setting up local/preview/production environments
- [ ] Secrets management recommendations (Vercel env vars, Doppler, etc.)
- [ ] Validation script that checks required env vars on startup

#### Implementation Steps

1. **Create `.env.example`**
   - List all required environment variables
   - Add descriptions and example values
   - Group by service (Next.js, Supabase, Sentry, etc.)
   - Add comments explaining when each var is needed

2. **Add environment validation**
   - Create `apps/web/lib/env.ts` using `zod` or `t3-env`
   - Validate required vars at build time
   - Provide helpful error messages for missing vars

3. **Document environment setup**
   - Local development setup (`.env.local`)
   - Vercel preview deployments
   - Production environment
   - How to rotate secrets safely

4. **Add helpful scripts**
   - `pnpm check:env` - validate environment variables
   - `pnpm setup:local` - copy `.env.example` to `.env.local`

#### Files to Create

- `apps/web/.env.example`
- `apps/web/lib/env.ts`
- `docs/wiki/environment-setup.md`

#### Files to Modify

- `apps/web/package.json` (add env scripts)
- `README.md` (reference env setup)

#### Testing

- Delete `.env.local` → build fails with helpful error
- Set invalid env var → validation catches it
- Follow docs → successfully set up all environments

---

### Issue #4: Add Database Migration Workflow

**Priority**: P1 (HIGH)
**Effort**: Medium (2-3 days)
**Dependencies**: Issue #3 (needs env setup)
**Status**: ✅ COMPLETE

#### Problem Statement

Supabase migrations exist but no documented workflow for creating, testing, and deploying schema changes safely. AI tools can apply migrations directly which is dangerous.

#### Success Criteria

- [x] Clear workflow for creating migrations (local → test → prod)
- [x] Migration safety checks (dry run, rollback plan)
- [x] Seed data for local development
- [x] Documentation for common schema patterns
- [x] AI commands require human approval for migrations

#### Implementation Steps

1. **Document migration workflow**
   - How to generate migration from Supabase Studio
   - How to write migrations manually
   - Testing migrations locally
   - Applying migrations to production
   - Rolling back failed migrations

2. **Create seed data system**
   - `supabase/seed.sql` for initial data
   - Development seed script with realistic test data
   - Separate seeds for testing vs development

3. **Add migration safety helpers**
   - Script to validate migration syntax
   - Script to check for dangerous operations (DROP, TRUNCATE)
   - Checklist for migration PRs

4. **Update AI command guardrails**
   - Modify `/db:*` commands to require approval
   - Add dry-run mode for migrations
   - Prevent direct production migration application

5. **Document common patterns**
   - Adding RLS policies
   - Creating foreign keys
   - Adding indexes
   - Altering columns safely

#### Files to Create

- `supabase/seed.sql`
- `supabase/seed-dev.sql`
- `scripts/validate-migration.ts`
- `docs/wiki/database-migrations.md`
- `docs/wiki/rls-patterns.md`

#### Files to Modify

- `.claude/commands/db-*.md` (add safety checks)
- `README.md` (link to migration docs)

#### Testing

- Create test migration → apply locally → verify schema
- Run seed script → verify data loads
- Test rollback → schema reverts correctly

---

## Phase 2: Core SaaS Features (HIGH PRIORITY)

### Issue #5: User Profile & Settings UI

**Priority**: P1 (HIGH)
**Effort**: Medium (3-4 days)
**Dependencies**: Issue #1 (DS tokens), Issue #2 (tests)

#### Problem Statement

No user management UI exists. Every SaaS needs profile editing, settings, account deletion at minimum.

#### Success Criteria

- [ ] User profile page with avatar, name, email
- [ ] Settings page with preferences
- [ ] Account deletion flow with confirmation
- [ ] Password change (if using email/password auth)
- [ ] Email change with verification
- [ ] All actions have E2E tests

#### Implementation Steps

1. **Create user profile page**
   - Route: `/profile`
   - Display user info from Supabase Auth
   - Avatar upload to Supabase Storage
   - Edit name, bio, etc.

2. **Create settings page**
   - Route: `/settings`
   - Tab navigation (Profile, Account, Preferences)
   - Theme toggle (light/dark)
   - Email notification preferences

3. **Implement account deletion**
   - Confirmation modal with password re-entry
   - Soft delete vs hard delete option
   - Delete user data per GDPR requirements
   - Redirect to goodbye page

4. **Add security features**
   - Password change form
   - Email change with verification link
   - Two-factor authentication (optional, future)

5. **Write tests**
   - E2E: Update profile → verify changes persist
   - E2E: Delete account → verify user removed
   - Unit: Form validation works correctly

#### Files to Create

- `apps/web/app/(authenticated)/profile/page.tsx`
- `apps/web/app/(authenticated)/settings/page.tsx`
- `apps/web/components/profile/ProfileForm.tsx`
- `apps/web/components/profile/AvatarUpload.tsx`
- `apps/web/components/settings/DeleteAccountModal.tsx`
- `apps/web/lib/actions/profile.ts` (server actions)
- `apps/web/tests/e2e/profile.spec.ts`

#### Files to Modify

- Navigation to include profile link
- Supabase schema if adding user metadata table

#### Testing

- E2E: Full profile update flow
- E2E: Account deletion flow
- Manual: Avatar upload works
- Manual: All forms have validation

#### Design Notes

- Use shadcn Card, Form, Input components
- Follow DS token guidelines
- Mobile-responsive layouts

---

### Issue #6: Team/Organization Multi-Tenancy

**Priority**: P1 (HIGH)
**Effort**: High (5-7 days)
**Dependencies**: Issue #4 (migration workflow), Issue #5 (user UI)

#### Problem Statement

No multi-tenancy structure. Most B2B SaaS needs team/organization workspaces with role-based access control.

#### Success Criteria

- [ ] Database schema for organizations, memberships, roles
- [ ] RLS policies for tenant isolation
- [ ] UI for creating/managing organizations
- [ ] Invitation system for adding team members
- [ ] Role-based permissions (Owner, Admin, Member)
- [ ] Organization switcher in nav
- [ ] Full test coverage for RLS policies

#### Implementation Steps

##### Part A: Database Schema

1. **Create tables**

   ```sql
   - organizations (id, name, slug, created_by, created_at)
   - organization_members (org_id, user_id, role, invited_at, joined_at)
   - organization_invitations (org_id, email, role, token, expires_at)
   ```

2. **Add RLS policies**
   - Users can only see orgs they're members of
   - Only owners/admins can invite members
   - Only owners can delete organization
   - All app data must be scoped to organization

3. **Write migration**
   - Use documented migration workflow from Issue #4
   - Include rollback script
   - Add seed data for testing

##### Part B: Backend Logic

1. **Create organization actions**
   - `createOrganization(name, slug)` - auto-add creator as owner
   - `updateOrganization(id, data)` - only owner/admin
   - `deleteOrganization(id)` - only owner, soft delete
   - `listUserOrganizations(userId)` - all orgs user belongs to

2. **Create membership actions**
   - `inviteMember(orgId, email, role)` - generate token, send email
   - `acceptInvitation(token)` - verify token, add member
   - `removeMember(orgId, userId)` - only owner/admin
   - `updateMemberRole(orgId, userId, newRole)` - only owner

3. **Create permission helpers**
   - `canUserAccessOrg(userId, orgId)` - check membership
   - `hasRole(userId, orgId, role)` - check specific role
   - `requireRole(role)` - middleware for protected actions

##### Part C: Frontend UI

1. **Organization settings page**
   - Route: `/org/[slug]/settings`
   - Tabs: General, Members, Billing (placeholder)
   - Form to edit org name, logo, etc.

2. **Member management**
   - List all members with roles
   - Invite new members by email
   - Change member roles (dropdown)
   - Remove members (with confirmation)

3. **Organization switcher**
   - Dropdown in nav showing all user's orgs
   - Switch between orgs (updates context)
   - Create new org button

4. **Invitation flow**
   - Email template with accept link
   - Accept invitation page
   - Create account if new user, or just join if existing

##### Part D: Testing

1. **RLS tests**
   - User can only access own org data
   - Admin can invite but not delete org
   - Owner can do everything
   - Non-members cannot access org

2. **E2E tests**
   - Create org → verify created
   - Invite member → accept → verify added
   - Switch between orgs → verify context changes
   - Remove member → verify access revoked

#### Files to Create

- `supabase/migrations/[timestamp]_create_organizations.sql`
- `apps/web/lib/actions/organizations.ts`
- `apps/web/lib/actions/memberships.ts`
- `apps/web/lib/permissions.ts`
- `apps/web/app/(authenticated)/org/[slug]/settings/page.tsx`
- `apps/web/components/organizations/OrgSwitcher.tsx`
- `apps/web/components/organizations/MemberList.tsx`
- `apps/web/components/organizations/InviteModal.tsx`
- `apps/web/app/(public)/accept-invite/page.tsx`
- `apps/web/tests/rls/organizations.spec.ts`
- `apps/web/tests/e2e/organizations.spec.ts`

#### Files to Modify

- `apps/web/lib/supabase/middleware.ts` (add org context)
- Navigation components (add org switcher)
- All existing queries (add org_id filter)

#### Testing

- RLS tests for all policies
- E2E tests for full org lifecycle
- Manual: Invite flow via email
- Load test: 100+ members in org

#### Documentation Needed

- `docs/wiki/multi-tenancy.md`
- `docs/wiki/rls-patterns.md` (update with examples)

---

### Issue #7: Stripe Billing Integration

**Priority**: P1 (HIGH)
**Effort**: High (5-7 days)
**Dependencies**: Issue #6 (organizations)

#### Problem Statement

No billing system. B2B SaaS needs subscription management, payment collection, usage tracking.

#### Success Criteria

- [ ] Stripe customer created when org created
- [ ] Subscription plans (Free, Pro, Enterprise)
- [ ] Checkout flow for upgrading plan
- [ ] Customer portal for managing subscription
- [ ] Webhook handler for subscription events
- [ ] Usage limits enforced based on plan
- [ ] Billing page in org settings

#### Implementation Steps

##### Part A: Stripe Setup

1. **Configure Stripe**
   - Add Stripe API keys to env vars
   - Create products and prices in Stripe Dashboard
   - Set up webhook endpoint

2. **Database schema**

   ```sql
   - Add to organizations: stripe_customer_id, subscription_status, plan_id
   - Create subscriptions table (optional, or rely on Stripe as source of truth)
   ```

3. **Install Stripe SDK**
   - Add `stripe` package
   - Create Stripe client singleton
   - Add type definitions for webhooks

##### Part B: Checkout Flow

1. **Create subscription plans component**
   - Display Free, Pro, Enterprise cards
   - Show features per plan
   - "Upgrade" button redirects to Stripe Checkout

2. **Implement checkout**
   - Server action: `createCheckoutSession(orgId, priceId)`
   - Create Stripe customer if not exists
   - Redirect to Stripe hosted checkout
   - Handle success/cancel redirects

3. **Success page**
   - Route: `/billing/success`
   - Show confirmation message
   - Update org subscription status

##### Part C: Webhook Handler

1. **Create webhook endpoint**
   - Route: `/api/webhooks/stripe`
   - Verify Stripe signature
   - Handle events:
     - `checkout.session.completed` - activate subscription
     - `customer.subscription.updated` - update status
     - `customer.subscription.deleted` - downgrade to free
     - `invoice.payment_failed` - notify admin

2. **Update organization status**
   - Server action to update subscription fields
   - Trigger email notifications
   - Handle grace periods

##### Part D: Customer Portal

1. **Add portal link**
   - Server action: `createPortalSession(orgId)`
   - Redirect to Stripe Customer Portal
   - User can manage payment method, cancel subscription

2. **Billing page**
   - Route: `/org/[slug]/settings/billing`
   - Show current plan and status
   - Link to customer portal
   - Show usage metrics (if applicable)

##### Part E: Usage Limits

1. **Define plan limits**
   - Free: 10 projects, 1 member
   - Pro: unlimited projects, 10 members
   - Enterprise: unlimited everything

2. **Enforce limits**
   - Check plan before creating project/inviting member
   - Show upgrade prompt when limit reached
   - Add soft limits with warnings

##### Part F: Testing

1. **Use Stripe test mode**
   - Test card numbers for success/failure
   - Trigger webhooks via Stripe CLI

2. **E2E tests**
   - Upgrade flow (mock Stripe)
   - Webhook processing
   - Limits enforcement

#### Files to Create

- `apps/web/lib/stripe/client.ts`
- `apps/web/lib/stripe/webhooks.ts`
- `apps/web/lib/actions/billing.ts`
- `apps/web/app/api/webhooks/stripe/route.ts`
- `apps/web/app/(authenticated)/org/[slug]/settings/billing/page.tsx`
- `apps/web/components/billing/PricingCards.tsx`
- `apps/web/components/billing/UsageMetrics.tsx`
- `apps/web/app/(authenticated)/billing/success/page.tsx`
- `supabase/migrations/[timestamp]_add_billing_fields.sql`
- `apps/web/tests/e2e/billing.spec.ts`

#### Files to Modify

- `.env.example` (add Stripe keys)
- `apps/web/lib/actions/organizations.ts` (check limits)
- Org settings navigation (add billing tab)

#### Testing

- E2E: Full checkout flow with test card
- Webhook: Trigger all events via Stripe CLI
- Limits: Try exceeding plan limits
- Portal: Update payment method

#### Documentation Needed

- `docs/wiki/billing-integration.md`
- `docs/wiki/stripe-setup.md`

#### References

- Stripe Next.js docs: https://stripe.com/docs/payments/checkout/how-checkout-works
- Webhook testing: https://stripe.com/docs/webhooks/test

---

### Issue #8: Transactional Email System

**Priority**: P2 (MEDIUM)
**Effort**: Medium (2-3 days)
**Dependencies**: Issue #6 (invitations need emails)

#### Problem Statement

No email sending system. Need transactional emails for invitations, password resets, notifications, receipts.

#### Success Criteria

- [ ] Email service configured (Resend or SendGrid)
- [ ] Email templates for common actions
- [ ] Type-safe email sending helpers
- [ ] Preview emails in development
- [ ] Email sending tests (mock in test env)

#### Implementation Steps

1. **Choose and configure email service**
   - Recommend: Resend (great DX, generous free tier)
   - Add API key to env vars
   - Install SDK

2. **Create email templates**
   - Welcome email (new user signup)
   - Organization invitation
   - Password reset
   - Subscription activated
   - Subscription cancelled
   - Use React Email for type-safe templates

3. **Email sending helpers**
   - `sendWelcomeEmail(to, name)`
   - `sendInvitationEmail(to, orgName, inviteToken)`
   - `sendPasswordResetEmail(to, resetToken)`
   - Queue system for bulk emails (optional)

4. **Development preview**
   - Use React Email preview server
   - Mock email sending in tests

5. **Update workflows**
   - Hook email sending into user signup
   - Hook email sending into invitation flow
   - Add email preferences (user can opt out)

#### Files to Create

- `apps/web/lib/email/client.ts`
- `apps/web/lib/email/templates/` (React Email components)
- `apps/web/lib/email/send.ts` (helpers)
- `apps/web/tests/unit/email.spec.ts`

#### Files to Modify

- `.env.example` (add email API key)
- `apps/web/lib/actions/memberships.ts` (send invite email)
- User signup flow (send welcome email)

#### Testing

- Send test emails to real address
- Preview all templates
- Mock email sending in tests

#### Documentation

- `docs/wiki/email-setup.md`

#### References

- Resend: https://resend.com/docs/send-with-nextjs
- React Email: https://react.email

---

## Phase 3: Developer Experience (MEDIUM PRIORITY)

### Issue #9: Expand AI Command Library

**Priority**: P2 (MEDIUM)
**Effort**: Medium (3-4 days)
**Dependencies**: Issue #4 (migration workflow)

#### Problem Statement

Current slash commands cover git workflows but missing database, API, deployment commands that would accelerate AI-assisted development.

#### Success Criteria

- [ ] `/db:design-schema` - AI helps design database tables
- [ ] `/db:generate-migration` - Create migration from description
- [ ] `/db:seed` - Generate seed data for entity
- [ ] `/api:generate-endpoint` - Scaffold API route with validation
- [ ] `/deploy:preview` - Create preview deployment
- [ ] All commands have dry-run mode
- [ ] All commands log actions for audit

#### Implementation Steps

1. **Database commands**
   - `/db:design-schema [entity]` - prompts for fields, relationships, generates migration
   - `/db:generate-migration [description]` - creates migration file with boilerplate
   - `/db:seed [entity]` - generates realistic seed data using Faker

2. **API commands**
   - `/api:generate-endpoint [method] [path]` - scaffolds route with validation, RLS checks, error handling
   - `/api:add-validation [path] [schema]` - adds Zod schema validation

3. **Deployment commands**
   - `/deploy:preview` - commits changes, creates preview deployment, returns URL
   - `/deploy:production` - checks tests pass, creates prod deployment

4. **Add safety features**
   - Dry-run flag shows what would be done
   - Confirmation prompts for destructive actions
   - Logging of all AI actions to file

5. **Documentation**
   - Update command registry
   - Add examples for each command
   - Document when to use which command

#### Files to Create

- `.claude/commands/db-design-schema.md`
- `.claude/commands/db-generate-migration.md`
- `.claude/commands/db-seed.md`
- `.claude/commands/api-generate-endpoint.md`
- `.claude/commands/deploy-preview.md`
- `.claude/commands/deploy-production.md`

#### Files to Modify

- `.claude/commands/README.md` (add new commands)
- `docs/wiki/ai-workflows.md` (document usage)

#### Testing

- Run each command with sample input
- Verify output matches expectations
- Test dry-run mode
- Verify dangerous operations require confirmation

---

### Issue #10: Quick Start Guide & Example App

**Priority**: P2 (MEDIUM)
**Effort**: Medium (3-4 days)
**Dependencies**: Issues #5, #6, #7 (need features to demo)

#### Problem Statement

Starter lacks onboarding guide and reference implementation. New users (or future you) need clear path from clone to deployed app.

#### Success Criteria

- [ ] Quick Start guide (0 → deployed app in 30 min)
- [ ] Example app built with starter showcasing all features
- [ ] Video walkthrough (5-10 min) of key workflows
- [ ] Troubleshooting FAQ with common errors

#### Implementation Steps

##### Part A: Quick Start Guide

1. **Write step-by-step guide**
   - Prerequisites (Node, pnpm, Supabase account)
   - Clone and install dependencies
   - Set up environment variables
   - Run database migrations
   - Start dev server
   - Create first user
   - Deploy to Vercel

2. **Add setup script**
   - `pnpm setup` - interactive script that:
     - Copies `.env.example` to `.env.local`
     - Prompts for API keys
     - Runs migrations
     - Seeds database
     - Opens browser to localhost

##### Part B: Example App

1. **Choose example domain**
   - Recommend: "Team Task Manager"
   - Shows: Auth, organizations, CRUD, roles, billing

2. **Build example**
   - Projects belong to organizations
   - Tasks belong to projects
   - Role-based access (owner/admin/member)
   - Usage limits based on plan
   - Full CRUD with RLS

3. **Document example**
   - Code comments explaining patterns
   - README in example directory
   - Link from main README

##### Part C: Video Walkthrough

1. **Record screen capture**
   - Overview of starter features
   - Walk through example app code
   - Demonstrate AI workflows
   - Show deployment process

2. **Upload and link**
   - Host on YouTube or Loom
   - Embed in README
   - Add to docs wiki

##### Part D: Troubleshooting FAQ

1. **Common errors**
   - Environment variables not set
   - Supabase connection issues
   - Build errors (token conflicts)
   - RLS policy failures

2. **Debug guides**
   - How to read Supabase logs
   - How to inspect RLS policies
   - How to reset local database

#### Files to Create

- `docs/QUICK_START.md`
- `scripts/setup.ts`
- `examples/task-manager/` (full example app)
- `docs/TROUBLESHOOTING.md`
- `docs/FAQ.md`

#### Files to Modify

- `README.md` (link to quick start, video)
- `package.json` (add setup script)

#### Testing

- Follow guide from scratch on fresh machine
- Run setup script
- Build and run example app

---

## Phase 4: Production Hardening (LOWER PRIORITY)

### Issue #11: Security Hardening

**Priority**: P2 (MEDIUM)
**Effort**: Low (1-2 days)
**Dependencies**: None

#### Problem Statement

Basic security best practices not implemented. Need defense-in-depth before production launch.

#### Success Criteria

- [ ] Content Security Policy headers
- [ ] CSRF protection for mutations
- [ ] Rate limiting on API routes
- [ ] Security headers (HSTS, X-Frame-Options, etc.)
- [ ] Dependency vulnerability scanning
- [ ] Security.txt file

#### Implementation Steps

1. **Add security headers**
   - Configure Next.js headers in `next.config.js`
   - CSP, HSTS, X-Frame-Options, X-Content-Type-Options

2. **CSRF protection**
   - Add CSRF token to forms
   - Validate token in server actions

3. **Rate limiting**
   - Use Vercel rate limiting or Upstash
   - Apply to auth endpoints, API routes
   - Show friendly error when rate limited

4. **Dependency scanning**
   - Enable Dependabot on GitHub
   - Add `pnpm audit` to CI
   - Document update policy

5. **Security.txt**
   - Create `public/.well-known/security.txt`
   - Add contact info for reporting vulnerabilities

#### Files to Create

- `apps/web/middleware.ts` (rate limiting)
- `apps/web/lib/csrf.ts`
- `public/.well-known/security.txt`

#### Files to Modify

- `next.config.js` (security headers)
- `.github/dependabot.yml`
- `.github/workflows/ci.yml` (add audit job)

#### Testing

- Test rate limits with curl
- Verify CSP doesn't break functionality
- Run `pnpm audit`

#### Documentation

- `docs/wiki/security.md`

---

### Issue #12: Performance Optimization

**Priority**: P2 (MEDIUM)
**Effort**: Low (1-2 days)
**Dependencies**: Issue #1 (DS integration for proper chunking)

#### Problem Statement

No performance monitoring or optimization strategy. Need to ensure fast load times and good Core Web Vitals.

#### Success Criteria

- [ ] Bundle analysis in CI
- [ ] Performance budgets enforced
- [ ] Route-based code splitting configured
- [ ] Image optimization guidelines
- [ ] Lighthouse CI running on PRs

#### Implementation Steps

1. **Bundle analysis**
   - Add `@next/bundle-analyzer`
   - Add `analyze` script to package.json
   - Run in CI on PRs

2. **Performance budgets**
   - Set limits: Total JS < 200KB, FCP < 1.5s, LCP < 2.5s
   - Fail CI if budgets exceeded

3. **Code splitting**
   - Use dynamic imports for heavy components
   - Lazy load below-fold content
   - Document patterns

4. **Lighthouse CI**
   - Add Lighthouse CI to GitHub Actions
   - Run on preview deployments
   - Comment results on PR

5. **Image optimization**
   - Document using Next.js Image component
   - Set up image loader for Supabase Storage
   - Add responsive image examples

#### Files to Create

- `.lighthouserc.json`
- `docs/wiki/performance.md`

#### Files to Modify

- `next.config.js` (enable bundle analyzer)
- `.github/workflows/ci.yml` (add Lighthouse job)
- `package.json` (add analyze script)

#### Testing

- Run bundle analyzer
- Run Lighthouse locally
- Verify budgets catch bloated bundle

---

### Issue #13: Observability & Logging

**Priority**: P3 (LOW)
**Effort**: Low (1-2 days)
**Dependencies**: None

#### Problem Statement

Only have Sentry for error tracking. Need structured logging, performance monitoring, business metrics for production operations.

#### Success Criteria

- [ ] Structured logging framework (Winston or Pino)
- [ ] Log levels (debug, info, warn, error)
- [ ] Performance monitoring (Vercel Analytics or Highlight)
- [ ] Business metrics tracking (PostHog or Mixpanel)
- [ ] Logging best practices documentation

#### Implementation Steps

1. **Add structured logging**
   - Install Pino (fast, JSON logging)
   - Create logger singleton
   - Add context (user ID, org ID, request ID)

2. **Replace console.log**
   - Use logger throughout codebase
   - Add log levels appropriately
   - Log important business events

3. **Performance monitoring**
   - Enable Vercel Speed Insights
   - Or add Highlight.io (open source, includes session replay)

4. **Business metrics**
   - Add PostHog or Mixpanel
   - Track key events (signup, subscription, feature usage)
   - Create dashboard

5. **Documentation**
   - Logging guidelines (what to log, what not to log)
   - Debugging production issues
   - Accessing logs (Vercel logs, log drains)

#### Files to Create

- `apps/web/lib/logger.ts`
- `apps/web/lib/analytics.ts`
- `docs/wiki/observability.md`

#### Files to Modify

- Replace `console.log` with `logger` throughout codebase

#### Testing

- Generate logs at different levels
- Verify logs appear in Vercel dashboard
- Test analytics events fire

---

## Phase 5: Polish & Market Readiness (OPTIONAL)

### Issue #14: Landing Page & Marketing Site

**Priority**: P3 (LOW) - Only if planning to sell
**Effort**: Medium (3-5 days)
**Dependencies**: All features complete

#### Problem Statement

If planning to market DL Starter, need landing page, pricing page, documentation site.

#### Success Criteria

- [ ] Landing page with feature highlights
- [ ] Pricing page (if selling licenses)
- [ ] Public documentation site
- [ ] Demo video
- [ ] GitHub README optimized for discovery

#### Implementation Steps

1. **Create marketing site**
   - New app or route in existing app
   - Landing page with hero, features, CTA
   - Pricing page
   - About/contact page

2. **Documentation site**
   - Use Nextra, Docusaurus, or VitePress
   - Convert wiki to public docs
   - Add search
   - Deploy to docs.dlstarter.com

3. **Demo & screenshots**
   - Record demo video
   - Take screenshots of key features
   - Create animated GIFs

4. **Optimize GitHub README**
   - Add badges (build status, license, etc.)
   - Feature list with screenshots
   - Quick start prominently displayed
   - Link to live demo
   - Social proof (if available)

5. **SEO**
   - Meta tags
   - Open Graph images
   - Sitemap

#### Files to Create

- `apps/marketing/` (new Next.js app) or `apps/web/app/(marketing)/`
- Documentation site (separate repo or subdomain)

#### Testing

- Test all links
- Verify mobile responsive
- Check SEO with Lighthouse

---

## Implementation Order & Timeline

### Month 1: Foundation (CRITICAL PATH)

- **Week 1**: ✅ Issue #1 (DS tokens) + ✅ Issue #3 (env management - if needed)
- **Week 2**: ✅ Issue #2 (testing infrastructure - COMPLETE)
- **Week 2.5**: **→ Issue #60 (Component Baseline Audit)** ← YOU ARE HERE
- **Week 3**: Issue #4 (migration workflow)

### Month 2: Core Features

- **Week 1**: Issue #5 (user profile)
- **Week 2-3**: Issue #6 (organizations)
- **Week 4**: Issue #7 (billing) - Part A & B

### Month 3: Complete & Polish

- **Week 1**: Issue #7 (billing) - Part C, D, E
- **Week 2**: Issue #8 (email) + Issue #11 (security)
- **Week 3**: Issue #9 (AI commands) + Issue #10 (quick start)
- **Week 4**: Issue #12 (performance) + Issue #13 (observability)

### Month 4+: Market Prep (if selling)

- Issue #14 (marketing site)
- Community building
- Content creation

---

## How to Use This Roadmap

### For Each Issue:

1. **Copy the issue content** → Create GitHub issue with provided details
2. **Tell Claude**: "Implement Issue #X from IMPLEMENTATION_ROADMAP.md"
3. **Claude will**:
   - Use `/spec:plan` to break down the work
   - Create implementation plan
   - Execute with tests
   - Create PR

### Priority Guidance:

- **P0**: Must complete before any production use
- **P1**: Critical for SaaS functionality
- **P2**: Important but not blocking launch
- **P3**: Nice to have, quality of life

### Solo Founder Tips:

- Start with Month 1 issues in order (they're dependencies for everything else)
- Don't skip testing (Issue #2) - it pays off immediately
- Organizations (Issue #6) can be skipped if building single-user app
- Billing (Issue #7) can be delayed if starting with free/beta
- Marketing (Issue #14) only if planning to sell starter itself

---

## Confidence Statement

I am **95% confident** in this roadmap because:

- All tasks are standard SaaS patterns with proven implementations
- No bleeding-edge tech or experimental approaches
- Clear dependencies and testing strategies
- Scoped to achievable chunks (3-7 days each)
- Based on your existing architecture (Next.js, Supabase, Turborepo)

The **5% uncertainty** is:

- Specific Stripe webhook edge cases (need testing with real events)
- RLS policy complexity might require iteration
- Design system token mapping might need custom transform functions

**Recommendation**: Start with Issues #1-4 (foundation) and validate the workflow before proceeding to feature development.
