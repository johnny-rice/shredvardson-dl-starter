#!/usr/bin/env tsx
/**
 * Skill Script: Apply Migration
 *
 * Thin wrapper around the existing migrate.ts script.
 * Returns structured output for the Skill layer.
 */

import { execSync } from 'child_process';

try {
  // Call existing script
  execSync(
    'tsx scripts/db/migrate.ts apply',
    { encoding: 'utf-8', cwd: process.cwd(), stdio: 'inherit' }
  );

  console.log(JSON.stringify({
    success: true,
    message: 'Migration applied successfully',
    nextSteps: [
      'Test changes locally',
      'Commit migration and types',
      'Push to remote'
    ]
  }));
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    hint: 'Run /db rollback if needed'
  }));
  process.exit(1);
}