# RLS-Optimized Table Templates

This directory contains **production-ready SQL templates** for creating new tables with Row Level Security (RLS) performance optimizations baked in.

## 📋 Available Templates

### [`table-with-user-rls.sql`](./table-with-user-rls.sql)

**Use for:** Tables where each row belongs to a single user (profiles, settings, user documents)

**Includes:**

- User ownership via `user_id` column
- Optimized policies for SELECT, INSERT, UPDATE, DELETE
- Index on `user_id` for 99.94% faster queries
- Function caching for 94.97% improvement
- Role specification for 99.78% improvement

### [`table-with-team-rls.sql`](./table-with-team-rls.sql)

**Use for:** Tables where rows belong to teams/organizations with membership checks

**Includes:**

- Team ownership via `team_id` column
- Security definer helper functions (99.993% improvement!)
- Optimized policies that avoid expensive joins
- Example role-based access patterns
- Index on `team_id` for fast lookups

## 🚀 Quick Start

### 1. Copy Template

```bash
# For user-scoped tables:
cp supabase/templates/table-with-user-rls.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_create_my_table.sql

# For team-scoped tables:
cp supabase/templates/table-with-team-rls.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_create_my_team_table.sql
```

### 2. Customize

Replace all instances of `TABLENAME` with your actual table name:

```bash
# macOS/BSD sed:
sed -i '' 's/TABLENAME/my_table/g' supabase/migrations/*_create_my_table.sql

# Linux/GNU sed:
sed -i 's/TABLENAME/my_table/g' supabase/migrations/*_create_my_table.sql
```

Or manually search/replace in your editor.

### 3. Add Your Columns

Edit the `CREATE TABLE` section to add your custom columns:

```sql
CREATE TABLE IF NOT EXISTS public.my_table (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- 👇 Your columns here
    title text NOT NULL,
    description text,
    is_active boolean DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 4. Apply Migration

```bash
# Local development:
supabase db reset

# Production:
supabase db push
```

## ✅ Optimization Checklist

When creating a new table with RLS, ensure you have:

- [ ] **Indexes on filter columns** (user_id, team_id, etc.)
- [ ] **Function caching** with `(SELECT auth.uid())` wrapper
- [ ] **Role specification** with `TO authenticated` or `TO anon`
- [ ] **Security definer functions** for team/role lookups (if needed)
- [ ] **No joins in policies** (use security definer functions instead)
- [ ] **Client-side filters** in app code (even if RLS duplicates them)

## 📊 Performance Impact

Using these templates provides dramatic performance improvements:

| Optimization         | Improvement | Query Time         |
| -------------------- | ----------- | ------------------ |
| No optimizations     | Baseline    | 171ms - 178,000ms  |
| + Indexes            | 99.94%      | <0.1ms             |
| + Function caching   | 94.97%      | 9ms                |
| + Security definer   | 99.993%     | 12ms               |
| + Role specification | 99.78%      | (skips evaluation) |
| + Client filters     | 94.74%      | 9ms                |

**Overall:** Queries go from **minutes** to **milliseconds** (>99.99% improvement on complex queries).

## 📚 Learn More

- **Comprehensive guide:** [docs/database/RLS_OPTIMIZATION.md](../../docs/database/RLS_OPTIMIZATION.md)
- **Testing guide:** [docs/testing/TESTING_GUIDE.md](../../docs/testing/TESTING_GUIDE.md)
- **Official docs:** [Supabase RLS Performance Guide](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices)

## 🔒 Security Notes

- Templates include proper RLS policies that maintain security
- Security definer functions only return IDs, not sensitive data
- Private schema is not exposed via PostgREST API
- All patterns are industry-standard and well-tested

## 💡 Tips

1. **Always use templates** for new tables - don't write RLS from scratch
2. **Read the inline comments** in templates to understand each optimization
3. **Test locally** with `supabase db reset` before pushing to production
4. **Add client-side filters** in your app code even if RLS handles security
5. **Review the optimization guide** if you need custom policies

## ❓ Need Help?

- Read the full guide: [docs/database/RLS_OPTIMIZATION.md](../../docs/database/RLS_OPTIMIZATION.md)
- Check existing migrations for examples
- See [Issue #237](https://github.com/your-org/your-repo/issues/237) for background
