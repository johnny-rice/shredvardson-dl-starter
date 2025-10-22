# Implementation Assistant Skill

Coding standards, error handling patterns, and DL Starter conventions.

## Core Workflow

```
standards → patterns → validate → implement
```

## Actions

### standards
Shows DL Starter coding standards and conventions.

**Script**: `scripts/show-standards.ts`
**Output**: Coding standards reference, TypeScript patterns, naming conventions

### patterns <category>
Shows implementation patterns for specific categories.

**Script**: `scripts/show-patterns.ts`
**Categories**:
- `component`: React component patterns
- `api`: API endpoint patterns
- `database`: Database access patterns
- `error`: Error handling patterns

**Output**: Pattern examples, best practices

### validate <file_path>
Validates file against coding standards.

**Script**: `scripts/validate-code.ts`
**Checks**:
- TypeScript types (no `any`)
- Error handling presence
- Naming conventions
- Component structure
- Import organization

**Output**: Validation report, violations, suggestions

### implement <feature>
Guides implementation with step-by-step checklist.

**Script**: `scripts/implementation-guide.ts`
**Output**: Implementation checklist, order of operations, quality gates

## Progressive Disclosure

**Level 1** (Metadata): skill.json (~20 tokens)
**Level 2** (This file): SKILL.md (~180 tokens)
**Level 3** (On-demand): Scripts executed, docs loaded as needed (~0 tokens)

## Coding Standards

### TypeScript

**Type Safety**:
- No `any` types (use `unknown` or specific types)
- Explicit return types on functions
- Strict null checks enabled
- Proper generics usage

**Example**:
```typescript
// ✓ Good
function getUser(id: string): Promise<User | null> {
  // ...
}

// ✗ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

**Structure**:
```typescript
// Component file structure
import { } from 'react';    // React imports first
import { } from '@/lib';    // Internal imports
import { } from './';       // Relative imports

interface ComponentProps {
  // Props interface
}

export function Component({ props }: ComponentProps) {
  // Implementation
}
```

**Naming**:
- Components: PascalCase
- Hooks: camelCase starting with `use`
- Props: `ComponentNameProps` interface
- Files: kebab-case for files, PascalCase for components

### Error Handling

**Pattern**:
```typescript
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
```

**Never**:
- Silent failures
- Uncaught promises
- Generic error messages
- Exposing internal errors to users

### Database Patterns

**RLS First**:
```typescript
// Always use RLS-protected queries
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', userId); // RLS enforces this

// Never bypass RLS unless explicitly admin operation
```

**Type Safety**:
```typescript
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type UserProfile = Tables['user_profiles']['Row'];
```

## Implementation Checklist

When implementing a feature:

1. **Spec Review**
   - [ ] Acceptance criteria clear
   - [ ] Technical constraints documented
   - [ ] Dependencies identified

2. **Database**
   - [ ] Schema designed
   - [ ] RLS policies defined
   - [ ] Migration created

3. **Tests (TDD)**
   - [ ] RLS tests scaffolded
   - [ ] Unit tests scaffolded
   - [ ] E2E tests scaffolded

4. **Implementation**
   - [ ] API endpoints created
   - [ ] UI components created
   - [ ] Error handling added
   - [ ] Loading states implemented

5. **Validation**
   - [ ] All tests passing
   - [ ] Coverage meets thresholds
   - [ ] No TypeScript errors
   - [ ] Linter passing

6. **Documentation**
   - [ ] README updated
   - [ ] API documented
   - [ ] Micro-lessons captured

## Error Handling Patterns

**API Endpoints**:
```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ... validation ...
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

**React Components**:
```typescript
function Component() {
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

  // ... component ...
}
```

## Integration Points

- **Commands**: Invoked via `/code` discovery command
- **Scripts**: TypeScript in `scripts/` directory
- **Docs**: `docs/patterns/` for detailed patterns

## Token Efficiency

**Old command** (`/dev:implement`):
- YAML frontmatter: ~30 tokens
- Full prompt: ~58 tokens
- **Total: 88 tokens** per invocation

**New Skill**:
- Metadata: 20 tokens
- SKILL.md: 180 tokens (progressive)
- Scripts: 0 tokens (executed, not loaded)
- **Total: 200 tokens** (only when full context needed)
- **Typical: 20 tokens** (metadata only for guidance)

**Savings**: 60% average, 77% for simple lookups

## Version

1.0.0 - Phase 2 core workflow
