---
UsedBy: 0
Severity: normal
---

# Constitution Checksum Invalidates After Command Index Changes

**Context.** After regenerating `docs/commands/index.json`, CI doctor check failed with "Constitution checksum is stale - binding sources have changed". The constitution tracks command index as a binding source.

**Rule.** **Run `pnpm constitution:update` after regenerating the command index to update CONSTITUTION.CHECKSUM.**

**Example.**

```bash
# ❌ Wrong: Only update command index
pnpm commands:generate
git add docs/commands/index.json
git commit
# CI fails: Constitution checksum stale

# ✅ Correct: Update both index and checksum
pnpm commands:generate
pnpm constitution:update  # Updates docs/llm/CONSTITUTION.CHECKSUM
git add docs/commands/index.json docs/llm/CONSTITUTION.CHECKSUM
git commit

# Verify locally before pushing
pnpm doctor:report
# CI passes
```

**Guardrails.**

- Command index (`docs/commands/index.json`) is a binding source in constitution
- Checksum validates integrity of LLM configuration files
- Run `pnpm constitution:update` after modifying any binding source
- Doctor check (`pnpm doctor:report`) catches stale checksums in CI

**Tags.** #constitution #checksum #commands #ci #doctor #binding-sources #phase-4b
