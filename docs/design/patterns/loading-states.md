# Loading State Patterns

## Overview

Loading states provide feedback during asynchronous operations. They prevent user confusion, set expectations, and maintain perceived performance. Good loading states feel faster than they actually are.

## Core Principles

1. **Immediate Feedback**: Show loading state instantly (<100ms)
2. **Preserve Layout**: Prevent content shifts
3. **Indicate Progress**: Show how much is left when possible
4. **Stay Responsive**: Allow cancellation
5. **Match Context**: Different loading states for different scenarios

## Pattern Selection Guide

| Scenario             | Pattern         | Duration | Component                    |
| -------------------- | --------------- | -------- | ---------------------------- |
| Button action        | Button spinner  | <3s      | Disabled button with spinner |
| Page navigation      | Progress bar    | <2s      | Top-edge progress bar        |
| Data fetch (known)   | Skeleton screen | <5s      | Content-shaped placeholders  |
| Data fetch (unknown) | Spinner         | <10s     | Centered spinner             |
| File upload          | Progress bar    | Variable | Linear progress with %       |
| Background task      | Toast + badge   | Variable | Non-blocking indicator       |

## Button Loading States

**Use for**: Form submissions, save actions, API calls

### Inline Spinner

```tsx
<Button disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
```

### With Icon

```tsx
import { Loader2 } from 'lucide-react';

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Processing...' : 'Submit'}
</Button>;
```

### Multiple States

```tsx
<Button disabled={isProcessing || isSuccess}>
  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isSuccess && <Check className="mr-2 h-4 w-4" />}
  {isProcessing ? 'Saving...' : isSuccess ? 'Saved!' : 'Save'}
</Button>
```

## Skeleton Screens

**Use for**: Content loading where layout is known

### Basic Skeleton

```tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}
```

### Card Skeleton

```tsx
<Card className="p-6 space-y-4">
  <div className="space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
  <Skeleton className="h-32 w-full" />
  <div className="flex gap-2">
    <Skeleton className="h-10 w-24" />
    <Skeleton className="h-10 w-24" />
  </div>
</Card>
```

### List Skeleton

```tsx
<div className="space-y-4">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ))}
</div>
```

### Table Skeleton

```tsx
<table>
  <thead>{/* Actual headers */}</thead>
  <tbody>
    {Array.from({ length: 10 }).map((_, i) => (
      <tr key={i}>
        <td>
          <Skeleton className="h-4 w-32" />
        </td>
        <td>
          <Skeleton className="h-4 w-48" />
        </td>
        <td>
          <Skeleton className="h-4 w-24" />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## Spinner

**Use for**: Unknown loading time, small spaces

### Centered Spinner

```tsx
import { Loader2 } from 'lucide-react';

<div className="flex items-center justify-center p-12">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>;
```

### With Message

```tsx
<div className="flex flex-col items-center justify-center p-12 space-y-4">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
  <p className="text-sm text-muted-foreground">Loading your data...</p>
</div>
```

### Inline Spinner

```tsx
<div className="flex items-center gap-2">
  <Loader2 className="h-4 w-4 animate-spin" />
  <span className="text-sm">Loading...</span>
</div>
```

## Progress Bars

**Use for**: Determinate operations (file uploads, multi-step processes)

### Linear Progress

```tsx
export function Progress({ value }: { value: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
```

### With Label

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Uploading...</span>
    <span className="font-medium">{progress}%</span>
  </div>
  <Progress value={progress} />
</div>
```

### Multi-Step Progress

```tsx
<div className="space-y-4">
  <div className="flex justify-between">
    {steps.map((step, i) => (
      <div key={i} className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            i < currentStep
              ? 'bg-primary text-primary-foreground'
              : i === currentStep
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {i < currentStep ? '✓' : i + 1}
        </div>
        <span className="text-xs text-muted-foreground">{step}</span>
      </div>
    ))}
  </div>
  <Progress value={(currentStep / steps.length) * 100} />
</div>
```

## Page Loading

**Use for**: Route transitions, full-page loads

### Top Progress Bar

```tsx
// Using nprogress or similar
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// In router/navigation
useEffect(() => {
  NProgress.start();
  // Load page
  NProgress.done();
}, []);
```

### Full-Page Overlay

```tsx
{
  isLoading && (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}
```

## Lazy Loading

**Use for**: Images, components, infinite scroll

### Image Lazy Load

```tsx
import { useState } from 'react';

export function LazyImage({ src, alt, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        className={cn('transition-opacity duration-300', isLoading ? 'opacity-0' : 'opacity-100')}
        {...props}
      />
    </div>
  );
}
```

### Infinite Scroll Loading

```tsx
<div className="space-y-4">
  {items.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}

  {hasMore && (
    <div ref={loadMoreRef} className="flex justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )}

  {!hasMore && items.length > 0 && (
    <p className="text-center text-sm text-muted-foreground py-4">No more items</p>
  )}
</div>
```

## Background Tasks

**Use for**: Long-running operations that don't block UI

### Non-Blocking Indicator

```tsx
{
  isProcessing && (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg bg-card border shadow-lg">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div>
          <p className="text-sm font-medium">Processing...</p>
          <p className="text-xs text-muted-foreground">This may take a few minutes</p>
        </div>
      </div>
    </div>
  );
}
```

### With Dismiss

```tsx
{
  task && (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg bg-card border shadow-lg">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.status}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setTask(null)}>
          ×
        </Button>
      </div>
    </div>
  );
}
```

## Loading State Timing

### Quick Actions (<1s)

No loading state needed - feels instant

### Short Actions (1-3s)

- Button spinner
- Inline spinner
- Skeleton for known layouts

### Medium Actions (3-10s)

- Skeleton screens
- Progress indicators
- Cancellable operations

### Long Actions (>10s)

- Background processing
- Non-blocking indicators
- Clear time estimates
- Allow navigation away

## Optimistic Updates

**Use for**: Actions that rarely fail (likes, favorites, simple toggles)

```tsx
const [isLiked, setIsLiked] = useState(post.liked);

const handleLike = async () => {
  // Optimistic update
  setIsLiked(!isLiked);

  try {
    await api.toggleLike(post.id);
  } catch (error) {
    // Revert on error
    setIsLiked(isLiked);
    toast.error('Failed to update. Please try again.');
  }
};

<Button variant="ghost" size="icon" onClick={handleLike}>
  {isLiked ? <Heart className="fill-current" /> : <Heart />}
</Button>;
```

## Accessibility

### WCAG AA Requirements

- ✅ **Announce Loading**: Use `aria-live="polite"` for status changes
- ✅ **Disable Interaction**: Disable buttons during loading
- ✅ **Preserve Focus**: Return focus after loading completes
- ✅ **Time Warnings**: Warn if operation takes >20 seconds
- ✅ **Cancellation**: Provide cancel option for long operations

### Screen Readers

```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading && (
    <span className="sr-only">Loading content, please wait</span>
  )}
</div>

<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? "Saving..." : "Save"}
</Button>
```

## Animation Guidelines

### Duration

- **Spinner**: Continuous (no duration)
- **Skeleton**: Continuous pulse (1.5s intervals)
- **Progress**: Smooth transitions (300ms)
- **Fade in**: 200-300ms when content appears

### Reduced Motion

```tsx
<div className={cn('transition-opacity', 'motion-reduce:transition-none')}>{content}</div>
```

## Anti-Patterns

### ❌ Don't: Block UI Unnecessarily

```tsx
// Bad - blocks entire UI
<div className="fixed inset-0 bg-background">
  <Loader />
</div>
```

**Use instead**: Scoped loading states

### ❌ Don't: Show Loading After Content Appears

```tsx
// Bad - jarring experience
{
  data && <Content />;
}
{
  isLoading && <Spinner />;
}
```

**Use instead**: Replace content OR use skeleton before

### ❌ Don't: No Feedback for Long Operations

```tsx
// Bad - user thinks it's broken
<Button onClick={handleLongTask}>Process</Button>
```

**Use instead**: Show progress or move to background

## Related Patterns

- [Empty States](./empty-states.md) - After loading completes with no data
- [Error Handling](./error-handling.md) - When loading fails
- [Buttons](./buttons.md) - Button loading states
- [Forms](./forms.md) - Form submission loading

## Token Reference

Loading states use design tokens:

- `text-primary` → Spinner color
- `bg-muted` → Skeleton background
- `animate-pulse` → Skeleton animation
- `animate-spin` → Spinner animation
