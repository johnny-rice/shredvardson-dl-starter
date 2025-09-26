/**
 * @fileoverview Database package main exports
 * 
 * Provides typed Supabase client and database types following the adapter pattern
 * for replaceable vendor boundaries. Supports AI-assisted database operations
 * with comprehensive type safety and security-first defaults.
 * 
 * @example
 * ```typescript
 * import { createDatabaseClient } from '@shared/db';
 * 
 * const client = createDatabaseClient({
 *   url: process.env.SUPABASE_URL,
 *   anonKey: process.env.SUPABASE_ANON_KEY
 * });
 * ```
 */

// Database package exports
export { DatabaseClient, createDatabaseClient, type DatabaseConfig } from './src/client';
export type { Database, Json } from './src/types';