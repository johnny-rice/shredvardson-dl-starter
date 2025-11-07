/**
 * Next.js Middleware
 *
 * Runs on EVERY request to refresh Supabase auth sessions.
 * This ensures tokens are validated and refreshed automatically.
 *
 * Matcher: Runs on all routes except static files (_next/static, images, etc.)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
