---
name: code
description: Coding standards via implementation-assistant Skill
version: 2.0.0
skill: implementation-assistant
---

**Slash Command:** `/code`

**Goal:**
Invoke the implementation-assistant Skill for coding standards and patterns.

**Usage:**

```bash
/code standards [category]       # Show coding standards
/code patterns <category>        # Show implementation patterns
/code validate <file_path>       # Validate code against standards
/code implement <feature_type>   # Get implementation guide
```

**Prompt:**

This is a lightweight discovery command that delegates to the `implementation-assistant` Skill.

**Actions:**

1. **standards**: Invokes Skill script `show-standards.ts` with optional category
2. **patterns**: Invokes Skill script `show-patterns.ts` with category (component, api, database, error)
3. **validate**: Invokes Skill script `validate-code.ts` with file path
4. **implement**: Invokes Skill script `implementation-guide.ts` with feature type

**Skill Location:** `.claude/skills/implementation-assistant/`

**Token Efficiency:**

- **Old `/dev:implement`**: 88 tokens per invocation
- **New `/code` Skill**: 20-200 tokens (progressive disclosure)
- **Savings**: 60% average, 77% for simple lookups

**Examples:**

```bash
# Show TypeScript standards
/code standards typescript

# Show React component pattern
/code patterns component

# Validate file against standards
/code validate src/components/UserProfile.tsx

# Get feature implementation guide
/code implement feature
```

**Categories:**

**Standards**: typescript, react, naming, imports, error, all
**Patterns**: component, api, database, error
**Feature Types**: feature, bugfix, refactor

**Implementation:**

The Skill system handles:
1. Loading metadata (skill.json)
2. Progressive disclosure (SKILL.md only if needed)
3. Script execution (never in context)
4. Structured output parsing

This command routes the request to the appropriate Skill script.

**Related:**

- Skill: `.claude/skills/implementation-assistant/`
- ADR: [002-skills-architecture.md](../../docs/adr/002-skills-architecture.md)