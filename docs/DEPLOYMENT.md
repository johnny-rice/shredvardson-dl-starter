# Deployment Guide

This guide walks you through deploying your DL Starter application to production using Vercel and configuring all necessary services.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Authentication Setup](#authentication-setup)
- [Payment Processing (Stripe)](#payment-processing-stripe)
- [Email Service (Resend)](#email-service-resend)
- [AI Provider Setup](#ai-provider-setup)
- [Internationalization (i18n)](#internationalization-i18n)
- [Monitoring (Sentry)](#monitoring-sentry)
- [First Deploy Checklist](#first-deploy-checklist)
- [Post-Deploy Verification](#post-deploy-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

### Required Accounts

- [ ] **GitHub** - Source code hosting
- [ ] **Vercel** - Hosting platform ([sign up](https://vercel.com/signup))
- [ ] **Supabase** - Database and auth ([sign up](https://supabase.com/dashboard))

### Optional Service Accounts (based on your features)

- [ ] **Stripe** - Payment processing ([sign up](https://dashboard.stripe.com/register))
- [ ] **Resend** - Email delivery ([sign up](https://resend.com/signup))
- [ ] **Anthropic/OpenAI** - AI capabilities ([Anthropic](https://console.anthropic.com/) / [OpenAI](https://platform.openai.com/signup))
- [ ] **Sentry** - Error tracking ([sign up](https://sentry.io/signup/))

### Local Tools

- [ ] **Node.js 20+** - Check with `node --version`
- [ ] **pnpm** - Package manager (install: `npm install -g pnpm`)
- [ ] **Git** - Version control
- [ ] **Vercel CLI** (optional) - `pnpm add -g vercel`
- [ ] **Supabase CLI** (optional) - See [Supabase CLI docs](https://supabase.com/docs/guides/cli)

## Quick Start

For experienced users who want to deploy quickly:

```bash
# 1. Push your code to GitHub
git push origin main

# 2. Connect to Vercel (one-time setup)
# - Go to https://vercel.com/new
# - Import your GitHub repository
# - Configure environment variables (see .env.example)
# - Deploy

# 3. Set up Supabase
# - Create project at https://supabase.com/dashboard
# - Copy connection strings and API keys
# - Add to Vercel environment variables
# - Run migrations: supabase db push

# 4. Configure services (Stripe, Resend, etc.)
# - Set up webhooks
# - Add API keys to Vercel environment variables

# 5. Verify deployment
# - Visit your Vercel URL
# - Test critical user flows
# - Monitor logs for errors
```

For detailed step-by-step instructions, continue reading below.

## Vercel Deployment

### Initial Setup (GitHub Integration)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "feat: prepare for deployment"
   git push origin main
   ```

2. **Create Vercel Project**

   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click **"Add New Project"**
   - Select **"Import Git Repository"**
   - Choose your GitHub repository
   - Authorize Vercel to access the repository

3. **Configure Build Settings**

   Vercel should auto-detect Next.js settings:

   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (monorepo root)
   - **Build Command**: `pnpm build` (or `turbo build`)
   - **Output Directory**: `apps/web/.next` (auto-detected)
   - **Install Command**: `pnpm install`

   > ⚠️ **Monorepo Note**: If using a monorepo setup, ensure the root directory points to your Next.js app or use `turbo` build commands.

4. **Configure Environment Variables** (see [Environment Variables](#environment-variables) section)

5. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~2-5 minutes)
   - Visit your production URL (e.g., `your-app.vercel.app`)

### Subsequent Deployments

Vercel automatically deploys on every push to your main branch:

```bash
git push origin main  # Triggers automatic deployment
```

**Preview Deployments**: Every pull request gets a unique preview URL for testing.

### Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `myapp.com`)
3. Configure DNS records as instructed by Vercel
4. SSL certificates are automatically provisioned

## Environment Variables

All environment variables must be configured in Vercel before deployment. Use the comprehensive `.env.example` file as your reference.

### Adding Variables to Vercel

**Via Dashboard:**

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Secret value
   - **Environments**: Select `Production`, `Preview`, `Development` as needed
3. Click **"Save"**

**Via Vercel CLI:**

```bash
vercel env add DATABASE_URL production
# Paste value when prompted
```

### Environment Variable Groups

See `.env.example` for the complete list. Key categories:

#### Required for Basic Functionality

```bash
NEXT_PUBLIC_APP_NAME=Your App Name
NODE_ENV=production
```

#### Database (Supabase)

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Authentication

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
AUTH_ENABLED=true
AUTH_PROVIDER=supabase
```

#### Payments (Stripe)

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Email (Resend)

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### AI Providers

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

#### Monitoring (Sentry - Optional)

```bash
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_...
```

> 💡 **Tip**: Use different API keys for production vs. preview environments to avoid mixing test and production data.

### Environment Variable Validation

This project uses **Zod** for runtime validation. If any required variable is missing or invalid, the build will fail with a clear error message.

See `apps/web/src/lib/env.ts` for validation rules.

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Your project name
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for MVP
4. Wait for project to initialize (~2 minutes)

### 2. Get Connection Details

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

3. Go to **Project Settings** → **Database**
4. Copy **Connection String** (URI mode): `DATABASE_URL`

### 3. Run Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push

# Verify migration status
supabase db remote commit
```

**Option B: Using Supabase Dashboard**

1. Go to **SQL Editor**
2. Copy contents of each migration file from `supabase/migrations/`
3. Run each migration in order

### 4. Seed Data (Optional)

For initial data:

```bash
# Seed production data (if needed)
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
pnpm db:seed:dev
```

> ⚠️ **Warning**: Only seed production once. Use test environments for development data.

### 5. Enable Row Level Security (RLS)

**Verify RLS is enabled on all tables:**

```bash
pnpm db:validate:rls
```

All user-facing tables MUST have RLS policies to prevent unauthorized access.

See [Database Recipe](docs/recipes/db.md) for complete workflow.

## Authentication Setup

This project uses **Supabase Auth** for authentication flows.

### 1. Configure Auth in Supabase

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL: `https://your-app.vercel.app`
3. Add redirect URLs:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/login
   ```

4. Go to **Authentication** → **Email Templates**
5. Customize email templates (optional):
   - Confirm signup
   - Reset password
   - Magic link

### 2. Configure Environment Variables

Ensure these are set in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
AUTH_ENABLED=true
AUTH_PROVIDER=supabase
```

### 3. Test Authentication

1. Visit `/signup` and create a test account
2. Check email inbox for confirmation email
3. Confirm email and try logging in at `/login`
4. Verify protected routes redirect to login

**Email Testing**:
- Supabase free tier sends emails via their SMTP
- For custom domains, configure SMTP settings in Supabase Dashboard

See [Authentication Recipe](docs/recipes/auth.md) for advanced configuration.

## Payment Processing (Stripe)

> ⚠️ **Note**: Stripe integration is partially implemented. Follow these steps when enabling payment features.

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle to **"Test mode"** in the top-right (use test mode for staging)
3. Go to **Developers** → **API Keys**
4. Copy:
   - **Publishable key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key**: `STRIPE_SECRET_KEY`

### 2. Configure Webhooks

Stripe webhooks notify your app of payment events (subscription created, payment succeeded, etc.).

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy **Signing secret**: `STRIPE_WEBHOOK_SECRET`

### 3. Add to Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...              # Use sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ **Production Warning**: Never use test keys (`sk_test_`, `pk_test_`) in production. Vercel build will fail if test keys are detected in production environment.

### 4. Test Webhook Locally (Development)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

### 5. Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Click **"Add Product"**
3. Fill in product details and pricing
4. Copy **Price ID** (e.g., `price_1ABC...`) for your application code

See [Stripe Recipe](docs/recipes/stripe.md) for implementation details.

## Email Service (Resend)

> ⚠️ **Note**: Email service integration is planned (Issue #295). Follow these steps when implementing email features.

### 1. Get Resend API Key

1. Go to [Resend Dashboard](https://resend.com/overview)
2. Click **"API Keys"**
3. Click **"Create API Key"**
4. Copy the API key: `RESEND_API_KEY`

### 2. Verify Sending Domain

To send emails from your domain (e.g., `noreply@yourdomain.com`):

1. Go to **Domains** in Resend Dashboard
2. Click **"Add Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records (SPF, DKIM) to your DNS provider
5. Wait for verification (~10 minutes)

> 💡 **Tip**: For testing, use the default Resend domain: `onboarding@resend.dev`

### 3. Configure Environment Variables

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 4. Test Email Sending

Create a test API route or use your email sending function:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Hello from your app!</p>',
});
```

See [Resend Documentation](https://resend.com/docs/send-with-nextjs) for Next.js integration.

## AI Provider Setup

> ⚠️ **Note**: AI provider integration is planned (Issue #294). Follow these steps when implementing AI features.

### Anthropic (Claude)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Click **"Get API Key"**
3. Create a new key and copy it: `ANTHROPIC_API_KEY`
4. Add to Vercel environment variables

**Usage Example**:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**Models Available**:
- `claude-3-5-sonnet-20241022` - Best for complex tasks
- `claude-3-5-haiku-20241022` - Fast and cost-effective

### OpenAI (GPT)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Copy the key: `OPENAI_API_KEY`
4. Add to Vercel environment variables

**Usage Example**:

```bash
OPENAI_API_KEY=sk-...
```

**Models Available**:
- `gpt-4` - Most capable model
- `gpt-3.5-turbo` - Fast and cost-effective

### Rate Limits and Billing

- **Anthropic**: Set usage limits in [Console Settings](https://console.anthropic.com/settings/limits)
- **OpenAI**: Set usage limits in [Usage Limits](https://platform.openai.com/account/billing/limits)

> 💡 **Tip**: Start with low limits and increase as needed to avoid unexpected bills.

## Internationalization (i18n)

> ⚠️ **Note**: i18n integration is planned (Issue #296). This section will be updated when i18n is implemented.

### Planned Configuration

```bash
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,es,fr,de
```

### Resources for Implementation

- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl](https://next-intl-docs.vercel.app/) - Recommended i18n library

## Monitoring (Sentry)

Sentry is **optional** - the application works without it, but it's highly recommended for production error tracking.

### 1. Create Sentry Project

1. Go to [Sentry Dashboard](https://sentry.io/)
2. Create new project
3. Select **Next.js** as platform
4. Copy **DSN**: `SENTRY_DSN`

### 2. Create Auth Token

For source map uploads during build:

1. Go to **Settings** → **Auth Tokens**
2. Create new token with scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Copy token: `SENTRY_AUTH_TOKEN`

### 3. Configure Environment Variables

```bash
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...  # Same as SENTRY_DSN
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_...
```

### 4. Verify Integration

1. Deploy your application
2. Trigger an error (e.g., throw an exception)
3. Check Sentry Dashboard for the error report

**Optional**: Sentry will automatically capture:
- Unhandled exceptions
- Promise rejections
- Client-side errors
- Server-side errors

See `apps/web/next.config.ts` for Sentry configuration.

## First Deploy Checklist

Use this checklist before your first production deployment:

### Pre-Deployment

- [ ] All environment variables configured in Vercel
- [ ] `.env.example` matches production variables (no missing vars)
- [ ] Supabase project created and migrations applied
- [ ] RLS policies enabled and tested (`pnpm db:validate:rls`)
- [ ] Authentication tested (signup, login, password reset)
- [ ] Stripe webhooks configured (if using payments)
- [ ] Email domain verified in Resend (if using emails)
- [ ] Custom domain DNS configured (if using custom domain)
- [ ] Sentry project created (if using error tracking)

### Code Quality

- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds locally
- [ ] `pnpm test` all tests passing
- [ ] `pnpm doctor` passes (docs and config validation)

### Security

- [ ] No hardcoded secrets in code
- [ ] All API keys use environment variables
- [ ] RLS policies enabled on all user-facing tables
- [ ] Authentication flows tested
- [ ] CORS properly configured
- [ ] Rate limiting implemented (if applicable)

### Performance

- [ ] Images optimized (use Next.js `<Image>` component)
- [ ] Bundle size checked (`pnpm build` output)
- [ ] Database queries optimized (indexes on foreign keys)
- [ ] No console.logs in production code

## Post-Deploy Verification

After deployment, verify everything works:

### Automated Checks

Run these commands to verify deployment:

```bash
# Check HTTP status
curl -I https://your-app.vercel.app

# Check specific routes
curl https://your-app.vercel.app/api/health

# Monitor logs
vercel logs your-app.vercel.app --follow
```

### Manual Testing

- [ ] **Homepage loads** - Visit `https://your-app.vercel.app`
- [ ] **Authentication works**
  - [ ] Sign up with new account
  - [ ] Confirm email
  - [ ] Log in
  - [ ] Log out
  - [ ] Password reset flow
- [ ] **Protected routes** - Verify redirect to login when not authenticated
- [ ] **Database queries** - Test CRUD operations
- [ ] **API endpoints** - Test all `/api/*` routes
- [ ] **Stripe webhooks** - Check webhook logs in Stripe Dashboard
- [ ] **Error tracking** - Trigger test error, check Sentry

### Performance Monitoring

- [ ] Check [Vercel Analytics](https://vercel.com/docs/analytics)
- [ ] Monitor [Web Vitals](https://vercel.com/docs/concepts/analytics/web-vitals)
- [ ] Review database query performance in Supabase Dashboard

### Common Issues to Check

- [ ] **Environment variables** - Ensure all required vars are set
- [ ] **Database connection** - Check connection string and firewall rules
- [ ] **API rate limits** - Monitor usage on Stripe, Resend, AI providers
- [ ] **CORS errors** - Check browser console for blocked requests
- [ ] **Webhook failures** - Review webhook logs in service dashboards

## Troubleshooting

### Build Failures

**Error: "Missing environment variable"**

```
Error: Invalid environment variables: {
  DATABASE_URL: Required
}
```

**Solution**: Add the missing variable to Vercel environment variables and redeploy.

---

**Error: "Build exceeded time limit"**

**Solution**:
- Optimize dependencies (remove unused packages)
- Use Vercel Pro plan for longer build times
- Split monorepo builds

---

**Error: "Stripe test keys forbidden in production"**

```
Error: Test publishable key forbidden in production
```

**Solution**: Replace test keys (`sk_test_`, `pk_test_`) with live keys (`sk_live_`, `pk_live_`) in production environment.

### Runtime Errors

**Error: "Database connection failed"**

**Symptoms**: API routes return 500 errors, logs show connection errors.

**Solution**:
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check Supabase project is not paused (free tier auto-pauses after inactivity)
3. Verify connection pooling settings
4. Check Supabase Dashboard for connection limits

---

**Error: "Authentication failed"**

**Symptoms**: Login returns errors, signup doesn't send email.

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check site URL is configured in Supabase Auth settings
3. Verify redirect URLs match your domain
4. Check email delivery in Supabase Dashboard

---

**Error: "Stripe webhook signature verification failed"**

**Symptoms**: Webhook endpoint returns 400, Stripe Dashboard shows failed webhooks.

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the secret in Stripe Dashboard
2. Ensure webhook endpoint URL is correct
3. Check raw body is being passed to Stripe (Next.js API routes need `bodyParser: false`)
4. Verify webhook events are selected in Stripe Dashboard

### Performance Issues

**Slow Page Loads**

**Solution**:
- Enable [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) for faster response times
- Use [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- Add database indexes for frequently queried columns
- Enable [Supabase Read Replicas](https://supabase.com/docs/guides/platform/read-replicas) (Pro plan)

---

**High Database Latency**

**Solution**:
1. Check query performance in Supabase Dashboard
2. Add indexes to foreign keys and filtered columns
3. Use connection pooling (`supavisor` in connection string)
4. Optimize RLS policies (see [RLS Optimization Guide](docs/database/RLS_OPTIMIZATION.md))

### Deployment Issues

**Error: "Deployment stuck"**

**Solution**:
1. Check Vercel Status page for incidents
2. Review build logs for hanging processes
3. Cancel deployment and retry
4. Contact Vercel support if persists

---

**Error: "Domain not working"**

**Solution**:
1. Verify DNS records are correctly configured
2. Wait for DNS propagation (can take up to 48 hours)
3. Use [DNS Checker](https://dnschecker.org/) to verify propagation
4. Check Vercel Domains settings for errors

### Getting Help

If you're still stuck:

1. **Check Logs**:
   - Vercel: `vercel logs your-app.vercel.app`
   - Supabase: Dashboard → Logs
   - Sentry: Dashboard → Issues

2. **Review Documentation**:
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)

3. **Community Support**:
   - [Vercel Discord](https://vercel.com/discord)
   - [Supabase Discord](https://discord.supabase.com/)
   - [DL Starter GitHub Issues](https://github.com/Shredvardson/dl-starter/issues)

---

## Additional Resources

- [Vercel Deployment Best Practices](https://vercel.com/docs/deployments/overview)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Database Recipe](docs/recipes/db.md)
- [Environment Setup](docs/recipes/env-setup.md)
- [Testing Guide](docs/testing/TESTING_GUIDE.md)

---

**Questions or Issues?** Open an issue on [GitHub](https://github.com/Shredvardson/dl-starter/issues) or check existing documentation in the `docs/` directory.
