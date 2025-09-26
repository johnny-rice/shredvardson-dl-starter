# MCP Supabase Integration Guide

This guide covers setting up Supabase MCP for DLStarter with proper scoping, security, and AI-assisted database operations.

## Overview

The Supabase MCP (Model Context Protocol) integration enables AI agents to safely scaffold database assets, create tables, draft RLS policies, run migrations, and update TypeScript types with least-privileged access and comprehensive guardrails.

## Prerequisites

- Node.js 20+ installed
- Supabase account and project
- Claude Code or compatible MCP client
- Development-only setup (no production credentials)

## Setup Instructions

### 1. Supabase Project Configuration

Create a personal access token in your Supabase dashboard:
1. Go to [Supabase Dashboard](https://app.supabase.com) → Account Settings
2. Create new access token with name "DL-Starter-MCP"
3. Save the token securely

### 2. Environment Variables

Add to your environment (.env.local or shell profile):

```bash
# Supabase MCP Configuration (for AI tooling)
SUPABASE_ACCESS_TOKEN=your_personal_access_token_here
SUPABASE_PROJECT_REF=your_project_ref_here

# Standard Supabase Client Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. MCP Server Configuration

The Supabase MCP server is pre-configured with security-first settings:

```bash
# Verify MCP server configuration
claude mcp list

# Should show:
# supabase-db: npx -y @supabase/mcp-server-supabase --read-only --features=database,docs,debugging,development --project-ref=${SUPABASE_PROJECT_REF}
```

**Security Features:**
- `--read-only`: Prevents destructive operations  
- `--features=database,docs,debugging,development`: Limited scope
- `--project-ref`: Scoped to specific project only
- Environment-based credentials (no hardcoded tokens)

### 4. Database Package Setup

The `@shared/db` workspace package provides typed database access:

```typescript
// Example usage
import { createDatabaseClient, type DatabaseConfig } from '@shared/db';

const client = createDatabaseClient({
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_ANON_KEY
});

// Type-safe database operations
const { data, error } = await client.raw
  .from('profiles')
  .select('*')
  .eq('user_id', userId);
```

## Available Commands

### /db:plan - Generate Migration from Spec

Generate SQL migrations from natural language specifications:

```bash
# Basic usage
pnpm db:plan "Add user profiles table with avatar, bio, and preferences"
pnpm db:plan "Create posts table with content, author_id, and publication status"

# With options
pnpm db:plan "Add full-text search to articles with gin index" --dry-run

# Get help and examples
pnpm db:plan --help
pnpm db:plan help
```

**Output:**
- Creates timestamped SQL file in `supabase/migrations/`
- Includes RLS considerations and security notes
- Provides next-step guidance

### /db:migrate - Apply Migration (Dev Only)

Apply pending migrations to development database:

```bash
# Apply all pending migrations  
pnpm db:migrate

# Alternative commands
pnpm db:reset    # Reset and apply all migrations + seed data
pnpm db:diff     # Show pending changes
pnpm db:status   # Check migration status
```

**Safety Features:**
- Development environment only
- Transaction-wrapped migrations
- Rollback capability
- Pre-migration validation

### /db:rls:scaffold - Generate RLS Policies

Scaffold Row Level Security policies using common patterns:

```bash
# Basic user-scoped policies
pnpm db:rls:scaffold users

# Custom owner column  
pnpm db:rls:scaffold posts --owner-column=author_id

# Public read access with dry-run
pnpm db:rls:scaffold profiles --public-read --dry-run

# Soft delete support
pnpm db:rls:scaffold comments --soft-deletes

# Get help and examples
pnpm db:rls:scaffold --help
pnpm db:rls:scaffold examples
```

**Generated Patterns:**
- User-scoped data access with `auth.uid()`
- CRUD operations with proper conditions
- Public/anonymous access policies
- Admin override policies
- Soft delete considerations

### /db:types - Update TypeScript Types

Regenerate TypeScript types from current database schema:

```bash
# Update types after schema changes
pnpm db:types

# Verify types are current
pnpm typecheck
```

**Features:**
- Generates strongly-typed database interfaces
- Includes table, view, and function signatures  
- Zod schema integration support
- Auto-exported from `@shared/db` package

## Database Development Workflow

### 1. Planning Phase

```bash
# Generate migration from specification
pnpm db:plan "Add user authentication with profiles and preferences"

# Review generated SQL in supabase/migrations/
# Customize as needed before applying
```

### 2. Implementation Phase

```bash
# Start local Supabase services
pnpm db:start

# Apply migration
pnpm db:migrate  

# Generate RLS policies
pnpm db:rls:scaffold profiles --owner-column=user_id

# Apply RLS migration
pnpm db:migrate

# Update TypeScript types
pnpm db:types
```

### 3. Validation Phase

```bash
# Run CI validation locally
pnpm db:validate

# Test the changes
pnpm test:unit
pnpm test:e2e

# Verify no type errors
pnpm typecheck
```

## CI/CD Integration

### PR Validation Rules

PRs touching database files (`supabase/**` or `packages/db/**`) must include:

1. **Migration SQL files** - All schema changes as timestamped migrations
2. **Updated TypeScript types** - Current `types.ts` files  
3. **RLS policy review** - Security considerations documented
4. **Human approval** - Manual review of generated SQL

### Automated Checks

The CI pipeline automatically validates:

```yaml
# .github/workflows/ci.yml includes:
- name: Validate Database Changes
  run: tsx scripts/db/ci-validate.ts
```

**Validation Rules:**
- Migration files use transactions and proper RLS  
- TypeScript types are current (within 24 hours)
- No dangerous operations without explicit approval
- Required workspace packages are present

### Enforcement Points

- **Blocking CI** - Invalid migrations fail the build
- **PR Labels** - Database changes auto-labeled for review
- **Required Reviews** - Human approval mandatory for DB PRs
- **Status Checks** - Database validation must pass before merge

## Security Guidelines

### Development Environment

✅ **Allowed in MCP:**
- Schema introspection and documentation
- Migration generation and planning
- RLS policy scaffolding  
- TypeScript type generation
- Development database queries

❌ **Blocked in MCP:**
- Production database access
- Ad-hoc data export/import
- User data mutations
- Service role escalation  

### Credential Management

- **MCP Cloud Vault**: Store access tokens securely
- **Environment Variables**: Use runtime substitution
- **No Hardcoding**: Never commit credentials to git
- **Least Privilege**: Read-only + development features only  

### RLS Policy Patterns  

All generated policies follow security-first principles:

```sql
-- User-scoped access (most common)
CREATE POLICY "users_own_data" ON profiles
  FOR ALL TO authenticated  
  USING (auth.uid() = user_id);

-- Public read with owner write
CREATE POLICY "public_read" ON posts
  FOR SELECT TO anon USING (published = true);
  
CREATE POLICY "owner_write" ON posts  
  FOR ALL TO authenticated
  USING (auth.uid() = author_id);

-- Admin override for service operations
CREATE POLICY "admin_override" ON sensitive_table
  FOR ALL TO service_role USING (true);
```

## Troubleshooting

### Common Issues

**MCP Connection Failed:**
```bash
# Check environment variables
echo $SUPABASE_ACCESS_TOKEN
echo $SUPABASE_PROJECT_REF

# Test MCP server manually
npx -y @supabase/mcp-server-supabase --read-only --project-ref=your-ref
```

**Migration Conflicts:**
```bash
# Check current status
pnpm db:status

# Reset development database  
pnpm db:reset

# Review conflicting migrations in supabase/migrations/
```

**Type Generation Errors:**
```bash
# Ensure Supabase CLI is current
supabase --version

# Verify database connection
supabase status

# Manual type generation
supabase gen types typescript --schema public > packages/db/src/types.ts
```

### Debug Commands

```bash
# Test database connection
pnpm debug:health

# Validate MCP configuration  
pnpm db:validate

# Check workspace setup
pnpm doctor

# Review CI validation locally
tsx scripts/db/ci-validate.ts
```

## Examples

### Complete User Management Setup

```bash
# 1. Plan the user system
pnpm db:plan "Create comprehensive user management with profiles, preferences, and activity tracking"

# 2. Generate RLS policies  
pnpm db:rls:scaffold users
pnpm db:rls:scaffold profiles --owner-column=user_id --public-read
pnpm db:rls:scaffold user_preferences --owner-column=user_id

# 3. Apply all changes
pnpm db:migrate

# 4. Update types
pnpm db:types  

# 5. Validate setup
pnpm db:validate && pnpm typecheck
```

### Content Management with Moderation

```bash
# Multi-table content system
pnpm db:plan "Add content management: posts, comments, likes with moderation queue"

# RLS for different access patterns  
pnpm db:rls:scaffold posts --public-read
pnpm db:rls:scaffold comments --owner-column=author_id
pnpm db:rls:scaffold moderation_queue # Admin-only by default

# Apply and validate
pnpm db:migrate && pnpm db:types && pnpm db:validate
```

## Next Steps

1. **Initialize your Supabase project** with the provided configuration
2. **Set up environment variables** for development  
3. **Test the MCP connection** with a simple schema query
4. **Create your first migration** using `pnpm db:plan`
5. **Establish RLS policies** with `pnpm db:rls:scaffold`
6. **Integrate database client** in your application code

For additional help, see:
- [Supabase Documentation](https://supabase.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)  
- [DLStarter Database Patterns](./db.md)