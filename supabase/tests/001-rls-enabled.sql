-- Schema-Wide RLS Validation Test
-- Verifies that Row Level Security is enabled on all tables in the public schema
-- This catches any tables that accidentally lack RLS policies

begin;
select plan(1);

-- Verify RLS is enabled on all tables in public schema
-- This will fail if any table lacks RLS (unless explicitly excepted)
-- The tests.rls_enabled() helper from basejump-supabase_test_helpers
-- automatically checks all tables and reports which ones are missing RLS
select tests.rls_enabled('public');

select * from finish();
rollback;
