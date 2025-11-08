/**
 * Update Password Page
 *
 * Allows users to set a new password after clicking the reset link from email.
 * Accessed via email link only (no manual navigation).
 * Implements progressive validation (onBlur → onChange after error).
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
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useFormFieldValidation } from '@/hooks/use-form-field-validation';
import { updatePassword } from '@/lib/auth/actions';
import { passwordSchema } from '@/lib/auth/validation';

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
  const [passwordValue, setPasswordValue] = useState('');

  // Progressive validation hook
  const passwordValidation = useFormFieldValidation('password', passwordSchema);

  // Merge client-side and server-side errors (server errors take precedence)
  const passwordError = state?.error?.password?.[0] ?? passwordValidation.error;

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
    </Card>
  );
}
