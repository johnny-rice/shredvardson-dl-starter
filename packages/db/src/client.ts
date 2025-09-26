/**
 * @fileoverview Database client adapter following DLStarter adapter patterns
 * 
 * Provides a clean, typed interface for Supabase database operations while
 * maintaining replaceable vendor boundaries. Includes health checks, auth
 * management, and safe SQL execution capabilities.
 * 
 * @example
 * ```typescript
 * const client = createDatabaseClient({
 *   url: process.env.SUPABASE_URL,
 *   anonKey: process.env.SUPABASE_ANON_KEY
 * });
 * 
 * const { data, error } = await client.raw.from('users').select('*');
 * const health = await client.healthCheck();
 * ```
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './types';

/**
 * Supabase client configuration
 * Following the adapter pattern for replaceable vendor boundaries
 */
export interface DatabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Database client adapter
 * Provides a clean interface for database operations with Supabase
 */
export class DatabaseClient {
  private client: SupabaseClient<Database>;

  constructor(config: DatabaseConfig) {
    this.client = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false, // Server-side usage doesn't need session persistence
      },
    });
  }

  /**
   * Get the raw Supabase client for advanced operations
   * Use sparingly - prefer typed methods on this class
   */
  get raw(): SupabaseClient<Database> {
    return this.client;
  }

  /**
   * Get the auth instance for user management
   */
  get auth() {
    return this.client.auth;
  }

  /**
   * Execute a SQL query with parameters
   * Requires service role credentials - not available with anon/authenticated keys
   * @param sql - SQL query string
   * @param params - Query parameters as JSON array
   * @throws Error if called without service role privileges
   */
  async query(sql: string, params: Json[] = []) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('DatabaseClient.query is dev-only. Do not use in production.');
    }
    // This function requires service role - will fail with anon/authenticated keys
    return (this.client as any).rpc('query', { sql, params });
  }

  /**
   * Check database connection and health
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const { error } = await this.client.from('_health_check').select('id', { head: true, count: 'exact' }).limit(1);
      return { healthy: !error };
    } catch (err) {
      return { 
        healthy: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
}

/**
 * Create a database client with environment-based configuration
 */
export function createDatabaseClient(config: DatabaseConfig): DatabaseClient {
  return new DatabaseClient(config);
}