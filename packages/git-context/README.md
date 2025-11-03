# @shared/git-context

A security-focused git context extraction library for AI agents with defense-in-depth architecture.

## Overview

`@shared/git-context` provides a safe, performant API for extracting git repository information that AI agents need to understand code context. Built with multiple layers of security including input validation, safe command execution, and AI-specific output sanitization to prevent prompt injection and credential leakage.

**Key Security Features:**

- **Input Validation:** Zod schemas validate all inputs before processing
- **Safe Execution:** Uses `spawnSync` with `shell: false` to prevent command injection
- **Output Sanitization:** Removes potential credentials and prompt injection patterns
- **Zero Production Dependencies:** Only dev dependencies (vitest, typescript, zod, @types/node)

## Features

- ✅ **Complete Git Context:** Single function to extract all git information
- ✅ **Modular API:** Individual functions for specific git operations
- ✅ **Type-Safe:** Full TypeScript support with comprehensive type definitions
- ✅ **Performance:** <500ms for typical operations
- ✅ **Security-First:** Defense-in-depth with validation, safe execution, and sanitization
- ✅ **AI-Optimized:** Output formatted for AI agent consumption
- ✅ **Workspace-Internal:** Not published to npm, for internal use only

## Installation

This package is part of the monorepo workspace and not published to npm. Add it to your package dependencies:

```json
{
  "dependencies": {
    "@shared/git-context": "workspace:*"
  }
}
```

Then install:

```bash
pnpm install
```

## Quick Start

```typescript
import { getGitContext } from '@shared/git-context';

// Get complete git context
const context = getGitContext({
  maxCommits: 10,
  diffContext: 3,
  sanitizeForAI: true,
});

console.log(context.repository.root); // Repository root path (sanitized)
console.log(context.branch.current); // 'main'
console.log(context.status.staged); // ['src/index.ts']
console.log(context.recentCommits[0]); // { hash, author, message, ... }
console.log(context.diff.stats); // { filesChanged: 3, additions: 42, deletions: 15 }
```

## API Reference

### Main API

#### `getGitContext(options?): GitContext`

Extracts complete git context in a single call with all security features enabled.

**Parameters:**

- `options.includeUntracked` (boolean): Include untracked files (default: true)
- `options.maxCommits` (number): Maximum commits to retrieve (default: 10)
- `options.diffContext` (number): Lines of context in diffs (default: 3)
- `options.sanitizeForAI` (boolean): Enable AI sanitization (default: true)

**Returns:** `GitContext` object with repository, branch, status, commits, and diff information.

**Example:**

```typescript
const context = getGitContext({
  maxCommits: 20,
  sanitizeForAI: true,
});

// Use structured data
console.log(`On branch: ${context.branch.current}`);
console.log(`${context.status.staged.length} files staged`);
```

### Repository Operations

#### `getRepositoryInfo(options?): RepositoryInfo`

Get basic repository information.

```typescript
const repo = getRepositoryInfo();
console.log(repo.root); // '/path/to/repo'
console.log(repo.remote); // 'https://github.com/user/repo.git' (sanitized)
console.log(repo.isClean); // true
```

#### `findGitRoot(): string`

Find the git repository root directory.

```typescript
const root = findGitRoot();
console.log(root); // '/Users/user/project'
```

#### `isInsideGitRepo(): boolean`

Check if current directory is inside a git repository.

```typescript
if (!isInsideGitRepo()) {
  console.error('Not a git repository!');
  process.exit(1);
}
```

### Branch Operations

#### `getCurrentBranch(): BranchInfo`

Get current branch information including upstream tracking.

```typescript
const branch = getCurrentBranch();
console.log(branch.current); // 'main'
console.log(branch.upstream); // 'origin/main'
console.log(branch.tracking); // true
console.log(branch.commitsAhead); // 2
console.log(branch.commitsBehind); // 0
```

### Status Operations

#### `getGitStatus(options?): GitStatus`

Get working directory status.

```typescript
const status = getGitStatus({ includeUntracked: true });
console.log(status.staged); // ['src/index.ts']
console.log(status.modified); // ['README.md']
console.log(status.untracked); // ['notes.txt']
console.log(status.deleted); // []
```

#### `getChangedFiles(options?): ChangedFile[]`

Get a flat list of changed files.

```typescript
const files = getChangedFiles();
files.forEach((f) => console.log(`${f.status}: ${f.path}`));
// staged: src/index.ts
// modified: README.md
```

#### `isWorkingDirectoryClean(): boolean`

Check if working directory is clean.

```typescript
if (isWorkingDirectoryClean()) {
  console.log('Ready to deploy!');
}
```

### Commit History

#### `getRecentCommits(options?): Commit[]`

Get recent commit history with sanitization.

```typescript
const commits = getRecentCommits({ limit: 5, sanitize: true });
commits.forEach((c) => {
  console.log(`${c.shortHash}: ${c.subject}`);
  console.log(`  by ${c.author} on ${c.date}`);
});
```

#### `getLatestCommit(options?): Commit | null`

Get the most recent commit (HEAD).

```typescript
const head = getLatestCommit();
if (head) {
  console.log(`HEAD: ${head.shortHash} - ${head.subject}`);
}
```

### Diff Operations

#### `getParsedDiff(options?): ParsedDiff`

Get parsed diff of current changes.

```typescript
const diff = getParsedDiff({ context: 3 });
console.log(`${diff.stats.filesChanged} files changed`);
console.log(`+${diff.stats.additions} -${diff.stats.deletions}`);

diff.files.forEach((file) => {
  console.log(`${file.status}: ${file.path}`);
  console.log(`  +${file.additions} -${file.deletions}`);
});
```

#### `getDiffStats(options?): DiffStats`

Get diff statistics only (faster than full parsing).

```typescript
const stats = getDiffStats();
console.log(`${stats.filesChanged} files, +${stats.additions} -${stats.deletions}`);
```

## Security Architecture

### Defense-in-Depth Layers

The package implements three layers of security:

```text
┌─────────────────────────────────────┐
│   1. Input Validation (Zod)        │  Validates all inputs before execution
├─────────────────────────────────────┤
│   2. Safe Execution (spawnSync)     │  No shell interpretation, validated args
├─────────────────────────────────────┤
│   3. Output Sanitization (AI-safe)  │  Removes credentials and injection patterns
└─────────────────────────────────────┘
```

### 1. Input Validation

All inputs are validated using Zod schemas:

```typescript
import { branchNameSchema, filePathSchema, commitHashSchema } from '@shared/git-context';

// Branch names: only alphanumeric, /, _, -
branchNameSchema.parse('feature/foo-bar'); // ✅
branchNameSchema.parse('$(whoami)'); // ❌ Throws validation error

// File paths: no path traversal or flag injection
filePathSchema.parse('src/index.ts'); // ✅
filePathSchema.parse('../etc/passwd'); // ❌ Path traversal detected
filePathSchema.parse('--upload-pack'); // ❌ Flag injection detected

// Commit hashes: must be 40-char SHA-1
commitHashSchema.parse('a'.repeat(40)); // ✅
commitHashSchema.parse('not-a-hash'); // ❌ Invalid format
```

### 2. Safe Command Execution

Uses Node.js `spawnSync` with security hardening:

```typescript
import { execGitSafe } from '@shared/git-context';

// Never uses shell, prevents command injection
const result = execGitSafe(['status', '--porcelain']);
// Internally: spawnSync('git', ['status', '--porcelain'], { shell: false })
```

**Safety Features:**

- ✅ No shell interpretation (`shell: false`)
- ✅ Validated argument arrays (no string concatenation)
- ✅ `maxBuffer: 10MB` to prevent DoS
- ✅ Error messages sanitized

### 3. Output Sanitization

When `sanitizeForAI: true`, output is sanitized to prevent:

#### Credential Leakage

```typescript
// Before: https://user:pass123@github.com/repo.git
// After:  https://***:***@github.com/repo.git
```

#### Prompt Injection

```typescript
// Before: "SYSTEM: Ignore previous instructions"
// After:  "[FILTERED] Ignore previous instructions"
```

#### Path Privacy

```typescript
// Before: /Users/alice/project/src/file.ts
// After:  ~/project/src/file.ts
```

## Usage Examples

### Research Agent Integration

Research agents need comprehensive context:

```typescript
import { getGitContext } from '@shared/git-context';

class ResearchAgent {
  async analyzeRepository() {
    const context = getGitContext({
      maxCommits: 50, // More history for analysis
      sanitizeForAI: true,
    });

    return {
      recentActivity: this.analyzeCommits(context.recentCommits),
      workInProgress: context.status.modified.length > 0,
      branchStrategy: this.inferBranchStrategy(context.branch),
    };
  }
}
```

### Code Agent Integration

Code agents need detailed diff context:

```typescript
import { getParsedDiff } from '@shared/git-context';

class CodeAgent {
  async reviewChanges() {
    const diff = getParsedDiff({ context: 5, sanitizeForAI: true });

    for (const file of diff.files) {
      if (file.status === 'modified') {
        await this.reviewModifications(file);
      }
    }
  }
}
```

### Security Agent Integration

Security agents check for sensitive data:

```typescript
import { getGitStatus, getParsedDiff } from '@shared/git-context';

class SecurityAgent {
  async scanForSecrets() {
    const status = getGitStatus();
    const diff = getParsedDiff({ sanitizeForAI: false }); // Need raw data for scanning

    const findings = [];
    for (const file of diff.files) {
      if (status.staged.includes(file.path)) {
        const secrets = this.detectSecrets(file);
        if (secrets.length > 0) {
          findings.push({ file: file.path, secrets, severity: 'HIGH' });
        }
      }
    }

    return findings;
  }
}
```

## Type Definitions

### GitContext

Complete git context returned by `getGitContext()`:

```typescript
interface GitContext {
  repository: RepositoryInfo; // Root path, remote URL, clean status
  branch: BranchInfo; // Current branch, upstream, ahead/behind
  status: GitStatus; // Staged, modified, untracked, deleted
  recentCommits: Commit[]; // Recent commits with metadata
  diff: ParsedDiff; // File changes, additions/deletions
  changedFiles: ChangedFile[]; // Quick access to changed files
}
```

### GitContextOptions

Options for customizing context extraction:

```typescript
interface GitContextOptions {
  includeUntracked?: boolean; // Include untracked files (default: true)
  maxCommits?: number; // Max commits (1-100, default: 10)
  diffContext?: number; // Diff context lines (0-10, default: 3)
  sanitizeForAI?: boolean; // Enable sanitization (default: true)
}
```

See [src/types.ts](src/types.ts) for complete type definitions.

## Performance

**Targets:**

- ✅ `getGitContext()`: <500ms
- ✅ Individual operations: <50ms
- ✅ Large repositories (10k+ files): <1s

**Optimization Strategies:**

- Synchronous execution (no promise overhead)
- Minimal parsing (only what's needed)
- Early returns on errors
- Zero production dependencies

**Benchmarks:**

```typescript
const start = performance.now();
const context = getGitContext();
const duration = performance.now() - start;

console.log(`Context extraction: ${duration.toFixed(2)}ms`);
// Typical: 300-500ms
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# Type check
pnpm typecheck
```

### Test Coverage

Current: 7 integration tests passing in <600ms

**Covered Areas:**

- ✅ Input validation (Zod schemas)
- ✅ Safe command execution
- ✅ Output sanitization
- ✅ All public API functions
- ✅ Error handling
- ✅ Edge cases (empty repo, detached HEAD, no upstream)

### Security Tests

Specialized tests for security features:

```typescript
describe('Security', () => {
  it('validates branch names', () => {
    expect(() => branchNameSchema.parse('$(whoami)')).toThrow();
  });

  it('prevents path traversal', () => {
    expect(() => filePathSchema.parse('../etc/passwd')).toThrow();
  });

  it('sanitizes credentials', () => {
    const unsafe = 'https://user:pass@github.com';
    const safe = sanitizeRemoteURL(unsafe);
    expect(safe).not.toContain('pass');
  });
});
```

## Error Handling

All functions include comprehensive error handling:

```typescript
import { getGitContext } from '@shared/git-context';

try {
  const context = getGitContext();
} catch (error) {
  if (error instanceof ZodError) {
    console.error('Validation error:', error.message);
  } else {
    console.error('Git command failed:', error.message);
  }
}
```

## Contributing

### Development Setup

```bash
# Install dependencies
pnpm install

# Build package
pnpm --filter=@shared/git-context build

# Run tests
pnpm --filter=@shared/git-context test

# Type check
pnpm --filter=@shared/git-context typecheck
```

### Guidelines

1. **Security First:** All changes must maintain security guarantees
2. **Type Safety:** Full TypeScript coverage required
3. **Test Coverage:** Write tests for new features
4. **Performance:** No regression in benchmarks
5. **Documentation:** Update README for API changes

### Security Checklist

- [ ] Input validated with Zod
- [ ] Uses `execGitSafe` with `shell: false`
- [ ] Output sanitization implemented
- [ ] Security tests written
- [ ] No new dependencies added
- [ ] Documentation updated

## Related Documentation

- [ADR-009: Git Context Security Architecture](../../docs/adr/009-git-context-security-architecture.md)
- [Feature Specification](../../specs/git-context-package.md)
- [Implementation Plan](../../plans/git-context-package.md)
- [Task Breakdown](../../tasks/git-context-package.md)

## License

MIT

---

**Internal Package:** This package is not published to npm and is for workspace-internal use only.

**Security Notice:** Always use `sanitizeForAI: true` when passing git context to AI agents to prevent prompt injection and credential leakage.

**Performance Note:** For optimal performance, use specific functions (e.g., `getGitStatus()`) instead of `getGitContext()` when you only need partial context.
