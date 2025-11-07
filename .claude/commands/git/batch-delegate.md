---
description: Batch commit specs and generate all delegation packages
tags: [workflow, delegation, batch, web]
---

# Batch Delegate

Convenience command that combines batch-commit-specs + multiple delegate commands.

**Purpose:**
One-command workflow to prepare multiple issues for parallel Claude Web delegation.

**Requirements:**

- Multiple spec files exist in `specs/` directory
- Working tree should be clean (no unrelated uncommitted changes)
- Specs have proper YAML frontmatter

**Workflow:**

1. User creates multiple specs: `/specify Issue #123`, `/specify Issue #124`, etc.
2. User runs: `/batch-delegate Issue #123, Issue #124, Issue #125`
3. Command automatically:
   - Commits all specs to timestamped batch branch
   - Generates delegation package for each issue
   - Saves each package to `/tmp/delegation-{ISSUE}.txt`
   - Displays summary with next steps

**Your Task:**

Given a comma-separated list of issue numbers, perform these steps:

1. **Parse Arguments:**
   - Extract issue numbers from comma-separated list
   - Example: "Issue #123, Issue #124, Issue #125" → [123, 124, 125]

2. **Run Batch Commit:**
   - Execute: `./scripts/delegation/batch-commit-specs.sh "{ISSUES}"`
   - If this fails, stop and show error
   - Capture the batch branch name from output

3. **Generate Delegation Packages:**
   - For each issue number, run: `./scripts/delegation/create-package.sh {ISSUE}`
   - Each package is saved to: `/tmp/delegation-{ISSUE}.txt`
   - Track which packages were created successfully

4. **Output Summary:**

   ```text
   ✅ Batch delegation ready!
   
   📦 Specs committed to: specs/batch-2025-11-07-1430
   
   📝 Delegation packages created:
      - /tmp/delegation-123.txt (Issue #123)
      - /tmp/delegation-124.txt (Issue #124)
      - /tmp/delegation-125.txt (Issue #125)
   
   🌐 Next steps (do in parallel):
   
   1. Open 3 Claude Code web sessions at https://claude.ai/code
   
   2. In each session, paste one delegation package:
      - Session 1: cat /tmp/delegation-123.txt | pbcopy
      - Session 2: cat /tmp/delegation-124.txt | pbcopy
      - Session 3: cat /tmp/delegation-125.txt | pbcopy
   
   3. Each Claude Web will:
      - Fetch spec from specs/batch-2025-11-07-1430
      - Create feature branch
      - Implement following spec
      - Create PR
   
   4. After all PRs created, review on desktop:
      gh pr list --author @me
      gh pr checkout <NUMBER>
      # Fix any metadata issues
      git push
   
   💡 Time saved: ~3 issues × 30 min = 90 min implementation
      Your time: ~15 min (5 min setup + 10 min reviews)
   ```

5. **Display First Package Preview:**
   - Show the first 30 lines of one delegation package
   - This lets user verify format before pasting

**Example Usage:**

```bash
# Complete batch delegation workflow
/batch-delegate Issue #123, Issue #124, Issue #125

# Alternative formats work too
/batch-delegate 123, 124, 125
```

**Error Handling:**

- Missing specs → Batch commit will fail, show which specs are missing
- Git errors → Show error from batch-commit-specs.sh
- Delegation package creation fails → Show which issues succeeded and which failed
- No issues provided → Show usage example

**Implementation Strategy:**

This command is essentially:

```bash
# Step 1: Commit all specs to batch branch
./scripts/delegation/batch-commit-specs.sh "123,124,125"

# Step 2: Generate delegation package for each issue
for issue in 123 124 125; do
  ./scripts/delegation/create-package.sh "$issue"
done

# Step 3: Show summary and next steps
```

**Pro Tips to Include in Output:**

- Suggest opening multiple browser tabs/windows for parallel work
- Remind user that each Claude Web session is independent
- Note that desktop review is still needed for PR metadata
- Emphasize time savings (implementation time vs user time)

**Time Estimates to Display:**

- 3 simple issues: ~90 min total implementation time
- With batch delegation: ~15 min user time (5 setup + 10 reviews)
- Best for: 3-5 issues that can run in parallel
