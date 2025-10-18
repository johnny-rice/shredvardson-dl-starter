---
UsedBy: 0
Severity: normal
---

# LLM Documentation Must Have Multiple Discovery Paths

**Context.** LLM agents navigate docs differently than humans—they follow links from entry points (CLAUDE.md, INDEX.md) rather than browsing directory trees. When testing 8 common navigation scenarios, 2 failed because content existed but wasn't linked from main indexes.

**Rule.** **Every documentation directory must be discoverable from at least one main entry point (CLAUDE.md, INDEX.md, or WIKI-Home.md).**

**Example.**

❌ **Before:** Testing guide exists but invisible

```text
docs/testing/TESTING_GUIDE.md exists
docs/ai/CLAUDE.md → no link to testing docs
Agent asks "how do I write tests?" → can't find guide
```

✅ **After:** Testing guide linked from entry point

```markdown
docs/ai/CLAUDE.md:
## Testing
See [Testing Guide](../testing/TESTING_GUIDE.md) for comprehensive testing patterns.

## Commands
- /test:scaffold → ../../.claude/commands/test/scaffold.md
```

**Guardrails.**

- When creating a new `/docs/[directory]/`, immediately add link to INDEX.md or CLAUDE.md
- Test discoverability: Start from CLAUDE.md or INDEX.md, can you reach the doc in ≤2 clicks?
- Run periodic audits: Check for directories not referenced in any main index
- For specialized docs (ADRs, plans), ensure at least one command or reference points to them

**Findings from Issue #102 Navigation Audit:**

✅ **Well-Indexed (6/8 scenarios passed)**

- Micro-lessons: CLAUDE.md → Learning Loop → INDEX.md ✓
- Recipes: CLAUDE.md → References → auth/db/stripe ✓
- Commands: CLAUDE.md → Commands Index ✓
- Quality Gates: INDEX.md → WIKI-Quality-Gates.md ✓

⚠️ **Poorly Indexed (2/8 scenarios failed)**

- Testing: docs/testing/ exists but not in CLAUDE.md or INDEX.md
- Decisions: docs/decisions/ exists but only via /adr:draft command

**Recommended Fixes:**

1. Add Testing section to CLAUDE.md with link to TESTING_GUIDE.md
2. Add Decisions/ADRs to INDEX.md
3. Link docs/evaluations/ from CLAUDE.md (currently only in INDEX.md)
4. Consolidate or clarify docs/llm/ vs docs/wiki/ (potential duplication)
5. Index docs/plans/ or remove if obsolete

**Tags.** documentation, navigation, llm-agents, discoverability, information-architecture
