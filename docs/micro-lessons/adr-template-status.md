---
UsedBy: 0
Severity: low
---

# ADR Templates Should Use "Proposed" Status

**Context.** CodeRabbit noted that ADR templates should be "Proposed" not "Accepted" to avoid implying a specific decision.
**Rule.** **Mark ADR templates as "Proposed" or "Informational" rather than "Accepted" to clarify their purpose.**
**Example.**

```markdown
# ❌ Template marked as decision

**Status:** Accepted

# ✅ Template marked appropriately

**Status:** Proposed
```

**Guardrails.**

- Use "Proposed" for templates and discussion drafts
- Use "Accepted" only for ratified architectural decisions
- Include numbering expectations (zero-padding) in template

**Tags.** adr,templates,status,documentation,governance
