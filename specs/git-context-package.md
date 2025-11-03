---
id: SPEC-260
title: Git Context Package for Sub-Agents
type: spec
priority: p1
status: ready
lane: spec-driven
issue: 260
created: 2025-01-03
plan: plans/git-context-package.md
tasks: tasks/git-context-package.md
adr: docs/adr/009-git-context-security-architecture.md
---

# Git Context Package for Sub-Agents

## Summary

Create a reusable TypeScript package (`@shared/git-context`) that systematically extracts and structures git information (diffs, commits, branches, status) for injection into sub-agent prompts, eliminating ad-hoc git command execution and reducing token usage.

## Problem Statement

Sub-agents currently lack systematic git context injection, leading to:

1. **Ad-hoc context gathering**: Agents manually run `git diff`, `git log`, `git status` repeatedly
2. **Token waste**: Same git data fetched multiple times across agent conversations
3. **Inconsistent context**: Different agents get different views of the same git state
4. **Tool bypassing**: Agents use bash for git commands instead of structured context (violates ADR 010)
5. **Missing context**: Agents make decisions without full git history, diff analysis, or branch context

**Current workflow:**

```typescript
// Master agent runs:
await bash('git diff');
await bash('git log --online -10');
await bash('git status');

// Then manually parses output and passes to sub-agents
```

**Desired workflow:**

```typescript
// Master agent runs once:
const gitContext = await getGitContext();

// Injects structured context into sub-agents:
subAgent.invoke({ context: gitContext, task: '...' });
```

## Proposed Solution

Create `packages/git-context` with TypeScript utilities to extract, parse, and structure git information:

### Core API

```typescript
// packages/git-context/src/index.ts
export interface GitContext {
  repository: RepositoryInfo;
  branch: BranchInfo;
  status: GitStatus;
  recentCommits: Commit[];
  diff: ParsedDiff;
  changedFiles: ChangedFile[];
}

export function getGitContext(options?: GitContextOptions): Promise<GitContext>;
export function parseDiff(diffOutput: string): ParsedDiff;
export function parseCommitHistory(logOutput: string): Commit[];
export function getCurrentBranch(): Promise<BranchInfo>;
export function getChangedFiles(options?: { staged?: boolean }): Promise<ChangedFile[]>;
```

### Integration Points

1. **Master Agent**: Calls `getGitContext()` once per session, injects into all sub-agents
2. **Research Agent**: Uses `changedFiles` to focus research on modified areas
3. **Security Scanner**: Uses `changedFiles` to limit scanning scope
4. **Code Agent**: Uses `diff` to understand what changed before modifying code
5. **Docs Agent**: Uses `diff` to detect API changes requiring doc updates

### Implementation Strategy

**Phase 1: Core Package (3-4 hours)**

- Turborepo package setup at `packages/git-context`
- Core utilities: `git-log.ts`, `git-status.ts`, `git-diff.ts`, `types.ts`
- Use `spawnSync` with Zod validation for defense-in-depth security
- Unit tests with vitest (>80% coverage)

**Phase 2: Integration (2-3 hours)**

- Update master agent to call `getGitContext()`
- Inject context into sub-agent prompts
- Update ADR 009 with git-context usage patterns
- Add caching to prevent redundant git calls

**Phase 3: Advanced Features (2-3 hours, optional)**

- Conventional commit type inference
- Scope detection from file paths
- Conflict detection
- Blame analysis for code ownership

## Acceptance Criteria

### Core Package

- [ ] Package created at `packages/git-context` with `@shared/git-context` namespace
- [ ] Exports `getGitContext()` function returning complete `GitContext` object
- [ ] Implements `parseDiff()`, `parseCommitHistory()`, `getCurrentBranch()`, `getChangedFiles()` utilities
- [ ] All functions have TypeScript types and JSDoc documentation
- [ ] Unit tests achieve >80% code coverage
- [ ] Package builds successfully with `pnpm build`
- [ ] Minimal production dependencies (only Zod for runtime validation security)

### Integration

- [ ] Master agent calls `getGitContext()` once per session
- [ ] Git context injected into Research Agent, Security Scanner, Code Agent, Docs Agent prompts
- [ ] Sub-agents access context via `context.gitStatus`, `context.recentCommits`, etc.
- [ ] No sub-agents use `bash("git ...")` commands (validated via logs)
- [ ] Token usage reduced by 30%+ compared to manual git command approach

### Documentation

- [ ] README.md in `packages/git-context` with usage examples
- [ ] API documentation with JSDoc for all exported functions
- [ ] ADR 009 updated with git-context integration patterns
- [ ] Example integration added to at least 2 sub-agent templates

### Quality

- [ ] TypeScript compilation passes with no errors
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Error handling covers: not a git repo, git command failures, malformed output

## Technical Constraints

1. **Monorepo conventions**: Must follow existing patterns in `packages/shared` (TypeScript, vitest, focused modules)
2. **Minimal dependencies**: Use Node.js `child_process.spawnSync` with Zod validation (defense-in-depth security). Avoid heavy git libraries (simple-git, nodegit)
3. **GitContext interface**: Must match ADR 009 specification for agent compatibility
4. **Command Discovery Protocol**: Must support ADR 010's context injection pattern
5. **Performance**: Context extraction must complete in <500ms for typical repos
6. **Compatibility**: Must work on macOS, Linux, Windows (git CLI required)

## Success Metrics

1. **Token reduction**: 30%+ reduction in token usage for git-related operations
2. **Performance**: Context extraction completes in <500ms
3. **Adoption**: 100% of sub-agents use git-context instead of bash git commands
4. **Code coverage**: >80% test coverage for all utilities
5. **Error rate**: <1% git parsing errors in production usage

## Out of Scope

1. **GitHub API integration**: This package focuses on local git operations, not GitHub REST/GraphQL API
2. **Git write operations**: Only read operations (log, status, diff, branch). No commits, pushes, merges.
3. **Browser support**: Node.js only (requires git CLI and child_process)
4. **Advanced git operations**: No rebase, cherry-pick, stash analysis (focus on basics first)
5. **Git LFS support**: Large file support deferred to future enhancement

## References

### Similar Implementations Found

- [scripts/changelog.js:3-15](../scripts/changelog.js#L3-L15) - Git log extraction using `execSync`
- [scripts/changelog.js:20-35](../scripts/changelog.js#L20-L35) - Commit parsing with conventional commit format extraction
- [.github/workflows/pr-review.yml:17-20](../.github/workflows/pr-review.yml#L17-L20) - Git diff extraction pattern

### Architecture Documents

- [ADR 009: GitHub Integration Architecture](../docs/adr/009-github-integration-architecture.md) - Defines `GitContext` interface structure
- [ADR 010: Command Discovery Protocol](../docs/adr/010-command-discovery-protocol.md) - Establishes context injection over bash commands

### External Inspiration

- [Superclaude git context](https://github.com/gwendall/superclaude) - Referenced in issue #260 as inspiration

### Related Issues

- #257 - Integrate sub-agents into workflow lanes
- #259 - Structured prompt templates (depends on git-context for context injection)
