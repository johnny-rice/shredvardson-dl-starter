#!/usr/bin/env tsx

/**
 * Shows DL Starter coding standards and conventions
 *
 * Usage: tsx show-standards.ts [category]
 * Example: tsx show-standards.ts typescript
 */

const category = process.argv[2] || 'all';

const standards = {
  typescript: {
    title: 'TypeScript Standards',
    rules: [
      'No `any` types - use `unknown` or specific types',
      'Explicit return types on exported functions',
      'Strict null checks enabled',
      'Use type imports: `import type { }`',
      'Prefer interfaces for objects, types for unions',
    ],
    examples: [
      {
        good: 'function getUser(id: string): Promise<User | null> { }',
        bad: 'function getUser(id: any): any { }',
      },
    ],
  },
  react: {
    title: 'React Component Standards',
    rules: [
      'Function components only (no class components)',
      'PascalCase for component names',
      'Props interface named `ComponentNameProps`',
      'Export component as named export',
      'Use Server Components by default in Next.js',
    ],
    examples: [
      {
        good: 'export function UserProfile({ userId }: UserProfileProps) { }',
        bad: 'export default (props: any) => { }',
      },
    ],
  },
  naming: {
    title: 'Naming Conventions',
    rules: [
      'Files: kebab-case (user-profile.tsx)',
      'Components: PascalCase (UserProfile)',
      'Functions: camelCase (getUserProfile)',
      'Constants: UPPER_SNAKE_CASE (MAX_RETRIES)',
      'Types/Interfaces: PascalCase (UserProfile)',
    ],
  },
  imports: {
    title: 'Import Organization',
    rules: [
      '1. React imports first',
      '2. External library imports',
      '3. Internal imports (@/...)',
      '4. Relative imports (./...)',
      '5. Type imports last',
    ],
    example: `
import { useState } from 'react';
import { Button } from '@/components/ui';
import { getUserProfile } from '@/lib/api';
import { formatDate } from './utils';
import type { User } from '@/types';
    `.trim(),
  },
  error: {
    title: 'Error Handling Standards',
    rules: [
      'Always handle errors explicitly',
      'Log errors with context',
      'Return structured error objects',
      'Never expose internal errors to users',
      'Use try-catch for async operations',
    ],
    pattern: `
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
    `.trim(),
  },
};

const output: Record<string, unknown> = {
  success: true,
  category,
};

if (category === 'all') {
  output.standards = standards;
} else if (category in standards) {
  output.standard = standards[category as keyof typeof standards];
} else {
  console.error(`Error: Unknown category "${category}"`);
  console.error('Available categories: typescript, react, naming, imports, error, all');
  process.exit(1);
}

output.nextSteps = [
  'Review standards before implementation',
  'Use /code validate <file> to check compliance',
  'Reference patterns: /code patterns <category>',
];

console.log(JSON.stringify(output, null, 2));
