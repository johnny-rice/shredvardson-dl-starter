/**
 * Auth Adapter Interface
 * 
 * Defines the contract for swappable auth providers.
 * Enables switching between Supabase, NextAuth, Clerk, etc.
 * without changing application code.
 * 
 * @see specs/feature-001-auth-v1-supabase.md
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Session {
  user: User;
  access_token?: string;
  expires_at?: number;
}

/**
 * Core auth adapter interface - all providers must implement this
 */
export interface AuthAdapter {
  /**
   * Get current session (server-side)
   * @returns Session if authenticated, null otherwise
   */
  getSession(): Promise<Session | null>;

  /**
   * Sign in via magic link or OAuth
   * @param params - Email for magic link, or provider for OAuth
   */
  signIn(params: { email: string } | { provider: AuthProvider }): Promise<void>;

  /**
   * Sign out current user
   */
  signOut(): Promise<void>;

  /**
   * Require authenticated user or throw
   * @throws Error if not authenticated
   */
  requireUser(): Promise<User>;

  /**
   * Optional: Listen to auth state changes (client-side)
   */
  onAuthStateChange?(callback: (session: Session | null) => void): () => void;
}

/**
 * Auth provider types
 */
export const AUTH_PROVIDER_VALUES = ['supabase', 'nextauth', 'clerk', 'custom'] as const;

export type AuthProvider = (typeof AUTH_PROVIDER_VALUES)[number];

/**
 * Auth configuration
 */
export interface AuthConfig {
  provider: AuthProvider;
  enabled: boolean;
}