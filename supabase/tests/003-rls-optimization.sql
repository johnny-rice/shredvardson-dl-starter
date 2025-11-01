-- ============================================================================
-- RLS Optimization Validation Tests
-- ============================================================================
-- Tests that RLS performance optimizations are correctly configured.
-- Run with: pnpm test:rls
--
-- Validates:
-- 1. Private schema exists and is configured correctly
-- 2. Security definer functions exist and are configured correctly
-- 3. Indexes exist on RLS policy filter columns
-- 4. Policies specify roles correctly
-- 5. RLS security is still enforced (no regressions)
--
-- Related: Issue #237, docs/database/RLS_OPTIMIZATION.md

BEGIN;

-- Load pgTAP extension
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Plan: Define number of tests
SELECT plan(12);

-- ============================================================================
-- TEST GROUP 1: Private Schema Infrastructure
-- ============================================================================

SELECT has_schema(
    'private',
    'Private schema should exist for security definer functions'
);

SELECT schema_privs_are(
    'private',
    'authenticated',
    ARRAY['USAGE'],
    'Authenticated role should have USAGE on private schema'
);

-- ============================================================================
-- TEST GROUP 2: Security Definer Functions
-- ============================================================================

SELECT has_function(
    'private',
    'current_user_id',
    'Security definer function current_user_id() should exist'
);

SELECT function_returns(
    'private',
    'current_user_id',
    'uuid',
    'current_user_id() should return uuid'
);

-- Check function is SECURITY DEFINER
SELECT has_function(
    'private',
    'current_user_id',
    ARRAY[]::text[],  -- No parameters
    'current_user_id() should exist with no parameters'
);

-- Note: pgTAP doesn't have a direct test for SECURITY DEFINER or STABLE flags
-- We verify this with a custom query
SELECT is(
    (SELECT prosecdef FROM pg_proc
     JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
     WHERE pg_namespace.nspname = 'private'
       AND proname = 'current_user_id'),
    true,
    'current_user_id() should be SECURITY DEFINER'
);

SELECT is(
    (SELECT provolatile FROM pg_proc
     JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
     WHERE pg_namespace.nspname = 'private'
       AND proname = 'current_user_id'),
    's',  -- 's' = STABLE, 'i' = IMMUTABLE, 'v' = VOLATILE
    'current_user_id() should be STABLE for caching'
);

-- ============================================================================
-- TEST GROUP 3: Index Optimization
-- ============================================================================

-- Check that _health_check table has PRIMARY KEY index on id column
-- (PRIMARY KEY automatically creates a B-tree index)
SELECT ok(
    (SELECT COUNT(*) FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename = '_health_check'
       AND indexname LIKE '%_pkey') > 0,
    'PRIMARY KEY index should exist on _health_check.id (automatic B-tree index)'
);

-- ============================================================================
-- TEST GROUP 4: Policy Configuration
-- ============================================================================

-- Check policies exist on _health_check table
SELECT policies_are(
    'public',
    '_health_check',
    ARRAY[
        'Allow anonymous health check reads',
        'Allow authenticated health check reads'
    ],
    'Expected policies should exist on _health_check table'
);

-- Check that policies specify roles (not empty)
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = '_health_check'
       AND roles IS NOT NULL
       AND array_length(roles, 1) > 0) > 0,
    'Policies should specify roles for optimization'
);

-- ============================================================================
-- TEST GROUP 5: Security Validation
-- ============================================================================

-- Verify RLS is enabled on _health_check
SELECT ok(
    (SELECT rowsecurity FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename = '_health_check'),
    'RLS should be enabled on _health_check table'
);

-- Verify policies are active (not disabled)
SELECT ok(
    (SELECT COUNT(*) FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = '_health_check'
       AND cmd = 'SELECT') >= 2,
    'At least 2 SELECT policies should exist on _health_check'
);

-- ============================================================================
-- Finish tests
-- ============================================================================

SELECT * FROM finish();

ROLLBACK;
