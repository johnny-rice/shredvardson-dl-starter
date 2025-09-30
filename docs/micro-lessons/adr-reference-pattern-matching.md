# ADR Reference Pattern Matching with Slugs

**Pattern:** ADR reference regex that only matches numeric IDs and misses slug-based ADR formats, causing false validation failures.

**Context:** ADR naming conventions vary between numeric (ADR-001) and date-slug formats (ADR-20250923-governance-enhancements).

## Problem

```typescript
// Only matches ADR-123, misses ADR-20250923-feature-name
const adrPattern = /\bADR-\d+\b/gi;

// Results in false "missing ADR" errors for valid references like:
// "This implements ADR-20250923-governance-enhancements"
// because the pattern doesn't capture the slug portion
```

## Solution

```typescript
// Matches both ADR-NNN and ADR-YYYYMMDD-slug formats
const adrPattern = /\bADR-\d+(?:-[A-Za-z0-9_-]+)?\b/gi;

// Handles all these formats:
// - ADR-001 (classic numeric)
// - ADR-123 (numeric)
// - ADR-20250923-governance-enhancements (date-slug)
// - ADR-002-my-feature (numeric-slug)
```

## Pattern Breakdown

```typescript
/\b              // Word boundary (start)
ADR-             // Literal "ADR-"
\d+              // One or more digits (required)
(?:              // Non-capturing group (optional slug)
  -              // Literal hyphen
  [A-Za-z0-9_-]+ // Alphanumeric, underscore, hyphen (one or more)
)?               // Make the entire slug group optional
\b               // Word boundary (end)
/gi              // Global, case-insensitive
```

## Benefits

- **Format flexibility**: Supports multiple ADR naming conventions
- **Backward compatibility**: Still matches simple numeric ADRs
- **Accurate validation**: Prevents false negatives for valid references
- **Future-proof**: Handles evolving ADR naming standards

## When to Apply

- ADR reference extraction from text
- Governance validation systems
- Documentation link checking
- Any pattern matching for structured identifiers

## Related Patterns

```typescript
// Date-specific ADR pattern (if you only use YYYYMMDD format):
const dateAdrPattern = /\bADR-\d{8}-[A-Za-z0-9_-]+\b/gi;

// More restrictive slug pattern (kebab-case only):
const kebabAdrPattern = /\bADR-\d+(?:-[a-z0-9-]+)?\b/gi;
```

**Estimated reading time:** 75 seconds
