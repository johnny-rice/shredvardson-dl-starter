/**
 * Git log operations for commit history.
 *
 * @module git-log
 */

import { execGitSafe } from './exec-safe.js';
import { sanitizeCommitMessage } from './sanitize.js';
import type { Commit } from './types.js';

/**
 * Delimiter used to separate commit fields in git log output.
 * Using a rare character sequence to avoid conflicts with commit messages.
 */
const FIELD_DELIMITER = '\x1E'; // ASCII Record Separator
const COMMIT_DELIMITER = '\x1F'; // ASCII Unit Separator

/**
 * Gets recent commits with metadata.
 *
 * Uses `git log --pretty=format` for structured output.
 *
 * **Format codes:**
 * - %H - Full hash (40 chars)
 * - %h - Abbreviated hash (7 chars)
 * - %an - Author name
 * - %ae - Author email
 * - %aI - Author date (ISO 8601)
 * - %s - Subject (first line)
 * - %b - Body (remaining lines)
 *
 * @param options - Optional configuration
 * @returns Array of commit objects (newest first)
 *
 * @example
 * ```typescript
 * const commits = getRecentCommits({ limit: 5, sanitize: true });
 * commits.forEach(c => {
 *   console.log(`${c.shortHash} - ${c.subject}`);
 *   console.log(`  by ${c.author} on ${c.date}`);
 * });
 * ```
 */
export function getRecentCommits(options?: {
  limit?: number;
  sanitize?: boolean;
  branch?: string;
}): Commit[] {
  const limit = options?.limit ?? 10;
  const sanitize = options?.sanitize ?? true;
  const branch = options?.branch;

  // Build format string with field delimiter
  const formatString = [
    '%H', // hash
    '%h', // shortHash
    '%an', // author
    '%ae', // email
    '%aI', // date (ISO 8601)
    '%s', // subject
    '%b', // body
  ].join(FIELD_DELIMITER);

  // Build arguments
  const args = ['log', `--pretty=format:${formatString}${COMMIT_DELIMITER}`, `-${limit}`];
  if (branch) {
    args.push(branch);
  }

  let output: string;
  try {
    output = execGitSafe(args);
  } catch (error) {
    // Empty repository or no commits
    return [];
  }

  if (!output.trim()) {
    return [];
  }

  // Parse commits
  const commitStrings = output.split(COMMIT_DELIMITER).filter((s) => s.trim().length > 0);

  const commits: Commit[] = [];

  for (const commitString of commitStrings) {
    const fields = commitString.split(FIELD_DELIMITER);

    if (fields.length < 7) {
      // Invalid commit format, skip
      continue;
    }

    const [hash, shortHash, author, email, dateStr, subject, body] = fields;

    // Parse date
    let date: Date;
    try {
      date = new Date(dateStr);
    } catch {
      // Invalid date, use current time as fallback
      date = new Date();
    }

    // Build commit object
    const commit: Commit = {
      hash,
      shortHash,
      author: sanitize ? sanitizeCommitMessage(author) : author,
      email: sanitize ? sanitizeCommitMessage(email) : email,
      date,
      message: sanitize ? sanitizeCommitMessage(subject + '\n\n' + body) : subject + '\n\n' + body,
      subject: sanitize ? sanitizeCommitMessage(subject) : subject,
      body: sanitize ? sanitizeCommitMessage(body) : body,
    };

    commits.push(commit);
  }

  return commits;
}

/**
 * Gets the most recent commit (HEAD).
 *
 * @param options - Optional configuration
 * @returns Most recent commit or null if no commits exist
 *
 * @example
 * ```typescript
 * const head = getLatestCommit();
 * if (head) {
 *   console.log(`HEAD: ${head.shortHash} - ${head.subject}`);
 * } else {
 *   console.log('No commits yet');
 * }
 * ```
 */
export function getLatestCommit(options?: { sanitize?: boolean }): Commit | null {
  const commits = getRecentCommits({ limit: 1, sanitize: options?.sanitize });
  return commits.length > 0 ? commits[0] : null;
}

/**
 * Gets commits since a specific date.
 *
 * @param since - Date to get commits since
 * @param options - Optional configuration
 * @returns Array of commits since the date
 *
 * @example
 * ```typescript
 * const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
 * const commits = getCommitsSince(lastWeek);
 * console.log(`${commits.length} commits in the last week`);
 * ```
 */
export function getCommitsSince(
  since: Date,
  options?: { sanitize?: boolean; limit?: number }
): Commit[] {
  const sanitize = options?.sanitize ?? true;
  const limit = options?.limit ?? 100;

  // Build format string
  const formatString = ['%H', '%h', '%an', '%ae', '%aI', '%s', '%b'].join(FIELD_DELIMITER);

  // Build arguments with --since
  const sinceStr = since.toISOString();
  const args = [
    'log',
    `--pretty=format:${formatString}${COMMIT_DELIMITER}`,
    `--since=${sinceStr}`,
    `-${limit}`,
  ];

  let output: string;
  try {
    output = execGitSafe(args);
  } catch (error) {
    return [];
  }

  if (!output.trim()) {
    return [];
  }

  // Parse commits (same logic as getRecentCommits)
  const commitStrings = output.split(COMMIT_DELIMITER).filter((s) => s.trim().length > 0);

  const commits: Commit[] = [];

  for (const commitString of commitStrings) {
    const fields = commitString.split(FIELD_DELIMITER);

    if (fields.length < 7) continue;

    const [hash, shortHash, author, email, dateStr, subject, body] = fields;

    let date: Date;
    try {
      date = new Date(dateStr);
    } catch {
      date = new Date();
    }

    const commit: Commit = {
      hash,
      shortHash,
      author: sanitize ? sanitizeCommitMessage(author) : author,
      email: sanitize ? sanitizeCommitMessage(email) : email,
      date,
      message: sanitize ? sanitizeCommitMessage(subject + '\n\n' + body) : subject + '\n\n' + body,
      subject: sanitize ? sanitizeCommitMessage(subject) : subject,
      body: sanitize ? sanitizeCommitMessage(body) : body,
    };

    commits.push(commit);
  }

  return commits;
}
