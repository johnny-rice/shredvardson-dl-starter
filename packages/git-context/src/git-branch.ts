/**
 * Git branch operations for branch state and tracking info.
 *
 * @module git-branch
 */

import { execGitSafe, execGitSafeDetailed } from './exec-safe.js';
import type { BranchInfo } from './types.js';

/**
 * Gets information about the current branch.
 *
 * Includes:
 * - Current branch name
 * - Upstream tracking branch
 * - Commits ahead/behind upstream
 *
 * Handles detached HEAD state gracefully (returns 'HEAD' as branch name).
 *
 * @returns Current branch information
 *
 * @example
 * ```typescript
 * const branch = getCurrentBranch();
 * console.log(branch.current); // 'main'
 * console.log(branch.upstream); // 'origin/main'
 * console.log(branch.commitsAhead); // 2
 * console.log(branch.commitsBehind); // 0
 * ```
 */
export function getCurrentBranch(): BranchInfo {
  // Get current branch name
  const currentResult = execGitSafeDetailed(['branch', '--show-current']);
  const current = currentResult.stdout.trim() || 'HEAD'; // Detached HEAD returns empty string

  // Try to get upstream branch
  let upstream: string | null = null;
  let tracking = false;
  let commitsAhead = 0;
  let commitsBehind = 0;

  try {
    // Get upstream tracking branch (e.g., 'origin/main')
    const upstreamResult = execGitSafeDetailed(['rev-parse', '--abbrev-ref', '@{u}']);

    if (upstreamResult.exitCode === 0) {
      upstream = upstreamResult.stdout.trim();
      tracking = true;

      // Get ahead/behind counts
      const countsResult = execGitSafeDetailed([
        'rev-list',
        '--left-right',
        '--count',
        `${upstream}...HEAD`,
      ]);

      if (countsResult.exitCode === 0) {
        // Output format: "behind\tahead"
        const counts = countsResult.stdout.trim().split(/\s+/);
        if (counts.length === 2) {
          commitsBehind = parseInt(counts[0], 10) || 0;
          commitsAhead = parseInt(counts[1], 10) || 0;
        }
      }
    }
  } catch (error) {
    // No upstream configured - this is not an error, just means not tracking
    // Leave upstream as null, tracking as false
  }

  return {
    current,
    upstream,
    tracking,
    commitsBehind,
    commitsAhead,
  };
}

/**
 * Gets the name of the current branch.
 *
 * Convenience function that returns just the branch name.
 *
 * @returns Branch name (e.g., 'main', 'feature/foo')
 *
 * @example
 * ```typescript
 * const branchName = getCurrentBranchName();
 * console.log(`On branch: ${branchName}`);
 * ```
 */
export function getCurrentBranchName(): string {
  return getCurrentBranch().current;
}

/**
 * Checks if the current branch is tracking an upstream branch.
 *
 * @returns True if tracking remote, false otherwise
 *
 * @example
 * ```typescript
 * if (!isTrackingUpstream()) {
 *   console.log('Warning: Not tracking a remote branch!');
 * }
 * ```
 */
export function isTrackingUpstream(): boolean {
  return getCurrentBranch().tracking;
}

/**
 * Gets the upstream tracking branch name if configured.
 *
 * @returns Upstream branch name (e.g., 'origin/main') or null if not tracking
 *
 * @example
 * ```typescript
 * const upstream = getUpstreamBranch();
 * if (upstream) {
 *   console.log(`Tracking: ${upstream}`);
 * } else {
 *   console.log('No upstream configured');
 * }
 * ```
 */
export function getUpstreamBranch(): string | null {
  return getCurrentBranch().upstream;
}
