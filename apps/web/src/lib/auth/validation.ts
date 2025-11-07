/**
 * Auth Validation Schemas
 *
 * Client-side validation using Zod (mirrors Supabase server-side rules).
 *
 * IMPORTANT: Keep these rules in sync with Supabase Dashboard password settings.
 * If they drift, Supabase will still enforce rules (security is fine), but UX will be worse
 * (users will see validation errors after submitting instead of immediately).
 *
 * Default Supabase Rules (configured in Dashboard > Authentication > Policies):
 * - Minimum 8 characters
 * - Require uppercase, lowercase, digits, symbols
 */

import { z } from 'zod';

/**
 * Password validation schema
 * Mirrors default Supabase password requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Must contain at least one special character');

/**
 * Email validation schema
 * Standard email format check
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Sign up form validation
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Sign in form validation
 * Note: We don't validate password rules on sign-in (only on sign-up)
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password reset request validation
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Update password validation
 */
export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

/**
 * Type exports for use in components
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
