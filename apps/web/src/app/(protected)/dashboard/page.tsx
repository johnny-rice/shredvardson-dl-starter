/**
 * Dashboard Page (Example Protected Page)
 *
 * This is an example of a protected page that requires authentication.
 * Demonstrates that auth is working and shows user information.
 * Uses design tokens and proper component patterns.
 */

import { Button, Card, CardContent, CardHeader, CardTitle } from '@ui/components';
import { redirect } from 'next/navigation';
import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-fluid-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome to your protected dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-fluid-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-fluid-sm text-foreground">{user.email}</dd>
              </div>
              <div>
                <dt className="text-fluid-sm font-medium text-muted-foreground">User ID</dt>
                <dd className="mt-1 font-mono text-fluid-sm text-foreground">{user.id}</dd>
              </div>
              <div>
                <dt className="text-fluid-sm font-medium text-muted-foreground">Last Sign In</dt>
                <dd className="mt-1 text-fluid-sm text-foreground">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
