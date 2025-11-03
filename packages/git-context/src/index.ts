/**
 * @shared/git-context
 *
 * Secure git context extraction for AI agents with defense-in-depth:
 * - Input validation (Zod)
 * - Safe command execution (spawnSync, shell: false)
 * - AI context sanitization (prompt injection prevention)
 *
 * @packageDocumentation
 */

import { getCurrentBranch } from './git-branch.js';
import { getParsedDiff } from './git-diff.js';
import { getRecentCommits } from './git-log.js';
import { getRepositoryInfo } from './git-repository.js';
import { getChangedFilesFromStatus, getGitStatus } from './git-status.js';
import { sanitizeForAIContext } from './sanitize.js';
import type { GitContext, GitContextOptions } from './types.js';
import { gitContextOptionsSchema } from './validators.js';

/**
 * Extracts comprehensive git context for AI agent injection.
 *
 * **Security features:**
 * - All inputs validated with Zod schemas
 * - All git commands executed with spawnSync (shell: false)
 * - All outputs sanitized for AI safety (prompt injection prevention)
 * - Sequential execution optimized for performance (<500ms target)
 *
 * **Includes:**
 * - Repository info (root, remote, clean status)
 * - Branch info (current, upstream, ahead/behind)
 * - Working directory status (staged, modified, untracked, deleted)
 * - Recent commits (default: 10)
 * - Parsed diff (unified format)
 * - Changed files list
 *
 * @param options - Optional configuration
 * @returns Complete git context
 * @throws {Error} If not in a git repository or git commands fail
 *
 * @example
 * ```typescript
 * const context = getGitContext({ maxCommits: 5, sanitizeForAI: true });
 * console.log(context.branch.current); // 'main'
 * console.log(context.status.staged); // ['src/index.ts']
 * console.log(`${context.diff.stats.additions} additions`);
 * ```
 *
 * @example
 * ```typescript
 * // Use in sub-agent prompt injection
 * const context = getGitContext();
 * const prompt = `You are a code reviewer. Context:\n${JSON.stringify(context)}`;
 * ```
 */
export function getGitContext(options?: GitContextOptions): GitContext {
  // Validate inputs as promised in documentation
  const validatedOptions = options ? gitContextOptionsSchema.parse(options) : undefined;

  const maxCommits = validatedOptions?.maxCommits ?? 10;
  const diffContext = validatedOptions?.diffContext ?? 3;
  const includeUntracked = validatedOptions?.includeUntracked ?? true;
  const sanitizeForAI = validatedOptions?.sanitizeForAI ?? true;

  // Execute all operations sequentially (synchronous spawnSync calls)
  // Target: <500ms total execution time
  // Note: Pass sanitize: false to avoid redundant sanitization
  // (sanitizeForAIContext at the end handles all sanitization)
  const repository = getRepositoryInfo({ sanitize: false });
  const branch = getCurrentBranch();
  const status = getGitStatus({ includeUntracked });
  const recentCommits = getRecentCommits({ limit: maxCommits, sanitize: false });
  const diff = getParsedDiff({ context: diffContext });

  // Extract changed files from status (avoids duplicate git status call)
  const changedFiles = getChangedFilesFromStatus(status);

  // Assemble context
  const context: GitContext = {
    repository,
    branch,
    status,
    recentCommits,
    diff,
    changedFiles,
  };

  // Apply AI sanitization if enabled
  return sanitizeForAI ? sanitizeForAIContext(context) : context;
}

export type { GitCommandResult } from './exec-safe.js';
// Export safe execution utilities
export { execGitSafe, execGitSafeDetailed, sanitizeError } from './exec-safe.js';
export {
  getCurrentBranch,
  getCurrentBranchName,
  getUpstreamBranch,
  isTrackingUpstream,
} from './git-branch.js';
export { getDiffFileCount, getDiffStats, getParsedDiff } from './git-diff.js';
export { getCommitsSince, getLatestCommit, getRecentCommits } from './git-log.js';

// Export git operations
export { findGitRoot, getRemoteURL, getRepositoryInfo, isInsideGitRepo } from './git-repository.js';
export { getChangedFiles, getGitStatus, isWorkingDirectoryClean } from './git-status.js';
// Export sanitization utilities (AI safety)
export {
  sanitizeCommitMessage,
  sanitizeFilePath,
  sanitizeForAIContext,
  sanitizeRemoteURL,
} from './sanitize.js';
// Export types
export type {
  BranchInfo,
  ChangedFile,
  Commit,
  DiffFile,
  DiffHunk,
  DiffStats,
  GitContext,
  GitContextOptions,
  GitStatus,
  ParsedDiff,
  RepositoryInfo,
} from './types.js';
// Export validators
export {
  branchNameSchema,
  commitHashSchema,
  filePathSchema,
  gitArgsSchema,
  gitContextOptionsSchema,
  nonNegativeIntegerSchema,
  positiveIntegerSchema,
  remoteUrlSchema,
  shortCommitHashSchema,
} from './validators.js';
