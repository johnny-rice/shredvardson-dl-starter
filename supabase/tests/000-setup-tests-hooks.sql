-- pgTAP Test Setup Hook
-- This file runs before all tests to install required extensions and test helpers
-- It establishes the foundation for database-level RLS testing

-- CRITICAL: Install pgTAP extension first - required for all test functions
-- (plan(), ok(), results_eq(), finish(), etc.)
create extension if not exists pgtap with schema extensions;

-- Install http extension (prerequisite for test helpers)
create extension if not exists http with schema extensions;

-- Install pg_tle extension (prerequisite for dbdev)
-- Note: pg_tle is installed in pg_catalog schema by default and cannot be relocated
create extension if not exists pg_tle;

-- Install supabase-dbdev (package manager for Postgres extensions)
-- CRITICAL: Must be installed before using dbdev.install()
create extension if not exists "supabase-dbdev";

-- Install basejump-supabase_test_helpers from database.dev
-- This provides simplified RLS testing utilities:
-- - tests.create_supabase_user(email) - Create test users
-- - tests.authenticate_as(email) - Switch user context
-- - tests.get_supabase_uid(email) - Get user ID
-- - tests.rls_enabled(schema) - Verify RLS on all tables
-- - tests.authenticate_as_service_role() - Switch to admin context
-- - tests.clear_authentication() - Clear auth context
select dbdev.install('basejump-supabase_test_helpers');
create extension if not exists "basejump-supabase_test_helpers" version '0.0.6';

-- Verify setup completed successfully
begin;
select plan(1);
select ok(true, 'Pre-test hook completed successfully - pgTAP and test helpers ready');
select * from finish();
rollback;