import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if env vars are available
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export async function resetTestDatabase() {
  if (!supabase) {
    console.warn('Supabase client not initialized - skipping database reset');
    return;
  }

  // Delete test users created in the last 24 hours
  // This prevents database bloat from test runs in CI/CD
  try {
    // Note: This requires service role key with admin permissions
    // Fetch all users with pagination (default is 50 users per page)
    const allUsers = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const {
        data: { users },
        error,
      } = await supabase.auth.admin.listUsers({
        page,
        perPage: 50,
      });

      if (error) {
        console.warn('Could not list users for cleanup:', error.message);
        return;
      }

      if (!users || users.length === 0) {
        break;
      }

      allUsers.push(...users);
      hasMore = users.length === 50;
      page++;
    }

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const testUsers = allUsers.filter((user) => {
      const email = user.email?.toLowerCase();
      const isTestEmail = email?.startsWith('test-') || email?.endsWith('@example.com');
      const createdAt = new Date(user.created_at).getTime();
      return isTestEmail && createdAt > oneDayAgo;
    });

    for (const user of testUsers) {
      try {
        await supabase.auth.admin.deleteUser(user.id);
      } catch (error) {
        console.warn(`Failed to delete user ${user.id}:`, error);
      }
    }

    if (testUsers.length > 0) {
      console.log(`Cleaned up ${testUsers.length} test user(s)`);
    }
  } catch (error) {
    console.warn('Error during database cleanup:', error);
  }

  // Truncate test data tables when they exist
  // Example:
  // await supabase.from('profiles').delete().neq('id', '');
  // await supabase.from('organizations').delete().neq('id', '');
}

export async function seedTestData() {
  if (!supabase) {
    console.warn('Supabase client not initialized - skipping seed data');
    return;
  }

  // Insert minimal test data
  // TODO: Add seed logic when tables are created
}

export { supabase };
