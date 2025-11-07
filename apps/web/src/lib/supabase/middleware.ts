/**
 * Supabase Middleware Client
 *
 * For use in Next.js middleware (middleware.ts).
 * Automatically refreshes auth sessions by validating the token with Supabase servers.
 *
 * CRITICAL: This calls supabase.auth.getUser() to refresh the session.
 * Without this, sessions would become stale and users would be logged out.
 *
 * Why separate client? Middleware has a different cookie interface (request/response).
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // CRITICAL: This refreshes the auth session
  // DO NOT remove this or sessions will not be refreshed
  // The call to getUser() must happen for session refresh, even though we don't use the user
  await supabase.auth.getUser();

  return supabaseResponse;
}
