/**
 * Type definitions for git context extraction.
 *
 * @module types
 */

/**
 * Complete git context for AI agent injection.
 * Includes repository info, branch state, file changes, commits, and diffs.
 */
export interface GitContext {
  repository: RepositoryInfo;
  branch: BranchInfo;
  status: GitStatus;
  recentCommits: Commit[];
  diff: ParsedDiff;
  changedFiles: ChangedFile[];
}

/**
 * Repository-level information.
 */
export interface RepositoryInfo {
  /** Absolute path to repository root */
  root: string;
  /** Origin URL with credentials removed for AI safety */
  remote: string | null;
  /** True if working directory is clean (no uncommitted changes) */
  isClean: boolean;
}

/**
 * Branch state and tracking information.
 */
export interface BranchInfo {
  /** Current branch name (e.g., 'main', 'feature/foo') */
  current: string;
  /** Upstream tracking branch (e.g., 'origin/main'), null if not tracking */
  upstream: string | null;
  /** True if branch has an upstream configured */
  tracking: boolean;
  /** Number of commits behind upstream (0 if up-to-date or not tracking) */
  commitsBehind: number;
  /** Number of commits ahead of upstream (0 if up-to-date or not tracking) */
  commitsAhead: number;
}

/**
 * Working directory status (porcelain format parsed).
 */
export interface GitStatus {
  /** Files staged for commit */
  staged: string[];
  /** Modified files not staged */
  modified: string[];
  /** Untracked files */
  untracked: string[];
  /** Deleted files */
  deleted: string[];
}

/**
 * Single commit metadata.
 */
export interface Commit {
  /** Full SHA-1 hash (40 characters) */
  hash: string;
  /** Abbreviated SHA-1 hash (7 characters) */
  shortHash: string;
  /** Author name (sanitized) */
  author: string;
  /** Author email (sanitized) */
  email: string;
  /** Commit timestamp */
  date: Date;
  /** Full commit message (sanitized for AI context) */
  message: string;
  /** First line of commit message (sanitized) */
  subject: string;
  /** Body of commit message (sanitized) */
  body: string;
}

/**
 * Parsed git diff with files and statistics.
 */
export interface ParsedDiff {
  /** List of changed files with hunks */
  files: DiffFile[];
  /** Aggregate statistics */
  stats: DiffStats;
}

/**
 * Single file in a diff.
 */
export interface DiffFile {
  /** Current file path */
  path: string;
  /** Original path for renames, null otherwise */
  oldPath: string | null;
  /** Type of change */
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  /** Lines added */
  additions: number;
  /** Lines deleted */
  deletions: number;
  /** Hunks (contiguous changed regions) */
  hunks: DiffHunk[];
}

/**
 * Single hunk in a diff (contiguous changed region).
 */
export interface DiffHunk {
  /** Starting line in old file */
  oldStart: number;
  /** Number of lines in old file */
  oldLines: number;
  /** Starting line in new file */
  newStart: number;
  /** Number of lines in new file */
  newLines: number;
  /** Diff lines (prefixed with +, -, or space) */
  lines: string[];
}

/**
 * Aggregate diff statistics.
 */
export interface DiffStats {
  /** Total files changed */
  filesChanged: number;
  /** Total lines added across all files */
  additions: number;
  /** Total lines deleted across all files */
  deletions: number;
}

/**
 * Simplified changed file representation.
 */
export interface ChangedFile {
  /** File path relative to repository root */
  path: string;
  /** File status */
  status: 'staged' | 'modified' | 'untracked' | 'deleted';
}

/**
 * Configuration options for getGitContext().
 *
 * @example
 * ```typescript
 * const context = await getGitContext({
 *   includeUntracked: false,
 *   maxCommits: 5,
 *   diffContext: 3,
 *   sanitizeForAI: true,
 * });
 * ```
 */
export interface GitContextOptions {
  /**
   * Include untracked files in status.
   * @default true
   */
  includeUntracked?: boolean;

  /**
   * Maximum number of recent commits to fetch.
   * @default 10
   */
  maxCommits?: number;

  /**
   * Number of context lines around changes in diffs.
   * @default 3
   */
  diffContext?: number;

  /**
   * Apply AI safety sanitization (prompt injection prevention).
   * @default true
   */
  sanitizeForAI?: boolean;
}
