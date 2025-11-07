/**
 * Update Password Page
 *
 * Allows users to set a new password after clicking the reset link from email.
 * Accessed via email link only (no manual navigation).
 */

'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@ui/components';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePassword } from '@/lib/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Updating...' : 'Update password'}
    </Button>
  );
}

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            {state?.error?.password && (
              <p className="text-sm text-destructive">{state.error.password[0]}</p>
            )}
          </div>

          {state?.error?.form && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{state.error.form[0]}</p>
            </div>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
