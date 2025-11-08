/**
 * Sign Up Page
 *
 * Allows new users to create an account with email and password.
 * Uses the signUp Server Action for form submission.
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
import { signUp } from '@/lib/auth/actions';
import { emailSchema, passwordSchema } from '@/lib/auth/validation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating account...' : 'Create account'}
    </Button>
  );
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUp, null);
  const [emailValue, setEmailValue] = useState(state?.fields?.email ?? '');
  const [passwordValue, setPasswordValue] = useState(state?.fields?.password ?? '');

  // Progressive validation hooks
  const emailValidation = useFormFieldValidation('email', emailSchema);
  const passwordValidation = useFormFieldValidation('password', passwordSchema);

  // Merge client-side and server-side errors (server errors take precedence)
  const emailError = state?.error?.email?.[0] ?? emailValidation.error;
  const passwordError = state?.error?.password?.[0] ?? passwordValidation.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your email and password to get started</CardDescription>
      </CardHeader>
      <CardContent>
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                passwordValidation.handleChange(e.target.value);
              }}
              onBlur={() => passwordValidation.handleBlur(passwordValue)}
              {...passwordValidation.inputProps}
            />
            <p className="text-fluid-xs text-muted-foreground">
              At least 8 characters with uppercase, lowercase, number, and special character
            </p>
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
      <CardFooter className="flex justify-center">
        <p className="text-fluid-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
