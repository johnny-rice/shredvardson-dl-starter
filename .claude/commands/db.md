---
name: db
description: Database workflow via supabase-integration Skill
version: 2.0.0
skill: supabase-integration
---

**Slash Command:** `/db`

**Goal:**
Invoke the supabase-integration Skill for database migration workflows.

**Usage:**

```bash
/db create <migration_name>   # Create new migration
/db validate                   # Validate pending migrations
/db apply                      # Apply migrations to local DB
/db rollback                   # Rollback to previous state
/db types                      # Regenerate TypeScript types
```

**Prompt:**

This is a lightweight discovery command that delegates to the `supabase-integration` Skill.

**Actions:**

1. **create**: Invoke Skill script `create-migration.ts` with migration name
2. **validate**: Invoke Skill script `validate-migration.ts`
3. **apply**: Invoke Skill script `apply-migration.ts`
4. **rollback**: Invoke Skill script `rollback-migration.ts`
5. **types**: Invoke Skill script `generate-types.ts`

**Skill Location:** `.claude/skills/supabase-integration/`

**Token Efficiency:**

- **Old `/db:migrate`**: 485 tokens per invocation
- **New `/db` Skill**: 20-270 tokens (progressive disclosure)
- **Savings**: 44-96% depending on action complexity

**Examples:**

```bash
# Create a migration for user profiles
/db create add_user_profiles

# Validate before applying
/db validate

# Apply to local database
/db apply

# Oops, need to rollback
/db rollback

# Just regenerate types
/db types
```

**Implementation:**

The Skill system handles:
1. Loading metadata (skill.json)
2. Progressive disclosure (SKILL.md only if needed)
3. Script execution (never in context)
4. Structured output parsing

This command simply routes the request to the appropriate Skill script.

**Related:**

- Skill: `.claude/skills/supabase-integration/`
- ADR: [002-skills-architecture.md](../../docs/adr/002-skills-architecture.md)
- Patterns: [RLS_PATTERNS.md](../../docs/database/RLS_PATTERNS.md)