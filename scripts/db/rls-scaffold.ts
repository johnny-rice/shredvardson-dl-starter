#!/usr/bin/env tsx

// scripts/db/rls-scaffold.ts - Generate Row Level Security policies with auth.uid() patterns

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { Command } from 'commander';

/**
 * Basic identifier validation to prevent SQL injection
 * @param id - Identifier to validate
 * @param label - Label for error reporting
 */
function assertIdent(id: string, label: string): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id)) {
    throw new Error(`Invalid ${label}: ${id}`);
  }
}

/**
 * Represents a single Row Level Security policy
 */
interface RLSPolicy {
  name: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  role: 'authenticated' | 'anon' | 'service_role';
  condition: string;
  description: string;
}

/**
 * Configuration options for RLS policy scaffolding
 */
interface ScaffoldOptions {
  table: string;
  ownerColumn?: string;
  publicRead?: boolean;
  allowAnon?: boolean;
  softDeletes?: boolean;
}

/**
 * Result of RLS scaffolding operation
 */
interface ScaffoldResult {
  success: boolean;
  policies?: RLSPolicy[];
  filename?: string;
  error?: string;
}

function generateRLSPolicies(options: ScaffoldOptions): RLSPolicy[] {
  const { table, ownerColumn = 'user_id', publicRead, allowAnon, softDeletes } = options;

  // Validate identifiers to prevent SQL injection
  assertIdent(table, 'table');
  assertIdent(ownerColumn, 'owner column');

  const policies: RLSPolicy[] = [];

  // Owner-based policies (most common pattern)
  // Performance: Wrap auth.uid() in SELECT for caching (100x+ faster)
  if (ownerColumn) {
    policies.push({
      name: `${table}_select_own`,
      table,
      operation: 'SELECT',
      role: 'authenticated',
      condition: `(SELECT auth.uid()) = ${ownerColumn}`,
      description: 'Users can read their own records',
    });

    policies.push({
      name: `${table}_insert_own`,
      table,
      operation: 'INSERT',
      role: 'authenticated',
      condition: `(SELECT auth.uid()) = ${ownerColumn}`,
      description: 'Users can create records for themselves',
    });

    policies.push({
      name: `${table}_update_own`,
      table,
      operation: 'UPDATE',
      role: 'authenticated',
      condition: `(SELECT auth.uid()) = ${ownerColumn}`,
      description: 'Users can update their own records',
    });

    policies.push({
      name: `${table}_delete_own`,
      table,
      operation: 'DELETE',
      role: 'authenticated',
      condition: `(SELECT auth.uid()) = ${ownerColumn}`,
      description: 'Users can delete their own records',
    });
  }

  // Public read access
  if (publicRead) {
    policies.push({
      name: `${table}_public_read`,
      table,
      operation: 'SELECT',
      role: 'anon',
      condition: 'true',
      description: 'Allow public read access',
    });
  }

  // Apply anon-specific policies if explicitly allowed
  if (allowAnon) {
    // For anon users, we can't use auth.uid() since it's NULL
    // Instead, we allow operations based on role check
    policies.push(
      ...policies
        .filter((p) => p.role === 'authenticated')
        .map((p) => ({
          ...p,
          role: 'anon' as const,
          name: `${p.name}_anon`,
          condition: `auth.role() = 'anon'`, // Replace auth.uid() check with role check
          description: `${p.description} (anonymous users - role-based access)`,
        }))
    );
  }

  // Soft delete considerations
  if (softDeletes) {
    policies.forEach((policy) => {
      if (policy.operation === 'SELECT') {
        policy.condition += ' AND deleted_at IS NULL';
        policy.description += ' (excluding soft-deleted records)';
      }
    });
  }

  return policies;
}

function generatePolicySQL(policy: RLSPolicy): string {
  const usingClause = policy.operation === 'INSERT' ? '' : `\n  USING (${policy.condition})`;
  const withCheckClause =
    policy.operation === 'INSERT' || policy.operation === 'UPDATE'
      ? `\n  WITH CHECK (${policy.condition})`
      : '';
  return `-- ${policy.description}
CREATE POLICY "${policy.name}" ON public.${policy.table}
  FOR ${policy.operation}
  TO ${policy.role}${usingClause}${withCheckClause};`;
}

function generateCompleteRLSScript(options: ScaffoldOptions): string {
  const policies = generateRLSPolicies(options);
  const { table } = options;

  const sqlParts = [
    `-- Row Level Security policies for ${table}`,
    `-- Generated: ${new Date().toISOString()}`,
    '-- Review and customize before applying\n',

    '-- Enable RLS on the table',
    `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;\n`,

    '-- Drop existing policies (uncomment if recreating)',
    `-- DROP POLICY IF EXISTS "${table}_select_own" ON public.${table};`,
    `-- DROP POLICY IF EXISTS "${table}_insert_own" ON public.${table};`,
    `-- DROP POLICY IF EXISTS "${table}_update_own" ON public.${table};`,
    `-- DROP POLICY IF EXISTS "${table}_delete_own" ON public.${table};\n`,

    ...policies.map((policy) => generatePolicySQL(policy)),

    '\n-- ⚡ PERFORMANCE: Index columns used in RLS policies (CRITICAL)',
    `-- CREATE INDEX idx_${table}_${options.ownerColumn} ON public.${table}(${options.ownerColumn});`,
    '',
    '-- Common additional considerations:',
    '-- 1. Add admin override policies for service accounts',
    '-- 2. Consider time-based access restrictions',
    '-- 3. Add logging for policy violations',
    '-- 4. Test policies with different user roles',
    '-- 5. Use EXPLAIN ANALYZE to verify query performance',
    '',
    '-- Example admin override (uncomment if needed):',
    `-- CREATE POLICY "${table}_admin_all" ON public.${table}`,
    '--   FOR ALL',
    '--   TO service_role',
    '--   USING (true);',
  ];

  return sqlParts.join('\n');
}

/**
 * Main execution function with proper error handling
 */
async function executeScaffolding(
  tableName: string,
  options: {
    ownerColumn?: string;
    publicRead?: boolean;
    allowAnon?: boolean;
    softDeletes?: boolean;
    dryRun?: boolean;
  }
): Promise<void> {
  console.log('🛡️  Row Level Security Scaffolder');
  console.log('=================================\n');

  const scaffoldOptions: ScaffoldOptions = {
    table: tableName,
    ownerColumn: options.ownerColumn || 'user_id',
    publicRead: options.publicRead || false,
    allowAnon: options.allowAnon || false,
    softDeletes: options.softDeletes || false,
  };

  try {
    const result = await scaffoldRLSPolicies(scaffoldOptions, { dryRun: options.dryRun });

    if (!result.success) {
      console.error('\n❌ RLS scaffolding failed');
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const { policies, filename } = result;
    if (!policies || !filename) {
      console.error('❌ Unexpected error: No policies generated');
      process.exit(1);
    }

    console.log('\n✅ RLS policies scaffolded:');
    console.log(`📄 File: ${options.dryRun ? '[dry-run]' : `supabase/migrations/${filename}`}`);
    console.log(`📋 Table: ${tableName}`);
    console.log(`👤 Owner column: ${scaffoldOptions.ownerColumn}`);
    console.log(`🌍 Public read: ${scaffoldOptions.publicRead ? 'Yes' : 'No'}`);

    console.log('\n🛡️  Generated policies:');
    policies.forEach((policy) => {
      console.log(`   • ${policy.operation}: ${policy.description}`);
    });

    console.log('\n📝 Next steps:');
    console.log('   1. Review the generated RLS policies');
    console.log('   2. Customize conditions as needed');
    console.log('   3. Apply with: pnpm db:migrate');
    console.log('   4. Test with different user contexts');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to scaffold RLS policies:', errorMessage);
    process.exit(1);
  }
}

/**
 * Generate RLS policies with proper error handling
 */
async function scaffoldRLSPolicies(
  options: ScaffoldOptions,
  execOptions: { dryRun?: boolean } = {}
): Promise<ScaffoldResult> {
  try {
    const policies = generateRLSPolicies(options);
    const rlsScript = generateCompleteRLSScript(options);
    const filename = `rls_${options.table}_${Date.now()}.sql`;

    if (!execOptions.dryRun) {
      const dir = 'supabase/migrations';
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const filepath = `${dir}/${filename}`;
      writeFileSync(filepath, rlsScript, { flag: 'wx' });
    }

    return {
      success: true,
      policies,
      filename,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to generate RLS policies: ${errorMessage}`,
    };
  }
}

// CLI Setup with Commander.js
const program = new Command();

program
  .name('db:rls:scaffold')
  .description('Generate Row Level Security policies for database tables')
  .version('1.0.0')
  .argument('<table>', 'Table name to generate RLS policies for')
  .option('--owner-column <column>', 'Column name for ownership-based policies', 'user_id')
  .option('--public-read', 'Allow anonymous read access')
  .option('--allow-anon', 'Allow anonymous role-based access (auth.role() = anon)')
  .option('--soft-deletes', 'Consider deleted_at column in policies')
  .option('--dry-run', 'Generate policies without writing files')
  .action(executeScaffolding);

program
  .command('examples')
  .description('Show usage examples and common patterns')
  .action(() => {
    console.log('🛡️  Row Level Security Scaffolder - Examples');
    console.log('============================================\n');
    console.log('Basic usage:');
    console.log('  pnpm db:rls:scaffold users');
    console.log('  pnpm db:rls:scaffold profiles --public-read');
    console.log('  pnpm db:rls:scaffold posts --owner-column=author_id\n');
    console.log('With options:');
    console.log('  pnpm db:rls:scaffold comments --soft-deletes --dry-run\n');
    console.log('Common patterns:');
    console.log('  • User profiles: --public-read (others can view)');
    console.log('  • User posts: --owner-column=author_id');
    console.log('  • Comments: --owner-column=commenter_id --soft-deletes');
    console.log('  • Public content: --public-read --allow-anon (role-based)');
    console.log('  • Private data: (default user_id ownership)');
    console.log("\\nNote: --allow-anon uses auth.role() = 'anon' (not auth.uid())");
  });

program.parse(process.argv);
