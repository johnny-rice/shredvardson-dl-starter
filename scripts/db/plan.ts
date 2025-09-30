#!/usr/bin/env tsx
// scripts/db/plan.ts - AI-assisted migration planning with security-first defaults

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';

/**
 * Represents a planned database migration with security considerations
 */
interface MigrationPlan {
  description: string;
  sql: string;
  timestamp: string;
  filename: string;
  rls_considerations: string[];
  type_changes: boolean;
  success: boolean;
  error?: string;
}

/**
 * Result of migration planning operation
 */
interface PlanResult {
  success: boolean;
  plan?: MigrationPlan;
  error?: string;
}

/**
 * Generate a SQL migration from natural language specification
 * Creates timestamped migration file with RLS considerations and security defaults
 * @param specification - Natural language description of the desired changes
 * @param options - Planning options (dry-run, etc.)
 */
async function generateMigration(
  specification: string,
  options: { dryRun?: boolean } = {}
): Promise<PlanResult> {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const filename = `${timestamp}_${specification
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 50)}.sql`;

  try {
    console.log(`🔍 Analyzing specification: "${specification}"`);
    console.log('📝 Generating SQL migration...');

    // TODO: Replace with actual MCP calls to Supabase
    // For now, providing a structured template that demonstrates patterns
    const plan: MigrationPlan = {
      description: specification,
      sql: generateStructuredSQL(specification),
      timestamp,
      filename,
      rls_considerations: [
        'Enable RLS by default on new tables',
        'Consider user-scoped policies for data access',
        'Review anonymous vs authenticated access patterns',
        'Validate foreign key constraints for security',
      ],
      type_changes: true,
      success: true,
    };

    if (!options.dryRun) {
      const migrationDir = join('supabase', 'migrations');
      if (!existsSync(migrationDir)) mkdirSync(migrationDir, { recursive: true });
      const migrationPath = join(migrationDir, plan.filename);
      // Fail if file already exists to prevent clobbering
      writeFileSync(migrationPath, plan.sql, { flag: 'wx' });
      console.log('📄 Migration file created');
    } else {
      console.log('🔍 Dry run - no files written');
    }

    return { success: true, plan };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Migration generation failed:', errorMessage);
    return {
      success: false,
      error: `Failed to generate migration: ${errorMessage}`,
    };
  }
}

/**
 * Generate structured SQL migration template based on specification
 * Provides realistic examples based on common patterns
 * @param spec - Natural language specification
 */
function generateStructuredSQL(spec: string): string {
  return `-- Migration: ${spec}
-- Generated: ${new Date().toISOString()}
-- Status: DRAFT - Review before applying

-- TODO: Replace with actual migration SQL
-- This migration was generated from: "${spec}"

BEGIN;

-- Example table structure (replace with actual requirements)
-- CREATE TABLE IF NOT EXISTS public.example_table (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
-- );

-- Enable Row Level Security
-- ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;

-- Example RLS policies
-- CREATE POLICY "Users can read own data" ON public.example_table
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);

COMMIT;

-- Notes:
-- 1. Review the generated SQL before applying
-- 2. Test in development environment first
-- 3. Update TypeScript types after migration
-- 4. Consider data migration needs for existing users`;
}

/**
 * Main command execution with proper CLI handling
 */
async function executeCommand(specification: string, options: { dryRun?: boolean }): Promise<void> {
  console.log('🗄️  Database Migration Planner');
  console.log('==============================\n');

  const result = await generateMigration(specification, options);

  if (!result.success) {
    console.error('\n❌ Migration planning failed');
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  const { plan } = result;
  if (!plan) {
    console.error('❌ Unexpected error: No plan generated');
    process.exit(1);
  }

  console.log('\n✅ Migration plan generated:');
  console.log(`📄 File: ${options.dryRun ? '[dry-run]' : `supabase/migrations/${plan.filename}`}`);
  console.log(`📋 Description: ${plan.description}`);
  console.log(`🛡️  RLS Considerations:`);
  plan.rls_considerations.forEach((consideration) => {
    console.log(`   • ${consideration}`);
  });

  if (plan.type_changes) {
    console.log('\n📝 Next steps:');
    console.log('   1. Review the generated SQL migration');
    console.log('   2. Apply with: pnpm db:migrate');
    console.log('   3. Update types: pnpm db:types');
    console.log('   4. Test the changes locally');
  }
}

// CLI Setup with Commander.js
const program = new Command();

program
  .name('db:plan')
  .description('Generate SQL migration from natural language specification')
  .version('1.0.0')
  .argument('<specification>', 'Natural language description of database changes')
  .option('--dry-run', 'Generate migration plan without writing files')
  .action(executeCommand);

program
  .command('help')
  .description('Show detailed usage examples')
  .action(() => {
    console.log('🗄️  Database Migration Planner - Examples');
    console.log('=========================================\n');
    console.log('Basic usage:');
    console.log('  pnpm db:plan "Add user profiles table with avatar and bio"');
    console.log('  pnpm db:plan "Create posts table with content and author relationship"\n');
    console.log('With options:');
    console.log('  pnpm db:plan "Add search functionality" --dry-run\n');
    console.log('Common patterns:');
    console.log('  • User data: "Add profiles table with user_id, avatar_url, bio"');
    console.log('  • Content: "Create posts with title, content, author_id, published_at"');
    console.log('  • Relations: "Add comments table referencing posts and users"');
    console.log('  • Indexes: "Add full-text search index to articles table"');
    console.log('  • Constraints: "Add email uniqueness constraint to users"');
  });

program.parse(process.argv);
