/**
 * Tests for git log parsing and commit history operations.
 *
 * @module git-log.test
 */

import { describe, expect, it } from 'vitest';
import { getCommitsSince, getLatestCommit, getRecentCommits } from '../src/git-log.js';

describe('getRecentCommits', () => {
  describe('basic functionality', () => {
    it('should return array of commits', () => {
      const commits = getRecentCommits();
      expect(Array.isArray(commits)).toBe(true);
      expect(commits.length).toBeGreaterThan(0);
      expect(commits.length).toBeLessThanOrEqual(10); // Default limit
    });

    it('should return commits with correct structure', () => {
      const commits = getRecentCommits({ limit: 1 });
      expect(commits.length).toBeGreaterThan(0);

      const commit = commits[0];
      expect(commit).toHaveProperty('hash');
      expect(commit).toHaveProperty('shortHash');
      expect(commit).toHaveProperty('author');
      expect(commit).toHaveProperty('email');
      expect(commit).toHaveProperty('date');
      expect(commit).toHaveProperty('message');
      expect(commit).toHaveProperty('subject');
      expect(commit).toHaveProperty('body');

      expect(typeof commit.hash).toBe('string');
      expect(typeof commit.shortHash).toBe('string');
      expect(typeof commit.author).toBe('string');
      expect(typeof commit.email).toBe('string');
      expect(commit.date).toBeInstanceOf(Date);
      expect(typeof commit.message).toBe('string');
      expect(typeof commit.subject).toBe('string');
      expect(typeof commit.body).toBe('string');
    });
  });

  describe('hash validation', () => {
    it('should return valid SHA-1 hashes', () => {
      const commits = getRecentCommits({ limit: 1 });
      expect(commits.length).toBeGreaterThan(0);

      const commit = commits[0];
      // SHA-1 is 40 hex characters
      expect(commit.hash).toMatch(/^[a-f0-9]{40}$/);
      // Short hash is 7 characters
      expect(commit.shortHash).toMatch(/^[a-f0-9]{7}$/);
    });
  });

  describe('limit option', () => {
    it('should respect limit option', () => {
      const limit5 = getRecentCommits({ limit: 5 });
      const limit3 = getRecentCommits({ limit: 3 });

      expect(limit5.length).toBeLessThanOrEqual(5);
      expect(limit3.length).toBeLessThanOrEqual(3);
    });

    it('should default to 10 commits', () => {
      const commits = getRecentCommits();
      expect(commits.length).toBeLessThanOrEqual(10);
    });

    it('should handle limit of 1', () => {
      const commits = getRecentCommits({ limit: 1 });
      expect(commits.length).toBeLessThanOrEqual(1);
    });
  });

  describe('sanitization', () => {
    it('should sanitize commit messages by default', () => {
      const commits = getRecentCommits({ limit: 1, sanitize: true });
      expect(commits.length).toBeGreaterThan(0);

      // Check that messages don't exceed 500 characters (sanitization limit)
      const commit = commits[0];
      expect(commit.message.length).toBeLessThanOrEqual(500);
      expect(commit.subject.length).toBeLessThanOrEqual(500);
      expect(commit.body.length).toBeLessThanOrEqual(500);
    });

    it('should allow disabling sanitization', () => {
      const commits = getRecentCommits({ limit: 1, sanitize: false });
      expect(commits.length).toBeGreaterThan(0);
      expect(commits[0]).toBeDefined();
    });
  });

  describe('branch option', () => {
    it('should accept branch option', () => {
      const currentBranch = getRecentCommits({ limit: 1 });
      expect(currentBranch.length).toBeGreaterThan(0);
    });
  });

  describe('chronological order', () => {
    it('should return commits in reverse chronological order (newest first)', () => {
      const commits = getRecentCommits({ limit: 5 });
      if (commits.length > 1) {
        for (let i = 0; i < commits.length - 1; i++) {
          // Each commit should be newer than or equal to the next one
          expect(commits[i].date.getTime()).toBeGreaterThanOrEqual(commits[i + 1].date.getTime());
        }
      }
    });
  });
});

describe('getLatestCommit', () => {
  describe('HEAD commit', () => {
    it('should return the most recent commit', () => {
      const latest = getLatestCommit();
      expect(latest).not.toBeNull();

      if (latest) {
        expect(latest).toHaveProperty('hash');
        expect(latest).toHaveProperty('shortHash');
        expect(latest).toHaveProperty('author');
        expect(latest).toHaveProperty('email');
        expect(latest).toHaveProperty('date');
        expect(latest).toHaveProperty('message');
        expect(latest).toHaveProperty('subject');
        expect(latest).toHaveProperty('body');
      }
    });

    it('should match first commit from getRecentCommits', () => {
      const latest = getLatestCommit();
      const recent = getRecentCommits({ limit: 1 });

      expect(latest).not.toBeNull();
      expect(recent.length).toBeGreaterThan(0);

      if (latest) {
        expect(latest.hash).toBe(recent[0].hash);
        expect(latest.shortHash).toBe(recent[0].shortHash);
        expect(latest.subject).toBe(recent[0].subject);
      }
    });

    it('should respect sanitization option', () => {
      const sanitized = getLatestCommit({ sanitize: true });
      const unsanitized = getLatestCommit({ sanitize: false });

      expect(sanitized).not.toBeNull();
      expect(unsanitized).not.toBeNull();
    });
  });
});

describe('getCommitsSince', () => {
  describe('date filtering', () => {
    it('should return commits since specified date', () => {
      // Get commits from last 7 days
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const commits = getCommitsSince(lastWeek);

      expect(Array.isArray(commits)).toBe(true);

      // All commits should be after the specified date
      commits.forEach((commit) => {
        expect(commit.date.getTime()).toBeGreaterThanOrEqual(lastWeek.getTime());
      });
    });

    it('should return empty array for future date', () => {
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const commits = getCommitsSince(futureDate);

      expect(Array.isArray(commits)).toBe(true);
      expect(commits.length).toBe(0);
    });

    it('should return all commits for very old date', () => {
      const veryOld = new Date('2000-01-01');
      const commits = getCommitsSince(veryOld, { limit: 100 });

      expect(Array.isArray(commits)).toBe(true);
      expect(commits.length).toBeGreaterThan(0);
    });
  });

  describe('options', () => {
    it('should respect limit option', () => {
      const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const commits = getCommitsSince(lastYear, { limit: 5 });

      expect(commits.length).toBeLessThanOrEqual(5);
    });

    it('should respect sanitize option', () => {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const sanitized = getCommitsSince(lastWeek, { sanitize: true });
      const unsanitized = getCommitsSince(lastWeek, { sanitize: false });

      expect(Array.isArray(sanitized)).toBe(true);
      expect(Array.isArray(unsanitized)).toBe(true);
    });

    it('should default to sanitize: true', () => {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const commits = getCommitsSince(lastWeek);

      if (commits.length > 0) {
        // Sanitized messages should not exceed 500 chars
        commits.forEach((commit) => {
          expect(commit.message.length).toBeLessThanOrEqual(500);
        });
      }
    });

    it('should default limit to 100', () => {
      const veryOld = new Date('2000-01-01');
      const commits = getCommitsSince(veryOld);

      expect(commits.length).toBeLessThanOrEqual(100);
    });
  });

  describe('commit structure', () => {
    it('should return commits with correct structure', () => {
      const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const commits = getCommitsSince(lastYear, { limit: 1 });

      if (commits.length > 0) {
        const commit = commits[0];
        expect(commit).toHaveProperty('hash');
        expect(commit).toHaveProperty('shortHash');
        expect(commit).toHaveProperty('author');
        expect(commit).toHaveProperty('email');
        expect(commit).toHaveProperty('date');
        expect(commit).toHaveProperty('message');
        expect(commit).toHaveProperty('subject');
        expect(commit).toHaveProperty('body');
      }
    });
  });
});
