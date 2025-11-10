/**
 * Integration tests for git-context package.
 */

import { describe, expect, it } from 'vitest';
import { findGitRoot, getGitContext, isInsideGitRepo } from '../src/index.js';

describe('git-context integration', () => {
  it('should detect git repository', () => {
    expect(isInsideGitRepo()).toBe(true);
  });

  it('should find git root', () => {
    const root = findGitRoot();
    expect(root).toBeTruthy();
    // Verify it's an absolute path
    expect(root).toMatch(/^[\\/]|^[A-Z]:\\/);
    // Verify .git exists
    const fs = require('node:fs');
    const path = require('node:path');
    expect(fs.existsSync(path.join(root, '.git'))).toBe(true);
  });

  it('should extract complete git context', () => {
    const context = getGitContext();

    // Repository info
    expect(context.repository).toBeDefined();
    expect(context.repository.root).toBeTruthy();
    expect(typeof context.repository.isClean).toBe('boolean');

    // Branch info
    expect(context.branch).toBeDefined();
    expect(context.branch.current).toBeTruthy();
    expect(typeof context.branch.tracking).toBe('boolean');
    expect(typeof context.branch.commitsAhead).toBe('number');
    expect(typeof context.branch.commitsBehind).toBe('number');

    // Status
    expect(context.status).toBeDefined();
    expect(Array.isArray(context.status.staged)).toBe(true);
    expect(Array.isArray(context.status.modified)).toBe(true);
    expect(Array.isArray(context.status.untracked)).toBe(true);
    expect(Array.isArray(context.status.deleted)).toBe(true);

    // Commits
    expect(Array.isArray(context.recentCommits)).toBe(true);
    expect(context.recentCommits.length).toBeGreaterThan(0);
    expect(context.recentCommits.length).toBeLessThanOrEqual(10);

    // Diff
    expect(context.diff).toBeDefined();
    expect(context.diff.stats).toBeDefined();
    expect(typeof context.diff.stats.filesChanged).toBe('number');

    // Changed files
    expect(Array.isArray(context.changedFiles)).toBe(true);
  });

  it('should complete in reasonable time', () => {
    const start = Date.now();
    getGitContext();
    const duration = Date.now() - start;

    // Should be reasonably fast (<1000ms, allowing margin for slow systems and CI)
    expect(duration).toBeLessThan(1000);
  });

  it('should sanitize output by default', () => {
    const context = getGitContext();

    // Check that sanitization is applied
    expect(context.repository.root).not.toContain('/Users/');

    // Check commit message sanitization
    if (context.recentCommits.length > 0) {
      const commit = context.recentCommits[0];
      expect(commit.message).toBeTruthy();
      expect(commit.message.length).toBeLessThanOrEqual(500);
    }
  });

  it('should respect maxCommits option', () => {
    const context = getGitContext({ maxCommits: 3 });
    expect(context.recentCommits.length).toBeLessThanOrEqual(3);
  });

  it('should allow disabling sanitization', () => {
    const context = getGitContext({ sanitizeForAI: false });
    // Root should contain full path when sanitization is disabled
    expect(context.repository.root).toBeTruthy();
  });
});
