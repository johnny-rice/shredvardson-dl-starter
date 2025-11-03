/**
 * Input validation schemas for security boundary.
 * Prevents command injection, argument injection, and path traversal.
 *
 * @module validators
 */

import path from 'path';
import { z } from 'zod';

/**
 * Validates file paths to prevent path traversal and flag injection.
 *
 * Security validations:
 * - No path traversal sequences (..)
 * - No flag injection (leading -)
 * - No null bytes
 *
 * @example
 * ```typescript
 * filePathSchema.parse('src/index.ts'); // OK
 * filePathSchema.parse('../etc/passwd'); // Error: Path traversal detected
 * filePathSchema.parse('--upload-pack'); // Error: Flag injection detected
 * ```
 */
export const filePathSchema = z
  .string()
  .min(1, 'File path cannot be empty')
  .refine((filePath) => !path.isAbsolute(filePath), 'Absolute paths not allowed')
  .refine((filePath) => {
    const normalized = path.normalize(filePath);
    return !normalized.includes('..');
  }, 'Path traversal detected')
  .refine((filePath) => !filePath.startsWith('-'), 'Flag injection detected')
  .refine((filePath) => !filePath.includes('\0'), 'Null byte injection detected');

/**
 * Validates git branch names.
 *
 * Allowed characters: a-z, A-Z, 0-9, /, _, -, .
 * Blocks: consecutive dots (..), .lock suffix
 *
 * @example
 * ```typescript
 * branchNameSchema.parse('main'); // OK
 * branchNameSchema.parse('feature/foo'); // OK
 * branchNameSchema.parse('release/v1.2.3'); // OK
 * branchNameSchema.parse('$(whoami)'); // Error: Invalid branch name
 * branchNameSchema.parse('feature..test'); // Error: Branch name cannot contain ".."
 * ```
 */
export const branchNameSchema = z
  .string()
  .min(1, 'Branch name cannot be empty')
  .max(255, 'Branch name too long')
  .regex(/^[a-zA-Z0-9/_.-]+$/, 'Invalid branch name (only alphanumeric, /, _, -, . allowed)')
  .refine((name) => !name.includes('..'), 'Branch name cannot contain ".."')
  .refine((name) => !name.endsWith('.lock'), 'Branch name cannot end with ".lock"');

/**
 * Validates git commit hashes (SHA-1 or SHA-256).
 *
 * Accepts 40 hex characters (SHA-1) or 64 hex characters (SHA-256).
 *
 * @example
 * ```typescript
 * commitHashSchema.parse('a'.repeat(40)); // OK (SHA-1)
 * commitHashSchema.parse('a'.repeat(64)); // OK (SHA-256)
 * commitHashSchema.parse('not-a-hash'); // Error: Invalid commit hash
 * commitHashSchema.parse('abc123'); // Error: Invalid commit hash
 * ```
 */
export const commitHashSchema = z
  .string()
  .refine(
    (hash) => /^[a-f0-9]{40}$/.test(hash) || /^[a-f0-9]{64}$/.test(hash),
    'Invalid commit hash (must be 40-character SHA-1 or 64-character SHA-256)'
  );

/**
 * Validates git short commit hashes (abbreviated SHA-1).
 *
 * Must be 7-40 hexadecimal characters.
 *
 * @example
 * ```typescript
 * shortCommitHashSchema.parse('abc1234'); // OK
 * shortCommitHashSchema.parse('a'.repeat(40)); // OK
 * shortCommitHashSchema.parse('xyz'); // Error: Too short
 * ```
 */
export const shortCommitHashSchema = z
  .string()
  .min(7, 'Short commit hash must be at least 7 characters')
  .max(40, 'Short commit hash too long')
  .regex(/^[a-f0-9]+$/, 'Invalid short commit hash (must be hexadecimal)');

/**
 * Validates git remote URLs.
 *
 * Supports https://, ssh://, git@ (SCP-style), and file:// protocols.
 * Note: http:// is allowed for local/testing scenarios but not recommended for production.
 *
 * @example
 * ```typescript
 * remoteUrlSchema.parse('https://github.com/user/repo.git'); // OK
 * remoteUrlSchema.parse('git@github.com:user/repo.git'); // OK
 * remoteUrlSchema.parse('ssh://git@github.com/user/repo.git'); // OK
 * remoteUrlSchema.parse('javascript:alert(1)'); // Error: Invalid URL protocol
 * ```
 */
export const remoteUrlSchema = z
  .string()
  .min(1, 'Remote URL cannot be empty')
  .regex(
    /^(https?:\/\/|ssh:\/\/|git@|file:\/\/)/,
    'Invalid remote URL protocol (must be https://, ssh://, git@, or file://)'
  );

/**
 * Validates positive integers (for counts, limits, line numbers).
 *
 * @example
 * ```typescript
 * positiveIntegerSchema.parse(10); // OK
 * positiveIntegerSchema.parse(-1); // Error: Must be positive
 * positiveIntegerSchema.parse(0); // Error: Must be positive
 * ```
 */
export const positiveIntegerSchema = z.number().int().positive('Must be a positive integer');

/**
 * Validates non-negative integers (for counts that can be zero).
 *
 * @example
 * ```typescript
 * nonNegativeIntegerSchema.parse(0); // OK
 * nonNegativeIntegerSchema.parse(10); // OK
 * nonNegativeIntegerSchema.parse(-1); // Error: Must be non-negative
 * ```
 */
export const nonNegativeIntegerSchema = z
  .number()
  .int()
  .nonnegative('Must be a non-negative integer');

/**
 * Validates git context options.
 */
export const gitContextOptionsSchema = z
  .object({
    includeUntracked: z.boolean().optional(),
    maxCommits: positiveIntegerSchema.optional(),
    diffContext: nonNegativeIntegerSchema.optional(),
    sanitizeForAI: z.boolean().optional(),
  })
  .optional();

/**
 * Validates an array of git arguments.
 * Ensures no shell metacharacters or dangerous patterns.
 *
 * @example
 * ```typescript
 * gitArgsSchema.parse(['status', '--porcelain']); // OK
 * gitArgsSchema.parse(['status', '; rm -rf /']); // Error: Shell metacharacter detected
 * ```
 */
export const gitArgsSchema = z.array(
  z.string().refine(
    (arg) => {
      // Block shell metacharacters
      const dangerousChars = /[;&|`$()<>]/;
      return !dangerousChars.test(arg);
    },
    { message: 'Shell metacharacter detected in git argument' }
  )
);
