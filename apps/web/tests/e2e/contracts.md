# E2E Test Contracts

**Version**: 1.0
**Updated**: 2025-10-03

## Overview

These contracts define critical user flows that MUST work end-to-end. All E2E tests validate these user journeys.

## Authentication Flows

### Contract 1.1: User Can Sign Up

**Flow**: New user creates account successfully

**Steps**:

1. Navigate to `/signup`
2. Fill email input with valid email
3. Fill password input with valid password (min 8 chars)
4. Click submit button
5. Verify redirect to verification page OR dashboard

**Success Criteria**:

- ✅ Form accepts valid inputs
- ✅ Submit button is enabled
- ✅ No validation errors shown
- ✅ Redirect occurs after submission
- ✅ User is created in database

**Error Scenarios**:

- Invalid email format → Show error
- Weak password → Show error
- Email already exists → Show error

### Contract 1.2: User Can Log In

**Flow**: Existing user logs in successfully

**Steps**:

1. Navigate to `/login`
2. Fill email input with registered email
3. Fill password input with correct password
4. Click submit button
5. Verify redirect to `/dashboard`

**Success Criteria**:

- ✅ Form accepts valid credentials
- ✅ Submit button is enabled
- ✅ Redirect to dashboard after login
- ✅ User session established
- ✅ User data accessible

**Error Scenarios**:

- Wrong password → Show "Invalid credentials"
- Non-existent email → Show "Invalid credentials"
- Empty fields → Show validation errors

### Contract 1.3: User Can Log Out

**Flow**: Authenticated user logs out successfully

**Steps**:

1. User is authenticated (on `/dashboard`)
2. Click logout button/link
3. Verify redirect to `/` (home page)
4. Verify session is cleared

**Success Criteria**:

- ✅ Logout button is visible when authenticated
- ✅ Click triggers logout
- ✅ Redirect to public page
- ✅ Session cookie cleared
- ✅ Cannot access protected routes after logout

### Contract 1.4: Session Persistence

**Flow**: User session persists across page refreshes

**Steps**:

1. User logs in successfully
2. Navigate to `/dashboard`
3. Refresh the page
4. Verify still on `/dashboard` (not redirected to login)

**Success Criteria**:

- ✅ Session cookie persists
- ✅ No redirect to login after refresh
- ✅ User data still accessible

## Protected Route Access

### Contract 2.1: Unauthenticated User Redirected

**Flow**: Non-authenticated user cannot access protected routes

**Steps**:

1. Ensure user is NOT logged in (clear session)
2. Navigate directly to `/dashboard`
3. Verify redirect to `/login`

**Success Criteria**:

- ✅ Immediate redirect to login page
- ✅ Original URL preserved (redirect after login)
- ❌ Protected content NOT visible
- ❌ Protected page NOT rendered

**Protected Routes**:

- `/dashboard`
- `/settings`
- `/profile`
- Any route requiring authentication

### Contract 2.2: Authenticated User Accesses Protected Routes

**Flow**: Logged-in user can access protected routes

**Steps**:

1. User logs in successfully
2. Navigate to `/dashboard`
3. Verify dashboard content is visible
4. Navigate to `/settings`
5. Verify settings content is visible

**Success Criteria**:

- ✅ No redirect to login
- ✅ Protected content rendered
- ✅ User-specific data shown
- ✅ Navigation between protected routes works

### Contract 2.3: Public Routes Accessible Without Auth

**Flow**: Anyone can access public routes

**Steps**:

1. Ensure user is NOT logged in
2. Navigate to `/` (home)
3. Verify page loads successfully
4. Navigate to `/about` (if exists)
5. Verify page loads successfully

**Success Criteria**:

- ✅ Public pages load without authentication
- ✅ No redirect to login
- ✅ Content is visible

## CRUD Operations (Future)

### Contract 3.1: Create Operation

**Flow**: User creates a new resource

**Steps**:

1. User is authenticated
2. Navigate to create form
3. Fill required fields
4. Submit form
5. Verify resource created
6. Verify redirect to resource list/detail

**Success Criteria**:

- ✅ Form validation works
- ✅ Submit succeeds
- ✅ Resource appears in database
- ✅ User shown success feedback
- ✅ Optimistic UI update (optional)

### Contract 3.2: Read Operation

**Flow**: User views their resources

**Steps**:

1. User is authenticated
2. Navigate to resource list
3. Verify user's resources are displayed
4. Click on resource to view details
5. Verify detail page shows full data

**Success Criteria**:

- ✅ Only user's own resources shown
- ✅ List renders correctly
- ✅ Detail page accessible
- ✅ Data displayed accurately

### Contract 3.3: Update Operation

**Flow**: User updates an existing resource

**Steps**:

1. User is authenticated
2. Navigate to resource detail
3. Click edit button
4. Modify fields
5. Submit changes
6. Verify updates persisted

**Success Criteria**:

- ✅ Edit form pre-populated
- ✅ Validation works
- ✅ Submit succeeds
- ✅ Changes reflected in database
- ✅ Success feedback shown

### Contract 3.4: Delete Operation

**Flow**: User deletes a resource

**Steps**:

1. User is authenticated
2. Navigate to resource
3. Click delete button
4. Confirm deletion (if confirmation dialog)
5. Verify resource removed

**Success Criteria**:

- ✅ Confirmation required
- ✅ Delete succeeds
- ✅ Resource removed from database
- ✅ Resource removed from UI
- ✅ Success feedback shown

## Error Handling

### Contract 4.1: Network Error Handling

**Flow**: Application handles network failures gracefully

**Steps**:

1. Simulate network failure (offline mode)
2. Attempt form submission
3. Verify error message displayed
4. Restore network
5. Retry submission
6. Verify success

**Success Criteria**:

- ✅ User-friendly error message
- ✅ No app crash
- ✅ Retry mechanism available
- ✅ Loading states clear

### Contract 4.2: Validation Error Handling

**Flow**: Form validation errors are displayed

**Steps**:

1. Navigate to form
2. Submit with invalid data
3. Verify validation errors displayed
4. Correct errors
5. Submit successfully

**Success Criteria**:

- ✅ Errors shown inline
- ✅ Specific error messages
- ✅ Submit blocked until valid
- ✅ Error clearing on correction

### Contract 4.3: Server Error Handling

**Flow**: Server errors are handled gracefully

**Steps**:

1. Simulate server error (500)
2. Attempt operation
3. Verify error message displayed
4. Verify app remains functional

**Success Criteria**:

- ✅ Generic error message shown
- ✅ No app crash
- ✅ Navigation still works
- ✅ User can retry

## Testing Checklist

For each user flow:

- [ ] Happy path works end-to-end
- [ ] Error scenarios handled
- [ ] Loading states visible
- [ ] Success feedback shown
- [ ] Data persists correctly
- [ ] Navigation works as expected
- [ ] Mobile responsive (if applicable)
- [ ] Accessibility (keyboard navigation)

## Test Data Management

### Ephemeral Reset Pattern

- Database resets before each test
- Test users created during test setup
- Cleanup automatic on next reset

### Test User Creation

```typescript
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};
```

### Isolation

- Each test creates own data
- No dependencies on other tests
- Parallel execution safe

## Execution Targets

**Local Development**:

- Interactive mode: `pnpm test:e2e --ui`
- Headless: `pnpm test:e2e`

**CI/CD**:

- Parallel execution
- 2 retries on failure
- Screenshots on failure
- Trace on failure

## Critical Paths (Priority Order)

**P0 (Must Test)**:

1. Authentication flows (1.1-1.4)
2. Protected route access (2.1-2.3)

**P1 (Should Test)**: 3. CRUD operations (3.1-3.4) 4. Error handling (4.1-4.3)

**P2 (Nice to Test)**: 5. Advanced user flows 6. Edge cases 7. Performance

## References

- [Playwright Docs](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
