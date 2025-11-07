# ADR-009: Batch Delegation Workflow for Parallel Task Execution

**Status:** Accepted  
**Date:** 2025-11-07  
**Deciders:** Development Team  
**Issue:** #302

## Context

When delegating multiple simple tasks to Claude Code Web, the current workflow has several inefficiencies:

1. **Uncommitted specs** - `/specify` creates spec files that remain uncommitted, cluttering the working directory
2. **No branch tracking** - `/delegate` doesn't communicate where specs are located
3. **Manual repetition** - Each task requires separate `/specify` and `/delegate` commands
4. **Git confusion** - Unclear which branch owns which spec file

For projects with 3-5 simple issues ready for parallel implementation, this creates unnecessary friction and increases the risk of lost or misplaced specifications.

## Decision

We will implement a **batch delegation workflow** that enables parallel Claude Web task execution through:

### 1. Batch Spec Commitment

**Command:** `/batch-commit-specs Issue #123, Issue #124, Issue #125`

- Creates timestamped batch branch: `specs/batch-YYYY-MM-DD-HHMM`
- Commits all specified spec files atomically
- Pushes to remote for distributed access
- Solves "uncommitted specs" problem

### 2. Enhanced Delegation Packages

**Command:** `/delegate Issue #123` (enhanced)

- Includes current branch name in output
- Provides explicit git checkout instructions
- Claude Web knows exactly where to retrieve specs
- No ambiguity about spec location

### 3. Convenience Wrapper

**Command:** `/batch-delegate Issue #123, Issue #124, Issue #125`

- Combines batch-commit-specs + multiple delegate operations
- Generates all delegation packages in one command
- Saves to `/tmp/delegation-{ISSUE}.txt`
- Shows time savings estimate

### Technical Implementation

**Architecture:**

```text
bash scripts/
├── delegation/
│   ├── create-package.sh       # Enhanced: includes branch name
│   ├── batch-commit-specs.sh   # New: atomic spec commitment
│   └── batch-delegate.sh       # New: convenience wrapper
```

**Data Flow:**

1. Specs created individually via `/specify`
2. Batch commit collects specs into timestamped branch
3. Delegation packages reference the batch branch
4. Claude Web fetches specs from known branch
5. Desktop reviews PRs and merges

## Consequences

### Positive

- **Time Savings:** 3 issues = 90 min implementation → 15 min user time
- **Clean Git History:** All specs tracked in timestamped branches
- **No Lost Work:** Specs committed before delegation
- **Parallel Execution:** Multiple Claude Web sessions work independently
- **Clear Communication:** Delegation packages include exact git instructions

### Negative

- **Batch Branch Accumulation:** Old `specs/batch-*` branches need periodic cleanup
- **Learning Curve:** Users need to understand when to use batch vs single delegation
- **Branch Coordination:** Requires fetching batch branch in Claude Web environment

### Neutral

- **No Breaking Changes:** Existing `/specify` and `/delegate` workflows unchanged
- **Additive Only:** New commands supplement, don't replace, current workflow
- **Optional Usage:** Users can continue with single-issue delegation if preferred

## Alternatives Considered

### 1. Auto-commit Each Spec

**Rejected:** Creates noise with many small commits; harder to group related specs

### 2. Single Branch for All Specs

**Rejected:** Conflicts when multiple users create specs simultaneously

### 3. Spec Storage in Database/Cloud

**Rejected:** Overcomplicates architecture; git is already available

## Implementation Notes

- **Shellcheck Compliance:** Use `mapfile` for array assignment (SC2206)
- **Fallback Strategy:** If batch branch extraction fails, generate timestamp-based name
- **Error Handling:** Validate all specs exist before creating batch branch
- **Working Directory Check:** Ensure no uncommitted non-spec changes

## Validation

**Success Metrics:**

- Can delegate 3-5 issues without uncommitted files
- Each delegation package includes exact git instructions
- Claude Web successfully retrieves specs from batch branch
- Desktop working tree stays clean during parallel delegation

**Testing:**

- ✅ Bash syntax validation (`bash -n`)
- ✅ Help message display
- ✅ Multiple issue number formats supported
- ✅ Missing spec detection

## References

- Issue #302: Batch delegation workflow for parallel Claude Web tasks
- `docs/workflows/claude-web-delegation.md`: Comprehensive workflow guide
- `scripts/delegation/`: Implementation scripts
- `.claude/commands/git/`: Slash command definitions

## Related ADRs

- ADR-008: Sub-agent orchestration pattern (delegation is a form of task distribution)
- ADR-003: CI/CD automation suite (quality gates apply to delegation workflow)
