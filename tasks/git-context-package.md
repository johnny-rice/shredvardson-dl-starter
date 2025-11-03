---
id: TASK-260
type: task
parentId: PLAN-260
title: Git Context Package - Task Breakdown
issue: 260
spec: specs/git-context-package.md
plan: plans/git-context-package.md
created: 2025-01-03
status: ready
total_estimate: 11h
---

# Git Context Package - Task Breakdown

## Summary

**Total Estimated Effort:** 11 hours
**Number of Tasks:** 13
**High-Risk Tasks:** 3

## Task List

### Task 1: Create Package Infrastructure

**ID:** T1
**Priority:** p0
**Estimate:** 1h
**Dependencies:** None
**Risk:** low

**Description:**
Set up `packages/git-context/` with TypeScript configuration, package.json, and workspace integration. This establishes the foundation for all subsequent tasks.

**Acceptance Criteria:**

- [ ] Directory structure created at `packages/git-context/`
- [ ] `package.json` created with `@shared/git-context` namespace
- [ ] `tsconfig.json` created extending root configuration
- [ ] Added to root `pnpm-workspace.yaml` packages array
- [ ] `pnpm install` resolves workspace dependencies
- [ ] `pnpm --filter=@shared/git-context build` succeeds (even with empty src/)

**Notes:**

- Use zero production dependencies (devDependencies: vitest, typescript, zod)
- Follow existing patterns from `packages/shared/`
- Enable project references for instant type updates

---

### Task 2: Implement Type Definitions

**ID:** T2
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T1
**Risk:** low

**Description:**
Create comprehensive TypeScript interfaces for `GitContext`, `RepositoryInfo`, `BranchInfo`, `GitStatus`, `Commit`, `ParsedDiff`, and related types as specified in the plan.

**Acceptance Criteria:**

- [ ] `src/types.ts` created with all interfaces from plan
- [ ] JSDoc documentation added to all exported types
- [ ] `GitContextOptions` interface with optional parameters
- [ ] All types exported from `src/index.ts`
- [ ] TypeScript compilation passes with no errors

**Notes:**

- Reference plan lines 505-588 for complete type specifications
- Include JSDoc examples for complex types
- Ensure types match ADR 009 specification

---

### Task 3: Implement Input Validation (Security Boundary)

**ID:** T3
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T2
**Risk:** high

**Description:**
Create Zod validation schemas to prevent command injection, argument injection, and path traversal attacks. This is the critical security boundary for the package.

**Acceptance Criteria:**

- [ ] `src/validators.ts` created with Zod schemas
- [ ] `branchNameSchema` validates branch names (`/^[a-zA-Z0-9/_-]+$/`)
- [ ] `commitHashSchema` validates 40-char SHA-1 hashes
- [ ] `filePathSchema` prevents path traversal (`..`) and flag injection (`-`)
- [ ] All schemas have validation error messages
- [ ] Unit tests cover 20+ malicious input cases

**Notes:**

- Reference plan lines 685-704 for validation patterns
- Security Scanner identified this as HIGH priority
- Must prevent CVE-2024-27980 and argument injection via `--upload-pack`

---

### Task 4: Implement Safe Command Execution

**ID:** T4
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T3
**Risk:** high

**Description:**
Create `execGitSafe()` wrapper using `spawnSync` with `shell: false` and `--` separator to prevent command injection. This is the core security mechanism.

**Acceptance Criteria:**

- [ ] `src/exec-safe.ts` created with `execGitSafe(args: string[])` function
- [ ] Uses `spawnSync('git', ['--', ...args], { shell: false })`
- [ ] Validates all arguments with Zod before execution
- [ ] Error handling with `sanitizeError()` to remove sensitive paths
- [ ] `maxBuffer: 10MB` to handle large diffs
- [ ] Unit tests prevent shell metacharacters, argument injection, path traversal

**Notes:**

- Reference plan lines 639-681 for implementation
- Must use `shell: false` (critical for security)
- `--` separator prevents git flag injection
- Sanitize error messages to remove `/Users/...` paths and credentials

---

### Task 5: Implement Context Sanitization (AI Safety)

**ID:** T5
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T2
**Risk:** medium

**Description:**
Create sanitization functions to remove prompt injection patterns from commit messages and credentials from remote URLs before passing to AI agents.

**Acceptance Criteria:**

- [ ] `src/sanitize.ts` created with `sanitizeForAIContext()` function
- [ ] `sanitizeCommitMessage()` filters "ignore previous instructions" patterns
- [ ] `sanitizeCommitMessage()` filters "system prompt" patterns
- [ ] `sanitizeCommitMessage()` removes special tokens (`<|...|>`)
- [ ] `sanitizeCommitMessage()` limits length to 500 chars
- [ ] `sanitizeRemoteURL()` removes credentials from git URLs
- [ ] Unit tests cover 10+ prompt injection patterns

**Notes:**

- Reference plan lines 708-726 for sanitization patterns
- Security Scanner identified context injection as MEDIUM priority
- Default to `sanitizeForAI: true` in options

---

### Task 6: Implement Git Status Operations

**ID:** T6
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T4
**Risk:** low

**Description:**
Implement `getGitStatus()` to parse `git status --porcelain` output into structured `GitStatus` object with staged, modified, untracked, and deleted files.

**Acceptance Criteria:**

- [ ] `src/git-status.ts` created with `getGitStatus()` function
- [ ] Parses porcelain format (XY prefix codes)
- [ ] Returns `GitStatus` with staged, modified, untracked, deleted arrays
- [ ] `getChangedFiles()` utility extracts `ChangedFile[]` from status
- [ ] Handles empty status (clean repo)
- [ ] Unit tests cover all status codes (M, A, D, ??, etc.)

**Notes:**

- Reference plan lines 216-222 for implementation pattern
- Migrate logic from existing `git-utils.ts` if available
- Handle edge cases: empty repo, detached HEAD

---

### Task 7: Implement Git Branch Operations

**ID:** T7
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T4
**Risk:** low

**Description:**
Implement `getCurrentBranch()` to extract branch name, upstream tracking, and ahead/behind commit counts.

**Acceptance Criteria:**

- [ ] `src/git-branch.ts` created with `getCurrentBranch()` function
- [ ] Returns `BranchInfo` with current, upstream, tracking, commitsAhead, commitsBehind
- [ ] Uses `git branch --show-current` for current branch
- [ ] Uses `git rev-parse --abbrev-ref @{u}` for upstream
- [ ] Uses `git rev-list --count` for ahead/behind counts
- [ ] Handles detached HEAD state gracefully
- [ ] Unit tests cover normal, detached, and no-upstream scenarios

**Notes:**

- Reference plan lines 223-232 for implementation
- Handle error when no upstream configured (not fatal)
- Return `tracking: false` if no upstream exists

---

### Task 8: Implement Git Log Operations

**ID:** T8
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T4
**Risk:** low

**Description:**
Implement `getRecentCommits()` to parse `git log` output into structured `Commit[]` array with metadata.

**Acceptance Criteria:**

- [ ] `src/git-log.ts` created with `getRecentCommits(limit)` function
- [ ] Uses `--pretty=format` with custom delimiter
- [ ] Parses hash, shortHash, author, email, date, subject, body
- [ ] Applies `sanitizeCommitMessage()` to all text fields
- [ ] Default limit: 10 commits (configurable via options)
- [ ] Handles empty history (new repo)
- [ ] Unit tests cover parsing, date conversion, sanitization

**Notes:**

- Reference plan lines 233-240 and existing `scripts/changelog.js` patterns
- Use `%H`, `%h`, `%an`, `%ae`, `%aI`, `%s`, `%b` format codes
- Apply sanitization before returning

---

### Task 9: Implement Git Diff Operations

**ID:** T9
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T4
**Risk:** medium

**Description:**
Implement `getParsedDiff()` to parse `git diff` output into structured `ParsedDiff` with files, hunks, and statistics.

**Acceptance Criteria:**

- [ ] `src/git-diff.ts` created with `getParsedDiff(context)` function
- [ ] Parses unified diff format into `DiffFile[]` array
- [ ] Extracts hunks with oldStart, newStart, oldLines, newLines
- [ ] Detects file status: added, modified, deleted, renamed
- [ ] Calculates `DiffStats` (filesChanged, additions, deletions)
- [ ] Handles binary files gracefully
- [ ] Unit tests cover add, modify, delete, rename scenarios

**Notes:**

- Reference plan lines 241-247 for implementation
- Diff parsing is complex - use regex carefully
- Handle edge cases: empty diff, binary files, large diffs
- Consider using `--no-color` and `--unified=N` for consistent output

---

### Task 10: Implement Main API Orchestrator

**ID:** T10
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T5, T6, T7, T8, T9
**Risk:** low

**Description:**
Implement `getGitContext()` main entry point that orchestrates parallel execution of all git operations and applies sanitization.

**Acceptance Criteria:**

- [ ] `src/index.ts` updated with `getGitContext(options)` function
- [ ] Uses `Promise.all()` to execute operations in parallel
- [ ] Calls `sanitizeForAIContext()` by default (`sanitizeForAI: true`)
- [ ] Combines results into complete `GitContext` object
- [ ] Exports all utilities (getCurrentBranch, getGitStatus, etc.)
- [ ] JSDoc documentation with usage examples
- [ ] Handles errors gracefully (e.g., not a git repo)

**Notes:**

- Reference plan lines 301-320 for implementation
- Parallel execution targets <500ms performance
- Export both main API and individual utilities for granular access

---

### Task 11: Write Comprehensive Tests

**ID:** T11
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T10
**Risk:** low

**Description:**
Create unit and integration tests achieving >80% code coverage with focus on security validation and performance benchmarks.

**Acceptance Criteria:**

- [ ] `__tests__/exec-safe.test.ts` - command/argument/path injection (20+ cases)
- [ ] `__tests__/validators.test.ts` - Zod schema validation (15+ cases)
- [ ] `__tests__/sanitize.test.ts` - prompt injection prevention (10+ cases)
- [ ] `__tests__/integration.test.ts` - end-to-end `getGitContext()` tests
- [ ] Performance test: `getGitContext()` completes in <500ms
- [ ] Performance test: parallel 40%+ faster than sequential
- [ ] Coverage report shows >80% lines, >80% functions, >65% branches
- [ ] All tests pass (`pnpm test`)

**Notes:**

- Reference plan lines 743-890 for comprehensive test cases
- Security tests are critical - must cover all known attack vectors
- Use vitest for all tests (existing framework)
- Test real git operations in integration tests (requires test repo)

---

### Task 12: Write Documentation

**ID:** T12
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T10
**Risk:** low

**Description:**
Create comprehensive README.md with usage examples, API documentation, and security notes.

**Acceptance Criteria:**

- [ ] `README.md` created in `packages/git-context/`
- [ ] Installation instructions for workspace consumers
- [ ] Usage examples with `getGitContext()` and individual utilities
- [ ] Security section documenting prevention measures
- [ ] API reference for all exported functions
- [ ] Examples for each sub-agent integration (Research, Security, Code, Docs)
- [ ] JSDoc documentation on all public APIs

**Notes:**

- Reference plan lines 374-398 for README structure
- Include security architecture explanation (spawn, Zod, sanitization)
- Provide code examples for master agent and sub-agent integration
- Document `GitContextOptions` parameters

---

### Task 13: Update ADR and Spec Files

**ID:** T13
**Priority:** p2
**Estimate:** 1h
**Dependencies:** T12
**Risk:** low

**Description:**
Update ADR 009 with git-context integration patterns and update spec frontmatter to reference this tasks file.

**Acceptance Criteria:**

- [ ] ADR 009 updated with `GitContext` interface structure
- [ ] ADR 009 includes integration examples for each sub-agent type
- [ ] ADR 009 references `@shared/git-context` package
- [ ] Spec frontmatter updated with `tasks: tasks/git-context-package.md`
- [ ] Plan frontmatter updated with task completion reference

**Notes:**

- Reference plan lines 1045-1078 for ADR updates
- Document recommended usage patterns for sub-agents
- Link back to this task breakdown for implementation details

---

## Implementation Order

**Phase 1: Foundation** (depends on: none)

- T1: Create Package Infrastructure (1h)
- T2: Implement Type Definitions (1h)

**Phase 2: Security Boundary** (depends on: Phase 1)

- T3: Implement Input Validation (2h)
- T4: Implement Safe Command Execution (2h)
- T5: Implement Context Sanitization (1h)

**Phase 3: Git Operations** (depends on: Phase 2)

- T6: Implement Git Status Operations (1h)
- T7: Implement Git Branch Operations (1h)
- T8: Implement Git Log Operations (1h)
- T9: Implement Git Diff Operations (2h)

**Phase 4: Integration & Testing** (depends on: Phase 3)

- T10: Implement Main API Orchestrator (1h)
- T11: Write Comprehensive Tests (2h)

**Phase 5: Documentation** (depends on: Phase 4)

- T12: Write Documentation (1h)
- T13: Update ADR and Spec Files (1h)

## Risk Mitigation

### High-Risk Tasks

**T3: Implement Input Validation (Security Boundary)**

- **Risk:** Validation bypass could enable command injection
- **Mitigation:** Multi-layer defense with Zod + spawn + `--` separator + 20+ regression tests
- **Fallback:** If Zod validation fails, fail-fast with clear error (don't execute)

**T4: Implement Safe Command Execution**

- **Risk:** Shell metacharacters or argument injection could execute arbitrary commands
- **Mitigation:** Use `spawnSync` with `shell: false`, validate all inputs, use `--` separator
- **Fallback:** Comprehensive security tests covering CVE-2024-27980 and all known patterns

**T5: Implement Context Sanitization (AI Safety)**

- **Risk:** Prompt injection via commit messages could manipulate AI behavior
- **Mitigation:** Regex filtering + special token removal + 500-char limit + default enabled
- **Fallback:** If sanitization misses pattern, AI should still validate instructions

### Dependencies

**Critical Path:**
T1 → T2 → T3 → T4 → T5 → T10 → T11 → T12

**Parallel Work Streams:**

- T6, T7, T8, T9 can be implemented in parallel (all depend on T4)
- T12 and T13 can be implemented in parallel (both depend on T10/T11)

**Potential Bottlenecks:**

- T4 (Safe Command Execution) blocks all git operations
- T10 (Main API) blocks testing and documentation

## Testing Strategy

**Per-Task Testing:**

- Each task should have unit tests written alongside implementation
- Security tasks (T3, T4, T5) require exhaustive test coverage (>95%)
- Integration tests after T10 completes
- Performance benchmarks in T11

**Coverage Targets:**

- Unit: 80% lines, 80% functions
- Branches: 65% (security paths: 100%)
- Integration: All major workflows tested
- E2E: `getGitContext()` end-to-end validation

## Success Metrics

**Functional:**

- ✅ Package builds successfully (`pnpm build`)
- ✅ All tests pass (`pnpm test`)
- ✅ Exports all required functions and types
- ✅ Minimal production dependencies (only Zod for security)

**Performance:**

- ✅ `getGitContext()` completes in <500ms
- ✅ Sequential execution optimized for performance
- ✅ Handles large repos efficiently (<1s for 100 commits)

**Security:**

- ✅ Command injection prevented (20+ test cases)
- ✅ Path traversal prevented (5+ test cases)
- ✅ Prompt injection sanitized (10+ test cases)
- ✅ Info disclosure prevented (error sanitization)

**Quality:**

- ✅ >80% code coverage
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ Documentation complete

## References

- Spec: [specs/git-context-package.md](../specs/git-context-package.md)
- Plan: [plans/git-context-package.md](../plans/git-context-package.md)
- ADR 009: [docs/adr/009-git-context-security-architecture.md](../docs/adr/009-git-context-security-architecture.md)
- ADR 010: [docs/adr/010-command-discovery-protocol.md](../docs/adr/010-command-discovery-protocol.md)
- Security findings: Plan section on vulnerabilities (lines 43-48)
- Existing patterns: [src/lib/utils/git-utils.ts](../src/lib/utils/git-utils.ts)
