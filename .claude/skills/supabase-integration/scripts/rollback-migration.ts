#!/usr/bin/env tsx
/**
 * Skill Script: Rollback Migration
 *
 * Thin wrapper around the existing migrate.ts script.
 * Returns structured output for the Skill layer.
 */

import { type ExecException, execSync } from 'node:child_process';
import { getDefaultExecOptions, isVerboseEnabled } from './utils/exec-with-error-handling.js';

// Type for execSync errors with additional diagnostic fields
interface ExecError extends ExecException {
  stdout?: Buffer | string;
  stderr?: Buffer | string;
  status?: number;
  signal?: NodeJS.Signals | string;
}

try {
  // Safety guard: require explicit opt-in to run destructive rollback
  if (process.env.ALLOW_DB_ROLLBACK !== '1') {
    console.error(
      JSON.stringify({
        success: false,
        error: 'Rollback blocked. Set ALLOW_DB_ROLLBACK=1 to proceed.',
        hint: 'Prevents accidental data loss. Ensure you are targeting a local/dev database.',
      })
    );
    process.exit(2);
  }

  const VERBOSE = isVerboseEnabled();

  // Call existing script with configurable timeout and buffer
  const output = execSync('tsx scripts/db/migrate.ts rollback', getDefaultExecOptions());

  console.log(
    JSON.stringify({
      success: true,
      message: 'Database rolled back successfully',
      warning: 'All data in local database was reset',
      output: VERBOSE ? output : undefined,
      nextSteps: ['Verify schema state', 'Re-apply migrations if needed'],
    })
  );
} catch (error) {
  const VERBOSE = isVerboseEnabled();
  const execError = error as ExecError;
  console.error(
    JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: typeof execError.status === 'number' ? execError.status : undefined,
      code: execError.code,
      signal: execError.signal,
      stdout: VERBOSE && execError.stdout ? String(execError.stdout) : undefined,
      stderr: VERBOSE && execError.stderr ? String(execError.stderr) : undefined,
      hint: 'Confirm target DB is local/dev before rollback.',
    })
  );
  process.exit(1);
}
