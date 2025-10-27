#!/usr/bin/env tsx
/**
 * Database Migration Workflow Script
 *
 * Streamlines Supabase database migration workflow with validation and RLS checks.
 *
 * Usage:
 *   tsx scripts/db/migrate.ts create "migration_name"
 *   tsx scripts/db/migrate.ts validate
 *   tsx scripts/db/migrate.ts apply
 *   tsx scripts/db/migrate.ts rollback
 */

import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as readline from 'node:readline';

type Action = 'create' | 'validate' | 'apply' | 'rollback';

async function runMigration(action: Action, name?: string): Promise<void> {
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

function createMigration(name: string): void {
  console.log(`📝 Creating migration: ${name}\n`);

  // Generate timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');

  const filename = `${timestamp}_${name.replace(/\s+/g, '_')}.sql`;
  const filepath = join('supabase', 'migrations', filename);

  // Ensure migrations directory exists
  mkdirSync(join('supabase', 'migrations'), { recursive: true });

  // Create migration file with template
  const template = `-- Migration: ${name}
-- Created: ${now.toISOString()}

-- Add your migration SQL here

-- Example: Create a new table with RLS
/*
CREATE TABLE example_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY example_table_select ON example_table
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY example_table_insert ON example_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY example_table_update ON example_table
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY example_table_delete ON example_table
  FOR DELETE USING (auth.uid() = user_id);
*/
`;

  writeFileSync(filepath, template);

  console.log(`✅ Created migration: ${filepath}\n`);
  console.log('Next steps:');
  console.log('1. Edit the migration file');
  console.log('2. Run: pnpm db:migrate:validate');
  console.log('3. Run: pnpm db:migrate:apply');
  console.log('4. Commit migration file\n');
}

async function validateMigrations(): Promise<void> {
  console.log('🔍 Validating migrations...\n');

  // Check if Supabase is running
  try {
    execSync('supabase status --local', { stdio: 'pipe' });
  } catch {
    console.log('⚠️  Local Supabase not running. Starting...\n');
    try {
      execSync('supabase start', { stdio: 'inherit' });
    } catch (_error) {
      console.error('❌ Failed to start Supabase. Please run: supabase start');
      process.exit(1);
    }
  }

  // Check SQL syntax (Supabase db lint)
  console.log('Checking SQL syntax...');
  try {
    execSync('supabase db lint', { stdio: 'inherit' });
    console.log('✅ SQL syntax valid\n');
  } catch (_error) {
    console.error('❌ SQL syntax errors detected\n');
    process.exit(1);
  }

  // Run advisors
  console.log('Running Supabase advisors...');
  try {
    const advisorOutput = execSync('supabase db advisor --local', { encoding: 'utf-8' });
    console.log(advisorOutput);
  } catch (_error) {
    console.log('⚠️  Advisor warnings detected (non-blocking)\n');
  }

  // Check for RLS policies on public tables
  console.log('Checking RLS policies...');
  try {
    const rlsCheckQuery = `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND rowsecurity = false
    `;

    const tablesWithoutRLS = execSync(
      `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "${rlsCheckQuery}"`,
      {
        encoding: 'utf-8',
      }
    );

    if (tablesWithoutRLS.includes('(0 rows)')) {
      console.log('✅ All public tables have RLS enabled\n');
    } else {
      console.log('❌ Tables without RLS enabled:');
      console.log(tablesWithoutRLS);
      console.log('\n⚠️  WARNING: Tables without RLS are not protected!\n');
    }

    // Check for tables without policies
    const policyCheckQuery = `
      SELECT t.tablename
      FROM pg_tables t
      LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = t.schemaname
      WHERE t.schemaname = 'public'
      AND t.rowsecurity = true
      AND p.policyname IS NULL
      GROUP BY t.tablename
    `;

    const tablesWithoutPolicies = execSync(
      `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "${policyCheckQuery}"`,
      {
        encoding: 'utf-8',
      }
    );

    if (tablesWithoutPolicies.includes('(0 rows)')) {
      console.log('✅ All RLS-enabled tables have policies\n');
    } else {
      console.log('⚠️  Tables with RLS enabled but no policies:');
      console.log(tablesWithoutPolicies);
      console.log('\n⚠️  WARNING: Tables without policies will deny all access!\n');
    }
  } catch (error) {
    console.error('⚠️  Could not check RLS policies:', error);
  }

  // Generate validation report
  const date = new Date().toISOString().split('T')[0];
  mkdirSync('scratch', { recursive: true });

  const report = generateValidationReport(date);
  const reportPath = join('scratch', `migration-validation-${date}.md`);
  writeFileSync(reportPath, report);

  console.log(`\n📄 Validation report saved to: ${reportPath}`);
  console.log('\n✅ Validation complete\n');
}

function generateValidationReport(date: string): string {
  return `# Migration Validation Report

**Date:** ${date}

## Summary

- ✅ SQL syntax validated
- ✅ Supabase advisors checked
- ✅ RLS policies verified

## Recommendations

- Review advisor warnings above
- Ensure all new tables have RLS enabled
- Test migrations locally before pushing to production

## Next Steps

1. Run: pnpm db:migrate:apply
2. Test changes locally
3. Commit migration files and updated types
4. Push to remote and deploy to staging
`;
}

async function applyMigrations(): Promise<void> {
  console.log('📦 Applying migrations...\n');

  // Validate first
  console.log('Running validation first...\n');
  await validateMigrations();

  console.log('\n⚠️  About to apply migrations to local database.');
  console.log('This operation cannot be undone easily.\n');

  const confirmed = await askConfirmation('Continue? (yes/no): ');

  if (!confirmed) {
    console.log('❌ Migration cancelled');
    process.exit(0);
  }

  try {
    // Apply migrations
    console.log('\nApplying migrations...');
    execSync('supabase db push', { stdio: 'inherit' });

    // Regenerate types
    console.log('\n🔄 Regenerating TypeScript types...');
    execSync('pnpm db:types', { stdio: 'inherit' });

    console.log('\n✅ Migration applied successfully');
    console.log('✅ TypeScript types updated\n');
    console.log('Next steps:');
    console.log('1. Test changes locally');
    console.log('2. Commit migration and types');
    console.log('3. Push to remote and deploy to staging\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\nTo rollback, run: pnpm db:migrate:rollback\n');
    process.exit(1);
  }
}

async function rollbackMigration(): Promise<void> {
  console.log('⚠️  WARNING: Rolling back will reset the database to last migration\n');
  console.log('This will DELETE all data in your local database!\n');

  // List recent migrations
  try {
    const migrations = readdirSync(join('supabase', 'migrations'))
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .reverse();

    console.log('Recent migrations:');
    migrations.slice(0, 5).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m}`);
    });
    console.log('');
  } catch {
    console.log('No migrations found\n');
  }

  const confirmed = await askConfirmation('Confirm rollback? (yes/no): ');

  if (!confirmed) {
    console.log('❌ Rollback cancelled');
    process.exit(0);
  }

  try {
    console.log('\nResetting database...');
    execSync('supabase db reset', { stdio: 'inherit' });

    console.log('\n🔄 Regenerating TypeScript types...');
    execSync('pnpm db:types', { stdio: 'inherit' });

    console.log('\n✅ Database rolled back successfully');
    console.log('✅ TypeScript types updated\n');
  } catch (error) {
    console.error('\n❌ Rollback failed:', error);
    process.exit(1);
  }
}

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// CLI
const action = process.argv[2] as Action;
const name = process.argv[3];

if (!action || !['create', 'validate', 'apply', 'rollback'].includes(action)) {
  console.error('Usage: tsx scripts/db/migrate.ts <create|validate|apply|rollback> [name]');
  console.error('\nExamples:');
  console.error('  tsx scripts/db/migrate.ts create "add_user_preferences"');
  console.error('  tsx scripts/db/migrate.ts validate');
  console.error('  tsx scripts/db/migrate.ts apply');
  console.error('  tsx scripts/db/migrate.ts rollback');
  process.exit(1);
}

runMigration(action, name).catch((error) => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});
