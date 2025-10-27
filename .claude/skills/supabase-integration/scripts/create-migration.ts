#!/usr/bin/env tsx
/**
 * Skill Script: Create Migration
 *
 * Thin wrapper around the existing migrate.ts script.
 * Returns structured output for the Skill layer.
 */

import { execSync } from 'node:child_process';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error(
    JSON.stringify({
      success: false,
      error: 'Migration name required',
      usage: 'tsx create-migration.ts <migration_name>',
    })
  );
  process.exit(1);
}

// Validate migration name (alphanumeric and underscores only)
if (!/^[a-zA-Z0-9_]+$/.test(migrationName)) {
  console.error(
    JSON.stringify({
      success: false,
      error: 'Migration name must contain only letters, numbers, and underscores',
    })
  );
  process.exit(1);
}

try {
  // Call existing script
  const output = execSync(`tsx scripts/db/migrate.ts create "${migrationName}"`, {
    encoding: 'utf-8',
    cwd: process.cwd(),
    timeout: 60_000, // 60s timeout
  });

  console.log(
    JSON.stringify({
      success: true,
      migrationName,
      output,
      nextSteps: ['Edit the migration file', 'Run: /db validate', 'Run: /db apply'],
    })
  );
} catch (error) {
  console.error(
    JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: typeof (error as any)?.code === 'number' ? (error as any).code : undefined,
      stderr: (error as any)?.stderr ? String((error as any).stderr) : undefined,
      migrationName,
    })
  );
  process.exit(1);
}
