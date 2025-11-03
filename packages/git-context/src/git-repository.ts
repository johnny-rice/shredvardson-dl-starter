/**
 * Git repository operations for repository-level information.
 *
 * @module git-repository
 */

import { execGitSafe, execGitSafeDetailed } from './exec-safe.js';
import { sanitizeRemoteURL } from './sanitize.js';
import type { RepositoryInfo } from './types.js';

/**
 * Finds the git repository root directory.
 *
 * Uses `git rev-parse --show-toplevel` to locate the root.
 *
 * @param cwd - Optional working directory (defaults to process.cwd())
 * @returns Absolute path to repository root
 * @throws {Error} If not in a git repository
 *
 * @example
 * ```typescript
 * const root = findGitRoot();
 * console.log(root); // '/Users/alice/project'
 * ```
 */
export function findGitRoot(cwd?: string): string {
  const output = execGitSafe(['rev-parse', '--show-toplevel']);
  return output.trim();
}

/**
 * Gets information about the git repository.
 *
 * Includes:
 * - Repository root path
 * - Remote origin URL (sanitized)
 * - Whether working directory is clean
 *
 * @param options - Optional configuration
 * @returns Repository information
 *
 * @example
 * ```typescript
 * const repo = getRepositoryInfo();
 * console.log(repo.root); // '/Users/alice/project'
 * console.log(repo.remote); // 'https://github.com/user/repo.git'
 * console.log(repo.isClean); // true
 * ```
 */
export function getRepositoryInfo(options?: { sanitize?: boolean }): RepositoryInfo {
  const sanitize = options?.sanitize ?? true;

  // Get repository root
  const root = findGitRoot();

  // Get remote URL (origin)
  let remote: string | null = null;
  try {
    const remoteResult = execGitSafeDetailed(['remote', 'get-url', 'origin']);
    if (remoteResult.exitCode === 0) {
      remote = remoteResult.stdout.trim();
      if (sanitize) {
        remote = sanitizeRemoteURL(remote);
      }
    }
  } catch (error) {
    // No remote configured - this is OK
    remote = null;
  }

  // Check if working directory is clean
  let isClean = false;
  try {
    const statusResult = execGitSafeDetailed(['status', '--porcelain']);
    isClean = statusResult.stdout.trim().length === 0;
  } catch (error) {
    // Assume not clean if we can't determine
    isClean = false;
  }

  return {
    root,
    remote,
    isClean,
  };
}

/**
 * Checks if the current directory is inside a git repository.
 *
 * @param cwd - Optional working directory
 * @returns True if inside a git repo, false otherwise
 *
 * @example
 * ```typescript
 * if (!isInsideGitRepo()) {
 *   console.error('Not a git repository!');
 *   process.exit(1);
 * }
 * ```
 */
export function isInsideGitRepo(cwd?: string): boolean {
  try {
    findGitRoot(cwd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the remote origin URL.
 *
 * @param options - Optional configuration
 * @returns Remote URL or null if no remote configured
 *
 * @example
 * ```typescript
 * const remote = getRemoteURL();
 * if (remote) {
 *   console.log(`Remote: ${remote}`);
 * } else {
 *   console.log('No remote configured');
 * }
 * ```
 */
export function getRemoteURL(options?: { sanitize?: boolean }): string | null {
  const sanitize = options?.sanitize ?? true;

  try {
    const output = execGitSafe(['remote', 'get-url', 'origin']);
    const url = output.trim();
    return sanitize ? sanitizeRemoteURL(url) : url;
  } catch {
    return null;
  }
}
