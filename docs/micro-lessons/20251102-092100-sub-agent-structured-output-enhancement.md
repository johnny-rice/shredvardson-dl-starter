---
title: Sub-Agent Structured Output Enhancement Pattern
tags: [sub-agents, structured-output, severity-levels, confidence, testing]
created: 2025-11-02
context: Issue #261 - Enhanced Security Scanner with severity levels and confidence ratings
related: []
---

# Sub-Agent Structured Output Enhancement Pattern

## Problem

When enhancing a sub-agent's output format with structured data (severity levels, confidence ratings, etc.), there's a risk of:

- Breaking existing consumers of the output
- Inconsistent severity/confidence assessment across findings
- Poor user experience if filtering/display logic isn't updated
- Missing validation that new format actually works

## Solution

Follow a 3-phase implementation pattern for sub-agent output enhancements:

### Phase 1: Agent Enhancement (Output Format)

1. Define clear criteria for structured fields (e.g., severity levels with specific thresholds)
2. Update agent prompt with:
   - Field definitions and examples
   - Assessment criteria (when to use each value)
   - Required JSON structure with validation rules
3. Add comprehensive guidelines (40+ examples for severity, confidence criteria)
4. Document reference sources (OWASP, CWE, framework docs)

### Phase 2: Structured Remediation (Content Quality)

1. Enhance remediation format with:
   - Step-by-step descriptions (actionable)
   - Copy-paste ready code examples
   - 2-3 authoritative references per finding
2. Add per-finding metadata (confidence, category, etc.)
3. Include overall assessment (scan confidence level)

### Phase 3: Command Integration (UX)

1. Update consuming commands to:
   - Parse new structured format
   - Add filtering options (e.g., severity threshold)
   - Recalculate summaries after filtering
   - Display new fields in output (confidence levels)
2. Maintain backward compatibility (defaults)
3. Add usage examples to documentation

### Testing Strategy

1. **Unit Test Agent Output:** Invoke sub-agent and verify JSON structure
2. **Integration Test Filtering:** Test each threshold level (high, medium, low)
3. **Validate Display Format:** Verify confidence levels and references appear
4. **Document Test Results:** Create comprehensive test report with artifacts

## Example: Security Scanner Severity Levels

**Phase 1 - Agent Prompt (.claude/agents/security-scanner.md):**

```markdown
### Severity Guidelines

**CRITICAL** - Immediate security compromise

- SQL injection with database access
- Missing RLS policies on sensitive tables
- Production secrets in code
  [... 40+ more specific examples ...]

**Output Format:**
{
"vulnerabilities": [{
"severity": "CRITICAL|HIGH|MEDIUM|LOW",
"confidence": "high|medium|low",
"remediation": {
"description": "Step-by-step fix",
"code": "Copy-paste ready example",
"references": ["url1", "url2", "url3"]
}
}]
}
```

**Phase 2 - Structured Remediation:**

```json
{
  "remediation": {
    "description": "Add INSERT policy restricting users to creating only their own profile records using auth.uid() check.",
    "code": "CREATE POLICY profiles_insert ON profiles FOR INSERT\nWITH CHECK (auth.uid() = user_id);",
    "references": [
      "https://supabase.com/docs/guides/database/postgres/row-level-security",
      "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control"
    ]
  }
}
```

**Phase 3 - Command Filtering (.claude/commands/security/scan.md):**

```markdown
3. **Parse and filter the JSON response:**

   b. **Apply severity filtering** based on threshold:
   - `critical` → Show only CRITICAL
   - `high` → Show CRITICAL + HIGH
   - `medium` → Show CRITICAL + HIGH + MEDIUM (default)
   - `low` → Show all vulnerabilities

   c. Filter vulnerabilities array
   d. Recalculate summary counts

4. **Present findings** with confidence levels per item
```

## Key Insights

1. **Clear criteria prevent inconsistency:** Define 40+ specific examples for each severity level so the AI has concrete patterns to match
2. **Confidence levels add nuance:** Not all HIGH findings are equally certain - confidence helps users prioritize
3. **Structured remediation improves DX:** Code examples + references = faster fixes than text descriptions alone
4. **Filtering enables focus:** Users can run `scan high` for critical-only view without information overload
5. **Test each integration point:** Agent output → Command parsing → Display format → User experience

## When to Use This Pattern

✅ **Use when:**

- Adding severity/priority levels to findings
- Enhancing output with confidence/quality scores
- Adding structured metadata (categories, tags, references)
- Improving remediation guidance with code examples

❌ **Don't use when:**

- Simple boolean flags (use straightforward field addition)
- Breaking changes acceptable (can simplify)
- Output consumed by non-LLM systems (use strict schema validation instead)

## Anti-Patterns to Avoid

1. **Vague severity criteria:** "HIGH severity issues" without specific examples leads to inconsistent classification
2. **Missing filtering logic:** Adding severity field without command filtering = users still see everything
3. **Skipping backward compatibility:** Always maintain defaults for existing usage
4. **No test artifacts:** Create scratch/ reports showing each threshold works correctly
5. **Incomplete remediation:** Description without code examples = users still need to research

## Related Patterns

- **Traceability Metadata:** Ensure spec/plan/task have proper IDs when documenting enhancements
- **Phase-based Implementation:** Break complex features into 3-4 phases with clear deliverables
- **Test-Driven Enhancement:** Write test scenarios before implementing filtering logic

## Implementation Checklist

- [ ] Phase 1: Define field criteria with 40+ examples
- [ ] Phase 1: Update agent prompt with structured output format
- [ ] Phase 2: Add structured remediation (description + code + refs)
- [ ] Phase 2: Include per-finding and overall confidence levels
- [ ] Phase 3: Add filtering/parsing logic to commands
- [ ] Phase 3: Update display format to show new fields
- [ ] Phase 3: Document usage examples in SECURITY.md or similar
- [ ] Testing: Create test report showing all thresholds work
- [ ] Testing: Generate example reports in scratch/
- [ ] Documentation: Update agent and command documentation

## References

- Issue #261: Security Scanner severity levels implementation
- PR #262: Complete implementation example
- `.claude/agents/security-scanner.md`: Comprehensive severity guidelines
- `scratch/issue-261-test-results.md`: Testing methodology

---

**Generated:** 2025-11-02
**Context:** Security Scanner enhancement with severity levels, confidence ratings, and structured remediation
**Impact:** Pattern applicable to all sub-agent output enhancements (Test Generator, Documentation Writer, etc.)
