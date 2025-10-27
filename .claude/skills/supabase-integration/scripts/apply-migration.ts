#!/usr/bin/env tsx
/**
 * Skill Script: Apply Migration
 *
 * Thin wrapper around the existing migrate.ts script.
 * Returns structured output for the Skill layer.
 */

import { type ExecException, execSync } from 'node:child_process';

// Type for execSync errors with additional diagnostic fields
interface ExecError extends ExecException {
  stdout?: Buffer | string;
  stderr?: Buffer | string;
  status?: number;
}

try {
  // Call existing script with timeout and capture output
  const output = execSync('tsx scripts/db/migrate.ts apply', {
    encoding: 'utf-8',
    cwd: process.cwd(),
    timeout: 60_000, // 60s timeout
  });

  console.log(
    JSON.stringify({
      success: true,
      message: 'Migration applied successfully',
      output,
      nextSteps: ['Test changes locally', 'Commit migration and types', 'Push to remote'],
    })
  );
} catch (error) {
  const execError = error as ExecError;
  console.error(
    JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: typeof execError.status === 'number' ? execError.status : undefined,
      code: execError.code,
      stdout: execError.stdout ? String(execError.stdout) : undefined,
      stderr: execError.stderr ? String(execError.stderr) : undefined,
      hint: 'Run /db rollback if needed',
    })
  );
  process.exit(1);
}
