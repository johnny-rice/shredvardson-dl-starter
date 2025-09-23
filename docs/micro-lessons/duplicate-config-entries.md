---
UsedBy: 0
Severity: normal
---

# Prevent Duplicate Configuration Entries
**Context.** CodeRabbit caught duplicate `.gitignore` entries for `artifacts/` that create maintenance confusion.
**Rule.** **Check for duplicates when adding configuration entries to prevent conflicting or redundant rules.**
**Example.**
```gitignore
# ❌ Duplicate entries cause confusion
# Generated (ephemeral)
artifacts/

# Generated (ephemeral) 
artifacts/

# ✅ Single entry with clear comment
# Generated (ephemeral)
artifacts/
```
**Guardrails.**
- Search existing config before adding new entries
- Use consistent comment styles for related entries
- Review config files during PR self-checks

**Tags.** configuration,gitignore,duplicates,maintenance,coderabbit