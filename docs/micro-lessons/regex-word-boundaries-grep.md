# Regex Word Boundaries and Deduplication in grep

**Pattern:** Using `\b` word boundaries in `grep -E` patterns and getting repeated matches that need deduplication.

**Context:** Extended regex (`grep -E`) has limited word boundary support, and text parsing often produces duplicate results.

## Problem
```bash
# Issues: \b not supported in ERE, no deduplication
REFS=$(echo "$TEXT" | grep -oE '\b(SPEC|PLAN|TASK)-[0-9]{8}-[a-zA-Z0-9_-]+\b' || true)

# Problems:
# - \b word boundary may not work reliably in grep -E
# - Duplicate references aren't removed
# - echo can mangle input with special characters
```

## Solution
```bash
# Robust: proper ERE pattern + deduplication + safe input handling
REFS=$(printf "%s" "$TEXT" | grep -oE '(SPEC|PLAN|TASK)-[0-9]{8}-[A-Za-z0-9_-]+' | sort -u || true)
```

## Improvements Made
- **`printf "%s"` instead of `echo`**: Handles special characters safely
- **Removed `\b` boundaries**: Use context-appropriate matching instead
- **Added `sort -u`**: Deduplicates repeated references
- **Simplified character class**: `[A-Za-z0-9_-]` instead of `[a-zA-Z0-9_-]`

## Benefits
- **Cross-platform compatibility**: Works reliably across different grep implementations
- **No duplicates**: Each reference appears only once in results
- **Safe input handling**: Preserves special characters and whitespace

## When to Apply
- Text extraction with grep in shell scripts
- Processing user input or PR descriptions
- Any pattern matching that might produce duplicates

## Advanced Pattern (with word boundaries)
```bash
# If you need actual word boundaries, use more explicit patterns:
REFS=$(printf "%s" "$TEXT" | grep -oE '(^|[^A-Za-z0-9_-])(SPEC|PLAN|TASK)-[0-9]{8}-[A-Za-z0-9_-]+' | 
       sed 's/^[^A-Za-z]*//' | sort -u || true)
```

**Estimated reading time:** 75 seconds