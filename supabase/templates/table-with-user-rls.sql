-- ============================================================================
-- RLS-Optimized Table Template: User-Scoped Access
-- ============================================================================
-- Use this template for tables where each row belongs to a single user
-- (e.g., profiles, user_settings, user_documents).
--
-- USAGE:
-- 1. Copy this file to supabase/migrations/TIMESTAMP_create_TABLENAME.sql
-- 2. Replace all instances of TABLENAME with your actual table name
-- 3. Customize columns to match your schema
-- 4. Review and adjust policies as needed
-- 5. Run: supabase db reset (local) or supabase db push (production)
--
-- PERFORMANCE:
-- This template includes all 6 RLS performance optimizations:
-- ✅ Index on user_id (99.94% improvement: 171ms → <0.1ms)
-- ✅ Function caching with SELECT wrapper (94.97% improvement: 179ms → 9ms)
-- ✅ Role specification (99.78% improvement for excluded roles)
-- ✅ No policy joins (template design)
-- ✅ Security definer functions available (private schema)
-- ✅ Client-side filters documented below
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

    -- User ownership (REQUIRED for user-scoped RLS)
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Your custom columns here
    -- name text NOT NULL,
    -- description text,
    -- is_active boolean DEFAULT true,

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

-- Index on user_id (primary RLS filter)
CREATE INDEX IF NOT EXISTS idx_TABLENAME_user_id
    ON public.TABLENAME(user_id);

-- Additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_TABLENAME_created_at
    ON public.TABLENAME(created_at DESC);

-- Composite index example (if you often filter by user_id AND another column)
-- CREATE INDEX IF NOT EXISTS idx_TABLENAME_user_id_created_at
--     ON public.TABLENAME(user_id, created_at DESC);


-- ============================================================================
-- OPTIMIZATION 2, 5, 6: Optimized RLS Policies
-- ============================================================================
-- Optimizations applied:
-- - Phase 2: Wrap auth.uid() in SELECT for per-statement caching (94.97% improvement)
-- - Phase 5: No joins in policies (99.78% improvement)
-- - Phase 6: TO authenticated role specification (99.78% improvement for anon)

-- Policy: Users can read their own rows
DROP POLICY IF EXISTS "Users can view their own TABLENAME" ON public.TABLENAME;
CREATE POLICY "Users can view their own TABLENAME" ON public.TABLENAME
    FOR SELECT
    TO authenticated  -- Phase 6: Only evaluate for authenticated users
    USING (
        user_id = (SELECT auth.uid())  -- Phase 2: Cache auth.uid() result
    );

-- Policy: Users can insert their own rows
DROP POLICY IF EXISTS "Users can insert their own TABLENAME" ON public.TABLENAME;
CREATE POLICY "Users can insert their own TABLENAME" ON public.TABLENAME
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = (SELECT auth.uid())  -- Phase 2: Cache auth.uid() result
    );

-- Policy: Users can update their own rows
DROP POLICY IF EXISTS "Users can update their own TABLENAME" ON public.TABLENAME;
CREATE POLICY "Users can update their own TABLENAME" ON public.TABLENAME
    FOR UPDATE
    TO authenticated
    USING (
        user_id = (SELECT auth.uid())  -- Phase 2: Cache auth.uid() result
    )
    WITH CHECK (
        user_id = (SELECT auth.uid())  -- Prevent changing ownership
    );

-- Policy: Users can delete their own rows
DROP POLICY IF EXISTS "Users can delete their own TABLENAME" ON public.TABLENAME;
CREATE POLICY "Users can delete their own TABLENAME" ON public.TABLENAME
    FOR DELETE
    TO authenticated
    USING (
        user_id = (SELECT auth.uid())  -- Phase 2: Cache auth.uid() result
    );


-- ============================================================================
-- OPTIMIZATION 3: Security Definer Helper (Available from Infrastructure)
-- ============================================================================
-- The private.current_user_id() function is available from the infrastructure
-- migration. You can use it like this:
--
-- USING (user_id = private.current_user_id())
--
-- This is equivalent to (SELECT auth.uid()) but more semantic.
-- Use whichever style you prefer - performance is identical.


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
--   .eq('user_id', userId);
--
-- ❌ BAD - Relies only on RLS, query planner can't optimize:
-- const { data } = await supabase
--   .from('TABLENAME')
--   .select();
--
-- Python example:
-- ✅ response = supabase.table('TABLENAME').select('*').eq('user_id', user_id).execute()
-- ❌ response = supabase.table('TABLENAME').select('*').execute()


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
-- 4. Test as authenticated user:
--    SET LOCAL role = authenticated;
--    SET LOCAL request.jwt.claims.sub = 'some-user-id';
--    SELECT * FROM TABLENAME;

COMMIT;
