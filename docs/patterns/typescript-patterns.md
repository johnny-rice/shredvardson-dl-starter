# TypeScript Patterns

**Category:** Type Safety & Code Quality
**Impact:** Medium-High - Prevents runtime errors, improves developer experience
**Lessons Synthesized:** 7 micro-lessons

## Overview

This guide consolidates battle-tested TypeScript patterns for precise typing, error handling, and avoiding common JavaScript pitfalls. These patterns prevent runtime errors, provide better IDE support, and ensure type safety throughout your codebase.

## Core Principles

1. **Precision Over Generics:** Use exact types, not broad unions
2. **Type at Boundaries:** Validate at API entry points
3. **Avoid Type Casts:** Proper typing eliminates the need for assertions
4. **ESM Compatibility:** Modern module patterns
5. **Defensive Programming:** Handle edge cases explicitly

---

## Pattern 1: Proper execSync Error Typing

**Problem:** Using `any` type for error handling bypasses TypeScript's type safety.

**Impact:** Medium (6/10) - Type safety, IDE autocomplete

**Source Lessons:**
- `20251027-081050-execsync-error-typing.md`

### ✅ Correct Pattern

```typescript
import { execSync, execFileSync, type ExecException } from 'child_process';

// Define typed error interface
interface ExecError extends ExecException {
  stdout?: Buffer | string;
  stderr?: Buffer | string;
  status?: number;
}

// Use in error handling
try {
  const output = execFileSync('pnpm', ['db:types'], {
    encoding: 'utf-8',
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  console.log(output);
} catch (error) {
  const execError = error as ExecError;

  // Type-safe property access
  console.error({
    message: error instanceof Error ? error.message : 'Unknown error',
    status: execError.status,
    code: execError.code,        // Autocomplete works!
    stderr: execError.stderr ? String(execError.stderr) : undefined,
  });

  // Handle specific error types
  if (execError.code === 'ETIMEDOUT') {
    console.error('Command timed out');
  } else if (execError.status === 1) {
    console.error('Command failed with exit code 1');
  }

  throw error;
}
```

### ❌ Anti-Pattern

```typescript
// ❌ WRONG: Using any bypasses type safety
try {
  execSync('command');
} catch (error) {
  const code = (error as any)?.code;     // Biome warning!
  const stderr = (error as any)?.stderr; // No autocomplete
  const typo = (error as any)?.stdrr;    // Typo not caught!
}
```

### Key Points

- **Import `ExecException`** from `child_process`
- **Extend with custom interface** for additional fields
- **Use `error as ExecError`** instead of `error as any`
- **Include all error properties:** `stdout`, `stderr`, `status`, `code`
- **Handle specific error codes** (ETIMEDOUT, ENOENT, etc.)
- **Passes linter rules** - no `any` warnings

### Common Error Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| `ETIMEDOUT` | Command timed out | Timeout exceeded |
| `ENOENT` | Command not found | Missing executable |
| `EPERM` | Permission denied | Insufficient permissions |
| `EACCES` | Access denied | File/directory permissions |

---

## Pattern 2: Precise Event Handler Types

**Problem:** Overly broad union types accept more types than the API actually provides.

**Impact:** Medium (6/10) - Type precision, API contracts

**Source Lessons:**
- `typescript-event-handler-precise-types.md`
- `polymorphic-component-ref-typing.md`

### ✅ Correct Pattern

```typescript
// Precise event types matching browser APIs
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // ✅ Exact type from addEventListener
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Precise ref typing for polymorphic components
type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
};

// ✅ Type to actual element, not generic parent
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Comp = 'h2', ...props }, ref) => {
    return <Comp ref={ref} {...props} />;  // No cast needed
  }
);

// Precise button event types
type ButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

export function Button({ onClick, onKeyDown }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      Click me
    </button>
  );
}
```

### ❌ Anti-Pattern

```typescript
// ❌ Overly broad union type
const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
  // API only passes MediaQueryListEvent, never MediaQueryList
  setPrefersReducedMotion(event.matches);
};

// ❌ Generic parent type forces casts
export const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  ({ as: Comp = 'h2', ...props }, ref) => {
    return (
      <Comp
        ref={ref as React.Ref<HTMLHeadingElement>}  // Cast required!
        {...props}
      />
    );
  }
);

// ❌ Generic event type
type ButtonProps = {
  onClick?: (event: React.SyntheticEvent) => void;  // Too broad
};
```

### Key Points

- **Match event types exactly** to what the API passes
- **Check browser API docs** for correct event types
- **Use TypeScript's IntelliSense** to verify types
- **Avoid unions** unless multiple types are actually valid
- **Type refs to specific elements** (HTMLHeadingElement, not HTMLElement)
- **Enable strict TypeScript checks** to catch mismatches

### Common Event Types

```typescript
// Mouse events
onClick: (e: React.MouseEvent<HTMLElement>) => void
onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void
onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void

// Keyboard events
onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void
onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => void
onKeyPress: (e: React.KeyboardEvent<HTMLElement>) => void

// Form events
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
onBlur: (e: React.FocusEvent<HTMLInputElement>) => void

// Media events
addEventListener('change', (e: MediaQueryListEvent) => void)
```

---

## Pattern 3: Interface Method Type Precision

**Problem:** Using generic `string` when specific union types exist undermines type safety.

**Impact:** Medium (6/10) - Compile-time safety

**Source Lessons:**
- `interface-method-typing-precision.md`

### ✅ Correct Pattern

```typescript
// Define precise union types
export type AuthProvider = 'supabase' | 'nextauth' | 'clerk';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type StatusType = 'pending' | 'approved' | 'rejected';

// Use in interface definitions
interface AuthAdapter {
  // ✅ Precise type constraint
  signIn(params: { email: string } | { provider: AuthProvider }): Promise<void>;
}

interface UserService {
  updateRole(userId: string, role: UserRole): Promise<void>;
}

interface WorkflowService {
  updateStatus(itemId: string, status: StatusType): Promise<void>;
}

// Implementation
class SupabaseAuthAdapter implements AuthAdapter {
  async signIn(params: { email: string } | { provider: AuthProvider }) {
    if ('email' in params) {
      // Email sign-in
      await this.signInWithEmail(params.email);
    } else {
      // OAuth sign-in - TypeScript enforces valid providers
      await this.signInWithProvider(params.provider);
    }
  }
}

// Usage - compile-time errors
const adapter = new SupabaseAuthAdapter();
adapter.signIn({ provider: 'supabase' });  // ✅ Valid
adapter.signIn({ provider: 'bogus' });     // ❌ TypeScript error!
```

### ❌ Anti-Pattern

```typescript
// ❌ Generic string type
interface AuthAdapter {
  signIn(params: { email: string } | { provider: string }): Promise<void>;
  //                                           ^^^^^^
  //                                    Should be AuthProvider
}

// This compiles but fails at runtime
adapter.signIn({ provider: 'bogus' });  // ❌ No compile-time error
```

### Key Points

- **Define union types** for all domain constraints
- **Use in method signatures** instead of generic `string`
- **Catch errors at compile time** instead of runtime
- **Better IntelliSense** - IDE shows valid options
- **Self-documenting** - interface shows exact constraints
- **Consistent** - same type used throughout codebase

### When to Apply

- Method parameters matching existing union types
- Any place where `string` could be more specific
- API boundaries where invalid input is expensive
- Status enums, provider types, role systems

---

## Pattern 4: JavaScript typeof null Quirk

**Problem:** `typeof null === 'object'` in JavaScript, causing incorrect type checks.

**Impact:** Medium (6/10) - Runtime errors from null access

**Source Lessons:**
- `javascript-typeof-null-quirk.md`

### ✅ Correct Pattern

```typescript
// Null-safe object checks
function processVariants(variants: Variants): Variants {
  const result: Variants = {};

  for (const key in variants) {
    const variant = variants[key];

    // ✅ Explicit null check first
    if (variant && typeof variant === 'object') {
      result[key] = { ...variant };
    }
  }

  return result;
}

// Array checks (arrays also return 'object')
function processValue(value: unknown): string {
  // ✅ Check null first, then array, then object
  if (value === null) {
    return 'null';
  } else if (Array.isArray(value)) {
    return 'array';
  } else if (typeof value === 'object') {
    return 'object';
  } else {
    return typeof value;
  }
}

// Type guards for better type narrowing
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonNullObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

// Usage
if (isObject(variant)) {
  // TypeScript knows variant is object, not null
  const keys = Object.keys(variant);
}
```

### ❌ Anti-Pattern

```typescript
// ❌ Doesn't check for null
function processVariants(variants: Variants): Variants {
  const result: Variants = {};

  for (const key in variants) {
    const variant = variants[key];

    if (typeof variant === 'object') {
      // This executes for null! Will crash if you access properties
      result[key] = { ...variant };  // TypeError: Cannot spread null
    }
  }

  return result;
}
```

### Key Points

- **Always check for null** before `typeof === 'object'`
- **Use pattern:** `value && typeof value === 'object'`
- **Arrays also return 'object'** - use `Array.isArray()` for array checks
- **Create type guards** for common patterns
- **Enable strict null checks** in TypeScript config
- **This affects runtime validation** - not caught by TypeScript alone

### Type Guard Patterns

```typescript
// Object (excluding null and arrays)
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Array
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Non-null
function isNonNull<T>(value: T | null): value is T {
  return value !== null;
}

// String
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

---

## Pattern 5: Iterator Consumption

**Problem:** JavaScript iterators are single-use and get exhausted after first consumption.

**Impact:** High (8/10) - Silent bugs, hard to debug

**Source Lessons:**
- `20251022-093015-iterator-consumption-bug.md`

### ✅ Correct Pattern

```typescript
// ✅ Materialize iterator into array immediately
const asyncFunctions = Array.from(content.matchAll(/async\s+function/g));
const tryCatches = Array.from(content.matchAll(/try\s*\{/g));

// Now safe to use multiple times
if (asyncFunctions.length > 0 && tryCatches.length === 0) {
  console.log(`Found ${asyncFunctions.length} async functions`);
  console.log(`No try-catch blocks found`);
}

// Alternative: Spread syntax
const matches = [...content.matchAll(/pattern/g)];

// For generators, materialize once
function* generateNumbers() {
  yield 1;
  yield 2;
  yield 3;
}

const numbers = Array.from(generateNumbers());
console.log(numbers.length);  // 3
console.log(numbers.length);  // Still 3!
```

### ❌ Anti-Pattern

```typescript
// ❌ Iterator consumed by first use
const asyncFunctions = content.matchAll(/async\s+function/g);
const count1 = Array.from(asyncFunctions).length;  // Works: 5
const count2 = Array.from(asyncFunctions).length;  // Bug: 0 (exhausted!)

// ❌ Silent failure
if (asyncFunctions.length > 0 && tryCatches.length === 0) {
  // This might not work as expected
}
```

### Key Points

- **Convert iterators to arrays immediately** at creation
- **No error thrown** - just returns empty/zero
- **Hard to debug** - works first time, fails second
- **Common in code analysis** - regex matching, validation
- **All iterators are single-use:** generators, `Set.values()`, `matchAll()`
- **Use `[...iterator]` or `Array.from(iterator)`** to materialize

### Detection Pattern

Look for:
1. `const x = content.matchAll(...)`
2. Multiple calls to `Array.from(x)` or iterations over `x`

---

## Pattern 6: ESM Module Compatibility

**Problem:** Using `require()` in ESM-compatible code breaks modern module runners.

**Impact:** High (7/10) - Module compatibility

**Source Lessons:**
- `esm-require-compatibility.md`
- `cross-platform-entrypoint-detection.md`

### ✅ Correct Pattern

```typescript
// ✅ ESM-compatible imports at top level
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use imported functions
export function docExists(path: string): boolean {
  try {
    const resolved = resolve(__dirname, path);
    return existsSync(resolved);
  } catch {
    return false;
  }
}

// Entrypoint detection (ESM-compatible)
export function isMainModule(): boolean {
  // ESM approach using import.meta
  return import.meta.url === `file://${process.argv[1]}`;
}

// If you need dynamic imports, use ES6 dynamic import
async function loadPlugin(name: string) {
  const module = await import(`./${name}.js`);
  return module.default;
}
```

### ❌ Anti-Pattern

```typescript
// ❌ Runtime require() breaks ESM runners
export function docExists(path: string): boolean {
  try {
    const fs = require('fs');  // Runtime require() call
    return fs.existsSync(resolved);
  } catch {
    return false;
  }
}

// ❌ CommonJS __dirname (doesn't work in ESM)
const __dirname = path.dirname(__filename);

// ❌ CommonJS entrypoint detection
if (require.main === module) {
  // Doesn't work in ESM
}
```

### Key Points

- **Import all dependencies at top of file**
- **Use `import.meta.url` for ESM file path**
- **Use `fileURLToPath` to get file path** from URL
- **Test with both CommonJS and ESM** runners (tsx, node --loader)
- **Use static imports** over dynamic when possible
- **Dynamic imports with `await import()`** if needed

### Module System Detection

```typescript
// Check if running as ESM
function isESM(): boolean {
  return typeof import.meta !== 'undefined';
}

// Conditional module loading
let config;
if (isESM()) {
  config = await import('./config.js');
} else {
  config = require('./config.js');
}
```

---

## Pattern 7: Type Guards and Runtime Validation

**Problem:** TypeScript types don't exist at runtime, need validation at boundaries.

**Impact:** High (8/10) - Runtime safety

### ✅ Correct Pattern

```typescript
import { z } from 'zod';

// Define runtime validation schemas
const AuthProviderSchema = z.enum(['supabase', 'nextauth', 'clerk']);
const UserRoleSchema = z.enum(['admin', 'editor', 'viewer']);

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
});

type User = z.infer<typeof UserSchema>;

// Validate at API boundaries
export async function createUser(input: unknown): Promise<User> {
  // Validate input
  const validated = UserSchema.parse(input);

  // TypeScript knows validated is User type
  const user = await db.users.create(validated);
  return user;
}

// Type guards for common checks
function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// Use in validation
if (!isValidEmail(email)) {
  throw new Error('Invalid email format');
}

if (!isValidUUID(userId)) {
  throw new Error('Invalid user ID format');
}
```

### Key Points

- **Use Zod for runtime validation** at API boundaries
- **Type guards for common patterns**
- **Validate at entry points:** API routes, CLI args, file inputs
- **Fail fast with clear errors**
- **Infer TypeScript types from schemas** with `z.infer`

---

## Checklist for TypeScript Code

Before committing TypeScript code, verify:

- [ ] Import `ExecException` for execSync error handling
- [ ] Event handler types match API exactly (no overly broad unions)
- [ ] Interface methods use precise union types (not generic `string`)
- [ ] Null checks before `typeof === 'object'`
- [ ] Iterators materialized to arrays immediately (`Array.from`)
- [ ] ESM imports at top level (no `require()` in functions)
- [ ] Type guards defined for common patterns
- [ ] Zod schemas for runtime validation at boundaries
- [ ] Strict TypeScript config enabled
- [ ] No `any` types (use proper interfaces)
- [ ] No unnecessary type casts (proper typing eliminates need)

---

## Quick Reference

### Common Type Guards

```typescript
// Object (not null, not array)
function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// Array
function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

// String
function isString(v: unknown): v is string {
  return typeof v === 'string';
}

// Number
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}
```

### Error Type Pattern

```typescript
import { type ExecException } from 'child_process';

interface ExecError extends ExecException {
  stdout?: Buffer | string;
  stderr?: Buffer | string;
  status?: number;
}

try {
  execFileSync('command', args, options);
} catch (error) {
  const execError = error as ExecError;
  // Type-safe access to error properties
}
```

### ESM Pattern

```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## References

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/
- **Zod:** https://zod.dev/
- **MDN Iteration Protocols:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
- **Node.js ESM:** https://nodejs.org/api/esm.html

---

## Related Patterns

- [React Patterns](./react-patterns.md) - Component type safety
- [Security Patterns](./security-patterns.md) - Input validation patterns
- [Bash Safety Patterns](./bash-safety-patterns.md) - Cross-language safety

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 7 micro-lessons from TypeScript category
