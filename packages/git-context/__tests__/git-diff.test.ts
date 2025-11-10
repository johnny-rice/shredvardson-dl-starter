/**
 * Tests for git diff parsing and operations.
 *
 * @module git-diff.test
 */

import { describe, expect, it } from 'vitest';
import { getDiffFileCount, getDiffStats, getParsedDiff } from '../src/git-diff.js';

describe('getParsedDiff', () => {
  describe('basic functionality', () => {
    it('should return parsed diff structure', () => {
      const diff = getParsedDiff();
      expect(diff).toHaveProperty('files');
      expect(diff).toHaveProperty('stats');
      expect(Array.isArray(diff.files)).toBe(true);
      expect(diff.stats).toHaveProperty('filesChanged');
      expect(diff.stats).toHaveProperty('additions');
      expect(diff.stats).toHaveProperty('deletions');
    });

    it('should handle clean repository (no changes)', () => {
      const diff = getParsedDiff();
      expect(diff.files).toBeDefined();
      expect(diff.stats).toBeDefined();
      expect(typeof diff.stats.filesChanged).toBe('number');
      expect(typeof diff.stats.additions).toBe('number');
      expect(typeof diff.stats.deletions).toBe('number');
    });
  });

  describe('options', () => {
    it('should accept context option', () => {
      const diff = getParsedDiff({ context: 5 });
      expect(diff).toBeDefined();
      expect(diff.files).toBeDefined();
    });

    it('should accept staged option', () => {
      const diff = getParsedDiff({ staged: true });
      expect(diff).toBeDefined();
      expect(diff.files).toBeDefined();
    });

    it('should handle commit range options', () => {
      // Try to get diff for HEAD (may or may not have changes)
      const diff = getParsedDiff({ commitA: 'HEAD' });
      expect(diff).toBeDefined();
    });
  });

  describe('file structure validation', () => {
    it('should have correct file structure when changes exist', () => {
      const diff = getParsedDiff();

      if (diff.files.length > 0) {
        const file = diff.files[0];
        expect(file).toHaveProperty('path');
        expect(file).toHaveProperty('oldPath');
        expect(file).toHaveProperty('status');
        expect(file).toHaveProperty('additions');
        expect(file).toHaveProperty('deletions');
        expect(file).toHaveProperty('hunks');

        expect(typeof file.path).toBe('string');
        expect(['added', 'modified', 'deleted', 'renamed']).toContain(file.status);
        expect(typeof file.additions).toBe('number');
        expect(typeof file.deletions).toBe('number');
        expect(Array.isArray(file.hunks)).toBe(true);
      }
    });

    it('should have correct hunk structure when hunks exist', () => {
      const diff = getParsedDiff();

      for (const file of diff.files) {
        for (const hunk of file.hunks) {
          expect(hunk).toHaveProperty('oldStart');
          expect(hunk).toHaveProperty('oldLines');
          expect(hunk).toHaveProperty('newStart');
          expect(hunk).toHaveProperty('newLines');
          expect(hunk).toHaveProperty('lines');

          expect(typeof hunk.oldStart).toBe('number');
          expect(typeof hunk.oldLines).toBe('number');
          expect(typeof hunk.newStart).toBe('number');
          expect(typeof hunk.newLines).toBe('number');
          expect(Array.isArray(hunk.lines)).toBe(true);
        }
      }
    });
  });

  describe('stats calculation', () => {
    it('should calculate stats correctly', () => {
      const diff = getParsedDiff();

      expect(diff.stats.filesChanged).toBe(diff.files.length);

      let totalAdditions = 0;
      let totalDeletions = 0;
      for (const file of diff.files) {
        totalAdditions += file.additions;
        totalDeletions += file.deletions;
      }

      expect(diff.stats.additions).toBe(totalAdditions);
      expect(diff.stats.deletions).toBe(totalDeletions);
    });
  });
});

describe('getDiffStats', () => {
  describe('stats-only mode', () => {
    it('should return stats object', () => {
      const stats = getDiffStats();
      expect(stats).toHaveProperty('filesChanged');
      expect(stats).toHaveProperty('additions');
      expect(stats).toHaveProperty('deletions');
      expect(typeof stats.filesChanged).toBe('number');
      expect(typeof stats.additions).toBe('number');
      expect(typeof stats.deletions).toBe('number');
    });

    it('should handle clean repository', () => {
      const stats = getDiffStats();
      expect(stats.filesChanged).toBeGreaterThanOrEqual(0);
      expect(stats.additions).toBeGreaterThanOrEqual(0);
      expect(stats.deletions).toBeGreaterThanOrEqual(0);
    });

    it('should accept staged option', () => {
      const stats = getDiffStats({ staged: true });
      expect(stats).toBeDefined();
      expect(typeof stats.filesChanged).toBe('number');
    });
  });

  describe('consistency with getParsedDiff', () => {
    it('should return same stats as getParsedDiff', () => {
      const parsedDiff = getParsedDiff();
      const stats = getDiffStats();

      expect(stats.filesChanged).toBe(parsedDiff.stats.filesChanged);
      expect(stats.additions).toBe(parsedDiff.stats.additions);
      expect(stats.deletions).toBe(parsedDiff.stats.deletions);
    });
  });
});

describe('getDiffFileCount', () => {
  describe('file count', () => {
    it('should return number of changed files', () => {
      const count = getDiffFileCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should match filesChanged from getDiffStats', () => {
      const count = getDiffFileCount();
      const stats = getDiffStats();
      expect(count).toBe(stats.filesChanged);
    });

    it('should accept staged option', () => {
      const count = getDiffFileCount({ staged: true });
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('consistency', () => {
    it('should match file count from getParsedDiff', () => {
      const count = getDiffFileCount();
      const diff = getParsedDiff();
      expect(count).toBe(diff.files.length);
    });
  });
});
