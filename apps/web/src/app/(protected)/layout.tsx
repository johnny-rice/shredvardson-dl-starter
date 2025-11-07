/**
 * Protected Routes Layout
 *
 * This layout wraps all routes that require authentication.
 * Redirects unauthenticated users to the sign-in page.
 *
 * SECURITY NOTE: Uses getUser() instead of getSession() for better security.
 * getUser() validates the token with Supabase servers on every request.
 * getSession() only checks local storage (can be stale or forged).
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  // Validate user session (secure - validates with Supabase servers)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated - redirect to login
    redirect('/login');
  }

  // Authenticated - render protected content
  return <>{children}</>;
}
