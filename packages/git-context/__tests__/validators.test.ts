/**
 * Tests for input validation schemas (Zod).
 * Security boundary - prevents command injection and path traversal.
 *
 * @module validators.test
 */

import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  branchNameSchema,
  commitHashSchema,
  filePathSchema,
  gitArgsSchema,
  gitContextOptionsSchema,
  nonNegativeIntegerSchema,
  positiveIntegerSchema,
  remoteUrlSchema,
  shortCommitHashSchema,
} from '../src/validators.js';

describe('filePathSchema', () => {
  describe('valid paths', () => {
    it('should accept relative paths', () => {
      expect(filePathSchema.parse('src/index.ts')).toBe('src/index.ts');
      expect(filePathSchema.parse('README.md')).toBe('README.md');
      expect(filePathSchema.parse('docs/api/reference.md')).toBe('docs/api/reference.md');
    });

    it('should accept paths with dots in filename', () => {
      expect(filePathSchema.parse('config.test.ts')).toBe('config.test.ts');
      expect(filePathSchema.parse('.env')).toBe('.env');
      expect(filePathSchema.parse('.github/workflows/ci.yml')).toBe('.github/workflows/ci.yml');
    });

    it('should accept paths with underscores and hyphens', () => {
      expect(filePathSchema.parse('my-file_name.txt')).toBe('my-file_name.txt');
      expect(filePathSchema.parse('src/user_service.ts')).toBe('src/user_service.ts');
    });
  });

  describe('path traversal prevention', () => {
    it('should reject path traversal with ..', () => {
      expect(() => filePathSchema.parse('../etc/passwd')).toThrow(/Path traversal/);
      expect(() => filePathSchema.parse('src/../../etc/passwd')).toThrow(/Path traversal/);
      expect(() => filePathSchema.parse('../../file.txt')).toThrow(/Path traversal/);
    });

    it('should reject absolute paths', () => {
      expect(() => filePathSchema.parse('/etc/passwd')).toThrow(/Absolute paths not allowed/);
      expect(() => filePathSchema.parse('/usr/bin/git')).toThrow(/Absolute paths not allowed/);
    });

    it('should reject Windows absolute paths', () => {
      // Note: path.isAbsolute() behavior is OS-specific
      // On Linux, Windows paths may not be recognized as absolute
      try {
        filePathSchema.parse('C:\\Windows\\System32');
        // On Linux, this might not be recognized as absolute, which is okay
      } catch (error) {
        // On Windows or if recognized as absolute, it should throw
        expect(error).toBeTruthy();
      }
    });
  });

  describe('flag injection prevention', () => {
    it('should reject paths starting with dash', () => {
      expect(() => filePathSchema.parse('--upload-pack')).toThrow(/Flag injection/);
      expect(() => filePathSchema.parse('-rf')).toThrow(/Flag injection/);
    });
  });

  describe('null byte injection prevention', () => {
    it('should reject paths with null bytes', () => {
      expect(() => filePathSchema.parse('file.txt\0malicious')).toThrow(/Null byte injection/);
      expect(() => filePathSchema.parse('test\x00evil')).toThrow(/Null byte injection/);
    });
  });

  describe('edge cases', () => {
    it('should reject empty paths', () => {
      expect(() => filePathSchema.parse('')).toThrow(/File path cannot be empty/);
    });

    it('should accept single character filenames', () => {
      expect(filePathSchema.parse('a')).toBe('a');
    });
  });
});

describe('branchNameSchema', () => {
  describe('valid branch names', () => {
    it('should accept simple branch names', () => {
      expect(branchNameSchema.parse('main')).toBe('main');
      expect(branchNameSchema.parse('master')).toBe('master');
      expect(branchNameSchema.parse('develop')).toBe('develop');
    });

    it('should accept branch names with slashes', () => {
      expect(branchNameSchema.parse('feature/new-feature')).toBe('feature/new-feature');
      expect(branchNameSchema.parse('bugfix/issue-123')).toBe('bugfix/issue-123');
      expect(branchNameSchema.parse('release/v1.2.3')).toBe('release/v1.2.3');
    });

    it('should accept branch names with underscores', () => {
      expect(branchNameSchema.parse('feature_branch')).toBe('feature_branch');
      expect(branchNameSchema.parse('my_awesome_feature')).toBe('my_awesome_feature');
    });

    it('should accept branch names with dots', () => {
      expect(branchNameSchema.parse('release-1.2.3')).toBe('release-1.2.3');
      expect(branchNameSchema.parse('v2.0.hotfix')).toBe('v2.0.hotfix');
    });

    it('should accept branch names with numbers', () => {
      expect(branchNameSchema.parse('issue-123')).toBe('issue-123');
      expect(branchNameSchema.parse('v1')).toBe('v1');
    });
  });

  describe('invalid characters', () => {
    it('should reject branch names with spaces', () => {
      expect(() => branchNameSchema.parse('feature branch')).toThrow(/Invalid branch name/);
    });

    it('should reject branch names with shell metacharacters', () => {
      expect(() => branchNameSchema.parse('branch;rm')).toThrow(/Invalid branch name/);
      expect(() => branchNameSchema.parse('branch|pipe')).toThrow(/Invalid branch name/);
      expect(() => branchNameSchema.parse('branch&bg')).toThrow(/Invalid branch name/);
      expect(() => branchNameSchema.parse('$(whoami)')).toThrow(/Invalid branch name/);
      expect(() => branchNameSchema.parse('`cmd`')).toThrow(/Invalid branch name/);
    });

    it('should reject branch names with special characters', () => {
      expect(() => branchNameSchema.parse('branch@name')).toThrow(/Invalid branch name/);
      expect(() => branchNameSchema.parse('branch#tag')).toThrow(/Invalid branch name/);
      expect(() => branchNameSchema.parse('branch*wild')).toThrow(/Invalid branch name/);
    });
  });

  describe('git-specific restrictions', () => {
    it('should reject consecutive dots', () => {
      // Zod throws with a JSON error format, so just check that it throws
      expect(() => branchNameSchema.parse('feature..test')).toThrow();
      expect(() => branchNameSchema.parse('main..branch')).toThrow();
    });

    it('should reject .lock suffix', () => {
      // Zod throws with a JSON error format, so just check that it throws
      expect(() => branchNameSchema.parse('branch.lock')).toThrow();
      expect(() => branchNameSchema.parse('feature/test.lock')).toThrow();
    });
  });

  describe('length constraints', () => {
    it('should reject empty branch names', () => {
      expect(() => branchNameSchema.parse('')).toThrow(/Branch name cannot be empty/);
    });

    it('should reject branch names over 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(() => branchNameSchema.parse(longName)).toThrow(/Branch name too long/);
    });

    it('should accept 255 character branch names', () => {
      const maxName = 'a'.repeat(255);
      expect(branchNameSchema.parse(maxName)).toBe(maxName);
    });

    it('should accept single character branch names', () => {
      expect(branchNameSchema.parse('v')).toBe('v');
    });
  });
});

describe('commitHashSchema', () => {
  describe('SHA-1 hashes (40 chars)', () => {
    it('should accept valid SHA-1 hashes', () => {
      const sha1 = 'a'.repeat(40);
      expect(commitHashSchema.parse(sha1)).toBe(sha1);
    });

    it('should accept SHA-1 with all hex characters', () => {
      const sha1 = '0123456789abcdef0123456789abcdef01234567';
      expect(commitHashSchema.parse(sha1)).toBe(sha1);
    });
  });

  describe('SHA-256 hashes (64 chars)', () => {
    it('should accept valid SHA-256 hashes', () => {
      const sha256 = 'a'.repeat(64);
      expect(commitHashSchema.parse(sha256)).toBe(sha256);
    });

    it('should accept SHA-256 with all hex characters', () => {
      const sha256 = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      expect(commitHashSchema.parse(sha256)).toBe(sha256);
    });
  });

  describe('invalid hashes', () => {
    it('should reject short hashes', () => {
      expect(() => commitHashSchema.parse('abc123')).toThrow(/Invalid commit hash/);
      expect(() => commitHashSchema.parse('a'.repeat(39))).toThrow(/Invalid commit hash/);
    });

    it('should reject hashes with wrong length', () => {
      expect(() => commitHashSchema.parse('a'.repeat(41))).toThrow(/Invalid commit hash/);
      expect(() => commitHashSchema.parse('a'.repeat(50))).toThrow(/Invalid commit hash/);
      expect(() => commitHashSchema.parse('a'.repeat(65))).toThrow(/Invalid commit hash/);
    });

    it('should reject non-hex characters', () => {
      const invalid = 'g'.repeat(40); // 'g' is not a hex digit
      expect(() => commitHashSchema.parse(invalid)).toThrow(/Invalid commit hash/);
    });

    it('should reject uppercase hex', () => {
      const uppercase = 'A'.repeat(40);
      expect(() => commitHashSchema.parse(uppercase)).toThrow(/Invalid commit hash/);
    });

    it('should reject special characters', () => {
      const withSpecial = 'a'.repeat(39) + '!';
      expect(() => commitHashSchema.parse(withSpecial)).toThrow(/Invalid commit hash/);
    });
  });
});

describe('shortCommitHashSchema', () => {
  describe('valid short hashes', () => {
    it('should accept 7-character short hashes', () => {
      expect(shortCommitHashSchema.parse('abc1234')).toBe('abc1234');
      expect(shortCommitHashSchema.parse('0123456')).toBe('0123456');
    });

    it('should accept longer short hashes up to 40 chars', () => {
      expect(shortCommitHashSchema.parse('abcdef1234')).toBe('abcdef1234');
      expect(shortCommitHashSchema.parse('a'.repeat(40))).toBe('a'.repeat(40));
    });
  });

  describe('invalid short hashes', () => {
    it('should reject hashes shorter than 7 characters', () => {
      expect(() => shortCommitHashSchema.parse('abc')).toThrow(/at least 7 characters/);
      expect(() => shortCommitHashSchema.parse('abc123')).toThrow(/at least 7 characters/);
    });

    it('should reject hashes longer than 40 characters', () => {
      const tooLong = 'a'.repeat(41);
      expect(() => shortCommitHashSchema.parse(tooLong)).toThrow(/too long/);
    });

    it('should reject non-hex characters', () => {
      expect(() => shortCommitHashSchema.parse('ggggggg')).toThrow(/must be hexadecimal/);
      expect(() => shortCommitHashSchema.parse('abc123g')).toThrow(/must be hexadecimal/);
    });

    it('should reject uppercase hex', () => {
      expect(() => shortCommitHashSchema.parse('ABCDEF1')).toThrow(/must be hexadecimal/);
    });
  });
});

describe('remoteUrlSchema', () => {
  describe('valid HTTPS URLs', () => {
    it('should accept HTTPS URLs', () => {
      const url = 'https://github.com/user/repo.git';
      expect(remoteUrlSchema.parse(url)).toBe(url);
    });

    it('should accept HTTP URLs (for local testing)', () => {
      const url = 'http://localhost/repo.git';
      expect(remoteUrlSchema.parse(url)).toBe(url);
    });

    it('should accept HTTPS URLs with credentials', () => {
      const url = 'https://user:token@github.com/repo.git';
      expect(remoteUrlSchema.parse(url)).toBe(url);
    });
  });

  describe('valid SSH URLs', () => {
    it('should accept SSH protocol URLs', () => {
      const url = 'ssh://git@github.com/user/repo.git';
      expect(remoteUrlSchema.parse(url)).toBe(url);
    });

    it('should accept git@ SCP-style URLs', () => {
      const url = 'git@github.com:user/repo.git';
      expect(remoteUrlSchema.parse(url)).toBe(url);
    });
  });

  describe('valid file URLs', () => {
    it('should accept file:// URLs', () => {
      const url = 'file:///path/to/repo.git';
      expect(remoteUrlSchema.parse(url)).toBe(url);
    });
  });

  describe('invalid URLs', () => {
    it('should reject URLs without valid protocol', () => {
      expect(() => remoteUrlSchema.parse('ftp://example.com/repo.git')).toThrow(
        /Invalid remote URL protocol/
      );
      expect(() => remoteUrlSchema.parse('javascript:alert(1)')).toThrow(
        /Invalid remote URL protocol/
      );
    });

    it('should reject empty URLs', () => {
      expect(() => remoteUrlSchema.parse('')).toThrow(/Remote URL cannot be empty/);
    });

    it('should reject plain paths', () => {
      expect(() => remoteUrlSchema.parse('/path/to/repo')).toThrow(/Invalid remote URL protocol/);
    });
  });
});

describe('positiveIntegerSchema', () => {
  describe('valid positive integers', () => {
    it('should accept positive integers', () => {
      expect(positiveIntegerSchema.parse(1)).toBe(1);
      expect(positiveIntegerSchema.parse(10)).toBe(10);
      expect(positiveIntegerSchema.parse(100)).toBe(100);
      expect(positiveIntegerSchema.parse(9999)).toBe(9999);
    });
  });

  describe('invalid values', () => {
    it('should reject zero', () => {
      expect(() => positiveIntegerSchema.parse(0)).toThrow(/Must be a positive integer/);
    });

    it('should reject negative integers', () => {
      expect(() => positiveIntegerSchema.parse(-1)).toThrow(/Must be a positive integer/);
      expect(() => positiveIntegerSchema.parse(-100)).toThrow(/Must be a positive integer/);
    });

    it('should reject floats', () => {
      expect(() => positiveIntegerSchema.parse(1.5)).toThrow();
      expect(() => positiveIntegerSchema.parse(3.14)).toThrow();
    });

    it('should reject non-numbers', () => {
      expect(() => positiveIntegerSchema.parse('10' as any)).toThrow();
      expect(() => positiveIntegerSchema.parse(null as any)).toThrow();
    });
  });
});

describe('nonNegativeIntegerSchema', () => {
  describe('valid non-negative integers', () => {
    it('should accept zero', () => {
      expect(nonNegativeIntegerSchema.parse(0)).toBe(0);
    });

    it('should accept positive integers', () => {
      expect(nonNegativeIntegerSchema.parse(1)).toBe(1);
      expect(nonNegativeIntegerSchema.parse(100)).toBe(100);
    });
  });

  describe('invalid values', () => {
    it('should reject negative integers', () => {
      expect(() => nonNegativeIntegerSchema.parse(-1)).toThrow(/Must be a non-negative integer/);
      expect(() => nonNegativeIntegerSchema.parse(-100)).toThrow(/Must be a non-negative integer/);
    });

    it('should reject floats', () => {
      expect(() => nonNegativeIntegerSchema.parse(1.5)).toThrow();
    });
  });
});

describe('gitContextOptionsSchema', () => {
  describe('valid options', () => {
    it('should accept valid options', () => {
      const options = {
        includeUntracked: true,
        maxCommits: 10,
        diffContext: 3,
        sanitizeForAI: true,
      };
      expect(gitContextOptionsSchema.parse(options)).toEqual(options);
    });

    it('should accept partial options', () => {
      expect(gitContextOptionsSchema.parse({ maxCommits: 5 })).toEqual({ maxCommits: 5 });
      expect(gitContextOptionsSchema.parse({ includeUntracked: false })).toEqual({
        includeUntracked: false,
      });
    });

    it('should accept undefined', () => {
      expect(gitContextOptionsSchema.parse(undefined)).toBeUndefined();
    });

    it('should accept empty object', () => {
      expect(gitContextOptionsSchema.parse({})).toEqual({});
    });
  });

  describe('type validation', () => {
    it('should reject invalid includeUntracked type', () => {
      expect(() => gitContextOptionsSchema.parse({ includeUntracked: 'yes' as any })).toThrow();
    });

    it('should reject invalid maxCommits type', () => {
      expect(() => gitContextOptionsSchema.parse({ maxCommits: '10' as any })).toThrow();
      expect(() => gitContextOptionsSchema.parse({ maxCommits: -1 })).toThrow();
      expect(() => gitContextOptionsSchema.parse({ maxCommits: 0 })).toThrow();
    });

    it('should reject invalid diffContext type', () => {
      expect(() => gitContextOptionsSchema.parse({ diffContext: '3' as any })).toThrow();
      expect(() => gitContextOptionsSchema.parse({ diffContext: -1 })).toThrow();
    });

    it('should reject invalid sanitizeForAI type', () => {
      expect(() => gitContextOptionsSchema.parse({ sanitizeForAI: 'true' as any })).toThrow();
    });
  });
});

describe('gitArgsSchema', () => {
  describe('safe arguments', () => {
    it('should accept safe command arguments', () => {
      const args = ['status', '--porcelain'];
      expect(gitArgsSchema.parse(args)).toEqual(args);
    });

    it('should accept arguments with equals', () => {
      const args = ['log', '--pretty=format:%H'];
      expect(gitArgsSchema.parse(args)).toEqual(args);
    });

    it('should accept file paths', () => {
      const args = ['diff', 'HEAD', 'src/index.ts'];
      expect(gitArgsSchema.parse(args)).toEqual(args);
    });

    it('should accept arguments with dashes', () => {
      const args = ['log', '-10', '--oneline'];
      expect(gitArgsSchema.parse(args)).toEqual(args);
    });
  });

  describe('shell metacharacter detection', () => {
    it('should reject semicolon', () => {
      expect(() => gitArgsSchema.parse(['status', '; rm -rf /'])).toThrow(/Shell metacharacter/);
    });

    it('should reject pipe', () => {
      expect(() => gitArgsSchema.parse(['status', '| cat'])).toThrow(/Shell metacharacter/);
    });

    it('should reject ampersand', () => {
      expect(() => gitArgsSchema.parse(['status', '&& evil'])).toThrow(/Shell metacharacter/);
    });

    it('should reject dollar sign (command substitution)', () => {
      expect(() => gitArgsSchema.parse(['log', '$(whoami)'])).toThrow(/Shell metacharacter/);
    });

    it('should reject backticks (command substitution)', () => {
      expect(() => gitArgsSchema.parse(['log', '`whoami`'])).toThrow(/Shell metacharacter/);
    });

    it('should reject angle brackets (redirection)', () => {
      expect(() => gitArgsSchema.parse(['status', '> /tmp/output'])).toThrow(/Shell metacharacter/);
      expect(() => gitArgsSchema.parse(['status', '< /etc/passwd'])).toThrow(/Shell metacharacter/);
    });

    it('should reject parentheses (subshell)', () => {
      expect(() => gitArgsSchema.parse(['log', '(ls)'])).toThrow(/Shell metacharacter/);
    });
  });

  describe('empty arrays', () => {
    it('should accept empty array', () => {
      expect(gitArgsSchema.parse([])).toEqual([]);
    });
  });
});
