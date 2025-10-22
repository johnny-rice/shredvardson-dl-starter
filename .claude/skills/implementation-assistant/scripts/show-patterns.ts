#!/usr/bin/env tsx

/**
 * Shows implementation patterns for specific categories
 *
 * Usage: tsx show-patterns.ts <category>
 * Example: tsx show-patterns.ts component
 */

const category = process.argv[2];

if (!category) {
  console.error('Error: Category required');
  console.error('Usage: tsx show-patterns.ts <category>');
  console.error('Categories: component, api, database, error');
  process.exit(1);
}

const patterns: Record<string, unknown> = {
  component: {
    title: 'React Component Pattern',
    description: 'Standard structure for React components in DL Starter',
    template: `
import { useState } from 'react';
import { Button } from '@/components/ui';
import type { ComponentProps } from './types';

interface UserProfileProps {
  userId: string;
  onUpdate?: () => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setLoading(true);
      setError(null);
      // ... operation ...
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      {/* Component content */}
      <Button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
}
    `.trim(),
  },
  api: {
    title: 'API Route Pattern',
    description: 'Next.js API route with proper error handling',
    template: `
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Perform operation
    const { data, error } = await supabase
      .from('table')
      .insert({ ...validated, user_id: user.id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
    `.trim(),
  },
  database: {
    title: 'Database Access Pattern',
    description: 'Supabase queries with RLS and type safety',
    template: `
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type UserProfile = Tables['user_profiles']['Row'];

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
    `.trim(),
  },
  error: {
    title: 'Error Handling Pattern',
    description: 'Consistent error handling across the application',
    patterns: {
      api: `
try {
  const result = await operation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { success: false, error: 'Operation failed' },
    { status: 500 }
  );
}
      `.trim(),
      component: `
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  try {
    setError(null);
    await operation();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};

if (error) {
  return <ErrorMessage message={error} />;
}
      `.trim(),
      serverAction: `
'use server';

export async function serverAction(data: FormData) {
  try {
    // ... operation ...
    revalidatePath('/path');
    return { success: true };
  } catch (error) {
    console.error('Server action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
      `.trim(),
    },
  },
};

if (!(category in patterns)) {
  console.error(`Error: Unknown category "${category}"`);
  console.error('Available categories: component, api, database, error');
  process.exit(1);
}

console.log(JSON.stringify({
  success: true,
  category,
  pattern: patterns[category],
  nextSteps: [
    'Copy pattern template',
    'Adapt to your specific use case',
    'Validate with: /code validate <file>',
  ],
}, null, 2));
