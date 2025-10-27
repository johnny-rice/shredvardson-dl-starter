# Form Patterns

## Overview

Forms collect user input for data submission, account creation, settings, and transactions. Good form design reduces errors, increases completion rates, and provides clear feedback.

## Core Principles

1. **Progressive Disclosure**: Show fields only when relevant
2. **Inline Validation**: Validate as user types (for appropriate fields)
3. **Clear Error Messages**: Explain what's wrong AND how to fix it
4. **Sensible Defaults**: Pre-fill when possible
5. **Keyboard Friendly**: Tab order, Enter to submit

## Form Structure

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  {/* Field groups */}
  <div className="space-y-2">
    <Label htmlFor="field">Field Label</Label>
    <Input id="field" />
    <p className="text-sm text-muted-foreground">Helper text</p>
  </div>

  {/* Actions */}
  <div className="flex gap-2 justify-end">
    <Button variant="outline" type="button">
      Cancel
    </Button>
    <Button type="submit">Submit</Button>
  </div>
</form>
```

## Field Components

### Text Input

**Purpose**: Single-line text entry
**Token**: Uses `border-input`, `bg-background`, `text-foreground`

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" aria-describedby="email-hint" />
  <p id="email-hint" className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

### Required Fields

Mark with asterisk AND use `aria-required`:

```tsx
<Label htmlFor="email">
  Email <span className="text-destructive">*</span>
</Label>
<Input id="email" type="email" required aria-required="true" />
```

### Disabled Fields

Use sparingly - explain WHY disabled:

```tsx
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input id="username" disabled value="john_doe" aria-describedby="username-disabled" />
  <p id="username-disabled" className="text-sm text-muted-foreground">
    Username cannot be changed after account creation
  </p>
</div>
```

## Validation Patterns

### Validation Timing

| Field Type      | Validation Timing                      |
| --------------- | -------------------------------------- |
| Email           | On blur (after leaving field)          |
| Password        | On blur                                |
| Username        | On blur + debounced (for availability) |
| Text fields     | On blur                                |
| Required fields | On submit                              |

### Error States

```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-destructive">
    Email <span className="text-destructive">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    className="border-destructive"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-sm text-destructive">
    Please enter a valid email address (e.g., you@example.com)
  </p>
</div>
```

### Success States

```tsx
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input
    id="username"
    value="john_doe"
    className="border-green-500"
    aria-describedby="username-success"
  />
  <p id="username-success" className="text-sm text-green-600">
    ✓ Username is available
  </p>
</div>
```

## Error Messages

### Be Specific

❌ "Invalid input"
✅ "Email must be in format: you@example.com"

### Be Actionable

❌ "Username taken"
✅ "This username is taken. Try: john_doe_2025"

### Be Empathetic

❌ "Wrong password"
✅ "Password doesn't match. Try again or reset your password"

### Error Message Structure

```tsx
{
  error && (
    <div className="p-4 rounded bg-destructive/10 border border-destructive">
      <p className="font-semibold text-destructive">{error.title}</p>
      <p className="text-sm text-destructive/90">{error.message}</p>
      {error.action && (
        <Button variant="link" className="text-destructive mt-2">
          {error.action}
        </Button>
      )}
    </div>
  );
}
```

## Form Types

### Sign Up Form

```tsx
<form onSubmit={handleSignUp} className="space-y-4 max-w-md">
  <div className="space-y-2">
    <Label htmlFor="email">
      Email <span className="text-destructive">*</span>
    </Label>
    <Input id="email" type="email" required placeholder="you@example.com" />
  </div>

  <div className="space-y-2">
    <Label htmlFor="password">
      Password <span className="text-destructive">*</span>
    </Label>
    <Input id="password" type="password" required aria-describedby="password-hint" />
    <p id="password-hint" className="text-sm text-muted-foreground">
      At least 8 characters with a mix of letters and numbers
    </p>
  </div>

  <Button type="submit" className="w-full" disabled={isLoading}>
    {isLoading ? 'Creating Account...' : 'Sign Up'}
  </Button>

  <p className="text-sm text-center text-muted-foreground">
    Already have an account? <Link href="/sign-in">Sign in</Link>
  </p>
</form>
```

### Settings Form

```tsx
<form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Profile Settings</h2>

    <div className="space-y-2">
      <Label htmlFor="display-name">Display Name</Label>
      <Input id="display-name" defaultValue="John Doe" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <textarea
        id="bio"
        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
        placeholder="Tell us about yourself"
      />
      <p className="text-sm text-muted-foreground text-right">250 characters remaining</p>
    </div>
  </div>

  <div className="flex gap-2 justify-end border-t pt-4">
    <Button variant="outline" type="button">
      Cancel
    </Button>
    <Button type="submit">Save Changes</Button>
  </div>
</form>
```

### Search Form

```tsx
<form onSubmit={handleSearch} className="flex gap-2">
  <Input type="search" placeholder="Search..." className="flex-1" aria-label="Search" />
  <Button type="submit">Search</Button>
</form>
```

## Accessibility Requirements

### Minimum (WCAG AA)

- ✅ All inputs have associated `<Label>` (via `htmlFor`)
- ✅ Focus rings visible on all interactive elements
- ✅ Error messages linked via `aria-describedby`
- ✅ Invalid states marked with `aria-invalid="true"`
- ✅ Required fields marked with `aria-required="true"`
- ✅ Contrast ratio ≥ 4.5:1 for all text

### Keyboard Navigation

- Tab: Move between fields
- Shift+Tab: Move backward
- Enter: Submit form (when focused on submit button)
- Esc: Cancel (in dialogs)

### Screen Readers

Use `aria-describedby` to link hints and errors:

```tsx
<Input
  id="password"
  aria-describedby="password-hint password-error"
/>
<p id="password-hint">At least 8 characters</p>
{error && <p id="password-error">{error}</p>}
```

## Loading States

### Inline Loading (Small Forms)

```tsx
<Button type="submit" disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

### Full Form Loading (Large Forms)

```tsx
{
  isLoading && (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
      <p className="text-muted-foreground">Saving your changes...</p>
    </div>
  );
}
```

## Multi-Step Forms

```tsx
<div className="space-y-6">
  {/* Progress indicator */}
  <div className="flex gap-2">
    {steps.map((step, index) => (
      <div
        key={step}
        className={cn('h-2 flex-1 rounded', index <= currentStep ? 'bg-primary' : 'bg-muted')}
      />
    ))}
  </div>

  {/* Current step content */}
  <form onSubmit={handleNext}>
    {renderStep(currentStep)}

    <div className="flex gap-2 justify-between">
      {currentStep > 0 && (
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
      )}
      <Button type="submit">{currentStep === steps.length - 1 ? 'Submit' : 'Next'}</Button>
    </div>
  </form>
</div>
```

## Token Reference

- `border-input` → Input border
- `bg-background` → Input background
- `text-foreground` → Input text
- `text-muted-foreground` → Helper text
- `text-destructive` → Error text
- `border-destructive` → Error border

## Related Patterns

- [Buttons](./buttons.md) - Form actions
- [Error Handling](./error-handling.md) - Error display patterns
- [Dialogs](./dialogs.md) - Modal forms
