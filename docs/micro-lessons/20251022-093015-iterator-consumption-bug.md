---
title: "JavaScript Iterators Are Single-Use: Don't Reuse matchAll Results"
date: 2025-10-21
category: debugging
tags: [javascript, iterators, regex, bugs]
severity: high
---

## Problem

Using `matchAll()` returns an iterator that gets **consumed** when you call `Array.from()`. Attempting to reuse it returns empty results:

```typescript
// ❌ BUG: Iterator consumed by first Array.from()
const asyncFunctions = content.matchAll(/async\s+function/g);
const count1 = Array.from(asyncFunctions).length; // Works: 5
const count2 = Array.from(asyncFunctions).length; // Bug: 0 (iterator exhausted!)
```

## Solution

Convert iterators to arrays **immediately** at creation:

```typescript
// ✅ CORRECT: Materialize iterator into array first
const asyncFunctions = Array.from(content.matchAll(/async\s+function/g));
const tryCatches = Array.from(content.matchAll(/try\s*\{/g));

if (asyncFunctions.length > 0 && tryCatches.length === 0) {
  // Now we can safely use .length multiple times
}
```

## Why This Matters

- **Silent bugs**: No error thrown, just returns empty/zero
- **Hard to debug**: Works in first usage, fails in second
- **Common in code analysis**: Regex matching in linters/validators

## Detection Pattern

Look for:

1. `const x = content.matchAll(...)`
2. Multiple calls to `Array.from(x)` or iterations over `x`

## Related Concepts

- All iterators are single-use (generators, Set.values(), etc.)
- Use `[...iterator]` or `Array.from(iterator)` to materialize
- Once consumed, iterator's `done` property becomes `true`

## Files Fixed

- `.claude/skills/implementation-assistant/scripts/validate-code.ts:51-54`

## References

- [MDN: String.prototype.matchAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)
- [MDN: Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
