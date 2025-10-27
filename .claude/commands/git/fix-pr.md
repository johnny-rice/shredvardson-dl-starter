---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:fix-pr'
version: '1.0.0'
lane: 'lightweight'
tags: ['git', 'pr', 'ci', 'automation', 'feedback']
deprecated: true
deprecation_notice: >
  DEPRECATED: This command is being migrated to the `git-workflow` Skill (Phase 3).
  Use `/git pr fix` instead. This command will remain functional during the
  12-week transition period. See docs/adr/002-skills-architecture.md for details.
when_to_use: >
  Automatically address PR feedback from CI checks, CodeRabbit, and doctor failures.

arguments:
  - name: prNumber
    type: string
    required: false
    example: '135'
    description: 'PR number to fix (defaults to current branch PR)'
  - name: --dry-run
    type: flag
    required: false
    description: 'Preview fixes without applying them'

inputs: []
outputs:
  - type: 'artifact-links'
  - type: 'learning-capture'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#/gitOperations'

allowed-tools:
  - 'Bash(gh pr checks:*)'
  - 'Bash(gh pr view:*)'
  - 'Bash(gh pr edit:*)'
  - 'Bash(gh run view:*)'
  - 'Bash(git status:*)'
  - 'Bash(git add:*)'
  - 'Bash(git commit:*)'
  - 'Bash(git push:*)'
  - 'Bash(pnpm doctor:*)'
  - 'Bash(pnpm constitution:update:*)'
  - 'Bash(pnpm lint:*)'
  - 'Bash(pnpm typecheck:*)'
  - 'Read(CLAUDE.md)'
  - 'Edit(CLAUDE.md)'
  - 'SlashCommand(/ops:learning-capture:*)'

preconditions:
  - 'PR exists for current branch'
  - 'CI checks have run'
  - 'Working directory is clean or changes are stashed'
postconditions:
  - 'Auto-fixable issues resolved'
  - 'Commits pushed to PR'
  - 'Micro-lessons captured for reusable patterns'
  - 'Summary report generated'

artifacts:
  produces:
    - { path: 'fix-pr-report.md', purpose: 'Summary of fixes applied' }
    - { path: 'docs/micro-lessons/*.md', purpose: 'Micro-lessons for reusable patterns' }
  updates: []

permissions:
  tools:
    - name: 'git'
      ops: ['status', 'add', 'commit', 'push']
    - name: 'github'
      ops: ['pr-view', 'pr-checks', 'run-view']
    - name: 'pnpm'
      ops: ['doctor', 'lint', 'typecheck', 'constitution:update']

timeouts:
  softSeconds: 300
  hardSeconds: 600

idempotent: false
dryRun: true
estimatedRuntimeSec: 180
costHints: 'Medium I/O; multiple CI/git operations'

references:
  - 'docs/constitution.md#git-workflow'
  - 'CLAUDE.md#pr-rules'
  - 'docs/micro-lessons/README.md'
  - 'git/shared/common-git-workflow.md'
  - 'git/shared/branch-validation.md'
  - 'git/shared/error-handling.md'
  - 'git/shared/commit-formatting.md'
---

**Slash Command:** `/git:fix-pr`

**Goal:**
Automatically fetch PR feedback from all sources (CI, CodeRabbit, doctor) and fix issues iteratively.

**Shared Patterns:**

- **Validation**: See [branch-validation.md](./shared/branch-validation.md) for PR validation patterns
- **Workflow**: See [common-git-workflow.md](./shared/common-git-workflow.md) for git best practices
- **Error Handling**: See [error-handling.md](./shared/error-handling.md) for error recovery patterns
- **Commit Format**: See [commit-formatting.md](./shared/commit-formatting.md) for commit message standards

**Prompt:**

1. **Validate environment** (see `branch-validation.md`):
   - Confirm lane (**lightweight**) against `CLAUDE.md` decision rules
   - If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`
   - Check git status using patterns from `common-git-workflow.md`
   - Verify we're on a feature branch (not main/master)
   - Confirm PR exists using patterns from `branch-validation.md`

2. **Wait for CI checks** (see `error-handling.md` for timeout patterns):
   - Fetch PR checks: `gh pr checks [PR_NUMBER]`
   - If checks pending, wait up to 5 minutes (poll every 30s)
   - Use retry/timeout patterns from `error-handling.md`

3. **EVIDENCE GATHERING** (Phase 1: Multi-layer diagnostics - Issue #209 Phase 3):

   **Source:** Adapted from [obra/superpowers:systematic-debugging](https://github.com/obra/superpowers)

   **Protocol:** Gather diagnostic evidence BEFORE proposing fixes

   For multi-component CI failures, add diagnostic logging at each boundary:

   ```bash
   # Layer 1: CI Workflow Environment
   echo "=== CI Environment Variables ===" && env | grep -E "(NODE_|NPM_|GITHUB_|VERCEL_)"

   # Layer 2: Build Script Environment
   echo "=== Build Environment ===" && pnpm run check-env

   # Layer 3: Operation Execution
   echo "=== Running Operation ===" && pnpm build --verbose
   ```

   **Analysis Steps:**
   1. Identify which layer fails (don't guess)
   2. Focus investigation on specific failing component
   3. Understand WHY it failed (not just what)
   4. ONLY THEN propose fix

   **Evidence to Collect:**
   - **CI checks:** `gh pr checks [PR_NUMBER]` (status, failures)
   - **Workflow logs:** `gh run view [RUN_ID] --log-failed` (full output)
   - **PR comments:** `gh pr view [PR_NUMBER] --comments` (CodeRabbit, reviewers)
   - **Doctor artifacts:** Check for `doctor-report.json` in CI artifacts
   - **Environment state:** Variables, dependencies, file presence
   - **Layer boundaries:** Where does the failure originate?

4. **Categorize issues:**
   - **Auto-fixable:** CLAUDE.md line count, constitution checksum, ADR compliance, formatting, simple type errors
   - **Pre-existing:** Check if error exists on base branch, skip with note
   - **Manual:** Complex logic errors, architecture decisions, report with guidance

5. **Fix iteratively with Circuit Breaker** (Issue #209 Phase 4):

   **Circuit Breaker Rule:** Stop after 3 failed fix attempts

   ```text
   Fix #1 fails → Try Fix #2
   Fix #2 fails → Try Fix #3
   Fix #3 fails → STOP

   Question: "Is this architecture fundamentally sound?"
   Discuss with human before attempting Fix #4
   ```

   **Fix Process:**
   - Track fix attempts per issue (max 3)
   - Fix issues one at a time
   - Create separate commits using format from `commit-formatting.md`
   - Re-validate after each fix
   - If fix breaks something, revert and mark as manual
   - Use error recovery patterns from `error-handling.md`
   - Push all commits together at the end

   **After 3rd Failed Fix:**
   - STOP attempting more fixes
   - Report pattern: "Each fix reveals new coupling in different files"
   - Ask: "Should we refactor the architecture instead of Fix #4?"
   - Require human decision before proceeding

6. **Capture micro-lessons:**
   - After fixing, analyze if pattern is reusable
   - Check if similar lesson exists in `docs/micro-lessons/`
   - If new pattern, create micro-lesson using `/ops:learning-capture`
   - Include in summary: "📝 Created micro-lesson: X"

7. **Generate report:**
   - Summary of fixes applied (count, type)
   - Pre-existing issues skipped (count, type)
   - Manual issues requiring attention (with guidance)
   - Micro-lessons captured (list with links)
   - Next steps (re-check CI, review changes, merge)

8. **Emit Result:**
   - Fixes applied count
   - Commits pushed
   - Micro-lessons captured
   - Link to fix report artifact
   - Next suggested command (`gh pr checks`, `gh pr merge`)

**Examples:**

```bash
# Fix current branch's PR
/git:fix-pr

# Fix specific PR by number
/git:fix-pr 135

# Preview fixes without applying
/git:fix-pr --dry-run
```

**Implementation:**

Follow these steps, referencing shared templates:

1. **Validate environment** using `branch-validation.md` and `common-git-workflow.md`
2. **Wait for CI** using timeout patterns from `error-handling.md`
3. **Fetch feedback** from all sources
4. **Categorize** issues (auto-fixable, pre-existing, manual)
5. **Fix iteratively** using commit format from `commit-formatting.md`
6. **Handle errors** using patterns from `error-handling.md`
7. **Generate report** and capture micro-lessons

For complete validation, error handling, and commit formatting implementations, reference the shared templates.
