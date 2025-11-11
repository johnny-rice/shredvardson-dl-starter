---
UsedBy: 0
Severity: normal
---

# Avoid waitForTimeout in Playwright Tests

**Context.** E2E tests had 12+ instances of `page.waitForTimeout(200)` to wait for form validation. CodeRabbit flagged these as flaky - they make tests slower and can cause spurious failures when the app is slow. Playwright's assertions auto-wait, making these unnecessary.

**Rule.** **Never use `waitForTimeout()` in Playwright tests - rely on Playwright's built-in auto-waiting with assertions instead.**

**Example.**

```typescript
// ❌ BAD: Arbitrary 200ms timeout is unreliable
await page.locator('[name="email"]').blur();
await page.waitForTimeout(200);
await expect(page.locator('text=/invalid email/i')).toBeVisible();

// ✅ GOOD: Playwright's expect() auto-waits up to 5 seconds
await page.locator('[name="email"]').blur();
await expect(page.locator('text=/invalid email/i')).toBeVisible();

// ✅ GOOD: Custom timeout only if needed (rare)
await expect(page.locator('text=/invalid email/i')).toBeVisible({
  timeout: 10000
});
```

**Guardrails.**

- Grep for `waitForTimeout` in test files during PR review
- Use Playwright's `waitForSelector`, `waitForURL`, or assertion auto-waiting
- Only use explicit waits for animation delays or external API polling
- If validation seems slow, investigate the app code rather than adding delays

**Tags.** playwright, testing, e2e, flaky-tests, performance, auto-waiting, issue-359
