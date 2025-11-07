---
description: Commit multiple spec files to a batch branch for delegation
tags: [workflow, delegation, batch, web]
---

# Batch Commit Specs

Commit multiple spec files to a dedicated batch branch for parallel Claude Web delegation.

**Purpose:**
Solves the "uncommitted specs hanging around" problem by committing all specs to a timestamped batch branch before delegation.

**Requirements:**

- Multiple spec files exist in `specs/` directory
- Working tree should be clean (no unrelated uncommitted changes)
- Spec files have proper YAML frontmatter

**Workflow:**

1. User creates multiple specs: `/specify Issue #123`, `/specify Issue #124`, etc.
2. User runs: `/batch-commit-specs Issue #123, Issue #124, Issue #125`
3. Command creates branch `specs/batch-YYYY-MM-DD-HHMM`, commits all specs, pushes
4. User can now run `/delegate` for each issue, knowing specs are tracked in git

**Your Task:**

Given a comma-separated list of issue numbers, perform these steps:

1. **Parse Arguments:**
   - Extract issue numbers from comma-separated list
   - Example: "Issue #123, Issue #124, Issue #125" → [123, 124, 125]
   - Support various formats: "123, 124, 125" or "#123, #124" or "Issue #123, Issue #124"

2. **Validate Prerequisites:**
   - For each issue number, check that spec file exists: `specs/{ISSUE_NUM}-*.md`
   - If any spec is missing, list which ones and exit with error
   - Check working directory has no uncommitted changes to other files
   - If uncommitted non-spec changes exist, warn and exit

3. **Create Batch Branch:**
   - Generate branch name: `specs/batch-{TIMESTAMP}`
   - Timestamp format: `YYYY-MM-DD-HHMM` (e.g., `specs/batch-2025-11-07-1430`)
   - Create and switch to the branch: `git switch -c specs/batch-{TIMESTAMP}`

4. **Stage and Commit Specs:**
   - Stage all matching spec files: `git add specs/{ISSUE_NUM}-*.md` for each issue
   - Create commit with message:

     ```text
     spec: batch of N specs for web delegation

     Specs for issues: #123, #124, #125

     These specs are ready for parallel delegation to Claude Code Web.
     Each spec can be retrieved via git checkout from this branch.
     ```

5. **Push Branch:**
   - Push to remote: `git push -u origin specs/batch-{TIMESTAMP}`
   - Handle push failures gracefully

6. **Output Format:**

   ```text
   ✅ Batch specs committed successfully!
   
   📦 Branch: specs/batch-2025-11-07-1430
   📝 Specs committed:
      - specs/123-feature-name.md (Issue #123)
      - specs/124-another-feature.md (Issue #124)  
      - specs/125-third-feature.md (Issue #125)
   
   🔗 Pushed to: origin/specs/batch-2025-11-07-1430
   
   🌐 Next steps:
      1. Run /delegate Issue #123 (and #124, #125)
      2. Each delegation package will reference this branch
      3. Claude Web will fetch specs from: specs/batch-2025-11-07-1430
   
   💡 Or use the convenience command:
      /batch-delegate Issue #123, Issue #124, Issue #125
   ```

**Example Usage:**

```bash
# Create and commit multiple specs at once
/batch-commit-specs Issue #123, Issue #124, Issue #125

# Alternative formats (all work the same):
/batch-commit-specs 123, 124, 125
/batch-commit-specs #123, #124, #125
```

**Error Handling:**

- Missing spec files → List which specs are missing, suggest running `/specify` first
- Uncommitted changes → Warn that working tree must be clean (except for spec files)
- Git errors → Show error and suggest manual git operations
- No issues provided → Show usage example

**Edge Cases:**

- Single issue: Still works, creates batch branch with 1 spec
- Duplicate issues: Deduplicate the list
- Invalid issue numbers: Validate format and skip invalid ones with warning

**Implementation Notes:**

- Use bash date command for timestamp: `date +%Y-%m-%d-%H%M`
- Use `git add` for each spec individually to avoid staging unrelated files
- Verify push succeeded before showing success message
- Store branch name for use by `/delegate` command
