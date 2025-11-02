---
id: PLAN-20251101-security-scanner-severity
type: plan
title: Add severity levels and actionable feedback format to Security Scanner - Implementation Plan
parentId: SPEC-20251101-security-scanner-severity
spec: specs/security-scanner-severity-levels.md
issue: 261
lane: simple
created: 2025-11-01
status: draft
---

# Add severity levels and actionable feedback format to Security Scanner - Implementation Plan

## Overview

This plan implements structured severity levels and enhanced remediation guidance for the Security Scanner sub-agent. The current implementation already has severity levels in the output format, but lacks:
1. Structured remediation with code examples and references
2. Confidence levels on findings
3. Severity filtering in slash commands
4. Grouped presentation by severity in workflows

The implementation enhances existing functionality rather than building from scratch, making this a focused refactor of output formatting and presentation logic.

## Design Decisions

### Key Technical Decisions

1. **Preserve existing JSON structure** - The Security Scanner agent already outputs severity levels. We'll enhance the remediation field from a simple string to a structured object.

2. **Backward compatibility approach** - Since the agent output structure is changing, we'll:
   - Update the agent prompt to use the new format
   - Update the slash command to handle both formats gracefully (during transition)
   - Update the workflow to parse the new structure

3. **Confidence levels** - Add per-finding confidence (high/medium/low) in addition to the overall scan confidence already present.

4. **Filtering implementation** - Implement severity filtering in the slash command parser, not in the agent (agent returns all findings, command filters for display).

5. **Reference sources** - Include OWASP, CWE, and Supabase docs references where applicable.

## Architecture

### Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    /security:scan Command                    │
│  - Parses scope and severity arguments                       │
│  - Filters findings by severity threshold                    │
│  - Formats output grouped by severity                        │
│  - Saves report to scratch/                                  │
└────────────────┬────────────────────────────────────────────┘
                 │ delegates to
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Security Scanner Sub-Agent                      │
│  - Scans codebase using Read/Glob/Grep                       │
│  - Returns structured JSON with enhanced format:             │
│    {                                                          │
│      findings: [{                                             │
│        severity: "CRITICAL",                                  │
│        category: "...",                                       │
│        title: "...",                                          │
│        location: {...},                                       │
│        evidence: "...",                                       │
│        impact: "...",                                         │
│        remediation: {                    ← ENHANCED          │
│          description: "...",                                  │
│          code: "...",                    ← NEW               │
│          references: [...]               ← NEW               │
│        },                                                     │
│        confidence: "high"                ← NEW               │
│      }],                                                      │
│      summary: {...}                                           │
│    }                                                          │
└────────────────┬────────────────────────────────────────────┘
                 │ consumed by
                 ▼
┌─────────────────────────────────────────────────────────────┐
│           Security Review Workflow (CI/CD)                   │
│  - Parses new JSON format                                    │
│  - Groups findings by severity                               │
│  - Creates GitHub annotations for CRITICAL/HIGH              │
│  - Posts PR comment with severity-grouped findings           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User invokes** `/security:scan [scope] [severity]`
2. **Command parses** arguments, invokes Security Scanner agent
3. **Agent scans** codebase, returns enhanced JSON findings
4. **Command filters** findings by severity threshold
5. **Command formats** output grouped by severity (CRITICAL → LOW)
6. **Command saves** detailed report to `scratch/security-scan-YYYY-MM-DD.md`
7. **User reviews** findings with actionable code examples

## Implementation Phases

### Phase 1: Update Security Scanner Agent (2-3 hours)

**Goal:** Enhance agent prompt to output structured remediation with code examples and references

**Tasks:**

1. Update `.claude/agents/security-scanner.md`:
   - Change `remediation` field from string to structured object
   - Add `confidence` field to each finding
   - Update example findings with code snippets and references
   - Add guidance on providing actionable code examples
   - Define confidence criteria (high/medium/low)

2. Update severity criteria documentation in agent:
   - Expand CRITICAL criteria with specific examples
   - Expand HIGH criteria with specific examples
   - Expand MEDIUM criteria with specific examples
   - Expand LOW criteria with specific examples

3. Add reference source guidelines:
   - OWASP references for web vulnerabilities
   - CWE references for classification
   - Supabase docs for RLS and auth patterns
   - Next.js security best practices

**Deliverables:**

- Updated agent prompt with enhanced output format
- Comprehensive examples showing remediation.code and remediation.references
- Clear confidence level criteria

**Files Modified:**
- `.claude/agents/security-scanner.md`

---

### Phase 2: Update Security Review Workflow (1 hour)

**Goal:** Parse new JSON format and create severity-grouped PR comments with annotations

**Tasks:**

1. Update `.github/workflows/security-review.yml`:
   - Parse enhanced JSON structure (handle remediation object)
   - Group findings by severity (CRITICAL, HIGH, MEDIUM, LOW)
   - Create GitHub annotations for CRITICAL and HIGH findings using `::error` syntax
   - Format PR comment with collapsible sections per severity
   - Include remediation code examples in comments

2. Add workflow summary:
   - Display severity counts in workflow summary
   - Show link to full report artifact

3. Update comment template:
   - Use severity emoji indicators (🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🟢 LOW)
   - Show code examples in remediation
   - Include reference links

**Deliverables:**

- Workflow that parses new JSON format
- PR comments grouped by severity with collapsible sections
- GitHub annotations for high-severity findings
- Workflow summary showing severity breakdown

**Files Modified:**
- `.github/workflows/security-review.yml`

---

### Phase 3: Update Slash Commands (1 hour)

**Goal:** Add severity filtering and improved output formatting to `/security:scan` command

**Tasks:**

1. Update `.claude/commands/security/scan.md`:
   - Implement severity filtering logic (filter findings array after agent returns)
   - Add severity argument parsing (`/security:scan --severity=critical`)
   - Update output format to group findings by severity
   - Add summary section showing counts by severity
   - Save detailed report to `scratch/security-scan-YYYY-MM-DD.md`

2. Enhance presentation format:
   - Use severity emoji indicators
   - Display code examples in remediation sections
   - Include clickable reference links
   - Add collapsible sections for each severity level

3. Update command metadata:
   - Document severity filtering argument
   - Update examples with filtering

**Deliverables:**

- `/security:scan` command with severity filtering
- Enhanced output format grouped by severity
- Saved reports in `scratch/` directory
- Updated command documentation

**Files Modified:**
- `.claude/commands/security/scan.md`

**Example Output:**

```markdown
# Security Scan Report

**Date:** 2025-11-01
**Scope:** Full
**Severity Filter:** medium+

## Summary

- 🔴 **Critical:** 1
- 🟠 **High:** 2
- 🟡 **Medium:** 2
- 🟢 **Low:** 0 (filtered)

<details>
<summary>🔴 CRITICAL (1 finding)</summary>

### Missing RLS policy on profiles table

**Location:** [packages/db/migrations/20250101_profiles.sql:15](path#L15)
**Confidence:** High

**Evidence:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- No INSERT policy defined
```

**Impact:** Authenticated users can create profiles for any user_id, breaking data isolation.

**Remediation:**

Add INSERT policy:
```sql
CREATE POLICY profiles_insert ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**References:**
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

</details>
```

---

### Phase 4: Documentation (30 min)

**Goal:** Document severity criteria, usage examples, and create learning resources

**Tasks:**

1. Update `SECURITY.md`:
   - Document severity criteria with examples
   - Add `/security:scan` usage guide
   - Include sample output showing new format
   - Document confidence levels

2. Create micro-lesson:
   - Create `docs/micro-lessons/YYYYMMDD-HHMMSS-security-scanner-severity-levels.md`
   - Document the enhancement
   - Include before/after examples
   - Tag: `security`, `sub-agents`, `tooling`

3. Update sub-agent documentation (if exists):
   - Document new output format
   - Update integration examples

**Deliverables:**

- Updated `SECURITY.md` with severity criteria
- Micro-lesson documenting the enhancement
- Usage examples and best practices

**Files Modified:**
- `SECURITY.md`

**Files Created:**
- `docs/micro-lessons/YYYYMMDD-HHMMSS-security-scanner-severity-levels.md`

---

## Technical Specifications

### Enhanced Output Format

**Current format:**
```json
{
  "remediation": "Use parameterized queries instead of string concatenation"
}
```

**New format:**
```json
{
  "remediation": {
    "description": "Use parameterized queries instead of string concatenation",
    "code": "const result = await supabase.from('users').select('*').eq('email', email);",
    "references": [
      "https://owasp.org/www-community/attacks/SQL_Injection",
      "https://supabase.com/docs/guides/database/postgres/row-level-security"
    ]
  },
  "confidence": "high"
}
```

### Severity Criteria (from spec)

**CRITICAL** 🔴 (Fix immediately)
- Exploitable vulnerabilities: SQL injection, XSS, CSRF
- Authentication/authorization bypass
- Data exposure potential
- Remote code execution

**HIGH** 🟠 (Fix within 1 sprint)
- Security misconfigurations
- Missing auth checks
- Exposed secrets
- Insufficient input validation

**MEDIUM** 🟡 (Fix within 2-3 sprints)
- Missing error handling
- Information disclosure
- Weak password policies
- Missing rate limiting

**LOW** 🟢 (Address when convenient)
- Code quality issues
- Best practice violations
- Minor improvements

### Confidence Levels

**High** - Finding is definitively a security issue based on clear evidence
- Example: Missing RLS policy on table with RLS enabled
- Example: Hardcoded API key in source code

**Medium** - Finding is likely a security issue but requires context verification
- Example: Potentially unprotected API endpoint (might have middleware)
- Example: Possible XSS vulnerability (depends on sanitization elsewhere)

**Low** - Finding might be a security issue or false positive
- Example: Dynamic query construction (might be safe depending on input source)
- Example: Error messages that might leak information

### API Design

**Slash Command Arguments:**
```bash
/security:scan [scope] [severity]

# Examples:
/security:scan                     # full scope, medium+ severity
/security:scan rls                 # RLS scope, medium+ severity
/security:scan auth critical       # auth scope, critical only
/security:scan api high            # API scope, high+ severity
```

**Agent Input (unchanged):**
```json
{
  "scope": "full" | "auth" | "rls" | "api" | "secrets",
  "focus_areas": ["optional", "specific", "areas"],
  "severity_threshold": "critical" | "high" | "medium" | "low"
}
```

**Agent Output (enhanced):**
```json
{
  "findings": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "category": "rls" | "auth" | "injection" | "xss" | "secrets" | "misc",
      "title": "Brief vulnerability title",
      "location": {
        "file": "path/to/file.ts",
        "line": 42
      },
      "evidence": "Code snippet showing issue",
      "impact": "What could go wrong",
      "remediation": {
        "description": "Step-by-step fix description",
        "code": "Example code showing the fix",
        "references": ["https://...", "https://..."]
      },
      "confidence": "high" | "medium" | "low"
    }
  ],
  "summary": {
    "total": 5,
    "critical": 1,
    "high": 2,
    "medium": 2,
    "low": 0
  },
  "recommendations": ["...", "..."]
}
```

## Testing Strategy

### Manual Testing

**Phase 1 (Agent):**
1. Run `/security:scan rls` and verify output includes:
   - Structured remediation with code examples
   - References to Supabase docs
   - Per-finding confidence levels
2. Check token usage stays under 3K for output
3. Verify all severity levels are properly assigned

**Phase 2 (Workflow):**
1. Create test PR with deliberate security issue
2. Verify workflow parses new JSON format
3. Check PR comment shows severity-grouped findings
4. Verify GitHub annotations appear for CRITICAL/HIGH
5. Confirm workflow summary displays severity counts

**Phase 3 (Command):**
1. Test filtering: `/security:scan api critical`
2. Verify report saved to `scratch/security-scan-YYYY-MM-DD.md`
3. Check output grouped by severity with emoji indicators
4. Verify code examples and references display correctly

**Phase 4 (Documentation):**
1. Review `SECURITY.md` for completeness
2. Validate micro-lesson captures key learnings
3. Check all examples are accurate

### Edge Cases

- **No findings:** Verify empty findings array handled gracefully
- **Mixed confidence levels:** Check low-confidence findings are marked clearly
- **Long code examples:** Ensure formatting doesn't break in PR comments
- **Missing references:** Handle cases where no relevant reference exists
- **Filtering edge cases:**
  - `/security:scan api low` → shows all findings
  - `/security:scan rls critical` → might show empty if no critical RLS issues

## Deployment

### Deployment Steps

1. **Merge to main:**
   - All changes in single PR
   - PR must pass existing CI/CD checks

2. **Verification:**
   - Run `/security:scan` on main branch
   - Verify new format works correctly
   - Check workflow runs successfully on next PR

3. **Rollout:**
   - No infrastructure changes needed
   - No database migrations required
   - Changes take effect immediately upon merge

### Rollback Plan

If issues arise:
1. Revert PR containing changes
2. Security Scanner falls back to previous format
3. Workflow and command continue working with old format

**Low Risk:** Changes are additive (enhancing existing fields), not breaking changes to core functionality.

## Risk Mitigation

### Identified Risks

1. **Agent token usage exceeds 3K limit**
   - Mitigation: Test with large codebases, ensure remediation.code stays concise
   - Fallback: Truncate code examples if needed

2. **Workflow fails to parse new JSON format**
   - Mitigation: Add error handling for missing remediation fields
   - Fallback: Display raw remediation string if parsing fails

3. **False positives with confidence levels**
   - Mitigation: Clear criteria for confidence assignment
   - Fallback: Mark uncertain findings as "low confidence"

4. **Command filtering breaks with invalid severity**
   - Mitigation: Validate severity argument, default to "medium"
   - Fallback: Show all findings if filter invalid

### Monitoring

- Track workflow success rate (should remain 100%)
- Monitor PR comment formatting (manual review)
- Check for issues in GitHub discussions/issues

## Success Criteria

From spec acceptance criteria:

**Phase 1:**
- ✅ Security Scanner agent outputs structured remediation
- ✅ All findings include code examples
- ✅ References included (OWASP, Supabase, etc.)
- ✅ Confidence levels on all findings

**Phase 2:**
- ✅ Workflow parses new JSON format without errors
- ✅ PR comments grouped by severity
- ✅ GitHub annotations for CRITICAL/HIGH findings
- ✅ Workflow summary shows severity counts

**Phase 3:**
- ✅ `/security:scan --severity=X` filters correctly
- ✅ Output grouped by severity with emoji indicators
- ✅ Reports saved to `scratch/` directory
- ✅ Command documentation updated

**Phase 4:**
- ✅ `SECURITY.md` documents severity criteria
- ✅ Micro-lesson created with examples
- ✅ Documentation includes usage examples

**Overall:**
- 90%+ of findings include actionable code examples
- Developers can filter by severity
- Workflow integration works seamlessly

## References

- Spec: [specs/security-scanner-severity-levels.md](specs/security-scanner-severity-levels.md)
- Issue: #261
- Related: #259 - Structured prompt templates
- Related: #257 - Integrate sub-agents into workflow lanes
- Inspiration: [Superclaude](https://github.com/gwendall/superclaude) `src/prompts/review.ts`
- OWASP Risk Rating: https://owasp.org/www-community/OWASP_Risk_Rating_Methodology
- Current Agent: [.claude/agents/security-scanner.md](.claude/agents/security-scanner.md)
- Current Command: [.claude/commands/security/scan.md](.claude/commands/security/scan.md)
- Current Workflow: [.github/workflows/security-review.yml](.github/workflows/security-review.yml)
