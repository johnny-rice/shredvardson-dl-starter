-- ============================================================================
-- RLS-Optimized Table Template: Team/Organization-Scoped Access
-- ============================================================================
-- Use this template for tables where rows belong to teams/organizations
-- with membership checks (e.g., team_projects, org_documents, shared_resources).
--
-- USAGE:
-- 1. Copy this file to supabase/migrations/TIMESTAMP_create_TABLENAME.sql
-- 2. Replace all instances of TABLENAME with your actual table name
-- 3. Customize columns to match your schema
-- 4. Create the security definer function (or reuse existing one)
-- 5. Review and adjust policies as needed
-- 6. Run: supabase db reset (local) or supabase db push (production)
--
-- PERFORMANCE:
-- This template includes all 6 RLS performance optimizations:
-- ✅ Index on team_id (99.94% improvement: 171ms → <0.1ms)
-- ✅ Function caching with SELECT wrapper (94.97% improvement: 179ms → 9ms)
-- ✅ Security definer function (99.993% improvement: 178,000ms → 12ms)
-- ✅ Role specification (99.78% improvement for excluded roles)
-- ✅ No policy joins (replaced with security definer lookup)
-- ✅ Client-side filters documented below
--
-- KEY OPTIMIZATION: Security definer functions
-- Instead of joining to team_members in RLS policies (extremely slow),
-- we use a SECURITY DEFINER function that bypasses RLS for the lookup.
-- This provides 99.993% performance improvement (178,000ms → 12ms).
--
-- REFERENCES:
-- - Full guide: docs/database/RLS_OPTIMIZATION.md
-- - Supabase RLS Performance: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices

BEGIN;

-- ============================================================================
-- CREATE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.TABLENAME (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Team/organization ownership (REQUIRED for team-scoped RLS)
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

    -- Optional: Track creator
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Your custom columns here
    -- title text NOT NULL,
    -- description text,
    -- status text DEFAULT 'active',

    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.TABLENAME ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- OPTIMIZATION 1: Indexes on RLS Filter Columns
-- ============================================================================
-- Impact: 99.94% improvement (171ms → <0.1ms on 10k+ rows)
-- Why: Without indexes, RLS policies trigger sequential scans on every query

-- Index on team_id (primary RLS filter)
CREATE INDEX IF NOT EXISTS idx_TABLENAME_team_id
    ON public.TABLENAME(team_id);

-- Additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_TABLENAME_created_at
    ON public.TABLENAME(created_at DESC);

-- Optional: Index on created_by if you query by creator
-- CREATE INDEX IF NOT EXISTS idx_TABLENAME_created_by
--     ON public.TABLENAME(created_by);

-- Composite index example (if you often filter by team_id AND another column)
-- CREATE INDEX IF NOT EXISTS idx_TABLENAME_team_id_status
--     ON public.TABLENAME(team_id, status) WHERE status = 'active';


-- ============================================================================
-- OPTIMIZATION 3: Security Definer Helper Function
-- ============================================================================
-- Impact: 99.993% improvement (178,000ms → 12ms)
--
-- This function returns all team IDs the current user belongs to.
-- SECURITY DEFINER: Bypasses RLS when querying team_members table
-- STABLE: Result won't change within a statement (enables caching)
--
-- WARNING: This assumes a team_members table exists with structure:
-- CREATE TABLE team_members (
--     team_id uuid REFERENCES teams(id),
--     user_id uuid REFERENCES auth.users(id),
--     role text,
--     PRIMARY KEY (team_id, user_id)
-- );

CREATE OR REPLACE FUNCTION private.user_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    -- Returns team IDs where current user is a member
    SELECT team_id
    FROM public.team_members
    WHERE user_id = auth.uid();
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION private.user_teams() TO authenticated;

-- Optional: Helper for checking specific team membership
CREATE OR REPLACE FUNCTION private.user_is_team_member(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.team_members
        WHERE team_id = check_team_id
          AND user_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION private.user_is_team_member(uuid) TO authenticated;

-- Optional: Helper with role checking
CREATE OR REPLACE FUNCTION private.user_team_role(check_team_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role
    FROM public.team_members
    WHERE team_id = check_team_id
      AND user_id = auth.uid()
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION private.user_team_role(uuid) TO authenticated;


-- ============================================================================
-- OPTIMIZATION 2, 5, 6: Optimized RLS Policies
-- ============================================================================
-- Optimizations applied:
-- - Phase 2: Wrap auth functions in SELECT for caching (94.97% improvement)
-- - Phase 5: NO JOINS - use security definer instead (99.993% improvement)
-- - Phase 6: TO authenticated role specification (99.78% improvement for anon)

-- Policy: Team members can read rows
DROP POLICY IF EXISTS "Team members can view TABLENAME" ON public.TABLENAME;
CREATE POLICY "Team members can view TABLENAME" ON public.TABLENAME
    FOR SELECT
    TO authenticated  -- Phase 6: Only evaluate for authenticated users
    USING (
        -- Phase 5: NO JOIN! Use security definer function instead
        -- ❌ BAD:  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
        -- ✅ GOOD: team_id IN (SELECT private.user_teams())
        team_id IN (SELECT private.user_teams())
    );

-- Policy: Team members can insert rows
DROP POLICY IF EXISTS "Team members can insert TABLENAME" ON public.TABLENAME;
CREATE POLICY "Team members can insert TABLENAME" ON public.TABLENAME
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Ensure user is member of the team they're inserting into
        team_id IN (SELECT private.user_teams())
    );

-- Policy: Team members can update rows
DROP POLICY IF EXISTS "Team members can update TABLENAME" ON public.TABLENAME;
CREATE POLICY "Team members can update TABLENAME" ON public.TABLENAME
    FOR UPDATE
    TO authenticated
    USING (
        team_id IN (SELECT private.user_teams())
    )
    WITH CHECK (
        -- Prevent moving rows to different teams (optional)
        team_id IN (SELECT private.user_teams())
    );

-- Policy: Team members can delete rows
DROP POLICY IF EXISTS "Team members can delete TABLENAME" ON public.TABLENAME;
CREATE POLICY "Team members can delete TABLENAME" ON public.TABLENAME
    FOR DELETE
    TO authenticated
    USING (
        team_id IN (SELECT private.user_teams())
    );

-- Optional: Role-based policy (e.g., only admins can delete)
-- DROP POLICY IF EXISTS "Team admins can delete TABLENAME" ON public.TABLENAME;
-- CREATE POLICY "Team admins can delete TABLENAME" ON public.TABLENAME
--     FOR DELETE
--     TO authenticated
--     USING (
--         private.user_team_role(team_id) IN ('admin', 'owner')
--     );


-- ============================================================================
-- OPTIMIZATION 4: Client-Side Filters (App Code)
-- ============================================================================
-- Always add explicit filters to your queries even if RLS duplicates them.
-- Impact: 94.74% improvement (171ms → 9ms)
--
-- TypeScript/JavaScript examples:
--
-- ✅ GOOD - Explicit filter helps query planner:
-- const { data } = await supabase
--   .from('TABLENAME')
--   .select()
--   .eq('team_id', teamId);
--
-- ❌ BAD - Relies only on RLS, query planner can't optimize:
-- const { data } = await supabase
--   .from('TABLENAME')
--   .select();
--
-- For multi-team queries:
-- ✅ const { data } = await supabase
--   .from('TABLENAME')
--   .select()
--   .in('team_id', userTeamIds);  // Pre-fetch team IDs in app


-- ============================================================================
-- TRIGGERS (Optional)
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_TABLENAME_updated_at ON public.TABLENAME;
CREATE TRIGGER update_TABLENAME_updated_at
    BEFORE UPDATE ON public.TABLENAME
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Auto-set created_by (optional)
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_TABLENAME_created_by ON public.TABLENAME;
CREATE TRIGGER set_TABLENAME_created_by
    BEFORE INSERT ON public.TABLENAME
    FOR EACH ROW
    EXECUTE FUNCTION public.set_created_by();


-- ============================================================================
-- PERFORMANCE COMPARISON
-- ============================================================================
-- Baseline (no optimizations):
-- - No indexes: Sequential scan on 10k rows = 171ms
-- - Inline join in policy: 178,000ms (178 seconds!)
-- - No role specification: Evaluates for all roles
-- - No client filter: Query planner can't optimize
--
-- With all optimizations:
-- - Index on team_id: <0.1ms
-- - Security definer function: 12ms
-- - Role specification: Skip anon evaluation
-- - Client filter: 9ms
--
-- Total improvement: 99.993% (178,000ms → ~12ms)


-- ============================================================================
-- SECURITY CONSIDERATIONS
-- ============================================================================
-- Q: Is SECURITY DEFINER safe?
-- A: Yes, when used correctly. The function only returns team IDs, not
--    sensitive data. The private schema is not exposed via PostgREST API.
--
-- Q: Can users access other teams' data?
-- A: No. The security definer function still uses auth.uid() to filter
--    team_members. It only bypasses RLS on the lookup table, not the
--    target table.
--
-- Q: What if team_members table is compromised?
-- A: RLS on team_members table still applies. Users can only see their
--    own memberships. The security definer function doesn't grant extra
--    permissions, it just optimizes the lookup.


-- ============================================================================
-- VALIDATION (Run these after migration)
-- ============================================================================
-- 1. Check RLS is enabled:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'TABLENAME';
--
-- 2. Check policies exist:
--    SELECT * FROM pg_policies WHERE tablename = 'TABLENAME';
--
-- 3. Check indexes exist:
--    SELECT indexname FROM pg_indexes WHERE tablename = 'TABLENAME';
--
-- 4. Check security definer function:
--    SELECT proname, prosecdef FROM pg_proc WHERE proname = 'user_teams';
--
-- 5. Test as team member:
--    SET LOCAL role = authenticated;
--    SET LOCAL request.jwt.claims.sub = 'user-id-who-is-team-member';
--    SELECT * FROM TABLENAME WHERE team_id = 'some-team-id';
--
-- 6. Test as non-member (should return empty):
--    SET LOCAL role = authenticated;
--    SET LOCAL request.jwt.claims.sub = 'user-id-who-is-NOT-team-member';
--    SELECT * FROM TABLENAME WHERE team_id = 'some-team-id';

COMMIT;
