/**
 * Progressive Form Field Validation Hook
 *
 * Implements best practice validation timing:
 * - Initial: Validates onBlur
 * - After first error: Validates onChange for immediate feedback
 * - Accessible: Returns ARIA attributes for screen readers
 *
 * @example
 * ```tsx
 * const email = useFormFieldValidation('email', emailSchema);
 *
 * <Input
 *   {...email.inputProps}
 *   value={emailValue}
 *   onChange={(e) => {
 *     setEmailValue(e.target.value);
 *     email.handleChange(e.target.value);
 *   }}
 *   onBlur={() => email.handleBlur(emailValue)}
 * />
 * {email.error && (
 *   <p id={email.errorId} className="text-fluid-sm text-destructive">
 *     {email.error}
 *   </p>
 * )}
 * ```
 */

import { useCallback, useState } from 'react';
import type { ZodSchema } from 'zod';

type FieldState = 'untouched' | 'touched' | 'errored';

export function useFormFieldValidation(fieldName: string, schema: ZodSchema) {
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FieldState>('untouched');

  const errorId = `${fieldName}-error`;

  const validate = useCallback(
    (value: string): string | null => {
      const result = schema.safeParse(value);

      if (!result.success) {
        const errorMessage = result.error.issues[0]?.message ?? 'Invalid value';
        setError(errorMessage);
        setState('errored');
        return errorMessage;
      }

      setError(null);
      // Reset to touched if validation succeeds after an error
      setState((prev) => (prev === 'errored' ? 'touched' : prev));
      return null;
    },
    [schema]
  );

  const handleBlur = useCallback(
    (value: string) => {
      // Only validate on blur if field hasn't been touched yet
      if (state === 'untouched') {
        setState('touched');
        validate(value);
      }
    },
    [state, validate]
  );

  const handleChange = useCallback(
    (value: string) => {
      // Progressive validation: only validate onChange if field has errored
      if (state === 'errored') {
        validate(value);
      }
    },
    [state, validate]
  );

  const reset = useCallback(() => {
    setError(null);
    setState('untouched');
  }, []);

  return {
    error,
    errorId,
    state,
    handleBlur,
    handleChange,
    reset,
    // ARIA attributes for accessibility
    inputProps: {
      'aria-invalid': !!error,
      'aria-describedby': error ? errorId : undefined,
    } as const,
  };
}
