# Security Policy

## Reporting a Vulnerability

**Contact:** security@yourdomain.tld

### Encrypted Reporting (Recommended)

For sensitive security issues, please use PGP encryption:

- **PGP Key:** [Link to your public key or paste key block here]
- **Key ID:** [Your key ID]
- **Instructions:** Encrypt your report with our public key and email the encrypted message

### Disclosure Timeline

- **Initial Response:** We triage reports within 72 hours
- **Status Updates:** Every 7 days during investigation
- **Coordinated Disclosure:** We follow a 90-day coordinated disclosure window
- **Public Disclosure:** Only after fixes are deployed or the disclosure window expires

Please do not publicly disclose vulnerabilities until we have released a fix or the disclosure window has closed.

## In Scope

Security vulnerabilities in:

- Authentication and authorization systems
- Payment processing and PCI compliance
- Secrets management and environment handling
- CI/CD pipeline security
- Data validation and injection vulnerabilities
- This repository's published artifacts and dependencies

## Out of Scope

The following issues are typically **not considered security vulnerabilities**:

- Missing security headers on non-sensitive pages
- Self-XSS that requires significant user interaction
- Issues in third-party dependencies (please report directly to maintainers)
- Social engineering attacks
- Physical security issues
- Issues requiring admin/privileged access that is intended
- Rate limiting on non-authentication endpoints
- Missing HTTPS on localhost/development environments

## Security Best Practices

When developing with this starter:

- Never commit secrets or API keys to version control
- Use environment variables for all sensitive configuration
- Keep dependencies updated with `pnpm audit` and `pnpm update`
- Enable 2FA on all deployment platforms
- Review security headers in production deployments

## Security Scanner

This repository includes an automated security scanner accessible via the `/security:scan` command.

### Usage

```bash
# Scan entire codebase for medium+ severity issues (default)
/security:scan

# Scan specific scope
/security:scan rls          # Only Row-Level Security policies
/security:scan auth         # Only authentication/authorization
/security:scan api          # Only API endpoints
/security:scan secrets      # Only secrets and credentials

# Filter by severity threshold
/security:scan rls critical  # Only critical issues
/security:scan auth high     # Critical + high issues
/security:scan api medium    # Critical + high + medium (default)
/security:scan full low      # All severity levels
```

### Severity Levels

- **CRITICAL**: Immediate security compromise, data breach, or system takeover
  - Examples: SQL injection, missing RLS policies, hardcoded production secrets
- **HIGH**: Significant security risk requiring immediate attention
  - Examples: Unprotected API endpoints, stored XSS, weak cryptography
- **MEDIUM**: Moderate security risk requiring remediation
  - Examples: Missing CSRF protection, insecure session config, information disclosure
- **LOW**: Security best practice violations
  - Examples: Missing security headers, verbose error messages

### Report Features

Each finding includes:

- **Severity level** and **category** for quick prioritization
- **Confidence level** (high/medium/low) indicating certainty of the finding
- **File location** with line numbers for easy navigation
- **Evidence** showing the problematic code
- **Impact** assessment explaining the risk
- **Remediation** with copy-paste ready code examples
- **References** to OWASP, CWE, and framework documentation

### Example Output

```markdown
### Missing RLS policy on profiles table

**Location:** [packages/db/migrations/20250101_profiles.sql:15](path#L15)
**Confidence:** High

**Impact:** Authenticated users can create profiles for any user_id, breaking data isolation.

**Remediation:**

CREATE POLICY profiles_insert ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

**References:**

- <https://supabase.com/docs/guides/database/postgres/row-level-security>
- <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
```

### Integration with CI/CD

Consider adding automated security scans to your CI pipeline to catch issues early:

1. Run scans on all pull requests
2. Block merges if critical vulnerabilities are found
3. Track security debt with issue creation for medium/low findings

For more details, see [`.claude/commands/security/scan.md`](.claude/commands/security/scan.md)
