#!/usr/bin/env tsx

// scripts/db/validate-rls.ts - Validate Row-Level Security policies on all tables

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { Command } from 'commander';

/**
 * Tables that are explicitly exempt from RLS requirements
 * Document any additions in docs/database/standards.md
 * Note: Only includes public schema tables (storage.* lives in storage schema)
 */
const RLS_EXCEPTIONS = [
  '_health_check', // Public health check endpoint (has policies for anon read)
  'schema_migrations', // Supabase internal migration tracking
  'supabase_migrations', // Alternative migration table name
];

/**
 * RLS status for a single table
 */
interface TableRLSStatus {
  schema: string;
  tableName: string;
  hasRLS: boolean;
  rlsForced: boolean;
  policies: PolicyInfo[];
  isException: boolean;
  hasWarnings: boolean;
  warnings: string[];
}

/**
 * RLS policy information
 */
interface PolicyInfo {
  policyName: string;
  operation: string; // SELECT, INSERT, UPDATE, DELETE, ALL
  roles: string[]; // authenticated, anon, service_role, etc.
}

/**
 * Validation result summary
 */
interface ValidationResult {
  success: boolean;
  totalTables: number;
  tablesWithRLS: number;
  tablesWithoutRLS: number;
  exceptionsCount: number;
  gaps: TableRLSStatus[];
  warnings: TableRLSStatus[];
  summary: string[];
}

/**
 * Retrieve the names of all user-defined base tables in the public schema.
 *
 * @returns An array of table names in the public schema; returns an empty array if no tables are found.
 * @throws An Error when the database RPC query fails or returns an error payload.
 */
async function fetchAllTables(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const { data, error } = await supabase.rpc('query', {
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
      ORDER BY table_name;
    `,
  });

  if (error) {
    console.error('❌ Failed to fetch tables:', error.message);
    throw new Error(`Database query failed: ${error.message}`);
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  // Parse the result
  const result = data as { table_name: string }[] | { error?: string };
  if ('error' in result) {
    throw new Error(`Query error: ${result.error}`);
  }

  return (result as { table_name: string }[]).map((row) => row.table_name);
}

/**
 * Determine whether Row-Level Security is enabled and whether it is forced for a table in the public schema.
 *
 * @param tableName - The name of the table in the `public` schema to inspect
 * @returns An object with `hasRLS` set to `true` when RLS is enabled for the table and `rlsForced` set to `true` when RLS is forced; both fields are `false` if the table is not found or the check fails
 */
async function checkRLSStatus(
  supabase: ReturnType<typeof createClient>,
  tableName: string
): Promise<{ hasRLS: boolean; rlsForced: boolean }> {
  const { data, error } = await supabase.rpc('query', {
    sql: `
      SELECT
        relrowsecurity AS has_rls,
        relforcerowsecurity AS rls_forced
      FROM pg_class
      JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
      WHERE nspname = 'public'
        AND relname = $1;
    `,
    params: { 1: tableName },
  });

  if (error) {
    console.warn(`⚠️  Failed to check RLS status for ${tableName}:`, error.message);
    return { hasRLS: false, rlsForced: false };
  }

  if (!data || typeof data !== 'object' || 'error' in data) {
    return { hasRLS: false, rlsForced: false };
  }

  const result = data as { has_rls: boolean; rls_forced: boolean }[];
  if (result.length === 0) {
    return { hasRLS: false, rlsForced: false };
  }

  return {
    hasRLS: result[0].has_rls || false,
    rlsForced: result[0].rls_forced || false,
  };
}

/**
 * Retrieve the RLS policies defined for a public-schema table.
 *
 * Queries the database catalogs and returns the policies associated with the specified table.
 *
 * @param tableName - The name of the table in the `public` schema to inspect
 * @returns An array of `PolicyInfo` objects for the table's RLS policies; returns an empty array if no policies are found or if the query fails
 */
async function fetchPolicies(
  supabase: ReturnType<typeof createClient>,
  tableName: string
): Promise<PolicyInfo[]> {
  const { data, error } = await supabase.rpc('query', {
    sql: `
      SELECT
        polname AS policy_name,
        CASE polcmd
          WHEN 'r' THEN 'SELECT'
          WHEN 'a' THEN 'INSERT'
          WHEN 'w' THEN 'UPDATE'
          WHEN 'd' THEN 'DELETE'
          WHEN '*' THEN 'ALL'
        END AS operation,
        polroles::regrole[] AS roles
      FROM pg_policy
      JOIN pg_class ON pg_policy.polrelid = pg_class.oid
      JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
      WHERE nspname = 'public'
        AND relname = $1;
    `,
    params: { 1: tableName },
  });

  if (error) {
    console.warn(`⚠️  Failed to fetch policies for ${tableName}:`, error.message);
    return [];
  }

  if (!data || typeof data !== 'object' || 'error' in data) {
    return [];
  }

  const result = data as { policy_name: string; operation: string; roles: string[] }[];
  return result.map((row) => ({
    policyName: row.policy_name,
    operation: row.operation,
    roles: Array.isArray(row.roles) ? row.roles : [],
  }));
}

/**
 * Produce the Row-Level Security status, discovered policies, and any warnings for a table in the public schema.
 *
 * @param tableName - The name of the table in the `public` schema to analyze
 * @returns An object describing the table's RLS state, whether RLS is forced, the discovered policies, whether the table is an approved exception, and any validation warnings
 */
async function analyzeTable(
  supabase: ReturnType<typeof createClient>,
  tableName: string
): Promise<TableRLSStatus> {
  const isException = RLS_EXCEPTIONS.includes(tableName);
  const { hasRLS, rlsForced } = await checkRLSStatus(supabase, tableName);
  const policies = hasRLS ? await fetchPolicies(supabase, tableName) : [];

  const warnings: string[] = [];

  // Check for common issues
  if (hasRLS && !rlsForced) {
    warnings.push('RLS enabled but not forced (consider using FORCE ROW LEVEL SECURITY)');
  }

  if (hasRLS && policies.length === 0) {
    warnings.push('RLS enabled but no policies defined (table is inaccessible to all users)');
  }

  // Check for missing CRUD operations
  if (hasRLS && policies.length > 0) {
    const operations = new Set(policies.map((p) => p.operation));
    const missingOps = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].filter(
      (op) => !operations.has(op) && !operations.has('ALL')
    );

    if (missingOps.length > 0) {
      warnings.push(`Missing policies for operations: ${missingOps.join(', ')}`);
    }
  }

  return {
    schema: 'public',
    tableName,
    hasRLS,
    rlsForced,
    policies,
    isException,
    hasWarnings: warnings.length > 0,
    warnings,
  };
}

/**
 * Validate row-level security (RLS) status for all public-schema tables and summarize findings.
 *
 * Performs a full scan of user tables, checks whether RLS is enabled/forced, collects policies,
 * identifies gaps (tables without RLS that are not approved exceptions), and aggregates warnings.
 *
 * @param options - Options to control validation behavior.
 * @param options.verbose - When true, print detailed per-table output.
 * @returns A ValidationResult containing success status, counts (total, with RLS, without RLS, exceptions),
 *          lists of gap and warning TableRLSStatus entries, and a textual summary.
 * @throws Error If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set.
 */
async function validateRLS(options: { verbose?: boolean }): Promise<ValidationResult> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Validating Row-Level Security policies...\n');

  // Fetch all tables
  const tables = await fetchAllTables(supabase);

  if (tables.length === 0) {
    console.log('ℹ️  No user tables found in database');
    return {
      success: true,
      totalTables: 0,
      tablesWithRLS: 0,
      tablesWithoutRLS: 0,
      exceptionsCount: 0,
      gaps: [],
      warnings: [],
      summary: ['No tables found'],
    };
  }

  // Analyze each table
  const results = await Promise.all(tables.map((table) => analyzeTable(supabase, table)));

  // Categorize results
  const gaps = results.filter((r) => !r.hasRLS && !r.isException);
  const tablesWithWarnings = results.filter((r) => r.hasWarnings);
  const tablesWithRLS = results.filter((r) => r.hasRLS).length;
  const exceptionsCount = results.filter((r) => r.isException).length;

  // Generate summary
  const summary: string[] = [];
  summary.push(`📊 Total tables: ${results.length}`);
  summary.push(`✅ Tables with RLS: ${tablesWithRLS}`);
  summary.push(`⚠️  Tables without RLS: ${gaps.length}`);
  summary.push(`🔓 Approved exceptions: ${exceptionsCount}`);

  if (gaps.length > 0) {
    summary.push(`\n❌ RLS GAPS FOUND: ${gaps.length} table(s) missing RLS`);
  }

  if (tablesWithWarnings.length > 0) {
    summary.push(`\n⚠️  ${tablesWithWarnings.length} table(s) have warnings`);
  }

  // Display results
  if (options.verbose || gaps.length > 0 || tablesWithWarnings.length > 0) {
    displayResults(results, options.verbose || false);
  }

  // Print summary
  console.log('\n' + summary.join('\n'));

  const success = gaps.length === 0;

  if (!success) {
    console.log('\n💡 To fix RLS gaps:');
    console.log('   1. Review docs/database/rls-implementation.md');
    console.log('   2. Generate policies: pnpm tsx scripts/db/rls-scaffold.ts <table_name>');
    console.log('   3. Or add to exceptions in docs/database/standards.md (with justification)');
    console.log('\n📖 Documentation: docs/recipes/db.md#rls-validation');
  }

  return {
    success,
    totalTables: results.length,
    tablesWithRLS,
    tablesWithoutRLS: gaps.length,
    exceptionsCount,
    gaps,
    warnings: tablesWithWarnings,
    summary,
  };
}

/**
 * Print a human-readable breakdown of RLS validation results to stdout.
 *
 * Prints tables missing RLS, approved exceptions (when `verbose`), and — when `verbose` — details for tables with RLS including whether RLS is forced, policy counts and policy names. Always prints a consolidated warnings section for tables that have warnings.
 *
 * @param results - List of per-table RLS status objects to display
 * @param verbose - If true, include exceptions and detailed RLS/policy information
 */
function displayResults(results: TableRLSStatus[], verbose: boolean): void {
  // Group by status
  const withRLS = results.filter((r) => r.hasRLS && !r.isException);
  const withoutRLS = results.filter((r) => !r.hasRLS && !r.isException);
  const exceptions = results.filter((r) => r.isException);

  // Display tables without RLS (always show)
  if (withoutRLS.length > 0) {
    console.log('❌ Tables WITHOUT RLS:\n');
    withoutRLS.forEach((table) => {
      console.log(`   • ${table.tableName}`);
    });
    console.log('');
  }

  // Display exceptions
  if (exceptions.length > 0 && verbose) {
    console.log('🔓 Approved Exceptions:\n');
    exceptions.forEach((table) => {
      console.log(`   • ${table.tableName}`);
      if (table.hasRLS && table.policies.length > 0) {
        console.log(`     Policies: ${table.policies.map((p) => p.policyName).join(', ')}`);
      }
    });
    console.log('');
  }

  // Display tables with RLS (verbose mode)
  if (withRLS.length > 0 && verbose) {
    console.log('✅ Tables WITH RLS:\n');
    withRLS.forEach((table) => {
      console.log(`   • ${table.tableName}`);
      console.log(`     Forced: ${table.rlsForced ? 'Yes' : 'No'}`);
      console.log(`     Policies: ${table.policies.length}`);

      if (table.policies.length > 0) {
        table.policies.forEach((policy) => {
          console.log(`       - ${policy.policyName} (${policy.operation})`);
        });
      }

      if (table.hasWarnings) {
        table.warnings.forEach((warning) => {
          console.log(`     ⚠️  ${warning}`);
        });
      }
    });
    console.log('');
  }

  // Display warnings summary
  const withWarnings = results.filter((r) => r.hasWarnings);
  if (withWarnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    withWarnings.forEach((table) => {
      console.log(`   • ${table.tableName}:`);
      table.warnings.forEach((warning) => {
        console.log(`     - ${warning}`);
      });
    });
    console.log('');
  }
}

/**
 * Register and run the CLI command `db:validate:rls` to validate Row-Level Security across database tables.
 *
 * Parses command-line options, invokes `validateRLS` with the provided options, optionally emits JSON output
 * when `--json` is specified, and exits the process with a non-zero code if validation fails or an error occurs.
 *
 * Supported options:
 * - `-v, --verbose` — show detailed information for all tables
 * - `--json` — output results as JSON
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('db:validate:rls')
    .description('Validate Row-Level Security policies on all database tables')
    .version('1.0.0')
    .option('-v, --verbose', 'Show detailed information for all tables')
    .option('--json', 'Output results as JSON')
    .action(async (options) => {
      try {
        const result = await validateRLS(options);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        }

        if (!result.success) {
          process.exit(1);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Validation failed:', errorMessage);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

// Run if called directly (cross-platform ESM detection)
if (fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { validateRLS, type ValidationResult, type TableRLSStatus };