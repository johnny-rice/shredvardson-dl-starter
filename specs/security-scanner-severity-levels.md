---
id: SPEC-20251101-security-scanner-severity
title: Add severity levels and actionable feedback format to Security Scanner
type: spec
priority: p2
status: ready
lane: simple
issue: 261
created: 2025-11-01
plan: plans/security-scanner-severity-levels.md
tasks: tasks/security-scanner-severity-levels.md
---

# Add severity levels and actionable feedback format to Security Scanner

## Summary

Enhance the Security Scanner sub-agent to return structured findings with severity levels (CRITICAL, HIGH, MEDIUM, LOW) and actionable remediation including code examples and references, enabling better prioritization and faster fixes.

## Problem Statement

Our Security Scanner sub-agent currently returns findings without clear structure, making it difficult to prioritize fixes and take action. Specifically:

- **No severity levels** - Developers cannot distinguish between critical vulnerabilities requiring immediate attention and minor improvements
- **Lack of actionable remediation** - Findings identify problems but don't provide concrete code examples or references
- **No standard output format** - Inconsistent structure across scans makes automation difficult
- **Cannot filter by severity** - Workflows cannot focus on high-priority issues
- **Unclear prioritization** - No clear distinction between critical vs nice-to-have issues

Current output is a simple list of vulnerabilities without context or guidance, requiring developers to research solutions independently.

## Proposed Solution

Implement a structured findings format with four severity levels and comprehensive remediation guidance:

**Severity Levels:**

- **CRITICAL** 🔴 - Exploitable vulnerabilities requiring immediate fixes
- **HIGH** 🟠 - Security misconfigurations to fix within 1 sprint
- **MEDIUM** 🟡 - Issues to address within 2-3 sprints
- **LOW** 🟢 - Best practice violations to address when convenient

**Structured Output Format:**

```json
{
  "findings": [
    {
      "severity": "CRITICAL",
      "category": "SQL Injection",
      "title": "SQL injection vulnerability in authentication",
      "location": {
        "file": "packages/auth/src/login.ts",
        "line": 42
      },
      "evidence": "Direct string concatenation in SQL query",
      "impact": "Attacker can bypass authentication",
      "remediation": {
        "description": "Use parameterized queries",
        "code": "const result = await supabase.from('users').select('*').eq('email', email);",
        "references": ["https://owasp.org/..."]
      },
      "confidence": "high"
    }
  ],
  "summary": {
    "total": 1,
    "critical": 1,
    "high": 0,
    "medium": 0,
    "low": 0
  }
}
```

## Acceptance Criteria

### Phase 1: Update Security Scanner Agent (2-3 hours)

- [ ] Update `.claude/agents/security-scanner.md` with severity definitions
- [ ] Add structured output format to agent prompt
- [ ] Define severity criteria for CRITICAL, HIGH, MEDIUM, LOW
- [ ] Add confidence levels to findings (high, medium, low)
- [ ] Include remediation section with description, code examples, and references

### Phase 2: Update Security Review Workflow (1 hour)

- [ ] Update `.github/workflows/security-review.yml` to parse new JSON format
- [ ] Add PR comments grouped by severity level
- [ ] Add workflow summary displaying severity counts
- [ ] Add GitHub annotations for CRITICAL and HIGH findings

### Phase 3: Update Slash Commands (1 hour)

- [ ] Update `/security:scan` command to display findings by severity
- [ ] Add severity filtering: `/security:scan --severity=critical`
- [ ] Add summary output format showing counts by severity
- [ ] Save detailed reports to `scratch/security-scan-YYYY-MM-DD.md`

### Phase 4: Documentation (30 min)

- [ ] Document severity criteria in `SECURITY.md`
- [ ] Add usage examples to security documentation
- [ ] Create micro-lesson on Security Scanner usage patterns
- [ ] Update sub-agent documentation with new output format

## Technical Constraints

- Must maintain backward compatibility with existing security scans (provide migration path if needed)
- JSON output must be parseable by GitHub Actions workflows
- Severity levels must align with industry standards (OWASP, CVSS)
- Code examples in remediation must be tested and secure
- Agent prompt changes must not exceed token limits
- Filtering must work with existing `/security:scan` command structure

## Success Metrics

- Security Scanner returns structured findings with all required fields
- Developers can filter findings by severity level
- PR comments display findings grouped by severity
- 90%+ of findings include actionable code examples
- Workflow annotations appear for CRITICAL and HIGH findings
- Security documentation includes severity criteria and examples

## Severity Criteria Reference

**CRITICAL 🔴** (Fix immediately)

- Exploitable vulnerabilities: SQL injection, XSS, CSRF
- Authentication/authorization bypass
- Data exposure potential
- Remote code execution

**HIGH 🟠** (Fix within 1 sprint)

- Security misconfigurations
- Missing auth checks
- Exposed secrets
- Insufficient input validation

**MEDIUM 🟡** (Fix within 2-3 sprints)

- Missing error handling
- Information disclosure
- Weak password policies
- Missing rate limiting

**LOW 🟢** (Address when convenient)

- Code quality issues
- Best practice violations
- Minor improvements

## Out of Scope

- Automated vulnerability scanning (focus is on output format only)
- Integration with external security tools (Snyk, SonarQube, etc.)
- Automated fixing of security issues
- Historical trending of security findings
- Custom severity level definitions (using standard 4-level system)

## References

- Issue #261: https://github.com/[org]/[repo]/issues/261
- Related: #259 - Structured prompt templates
- Related: #257 - Integrate sub-agents into workflow lanes
- Inspiration: [Superclaude](https://github.com/gwendall/superclaude) `src/prompts/review.ts`
- OWASP Risk Rating: https://owasp.org/www-community/OWASP_Risk_Rating_Methodology
- Workflow: `.github/workflows/security-review.yml`
- Agent: `.claude/agents/security-scanner.md`
