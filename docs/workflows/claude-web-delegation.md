# Claude Code Web Delegation Guide

## Quick Answer

**Claude Code web is best for simple lane issues. Choose your workflow:**

### Single Issue Workflow (4 steps)

1. **You (Desktop):** Ask if issue is suitable → `/specify Issue #XXX`
2. **You (Desktop):** Review spec → `/delegate Issue #XXX`
3. **Delegate:** Paste into Claude web
4. **You (Desktop):** Review PR, fix metadata, merge

### Batch Workflow (for 3-5 issues in parallel)

1. **You (Desktop):** Create specs → `/specify Issue #123`, `/specify Issue #124`, ...
2. **You (Desktop):** Batch delegate → `/batch-delegate Issue #123, Issue #124, Issue #125`
3. **Delegate:** Open 3+ Claude web sessions, paste each package
4. **You (Desktop):** Review all PRs, fix metadata, merge

**Time savings:** 3 issues = ~90 min → ~15 min of your time

## What Claude Web Can Do

✅ Read and write code
✅ Run bash commands (npm, pnpm, build, test)
✅ Create branches and commits
✅ Create PRs (but needs help with formatting)

❌ Can't read GitHub issues
❌ Can't use slash commands
❌ Can't access project templates/workflows

## Optimal Workflow: The "Delegation Package"

### Step 1: Verify Suitability (You - Desktop)

Ask Claude: "Is issue #XXX suitable for Claude web delegation?"

**Good candidates:**

- Simple lane (1-2 file changes)
- Clear requirements
- Bug fixes with known solutions
- Refactoring with clear patterns

### Step 2: Create the Spec (You - Desktop)

```bash
# For simple lane issues:
/specify Issue #XXX

# Review and edit the spec if needed
# Ensures: specs/XXX-feature-name.md
```

### Step 3: Generate Delegation Package (You - Desktop)

#### Option A: Use the slash command (recommended)

```bash
/delegate Issue #XXX
```

This automatically:

- ✅ Validates spec exists and has proper frontmatter
- ✅ Fetches issue details from GitHub
- ✅ Generates ready-to-paste package
- ✅ Copies to clipboard
- ✅ Shows preview

#### Option B: Use the script manually

Run this command to create a ready-to-paste package:

```bash
gh issue view XXX --json number,title,body,labels > /tmp/issue-XXX.json && \
cat specs/XXX-*.md > /tmp/spec-XXX.md && \
echo "=== DELEGATION PACKAGE FOR ISSUE #XXX ===" && \
echo "" && \
echo "## Issue Details" && \
cat /tmp/issue-XXX.json | jq -r '"**#\(.number)**: \(.title)\n\n\(.body)"' && \
echo "" && \
echo "---" && \
echo "" && \
echo "## Spec" && \
cat /tmp/spec-XXX.md && \
echo "" && \
echo "---" && \
echo "" && \
echo "## PR Requirements" && \
cat .github/pull_request_template.md
```

**Or manually copy-paste these 3 things:**

1. Issue body from GitHub (or `gh issue view XXX`)
2. Spec file content (`specs/XXX-*.md`)
3. PR template (`.github/pull_request_template.md`)

### Step 4: Paste into Claude Web

Paste the package (from clipboard or `/tmp/delegation-XXX.txt`) into Claude Code web at <https://claude.ai/code>

The package already includes all instructions, so just paste and Claude web will handle the rest!

### Step 5: Review and Merge (You - Desktop)

After Claude web creates the PR:

```bash
# Check out the PR
gh pr checkout XXX

# Fix any metadata issues (like we just did for #300)
# Usually just need to:
# - Verify PR title format
# - Check traceability is complete
# - Ensure spec references are correct

# Push fixes
git push
```

## Example: Issue #258 Style Delegation

Here's how you would have delegated #258:

**Your message to Claude web:**

```text
Please fix this bug following our project standards:

## Issue #258: Fix invalid JSON cast in RLS validation script

[paste issue body]

## Spec (SPEC-258)

[paste specs/258-fix-rls-json-cast.md]

## Requirements

1. Fix line 160 in scripts/db/validate-rls.ts as specified
2. Test locally with: SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=xxx pnpm tsx scripts/db/validate-rls.ts
3. Create branch: feature/258-fix-rls-json-cast
4. Commit message: "fix: PostgreSQL JSON serialization in RLS validation (Issue #258)"
5. Create PR with:
   - Spec ID: SPEC-258
   - Issue: #258
   - Proper summary from spec

[paste .github/pull_request_template.md]
```

## When to Use Claude Web

### ✅ Good Candidates

- **Simple lane** issues (1-2 file changes)
- **Clear specs** with explicit steps
- **Bug fixes** with known solutions
- **Refactoring** with clear patterns
- **Documentation** updates

### ❌ Not Good For

- **Complex features** needing spec-driven workflow
- **Database migrations** requiring RLS policies
- **Multi-package changes** across monorepo
- **Anything requiring** `/git:workflow` or sub-agents

## Pro Tips

### 1. Pre-populate the Spec

Instead of having Claude web create the spec, you create it on desktop and include it in the delegation package. This ensures:

- Proper YAML frontmatter
- Correct spec ID format
- Follows project conventions

### 2. Include Test Instructions

Be explicit about what to test:

```markdown
Test checklist:
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] pnpm test passes
- [ ] Manual test: [specific test command]
```

### 3. Reference Similar PRs

Include a link to a good example PR:

```text
Format your PR similar to: https://github.com/org/repo/pull/256
```

### 4. Use Desktop for Final Review

Always do the final review on desktop where you have:

- Full git workflows
- Slash commands for `/review`, `/test`
- Access to quality gates

## Quick Commands for Delegation

```bash
# Create delegation package (simple version)
gh issue view XXX > delegation.txt && \
cat specs/XXX-*.md >> delegation.txt && \
echo "Ready to paste: delegation.txt"

# After Claude web creates PR, check it:
gh pr view XXX --json title,body,headRefName

# Fix it on desktop:
gh pr checkout XXX
# [make fixes]
git push
```

## Time Savings

**Without delegation:**

- You: 30-60 min implementation
- Total: 30-60 min

**With web delegation:**

- You: 5 min (create spec + package)
- Claude web: 10-20 min (implementation)
- You: 5 min (review + fix metadata)
- Total: 20-30 min, but only 10 min of YOUR time

**Best for:** When you have 3+ simple issues to delegate in parallel.

## Batch Delegation Workflow (New!)

### When to Use Batch Mode

Use batch delegation when you have:

- **3-5 simple issues** ready to implement
- **All specs created** and reviewed
- **Clean working tree** (no uncommitted work)
- **Time to review** multiple PRs in parallel

### Phase 1: Create All Specs

Create specs for each issue individually:

```bash
/specify Issue #123  # Creates specs/123-feature-one.md
/specify Issue #124  # Creates specs/124-feature-two.md
/specify Issue #125  # Creates specs/125-feature-three.md
```

Review each spec to ensure quality before delegation.

### Phase 2: Batch Commit (Option A - Manual)

Commit all specs to a batch branch:

```bash
/batch-commit-specs Issue #123, Issue #124, Issue #125
```

This creates:

- Branch: `specs/batch-2025-11-07-1430` (timestamped)
- Commits all 3 specs
- Pushes to remote
- Outputs branch name for delegation packages

### Phase 2: Batch Delegate (Option B - Convenience)

Or use the all-in-one command:

```bash
/batch-delegate Issue #123, Issue #124, Issue #125
```

This automatically:

1. ✅ Commits specs to batch branch
2. ✅ Generates delegation package for each issue
3. ✅ Saves packages to `/tmp/delegation-{ISSUE}.txt`
4. ✅ Displays summary with next steps

### Phase 3: Parallel Delegation

Open 3 Claude Code web sessions (different browser tabs/windows):

**Session 1:**

```bash
cat /tmp/delegation-123.txt | pbcopy
# Paste into Claude web
```

**Session 2:**

```bash
cat /tmp/delegation-124.txt | pbcopy
# Paste into Claude web
```

**Session 3:**

```bash
cat /tmp/delegation-125.txt | pbcopy
# Paste into Claude web
```

Each Claude web will:

1. Fetch spec from `specs/batch-YYYY-MM-DD-HHMM`
2. Create feature branch: `feature/XXX-description`
3. Implement following the spec
4. Create PR

### Phase 4: Review All PRs

After all Claude web sessions complete:

```bash
# List recent PRs
gh pr list --author @me

# Review each PR
gh pr checkout 123
# Check implementation
# Fix any metadata issues
git push

gh pr checkout 124
# Repeat...
```

### Batch Workflow Benefits

**Time Comparison (3 simple issues):**

| Approach | Implementation Time | Your Active Time |
|----------|-------------------|------------------|
| Manual (you code) | 90 min | 90 min |
| Single delegation | 60 min | 30 min (10 min × 3) |
| Batch delegation | 60 min | **15 min** (5 setup + 10 review) |

**Key Advantage:** While Claude web sessions run in parallel, you're free to:

- Work on complex issues
- Review other PRs
- Take a coffee break ☕

### Batch Workflow Commands Reference

```bash
# Create specs (one by one)
/specify Issue #123
/specify Issue #124
/specify Issue #125

# Option A: Two-step batch delegation
/batch-commit-specs Issue #123, Issue #124, Issue #125
/delegate Issue #123  # Generates package with batch branch reference
/delegate Issue #124
/delegate Issue #125

# Option B: One-step batch delegation (recommended)
/batch-delegate Issue #123, Issue #124, Issue #125
# Outputs 3 packages ready to paste

# After PRs created
gh pr list --author @me
gh pr checkout <NUMBER>
git push
```

### Troubleshooting Batch Delegation

**Problem:** Uncommitted specs hanging around

**Solution:** That's what batch mode solves! All specs are committed to the batch branch.

---

**Problem:** Claude web can't find the spec

**Solution:** Check the delegation package includes correct branch name. The package should say: "The spec file is located on branch: `specs/batch-YYYY-MM-DD-HHMM`"

---

**Problem:** Multiple batch branches piling up

**Solution:** After all PRs are merged, clean up batch branches:

```bash
git branch -r | grep 'specs/batch-' | xargs git push origin --delete
```

---

**Problem:** One issue fails but others succeed

**Solution:** That's fine! Review and merge the successful PRs. Re-delegate the failed one individually.

## Next Steps

The delegation workflow is now fully automated with:

1. ✅ **Scripts created:** `scripts/delegation/create-package.sh`, `batch-commit-specs.sh`, `batch-delegate.sh`
2. ✅ **Commands available:** `/delegate`, `/batch-commit-specs`, `/batch-delegate`
3. ✅ **Documentation complete:** This guide covers both single and batch workflows

## References

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Project standards
- [docs/ai/CLAUDE.md](../ai/CLAUDE.md) - Workflow overview
- [.github/pull_request_template.md](../../.github/pull_request_template.md) - PR format
