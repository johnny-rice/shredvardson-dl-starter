# Supabase Integration Skill

Streamlined database migration workflow with RLS validation and type generation.

## Core Workflow

```text
create → validate → apply → types
```

## Actions

### create <migration_name>
Creates a new migration file with RLS template.

**Script**: `scripts/create-migration.ts`
**Output**: Migration file path, next steps

### validate
Validates migrations for SQL syntax, RLS policies, and security.

**Script**: `scripts/validate-migration.ts`
**Checks**:
- SQL syntax (via Supabase lint)
- RLS enabled on public tables
- RLS policies exist for all tables
- Supabase advisors (performance/security)

**Output**: Validation report, warnings, blockers

### apply
Applies pending migrations to local database.

**Script**: `scripts/apply-migration.ts`
**Flow**:
1. Run validation first
2. Confirm with user
3. Apply via `supabase db push`
4. Auto-generate types

**Output**: Success/failure, type generation status

### rollback
Resets database to previous migration state.

**Script**: `scripts/rollback-migration.ts`
**Warning**: Destructive operation, requires confirmation

**Output**: Reset status, type regeneration

### types
Regenerates TypeScript types from current schema.

**Script**: `scripts/generate-types.ts`
**Output**: Types file path, success status

## Progressive Disclosure

**Level 1** (Metadata): skill.json (~20 tokens)
**Level 2** (This file): SKILL.md (~250 tokens)
**Level 3** (On-demand): Scripts executed, only output returned (~0 tokens)

Scripts are never loaded into context - they execute and return structured output.

## RLS Security Patterns

**Default**: All new tables must have RLS enabled.

**Common Patterns**:
- User isolation: `auth.uid() = user_id`
- Tenant isolation: `tenant_id = current_tenant()`
- Admin bypass: `is_admin(auth.uid())`
- Public read: `SELECT` without restrictions

**Documentation**: See `docs/database/RLS_PATTERNS.md` for comprehensive patterns.

## Error Handling

- **Migration syntax errors**: Caught by validation, detailed error output
- **RLS policy missing**: Validation warning, blocks apply
- **Supabase not running**: Auto-start attempted, clear error if fails
- **Type generation failure**: Non-blocking, reported separately

## Integration Points

- **Commands**: Invoked via `/db` discovery command
- **Scripts**: TypeScript in `scripts/` directory
- **Docs**: `docs/database/` for patterns and guides
- **Validation**: `scripts/db/migrate.ts` (existing CLI wrapper)

## Token Efficiency

**Old command** (`/db:migrate`):
- YAML frontmatter: ~50 tokens
- Full prompt: ~435 tokens
- **Total: 485 tokens** per invocation

**New Skill**:
- Metadata: 20 tokens
- SKILL.md: 250 tokens (progressive)
- Scripts: 0 tokens (executed, not loaded)
- **Total: 270 tokens** (only when full context needed)
- **Typical: 20 tokens** (metadata only for simple actions)

**Savings**: 90% in typical workflows, 44% worst-case

## Version

1.0.0 - Phase 1 foundation