/**
 * Git status operations for working directory state.
 *
 * @module git-status
 */

import { execGitSafe } from './exec-safe.js';
import type { ChangedFile, GitStatus } from './types.js';

/**
 * Gets the current git status (staged, modified, untracked, deleted files).
 *
 * Uses `git status --porcelain` for machine-readable output.
 *
 * **Porcelain format:**
 * - `XY path` where X is staged status, Y is working tree status
 * - Status codes: M (modified), A (added), D (deleted), R (renamed), C (copied), ?? (untracked)
 *
 * @param options - Optional configuration
 * @returns Structured git status
 *
 * @example
 * ```typescript
 * const status = getGitStatus();
 * console.log(status.staged); // ['src/index.ts']
 * console.log(status.modified); // ['README.md']
 * console.log(status.untracked); // ['notes.txt']
 * ```
 */
export function getGitStatus(options?: { includeUntracked?: boolean }): GitStatus {
  const includeUntracked = options?.includeUntracked ?? true;

  // Build arguments
  const args = ['status', '--porcelain'];
  if (!includeUntracked) {
    args.push('--untracked-files=no');
  }

  const output = execGitSafe(args);

  const staged: string[] = [];
  const modified: string[] = [];
  const untracked: string[] = [];
  const deleted: string[] = [];

  // Parse porcelain format: "XY path" (X=index, Y=worktree)
  const lines = output.split('\n').filter((line) => line.trim().length > 0);

  for (const line of lines) {
    if (line.length < 4) continue; // Invalid line

    const statusCode = line.substring(0, 2);
    const filePath = line.substring(3);

    const indexStatus = statusCode[0]; // Staging area
    const workTreeStatus = statusCode[1]; // Working directory

    // Staged files (index status not space or ?)
    // Note: Staged deletions (D ) should go in 'staged', not 'deleted'
    if (indexStatus !== ' ' && indexStatus !== '?') {
      staged.push(filePath);
    }

    // Modified files (working tree status not space or ?)
    if (workTreeStatus !== ' ' && workTreeStatus !== '?') {
      if (workTreeStatus === 'D') {
        if (!deleted.includes(filePath)) {
          deleted.push(filePath);
        }
      } else {
        modified.push(filePath);
      }
    }

    // Untracked files (??)
    if (statusCode === '??') {
      untracked.push(filePath);
    }
  }

  return {
    staged,
    modified,
    untracked,
    deleted,
  };
}

/**
 * Derives changed files from an existing GitStatus object.
 * This avoids duplicate git status calls when you already have the status.
 *
 * @param status - Pre-fetched git status
 * @returns Array of changed files with status labels
 *
 * @example
 * ```typescript
 * const status = getGitStatus();
 * const files = getChangedFilesFromStatus(status);
 * files.forEach(f => console.log(`${f.status}: ${f.path}`));
 * ```
 */
export function getChangedFilesFromStatus(status: GitStatus): ChangedFile[] {
  const files: ChangedFile[] = [];

  // Add staged files
  for (const path of status.staged) {
    files.push({ path, status: 'staged' });
  }

  // Add modified files
  for (const path of status.modified) {
    files.push({ path, status: 'modified' });
  }

  // Add untracked files
  for (const path of status.untracked) {
    files.push({ path, status: 'untracked' });
  }

  // Add deleted files
  for (const path of status.deleted) {
    files.push({ path, status: 'deleted' });
  }

  return files;
}

/**
 * Extracts a flat list of changed files from git status.
 *
 * Useful for getting all files that need attention (staged, modified, untracked, deleted).
 *
 * @param options - Optional configuration
 * @returns Array of changed files with status labels
 *
 * @example
 * ```typescript
 * const files = getChangedFiles();
 * files.forEach(f => console.log(`${f.status}: ${f.path}`));
 * // staged: src/index.ts
 * // modified: README.md
 * // untracked: notes.txt
 * ```
 */
export function getChangedFiles(options?: { includeUntracked?: boolean }): ChangedFile[] {
  const status = getGitStatus(options);
  return getChangedFilesFromStatus(status);
}

/**
 * Checks if the working directory is clean (no uncommitted changes).
 *
 * @returns True if no staged, modified, or deleted files exist
 *
 * @example
 * ```typescript
 * if (isWorkingDirectoryClean()) {
 *   console.log('Ready to deploy!');
 * } else {
 *   console.log('Please commit your changes first.');
 * }
 * ```
 */
export function isWorkingDirectoryClean(): boolean {
  const status = getGitStatus({ includeUntracked: false });
  return status.staged.length === 0 && status.modified.length === 0 && status.deleted.length === 0;
}
