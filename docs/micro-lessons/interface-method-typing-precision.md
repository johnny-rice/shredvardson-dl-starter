# Interface Method Typing Precision

## Problem
Interface methods accepting `string` when specific union types exist undermines type safety.

```typescript
// ❌ Bad: Accepts any string
export type AuthProvider = 'supabase' | 'nextauth' | 'clerk';

interface AuthAdapter {
  signIn(params: { email: string } | { provider: string }): Promise<void>;
  //                                           ^^^^^^ 
  //                                   Should be AuthProvider
}

// This compiles but fails at runtime:
adapter.signIn({ provider: 'bogus' }); // ❌ No compile-time error
```

Validation is deferred to runtime instead of catching errors during development.

## Solution
Use the precise union type in method signatures:

```typescript
// ✅ Good: Enforces type safety
interface AuthAdapter {
  signIn(params: { email: string } | { provider: AuthProvider }): Promise<void>;
  //                                           ^^^^^^^^^^^^
  //                                     Precise type constraint
}

// This fails at compile time:
adapter.signIn({ provider: 'bogus' }); // ✅ TypeScript error
```

## Why This Works
- **Compile-Time Safety**: Catch errors before runtime
- **Better IntelliSense**: IDE shows valid options
- **Self-Documenting**: Interface shows exact constraints
- **Consistency**: Same type used throughout codebase

## When to Apply
- Method parameters that should match existing union types
- Any place where `string` could be more specific
- Interface definitions that will have multiple implementations
- API boundaries where invalid input is expensive

## Pattern Recognition
🚨 **Red Flag**: `string` parameter when union type exists
✅ **Green Flag**: Method signature matches domain constraints

## Anti-Patterns to Avoid
```typescript
// ❌ Don't do this:
method(status: string)        // when StatusType exists
method(provider: string)      // when AuthProvider exists  
method(role: string)         // when UserRole exists
```

## Related
- TypeScript strictness configuration
- Domain-driven design principles
- Consider for: status enums, provider types, role systems

---
*Created from CodeRabbit feedback on signIn provider typing*