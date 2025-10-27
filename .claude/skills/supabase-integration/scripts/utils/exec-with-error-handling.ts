/**
 * Shared utility for executing shell commands with structured error handling
 * across all Supabase migration scripts.
 *
 * Environment Variables:
 * - SKILL_EXEC_TIMEOUT_MS: Command timeout in milliseconds (default: 120000)
 * - SKILL_EXEC_MAX_BUFFER: Max buffer size in bytes (default: 10MB)
 * - SKILL_VERBOSE: Enable verbose output (1|true) for stdout/stderr
 */

import { type ExecSyncOptions, execSync } from 'node:child_process';

export interface ExecError {
  message: string;
  status?: number;
  code?: number;
  signal?: NodeJS.Signals | string;
  stdout?: string;
  stderr?: string;
}

/**
 * Get default exec options with configurable timeout and buffer size
 */
export function getDefaultExecOptions(): ExecSyncOptions {
  const TIMEOUT_MS = Number(process.env.SKILL_EXEC_TIMEOUT_MS ?? 120_000);
  const MAX_BUFFER = Number(process.env.SKILL_EXEC_MAX_BUFFER ?? 10 * 1024 * 1024);

  return {
    encoding: 'utf-8',
    cwd: process.cwd(),
    timeout: TIMEOUT_MS,
    maxBuffer: MAX_BUFFER,
  };
}

/**
 * Check if verbose output is enabled
 */
export function isVerboseEnabled(): boolean {
  return /^(1|true)$/i.test(process.env.SKILL_VERBOSE ?? '');
}

/**
 * Execute command with structured error handling
 */
export function execWithStructuredError(
  command: string,
  options: ExecSyncOptions,
  hint?: string
): string {
  try {
    return execSync(command, options).toString();
  } catch (error) {
    const VERBOSE = isVerboseEnabled();
    const execError: ExecError & { success: false; hint?: string } = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    // Add exit status if available
    if (typeof (error as any)?.status === 'number') {
      execError.status = (error as any).status;
    }

    // Add error code if available
    if (typeof (error as any)?.code === 'number') {
      execError.code = (error as any).code;
    }

    // Add signal if available
    if ((error as any)?.signal) {
      execError.signal = (error as any).signal;
    }

    // Add stdout if available and verbose is enabled
    if (VERBOSE && (error as any)?.stdout) {
      execError.stdout = String((error as any).stdout);
    }

    // Add stderr if available and verbose is enabled
    if (VERBOSE && (error as any)?.stderr) {
      execError.stderr = String((error as any).stderr);
    }

    // Add hint if provided
    if (hint) {
      execError.hint = hint;
    }

    console.error(JSON.stringify(execError));
    process.exit(1);
  }
}
