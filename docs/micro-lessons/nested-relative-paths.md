---
UsedBy: 0
Severity: normal
---

# Fix Relative Paths When Moving Files to Nested Directories
**Context.** CodeRabbit flagged multiple broken links in docs/ai/CLAUDE.md after file relocation, requiring different relative path depths.
**Rule.** **When moving files to nested directories, update all relative links by calculating the correct number of `../` traversals.**
**Example.**
```bash
# File moved from root to docs/ai/CLAUDE.md

# ❌ Links break after move (incorrect relative paths)
# LINK_TO: docs/constitution.md        # Looks for docs/ai/docs/constitution.md
# LINK_TO: CONTRIBUTING.md             # Looks for docs/ai/CONTRIBUTING.md  
# LINK_TO: .claude/commands/spec/specify.md # Looks for docs/ai/.claude/commands/...

# ✅ Fixed relative paths from docs/ai/
# LINK_TO: ../constitution.md          # Up 1 level to docs/constitution.md
# LINK_TO: ../../CONTRIBUTING.md       # Up 2 levels to root/CONTRIBUTING.md
# LINK_TO: ../../.claude/commands/spec/specify.md # Up 2 levels to root/.claude/...
```
**Guardrails.**
- Test links after file moves with `pnpm tsx scripts/docs-check.ts`
- Use path.relative() in Node.js to calculate correct paths programmatically
- Consider using absolute paths from repository root for stability

**Tags.** documentation,relative-paths,file-organization,links,coderabbit