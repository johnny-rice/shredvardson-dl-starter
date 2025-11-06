---
description: Package an issue for Claude Code web delegation
tags: [workflow, delegation, web]
---

# Delegate Issue to Claude Code Web

Package a specified issue with its spec for delegation to Claude Code web.

**Requirements:**

- Issue spec must already exist (run `/specify Issue #{{ISSUE_NUMBER}}` first)
- Spec must have proper YAML frontmatter
- Issue must be suitable for web delegation (simple lane, 1-2 files)

**Workflow:**

1. User identifies suitable issue for web delegation
2. User runs `/specify Issue #{{ISSUE_NUMBER}}` and reviews spec
3. User runs `/delegate Issue #{{ISSUE_NUMBER}}` (this command)
4. User copies output and pastes into Claude Code web

**Your Task:**

Given the issue number `{{ISSUE_NUMBER}}`, perform these steps:

1. **Validate Prerequisites:**
   - Check that spec file exists: `specs/{{ISSUE_NUMBER}}-*.md`
   - If no spec exists, output: "❌ No spec found. Run `/specify Issue #{{ISSUE_NUMBER}}` first."
   - Verify spec has proper YAML frontmatter (id, type, status)
   - If spec is malformed, warn and suggest fixes

2. **Generate Delegation Package:**
   - Use the script: `./scripts/delegation/create-package.sh {{ISSUE_NUMBER}}`
   - The script will automatically:
     - Fetch issue details from GitHub
     - Include the spec file
     - Add implementation requirements
     - Include PR template
     - Copy to clipboard (if supported)

3. **Output Format:**

   ```text
   ✅ Delegation package ready for Issue #{{ISSUE_NUMBER}}

   📋 Copied to clipboard!

   🌐 Next steps:
   1. Open https://claude.ai/code
   2. Paste the delegation package (Cmd+V / Ctrl+V)
   3. Claude web will implement following the spec
   4. Review the PR on desktop and fix any metadata

   💡 After PR is created:
      gh pr checkout <PR-NUMBER>
      # Review and fix metadata if needed
      git push
   ```

4. **Also Display Preview:**
   - Show first 50 lines of the delegation package
   - This lets the user verify before pasting

**Example Usage:**

```bash
# User runs:
/delegate Issue #258

# Output:
✅ Delegation package ready for Issue #258
📋 Copied to clipboard!
... (rest of output)
```

**Error Handling:**

- No spec file → Tell user to run `/specify` first
- Invalid spec frontmatter → Show what's wrong
- GitHub API errors → Suggest checking connection
- Script errors → Show error and suggest manual approach

**Note:** This command assumes the issue is suitable for web delegation. For complex features, database migrations, or multi-package changes, use the full desktop workflow instead.
