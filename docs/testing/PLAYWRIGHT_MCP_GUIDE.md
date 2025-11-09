# Playwright MCP Testing Guide

**Version**: 1.0
**Updated**: 2025-11-06
**Status**: Production-Ready

## Overview

This guide documents the **Playwright Model Context Protocol (MCP)** integration for UI testing in the DL Starter monorepo. Playwright MCP enables AI-powered browser automation for comprehensive end-to-end testing with real browser interactions.

## What is Playwright MCP?

Playwright MCP is a **Model Context Protocol server** that gives AI agents access to browser automation capabilities. Unlike traditional E2E tests, Playwright MCP:

- ✅ **Real Browser Interaction** - Uses actual Chromium/Firefox/WebKit browsers
- ✅ **Accessibility Tree Navigation** - Works with semantic HTML, not brittle selectors
- ✅ **Visual Verification** - Takes screenshots at each step
- ✅ **Live Debugging** - Interact with running applications in real-time
- ✅ **AI-Powered** - Claude Code can write, execute, and debug tests conversationally

## Available Tools

The Playwright MCP server provides 20+ browser automation tools:

### Navigation

- `browser_navigate` - Navigate to URLs
- `browser_navigate_back` - Go back to previous page
- `browser_tabs` - List, create, close, or select tabs

### Interaction

- `browser_click` - Click elements (left/right/double click, with modifiers)
- `browser_type` - Type text into editable elements
- `browser_fill_form` - Fill multiple form fields at once
- `browser_select_option` - Select dropdown options
- `browser_drag` - Drag and drop between elements
- `browser_hover` - Hover over elements
- `browser_press_key` - Press keyboard keys
- `browser_file_upload` - Upload files

### Inspection

- `browser_snapshot` - Capture accessibility tree (best for navigation)
- `browser_take_screenshot` - Take PNG/JPEG screenshots
- `browser_console_messages` - Get console logs (optionally errors only)
- `browser_network_requests` - Get all network requests

### Utilities

- `browser_evaluate` - Execute JavaScript in browser context
- `browser_wait_for` - Wait for text to appear/disappear or time to pass
- `browser_handle_dialog` - Handle alerts/confirms/prompts
- `browser_resize` - Resize browser window
- `browser_close` - Close the page
- `browser_install` - Install browser binaries

## Setup

### Prerequisites

1. **Playwright MCP Server Installed** - Verify with:

   ```bash
   claude mcp list
   ```

   You should see "Playwright" with a green "installed" chip.

2. **Local Dev Server Running** - Start your Next.js app:

   ```bash
   pnpm --filter=web dev
   ```

3. **Supabase Running** (for auth testing):

   ```bash
   supabase start
   ```

### Environment Variables

Ensure `.env.local` exists in `apps/web/`:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Critical**: Next.js requires `NEXT_PUBLIC_*` variables in the app directory, not just project root.

## Testing Workflow

### 1. Start Browser Session

Ask Claude Code to navigate to your app:

```
Navigate to http://localhost:3000/sign-up and take a screenshot
```

Claude will:

1. Launch browser
2. Navigate to URL
3. Take screenshot
4. Return accessibility tree snapshot

### 2. Interact with UI

Test form submission:

```
Fill the sign-up form with:
- Email: test-user@example.com
- Password: TestPassword123!
Then submit the form
```

Claude will:

1. Identify form fields via accessibility tree
2. Fill inputs with provided values
3. Click submit button
4. Wait for navigation

### 3. Verify Results

Check authentication worked:

```
Navigate to /dashboard and verify the user's email is displayed
```

Claude will:

1. Navigate to protected route
2. Check for expected content
3. Take screenshot for verification
4. Report success/failure

### 4. Test Complex Flows

Test complete user journey:

```
Test the complete auth flow:
1. Sign up with a new user
2. Verify redirect to homepage
3. Navigate to dashboard
4. Verify user data is displayed
5. Sign out
6. Sign in with same credentials
7. Verify dashboard is accessible again
```

Claude will execute all steps sequentially with validation at each stage.

## Real-World Example: Auth Testing

### Successful Test Session

This is the actual flow we tested for Issue #292 (Auth Module MVP):

#### Step 1: Sign Up

```
Navigate to http://localhost:3001/sign-up
Fill form:
  - Email: test-mcp-working@example.com
  - Password: TestPassword123!
Submit form
```

**Result**: ✅ Redirected to `/` (homepage)
**Screenshot**: `sign-up-page.png`, `after-signup-homepage.png`

#### Step 2: Dashboard Access

```
Navigate to /dashboard
```

**Result**: ✅ Dashboard accessible
**Displayed**: User email, user ID, last sign-in timestamp
**Screenshot**: `dashboard-authenticated.png`

#### Step 3: Sign Out

```
Click "Sign out" button
```

**Result**: ✅ Redirected to `/sign-in`
**Session**: Cleared

#### Step 4: Sign In

```
Fill form:
  - Email: test-mcp-working@example.com
  - Password: TestPassword123!
Submit form
```

**Result**: ✅ Redirected to `/` (homepage)
**Screenshot**: `after-signin.png`

#### Step 5: Session Persistence

```
Navigate to /dashboard
```

**Result**: ✅ Dashboard accessible without re-authentication
**Screenshot**: `dashboard-after-signin.png`

### Bug Discovered via Playwright MCP

During testing, we discovered a critical bug:

**Error**: `Your project's URL and Key are required to create a Supabase client!`

**Root Cause**: `.env.local` was in project root, but Next.js browser client couldn't access it.

**Fix**:

```bash
cp .env.local apps/web/.env.local
```

**Lesson**: Playwright MCP's real browser environment surfaces runtime issues that unit tests miss.

## Best Practices

### 1. Use Accessibility Tree, Not Selectors

❌ **Avoid**:

```
Click the button with class "btn-primary"
```

✅ **Prefer**:

```
Click the "Sign up" button
```

Playwright MCP uses the accessibility tree, making tests resilient to CSS/class changes.

### 2. Take Screenshots Liberally

Always capture visual state:

```
Navigate to /dashboard and take a screenshot
```

Screenshots provide:

- Visual regression detection
- Debugging context
- Documentation artifacts

### 3. Wait for Navigation

After form submission:

```
Submit the form and wait for redirect to /dashboard
```

This ensures async operations complete before next assertion.

### 4. Test Error States

Don't just test happy paths:

```
Fill sign-in form with:
- Email: wrong@example.com
- Password: WrongPassword123!
Submit and verify error message is displayed
```

### 5. Clean Up After Tests

Close browser when done:

```
Close the browser
```

Or Claude will do this automatically when test session ends.

## Integration with Existing Testing

### Playwright MCP vs Traditional E2E Tests

| Feature | Playwright MCP | Traditional E2E |
|---------|---------------|----------------|
| **Execution** | Conversational with Claude | `npx playwright test` |
| **Test Writing** | Natural language | TypeScript code |
| **Debugging** | Live, interactive | Trace viewer post-run |
| **Screenshots** | On-demand | On failure only |
| **Use Case** | Exploratory, manual QA | CI/CD, regression |
| **Speed** | Interactive (slower) | Automated (faster) |

**Recommendation**: Use both!

- **Playwright MCP**: Initial testing, debugging, exploratory testing
- **Traditional E2E**: CI/CD automation, regression prevention

### Converting MCP Tests to Code

After validating flows with Playwright MCP, codify them:

```typescript
// apps/web/tests/e2e/auth-flows.spec.ts
test('user can sign up and access dashboard', async ({ page }) => {
  // Navigate to sign-up
  await page.goto('/sign-up');

  // Fill form (validated via Playwright MCP)
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPassword123!');

  // Submit
  await page.click('button[type="submit"]');

  // Verify redirect (behavior confirmed via MCP)
  await page.waitForURL('/');

  // Navigate to dashboard (access confirmed via MCP)
  await page.goto('/dashboard');

  // Verify content (structure validated via MCP)
  await expect(page.locator('text=test@example.com')).toBeVisible();
});
```

### Test Generator Sub-Agent Integration

The **Test Generator** sub-agent can scaffold E2E tests based on Playwright MCP discoveries:

```bash
/test e2e auth-signup
```

This delegates to Test Generator with:

- Project context (Playwright config, existing fixtures)
- Flow contract (from manual MCP testing)
- Coverage goals (from testing contract)

The sub-agent generates production-ready test code.

## Troubleshooting

### Browser Won't Launch

**Error**: Browser installation not found

**Fix**:

```bash
npx playwright install chromium
```

Or use MCP tool:

```
Install Playwright browser
```

### Environment Variables Not Accessible

**Error**: `process.env.NEXT_PUBLIC_* is undefined` in browser

**Fix**: Ensure `.env.local` exists in `apps/web/` directory:

```bash
cp .env.local apps/web/.env.local
```

### Port Conflicts

**Error**: Port 3000 in use

**Fix**: Dev server auto-selects next available port (3001, 3002, etc.)

```bash
# Update navigation URL
Navigate to http://localhost:3001/sign-up
```

### Form Fields Not Found

**Error**: Cannot find form field "email"

**Causes**:

1. Page not fully loaded → Add `wait for "Sign up" text to appear`
2. Wrong field name → Check accessibility tree: `Take a snapshot`
3. Server error → Check console: `Get console messages (errors only)`

### Authentication Issues

**Error**: Redirected to `/sign-in` when expecting `/dashboard`

**Debug Steps**:

1. Check console errors: `Get console messages`
2. Check network requests: `Get network requests`
3. Verify environment variables loaded
4. Check Supabase is running: `supabase status`

## Advanced Patterns

### Testing with Multiple Users

Create isolated test users:

```
Sign up with user1@example.com
Sign out
Sign up with user2@example.com
Navigate to /dashboard
Verify only user2's data is visible
```

### Testing Protected Routes

Verify auth guards work:

```
Close browser (clear session)
Navigate to /dashboard
Verify redirect to /sign-in occurred
```

### Testing RLS Policies

Combine with Supabase CLI:

```bash
# Create test data
psql -h localhost -p 54322 -U postgres -c "INSERT INTO profiles ..."

# Test via browser
Navigate to /dashboard
Verify only own profile is visible
```

### Mobile Responsive Testing

Resize viewport:

```
Resize browser to 375x667 (iPhone size)
Navigate to /sign-up
Take screenshot
Verify form is readable on mobile
```

## Performance Considerations

### When to Use Playwright MCP

✅ **Good Use Cases**:

- Initial feature testing
- Debugging visual issues
- Exploratory testing
- Reproducing user-reported bugs
- Validating auth flows
- Testing complex user journeys

❌ **Avoid for**:

- CI/CD pipelines (use traditional E2E)
- Regression testing (too slow)
- Load testing (single browser instance)

### Speed Optimization

**Parallel Testing**: Not supported (single browser instance per session)

**Reuse Browser**: Keep browser open across multiple tests:

```
# Test 1
Navigate to /sign-up and test form

# Test 2 (same browser session)
Navigate to /sign-in and test form

# Clean up after all tests
Close browser
```

## Security Considerations

### Test Data

**Never use production credentials**:

```
# ✅ Good
Email: test-${Date.now()}@example.com

# ❌ Bad
Email: admin@company.com
```

### Secrets in Screenshots

Be cautious with sensitive data in screenshots:

- API keys in console logs
- User emails/names
- Session tokens

**Recommendation**: Use fake data for manual testing.

## References

- [Playwright MCP Server](https://github.com/anthropics/anthropic-mcp-servers/tree/main/playwright)
- [Playwright Docs](https://playwright.dev)
- [Test Generator Sub-Agent](../../.claude/agents/test-generator/)
- [E2E Test Contracts](../../apps/web/tests/e2e/contracts.md)
- [Coverage Contract](./coverage-contract.md)

## Related Commands

- `/test e2e <flow_name>` - Generate E2E test from Playwright MCP discoveries
- `/test coverage` - Check coverage against contract
- `claude mcp list` - List installed MCP servers

## Success Metrics

From Issue #292 Auth Module Testing:

- ✅ **5 auth flows tested** via Playwright MCP
- ✅ **1 critical bug discovered** (env vars)
- ✅ **6 screenshots captured** for documentation
- ✅ **100% auth flow coverage** (sign-up, sign-in, sign-out, dashboard access, session persistence)
- ✅ **0 false positives** (real browser environment)

**Testing Time**: ~15 minutes for complete auth flow validation

**Value**: Discovered production bug before code review, validated all user journeys end-to-end.

## Next Steps

1. **Convert MCP tests to code** - Codify validated flows in `auth-flows.spec.ts`
2. **Add to CI/CD** - Run traditional E2E tests on every PR
3. **Document flows** - Update contracts based on MCP discoveries
4. **Train team** - Share this guide with developers

---

**Pro Tip**: Treat Playwright MCP as your **manual QA engineer**. It's perfect for the first pass of testing new features, catching obvious bugs, and validating user experience. Then, codify the happy paths into traditional E2E tests for regression prevention.
