---
UsedBy: 0
Severity: normal
---

# Command Index Must Be Regenerated After Adding Commands

**Context.** Added new `/learn` command and updated `/ops:learning-capture` metadata. CI failed with routing contract violation because `docs/commands/index.json` was out of sync.

**Rule.** **Always run `pnpm commands:generate` after creating or modifying command files in `.claude/commands/`.**

**Example.**

```bash
# ❌ Wrong: Commit command without regenerating index
git add .claude/commands/ops/learn-search.md
git commit -m "Add learn search command"
# CI fails: Command index out of sync

# ✅ Correct: Regenerate index before committing
pnpm commands:generate  # Updates docs/commands/index.json
git add .claude/commands/ops/learn-search.md docs/commands/index.json
git commit -m "Add learn search command"
# CI passes
```

**Guardrails.**
- Run `pnpm commands:generate` after any command file changes
- The index is checked by CI in `commands:check` script
- Pre-commit hooks don't auto-regenerate (manual step required)
- Index tracks metadata from YAML frontmatter for routing

**Tags.** #commands #index #ci #routing-contract #automation #phase-4b
