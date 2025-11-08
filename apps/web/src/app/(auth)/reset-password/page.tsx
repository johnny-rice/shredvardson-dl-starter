/**
 * Reset Password Page
 *
 * Allows users to request a password reset email.
 * Shows success message after submission (no redirect).
 * Implements progressive validation (onBlur → onChange after error).
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
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useFormFieldValidation } from '@/hooks/use-form-field-validation';
import { resetPassword } from '@/lib/auth/actions';
import { emailSchema } from '@/lib/auth/validation';

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
  const [emailValue, setEmailValue] = useState(state?.fields?.email ?? '');

  // Progressive validation hook
  const emailValidation = useFormFieldValidation('email', emailSchema);

  // Merge client-side and server-side errors (server errors take precedence)
  const emailError = state?.error?.email?.[0] ?? emailValidation.error;

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
          <output className="block rounded-md bg-success/10 p-4" aria-live="polite">
            <p className="text-fluid-sm text-success">{state.success}</p>
          </output>
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
                value={emailValue}
                onChange={(e) => {
                  setEmailValue(e.target.value);
                  emailValidation.handleChange(e.target.value);
                }}
                onBlur={() => emailValidation.handleBlur(emailValue)}
                {...emailValidation.inputProps}
              />
              {emailError && (
                <p
                  id={emailValidation.errorId}
                  className="text-fluid-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {emailError}
                </p>
              )}
            </div>

            {state?.error?.form && (
              <div className="rounded-md bg-destructive/10 p-4" role="alert" aria-live="polite">
                <p className="text-fluid-sm text-destructive">{state.error.form[0]}</p>
              </div>
            )}

            <SubmitButton />
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="text-fluid-sm font-medium text-primary hover:text-primary/80"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
