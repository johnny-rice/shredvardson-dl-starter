#!/usr/bin/env tsx
import { exit } from 'node:process';

function validateEnvironment() {
  console.log('🔍 Validating environment variables...');

  try {
    // Import and validate environment schema
    const { env } = require('../apps/web/src/lib/env');
    console.log('✅ Environment schema validation passed');

    // Production detection after env validation
    const isProduction = env.NODE_ENV === 'production';

    // Production-specific checks for risky keys only
    if (isProduction) {
      console.log('🔒 Running production safety checks...');

      // Check Stripe keys
      if (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
        console.error('❌ Production cannot use test Stripe publishable key');
        return false;
      }

      if (env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
        console.error('❌ Production cannot use test Stripe secret key');
        return false;
      }

      // Check for localhost URLs (if APP_URL is defined)
      if (env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
        console.error('❌ App URL cannot be localhost in production');
        return false;
      }

      // Check for PostHog test keys (if used)
      if (env.NEXT_PUBLIC_POSTHOG_KEY?.startsWith('phc_test_')) {
        console.error('❌ Production cannot use test PostHog key');
        return false;
      }

      console.log('✅ Production safety checks passed');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Environment validation failed:');
    console.error(errorMessage);
    return false;
  }

  return true;
}

if (!validateEnvironment()) {
  exit(1);
}

console.log('✅ Preflight checks passed');
