#!/usr/bin/env tsx
/**
 * Skill Script: Generate Types
 *
 * Generates TypeScript types from Supabase schema.
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

  // Call existing type generation with configurable timeout and buffer
  const output = execSync('pnpm db:types', getDefaultExecOptions());

  console.log(
    JSON.stringify({
      success: true,
      message: 'TypeScript types generated successfully',
      output: VERBOSE ? output : undefined,
      file: 'packages/db/src/types/database.types.ts',
      nextSteps: ['Review generated types', 'Commit types with migration'],
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
      hint: 'Ensure Supabase is running and migrations are applied. If pnpm is missing: corepack enable && corepack prepare pnpm@latest --activate',
    })
  );
  process.exit(1);
}
