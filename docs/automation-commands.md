# Automation Commands

DL Starter provides three automated quality commands that leverage AI sub-agents for efficient, cost-optimized validation:

1. `/security:scan` - Security vulnerability scanning
2. `/accessibility:audit` - WCAG 2.1 AA compliance auditing
3. `/db:migrate` - Database migration workflow automation

These commands use Haiku 4.5 sub-agents where appropriate for 68% cost reduction compared to Sonnet while maintaining high quality results.

---

## `/security:scan`

**Purpose:** Scan codebase for security vulnerabilities using the Security Scanner sub-agent.

### Usage

```bash
# Full security scan (medium+ severity)
/security:scan

# Scan specific scope
/security:scan rls          # RLS policies only
/security:scan auth         # Authentication code
/security:scan api          # API endpoints
/security:scan secrets      # Environment variables & secrets

# Filter by severity
/security:scan full critical   # Critical issues only
/security:scan auth high       # High+ severity in auth code
```

### Scan Areas

1. **RLS Policies** - Validates Supabase Row Level Security
   - Tables have RLS enabled
   - Complete policy coverage (SELECT, INSERT, UPDATE, DELETE)
   - Correct use of `auth.uid()`
   - No policy bypass conditions

2. **OWASP Top 10**
   - SQL injection risks
   - XSS vulnerabilities
   - Broken authentication
   - Sensitive data exposure
   - Missing authorization checks

3. **Secrets Management**
   - Hardcoded API keys
   - Exposed `.env` files
   - Client-side secret exposure
   - Weak credentials

4. **API Security**
   - Unprotected endpoints
   - Missing authentication middleware
   - CORS misconfigurations
   - Rate limiting gaps

### Output

Generates a security report (`scratch/security-scan-YYYY-MM-DD.md`) with:

- **Summary** - Violation counts by severity
- **Critical Issues** - P0 blockers requiring immediate attention
- **High Issues** - P1 problems for next sprint
- **Medium/Low Issues** - Nice-to-haves and recommendations
- **Remediation Steps** - Specific, actionable fix guidance

### Example Output

```markdown
# Security Scan Report

**Date:** 2025-10-18
**Scope:** RLS
**Severity Threshold:** High

## Summary

- **Total:** 2 vulnerabilities
- **Critical:** 0
- **High:** 2
- **Medium:** 0
- **Low:** 0

## High Issues

### 1. RPC function may bypass RLS policies

**Location:** supabase/migrations/20250926T120000_add_query_rpc_function.sql:1

**Impact:** SECURITY DEFINER functions bypass RLS if not properly authorized.

**Remediation:**
```sql
-- Ensure function is SECURITY INVOKER
CREATE OR REPLACE FUNCTION function_name()
RETURNS ...
LANGUAGE plpgsql
SECURITY INVOKER  -- Use caller's privileges
AS $$
BEGIN
  -- Function body
END;
$$;
```
```

### Integration

**CI Workflow:** `.github/workflows/security-scan.yml` (optional)

Can be run automatically on:
- Pull requests
- Pre-deployment gates
- Scheduled audits

**Pre-commit Hook:** Can be added for local validation before commits

---

## `/accessibility:audit`

**Purpose:** Run automated accessibility testing using axe-core to validate WCAG 2.1 AA compliance.

### Usage

```bash
# Full audit (all routes, moderate+ severity)
/accessibility:audit

# Audit specific route
/accessibility:audit /dashboard

# Audit specific component
/accessibility:audit --component Button

# Filter by severity
/accessibility:audit full critical    # Critical issues only
/accessibility:audit / serious        # Serious+ on homepage
```

### Audit Areas

1. **Color Contrast**
   - Text contrast ratios (4.5:1 minimum for AA)
   - UI element contrast (3:1 minimum)
   - Tested in light and dark themes

2. **Keyboard Navigation**
   - All interactive elements keyboard-accessible
   - Visible focus indicators
   - Logical tab order

3. **Screen Reader Compatibility**
   - Semantic HTML usage
   - ARIA labels present and correct
   - Alt text for images
   - Form labels properly associated

4. **WCAG 2.1 AA Compliance**
   - Level A violations (critical accessibility barriers)
   - Level AA violations (required for legal compliance)
   - Best practices

### Output

Generates an accessibility report (`scratch/accessibility-audit-YYYY-MM-DD.md`) with:

- **Summary** - Violation counts and compliance score
- **Critical Issues** - Level A violations (blocking)
- **Serious Issues** - Level AA violations (non-compliant)
- **Moderate/Minor Issues** - Best practices and improvements
- **Remediation Guidance** - Links to WCAG documentation

### Example Output

```markdown
# Accessibility Audit Report

**Date:** 2025-10-18
**Target:** Full
**Severity Threshold:** Moderate

## Summary

- **Total Violations:** 12
- **Critical:** 0
- **Serious:** 3
- **Moderate:** 7
- **Minor:** 2
- **Compliance Score:** 75%

## Serious Issues

### 1. Insufficient color contrast

**Severity:** Serious
**WCAG Criteria:** [1.4.3 Contrast (Minimum) (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)

**Impact:** Users with low vision cannot read text.

**Affected Elements:**
- `.text-muted` in Button.tsx:15 - Contrast ratio 3.2:1 (needs 4.5:1)

**Remediation:**
```css
.text-muted {
  color: #6b7280; /* Gray-500 - contrast ratio 4.6:1 */
}
```

## Compliance Status

- **WCAG 2.1 Level A:** ✅ PASS (0 violations)
- **WCAG 2.1 Level AA:** ❌ FAIL (3 serious violations)
- **Best Practices:** ⚠️ PARTIAL (9 recommendations)

**Overall:** ❌ Not compliant with WCAG 2.1 AA
```

### Integration

**CI Workflow:** `.github/workflows/accessibility-audit.yml`

Runs automatically on:
- Pull requests affecting UI (`apps/web/**`, `packages/ui/**`)
- Manual workflow dispatch
- Pre-deployment gates

**Package Scripts:**

```bash
pnpm a11y:audit              # Full audit
pnpm a11y:audit:critical     # Critical issues only
```

---

## `/db:migrate`

**Purpose:** Streamline Supabase database migration workflow with validation and RLS policy checks.

### Usage

```bash
# Create new migration
/db:migrate create "add_user_preferences"

# Validate pending migrations
/db:migrate validate

# Apply migrations to local database
/db:migrate apply

# Rollback last migration
/db:migrate rollback
```

### Workflow Steps

#### 1. Create Migration

```bash
/db:migrate create "add_user_preferences"
```

- Generates timestamped migration file
- Includes RLS policy template
- Opens file for editing

**Output:**
```
✅ Created migration: supabase/migrations/20251018143000_add_user_preferences.sql

Next steps:
1. Edit the migration file
2. Run: pnpm db:migrate:validate
3. Run: pnpm db:migrate:apply
4. Commit migration file
```

#### 2. Validate Migration

```bash
/db:migrate validate
```

**Validation Checks:**

1. **SQL Syntax** - Parses migration for syntax errors
2. **Breaking Changes** - Detects potentially destructive operations
3. **RLS Policies** - Ensures new tables have RLS enabled
4. **Performance** - Identifies missing indexes, inefficient queries
5. **Security** - Checks SECURITY DEFINER functions, permissions
6. **Supabase Advisors** - Runs automated database health checks

**Output:**

```markdown
# Migration Validation Report

**Date:** 2025-10-18
**Migration:** 20251018143000_add_user_preferences.sql

## Summary

- ✅ SQL syntax valid
- ✅ No breaking changes detected
- ❌ Missing RLS policies on 1 table

## Issues

### Critical: Missing RLS policy on user_preferences table

**Impact:** Table not protected by RLS, allowing unrestricted access.

**Remediation:**
```sql
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_select ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
-- ... (other policies)
```

## Recommendation

❌ DO NOT APPLY - Fix RLS policies first
```

#### 3. Apply Migration

```bash
/db:migrate apply
```

- Validates migration first
- Applies to local database
- Regenerates TypeScript types
- Runs post-migration advisors

**Output:**
```
✅ Migration applied successfully
✅ TypeScript types updated

Next steps:
1. Test changes locally
2. Commit migration and types
3. Push to remote and deploy to staging
```

#### 4. Rollback Migration

```bash
/db:migrate rollback
```

- Warns about data loss
- Requests confirmation
- Reverts last migration
- Regenerates types

### Integration

**CI Workflow:** `.github/workflows/validate-migrations.yml`

Runs automatically on:
- Pull requests affecting migrations (`supabase/migrations/**`)
- Manual workflow dispatch

**Validation Steps:**
1. Start local Supabase instance
2. Run migration validation
3. Check RLS policies
4. Run Supabase advisors
5. Upload validation report

**Package Scripts:**

```bash
pnpm db:migrate:create "migration_name"   # Create
pnpm db:migrate:validate                  # Validate
pnpm db:migrate:apply                     # Apply
pnpm db:migrate:rollback                  # Rollback
```

---

## Cost Optimization

These automation commands use Haiku 4.5 sub-agents where appropriate:

| Command | Model | Cost vs Sonnet |
|---------|-------|----------------|
| `/security:scan` | Haiku 4.5 | 68% cheaper |
| `/accessibility:audit` | Playwright (script) + Haiku analysis | N/A |
| `/db:migrate` | Script-based | N/A |

**Estimated Savings:**
- Security scanning: ~$0.15 → ~$0.05 per scan (67% reduction)
- Total project savings: ~$100/month with regular scanning

---

## Pre-commit Hooks

To run automation commands automatically before committing, add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Run security scan on staged files
if git diff --cached --name-only | grep -qE '\.(ts|tsx|js|jsx|sql)$'; then
  echo "Running security scan..."
  pnpm security:scan || exit 1
fi

# Run accessibility audit on UI changes
if git diff --cached --name-only | grep -qE 'apps/web|packages/ui'; then
  echo "Running accessibility audit..."
  pnpm a11y:audit:critical || exit 1
fi

# Validate migrations if changed
if git diff --cached --name-only | grep -q 'supabase/migrations'; then
  echo "Validating migrations..."
  pnpm db:migrate:validate || exit 1
fi
```

---

## Troubleshooting

### Security Scan Issues

**Problem:** Sub-agent has limited file access

**Solution:** The security-scanner agent only has `Read`, `Glob`, `Grep` tools. Ensure files are accessible and not in `.gitignore`.

**Problem:** False positives in scan

**Solution:** Verify findings manually. The scanner marks confidence as `low`, `medium`, or `high`.

### Accessibility Audit Issues

**Problem:** Dev server not running

**Solution:** The script will fail if the dev server isn't accessible. Ensure `pnpm dev` is running on port 3000.

**Problem:** Timeout waiting for routes

**Solution:** Increase timeout in `scripts/accessibility/run-axe.ts`:

```typescript
await page.goto(`http://localhost:3000${route}`, {
  waitUntil: 'networkidle',
  timeout: 60000, // Increase this value
});
```

### Migration Validation Issues

**Problem:** Supabase not running

**Solution:** Start Supabase manually: `supabase start`

**Problem:** RLS check fails

**Solution:** Add RLS policies to your migration:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... ON table_name FOR SELECT USING (...);
```

---

## Related Documentation

- [Security Scanner Sub-Agent](.claude/agents/security-scanner.md)
- [Testing Guide](docs/testing/TESTING_GUIDE.md)
- [Supabase RLS Micro-Lessons](docs/micro-lessons/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated:** 2025-10-18
**Related Issue:** #158