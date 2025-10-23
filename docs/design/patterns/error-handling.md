# Error Handling Patterns

## Overview

Error handling communicates failures gracefully and helps users recover. Good error handling prevents user frustration, reduces support tickets, and maintains trust.

## Core Principles

1. **Be Specific**: Explain exactly what went wrong
2. **Be Actionable**: Tell users how to fix it
3. **Be Empathetic**: Acknowledge the inconvenience
4. **Be Timely**: Show errors when relevant
5. **Preserve Work**: Never lose user data

## Pattern Selection Guide

| Scenario | Pattern | Component | When to Use |
|----------|---------|-----------|-------------|
| Field validation | Inline error | Input with error prop | Real-time form feedback |
| Form submission | Form-level error | Alert banner | Multiple field errors |
| Async action result | Toast notification | Toast | Save, delete, API calls |
| Page-level failure | Error boundary | Error page | Component crashes |
| Network failure | Retry UI | Error state + button | API timeouts, offline |

## Inline Field Validation

**Use for**: Real-time form field validation

### When to Show
- **On blur**: After user leaves field (most common)
- **On submit**: When form is submitted
- **NOT on keystroke**: Too aggressive, frustrating

### Implementation

```tsx
import { Input } from '@ui/src/components/ui/input';
import { Label } from '@ui/src/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email" className={error ? "text-destructive" : ""}>
    Email {required && <span className="text-destructive">*</span>}
  </Label>
  <Input
    id="email"
    type="email"
    className={error ? "border-destructive" : ""}
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )}
</div>
```

### Error Message Examples

❌ **Bad**: "Invalid input"
✅ **Good**: "Email must be in format: `you@example.com`"

❌ **Bad**: "Error"
✅ **Good**: "Password must be at least 8 characters with letters and numbers"

## Form-Level Errors

**Use for**: Multiple field errors or submission failures

### Implementation

```tsx
{formError && (
  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive mb-4">
    <div className="flex gap-2">
      <span className="text-destructive font-semibold">⚠️</span>
      <div className="flex-1">
        <p className="font-semibold text-destructive">Unable to submit form</p>
        <p className="text-sm text-destructive/90 mt-1">{formError}</p>
        {fieldErrors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {fieldErrors.map((error, i) => (
              <li key={i} className="text-sm text-destructive/90">
                • {error}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
)}
```

## Toast Notifications

**Use for**: Async operation feedback (saves, deletes, API calls)

### Success Toast

```tsx
import { toast } from '@/lib/toast';

toast.success("Settings saved successfully");
```

### Error Toast

```tsx
toast.error("Failed to save changes. Please try again.");
```

### Error Toast with Action

```tsx
toast.error("Failed to save changes", {
  action: {
    label: "Retry",
    onClick: () => handleSave()
  }
});
```

### Guidelines

- **Duration**: 5s for success, 7s for errors (user needs time to read)
- **Position**: Top-right (standard convention)
- **Dismissible**: Always allow manual dismiss
- **Limit**: Max 3 toasts visible at once

## Network Errors

**Use for**: API failures, timeouts, offline scenarios

### Retry Pattern

```tsx
{error && (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="text-4xl">😞</div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-semibold text-foreground">
        Something went wrong
      </h3>
      <p className="text-muted-foreground max-w-md">
        {error.message || "We couldn't load this content. Please try again."}
      </p>
    </div>
    <Button onClick={handleRetry} disabled={isRetrying}>
      {isRetrying ? "Retrying..." : "Try Again"}
    </Button>
  </div>
)}
```

### Offline Detection

```tsx
{isOffline && (
  <div className="fixed bottom-4 left-4 right-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
    <div className="flex gap-2 items-center">
      <span className="text-yellow-600">⚠️</span>
      <p className="text-sm text-yellow-800">
        You're offline. Changes will sync when connection is restored.
      </p>
    </div>
  </div>
)}
```

## Error Boundaries

**Use for**: Component crashes, unhandled exceptions

### Implementation

```tsx
// app/error.tsx (Next.js error boundary)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="text-muted-foreground">
          We've been notified and are looking into it.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

## 404 Not Found

**Use for**: Missing pages or resources

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">Browse Docs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Validation Timing

| Field Type | Validation Timing | Reason |
|------------|------------------|---------|
| Email | On blur | Avoid interrupting typing |
| Password | On blur | User may paste, let them finish |
| Username | On blur + debounced | Check availability without spam |
| Required fields | On submit | User may skip intentionally |
| Text fields | On blur | Consistent with other fields |

## Accessibility Requirements

### WCAG AA Compliance

- ✅ **Color**: Error text contrast ≥ 4.5:1
- ✅ **Icons**: Don't rely solely on color (use icon + text)
- ✅ **Focus**: Error fields auto-focus on submission failure
- ✅ **Announcements**: Use `role="alert"` for dynamic errors
- ✅ **Association**: Link errors via `aria-describedby`

### Screen Reader Support

```tsx
<Input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error email-hint" : "email-hint"}
  aria-required="true"
/>
<p id="email-hint" className="text-sm text-muted-foreground">
  We'll never share your email
</p>
{error && (
  <p id="email-error" className="text-sm text-destructive" role="alert">
    {error}
  </p>
)}
```

## Error Message Guidelines

### Structure

```text
[Problem] [Reason] [Action]
```

Examples:
- "Email address is invalid. Check for typos or use format: `you@example.com`"
- "Username is taken. Try adding numbers or your initials"
- "File is too large (5.2 MB). Maximum size is 2 MB. Try compressing it"

### Tone

**Be empathetic, not accusatory:**

❌ "You entered an invalid email"
✅ "Email format isn't recognized"

❌ "You must accept the terms"
✅ "Please accept the terms to continue"

### Avoid Technical Jargon

❌ "Status code 422: Unprocessable entity"
✅ "We couldn't process your request. Please check your information and try again"

## Anti-Patterns

### ❌ Don't: Generic Error Messages

```tsx
<p>Error occurred</p>
```

**Why**: Doesn't help user understand or fix the problem

### ❌ Don't: Errors on Every Keystroke

```tsx
<Input onChange={(e) => validateImmediately(e.target.value)} />
```

**Why**: Frustrating, interrupts typing flow

### ❌ Don't: Lose User Data on Error

```tsx
{error && <form>{/* Empty form, data lost */}</form>}
```

**Why**: User has to re-enter everything

### ❌ Don't: Block UI Without Explanation

```tsx
<Button disabled>Submit</Button>
```

**Why**: User doesn't know why they can't submit

## Related Patterns

- [Forms](./forms.md) - Form validation patterns
- [Loading States](./loading-states.md) - During async operations
- [Empty States](./empty-states.md) - When there's no data (not an error)
- [Typography](./typography.md) - Error message text styling
