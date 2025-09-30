# Stripe Recipe (stub)

Goal: subscriptions + webhooks.

- Webhooks via /api/stripe/webhook → verify signature.
- Server-only keys; never expose price IDs client-side.

## Checklist

- [ ] Test mode keys in .env
- [ ] Webhook secret set in CI/Vercel

Links: Stripe Billing quickstart.
