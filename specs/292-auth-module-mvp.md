---
id: SPEC-292
type: spec
issue: 292
title: MVP Authentication Module
priority: p0
status: in-progress
lane: mvp-features
created: 2025-11-06
---

# MVP Authentication Module

## Summary

Implement a complete, production-ready authentication system using Supabase Auth and Next.js 15 Server Components for the DL Starter template.

## Problem Statement

The DL Starter template currently has no authentication system. Future apps (guitar app, parenting app, sales app) will all need user authentication with email/password sign-up, sign-in, password reset, and protected routes.

## Proposed Solution

Implement authentication using Supabase Auth with Next.js 15 Server Components, following Supabase's official SSR pattern. Keep it simple, secure, and well-documented as a foundation that can be cloned for real apps.

**Core Features:**
- Email/password authentication (sign up, sign in, sign out)
- Password reset flow via email
- Protected routes with middleware
- Server-side session management
- Zod validation + Supabase server validation

**Approach:**
- Follow Supabase's official Next.js 15 guide exactly
- Use 3 Supabase clients (Browser, Server, Middleware)
- Server Actions for all auth mutations
- Route groups: `(auth)` for public, `(protected)` for authenticated
- Local Supabase development only (no cloud project)

## Acceptance Criteria

- [ ] User can sign up with email/password
- [ ] User can sign in with existing account
- [ ] User can request password reset via email
- [ ] User can update password via email link
- [ ] Protected routes redirect to sign in when not authenticated
- [ ] Session persists across page reloads
- [ ] Forms use design system components
- [ ] All flows have proper error handling
- [ ] Mobile responsive
- [ ] Documentation updated (README, GETTING_STARTED)
- [ ] Manual testing completed for all flows

## Out of Scope

- Profile page (context-dependent, build per-app)
- Social auth (Google, GitHub) - post-MVP
- Magic link - post-MVP
- Two-factor authentication - post-MVP
- Role-based access control - post-MVP
- Email customization (separate issue #295)

## References

- [Supabase Next.js Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [PLAN-292](../plans/292-auth-module-mvp.md) - Detailed implementation plan
- Issue #295: Email integration (email customization)
- Issue #197: Getting Started guide (needs auth setup documentation)
