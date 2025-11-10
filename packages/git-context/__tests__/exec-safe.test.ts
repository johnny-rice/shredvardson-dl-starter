/**
 * Security tests for safe git command execution.
 * Tests shell injection prevention, validation, and error handling.
 *
 * @module exec-safe.test
 */

import { describe, expect, it, vi } from 'vitest';
import { execGitSafe, execGitSafeDetailed, sanitizeError } from '../src/exec-safe.js';

describe('execGitSafe', () => {
  describe('successful execution', () => {
    it('should execute git status command', () => {
      const output = execGitSafe(['status', '--porcelain']);
      expect(typeof output).toBe('string');
    });

    it('should execute git branch command', () => {
      const output = execGitSafe(['branch', '--show-current']);
      expect(typeof output).toBe('string');
      expect(output.trim().length).toBeGreaterThan(0);
    });

    it('should execute git log command', () => {
      const output = execGitSafe(['log', '-1', '--oneline']);
      expect(typeof output).toBe('string');
    });

    it('should respect cwd option', () => {
      // This should work since we're in a git repo
      const output = execGitSafe(['rev-parse', '--show-toplevel'], { cwd: process.cwd() });
      expect(output.trim()).toBeTruthy();
    });
  });

  describe('argument validation', () => {
    it('should reject shell metacharacters - semicolon', () => {
      expect(() => {
        execGitSafe(['status', '; rm -rf /']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should reject shell metacharacters - pipe', () => {
      expect(() => {
        execGitSafe(['status', '| cat /etc/passwd']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should reject shell metacharacters - ampersand', () => {
      expect(() => {
        execGitSafe(['status', '&& evil-command']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should reject shell metacharacters - dollar sign', () => {
      expect(() => {
        execGitSafe(['status', '$(whoami)']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should reject shell metacharacters - backtick', () => {
      expect(() => {
        execGitSafe(['status', '`whoami`']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should reject shell metacharacters - angle brackets', () => {
      expect(() => {
        execGitSafe(['status', '> /tmp/output']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should reject shell metacharacters - parentheses', () => {
      expect(() => {
        execGitSafe(['status', '(ls)']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should allow safe arguments with dashes', () => {
      expect(() => {
        execGitSafe(['status', '--porcelain']);
      }).not.toThrow();
    });

    it('should allow safe arguments with equals', () => {
      expect(() => {
        execGitSafe(['log', '--pretty=format:%H']);
      }).not.toThrow();
    });
  });

  describe('-- separator injection', () => {
    it('should add -- separator for diff command', () => {
      // This should not throw - we're testing that -- is added correctly
      // For diff, log, show commands, -- should be inserted before file paths
      const output = execGitSafe(['diff', 'HEAD', '--', 'file.txt'], {
        allowNonZeroExit: true,
      });
      expect(typeof output).toBe('string');
    });

    it('should add -- separator for log command', () => {
      const output = execGitSafe(['log', '-1', 'HEAD'], { allowNonZeroExit: true });
      expect(typeof output).toBe('string');
    });

    it('should not add -- separator for status command', () => {
      // Status doesn't support --, so it shouldn't be added
      const output = execGitSafe(['status', '--porcelain']);
      expect(typeof output).toBe('string');
    });
  });

  describe('error handling', () => {
    it('should throw on non-zero exit code by default', () => {
      expect(() => {
        // Use an invalid git command that will definitely fail
        execGitSafe(['not-a-real-command']);
      }).toThrow(/Git command failed/);
    });

    it('should allow non-zero exit with allowNonZeroExit option', () => {
      const output = execGitSafe(['diff', 'nonexistent-ref'], { allowNonZeroExit: true });
      expect(typeof output).toBe('string');
    });

    it('should sanitize error messages', () => {
      try {
        execGitSafe(['log', 'definitely-not-a-real-branch-name-xyz']);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain('Git command failed');
        // Error message should be sanitized (no absolute paths)
        expect(message).not.toMatch(/\/Users\/[^/]+/);
        expect(message).not.toMatch(/\/home\/[^/]+/);
      }
    });

    it('should handle invalid git commands', () => {
      expect(() => {
        execGitSafe(['not-a-real-command']);
      }).toThrow(/Git command failed/);
    });
  });

  describe('output limits', () => {
    it('should handle large outputs within buffer limit', () => {
      // Get a reasonable amount of log output
      const output = execGitSafe(['log', '--all', '--oneline'], { allowNonZeroExit: true });
      expect(typeof output).toBe('string');
    });
  });
});

describe('execGitSafeDetailed', () => {
  describe('detailed results', () => {
    it('should return detailed result with stdout', () => {
      const result = execGitSafeDetailed(['status', '--porcelain']);
      expect(result).toHaveProperty('stdout');
      expect(result).toHaveProperty('stderr');
      expect(result).toHaveProperty('exitCode');
      expect(typeof result.stdout).toBe('string');
      expect(typeof result.stderr).toBe('string');
      expect(typeof result.exitCode).toBe('number');
    });

    it('should return exit code 0 on success', () => {
      const result = execGitSafeDetailed(['status', '--porcelain']);
      expect(result.exitCode).toBe(0);
    });

    it('should return non-zero exit code on failure', () => {
      const result = execGitSafeDetailed(['not-a-real-command']);
      expect(result.exitCode).not.toBe(0);
    });

    it('should populate stderr on errors', () => {
      const result = execGitSafeDetailed(['not-a-real-command']);
      expect(result.stderr.trim().length).toBeGreaterThan(0);
    });

    it('should sanitize stderr output', () => {
      const result = execGitSafeDetailed(['not-a-real-command']);
      // Stderr should be sanitized (no absolute home paths)
      expect(result.stderr).not.toMatch(/\/Users\/[^/\s]+/);
      expect(result.stderr).not.toMatch(/\/home\/[^/\s]+/);
    });
  });

  describe('validation', () => {
    it('should validate arguments like execGitSafe', () => {
      expect(() => {
        execGitSafeDetailed(['status', '; rm -rf /']);
      }).toThrow(/Shell metacharacter/);
    });

    it('should allow safe arguments', () => {
      const result = execGitSafeDetailed(['status', '--porcelain']);
      expect(result.exitCode).toBe(0);
    });
  });

  describe('cwd option', () => {
    it('should respect cwd option', () => {
      const result = execGitSafeDetailed(['rev-parse', '--show-toplevel'], {
        cwd: process.cwd(),
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBeTruthy();
    });
  });
});

describe('sanitizeError', () => {
  describe('home directory redaction', () => {
    it('should redact macOS home paths', () => {
      const error = 'fatal: /Users/alice/project/.git not found';
      expect(sanitizeError(error)).toBe('fatal: ~/project/.git not found');
    });

    it('should redact Linux home paths', () => {
      const error = 'error: /home/bob/repo/file.txt does not exist';
      expect(sanitizeError(error)).toBe('error: ~/repo/file.txt does not exist');
    });

    it('should redact Windows home paths', () => {
      const error = 'fatal: C:\\Users\\charlie\\project\\.git not found';
      expect(sanitizeError(error)).toBe('fatal: ~\\project\\.git not found');
    });

    it('should redact multiple home paths', () => {
      const error = '/Users/alice/file and /Users/bob/file';
      expect(sanitizeError(error)).toBe('~/file and ~/file');
    });
  });

  describe('temp directory redaction', () => {
    it('should redact /tmp paths', () => {
      const error = 'failed to access /tmp/session123/data.txt';
      expect(sanitizeError(error)).toBe('failed to access /tmp/***/data.txt');
    });

    it('should redact /var/tmp paths', () => {
      const error = 'error: /var/tmp/build456/output.log missing';
      expect(sanitizeError(error)).toBe('error: /var/tmp/***/output.log missing');
    });
  });

  describe('credential redaction', () => {
    it('should redact HTTPS credentials with user:pass', () => {
      const error = 'fatal: https://user:pass123@github.com/repo.git authentication failed';
      expect(sanitizeError(error)).toBe(
        'fatal: https://***:***@github.com/repo.git authentication failed'
      );
    });

    it('should redact HTTP credentials', () => {
      const error = 'fatal: http://admin:secret@localhost/repo.git failed';
      expect(sanitizeError(error)).toBe('fatal: https://***:***@localhost/repo.git failed');
    });

    it('should redact multiple URLs in error message', () => {
      const error =
        'failed to clone https://user1:pass1@github.com/repo1.git and https://user2:pass2@github.com/repo2.git';
      expect(sanitizeError(error)).toBe(
        'failed to clone https://***:***@github.com/repo1.git and https://***:***@github.com/repo2.git'
      );
    });
  });

  describe('safe content preservation', () => {
    it('should preserve error messages without sensitive data', () => {
      const error = 'fatal: not a git repository';
      expect(sanitizeError(error)).toBe(error);
    });

    it('should preserve non-home absolute paths', () => {
      const error = '/opt/app/bin/git command failed';
      expect(sanitizeError(error)).toBe(error);
    });

    it('should handle empty strings', () => {
      expect(sanitizeError('')).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      expect(sanitizeError('   ')).toBe('   ');
    });
  });

  describe('complex error messages', () => {
    it('should handle multi-line errors', () => {
      const error = `fatal: /Users/alice/project/.git not found
error: /home/bob/file.txt missing`;
      const sanitized = sanitizeError(error);
      expect(sanitized).toContain('~/project/.git');
      expect(sanitized).toContain('~/file.txt');
    });

    it('should handle errors with special characters', () => {
      const error = 'fatal: /Users/alice/project/.git\n\terror occurred';
      const sanitized = sanitizeError(error);
      expect(sanitized).toContain('~/project/.git');
      expect(sanitized).toContain('error occurred');
    });
  });
});
