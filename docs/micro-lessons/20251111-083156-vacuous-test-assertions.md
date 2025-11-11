---
UsedBy: 0
Severity: high
---

# Vacuous Test Assertions Anti-Pattern

**Context.** CodeRabbit flagged E2E tests with assertions like `expect(value || fallback).toBeTruthy()` that always pass regardless of the actual value. These tests provided false confidence - they would never fail even when features were broken.

**Rule.** **Never use logical OR (`||`) or null coalescing (`??`) operators in test assertions as they create vacuous tests that always pass.**

**Example.**

```typescript
// ❌ BAD: Always passes, even when headingLevel is null/undefined
expect(headingLevel || 'h1').toBeTruthy();

// ❌ BAD: Always passes, even when inMainLandmark is false
expect(inMainLandmark || true).toBeTruthy();

// ❌ BAD: Always passes due to requirementsText object reference
expect(ariaDescribedBy || requirementsText).toBeTruthy();

// ✅ GOOD: Actually validates the value
expect(headingLevel).toBeTruthy();

// ✅ GOOD: Tests the actual boolean value
expect(inMainLandmark).toBe(true);

// ✅ GOOD: Validates attribute exists and references valid element
expect(ariaDescribedBy).toBeTruthy();
if (ariaDescribedBy) {
  const describedElement = page.locator(`#${ariaDescribedBy}`);
  await expect(describedElement).toBeVisible();
}
```

**Guardrails.**

- Search codebase for `expect(.*\|\|` or `expect(.*\?\?` patterns during code review
- Use strict TypeScript settings to catch potential undefined values before tests
- Run tests with intentionally broken features to verify they actually fail
- Tools like CodeRabbit or ESLint can detect these patterns automatically

**Tags.** testing, playwright, e2e, assertions, code-review, false-positives, issue-359
