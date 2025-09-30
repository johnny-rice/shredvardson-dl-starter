# Environment Setup

Pattern: `@/lib/env` with Zod validation.

## Rules

- Never read `process.env` directly. Always import from `@/lib/env`.
- Public values must start with `NEXT_PUBLIC_` and live under `client` in `apps/web/src/lib/env.ts`.
- Server secrets live under `server`. Do not import server-only envs in client components.
- All keys in `.env.example`
- Validate on boot; fail loudly in CI.

## Checklist

- [ ] All env vars defined in `@/lib/env` with Zod
- [ ] Client/server separation enforced
- [ ] `.env.example` covers all keys
- [ ] Doctor validates required keys

## Troubleshooting

- If env validation fails, fix `.env.local` or Vercel Project Settings → Environment Variables.

Links: Zod, Next.js runtime env guide.
