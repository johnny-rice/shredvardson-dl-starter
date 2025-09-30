/**
 * @fileoverview Auto-generated Supabase database types
 *
 * This file contains TypeScript type definitions generated from the Supabase schema.
 * These types provide compile-time safety for database operations and are automatically
 * updated when the schema changes.
 *
 * @warning Do not manually edit this file - it will be overwritten
 * @regenerate Run `pnpm db:types` to regenerate after schema changes
 */

/**
 * JSON type for Supabase database fields that can contain arbitrary JSON data
 * Supports all JSON-serializable types including nested objects and arrays
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Main database schema interface generated from Supabase
 * Contains all tables, views, functions, enums, and composite types
 *
 * @example
 * ```typescript
 * const { data } = await client.from<Database['public']['Tables']['users']['Row']>('users').select('*');
 * ```
 */
export interface Database {
  public: {
    Tables: {
      // Tables will be auto-generated here
      _health_check: {
        Row: { id: number };
        Insert: { id?: number };
        Update: { id?: number };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
      // Note: Development-only query function would be conditionally typed here
      // but TypeScript doesn't support conditional interface merging at the type level
      // The runtime check in client.ts provides the actual protection
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
