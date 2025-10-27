import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';
import type { SeedConfig, SeedResult } from './types/seed-data';

/**
 * Seeds the database with realistic development data using Faker.js.
 *
 * Generates fake users with realistic names, emails, bios, and avatars.
 * Uses service role key to bypass RLS. Ideal for local development and demos.
 *
 * @param config - Seed configuration (userCount, locale, deterministic)
 * @returns Seed result with created counts, errors, and duration
 *
 * @example
 * ```bash
 * # CLI usage
 * pnpm db:seed:dev
 * USER_COUNT=100 pnpm db:seed:dev
 * DETERMINISTIC=true pnpm db:seed:dev  # Reproducible data
 * ```
 *
 * @remarks
 * Locale support: Currently uses default 'en' locale. Faker v10 requires importing
 * locale-specific instances (e.g., `import { fakerDE } from '@faker-js/faker'`).
 * The locale parameter is reserved for future enhancement when locale switching
 * is needed.
 */
export async function seedDev(config: SeedConfig = {}): Promise<SeedResult> {
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

    const { userCount = 50, deterministic = false } = config;
    // Note: Locale handling is described in JSDoc above. The locale parameter is
    // not extracted here, and we use the default 'en' locale for now.

    // Set deterministic seed if requested for reproducible data
    if (deterministic) {
      faker.seed(12345);
    }

    faker.setDefaultRefDate(new Date());

    console.log(
      `🌱 Seeding development data (${userCount} users${deterministic ? ', deterministic mode' : ''})...\n`
    );

    // Generate users
    const users = [];
    for (let i = 0; i < userCount; i++) {
      users.push({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        bio: faker.lorem.paragraph(),
        avatar_url: faker.image.avatar(),
        created_at: faker.date.past({ years: 2 }).toISOString(),
      });
    }

    // Insert users
    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select();

    if (userError) {
      result.errors.push(`Users: ${userError.message}`);
    } else {
      result.created.users = insertedUsers?.length || 0;
      console.log(`✓ Created ${result.created.users} users`);
    }

    // TODO: Add more entities as schema grows
    // - Organizations
    // - Posts
    // - etc.

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log(`\n✅ Seeding complete in ${result.duration}ms`);

    return result;
  } catch (error: any) {
    result.errors.push(error.message);
    result.duration = Date.now() - startTime;

    console.error(`\n❌ Seeding failed: ${error.message}`);

    return result;
  }
}

// CLI entry point
if (require.main === module) {
  seedDev({
    userCount: parseInt(process.env.USER_COUNT || '50', 10),
    deterministic: process.env.DETERMINISTIC === 'true',
  }).catch(console.error);
}
