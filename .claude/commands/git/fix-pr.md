---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:fix-pr'
version: '1.0.0'
lane: 'lightweight'
tags: ['git', 'pr', 'ci', 'automation', 'feedback']
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
riskPolicyRef: 'docs/llm/risk-policy.json#gitOperations'

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
---

**Slash Command:** `/git:fix-pr`

**Goal:**
Automatically fetch PR feedback from all sources (CI, CodeRabbit, doctor) and fix issues iteratively.

**Prompt:**

1. **Validate environment:**
   - Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
   - If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
   - Check git status (warn if uncommitted changes)
   - Verify we're on a feature branch (not main/master)
   - Confirm PR exists for current branch or use provided PR number

2. **Wait for CI checks:**
   - Fetch PR checks: `gh pr checks [PR_NUMBER]`
   - If checks are pending, wait up to 5 minutes (poll every 30s)
   - If timeout, report status and ask user to re-run later

3. **Fetch all feedback:**
   - **CI checks:** `gh pr checks [PR_NUMBER]`
   - **PR comments:** `gh pr view [PR_NUMBER] --comments`
   - **Doctor artifacts:** Check for `doctor-report.json` in CI artifacts
   - **Failed workflow details:** `gh run view [RUN_ID]` for failed checks

4. **Categorize issues:**
   - **Auto-fixable:**
     - CLAUDE.md line count (condense sections)
     - Constitution checksum (`pnpm constitution:update`)
     - ADR compliance (add missing labels)
     - Documentation wording (CodeRabbit suggestions)
     - Formatting issues (`pnpm lint --fix`)
     - Type errors (if simple)
   - **Pre-existing:**
     - Check if error exists on base branch
     - Skip with note in report
   - **Manual:**
     - Complex logic errors
     - Architecture decisions
     - Report with guidance for user

5. **Fix iteratively:**
   - Fix issues one at a time
   - Create separate commit for each fix
   - Re-validate after each fix
   - If fix breaks something, revert and mark as manual
   - Push all commits together at the end

6. **Capture micro-lessons:**
   - After fixing, analyze if pattern is reusable
   - Check if similar lesson exists in `docs/micro-lessons/`
   - If new pattern, create micro-lesson using `/ops:learning-capture`
   - Include in summary: "📝 Created micro-lesson: X"

   **When to create micro-lessons:**
   - Repeated failure patterns
   - Non-obvious fixes
   - Tool-specific quirks
   - Best practices discovered

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

**Edge Cases Handled:**

1. **Pre-existing failures:** Check base branch, skip with note
2. **Infrastructure-only PRs:** Handle skipped jobs gracefully
3. **Uncommitted changes:** Warn user, offer to stash
4. **CI still running:** Wait with timeout (5min)
5. **CodeRabbit not ready:** Optional, proceed with CI only
6. **Conflicting fixes:** Iterative approach, re-validate each
7. **Non-auto-fixable:** Detect, report with guidance
8. **Label overrides:** Use `gh pr edit --add-label`
9. **Draft/bot PRs:** Check permissions before proceeding
10. **Concurrent fixes:** Pull latest, handle merge conflicts

**Examples:**

```bash
# Fix current branch's PR
/git:fix-pr

# Fix specific PR by number
/git:fix-pr 135

# Preview fixes without applying
/git:fix-pr --dry-run

# Fix specific PR in dry-run mode
/git:fix-pr 135 --dry-run
```

**Example Output:**

```bash
🔍 Fetching feedback for PR #135...
📊 Found 4 issues: 3 auto-fixable, 1 pre-existing

1️⃣ Fixing CLAUDE.md line count... ✅
2️⃣ Fixing documentation wording... ✅
3️⃣ Adding error logging... ✅
⏭️  Skipping pre-existing typecheck failure

✅ Fixed 3 issues, pushed 3 commits
⏭️  Skipped 1 pre-existing issue

📝 Captured learnings:
   - Created micro-lesson: doctor-checks-iterative-fixing.md
   - Pattern: Fix doctor failures one at a time for easier debugging

💡 Next steps:
   - Review changes: git log -3
   - Check CI: gh pr checks 135
   - Merge when green: gh pr merge 135
```

**Failure & Recovery:**

- If no PR found → suggest creating one with `/git:prepare-pr`
- If CI checks not available → suggest waiting or checking workflow status
- If all issues are manual → report findings and suggest manual review
- If git push fails → check for conflicts and suggest pulling latest
- If micro-lesson creation fails → continue with fixes, log warning

**Implementation Notes:**

This command orchestrates multiple tools and workflows:

1. Uses `gh` CLI for PR/CI interaction
2. Uses git commands for fixing and committing
3. Uses pnpm scripts for validation and fixes
4. Uses `/ops:learning-capture` for micro-lessons
5. Generates markdown artifacts for traceability

The command follows the "fix iteratively" pattern to ensure each fix is isolated and can be reverted if needed. This is a key learning that should be captured as a micro-lesson on first successful run.
