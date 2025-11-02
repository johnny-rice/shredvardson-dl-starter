# Security Scan Report

**Date:** 2025-11-02
**Scope:** RLS (Row-Level Security)
**Severity Threshold:** Medium (Critical + High + Medium)
**Overall Confidence:** Medium

## Summary

Filtered by severity threshold (Medium+):
- **Total:** 3 vulnerabilities
- **Critical:** 0
- **High:** 1
- **Medium:** 2
- **Low:** 0 (filtered out)

## High Issues

### 1. Unable to verify RLS policies due to tool limitations

**Location:** [supabase/migrations/20250926120000_add_query_rpc_function.sql](supabase/migrations/20250926120000_add_query_rpc_function.sql)
**Confidence:** High

**Impact:** Critical RLS vulnerabilities such as missing policies, weak policy logic, SECURITY DEFINER bypass issues, or tables without RLS enabled cannot be automatically detected. This creates a blind spot in the security posture and requires manual code review.

**Evidence:**

```
File identified but content not accessible:
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/migrations/20250926120000_add_query_rpc_function.sql
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/migrations/20251031000000_optimize_rls_performance.sql
```

Security scanner lacks Read/Agent tools to examine SQL file contents for RLS vulnerabilities

**Remediation:**

Enhance the Security Scanner agent with file reading capabilities (Read, ReadFiles, or BashCommand tools) to enable comprehensive RLS policy analysis. Additionally, implement automated RLS testing using pgTAP as evidenced by test files found in the codebase.

```bash
# Step 1: Grant file reading permissions to Security Scanner agent
# Update .claude/agents/security-scanner.md to include:
# - Read tool for individual files
# - ReadFiles tool for batch file reading
# - BashCommand/bash tool for advanced analysis

# Step 2: Implement pgTAP RLS tests (already present in codebase)
# Run existing tests:
cd /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new
supabase test db

# Step 3: Add pre-commit hook for RLS validation
# .git/hooks/pre-commit:
#!/bin/bash
echo "Running RLS security validation..."
pnpm run security:scan --scope=rls
supabase test db --filter=rls
```

**References:**

- <https://supabase.com/docs/guides/database/postgres/row-level-security>
- <https://pgtap.org/documentation.html>
- <https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control>

## Medium Issues

### 2. RLS testing infrastructure exists but scan verification incomplete

**Location:** [supabase/tests/001-rls-enabled.sql](supabase/tests/001-rls-enabled.sql)
**Confidence:** Medium

**Impact:** Without automated content analysis, developers must manually verify that: (1) All tables have RLS enabled, (2) Complete CRUD policies exist (SELECT, INSERT, UPDATE, DELETE), (3) Policy conditions properly enforce user/team isolation, (4) SECURITY DEFINER functions don't bypass RLS. Manual verification is error-prone and time-consuming.

**Evidence:**

```
RLS-related files found:
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/tests/001-rls-enabled.sql
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/tests/002-user-isolation.sql
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/tests/003-rls-optimization.sql
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/templates/table-with-team-rls.sql
- /Users/jonte/Dropbox/- Dissonance Labs/dl-starter-new/supabase/templates/table-with-user-rls.sql
```

RLS testing framework is in place but requires manual verification

**Remediation:**

Run the existing pgTAP RLS tests to verify current RLS implementation. Review test results for failures. Ensure CI/CD pipeline runs these tests automatically on every migration change.

```bash
# Run all RLS tests
supabase test db

# Run specific RLS test files
supabase test db --filter=001-rls-enabled
supabase test db --filter=002-user-isolation
supabase test db --filter=003-rls-optimization

# Add to CI/CD pipeline (.github/workflows/test.yml):
- name: Run RLS Security Tests
  run: |
    cd supabase
    supabase test db --filter=rls
    if [ $? -ne 0 ]; then
      echo "RLS security tests failed"
      exit 1
    fi
```

**References:**

- <https://supabase.com/docs/guides/cli/testing>
- <https://supabase.com/docs/guides/database/postgres/row-level-security>
- <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html>

### 3. RPC function may bypass RLS policies

**Location:** [supabase/migrations/20250926120000_add_query_rpc_function.sql](supabase/migrations/20250926120000_add_query_rpc_function.sql)
**Confidence:** Medium

**Impact:** If the RPC function uses SECURITY DEFINER and doesn't implement manual authorization checks (e.g., auth.uid() validation), it could allow users to query data they shouldn't access, breaking tenant isolation and exposing sensitive information.

**Evidence:**

```sql
-- File: 20250926120000_add_query_rpc_function.sql
-- Content not accessible for analysis
-- Common vulnerability pattern:
CREATE OR REPLACE FUNCTION query_data()
RETURNS TABLE(...) AS $$
BEGIN
  -- If SECURITY DEFINER is used, RLS is bypassed
  RETURN QUERY SELECT * FROM sensitive_table;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- DANGEROUS!
```

RPC functions with SECURITY DEFINER execute with creator privileges, bypassing RLS

**Remediation:**

Review the RPC function in the migration file. Ensure it either: (1) Uses SECURITY INVOKER (default, respects RLS), or (2) If SECURITY DEFINER is required, implements explicit authorization checks using auth.uid() or similar. Add pgTAP tests to verify the function respects data isolation.

```sql
-- RECOMMENDED: Use SECURITY INVOKER (respects RLS)
CREATE OR REPLACE FUNCTION query_data()
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY SELECT * FROM sensitive_table;
  -- RLS policies automatically enforced
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- IF SECURITY DEFINER REQUIRED: Add explicit auth checks
CREATE OR REPLACE FUNCTION admin_query_data()
RETURNS TABLE(...) AS $$
BEGIN
  -- Manual authorization check
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY SELECT * FROM sensitive_table;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**References:**

- <https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY>
- <https://supabase.com/docs/guides/database/postgres/custom-functions>
- <https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control>
- <https://cwe.mitre.org/data/definitions/862.html>

## Recommendations

- CRITICAL: Enhance Security Scanner agent with file reading capabilities (Read, ReadFiles, BashCommand tools) to enable comprehensive RLS policy analysis
- Run existing pgTAP RLS tests immediately: 'supabase test db --filter=rls' to verify current RLS implementation
- Integrate RLS security tests into CI/CD pipeline to catch policy gaps before deployment
- Manually review 20250926120000_add_query_rpc_function.sql to ensure SECURITY DEFINER (if used) includes proper authorization checks
- Document RLS policy patterns and ensure all new tables use templates: table-with-user-rls.sql or table-with-team-rls.sql
- Consider implementing a pre-commit hook that validates SQL migrations contain RLS policies for any new tables
- Review RLS documentation files to ensure team follows best practices: docs/database/rls-implementation.md, docs/database/RLS_OPTIMIZATION.md

---

**Note:** 1 LOW severity finding was filtered out based on the "medium" threshold. Run `/security:scan rls low` to see all findings including LOW severity issues.
