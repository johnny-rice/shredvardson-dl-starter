/**
 * Sign In Page
 *
 * Allows existing users to sign in with email and password.
 * Supports ?redirectTo parameter for post-login navigation.
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
import { useSearchParams } from 'next/navigation';
import { Suspense, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';
import { useFormFieldValidation } from '@/hooks/use-form-field-validation';
import { signIn } from '@/lib/auth/actions';
import { emailSchema } from '@/lib/auth/validation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
}

// Simple password presence validation for login (not full password rules)
const loginPasswordSchema = z.string().min(1, 'Password is required');

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '';

  const [state, formAction] = useActionState(signIn, null);
  const [emailValue, setEmailValue] = useState(state?.fields?.email ?? '');
  const [passwordValue, setPasswordValue] = useState('');

  // Progressive validation hooks
  const emailValidation = useFormFieldValidation('email', emailSchema);
  const passwordValidation = useFormFieldValidation('password', loginPasswordSchema);

  // Merge client-side and server-side errors (server errors take precedence)
  const emailError = state?.error?.email?.[0] ?? emailValidation.error;
  const passwordError = state?.error?.password?.[0] ?? passwordValidation.error;
  const emailHasError = Boolean(emailError);
  const passwordHasError = Boolean(passwordError);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

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
              aria-invalid={emailHasError}
              aria-describedby={emailHasError ? emailValidation.errorId : undefined}
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                passwordValidation.handleChange(e.target.value);
              }}
              onBlur={() => passwordValidation.handleBlur(passwordValue)}
              aria-invalid={passwordHasError}
              aria-describedby={passwordHasError ? passwordValidation.errorId : undefined}
            />
            {passwordError && (
              <p
                id={passwordValidation.errorId}
                className="text-fluid-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {passwordError}
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
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link
          href="/reset-password"
          className="text-fluid-sm font-medium text-primary hover:text-primary/80"
        >
          Forgot your password?
        </Link>
        <p className="text-fluid-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
