/**
 * Auth Server Actions
 *
 * All authentication mutations happen through these Server Actions.
 * They validate input, interact with Supabase, and handle redirects.
 *
 * Pattern:
 * 1. Parse and validate form data with Zod
 * 2. Call Supabase auth API
 * 3. Handle errors or redirect on success
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from './validation';

/**
 * Error response shape for forms
 */
type FormState = {
  error?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  fields?: {
    email?: string;
    password?: string;
  };
  success?: string;
};

/**
 * Sign up a new user
 */
export async function signUp(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  const validatedFields = signUpSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      fields: { email }, // Preserve email on validation error
    };
  }

  // Create Supabase client
  const supabase = await createClient();

  // Attempt sign up
  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    return {
      error: {
        form: [error.message],
      },
      fields: { email }, // Preserve email on server error
    };
  }

  // Success - revalidate and redirect
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Sign in an existing user
 */
export async function signIn(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  const validatedFields = signInSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      fields: { email }, // Preserve email on validation error
    };
  }

  // Get redirect path (default to /)
  const redirectTo = (formData.get('redirectTo') as string) || '/';

  // Validate redirectTo is an internal path (prevent open redirect)
  const isInternal = redirectTo.startsWith('/');
  const finalRedirect = isInternal ? redirectTo : '/';

  // Create Supabase client
  const supabase = await createClient();

  // Attempt sign in
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    return {
      error: {
        form: [error.message],
      },
      fields: { email }, // Preserve email on server error
    };
  }

  // Success - revalidate and redirect
  revalidatePath('/', 'layout');
  redirect(finalRedirect);
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Request a password reset email
 */
export async function resetPassword(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const email = formData.get('email') as string;

  // Validate input
  const validatedFields = resetPasswordSchema.safeParse({
    email,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      fields: { email }, // Preserve email on validation error
    };
  }

  // Create Supabase client
  const supabase = await createClient();

  // Request password reset
  // Use application URL (not Supabase API URL) for callback
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(validatedFields.data.email, {
    redirectTo: `${appUrl}/auth/callback?redirect_to=/update-password`,
  });

  if (error) {
    return {
      error: {
        form: [error.message],
      },
      fields: { email }, // Preserve email on server error
    };
  }

  // Success message (no redirect - show success state)
  return {
    success: 'Check your email for a password reset link. It may take a few minutes to arrive.',
  };
}

/**
 * Update user password (after reset email link)
 */
export async function updatePassword(
  _prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  // Validate input
  const validatedFields = updatePasswordSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedFields.data;

  // Create Supabase client
  const supabase = await createClient();

  // Update password
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error: {
        form: [error.message],
      },
    };
  }

  // Success - revalidate and redirect
  revalidatePath('/', 'layout');
  redirect('/');
}
