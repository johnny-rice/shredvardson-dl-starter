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

### Optimized RLS Templates

When creating tables with RLS, **ALWAYS start from the optimized templates** to prevent performance issues:

```bash
# For user-scoped tables (user_id column):
cp supabase/templates/table-with-user-rls.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_create_profiles.sql

# For team-scoped tables (team_id column):
cp supabase/templates/table-with-team-rls.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_create_projects.sql

# Then customize the template:
# 1. Replace TABLENAME with your actual table name
# 2. Add your custom columns
# 3. Apply: pnpm db:reset
```

#### Why templates matter

- ⚠️ Without optimization: RLS queries can be 100-1000x slower
- ✅ With templates: All 6 optimizations included automatically
- 📖 See: `docs/database/RLS_OPTIMIZATION.md` for details

#### Templates include

1. Indexes on filter columns (99.94% faster)
2. Function caching (94.97% faster)
3. Security definer helpers (99.993% faster)
4. Role specification (99.78% faster)
5. Minimized policy joins
6. Client-side filter patterns

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

**Comprehensive Documentation:**

- [Complete Database Guide](../../docs/guides/DATABASE.md) - Supabase, migrations, RLS, and optimization
- [RLS Implementation](../../docs/database/rls-implementation.md) - Row Level Security patterns
- [RLS Optimization](../../docs/database/RLS_OPTIMIZATION.md) - Performance optimization techniques
