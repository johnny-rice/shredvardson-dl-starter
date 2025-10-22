#!/usr/bin/env tsx
/**
 * Skill Script: Generate Types
 *
 * Generates TypeScript types from Supabase schema.
 * Returns structured output for the Skill layer.
 */

import { execSync } from 'child_process';

try {
  // Call existing type generation
  const output = execSync(
    'pnpm db:types',
    { encoding: 'utf-8', cwd: process.cwd() }
  );

  console.log(JSON.stringify({
    success: true,
    message: 'TypeScript types generated successfully',
    output,
    file: 'packages/db/src/types/database.types.ts',
    nextSteps: [
      'Review generated types',
      'Commit types with migration'
    ]
  }));
} catch (error) {
  console.error(JSON.stringify({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    hint: 'Ensure Supabase is running and migrations are applied'
  }));
  process.exit(1);
}
