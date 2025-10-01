# Be Lenient with YAML Validation and Coerce Types

## Problem

Strict YAML validation fails when fields are missing/undefined or when YAML parsers return strings instead of expected types (e.g., issue numbers).

## Solution

Allow missing optional fields and coerce types with validation:

```typescript
// ❌ Before: strict validation fails on missing parentId
if (expectedType === 'spec' && data.parentId !== '') {
  this.errors.push(`Specs should have empty parentId, got '${data.parentId}'`);
  return false;
}

// ✅ After: lenient validation with normalization
if (expectedType === 'spec') {
  if (data.parentId !== undefined && data.parentId !== '') {
    this.errors.push(`Specs should have empty parentId, got '${data.parentId}'`);
    return false;
  }
  data.parentId = ''; // normalize missing to empty
}

// Normalize issue to number (YAML often yields strings)
if (typeof data.issue !== 'number') {
  const parsed = Number(data.issue);
  if (!Number.isInteger(parsed)) {
    this.errors.push(`issue must be an integer, got '${data.issue}'`);
    return false;
  }
  data.issue = parsed;
}
```

## Key Benefits

- Handles missing optional fields gracefully
- Coerces YAML string numbers to actual numbers
- Provides clear error messages for invalid data
- Normalizes data structure for downstream use

## Context

- Common with gray-matter and other YAML parsers
- Essential for user-friendly validation of front-matter
- Prevents failures on technically valid but different formats

**Tags:** yaml,validation,type-coercion,front-matter,leniency,normalization,coderabbit
