/**
 * Tests for git repository operations and information.
 *
 * @module git-repository.test
 */

import { describe, expect, it } from 'vitest';
import {
  findGitRoot,
  getRemoteURL,
  getRepositoryInfo,
  isInsideGitRepo,
} from '../src/git-repository.js';

describe('findGitRoot', () => {
  describe('repository root detection', () => {
    it('should return absolute path to git root', () => {
      const root = findGitRoot();
      expect(typeof root).toBe('string');
      expect(root.length).toBeGreaterThan(0);
      // Should be an absolute path
      expect(root).toMatch(/^[\\/]|^[A-Z]:\\/);
    });

    it('should return consistent path', () => {
      const root1 = findGitRoot();
      const root2 = findGitRoot();
      expect(root1).toBe(root2);
    });

    it('should be a valid directory path', () => {
      const root = findGitRoot();
      // Path should not end with slash (git behavior)
      expect(root.endsWith('/')).toBe(false);
      expect(root.endsWith('\\')).toBe(false);
    });
  });

  describe('cwd option', () => {
    it('should respect cwd option', () => {
      const root = findGitRoot(process.cwd());
      expect(typeof root).toBe('string');
      expect(root.length).toBeGreaterThan(0);
    });
  });
});

describe('getRepositoryInfo', () => {
  describe('repository information', () => {
    it('should return repository info object', () => {
      const info = getRepositoryInfo();
      expect(info).toHaveProperty('root');
      expect(info).toHaveProperty('remote');
      expect(info).toHaveProperty('isClean');
    });

    it('should have valid root path', () => {
      const info = getRepositoryInfo();
      expect(typeof info.root).toBe('string');
      expect(info.root.length).toBeGreaterThan(0);
      expect(info.root).toMatch(/^[\\/]|^[A-Z]:\\/);
    });

    it('should have boolean isClean status', () => {
      const info = getRepositoryInfo();
      expect(typeof info.isClean).toBe('boolean');
    });

    it('should have string or null remote', () => {
      const info = getRepositoryInfo();
      if (info.remote !== null) {
        expect(typeof info.remote).toBe('string');
      }
    });
  });

  describe('sanitization', () => {
    it('should sanitize remote URL by default', () => {
      const info = getRepositoryInfo({ sanitize: true });
      if (info.remote !== null) {
        // SSH URLs (git@github.com) don't contain credentials - the @ is part of the protocol
        // Only HTTPS URLs with embedded credentials should be sanitized
        const hasHTTPSCredentials =
          info.remote.startsWith('https://') &&
          info.remote.includes('@') &&
          info.remote.match(/https:\/\/[^:@]+[:@]/);
        if (hasHTTPSCredentials) {
          // If there are HTTPS credentials, they should be redacted with ***
          expect(info.remote).toMatch(/\*\*\*/);
        } else {
          // Otherwise, the URL should be returned as-is (e.g., SSH URLs)
          expect(info.remote).toBeTruthy();
        }
      }
    });

    it('should allow disabling sanitization', () => {
      const info = getRepositoryInfo({ sanitize: false });
      expect(info).toBeDefined();
      expect(info.root).toBeTruthy();
    });
  });

  describe('root path consistency', () => {
    it('should match findGitRoot result', () => {
      const info = getRepositoryInfo();
      const root = findGitRoot();
      expect(info.root).toBe(root);
    });
  });

  describe('clean status detection', () => {
    it('should detect working directory status', () => {
      const info = getRepositoryInfo();
      // isClean should be true if no uncommitted changes
      expect(typeof info.isClean).toBe('boolean');
    });
  });
});

describe('isInsideGitRepo', () => {
  describe('repository detection', () => {
    it('should return true when inside a git repository', () => {
      const inside = isInsideGitRepo();
      expect(inside).toBe(true);
    });

    it('should be consistent with findGitRoot', () => {
      const inside = isInsideGitRepo();
      expect(inside).toBe(true);

      // If we're inside a repo, findGitRoot should not throw
      expect(() => findGitRoot()).not.toThrow();
    });

    it('should respect cwd option', () => {
      const inside = isInsideGitRepo(process.cwd());
      expect(inside).toBe(true);
    });
  });
});

describe('getRemoteURL', () => {
  describe('remote URL retrieval', () => {
    it('should return string or null', () => {
      const remote = getRemoteURL();
      if (remote !== null) {
        expect(typeof remote).toBe('string');
      }
    });

    it('should match remote from getRepositoryInfo', () => {
      const url = getRemoteURL();
      const info = getRepositoryInfo();
      expect(url).toBe(info.remote);
    });

    it('should have valid URL format when present', () => {
      const remote = getRemoteURL();
      if (remote !== null) {
        // Should be a URL (https://, ssh://, git@, file://)
        expect(remote).toMatch(/^(https?:\/\/|ssh:\/\/|git@|file:\/\/)/);
      }
    });
  });

  describe('sanitization', () => {
    it('should sanitize by default', () => {
      const remote = getRemoteURL({ sanitize: true });
      if (remote !== null) {
        // SSH URLs (git@github.com) don't contain credentials - the @ is part of the protocol
        // Only HTTPS URLs with embedded credentials should be sanitized
        const hasHTTPSCredentials =
          remote.startsWith('https://') &&
          remote.includes('@') &&
          remote.match(/https:\/\/[^:@]+[:@]/);
        if (hasHTTPSCredentials) {
          // If there are HTTPS credentials, they should be redacted with ***
          expect(remote).toMatch(/\*\*\*/);
        } else {
          // Otherwise, the URL should be returned as-is (e.g., SSH URLs)
          expect(remote).toBeTruthy();
        }
      }
    });

    it('should allow disabling sanitization', () => {
      const remote = getRemoteURL({ sanitize: false });
      expect(remote === null || typeof remote === 'string').toBe(true);
    });

    it('should match sanitized option from getRepositoryInfo', () => {
      const remoteSanitized = getRemoteURL({ sanitize: true });
      const infoSanitized = getRepositoryInfo({ sanitize: true });

      expect(remoteSanitized).toBe(infoSanitized.remote);
    });
  });
});
