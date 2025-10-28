---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/security:scan'
version: '1.0.0'
lane: 'lightweight'
tags: ['security', 'scanning', 'vulnerabilities', 'rls']
when_to_use: >
  Scan codebase for security vulnerabilities including RLS policies, auth issues, and OWASP Top 10.

arguments:
  - name: scope
    type: string
    required: false
    example: 'rls | auth | api | secrets | full'
  - name: severity
    type: string
    required: false
    example: 'critical | high | medium | low'

inputs: []
outputs:
  - type: 'report'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#/commandDefaults'

allowed-tools:
  - 'Task(Security Scanner)'
  - 'Read(*)'
  - 'Glob(*)'
  - 'Grep(*)'

preconditions: []
postconditions:
  - 'Security report generated'
  - 'Vulnerabilities categorized by severity'

artifacts:
  produces:
    - { path: 'scratch/security-scan-*.md', purpose: 'Security scan report' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read']

timeouts:
  softSeconds: 45
  hardSeconds: 90

idempotent: true
dryRun: false
estimatedRuntimeSec: 30
costHints: 'Read-only; uses Haiku sub-agent for token isolation'

references:
  - 'docs/constitution.md#security-constraints'
  - 'SECURITY.md'
  - '.claude/agents/security-scanner.md'
---

# /security:scan

**Goal:**
Scan codebase for security vulnerabilities using isolated Security Scanner context, focusing on defensive security only.

**Prompt:**

1. Parse scope and severity arguments (defaults: scope=full, severity=medium).

2. **Delegate to Security Scanner sub-agent:**

   Invoke the Task tool to delegate scanning to the Security Scanner sub-agent.

   **Placeholder substitution:**
   - `[scope]` → Replace with parsed scope argument or default to "full"
   - `[severity]` → Replace with parsed severity argument or default to "medium"

   **Scope → Focus Areas Mapping (runtime logic):**

   Dynamically populate `focus_areas` based on the parsed `scope` argument:

   - `"rls"` → `["rls", "policies", "row_security"]`
   - `"auth"` → `["auth", "session", "authentication", "authorization"]`
   - `"api"` → `["routes", "endpoints", "api", "request_handling"]`
   - `"secrets"` → `["env", "credentials", "keys", "tokens"]`
   - `"full"` → `["rls", "auth", "api", "secrets"]`

   **Example Task invocation:**

   ```python
   Task(
     subagent_type="Security Scanner",
     description="Scanning [scope] for [severity]+ vulnerabilities",
     prompt='''
     Scan the codebase for security vulnerabilities with the following parameters:

     {
       "scope": "rls",
       "focus_areas": ["rls", "policies", "row_security"],
       "severity_threshold": "high"
     }

     Analyze all code related to the focus areas and identify vulnerabilities at or above the severity threshold.
     Return findings as a structured JSON response with vulnerabilities, summary, recommendations, and confidence level.
     '''
   )
   ```

   Wait for the sub-agent to complete scanning and return the JSON response.

3. **Parse and present the JSON response** containing:
   - `vulnerabilities`: Array of vulnerability objects with severity, category, location, evidence, impact, remediation
   - `summary`: Counts by severity (total, critical, high, medium, low)
   - `recommendations`: High-level security improvements
   - `confidence`: "high" | "medium" | "low"

4. **Present findings** organized by severity with actionable remediation steps.

5. **Save report** to `scratch/security-scan-YYYY-MM-DD.md` for future reference.

6. **Suggest next steps** based on findings (e.g., address critical issues immediately, schedule high-priority issues).

**Examples:**

- `/security:scan` → scans entire codebase for medium+ severity issues
- `/security:scan rls` → scans only RLS policies
- `/security:scan auth critical` → scans auth code for critical issues only
- `/security:scan api high` → scans API endpoints for high+ severity issues

**Output Format:**

Present findings clearly:

````markdown
# Security Scan Report

**Date:** YYYY-MM-DD
**Scope:** Full/Auth/RLS/API/Secrets
**Severity Threshold:** Critical/High/Medium/Low

## Summary

- **Total:** 5 vulnerabilities
- **Critical:** 1
- **High:** 2
- **Medium:** 2
- **Low:** 0

## Critical Issues

### 1. Missing RLS policy on profiles table

**Location:** [packages/db/migrations/20250101_profiles.sql:15](path#L15)

**Impact:** Authenticated users can create profiles for any user_id, breaking data isolation.

**Evidence:**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- No INSERT policy defined
```
````

**Remediation:**

```sql
CREATE POLICY profiles_insert ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## High Issues

### 2. Unprotected API endpoint

...

## Recommendations

- Fix critical issues immediately (1 issue)
- Address high severity issues in next sprint (2 issues)
- Consider implementing automated security scanning in CI/CD

**Confidence:** High/Medium/Low

```markdown
**Failure & Recovery:**

- If no issues found → Document clean security status
- If scope too large → Scanner prioritizes RLS, API routes, auth logic
- If uncertain → Scanner marks confidence as low/medium

**Important:**

This is a **defensive security tool only**. It will:

- ✅ Detect vulnerabilities and provide remediation
- ✅ Analyze authentication/authorization logic
- ✅ Review RLS policies for completeness
- ❌ NOT assist with credential harvesting
- ❌ NOT provide offensive security techniques
```
