-- User Isolation Tests
-- Validates that Row Level Security policies properly isolate user data
-- Tests SELECT, INSERT, UPDATE, and DELETE operations across different user contexts

-- CURRENT STATE: Only _health_check table exists with RLS
-- The _health_check table has open read policies (anon + authenticated)
-- This test focuses on validating the isolation works as expected

-- NOTE: As more tables with RLS are added (via Issues #226, #227),
-- this file should be expanded to include comprehensive isolation tests
-- for those tables following the patterns demonstrated here.

begin;
select plan(3);

-- Test 1: Verify anonymous users can read health check (policy allows)
select tests.clear_authentication();

select ok(
    (select count(*) from public._health_check) > 0,
    'Anonymous users can read health check table (policy allows)'
);

-- Test 2: Verify authenticated users can read health check
select tests.create_supabase_user('test_user1@example.com');
select tests.authenticate_as('test_user1@example.com');

select ok(
    (select count(*) from public._health_check) > 0,
    'Authenticated users can read health check table (policy allows)'
);

-- Test 3: Verify users cannot write to health check (no write policy exists)
-- Attempt to insert should fail or be blocked by RLS
select throws_ok(
    'INSERT INTO public._health_check (status) VALUES (''test'')',
    '42501',  -- insufficient_privilege error code
    null,
    'Authenticated users cannot write to health check table (no write policy)'
);

select * from finish();
rollback;

-- Future test patterns to add as more tables with RLS are created:
--
-- PATTERN 1: User can only see their own data
-- CREATE TABLE user_profiles (id uuid primary key, user_id uuid, name text);
-- Test:
--   - User 1 creates profile
--   - User 1 can SELECT their profile
--   - User 2 cannot SELECT User 1's profile
--   - Anonymous cannot SELECT any profiles
--
-- PATTERN 2: User can only modify their own data
-- Test:
--   - User 1 can UPDATE their own profile
--   - User 2 cannot UPDATE User 1's profile
--   - User 1 can DELETE their own profile
--   - User 2 cannot DELETE User 1's profile
--
-- PATTERN 3: Organization/team-based access
-- Test:
--   - Users in same organization can see each other's data
--   - Users in different organizations cannot see each other's data
--
-- Example template for user-scoped table tests:
--
-- select tests.create_supabase_user('user1@test.com');
-- select tests.create_supabase_user('user2@test.com');
--
-- -- Create test data as User 1
-- select tests.authenticate_as('user1@test.com');
-- insert into public.user_profiles (id, user_id, name)
-- values (gen_random_uuid(), tests.get_supabase_uid('user1@test.com'), 'User One');
--
-- -- Verify User 1 can see their data
-- select results_eq(
--     'SELECT count(*)::int FROM public.user_profiles WHERE user_id = tests.get_supabase_uid(''user1@test.com'')',
--     ARRAY[1],
--     'User 1 can see their own profile'
-- );
--
-- -- Switch to User 2
-- select tests.authenticate_as('user2@test.com');
--
-- -- Verify User 2 cannot see User 1's data
-- select results_eq(
--     'SELECT count(*)::int FROM public.user_profiles WHERE user_id = tests.get_supabase_uid(''user1@test.com'')',
--     ARRAY[0],
--     'User 2 cannot see User 1''s profile'
-- );
--
-- -- Verify anonymous users have no access
-- select tests.clear_authentication();
-- select results_eq(
--     'SELECT count(*)::int FROM public.user_profiles',
--     ARRAY[0],
--     'Anonymous users cannot see any profiles'
-- );
