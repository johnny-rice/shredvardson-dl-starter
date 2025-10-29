/**
 * @fileoverview RLS test helpers for Row-Level Security policy validation
 *
 * NOTE: This file uses `any` type assertions for dynamic table access in test helpers.
 * This is intentional to provide flexible test utilities that work with any table structure.
 * While we could constrain to `keyof Database['public']['Tables']`, this would:
 * 1. Require updating test helpers every time tables change
 * 2. Limit testing to only existing tables (can't test new migrations)
 * 3. Add complexity for minimal safety gain in test-only code
 *
 * The `any` usage is:
 * - Documented at each usage site
 * - Scoped to specific operations (insert/delete)
 * - Used only in test helpers (not production code)
 * - Protected by runtime validation (Supabase will error on invalid tables)
 *
 * Lint suppression is applied at specific call sites via `biome-ignore` (not file-level),
 * so the rest of this file keeps strict type checking.
 */
/**
 *
 * Provides utilities to create Supabase clients with different auth contexts:
 * - User impersonation for testing user-scoped policies
 * - Admin access for seeding test data and bypassing RLS
 * - Test data management for RLS validation
 *
 * ## Best Practices for RLS Testing (2025)
 *
 * 1. **Use admin.generateLink() with OTP verification for user impersonation**
 *    - Generates magic links with OTP tokens or hashed tokens
 *    - Authenticates via verifyOtp() to obtain valid JWT for RLS
 *    - Recommended by Supabase for testing RLS policies
 *
 * 2. **Use pgTAP for database-level RLS testing**
 *    - For comprehensive RLS validation, use `supabase test db` with pgTAP
 *    - Install basejump-supabase_test_helpers for simplified RLS testing
 *    - Database-level tests can use transactions for isolation
 *
 * 3. **Application-level tests (this file) complement pgTAP**
 *    - Test RLS from the application's perspective
 *    - Use unique user IDs for test isolation (no transaction support)
 *    - Always clean up test data in afterEach hooks
 *
 * 4. **Security considerations**
 *    - Never expose service role key in frontend code
 *    - Always enable RLS on public schema tables
 *    - Test with authenticated, anon, and service_role contexts
 *
 * @see https://supabase.com/docs/guides/local-development/testing/pgtap-extended
 * @see https://supabase.com/docs/guides/database/postgres/row-level-security
 *
 * @example
 * ```typescript
 * // Create admin client for setup
 * const adminClient = createAdminClient();
 *
 * // Seed test data
 * const { user1, user2 } = await seedRLSTestData(adminClient);
 *
 * // Create user-scoped client for testing
 * const user1Client = await createUserClient(user1.id);
 * ```
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../../packages/db/src/types';

/**
 * Type helpers for type-safe table operations
 * Exported for use in test files
 */
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables & string;
export type RowOf<T extends TableName> = Tables[T]['Row'];
export type InsertOf<T extends TableName> = Tables[T]['Insert'];

/**
 * Environment variables required for RLS testing
 */
interface RLSTestEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

/**
 * Validate required environment variables
 * Falls back to server-side SUPABASE_* vars if NEXT_PUBLIC_* are not set (e.g., in CI)
 * @throws Error if required env vars are missing
 */
function validateEnv(): RLSTestEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anonKey) {
    throw new Error(
      'Missing required environment variables:\n' +
        `NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL: ${url ? '✓' : '✗'}\n` +
        `SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? '✓' : '✗'}\n` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY: ${anonKey ? '✓' : '✗'}`
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  };
}

/**
 * Create a Supabase client with admin privileges (bypasses RLS)
 * Uses service role key to access data without RLS restrictions
 *
 * @returns Admin Supabase client
 * @example
 * ```typescript
 * const adminClient = createAdminClient();
 * const { data } = await adminClient.from('profiles').select('*');
 * ```
 */
export function createAdminClient(): SupabaseClient<Database> {
  const env = validateEnv();

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client impersonating a specific user
 * Sets the auth context to test RLS policies from a user's perspective
 *
 * Uses admin.generateLink() to create a magic link with OTP token, then
 * verifies it via verifyOtp() to obtain a valid JWT session. This authenticated
 * session will be recognized by RLS policies using auth.uid() and auth.jwt()
 *
 * Best practice: OTP verification provides proper authentication for testing
 * Reference: https://supabase.com/docs/reference/javascript/auth-admin-generatelink
 *
 * @param userId - The user ID to impersonate (UUID)
 * @returns User-scoped Supabase client with valid JWT session
 * @example
 * ```typescript
 * const userClient = await createUserClient('user-uuid-here');
 * const { data } = await userClient.from('profiles').select('*');
 * // Only returns data accessible to this user via RLS
 * ```
 */
export async function createUserClient(userId: string): Promise<SupabaseClient<Database>> {
  const env = validateEnv();

  // Create admin client to generate access token
  const adminClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get the user to verify they exist and get their email
  const {
    data: { user },
    error: getUserError,
  } = await adminClient.auth.admin.getUserById(userId);

  if (getUserError || !user) {
    throw new Error(`Failed to get user ${userId}: ${getUserError?.message || 'User not found'}`);
  }

  // Validate that user has an email (required for magic link generation)
  if (!user.email) {
    throw new Error(
      `User ${userId} has no email address. Magic link authentication requires email identity. ` +
        'OAuth/phone-only accounts cannot be used with createUserClient.'
    );
  }

  // Generate a magic link (contains OTP + token hash)
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
  });

  if (linkError || !linkData) {
    throw new Error(`Failed to generate auth link for user ${userId}: ${linkError?.message}`);
  }

  // Extract OTP or token hash from properties
  const props = linkData.properties as {
    email_otp?: string;
    hashed_token?: string;
    action_link?: string;
  };
  const tokenHash =
    props?.hashed_token ??
    (props?.action_link
      ? (new URL(props.action_link).searchParams.get('token') ?? undefined)
      : undefined);
  const emailOtp = props?.email_otp;

  // Create a new client with the anon key
  const userClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Verify OTP (prefer token_hash; fallback to raw email OTP)
  if (!tokenHash && !emailOtp) {
    throw new Error(`No OTP token available for user ${userId}`);
  }

  // Type assertion: at this point, either tokenHash or emailOtp must be defined
  const verifyResult = tokenHash
    ? await userClient.auth.verifyOtp({ type: 'email', token_hash: tokenHash })
    : await userClient.auth.verifyOtp({
        type: 'email',
        email: user.email,
        token: emailOtp as string,
      });

  const { error: verifyError } = verifyResult;

  if (verifyError) {
    throw new Error(`Failed to verify OTP for user ${userId}: ${verifyError.message}`);
  }

  return userClient;
}

/**
 * Create an anonymous Supabase client (unauthenticated)
 * Used to test that anonymous users cannot access protected data
 *
 * @returns Anonymous Supabase client
 * @example
 * ```typescript
 * const anonClient = createAnonymousClient();
 * const { data } = await anonClient.from('profiles').select('*');
 * // Should return empty array or error due to RLS
 * ```
 */
export function createAnonymousClient(): SupabaseClient<Database> {
  const env = validateEnv();

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Test user data structure
 */
export interface TestUser {
  id: string;
  email: string;
  password?: string;
}

/**
 * Seed test data for RLS validation
 * Creates test users and returns their credentials
 *
 * @param adminClient - Admin client with RLS bypass
 * @returns Test user credentials
 * @example
 * ```typescript
 * const adminClient = createAdminClient();
 * const { user1, user2 } = await seedRLSTestData(adminClient);
 *
 * // Use in tests
 * const user1Client = await createUserClient(user1.id);
 * ```
 */
export async function seedRLSTestData(
  adminClient: SupabaseClient<Database>
): Promise<{ user1: TestUser; user2: TestUser }> {
  const runId = String(Date.now());

  // Create test user 1
  const { data: user1Data, error: user1Error } = await adminClient.auth.admin.createUser({
    email: `rls-test-user1-${runId}@example.com`,
    password: 'test-password-123',
    email_confirm: true, // Auto-confirm for testing
    user_metadata: {
      test: true,
      suite: 'rls',
      runId,
      testUser: 'user1',
    },
  });

  if (user1Error || !user1Data.user) {
    throw new Error(`Failed to create test user 1: ${user1Error?.message}`);
  }

  // Create test user 2
  const { data: user2Data, error: user2Error } = await adminClient.auth.admin.createUser({
    email: `rls-test-user2-${runId}@example.com`,
    password: 'test-password-123',
    email_confirm: true, // Auto-confirm for testing
    user_metadata: {
      test: true,
      suite: 'rls',
      runId,
      testUser: 'user2',
    },
  });

  if (user2Error || !user2Data.user) {
    throw new Error(`Failed to create test user 2: ${user2Error?.message}`);
  }

  // Email is guaranteed to be set since we provided it in createUser
  const user1Email = user1Data.user.email || `rls-test-user1-${runId}@example.com`;
  const user2Email = user2Data.user.email || `rls-test-user2-${runId}@example.com`;

  return {
    user1: {
      id: user1Data.user.id,
      email: user1Email,
      password: 'test-password-123',
    },
    user2: {
      id: user2Data.user.id,
      email: user2Email,
      password: 'test-password-123',
    },
  };
}

/**
 * Clean up test user data
 * Deletes test users and their associated data
 *
 * @param adminClient - Admin client with RLS bypass
 * @param userId - User ID to delete
 * @example
 * ```typescript
 * await cleanupRLSTestData(adminClient, user1.id);
 * ```
 */
export async function cleanupRLSTestData(
  adminClient: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  // Delete user (this will cascade delete their data if FK constraints are set up)
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.warn(`Warning: Failed to delete test user ${userId}: ${error.message}`);
  }
}

/**
 * Create test data in a table (type-safe version)
 * Helper to insert data with a specific user_id for testing
 *
 * This version provides better type safety by constraining table names to actual
 * Database tables. Use the generic parameter to specify expected return type.
 *
 * @param adminClient - Admin client with RLS bypass
 * @param userId - User ID to associate with the data
 * @param table - Table name (type-checked against Database schema)
 * @param data - Data to insert (excluding auto-generated fields)
 * @returns Inserted data
 *
 * @example
 * ```typescript
 * const profile = await createTestData<RowOf<'profiles'>>(
 *   adminClient,
 *   userId,
 *   'profiles',
 *   { name: 'Test User', bio: 'Test bio' }
 * );
 * ```
 */
export async function createTestData<TRow = unknown>(
  adminClient: SupabaseClient<Database>,
  userId: string,
  table: TableName,
  data: Record<string, unknown>
): Promise<TRow> {
  const { data: inserted, error } = await adminClient
    .from(table)
    // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic table insert
    .insert({ ...data, user_id: userId } as any)
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to create test data in ${table}: ${error?.message}`);
  }

  return inserted as TRow;
}

/**
 * Create test data in a table (unsafe escape hatch)
 * Use this for newly-migrated tables that aren't in the Database type yet
 *
 * @param adminClient - Admin client with RLS bypass
 * @param userId - User ID to associate with the data
 * @param table - Table name (not type-checked)
 * @param data - Data to insert
 * @returns Inserted data (untyped)
 *
 * @deprecated Prefer the type-safe createTestData() for existing tables
 */
export async function createTestDataUnsafe<TRow = unknown>(
  adminClient: SupabaseClient<Database>,
  userId: string,
  table: string,
  data: Record<string, unknown>
): Promise<TRow> {
  // Intentional any cast for flexible test helper - see file header for rationale
  const { data: inserted, error } = await adminClient
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic table access for flexible testing
    .from(table as any)
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error || !inserted) {
    throw new Error(`Failed to create test data in ${table}: ${error?.message}`);
  }

  return inserted as TRow;
}

/**
 * Clean up test data from a table (type-safe version)
 * Deletes all rows for a specific user
 *
 * @param adminClient - Admin client with RLS bypass
 * @param userId - User ID to filter by
 * @param table - Table name (type-checked against Database schema)
 * @param ownerColumn - Column name for the owner ID (defaults to 'user_id')
 *
 * @example
 * ```typescript
 * await cleanupTestData(adminClient, userId, 'profiles');
 * ```
 */
export async function cleanupTestData(
  adminClient: SupabaseClient<Database>,
  userId: string,
  table: TableName,
  ownerColumn: string = 'user_id'
): Promise<void> {
  // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic table delete
  const { error } = (await adminClient.from(table).delete().eq(ownerColumn, userId)) as any;

  if (error) {
    console.warn(`Warning: Failed to cleanup test data from ${table}: ${error.message}`);
  }
}

/**
 * Clean up test data from a table (unsafe escape hatch)
 * Use this for newly-migrated tables that aren't in the Database type yet
 *
 * @param adminClient - Admin client with RLS bypass
 * @param userId - User ID to filter by
 * @param table - Table name (not type-checked)
 * @param ownerColumn - Column name for the owner ID (defaults to 'user_id')
 *
 * @deprecated Prefer the type-safe cleanupTestData() for existing tables
 */
export async function cleanupTestDataUnsafe(
  adminClient: SupabaseClient<Database>,
  userId: string,
  table: string,
  ownerColumn: string = 'user_id'
): Promise<void> {
  // Intentional any cast for flexible test helper - see file header for rationale
  const { error } = await adminClient
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic table access for flexible testing
    .from(table as any)
    .delete()
    .eq(ownerColumn, userId);

  if (error) {
    console.warn(`Warning: Failed to cleanup test data from ${table}: ${error.message}`);
  }
}
