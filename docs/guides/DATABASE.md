# Database Guide

Comprehensive guide to database management in the dl-starter project, covering Supabase setup, migrations, Row Level Security (RLS), seeding, and optimization.

## Table of Contents

- [Overview](#overview)
- [Supabase Setup](#supabase-setup)
- [Database Schema](#database-schema)
- [Migration Workflow](#migration-workflow)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Seeding Data](#seeding-data)
- [Query Patterns](#query-patterns)
- [Performance Optimization](#performance-optimization)
- [Testing Database](#testing-database)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Technology Stack

- **PostgreSQL 15**: Robust, production-ready relational database
- **Supabase**: Backend-as-a-Service providing auth, database, storage, and real-time
- **RLS (Row Level Security)**: Database-level security policies
- **pgTAP**: SQL testing framework for database validation

### Key Features

- ✅ **RLS-first architecture**: Security at the database layer
- ✅ **Type-safe queries**: Generated TypeScript types from schema
- ✅ **Migration management**: Version-controlled schema changes
- ✅ **Automated testing**: Dual-layer validation (SQL + application)
- ✅ **Performance optimized**: Indexed RLS policies with <10ms query times
- ✅ **Local development**: Full local Supabase stack via CLI

### Project Structure

```
dl-starter/
├── supabase/
│   ├── config.toml              # Supabase configuration
│   ├── migrations/              # Database migrations
│   ├── seed.sql                 # Development seed data
│   ├── templates/               # RLS policy templates
│   └── tests/                   # pgTAP database tests
├── packages/db/
│   ├── src/
│   │   ├── types.ts            # Generated TypeScript types
│   │   └── client.ts           # Supabase client config
│   └── package.json
└── scripts/
    ├── db/                      # Database automation scripts
    ├── seed-dev.ts              # Development data seeding
    └── seed-test.ts             # Test data seeding
```

---

## Supabase Setup

### Prerequisites

- **Supabase CLI**: For local development
- **Docker**: Required by Supabase CLI
- **Node.js**: v20 or higher
- **pnpm**: Package manager

### Installation

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# OR
npm install -g supabase             # Cross-platform

# Verify installation
supabase --version
```

### Local Development Setup

**1. Initialize Supabase:**

```bash
# Start Supabase local stack
pnpm db:start

# This starts:
# - PostgreSQL database (port 54322)
# - Studio UI (http://localhost:54323)
# - API server (port 54321)
```

**2. Verify Services:**

```bash
# Check Supabase status
pnpm db:status

# Expected output:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

**3. Access Studio:**

Open [http://localhost:54323](http://localhost:54323) to access Supabase Studio for:

- Table editor
- SQL editor
- Authentication management
- Storage browser
- Real-time logs

### Configuration

**Supabase Config** (`supabase/config.toml`):

```toml
project_id = "dl-starter-new"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[db.pooler]
enabled = false

[studio]
enabled = true
port = 54323
api_url = "http://localhost"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = []
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false
```

### Environment Variables

**Local Development** (`.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Database (for direct access)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

**Production** (Vercel/Environment):

```bash
# Supabase (from your project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
```

### Supabase Client Setup

**Client Configuration** (`packages/db/src/client.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type-safe client
export type SupabaseClient = typeof supabase;
```

**Usage in Application** (`apps/web/src/lib/supabase/client.ts`):

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@shared/db/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

## Database Schema

### Generating TypeScript Types

Supabase can automatically generate TypeScript types from your database schema:

```bash
# Generate types from local database
pnpm db:types

# This runs:
# supabase gen types typescript --schema public > packages/db/src/types.ts
```

**Generated Types Example:**

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
```

### Schema Best Practices

**1. Use UUIDs for Primary Keys:**

```sql
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ...
);
```

**2. Add Timestamps:**

```sql
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
```

**3. Use Foreign Keys with Cascades:**

```sql
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- ...
);
```

**4. Add Indexes for Query Performance:**

```sql
-- Index foreign keys
CREATE INDEX idx_posts_user_id ON public.posts(user_id);

-- Index commonly filtered columns
CREATE INDEX idx_posts_published_at ON public.posts(published_at);

-- Composite indexes for multiple columns
CREATE INDEX idx_posts_user_published ON public.posts(user_id, published_at);
```

---

## Migration Workflow

### Overview

Migrations are version-controlled SQL files that modify the database schema.

### Creating Migrations

**Using CLI:**

```bash
# Create new migration
pnpm db:migrate:create

# This creates a timestamped file in supabase/migrations/
# Example: 20251110120000_add_users_table.sql
```

**Manual Creation:**

```bash
# Create migration file with timestamp
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
```

### Migration Structure

**Basic Migration Template:**

```sql
-- Migration: [Description]
-- Generated: [ISO 8601 timestamp]
-- Status: [DRAFT | REVIEW | PRODUCTION READY]

BEGIN;

-- Your schema changes here

COMMIT;
```

**Example Migration** (`20251110120000_create_profiles_table.sql`):

```sql
-- Migration: Create profiles table with RLS
-- Generated: 2025-11-10T12:00:00.000Z
-- Status: PRODUCTION READY

BEGIN;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    bio text,
    website text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMIT;
```

### Applying Migrations

**Local Development:**

```bash
# Apply all pending migrations
pnpm db:migrate

# Reset database (drop and recreate)
pnpm db:reset

# View migration status
pnpm db:status
```

**Production:**

```bash
# Link to remote project
supabase link --project-ref <project-id>

# Apply migrations to production
supabase db push
```

### Migration Best Practices

**1. Use Transactions:**

```sql
BEGIN;
-- Your changes
COMMIT;
```

**2. Make Migrations Reversible:**

```sql
-- Bad: Can't easily reverse
ALTER TABLE users DROP COLUMN email;

-- Good: Safer approach
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
-- Then in a later migration, after verifying no issues:
ALTER TABLE users DROP COLUMN email;
```

**3. Test Migrations Locally:**

```bash
# Reset and apply migrations
pnpm db:reset

# Run tests
pnpm test:rls
```

**4. Add Comments:**

```sql
-- Explain WHY, not just WHAT
-- Adding email_verified to support multi-factor auth (Issue #123)
ALTER TABLE users ADD COLUMN email_verified boolean DEFAULT false;
```

**5. Validate Before Production:**

```bash
# Validate migration syntax
pnpm db:validate

# Review migration diff
pnpm db:diff
```

### Common Migration Patterns

**Adding a Table:**

```sql
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Adding a Column:**

```sql
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
```

**Adding an Index:**

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_published
    ON public.posts(published_at)
    WHERE published_at IS NOT NULL;
```

**Creating an Enum:**

```sql
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

ALTER TABLE public.posts
ADD COLUMN status post_status DEFAULT 'draft';
```

---

## Row Level Security (RLS)

### Overview

RLS policies enforce security at the database level, ensuring users can only access data they're authorized to see.

### Why RLS?

- **Defense in depth**: Security isn't just in application code
- **Prevents data leaks**: Even if application has bugs
- **Multi-tenant isolation**: Each user sees only their data
- **Audit compliance**: Centralized access control

### RLS Patterns

#### 1. User Ownership Pattern

Users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- INSERT: Users can create their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- DELETE: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
```

#### 2. Public Read, Authenticated Write

Anyone can read, only authenticated users can write:

```sql
-- SELECT: Anyone can view
CREATE POLICY "Public profiles are viewable"
    ON public.profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- INSERT/UPDATE: Only authenticated
CREATE POLICY "Authenticated users can manage profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
```

#### 3. Team/Organization Pattern

Users can access data within their organization:

```sql
-- SELECT: Users in same org
CREATE POLICY "Users can view org data"
    ON public.projects
    FOR SELECT
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.org_members
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- With role-based access
CREATE POLICY "Admins can manage org data"
    ON public.projects
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = (SELECT auth.uid())
            AND org_id = projects.org_id
            AND role IN ('admin', 'owner')
        )
    );
```

#### 4. Role-Based Access Control (RBAC)

Different policies based on user roles:

```sql
-- View: All authenticated users
CREATE POLICY "Everyone can view posts"
    ON public.posts
    FOR SELECT
    TO authenticated
    USING (published_at IS NOT NULL);

-- Edit: Only author or admin
CREATE POLICY "Authors and admins can edit posts"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
    );
```

### RLS Policy Templates

The project includes optimized RLS templates in `supabase/templates/`:

**User-Scoped Template** (`table-with-user-rls.sql`):

```sql
-- RLS-Optimized Table Template: User-Scoped Access
--
-- Performance Optimizations Included:
-- ✅ Index on user_id (99.94% improvement)
-- ✅ Function caching with SELECT wrapper (94.97% improvement)
-- ✅ Role specification (99.78% improvement)

CREATE TABLE IF NOT EXISTS public.TABLENAME (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.TABLENAME ENABLE ROW LEVEL SECURITY;

-- Index on user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_TABLENAME_user_id
    ON public.TABLENAME(user_id);

-- Policy: Users can read their own rows
CREATE POLICY "Users can view their own TABLENAME" ON public.TABLENAME
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- Policy: Users can insert their own rows
CREATE POLICY "Users can insert their own TABLENAME" ON public.TABLENAME
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Policy: Users can update their own rows
CREATE POLICY "Users can update their own TABLENAME" ON public.TABLENAME
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Policy: Users can delete their own rows
CREATE POLICY "Users can delete their own TABLENAME" ON public.TABLENAME
    FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
```

**Team-Scoped Template** (`table-with-team-rls.sql`):

```sql
-- RLS-Optimized Table Template: Team/Organization Access

CREATE TABLE IF NOT EXISTS public.TABLENAME (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.TABLENAME ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_TABLENAME_org_id
    ON public.TABLENAME(org_id);
CREATE INDEX IF NOT EXISTS idx_TABLENAME_created_by
    ON public.TABLENAME(created_by);

-- Policy: Org members can view
CREATE POLICY "Org members can view TABLENAME" ON public.TABLENAME
    FOR SELECT
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.org_members
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- Policy: Org admins can manage
CREATE POLICY "Org admins can manage TABLENAME" ON public.TABLENAME
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = (SELECT auth.uid())
            AND org_id = TABLENAME.org_id
            AND role IN ('admin', 'owner')
        )
    );
```

### Using Templates

```bash
# Copy template
cp supabase/templates/table-with-user-rls.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_create_my_table.sql

# Replace TABLENAME with your table name
sed -i '' 's/TABLENAME/my_table/g' supabase/migrations/*_create_my_table.sql

# Apply migration
pnpm db:migrate
```

### RLS Performance Optimization

See `docs/database/RLS_OPTIMIZATION.md` for comprehensive performance guide. Key techniques:

**1. Add Indexes on Filter Columns (99.94% faster):**

```sql
-- Index the column used in USING/WITH CHECK
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
```

**2. Use SELECT Wrapper for Function Caching (94.97% faster):**

```sql
-- Bad: Function called for every row
USING (user_id = auth.uid())

-- Good: Function called once, result cached
USING (user_id = (SELECT auth.uid()))
```

**3. Specify Role (99.78% faster):**

```sql
-- Bad: Policy applies to all roles
CREATE POLICY "name" ON table FOR SELECT USING (...);

-- Good: Policy only for authenticated users
CREATE POLICY "name" ON table FOR SELECT TO authenticated USING (...);
```

**4. Client-Side Explicit Filters:**

```typescript
// Add explicit filter matching RLS policy
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId); // Matches RLS policy
```

**5. Use Security Definer Functions:**

```sql
-- For complex queries with multiple joins
CREATE FUNCTION get_user_posts(p_user_id uuid)
RETURNS TABLE (...) AS $$
BEGIN
    RETURN QUERY SELECT ... FROM posts WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**6. Denormalize to Avoid Policy Joins:**

```sql
-- Bad: Join in policy
USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

-- Good: Denormalize user_id onto table
ALTER TABLE posts ADD COLUMN user_id uuid;
USING (user_id = (SELECT auth.uid()));
```

### Testing RLS Policies

See [TESTING.md](./TESTING.md#database-testing) for comprehensive database testing guide.

**Quick Test:**

```sql
-- Switch to test user
SET LOCAL "request.jwt.claim.sub" = '<user-uuid>';

-- Verify user can only see their data
SELECT * FROM public.profiles;

-- Try to access another user's data (should fail)
SELECT * FROM public.profiles WHERE user_id != '<user-uuid>';
```

---

## Seeding Data

### Development Seed Data

**Seed File** (`supabase/seed.sql`):

```sql
-- Seed data for development
-- Run with: supabase db reset

DO $$
BEGIN
    -- Health check table
    CREATE TABLE IF NOT EXISTS public._health_check (
        id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        status TEXT DEFAULT 'ok',
        checked_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public._health_check ENABLE ROW LEVEL SECURITY;

    -- RLS policies with role specification
    CREATE POLICY "Allow anonymous health check reads"
        ON public._health_check
        FOR SELECT
        TO anon
        USING (true);

    CREATE POLICY "Allow authenticated health check reads"
        ON public._health_check
        FOR SELECT
        TO authenticated
        USING (true);

    -- Insert initial health check
    INSERT INTO public._health_check (status)
    SELECT 'healthy'
    WHERE NOT EXISTS (SELECT 1 FROM public._health_check LIMIT 1);
END $$;
```

### TypeScript Seeding Scripts

**Development Data** (`scripts/seed-dev.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
);

async function seed() {
  // Create test users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: `user${i}@example.com`,
      password: 'password123',
      email_confirm: true,
    });

    if (error) throw error;
    users.push(user);
  }

  // Create profiles
  const profiles = users.map((user) => ({
    user_id: user.id,
    username: `user${users.indexOf(user) + 1}`,
    full_name: `Test User ${users.indexOf(user) + 1}`,
  }));

  const { error: profilesError } = await supabase
    .from('profiles')
    .insert(profiles);

  if (profilesError) throw profilesError;

  console.log('✅ Seeded development data');
}

seed().catch(console.error);
```

**Test Data** (`scripts/seed-test.ts`):

```typescript
// Deterministic test data for automated tests
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTest() {
  // Create deterministic test users
  const testUsers = [
    { email: 'test-user-1@example.com', username: 'test-user-1' },
    { email: 'test-user-2@example.com', username: 'test-user-2' },
    { email: 'test-admin@example.com', username: 'test-admin' },
  ];

  for (const testUser of testUsers) {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: 'testpassword',
      email_confirm: true,
    });

    if (error) {
      console.error(`Error creating ${testUser.email}:`, error);
      continue;
    }

    // Create profile
    await supabase.from('profiles').insert({
      user_id: user.id,
      username: testUser.username,
      full_name: testUser.username,
    });
  }

  console.log('✅ Seeded test data');
}

seedTest().catch(console.error);
```

### Running Seed Scripts

```bash
# Reset database and apply seed.sql
pnpm db:reset

# Run development seed script
pnpm db:seed:dev

# Run test seed script
pnpm db:seed:test
```

---

## Query Patterns

### Basic Queries

**Select:**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*');
```

**Filter:**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', 'john');
```

**Multiple Filters:**

```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', '2025-01-01')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Insert

**Single Row:**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    user_id: userId,
    username: 'john',
    full_name: 'John Doe',
  })
  .select()
  .single();
```

**Multiple Rows:**

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Post 1', user_id: userId },
    { title: 'Post 2', user_id: userId },
  ])
  .select();
```

### Update

**With Filter:**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Jane Doe' })
  .eq('user_id', userId)
  .select()
  .single();
```

### Delete

**With Filter:**

```typescript
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

### Joins (Relations)

**One-to-Many:**

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select(`
    *,
    posts (
      id,
      title,
      created_at
    )
  `)
  .eq('username', 'john')
  .single();
```

**Many-to-Many:**

```typescript
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    user_roles (
      roles (
        id,
        name
      )
    )
  `);
```

### Real-time Subscriptions

**Subscribe to Changes:**

```typescript
const subscription = supabase
  .channel('profiles-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'profiles',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Change detected:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Error Handling

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    // No rows returned
    console.log('Profile not found');
  } else {
    // Other errors
    console.error('Database error:', error);
  }
  return null;
}

return data;
```

### Type-Safe Queries

```typescript
import type { Database } from '@shared/db/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Type-safe insert
const newProfile: ProfileInsert = {
  user_id: userId,
  username: 'john',
  // TypeScript will error if required fields are missing
};

const { data, error } = await supabase
  .from('profiles')
  .insert(newProfile)
  .select()
  .single();

// data is typed as Profile
```

---

## Performance Optimization

### Indexing Strategy

**1. Index Foreign Keys:**

```sql
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
```

**2. Index Frequently Filtered Columns:**

```sql
CREATE INDEX idx_posts_published_at ON public.posts(published_at)
WHERE published_at IS NOT NULL; -- Partial index
```

**3. Composite Indexes:**

```sql
-- For queries filtering on both columns
CREATE INDEX idx_posts_user_published
    ON public.posts(user_id, published_at);
```

**4. Use CONCURRENT Creation:**

```sql
-- Avoids locking table during index creation
CREATE INDEX CONCURRENTLY idx_posts_title
    ON public.posts USING GIN(to_tsvector('english', title));
```

### Query Optimization

**1. Select Only Needed Columns:**

```typescript
// Bad: Fetches all columns
const { data } = await supabase.from('posts').select('*');

// Good: Fetch only needed columns
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at');
```

**2. Use Pagination:**

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 9) // First 10 items
  .order('created_at', { ascending: false });
```

**3. Add Explicit Filters for RLS:**

```typescript
// Add filter matching RLS policy
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId); // Matches RLS policy, uses index
```

**4. Use COUNT Efficiently:**

```typescript
// For exact count (slower)
const { count } = await supabase
  .from('posts')
  .select('*', { count: 'exact', head: true });

// For estimated count (faster)
const { count } = await supabase
  .from('posts')
  .select('*', { count: 'estimated', head: true });
```

### Connection Pooling

Supabase handles connection pooling automatically. For custom pooling:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-my-custom-header': 'value',
      },
    },
  }
);
```

### Monitoring Performance

**1. Use EXPLAIN ANALYZE:**

```sql
EXPLAIN ANALYZE
SELECT * FROM public.posts
WHERE user_id = '...'
ORDER BY created_at DESC
LIMIT 10;
```

**2. Check Slow Queries:**

```sql
-- Enable slow query logging
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- 1 second

-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**3. Monitor Index Usage:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## Testing Database

See [TESTING.md](./TESTING.md#database-testing) for comprehensive guide.

### Quick Reference

**Run pgTAP Tests:**

```bash
pnpm test:rls
```

**Run Application RLS Tests:**

```bash
pnpm test:unit tests/rls/
```

**Validate RLS Policies:**

```bash
pnpm db:validate:rls
```

---

## Troubleshooting

### Common Issues

#### 1. RLS Policy Not Working

**Symptoms**: Users can't access their own data or can see other users' data

**Solution**:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Verify auth.uid() returns correct value
SELECT auth.uid();

-- Test as specific user
SET LOCAL "request.jwt.claim.sub" = '<user-uuid>';
SELECT * FROM your_table;
```

#### 2. Slow Queries

**Symptoms**: Queries taking >100ms

**Solution**:

```sql
-- Check if indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'your_table';

-- Add missing indexes
CREATE INDEX idx_table_column ON public.your_table(column_name);

-- Use EXPLAIN to diagnose
EXPLAIN ANALYZE SELECT * FROM your_table WHERE column = 'value';
```

#### 3. Migration Failed

**Symptoms**: Migration won't apply

**Solution**:

```bash
# Check migration status
pnpm db:status

# View detailed error
supabase migration repair --status failed

# Fix migration file and retry
pnpm db:migrate

# If corrupted, reset and reapply
pnpm db:reset
```

#### 4. Type Generation Failing

**Symptoms**: `pnpm db:types` fails

**Solution**:

```bash
# Ensure database is running
pnpm db:start

# Check for schema errors
psql -U postgres -h localhost -p 54322 -d postgres -c "\d"

# Regenerate types
pnpm db:types
```

#### 5. Can't Connect to Database

**Symptoms**: Connection refused errors

**Solution**:

```bash
# Check if Supabase is running
pnpm db:status

# Restart Supabase
pnpm db:stop
pnpm db:start

# Verify Docker is running
docker ps

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 6. Authentication Issues

**Symptoms**: Users can't sign in/up

**Solution**:

```bash
# Check auth configuration
cat supabase/config.toml | grep -A 10 "\[auth\]"

# Verify auth is enabled
# [auth]
# enabled = true

# Check user exists
supabase db shell
SELECT * FROM auth.users WHERE email = 'user@example.com';

# Reset user password
UPDATE auth.users
SET encrypted_password = crypt('newpassword', gen_salt('bf'))
WHERE email = 'user@example.com';
```

### Debug Mode

**Enable SQL Logging:**

```typescript
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    fetch: (...args) => {
      console.log('Fetch:', args);
      return fetch(...args);
    },
  },
});
```

**Check Supabase Logs:**

```bash
# View logs in Studio
# http://localhost:54323 > Logs

# Or via CLI
supabase functions logs
```

---

## Next Steps

- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide (includes RLS testing)
- **[SKILLS.md](./SKILLS.md)** - Database workflow automation with `/db` skill
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Monorepo structure and database package
- **[../database/rls-implementation.md](../database/rls-implementation.md)** - Comprehensive RLS guide
- **[../database/RLS_OPTIMIZATION.md](../database/RLS_OPTIMIZATION.md)** - RLS performance optimization

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [RLS Performance Guide](https://supabase.com/docs/guides/database/postgres/row-level-security#performance)
- [pgTAP Documentation](https://pgtap.org/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
