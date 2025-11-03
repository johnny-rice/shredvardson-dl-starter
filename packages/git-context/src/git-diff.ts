/**
 * Git diff operations for parsing unified diff format.
 *
 * @module git-diff
 */

import { execGitSafe } from './exec-safe.js';
import type { DiffFile, DiffHunk, DiffStats, ParsedDiff } from './types.js';

/**
 * Parses git diff output into structured format.
 *
 * Supports:
 * - Added files
 * - Modified files
 * - Deleted files
 * - Renamed files
 * - Binary files (detected, hunks empty)
 *
 * @param options - Optional configuration
 * @returns Parsed diff with files, hunks, and statistics
 *
 * @example
 * ```typescript
 * const diff = getParsedDiff({ context: 3 });
 * console.log(`${diff.stats.filesChanged} files changed`);
 * console.log(`+${diff.stats.additions} -${diff.stats.deletions}`);
 * ```
 */
export function getParsedDiff(options?: {
  context?: number;
  staged?: boolean;
  commitA?: string;
  commitB?: string;
}): ParsedDiff {
  const context = options?.context ?? 3;
  const staged = options?.staged ?? false;

  // Build arguments
  const args = ['diff', '--no-color', `--unified=${context}`, '--patch'];

  if (staged) {
    args.push('--cached'); // Diff staged changes
  }

  if (options?.commitA && options?.commitB) {
    args.push(`${options.commitA}..${options.commitB}`);
  } else if (options?.commitA) {
    args.push(options.commitA);
  }

  let output: string;
  try {
    output = execGitSafe(args);
  } catch (error) {
    // No diff (clean repo or no changes)
    return {
      files: [],
      stats: { filesChanged: 0, additions: 0, deletions: 0 },
    };
  }

  if (!output.trim()) {
    return {
      files: [],
      stats: { filesChanged: 0, additions: 0, deletions: 0 },
    };
  }

  // Parse diff
  const files = parseDiffOutput(output);

  // Calculate stats
  const stats = calculateDiffStats(files);

  return { files, stats };
}

/**
 * Parses unified diff output into DiffFile array.
 *
 * Unified diff format:
 * ```
 * diff --git a/file.txt b/file.txt
 * index abc123..def456 100644
 * --- a/file.txt
 * +++ b/file.txt
 * @@ -1,3 +1,4 @@
 *  line1
 * +line2
 *  line3
 * ```
 */
function parseDiffOutput(output: string): DiffFile[] {
  const files: DiffFile[] = [];
  const lines = output.split('\n');

  let currentFile: DiffFile | null = null;
  let currentHunk: DiffHunk | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // File header: diff --git a/path b/path
    if (line.startsWith('diff --git ')) {
      // Save previous file
      if (currentFile && currentHunk) {
        currentFile.hunks.push(currentHunk);
        files.push(currentFile);
      }

      // Parse file paths from: diff --git a/src/file.ts b/src/file.ts
      const match = line.match(/diff --git a\/(.+?) b\/(.+)$/);
      if (match) {
        const oldPath = match[1];
        const newPath = match[2];

        currentFile = {
          path: newPath,
          oldPath: oldPath !== newPath ? oldPath : null,
          status: 'modified',
          additions: 0,
          deletions: 0,
          hunks: [],
        };
        currentHunk = null;
      }
      continue;
    }

    // New file: new file mode
    if (line.startsWith('new file mode') && currentFile) {
      currentFile.status = 'added';
      currentFile.oldPath = null;
      continue;
    }

    // Deleted file: deleted file mode
    if (line.startsWith('deleted file mode') && currentFile) {
      currentFile.status = 'deleted';
      continue;
    }

    // Renamed file: rename from / rename to
    if (line.startsWith('rename from') && currentFile) {
      currentFile.status = 'renamed';
      continue;
    }

    // Binary file: Binary files differ
    if (line.startsWith('Binary files') && currentFile) {
      // Binary files have no hunks
      currentFile.hunks = [];
      files.push(currentFile);
      currentFile = null;
      continue;
    }

    // Hunk header: @@ -1,3 +1,4 @@
    if (line.startsWith('@@') && currentFile) {
      // Save previous hunk
      if (currentHunk) {
        currentFile.hunks.push(currentHunk);
      }

      // Parse hunk header: @@ -oldStart,oldLines +newStart,newLines @@
      const hunkMatch = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (hunkMatch) {
        currentHunk = {
          oldStart: parseInt(hunkMatch[1], 10),
          oldLines: parseInt(hunkMatch[2] ?? '1', 10),
          newStart: parseInt(hunkMatch[3], 10),
          newLines: parseInt(hunkMatch[4] ?? '1', 10),
          lines: [],
        };
      }
      continue;
    }

    // Hunk content (starts with +, -, or space)
    if (currentHunk && currentFile && (line[0] === '+' || line[0] === '-' || line[0] === ' ')) {
      currentHunk.lines.push(line);

      // Update file stats
      if (line[0] === '+') {
        currentFile.additions++;
      } else if (line[0] === '-') {
        currentFile.deletions++;
      }
    }
  }

  // Save last file
  if (currentFile) {
    if (currentHunk) {
      currentFile.hunks.push(currentHunk);
    }
    files.push(currentFile);
  }

  return files;
}

/**
 * Calculates aggregate statistics from parsed diff files.
 */
function calculateDiffStats(files: DiffFile[]): DiffStats {
  let additions = 0;
  let deletions = 0;

  for (const file of files) {
    additions += file.additions;
    deletions += file.deletions;
  }

  return {
    filesChanged: files.length,
    additions,
    deletions,
  };
}

/**
 * Gets diff statistics only (no hunks).
 *
 * Faster than getParsedDiff if you only need counts.
 *
 * @param options - Optional configuration
 * @returns Diff statistics
 *
 * @example
 * ```typescript
 * const stats = getDiffStats();
 * console.log(`${stats.filesChanged} files, +${stats.additions} -${stats.deletions}`);
 * ```
 */
export function getDiffStats(options?: { staged?: boolean }): DiffStats {
  const staged = options?.staged ?? false;

  // Use --numstat for faster stats-only output
  const args = ['diff', '--numstat'];
  if (staged) {
    args.push('--cached');
  }

  let output: string;
  try {
    output = execGitSafe(args);
  } catch (error) {
    return { filesChanged: 0, additions: 0, deletions: 0 };
  }

  if (!output.trim()) {
    return { filesChanged: 0, additions: 0, deletions: 0 };
  }

  // Parse --numstat output: "additions\tdeletions\tfilename"
  const lines = output.split('\n').filter((l) => l.trim().length > 0);
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const additions = parseInt(parts[0], 10);
      const deletions = parseInt(parts[1], 10);

      // Binary files show "-" instead of numbers
      if (!isNaN(additions)) totalAdditions += additions;
      if (!isNaN(deletions)) totalDeletions += deletions;
    }
  }

  return {
    filesChanged: lines.length,
    additions: totalAdditions,
    deletions: totalDeletions,
  };
}

/**
 * Gets a simple summary of changes (files changed count).
 *
 * @param options - Optional configuration
 * @returns Number of files changed
 *
 * @example
 * ```typescript
 * const count = getDiffFileCount();
 * console.log(`${count} files changed`);
 * ```
 */
export function getDiffFileCount(options?: { staged?: boolean }): number {
  return getDiffStats(options).filesChanged;
}
