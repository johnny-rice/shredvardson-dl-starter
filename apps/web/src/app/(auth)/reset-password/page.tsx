/**
 * Reset Password Page
 *
 * Allows users to request a password reset email.
 * Shows success message after submission (no redirect).
 */

'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@ui/components';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { resetPassword } from '@/lib/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending...' : 'Send reset link'}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPassword, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="rounded-md bg-success/10 p-4">
            <p className="text-sm text-success">{state.success}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                defaultValue={state?.fields?.email}
              />
              {state?.error?.email && (
                <p className="text-sm text-destructive">{state.error.email[0]}</p>
              )}
            </div>

            {state?.error?.form && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{state.error.form[0]}</p>
              </div>
            )}

            <SubmitButton />
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
