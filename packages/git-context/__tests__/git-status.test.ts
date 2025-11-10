/**
 * Tests for git status parsing and operations.
 *
 * @module git-status.test
 */

import { describe, expect, it } from 'vitest';
import {
  getChangedFiles,
  getChangedFilesFromStatus,
  getGitStatus,
  isWorkingDirectoryClean,
} from '../src/git-status.js';

describe('getGitStatus', () => {
  describe('basic functionality', () => {
    it('should return status object with all fields', () => {
      const status = getGitStatus();
      expect(status).toHaveProperty('staged');
      expect(status).toHaveProperty('modified');
      expect(status).toHaveProperty('untracked');
      expect(status).toHaveProperty('deleted');
      expect(Array.isArray(status.staged)).toBe(true);
      expect(Array.isArray(status.modified)).toBe(true);
      expect(Array.isArray(status.untracked)).toBe(true);
      expect(Array.isArray(status.deleted)).toBe(true);
    });

    it('should include untracked files by default', () => {
      const status = getGitStatus();
      // Just verify it doesn't throw and returns valid structure
      expect(status).toBeDefined();
    });

    it('should exclude untracked files when option is false', () => {
      const status = getGitStatus({ includeUntracked: false });
      expect(status).toBeDefined();
      expect(Array.isArray(status.untracked)).toBe(true);
      // When includeUntracked is false, untracked should be empty
      expect(status.untracked).toHaveLength(0);
    });
  });

  describe('status detection', () => {
    it('should detect current repository status', () => {
      const status = getGitStatus();
      // Repository might have changes or not - we just verify structure
      if (status.staged.length > 0) {
        expect(typeof status.staged[0]).toBe('string');
      }
      if (status.modified.length > 0) {
        expect(typeof status.modified[0]).toBe('string');
      }
      if (status.untracked.length > 0) {
        expect(typeof status.untracked[0]).toBe('string');
      }
      if (status.deleted.length > 0) {
        expect(typeof status.deleted[0]).toBe('string');
      }
    });
  });
});

describe('getChangedFilesFromStatus', () => {
  describe('file aggregation', () => {
    it('should aggregate all changed files with correct status', () => {
      const status = {
        staged: ['file1.ts', 'file2.ts'],
        modified: ['file3.ts'],
        untracked: ['file4.ts'],
        deleted: ['file5.ts'],
      };

      const files = getChangedFilesFromStatus(status);

      expect(files).toHaveLength(5);
      expect(files.find((f) => f.path === 'file1.ts')).toEqual({
        path: 'file1.ts',
        status: 'staged',
      });
      expect(files.find((f) => f.path === 'file2.ts')).toEqual({
        path: 'file2.ts',
        status: 'staged',
      });
      expect(files.find((f) => f.path === 'file3.ts')).toEqual({
        path: 'file3.ts',
        status: 'modified',
      });
      expect(files.find((f) => f.path === 'file4.ts')).toEqual({
        path: 'file4.ts',
        status: 'untracked',
      });
      expect(files.find((f) => f.path === 'file5.ts')).toEqual({
        path: 'file5.ts',
        status: 'deleted',
      });
    });

    it('should handle empty status', () => {
      const status = {
        staged: [],
        modified: [],
        untracked: [],
        deleted: [],
      };

      const files = getChangedFilesFromStatus(status);
      expect(files).toHaveLength(0);
    });

    it('should handle status with only staged files', () => {
      const status = {
        staged: ['staged.ts'],
        modified: [],
        untracked: [],
        deleted: [],
      };

      const files = getChangedFilesFromStatus(status);
      expect(files).toHaveLength(1);
      expect(files[0]).toEqual({ path: 'staged.ts', status: 'staged' });
    });

    it('should handle status with only modified files', () => {
      const status = {
        staged: [],
        modified: ['modified.ts'],
        untracked: [],
        deleted: [],
      };

      const files = getChangedFilesFromStatus(status);
      expect(files).toHaveLength(1);
      expect(files[0]).toEqual({ path: 'modified.ts', status: 'modified' });
    });

    it('should preserve file path order', () => {
      const status = {
        staged: ['a.ts', 'b.ts'],
        modified: ['c.ts', 'd.ts'],
        untracked: ['e.ts'],
        deleted: ['f.ts'],
      };

      const files = getChangedFilesFromStatus(status);
      const paths = files.map((f) => f.path);

      // Staged files come first, then modified, then untracked, then deleted
      expect(paths).toEqual(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts']);
    });
  });
});

describe('getChangedFiles', () => {
  describe('direct status fetching', () => {
    it('should fetch and aggregate changed files', () => {
      const files = getChangedFiles();
      expect(Array.isArray(files)).toBe(true);

      // Verify each file has the correct structure
      files.forEach((file) => {
        expect(file).toHaveProperty('path');
        expect(file).toHaveProperty('status');
        expect(typeof file.path).toBe('string');
        expect(['staged', 'modified', 'untracked', 'deleted']).toContain(file.status);
      });
    });

    it('should respect includeUntracked option', () => {
      const filesWithUntracked = getChangedFiles({ includeUntracked: true });
      const filesWithoutUntracked = getChangedFiles({ includeUntracked: false });

      expect(Array.isArray(filesWithUntracked)).toBe(true);
      expect(Array.isArray(filesWithoutUntracked)).toBe(true);

      // Files without untracked should not have any 'untracked' status
      const hasUntracked = filesWithoutUntracked.some((f) => f.status === 'untracked');
      expect(hasUntracked).toBe(false);
    });
  });
});

describe('isWorkingDirectoryClean', () => {
  describe('clean status detection', () => {
    it('should return boolean', () => {
      const isClean = isWorkingDirectoryClean();
      expect(typeof isClean).toBe('boolean');
    });

    it('should not consider untracked files', () => {
      // isWorkingDirectoryClean uses includeUntracked: false
      // So it only checks staged, modified, and deleted
      const isClean = isWorkingDirectoryClean();
      expect(typeof isClean).toBe('boolean');
    });
  });

  describe('consistency with getGitStatus', () => {
    it('should be consistent with status check', () => {
      const status = getGitStatus({ includeUntracked: false });
      const isClean = isWorkingDirectoryClean();

      const expectedClean =
        status.staged.length === 0 && status.modified.length === 0 && status.deleted.length === 0;

      expect(isClean).toBe(expectedClean);
    });
  });
});
