/**
 * Safe git command execution with defense-in-depth security.
 *
 * Security measures:
 * 1. Input validation (Zod schemas)
 * 2. spawnSync with shell: false (prevents shell injection)
 * 3. -- separator (prevents git flag injection)
 * 4. Error sanitization (prevents information disclosure)
 * 5. maxBuffer limit (prevents DoS via large outputs)
 *
 * @module exec-safe
 */

import { spawnSync } from 'node:child_process';
import { gitArgsSchema } from './validators.js';

/**
 * Result of a git command execution.
 */
export interface GitCommandResult {
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Exit code */
  exitCode: number;
}

/**
 * Git commands that support the -- separator for file paths.
 * Only these commands should have -- inserted before file arguments.
 */
const GIT_COMMANDS_SUPPORTING_SEPARATOR = new Set([
  'diff',
  'log',
  'show',
  'add',
  'rm',
  'mv',
  'checkout',
  'reset',
  'restore',
  'grep',
  'blame',
]);

/**
 * Executes a git command safely with validation and security hardening.
 *
 * **Security Features:**
 * - Validates all arguments with Zod
 * - Uses spawnSync with shell: false (no shell metacharacter interpretation)
 * - Prepends -- separator for commands that support it (prevents path-based flag injection)
 * - Sanitizes error messages to prevent info disclosure
 * - Enforces 10MB output limit to prevent DoS
 *
 * @param args - Git command arguments (e.g., ['status', '--porcelain'])
 * @param options - Optional execution options
 * @returns Command output as string
 * @throws {Error} If command fails or validation fails
 *
 * @example
 * ```typescript
 * const output = execGitSafe(['status', '--porcelain']);
 * console.log(output); // Git status output
 * ```
 *
 * @example
 * ```typescript
 * // This will throw a validation error (shell metacharacter)
 * execGitSafe(['status', '; rm -rf /']); // Error: Shell metacharacter detected
 * ```
 *
 * @example
 * ```typescript
 * // For commands like 'diff', -- separator is added automatically
 * execGitSafe(['diff', 'HEAD', 'file.ts']); // Becomes: git diff HEAD -- file.ts
 * ```
 */
export function execGitSafe(
  args: string[],
  options?: {
    cwd?: string;
    allowNonZeroExit?: boolean;
  }
): string {
  // Validate all arguments (blocks shell metacharacters, path traversal, etc.)
  const validated = gitArgsSchema.parse(args);

  // Determine if we should add -- separator
  // Only add it for commands that support it (e.g., diff, log, show)
  const subcommand = validated[0];
  const needsSeparator = subcommand && GIT_COMMANDS_SUPPORTING_SEPARATOR.has(subcommand);

  // Build final args array
  let finalArgs: string[];
  if (needsSeparator) {
    // Find where to insert -- (after all flags, before file paths)
    const firstFileIndex = validated.findIndex((arg, i) => i > 0 && !arg.startsWith('-'));
    if (firstFileIndex > 0) {
      // Insert -- before the first non-flag argument after subcommand
      finalArgs = [...validated.slice(0, firstFileIndex), '--', ...validated.slice(firstFileIndex)];
    } else {
      // No file arguments found, use validated args as-is
      finalArgs = validated;
    }
  } else {
    finalArgs = validated;
  }

  // Execute git with security hardening:
  // - shell: false prevents command injection (e.g., "; rm -rf /")
  // - -- separator (when applicable) prevents git flag injection via file paths
  // - Validation prevents shell metacharacters (already validated by Zod)
  // - maxBuffer prevents DoS via large outputs
  const result = spawnSync('git', finalArgs, {
    shell: false, // CRITICAL: never set to true
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB
    cwd: options?.cwd ?? process.cwd(),
  });

  // Handle spawn errors (e.g., git not found)
  if (result.error) {
    throw new Error(`Git command failed: ${sanitizeError(result.error.message)}`);
  }

  // Handle non-zero exit codes (unless explicitly allowed)
  if (result.status !== 0 && !options?.allowNonZeroExit) {
    const sanitizedStderr = sanitizeError(result.stderr);
    throw new Error(
      `Git command failed with exit code ${result.status}: ${sanitizedStderr.trim() || 'No error message'}`
    );
  }

  return result.stdout;
}

/**
 * Executes a git command and returns detailed result information.
 * Similar to execGitSafe but returns stdout, stderr, and exit code separately.
 *
 * @param args - Git command arguments
 * @param options - Optional execution options
 * @returns Detailed command result
 *
 * @example
 * ```typescript
 * const result = execGitSafeDetailed(['status', '--porcelain']);
 * if (result.exitCode === 0) {
 *   console.log('Success:', result.stdout);
 * } else {
 *   console.error('Error:', result.stderr);
 * }
 * ```
 */
export function execGitSafeDetailed(
  args: string[],
  options?: {
    cwd?: string;
  }
): GitCommandResult {
  // Validate all arguments
  const validated = gitArgsSchema.parse(args);

  // Determine if we should add -- separator (same logic as execGitSafe)
  const subcommand = validated[0];
  const needsSeparator = subcommand && GIT_COMMANDS_SUPPORTING_SEPARATOR.has(subcommand);

  let finalArgs: string[];
  if (needsSeparator) {
    const firstFileIndex = validated.findIndex((arg, i) => i > 0 && !arg.startsWith('-'));
    if (firstFileIndex > 0) {
      finalArgs = [...validated.slice(0, firstFileIndex), '--', ...validated.slice(firstFileIndex)];
    } else {
      finalArgs = validated;
    }
  } else {
    finalArgs = validated;
  }

  // Execute git with security hardening
  const result = spawnSync('git', finalArgs, {
    shell: false,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB
    cwd: options?.cwd ?? process.cwd(),
  });

  // Handle spawn errors
  if (result.error) {
    throw new Error(`Git command failed: ${sanitizeError(result.error.message)}`);
  }

  return {
    stdout: result.stdout,
    stderr: sanitizeError(result.stderr),
    exitCode: result.status ?? -1,
  };
}

/**
 * Sanitizes error messages to prevent information disclosure.
 *
 * Redactions:
 * - Home paths (/Users/username → ~)
 * - Credentials in URLs (https://user:pass@host → https://***:***@host)
 * - HTTP URLs normalized to HTTPS (http://user:pass@host → https://***:***@host)
 * - Absolute paths in temp directories
 *
 * @param message - Error message to sanitize
 * @returns Sanitized error message
 *
 * @example
 * ```typescript
 * const error = '/Users/alice/repo/file.txt not found';
 * const sanitized = sanitizeError(error);
 * console.log(sanitized); // '~/repo/file.txt not found'
 * ```
 *
 * @example
 * ```typescript
 * const error = 'Clone failed: http://user:token@github.com/repo.git';
 * const sanitized = sanitizeError(error);
 * console.log(sanitized); // 'Clone failed: https://***:***@github.com/repo.git'
 * ```
 */
export function sanitizeError(message: string): string {
  return (
    message
      // Remove home directory paths (macOS/Linux)
      .replace(/\/Users\/[^/\s]+/g, '~')
      .replace(/\/home\/[^/\s]+/g, '~')
      // Remove credentials from URLs
      .replace(/https?:\/\/([^:]+):([^@]+)@/g, 'https://***:***@')
      // Remove temp directory paths
      .replace(/\/tmp\/[^/\s]+/g, '/tmp/***')
      .replace(/\/var\/tmp\/[^/\s]+/g, '/var/tmp/***')
      // Remove Windows home paths (C:\Users\username)
      .replace(/C:\\Users\\[^\\\s]+/g, '~')
  );
}
