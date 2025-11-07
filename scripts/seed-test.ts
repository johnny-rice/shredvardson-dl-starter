import { createClient } from '@supabase/supabase-js';
import type { SeedConfig, SeedResult } from './types/seed-data';
import { confirm } from './utils/confirm';

/**
 * Seeds the database with deterministic test data.
 *
 * Creates test users with known IDs and emails for use in E2E and integration tests.
 * Data is identical on every run, ensuring test reliability.
 *
 * @param config - Seed configuration with optional userCount (defaults to 3)
 * @returns Seed result with created counts, errors, and duration
 *
 * @example
 * ```bash
 * # CLI usage
 * pnpm db:seed:test
 *
 * # CI/CD usage (skip confirmation)
 * pnpm db:seed:test --force
 * FORCE=true pnpm db:seed:test
 *
 * # Programmatic usage
 * await seedTest({ userCount: 5 });
 * ```
 */
export async function seedTest(config: SeedConfig = {}): Promise<SeedResult> {
  const startTime = Date.now();
  const result: SeedResult = {
    success: false,
    created: { users: 0 },
    errors: [],
    duration: 0,
  };

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userCount = 3 } = config;

    // Generate deterministic test users
    const testUsers = Array.from({ length: userCount }, (_, i) => ({
      id: i === userCount - 1 ? 'test-user-admin' : `test-user-${i + 1}`,
      email: i === userCount - 1 ? 'admin@example.com' : `test${i + 1}@example.com`,
      name: i === userCount - 1 ? 'Test Admin' : `Test User ${i + 1}`,
      bio: i === userCount - 1 ? 'Admin user for testing' : `Test bio ${i + 1}`,
    }));

    // Confirm before deleting existing test users
    await confirm(
      `This will delete existing test users (${testUsers.map((u) => u.id).join(', ')}) and recreate them with fresh data.`
    );

    console.log('🧪 Seeding test data...\n');

    // Delete existing test users for idempotent seeding
    await supabase
      .from('users')
      .delete()
      .in(
        'id',
        testUsers.map((u) => u.id)
      );

    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(testUsers)
      .select();

    if (userError) {
      result.errors.push(`Users: ${userError.message}`);
    } else {
      result.created.users = insertedUsers?.length || 0;
      console.log(`✓ Created ${result.created.users} test users`);
    }

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log(`\n✅ Test seeding complete in ${result.duration}ms`);

    return result;
  } catch (error: any) {
    result.errors.push(error.message);
    result.duration = Date.now() - startTime;

    console.error(`\n❌ Test seeding failed: ${error.message}`);

    return result;
  }
}

// CLI entry point
if (require.main === module) {
  seedTest().catch(console.error);
}
