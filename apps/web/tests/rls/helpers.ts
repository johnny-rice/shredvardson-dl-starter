import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create a Supabase client with a test user session for RLS testing
 *
 * NOTE: This is a placeholder implementation. In a real scenario, you would:
 * 1. Create a test user via auth.admin.createUser()
 * 2. Sign in with that user's credentials
 * 3. Use the authenticated client for RLS testing
 *
 * @param _userId - The user ID to impersonate (prefixed with _ as currently unused)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createTestUserClient(_userId: string): Promise<SupabaseClient> {
  // TODO: Implement proper test user creation when auth is set up
  // For now, create a client without authentication
  // This is a template for future implementation:

  // Step 1: Create test user
  // const adminClient = createAdminClient();
  // const { data: user, error: createError } = await adminClient.auth.admin.createUser({
  //   email: `test-${_userId}@example.com`,
  //   password: 'TestPassword123!',
  //   email_confirm: true,
  // });

  // Step 2: Sign in with test user credentials
  const testClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  // const { error: signInError } = await testClient.auth.signInWithPassword({
  //   email: `test-${_userId}@example.com`,
  //   password: 'TestPassword123!',
  // });

  return testClient;
}

/**
 * Create an admin Supabase client (bypasses RLS)
 */
export function createAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Create test data owned by a specific user
 */
export async function createTestData<T extends Record<string, unknown>>(
  adminClient: SupabaseClient,
  userId: string,
  tableName: string,
  data: T
): Promise<T & { user_id: string }> {
  const { data: result, error } = await adminClient
    .from(tableName)
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return result as T & { user_id: string };
}

/**
 * Clean up test data for a specific user
 */
export async function cleanupTestData(
  adminClient: SupabaseClient,
  userId: string,
  tableName: string
) {
  const { error } = await adminClient.from(tableName).delete().eq('user_id', userId);

  if (error) {
    throw error;
  }
}
