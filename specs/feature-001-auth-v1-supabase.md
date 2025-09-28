---
id: SPEC-20250927-auth-v1-supabase
type: spec
issue: 68
parentId: ""
links: []
---

# Auth v1 (Supabase) — Full Kernel Specification

## Summary

Prepare DLStarter for optional Supabase Auth behind `AUTH_ENABLED`. Define a thin auth **adapter** interface, env contract, middleware guard for `/app/**`, minimal sign-in/out UX, LLM-friendly docs, and a paired Dev Lane issue. Default remains auth-off; enabling flips on auth flows.

## Goals

- Simple, **swappable** provider via adapter (start with Supabase).
- **Server-first** mutations (Server Actions); no secrets in client.
- **LLM-friendly** docs, clear file paths, and two commands to scaffold.
- Minimal, solo-friendly DX with a single happy-path E2E.

## Non-Goals

- Org/teams model, advanced roles/permissions.
- Enterprise SSO beyond GitHub OAuth.
- Complex UI.

## User Stories

1. **Solo Builder Experience**: As a solo builder, setting `AUTH_ENABLED=true` gives a working sign-in and protected `/app/**`.
2. **Developer Security**: As a developer, I can call `requireUser()` in server actions to enforce auth.
3. **Designer Simplicity**: As a designer, I can wrap trees with `<AuthGate>` without wiring details.
4. **Maintainer Flexibility**: As a maintainer, I can swap providers by replacing one adapter file.

## Architecture Decisions

### Core Patterns
- **Adapter Pattern:** `lib/auth/adapter.ts` defines `getSession`, `signIn`, `signOut`, `requireUser`, optional `onAuthStateChange`. First impl: `lib/auth/adapters/supabase.ts`.
- **Server-First:** All auth mutations are Server Actions.
- **Middleware Guard:** `middleware.ts` protects `/app/**` when `AUTH_ENABLED=true`.
- **RLS-Ready:** RLS patterns documented; SQL migrations come later.

### Supabase-Specific Decisions
- **Use @supabase/ssr for server/browser clients (no legacy helpers).**
- **Include middleware.ts step to refresh sessions automatically when AUTH_ENABLED=true; no-op otherwise.**
- **Explicit middleware matcher:** `export const config = { matcher: ["/((?!_next|static|favicon.ico|images).*)"] }` with `/app/**` protection only when AUTH_ENABLED=true.
- **Provider flag for future swaps:** Add `AUTH_PROVIDER="supabase"` (default) to keep adapter swappable.

## Acceptance Criteria (Spec)

### Core Requirements
- **A1**: Adapter interface + Supabase adapter responsibilities documented.
- **A2**: Env contract + `env.ts` validation shapes (no literal keys).
- **A3**: Public vs protected routes + middleware rules defined.
- **A4**: Minimal UX flows defined (magic link + GitHub OAuth) incl. states.
- **A5**: E2E test scenario + CI toggles (skip when `AUTH_ENABLED=false`).
- **A6**: LLM recipe + two commands: `/auth:enable` and `/auth:add-protected {path}`.

### Supabase SSR Requirements
- **A7**: Recipe shows calling cookies() prior to Supabase calls in server code to avoid cached responses for authenticated data.
- **A8**: RLS guidance section: enable RLS and index policy columns (e.g., user_id), with example SQL.
- **A9**: Document GitHub OAuth setup and Magic Link redirect URLs.

## Risks & Mitigations

### Technical Risks
- **Vendor lock-in** → Use adapter; forbid client-side Supabase in components.
- **Secret leakage** → Placeholders only in `.env.example`; schema validation only.
- **AuthZ gaps** → Keep writes on server; RLS patterns documented for next milestone.

### Implementation Risks
- **Cookie drift/SSR nuances** → rely on SSR client/session APIs instead of cookie name checks.
- **Future RBAC complexity** → plan for custom claims via Auth Hooks if org/roles are later required.

## Deliverables

### Documentation
- **D1**: `docs/recipes/auth.md` (enable steps, protect-route recipe, RLS notes).
- **D2**: Issue B body (Dev Lane) ready to open, with checklist & acceptance.
- **D3**: File map + code scaffolds (adapter, Supabase adapter, `AuthGate`, middleware, example pages, `env.ts` schema) included in the doc.

### Code Scaffolds
- **lib/supabase/server.ts, lib/supabase/client.ts, and lib/supabase/middleware.ts stubs using @supabase/ssr.**
- **Expanded docs/recipes/auth.md sections: "Configure OAuth," "Redirect URLs," "RLS + index," "SSR caching gotcha."**

## File Structure

### Files to create under `apps/web`:
- `src/lib/auth/adapter.ts` - Core auth adapter interface
- `src/lib/auth/adapters/supabase.ts` - Supabase implementation
- `src/lib/auth/gate.tsx`, `src/lib/auth/hooks.ts` - Client components
- `middleware.ts` (edge) and `src/middleware/route-guard.ts` - Route protection
- `app/signin/page.tsx`, `app/app/page.tsx` - Auth UI and protected example
- `src/lib/env.ts` - Extended schema for auth env vars
- **`lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`** - SSR clients

### Environment Configuration
- `.env.example` placeholders: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server)
  - `AUTH_ENABLED=false`
  - `AUTH_PROVIDER="supabase"`

### Testing & CI
- E2E: `auth.spec.ts` (skips when auth off).
- CI hooks: doctor check (envs when auth on), lint rule banning client Supabase usage.
- **ESLint rule specifics:** Ban client bundles from importing `@supabase/*` that can write:
  - Disallow in files containing "use client": imports from `@supabase/ssr` or `@supabase/supabase-js`
  - Repo-wide forbid of `@supabase/auth-helpers-*`
- **Note: No @supabase/auth-helpers-* usage; @supabase/ssr only.**

## Future Considerations

### JWT Claims Strategy
**JWT claim strategy:** If/when you need orgs/roles, prefer Custom Access Token Auth Hooks to inject claims (e.g., user_role, org_id) used in RLS. Document this pattern for future reference without implementing now.

### Security Considerations
- **SUPABASE_SERVICE_ROLE_KEY is server-only; no client components may import Supabase clients capable of writes (explicit acceptance criterion).**

### Enhancement Opportunities
- **Minimal rate-limit for auth endpoints:** TODO note for future custom API routes - use tiny edge rate-limit (e.g., token bucket) to protect magic-link spam.
- **Telemetry hooks:** If PostHog is present, add optional events: `auth_signin_requested`, `auth_signin_completed`, `auth_signout` for flow diagnostics.
- **Accessibility & UX:** Sign-in page requirements: labeled email input, error/confirmation states ("Magic link sent"), keyboard-accessible buttons.

## LLM Commands

### `/auth:enable`
- Validates environment setup
- Enables auth feature flag
- Runs initial setup checks
- Provides next steps guidance

### `/auth:add-protected {path}`
- Adds route protection to specified path
- Updates middleware configuration
- Provides implementation example
- Validates security patterns

## Definition of Done (Spec)

### Documentation Complete
- Spec doc merged with all A1–A9 items.
- Dev Lane issue body attached and ready to execute.
- No code enabled in runtime (flag remains `false`).
- **OAuth & magic link allow-lists:** Documentation requires adding redirect URLs for local, preview, prod environments with example `redirectTo` values.

### Security Validated
- **SUPABASE_SERVICE_ROLE_KEY is server-only; no client components may import Supabase clients capable of writes (explicit acceptance criterion).**

### Integration Ready
- All file scaffolds documented with clear paths
- Environment contract fully specified
- Testing strategy defined with CI integration
- LLM commands specified for developer workflow
- **Rollback note:** Disable path: Set `AUTH_ENABLED=false` → app behaves public-only; no PR revert needed.

## Related Issues

- GitHub Issue #68: Auth v1 (Supabase) — Full Kernel (Spec)
- Future Dev Lane issue (to be created): Implementation checklist

## Success Metrics

- Solo developer can enable auth in under 10 minutes
- Zero client-side auth secrets exposure
- Clean separation between auth providers via adapter
- Comprehensive documentation for LLM assistance
- E2E test coverage for happy path scenarios