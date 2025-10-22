#!/usr/bin/env tsx
/**
 * Skill Script: Rollback Migration
 *
 * Thin wrapper around the existing migrate.ts script.
 * Returns structured output for the Skill layer.
 */

import { execSync } from 'child_process';

try {
  // Call existing script
  execSync(
    'tsx scripts/db/migrate.ts rollback',
    { encoding: 'utf-8', cwd: process.cwd(), stdio: 'inherit' }
  );

  console.log(JSON.stringify({
    success: true,
    message: 'Database rolled back successfully',
    warning: 'All data in local database was reset',
    nextSteps: [
      'Verify schema state',
      'Re-apply migrations if needed'
    ]
  }));
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  }));
  process.exit(1);
}