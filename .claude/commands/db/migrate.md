---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/db:migrate'
version: '1.0.0'
lane: 'lightweight'
tags: ['database', 'migration', 'supabase', 'schema', 'rls']
when_to_use: >
  Streamline Supabase database migration workflow with validation and RLS policy checks.

arguments:
  - name: action
    type: string
    required: true
    example: 'create | validate | apply | rollback'
  - name: name
    type: string
    required: false
    example: 'add_user_preferences (for create action)'

inputs: []
outputs:
  - type: 'migration-file'
  - type: 'report'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#databaseOperations'

allowed-tools:
  - 'Bash(*)'
  - 'Read(*)'
  - 'Write(*)'
  - 'Glob(*)'
  - 'Grep(*)'

preconditions:
  - 'Supabase CLI is installed'
  - 'Local Supabase instance is running'
  - 'Database connection configured'

postconditions:
  - 'Migration file created/validated/applied'
  - 'RLS policies checked for new tables'
  - 'TypeScript types updated (if applied)'

artifacts:
  produces:
    - { path: 'supabase/migrations/*.sql', purpose: 'Migration SQL file' }
    - { path: 'scratch/migration-report-*.md', purpose: 'Migration validation report' }
  updates:
    - { path: 'packages/db/src/types.ts', purpose: 'TypeScript database types' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'process'
      ops: ['execute']
    - name: 'database'
      ops: ['read', 'write']

timeouts:
  softSeconds: 60
  hardSeconds: 120

idempotent: false
dryRun: true
estimatedRuntimeSec: 30
costHints: 'Database operations; requires manual review before applying'

references:
  - 'https://supabase.com/docs/guides/database/migrations'
  - 'docs/micro-lessons/supabase-rls-testing-jwt-sessions.md'
  - 'docs/micro-lessons/rls-policy-sql-syntax.md'
---

# /db:migrate

**Goal:**
Streamline Supabase database migration workflow with automatic validation, RLS policy checks, and type generation.

**Prompt:**

1. Parse action and name arguments.
2. Validate preconditions (Supabase CLI installed, local DB running).
3. Execute the requested action:
   - **create**: Generate new migration file with timestamp
   - **validate**: Check migration syntax, breaking changes, RLS policies
   - **apply**: Apply migration to local DB and regenerate types
   - **rollback**: Revert last migration
4. For all actions except `create`, run Supabase advisors to detect issues.
5. Generate migration report with validation results.
6. Update TypeScript types if migration was applied.
7. Suggest next steps.

**Examples:**

- `/db:migrate create add_user_preferences` → creates migration file
- `/db:migrate validate` → validates pending migrations
- `/db:migrate apply` → applies migrations to local DB
- `/db:migrate rollback` → reverts last migration

**Actions:**

### 1. Create Migration

```bash
/db:migrate create "add_user_preferences"
```

**Steps:**
1. Generate timestamp-based migration filename
2. Create migration file in `supabase/migrations/`
3. Open file for editing
4. Remind user to:
   - Add RLS policies for new tables
   - Test migration locally before applying
   - Run validation before committing

**Output:**
```
✅ Created migration: supabase/migrations/20251018143000_add_user_preferences.sql

Next steps:
1. Edit the migration file
2. Run: /db:migrate validate
3. Run: /db:migrate apply
4. Commit migration file
```

### 2. Validate Migration

```bash
/db:migrate validate
```

**Steps:**
1. Check SQL syntax
2. Identify new tables
3. Verify RLS policies for new tables:
   ```sql
   -- Check if table has RLS enabled
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND rowsecurity = false;

   -- Check if table has policies
   SELECT tablename FROM pg_tables t
   LEFT JOIN pg_policies p ON t.tablename = p.tablename
   WHERE t.schemaname = 'public'
   AND p.policyname IS NULL;
   ```
4. Run Supabase advisors:
   ```bash
   supabase db advisor --local
   ```
5. Check for breaking changes:
   - Dropping columns
   - Changing column types
   - Removing indexes
   - Altering constraints
6. Generate validation report

**Output:**
```markdown
# Migration Validation Report

**Date:** 2025-10-18
**Migration:** 20251018143000_add_user_preferences.sql

## Summary

- ✅ SQL syntax valid
- ✅ No breaking changes detected
- ❌ Missing RLS policies on 1 table

## Issues

### Critical: Missing RLS policy on user_preferences table

**Impact:** Table is not protected by RLS, allowing unrestricted access.

**Remediation:**
```sql
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_select ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_preferences_delete ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);
```

## Supabase Advisors

- No performance issues detected
- No security issues detected

## Recommendation

❌ DO NOT APPLY - Fix RLS policies first
```

### 3. Apply Migration

```bash
/db:migrate apply
```

**Steps:**
1. Run validation first
2. If validation passes:
   - Apply migration to local DB: `supabase db push`
   - Regenerate TypeScript types: `pnpm db:types`
   - Run post-migration advisors
   - Test RLS policies (if applicable)
3. Generate migration report
4. Suggest next steps (push to staging, etc.)

**Output:**
```
✅ Migration applied successfully
✅ TypeScript types updated

Next steps:
1. Test changes locally
2. Commit migration and types
3. Push to remote and deploy to staging
```

### 4. Rollback Migration

```bash
/db:migrate rollback
```

**Steps:**
1. Identify last applied migration
2. Warn user about potential data loss
3. Request confirmation
4. Revert migration using Supabase CLI
5. Regenerate TypeScript types
6. Generate rollback report

**Output:**
```
⚠️  WARNING: Rolling back migration may cause data loss

Last migration: 20251018143000_add_user_preferences.sql

Confirm rollback? (yes/no):
```

**Validation Checks:**

1. **SQL Syntax**
   - Parse SQL to detect syntax errors
   - Validate Postgres-specific syntax

2. **Breaking Changes**
   - Dropping tables: ❌ Breaking
   - Dropping columns: ❌ Breaking
   - Changing column types: ⚠️ Potential breaking
   - Adding NOT NULL to existing column: ❌ Breaking
   - Renaming tables/columns: ⚠️ Requires careful migration

3. **RLS Policies**
   - New tables must have RLS enabled
   - New tables must have policies (at minimum: SELECT, INSERT)
   - Policies must use `auth.uid()` correctly
   - Check for policy bypass conditions

4. **Performance**
   - Large table alterations (suggest batching)
   - Missing indexes on foreign keys
   - Inefficient queries in triggers/functions

5. **Security**
   - SECURITY DEFINER functions must have authorization checks
   - Public schema permissions
   - Exposed sensitive columns

**Implementation:**

```typescript
// scripts/db/migrate.ts
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

type Action = 'create' | 'validate' | 'apply' | 'rollback';

async function runMigration(action: Action, name?: string) {
  switch (action) {
    case 'create':
      if (!name) {
        throw new Error('Migration name required for create action');
      }
      return createMigration(name);

    case 'validate':
      return validateMigrations();

    case 'apply':
      return applyMigrations();

    case 'rollback':
      return rollbackMigration();

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

function createMigration(name: string) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const filename = `${timestamp}_${name}.sql`;

  execSync(`supabase migration new ${name}`, { stdio: 'inherit' });

  console.log(`✅ Created migration: supabase/migrations/${filename}`);
  console.log('\nNext steps:');
  console.log('1. Edit the migration file');
  console.log('2. Run: /db:migrate validate');
  console.log('3. Run: /db:migrate apply');
  console.log('4. Commit migration file');
}

async function validateMigrations() {
  console.log('🔍 Validating migrations...\n');

  // Check SQL syntax
  console.log('Checking SQL syntax...');
  try {
    execSync('supabase db lint', { stdio: 'inherit' });
    console.log('✅ SQL syntax valid\n');
  } catch (error) {
    console.error('❌ SQL syntax errors detected\n');
    process.exit(1);
  }

  // Run advisors
  console.log('Running Supabase advisors...');
  execSync('supabase db advisor --local', { stdio: 'inherit' });

  // Check for RLS policies
  console.log('\nChecking RLS policies...');
  const rlsCheck = execSync(
    `supabase db execute --local "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false"`,
    { encoding: 'utf-8' }
  );

  if (rlsCheck.trim()) {
    console.log('❌ Tables without RLS enabled:');
    console.log(rlsCheck);
  } else {
    console.log('✅ All tables have RLS enabled');
  }

  console.log('\n✅ Validation complete');
}

function applyMigrations() {
  console.log('📦 Applying migrations...\n');

  // Apply migrations
  execSync('supabase db push', { stdio: 'inherit' });

  // Regenerate types
  console.log('\n🔄 Regenerating TypeScript types...');
  execSync('pnpm db:types', { stdio: 'inherit' });

  console.log('\n✅ Migration applied successfully');
  console.log('✅ TypeScript types updated');
  console.log('\nNext steps:');
  console.log('1. Test changes locally');
  console.log('2. Commit migration and types');
  console.log('3. Push to remote and deploy to staging');
}

function rollbackMigration() {
  console.log('⚠️  WARNING: Rolling back migration may cause data loss\n');

  // Get last migration
  const migrations = execSync('ls -t supabase/migrations/*.sql', {
    encoding: 'utf-8',
  })
    .trim()
    .split('\n');

  const lastMigration = migrations[0];
  console.log(`Last migration: ${lastMigration}\n`);

  // Request confirmation
  console.log('Confirm rollback? (yes/no):');
  // In CLI context, this would read from stdin

  // Rollback
  execSync('supabase db reset', { stdio: 'inherit' });
  execSync('pnpm db:types', { stdio: 'inherit' });

  console.log('\n✅ Migration rolled back');
}

// CLI
const action = process.argv[2] as Action;
const name = process.argv[3];

runMigration(action, name).catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
```

**Failure & Recovery:**

- If Supabase CLI not installed → Provide installation instructions
- If local DB not running → Start it automatically: `supabase start`
- If validation fails → Show errors and prevent application
- If migration fails → Provide rollback instructions
- If types fail to generate → Show error and retry manually

**Integration:**

Add to CI workflow:

```yaml
# .github/workflows/validate-migrations.yml
name: Validate Migrations

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: ./.github/actions/setup

      - name: Start Supabase
        run: supabase start

      - name: Validate migrations
        run: pnpm db:validate

      - name: Run advisors
        run: supabase db advisor --local

      - name: Check RLS policies
        run: |
          supabase db execute --local "
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
            AND rowsecurity = false
          "
```

Add to `package.json`:

```json
{
  "scripts": {
    "db:migrate:create": "tsx scripts/db/migrate.ts create",
    "db:migrate:validate": "tsx scripts/db/migrate.ts validate",
    "db:migrate:apply": "tsx scripts/db/migrate.ts apply",
    "db:migrate:rollback": "tsx scripts/db/migrate.ts rollback"
  }
}
```

**Important:**

- Always validate before applying migrations
- Test migrations locally before pushing to staging/production
- Ensure RLS policies are complete for new tables
- Document breaking changes in migration comments
- Keep rollback strategy in mind when designing migrations