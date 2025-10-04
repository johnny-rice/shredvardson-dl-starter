---
UsedBy: 0
Severity: high
# Severity: high - Prevents RLS tests from silently passing when they should fail
---

# Supabase RLS Testing Requires Real JWT Sessions Not Custom Headers

**Context.** When testing Row Level Security (RLS) policies in Supabase, developers often try to impersonate users by adding custom headers like `X-Test-User-Id`. This approach fails silently because Supabase RLS reads `auth.uid()` from JWT claims, not custom headers.

**Rule.** **Use the Admin API to generate real JWT sessions via `auth.admin.generateLink()` and `setSession()` for RLS testing—custom headers are ignored.**

**Example.**

```typescript
// ❌ WRONG: Custom headers don't work with RLS
export function createTestUser(userId: string) {
  return createClient(url, anonKey, {
    global: {
      headers: { 'X-Test-User-Id': userId }, // Ignored by RLS!
    },
  });
}

// ✅ CORRECT: Generate real JWT session
export async function createTestUserClient(userId: string) {
  const adminClient = createAdminClient();

  // Generate JWT for test user
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: `test-${userId}@example.com`,
    options: { data: { user_id: userId } },
  });

  if (error) throw error;

  // Create client and set session
  const testClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  if (data.properties?.access_token) {
    await testClient.auth.setSession({
      access_token: data.properties.access_token,
      refresh_token: data.properties.refresh_token || '',
    });
  }

  return testClient;
}
```

**Guardrails.**

- Always use `auth.admin.generateLink()` + `setSession()` for RLS test clients
- Verify RLS policies by checking actual database results, not just request success
- Use `persistSession: false` in test clients to avoid session leakage between tests

**Tags.** supabase,rls,testing,jwt,auth,row-level-security,test-infrastructure,sessions
