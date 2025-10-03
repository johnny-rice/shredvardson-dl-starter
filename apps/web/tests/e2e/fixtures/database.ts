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

  // Truncate test data tables (except auth.users)
  // TODO: Add table truncation logic when tables are created
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
