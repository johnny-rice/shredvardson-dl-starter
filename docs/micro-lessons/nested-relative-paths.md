---
UsedBy: 0
Severity: normal
---

# Fix Relative Paths When Moving Files to Nested Directories
**Context.** CodeRabbit flagged multiple broken links in docs/ai/CLAUDE.md after file relocation, requiring different relative path depths.
**Rule.** **When moving files to nested directories, update all relative links by calculating the correct number of `../` traversals.**
**Example.**
```markdown
<!-- File moved from root to docs/ai/CLAUDE.md -->

<!-- ❌ Links break after move -->
[Constitution](docs/constitution.md)
[Contributing](CONTRIBUTING.md)  
[Commands](.claude/commands/spec/specify.md)

<!-- ✅ Fixed relative paths from docs/ai/ -->
[Constitution](../constitution.md)      <!-- Up 1 level to docs/ -->
[Contributing](../../CONTRIBUTING.md)   <!-- Up 2 levels to root -->
[Commands](../../.claude/commands/spec/specify.md)  <!-- Up 2 levels to root -->
```
**Guardrails.**
- Test links after file moves with `pnpm tsx scripts/docs-check.ts`
- Use path.relative() in Node.js to calculate correct paths programmatically
- Consider using absolute paths from repository root for stability

**Tags.** documentation,relative-paths,file-organization,links,coderabbit