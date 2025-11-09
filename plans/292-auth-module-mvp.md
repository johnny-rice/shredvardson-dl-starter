---
id: PLAN-292
type: plan
issue: 292
parentId: SPEC-292
title: MVP Authentication Module - Implementation Plan
lane: mvp-features
created: 2025-11-06
status: ready
---

# MVP Authentication Module - Implementation Plan

## Overview

Implement a complete, production-ready authentication system using Supabase Auth and Next.js 15 Server Components. This is the foundational auth module for the DL Starter template - simple, battle-tested, and ready to clone for real apps (guitar app, parenting app, sales app).

**Approach**: Follow Supabase's official Next.js 15 SSR pattern (2025 best practices) with minimal abstractions. Keep it simple, secure, and well-documented.

---

## Planning Context

### Research Completed ✅

**Phase 1: Understanding** - Socratic questions answered:
1. **Auth package structure** → Keep in `apps/web/src/lib/auth/` (no shared package)
2. **Password validation** → Hybrid: Supabase server + Zod client mirror
3. **Email flow** → Use Supabase defaults, customize in #295
4. **Post-login redirect** → `?redirectTo` param with `/` fallback
5. **Profile page** → Skip (context-dependent, build per-app)
6. **Offline support** → Not in starter (add for sales app later)
7. **Supabase project** → Local development only (no cloud project needed)

**Research Agents Used**:
- Research Agent: Verified existing form infrastructure (React Hook Form + Zod)
- Security Scanner: Identified critical gaps (no auth, RLS, route protection)
- Context7: Latest Supabase SSR docs (Next.js 15 patterns)
- WebSearch: 2025 monorepo auth best practices

**Confidence Level**: **95%** (High)
- Official Supabase pattern (battle-tested)
- Verified against 3 real app use cases
- Local Supabase already running
- Clear scope (no profile page, no abstractions)

---

## Architecture Decision

### Selected Approach: "The Official Pattern" (Approach A)

**Philosophy**: Follow Supabase's official Next.js 15 guide exactly. No premature abstractions.

**Key Characteristics**:
- ✅ **3 Supabase clients**: Browser, Server, Middleware (official pattern)
- ✅ **Server Actions** for all auth mutations (`signUp`, `signIn`, etc.)
- ✅ **Middleware** handles session refresh automatically
- ✅ **Route groups**: `(auth)` for public, `(protected)` for authenticated
- ✅ **`getUser()` over `getSession()`** for security (validates token server-side)

**Why This Approach**:
1. **Battle-tested** - Supabase's official recommendation for Next.js 15
2. **Well-documented** - Official docs + examples
3. **Handles edge cases** - Token refresh, cookie chunking, SSR quirks
4. **Simple mental model** - Clone starter → change table names → done
5. **Future-proof** - Works for all 3 planned apps (guitar, parenting, sales)

**Why NOT React Query (Approach B)**:
- Apps are server-heavy workflows (AI processing, image generation, CSV parsing)
- No need for complex client-side caching/invalidation
- Extra 15kb + complexity for unused features

**Why NOT Just Helpers (Approach C)**:
- Approach C is an addition to A, not a replacement
- Will extract helpers naturally as patterns emerge during implementation

---

## Design Decisions

### Decision 1: File Structure

**Chosen**: Official Supabase SSR pattern
```
apps/web/
├── src/
│   ├── lib/
│   │   ├── supabase/              # 3 client variants
│   │   │   ├── client.ts          # Browser (Client Components)
│   │   │   ├── server.ts          # Server (Server Components/Actions)
│   │   │   └── middleware.ts      # Middleware (session refresh)
│   │   └── auth/
│   │       ├── validation.ts      # Zod schemas
│   │       └── actions.ts         # Server Actions
│   ├── app/
│   │   ├── (auth)/                # Public pages
│   │   │   ├── sign-up/
│   │   │   ├── sign-in/
│   │   │   ├── reset-password/
│   │   │   └── update-password/
│   │   └── (protected)/           # Auth-required pages
│   │       └── layout.tsx
│   └── middleware.ts              # Session refresh
└── .env.local                     # Already configured ✅
```

**Rationale**:
- Matches official Supabase docs (easy for developers to understand)
- Route groups make auth boundaries explicit
- 3 clients necessary for Next.js 15 SSR (can't be simplified)

**Confidence**: 98%

---

### Decision 2: Password Validation

**Chosen**: Hybrid (Supabase server + Zod client)

**Server (Supabase Dashboard)**:
- Minimum 8 characters
- Require uppercase, lowercase, digits, symbols
- Optional: Leaked password protection (Pro Plan)

**Client (Zod schema)**:
```typescript
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain symbol')
```

**Why Hybrid**:
- ✅ **Fast UX**: Client validation gives instant feedback (no network round-trip)
- ✅ **Secure**: Supabase enforces rules server-side (source of truth)
- ✅ **DX**: Users see example rules, update both to match their config

**Trade-offs**:
- ⚠️ **Manual sync required**: If Supabase rules change, must update Zod
- ✅ **Acceptable**: Security still works if out of sync (just worse UX)

**Documentation Note**: Add to GETTING_STARTED.md (#197):
> **Important**: Keep Zod validation in sync with Supabase rules for best UX. If they drift, Supabase will still enforce rules (security is fine), but users will see validation errors after submitting instead of immediately.

**Confidence**: 95%

---

### Decision 3: Email Delivery

**Chosen**: Use Supabase default email templates (defer customization to #295)

**Why**:
- ✅ **Works out of the box**: Zero setup required
- ✅ **Separation of concerns**: Email branding is separate project (#295)
- ✅ **Test locally**: Inbucket shows emails at http://localhost:54324

**Trade-offs**:
- ⚠️ **Generic branding**: Emails say "Supabase" in footer (acceptable for MVP)
- ✅ **Easy to upgrade**: Issue #295 will customize all emails at once

**Confidence**: 100%

---

### Decision 4: Post-Login Redirect

**Chosen**: `?redirectTo` param with `/` fallback

**Pattern**:
```typescript
// Middleware redirects to sign-in with context
redirect(`/sign-in?redirectTo=${encodeURIComponent(request.nextUrl.pathname)}`)

// Server Action uses param or fallback
const redirectTo = formData.get('redirectTo') as string || '/'
redirect(redirectTo)
```

**Why**:
- ✅ **Best UX**: User tries `/settings` → signs in → lands on `/settings`
- ✅ **No extra pages**: Don't need `/dashboard` for MVP
- ✅ **Future-proof**: Change fallback to `/dashboard` when ready

**Security Note**: Validate `redirectTo` is internal path (prevent open redirect):
```typescript
const redirectTo = formData.get('redirectTo') as string || '/'
const isInternal = redirectTo.startsWith('/')
redirect(isInternal ? redirectTo : '/')
```

**Confidence**: 98%

---

### Decision 5: Protected Routes

**Chosen**: Route group layout with `getUser()` check

**Pattern**:
```typescript
// apps/web/src/app/(protected)/layout.tsx
export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser() // NOT getSession()!

  if (!user) redirect('/sign-in')

  return <>{children}</>
}
```

**Why `getUser()` not `getSession()`**:
- ✅ **More secure**: Validates token with Supabase servers every time
- ❌ **`getSession()`** only checks local storage (can be stale/forged)

**Trade-offs**:
- ⚠️ **Extra network call**: Adds ~50-100ms per protected page load
- ✅ **Worth it**: Security > speed for auth checks

**Confidence**: 100% (Official Supabase recommendation)

---

### Decision 6: No Profile Page

**Chosen**: Skip profile page entirely

**Why**:
- ✅ **Context-dependent**: Guitar app needs different fields than parenting app
- ✅ **No real users**: Starter template isn't a production app
- ✅ **Per-app decision**: Each clone will implement profile/settings based on needs

**Updated Scope**:
- ~~User can update profile information~~ ❌ Removed
- ✅ User can sign up with email/password
- ✅ User can sign in with existing account
- ✅ User can request password reset via email
- ✅ Protected routes redirect to sign in
- ✅ Session persists across page reloads

**Confidence**: 100%

---

### Decision 7: Local Supabase Development

**Chosen**: Local Supabase only (no cloud project)

**Setup**:
- ✅ **Supabase CLI installed**: v2.30.4 (update recommended but not blocking)
- ✅ **Local stack running**: http://127.0.0.1:54321
- ✅ **Environment configured**: `.env.local` updated with local keys
- ✅ **Inbucket for emails**: http://127.0.0.1:54324

**Why Local**:
- ✅ **Free**: No cloud resources needed
- ✅ **Fast**: Local, no network latency
- ✅ **Isolated**: Won't affect real apps
- ✅ **Resettable**: `supabase db reset` anytime

**When Cloning for Real Apps**:
1. Create new Supabase cloud project (e.g., `guitar-app-production`)
2. Update `.env.local` with new keys
3. Configure password rules in Supabase dashboard
4. Update Zod schema to match

**Confidence**: 100%

---

## Implementation Phases

### Phase 1: Foundation (Supabase Clients)

**Goal**: Set up 3 Supabase client variants for Next.js 15 SSR

**Tasks**:

1. **Install dependencies** (if missing)
   ```bash
   pnpm add @supabase/ssr @supabase/supabase-js
   ```

2. **Create browser client** - `apps/web/src/lib/supabase/client.ts`
   - Uses `createBrowserClient` from `@supabase/ssr`
   - Reads env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Export: `createClient()` function

3. **Create server client** - `apps/web/src/lib/supabase/server.ts`
   - Uses `createServerClient` from `@supabase/ssr`
   - Implements cookie interface with `cookies()` from `next/headers`
   - Export: `createClient()` async function

4. **Create middleware client** - `apps/web/src/lib/supabase/middleware.ts`
   - Uses `createServerClient` from `@supabase/ssr`
   - Implements cookie interface for request/response
   - Export: `updateSession()` function
   - **CRITICAL**: Calls `supabase.auth.getUser()` to refresh session

5. **Update middleware** - `apps/web/middleware.ts`
   - Import and call `updateSession()`
   - Configure matcher to run on all routes (except static files)

**Acceptance Criteria**:
- ✅ 3 client files created with correct patterns
- ✅ Middleware runs on every request (visible in logs)
- ✅ No TypeScript errors
- ✅ Local dev server starts successfully

**Estimated Time**: 1 hour

**Dependencies**: None (already have Supabase running)

**Risk**: Low (well-documented pattern)

---

### Phase 2: Auth Validation & Actions

**Goal**: Create Zod schemas and Server Actions for auth mutations

**Tasks**:

1. **Create validation schemas** - `apps/web/src/lib/auth/validation.ts`
   - `passwordSchema`: Mirror Supabase password rules
   - `signUpSchema`: Email + password
   - `signInSchema`: Email + password (no validation on password for sign-in)
   - `resetPasswordSchema`: Email only
   - `updatePasswordSchema`: Password only

2. **Create Server Actions** - `apps/web/src/lib/auth/actions.ts`
   - `signUp(formData)`: Validate, call `supabase.auth.signUp()`, redirect to `/`
   - `signIn(formData)`: Validate, call `supabase.auth.signInWithPassword()`, handle `redirectTo` param
   - `signOut()`: Call `supabase.auth.signOut()`, redirect to `/sign-in`
   - `resetPassword(formData)`: Validate, call `supabase.auth.resetPasswordForEmail()`, return success message
   - `updatePassword(formData)`: Validate, call `supabase.auth.updateUser({ password })`, redirect to `/`

3. **Error handling pattern**:
   - Return `{ error: fieldErrors }` for validation errors
   - Return `{ error: { form: [message] } }` for Supabase errors
   - Return `{ success: message }` for non-redirect success (password reset)

4. **Security considerations**:
   - All actions marked `'use server'`
   - Validate `redirectTo` param (prevent open redirect)
   - Use `revalidatePath('/', 'layout')` before redirects

**Acceptance Criteria**:
- ✅ All 5 Server Actions implemented
- ✅ Zod validation works (test with invalid input)
- ✅ Error messages surface to user
- ✅ TypeScript types correct

**Estimated Time**: 2 hours

**Dependencies**: Phase 1 (needs server client)

**Risk**: Low (standard pattern)

---

### Phase 3: Auth Pages (UI)

**Goal**: Build sign-up, sign-in, password reset, and update password pages

**Tasks**:

1. **Create auth layout** - `apps/web/src/app/(auth)/layout.tsx`
   - Centered card design
   - Uses `@ui/components` (Card, already available)
   - Responsive (mobile-friendly)

2. **Sign up page** - `apps/web/src/app/(auth)/sign-up/page.tsx`
   - Form with email + password fields
   - Uses `signUp` Server Action
   - Links to sign-in page
   - Client Component (for form state management)
   - Uses `useFormState` hook for error handling

3. **Sign in page** - `apps/web/src/app/(auth)/sign-in/page.tsx`
   - Form with email + password fields
   - Hidden `redirectTo` input (from search params)
   - Uses `signIn` Server Action
   - Links to sign-up and reset-password pages

4. **Reset password page** - `apps/web/src/app/(auth)/reset-password/page.tsx`
   - Form with email field only
   - Uses `resetPassword` Server Action
   - Shows success message ("Check your email...")
   - Link back to sign-in

5. **Update password page** - `apps/web/src/app/(auth)/update-password/page.tsx`
   - Form with new password field
   - Uses `updatePassword` Server Action
   - Accessed via email link (no manual navigation)

6. **Components to use**:
   - `Button` from `@ui/components/button`
   - `Input` from `@ui/components/input`
   - `Label` from `@ui/components/label`
   - `Card` from `@ui/components/card`

**Acceptance Criteria**:
- ✅ All 4 pages render correctly
- ✅ Forms submit and handle errors
- ✅ Navigation links work
- ✅ Mobile responsive
- ✅ Uses design system components

**Estimated Time**: 3 hours

**Dependencies**: Phase 2 (needs Server Actions)

**Risk**: Low (standard forms)

---

### Phase 4: Protected Routes

**Goal**: Implement route protection and example protected page

**Tasks**:

1. **Create protected layout** - `apps/web/src/app/(protected)/layout.tsx`
   - Call `createClient()` from server lib
   - Call `supabase.auth.getUser()` (NOT `getSession()`)
   - Redirect to `/sign-in` if no user
   - Return children if authenticated

2. **Create example protected page** - `apps/web/src/app/(protected)/dashboard/page.tsx`
   - Simple page showing "Welcome, {user.email}"
   - Sign out button (calls `signOut` Server Action)
   - Demonstrates auth is working

3. **Update middleware matcher** (if needed):
   - Ensure protected routes are covered by middleware
   - Current matcher already covers all routes except static files

**Acceptance Criteria**:
- ✅ Unauthenticated users redirected to `/sign-in`
- ✅ Authenticated users see protected page
- ✅ Sign out button works
- ✅ Middleware runs before protected layout

**Estimated Time**: 1 hour

**Dependencies**: Phase 2 (needs `signOut` action)

**Risk**: Low (simple check)

---

### Phase 5: Testing & Validation

**Goal**: Manually test all auth flows and verify security

**Tasks**:

1. **Manual testing checklist**:
   - [ ] Sign up with new account
   - [ ] Check Inbucket for confirmation email (http://localhost:54324)
   - [ ] Sign in with created account
   - [ ] Visit protected page (should work)
   - [ ] Sign out
   - [ ] Try to visit protected page (should redirect to sign-in)
   - [ ] Sign in again with `?redirectTo=/dashboard` (should land on dashboard)
   - [ ] Request password reset
   - [ ] Check Inbucket for reset email
   - [ ] Click reset link (should land on update-password page)
   - [ ] Set new password
   - [ ] Sign in with new password (should work)

2. **Security validation**:
   - [ ] Verify `getUser()` used in protected layout (not `getSession()`)
   - [ ] Verify `redirectTo` param validated (no open redirect)
   - [ ] Verify Server Actions marked `'use server'`
   - [ ] Verify no Supabase secrets in client code
   - [ ] Check middleware runs on every request (log to console)

3. **Error handling**:
   - [ ] Test sign-up with weak password (should show Zod error)
   - [ ] Test sign-up with existing email (should show Supabase error)
   - [ ] Test sign-in with wrong password (should show error)
   - [ ] Test sign-in with non-existent email (should show error)

4. **Mobile testing**:
   - [ ] Test all forms on mobile viewport (Chrome DevTools)
   - [ ] Verify inputs are tappable
   - [ ] Verify keyboard doesn't obscure buttons

**Acceptance Criteria**:
- ✅ All manual tests pass
- ✅ No security issues found
- ✅ Error messages clear and helpful
- ✅ Mobile experience good

**Estimated Time**: 2 hours

**Dependencies**: Phases 1-4 (needs everything complete)

**Risk**: Low (comprehensive checklist)

---

### Phase 6: Documentation

**Goal**: Document setup, usage, and maintenance for future developers

**Tasks**:

1. **Create `.env.local.example`**:
   ```bash
   # Supabase (Local Development)
   # Copy from `supabase status` output
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key-here

   # For production, replace with cloud project keys
   # NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-cloud-anon-key
   ```

2. **Update README.md** - Add auth section:
   ```markdown
   ## Authentication

   Production-ready auth with Supabase Auth:
   - Email/password sign up and sign in
   - Password reset flow (via email)
   - Protected routes with middleware
   - Server-side session management
   - Zod validation + Supabase server validation

   See [GETTING_STARTED.md](GETTING_STARTED.md) for setup instructions.
   ```

3. **Add to GETTING_STARTED.md** (Issue #197):
   - Supabase setup section (already added in comment)
   - Password configuration steps
   - Testing auth flows locally

4. **Add inline code comments**:
   - Explain why 3 clients are needed
   - Document middleware matcher pattern
   - Note security best practices (getUser vs getSession)

5. **Create migration guide** (for cloning):
   ```markdown
   ## Cloning for a New App

   1. Create Supabase cloud project
   2. Configure password rules in dashboard
   3. Update `.env.local` with new keys
   4. Update Zod schema to match password rules
   5. Test auth flows in production
   ```

**Acceptance Criteria**:
- ✅ `.env.local.example` created
- ✅ README updated with auth section
- ✅ Code comments added
- ✅ Migration guide clear

**Estimated Time**: 1 hour

**Dependencies**: Phases 1-5 (needs everything to document)

**Risk**: Low (documentation only)

---

## File Structure (Complete)

```
apps/web/
├── src/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # NEW: Browser client
│   │   │   ├── server.ts              # NEW: Server client
│   │   │   └── middleware.ts          # NEW: Middleware client
│   │   └── auth/
│   │       ├── validation.ts          # NEW: Zod schemas
│   │       └── actions.ts             # NEW: Server Actions
│   ├── app/
│   │   ├── (auth)/                    # NEW: Route group
│   │   │   ├── layout.tsx             # NEW: Auth layout
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx           # NEW: Sign up page
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx           # NEW: Sign in page
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx           # NEW: Reset password page
│   │   │   └── update-password/
│   │   │       └── page.tsx           # NEW: Update password page
│   │   └── (protected)/               # NEW: Route group
│   │       ├── layout.tsx             # NEW: Auth guard
│   │       └── dashboard/
│   │           └── page.tsx           # NEW: Example protected page
│   └── middleware.ts                  # MODIFIED: Add session refresh
├── .env.local                         # MODIFIED: Already updated ✅
└── .env.local.example                 # NEW: Template for others
```

**Summary**:
- **8 new files** in `src/lib/` (3 clients, 2 auth files)
- **7 new pages** in `src/app/` (4 auth pages, 3 protected pages)
- **2 config files** (middleware, .env.example)
- **Total**: ~17 new files + docs

---

## Testing Strategy

### Manual Testing (Phase 5)

**Happy path**:
1. Sign up → Check email → Sign in → Visit dashboard → Sign out
2. Sign in with `?redirectTo=/dashboard` → Lands on dashboard
3. Reset password → Check email → Update password → Sign in

**Error cases**:
1. Weak password → Zod error
2. Existing email → Supabase error
3. Wrong password → Sign-in error
4. Protected page while logged out → Redirect

### Automated Testing (Future)

**E2E tests** (Playwright - already set up):
- Test: Sign up flow
- Test: Sign in flow
- Test: Protected route redirect
- Test: Sign out flow
- Test: Password reset flow

**Note**: Automated tests deferred to future PR (not blocking MVP)

---

## Success Metrics

### Functional Requirements

- ✅ User can sign up with email/password
- ✅ User can sign in with existing account
- ✅ User can request password reset via email
- ✅ User can update password via email link
- ✅ Protected routes redirect to sign in when not authenticated
- ✅ Session persists across page reloads
- ✅ Forms use design system components
- ✅ All flows have proper error handling
- ✅ Mobile responsive

### Non-Functional Requirements

- ✅ **Security**: `getUser()` validates token server-side
- ✅ **Performance**: Middleware adds <50ms overhead
- ✅ **DX**: Clear file structure, well-commented
- ✅ **Maintainability**: Follows official patterns (easy to update)
- ✅ **Scalability**: Works for all 3 planned apps (guitar, parenting, sales)

### Documentation Requirements

- ✅ README updated
- ✅ GETTING_STARTED.md updated (Issue #197)
- ✅ `.env.local.example` created
- ✅ Inline code comments added
- ✅ Migration guide for cloning

---

## Risks & Mitigations

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Middleware overhead slows app | Medium | Low | Middleware is edge runtime (fast); refresh only happens when token expired (~1hr) |
| Cookie size exceeds limit | High | Very Low | Supabase SSR handles chunking automatically |
| Session drift issues | Medium | Low | Use official `updateSession` pattern; well-tested by Supabase |
| Password rules out of sync | Low | Medium | Document sync requirement; Supabase still enforces (just worse UX) |

### Implementation Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Supabase CLI version issues | Low | Low | Already running v2.30.4 (works fine); upgrade optional |
| Missing dependencies | Low | Very Low | Dependencies checked in Phase 1 |
| TypeScript errors | Low | Low | Follow official TypeScript examples |
| Design system components missing | Medium | Very Low | Already verified components exist (@ui/components) |

### Scope Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Feature creep (profile page) | Medium | Low | Already removed from scope; documented decision |
| Offline requirements creep in | High | Low | Documented as sales-app-specific; not in starter |
| Email customization requested | Low | Medium | Point to Issue #295; keep scope tight |

---

## Dependencies

### External Dependencies

- ✅ **Supabase local stack** - Running at http://127.0.0.1:54321
- ✅ **Docker** - Installed and working
- ✅ **Node packages** - `@supabase/ssr`, `@supabase/supabase-js` (will install if missing)

### Internal Dependencies

- ✅ **Design system** - `@ui/components` package (Button, Input, Label, Card)
- ✅ **Form library** - React Hook Form + Zod (already integrated)
- ✅ **Next.js 15** - App Router, Server Actions

### Blocked By

- None (all dependencies satisfied)

### Blocks

- Issue #293 (Stripe) - May need auth for user-scoped subscriptions
- Issue #294 (AI) - May need auth for user-scoped AI conversations
- Issue #295 (Email) - Will customize auth emails
- Issue #197 (Getting Started) - Needs auth setup documented

---

## Out of Scope

### Explicitly NOT Included

- ❌ **Profile page** - Context-dependent; build per-app
- ❌ **Social auth** (Google, GitHub) - Post-MVP
- ❌ **Magic link** - Deferred to future
- ❌ **Email verification on signup** - Optional; not MVP
- ❌ **Two-factor authentication** - Post-MVP
- ❌ **Role-based access control** - Post-MVP
- ❌ **Team/organization support** - Post-MVP
- ❌ **Offline support** - Sales-app-specific (not in starter)
- ❌ **Email customization** - Issue #295
- ❌ **Auth adapter pattern** - Over-engineered for MVP (see SPEC-20250927)
- ❌ **`AUTH_ENABLED` flag** - Not needed (auth always enabled in apps that need it)

### Deferred to Future

- **Automated E2E tests** - Manual testing sufficient for MVP
- **Helper functions** - Extract as patterns emerge (don't premature abstract)
- **React Query integration** - Add per-app if needed (sales app offline)
- **Session management UI** - "Active sessions" page (post-MVP)
- **Account deletion** - User can request via support (post-MVP)

---

## Rollback Plan

### If Implementation Fails

**Rollback steps**:
1. Delete feature branch: `git branch -D feature/292-auth-module`
2. Local Supabase unaffected (just don't use auth)
3. No database migrations (auth uses Supabase's built-in tables)
4. No environment changes (keys already in `.env.local`)

**Impact**: None (isolated feature branch)

### If Auth Breaks in Production

**Since this is a starter template, not a production app:**
- No production users affected
- Each cloned app has own Supabase project
- Breaking changes only affect new clones
- Fix in starter, re-clone if needed

**If issue discovered after cloning:**
- Local Supabase allows safe testing
- Fix in starter template
- Cherry-pick fix to cloned app

---

## Definition of Done

### Code Complete

- ✅ All 17 files created/modified
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ All imports resolve correctly
- ✅ Local dev server starts without errors

### Functionality Complete

- ✅ All Phase 5 manual tests pass
- ✅ Sign up creates account in local Supabase
- ✅ Sign in authenticates existing user
- ✅ Protected routes redirect when not authenticated
- ✅ Password reset emails arrive in Inbucket
- ✅ Update password flow works end-to-end
- ✅ Sign out clears session
- ✅ `?redirectTo` param works correctly

### Quality Complete

- ✅ Error messages clear and helpful
- ✅ Mobile responsive (tested in Chrome DevTools)
- ✅ Forms use design system components
- ✅ Code follows project conventions
- ✅ Inline comments explain non-obvious code
- ✅ No security issues (checklist passed)

### Documentation Complete

- ✅ README.md updated with auth section
- ✅ `.env.local.example` created
- ✅ Comment added to Issue #197 (GETTING_STARTED.md)
- ✅ Migration guide documented
- ✅ Code comments added

### Integration Complete

- ✅ Middleware runs on every request
- ✅ Session refresh works automatically
- ✅ No conflicts with existing code
- ✅ Design system components work as expected
- ✅ Local Supabase configured correctly

### Ready for Review

- ✅ Feature branch pushed to GitHub
- ✅ PR created with description
- ✅ All checklist items completed
- ✅ Screenshots/video of auth flows (optional but nice)

---

## Timeline Estimate

### Optimistic (6 hours)

- Phase 1: 0.5 hours
- Phase 2: 1.5 hours
- Phase 3: 2 hours
- Phase 4: 0.5 hours
- Phase 5: 1 hour
- Phase 6: 0.5 hours

### Realistic (10 hours)

- Phase 1: 1 hour (includes debugging)
- Phase 2: 2 hours (includes error handling refinement)
- Phase 3: 3 hours (includes styling tweaks)
- Phase 4: 1 hour (includes testing)
- Phase 5: 2 hours (thorough testing)
- Phase 6: 1 hour (comprehensive docs)

### Pessimistic (14 hours)

- Includes time for unexpected issues:
  - Supabase SSR quirks
  - TypeScript type issues
  - Middleware configuration
  - Form state management complexity

**Recommended**: Plan for **10 hours** (1.5 days at ~7 hours/day)

---

## Next Steps

### Immediate Actions

1. ✅ **Plan approved** - This document reviewed and accepted
2. 🔄 **Start Phase 1** - Create Supabase clients
3. ⏳ **Phase 2-6** - Follow implementation phases

### After Completion

1. Create PR with title: `feat: authentication module (Issue #292)`
2. Add to PR description:
   - Link to this plan
   - Screenshots of auth flows
   - Testing checklist (all items checked)
3. Merge to main
4. Close Issue #292
5. Update Issue #197 (Getting Started) with auth setup steps

### Future Work

- Issue #293: Stripe integration (may need auth for subscriptions)
- Issue #295: Email customization (auth email templates)
- Issue #197: Complete Getting Started guide (after MVP features done)

---

## References

### Supabase Documentation

- [Next.js Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Password Security](https://supabase.com/docs/guides/auth/password-security)
- [@supabase/ssr Package](https://github.com/supabase/ssr)
- [Supabase Auth API](https://supabase.com/docs/reference/javascript/auth-api)

### Project Documentation

- Issue #292: [MVP: Build authentication module](https://github.com/Shredvardson/dl-starter/issues/292)
- Issue #197: [Improve onboarding experience](https://github.com/Shredvardson/dl-starter/issues/197)
- Issue #295: [Email integration](https://github.com/Shredvardson/dl-starter/issues/295)
- SPEC-20250927: [Auth v1 (Supabase) - Full Kernel](../specs/feature-001-auth-v1-supabase.md) (more complex than our MVP)

### Research Sources

- Context7: `/supabase/ssr` library docs (Next.js 15 patterns)
- WebSearch: "Next.js 15 monorepo authentication best practices 2025"
- Research Agent: Verified form infrastructure (React Hook Form + Zod)
- Security Scanner: Identified auth gaps (P0 priority)

---

**Plan Status**: ✅ Ready for Implementation

**Confidence Level**: 95% (High)

**Last Updated**: 2025-11-06

**Next Action**: Begin Phase 1 (Supabase Clients)
