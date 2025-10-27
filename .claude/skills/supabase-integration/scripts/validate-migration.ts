#!/usr/bin/env tsx
/**
 * Skill Script: Validate Migration
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
  const VERBOSE = isVerboseEnabled();

  // Call existing script with configurable timeout and buffer
  const output = execSync('tsx scripts/db/migrate.ts validate', getDefaultExecOptions());

  console.log(
    JSON.stringify({
      success: true,
      output: VERBOSE ? output : undefined,
      nextSteps: [
        'Review validation report',
        'Fix any errors or warnings',
        'Run: /db apply when ready',
      ],
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
      hint: 'Check Supabase is running (supabase start)',
    })
  );
  process.exit(1);
}
