#!/usr/bin/env tsx
/**
 * Skill Script: Validate Migration
 *
 * Thin wrapper around the existing migrate.ts script.
 * Returns structured output for the Skill layer.
 */

import { execSync } from 'child_process';

try {
  // Call existing script
  const output = execSync(
    'tsx scripts/db/migrate.ts validate',
    { encoding: 'utf-8', cwd: process.cwd() }
  );

  console.log(JSON.stringify({
    success: true,
    output,
    nextSteps: [
      'Review validation report',
      'Fix any errors or warnings',
      'Run: /db apply when ready'
    ]
  }));
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    hint: 'Check Supabase is running (supabase start)'
  }));
  process.exit(1);
}