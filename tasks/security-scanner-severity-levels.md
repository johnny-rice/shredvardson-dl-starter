---
id: TASK-20251101-security-scanner-severity
type: task
title: Add severity levels and actionable feedback format to Security Scanner - Task Breakdown
parentId: PLAN-20251101-security-scanner-severity
spec: specs/security-scanner-severity-levels.md
plan: plans/security-scanner-severity-levels.md
issue: 261
created: 2025-11-01
status: ready
total_estimate: 6h
---

# Add severity levels and actionable feedback format to Security Scanner - Task Breakdown

## Summary

**Total Estimated Effort:** 6 hours
**Number of Tasks:** 11
**High-Risk Tasks:** 1 (workflow parsing)

## Task List

### Task 1: Update agent output format structure

**ID:** T1
**Priority:** p0
**Estimate:** 1h
**Dependencies:** None
**Risk:** low

**Description:**
Update `.claude/agents/security-scanner.md` to change the `remediation` field from a simple string to a structured object containing `description`, `code`, and `references` fields. Update all example findings in the agent prompt to demonstrate the new format.

**Acceptance Criteria:**

- [ ] `remediation` field changed from string to object with three sub-fields
- [ ] All 5 example findings (RLS, auth, SQL injection, secrets, XSS) updated with new format
- [ ] Each example includes concrete code snippets in `remediation.code`
- [ ] Each example includes 2-3 relevant references in `remediation.references`
- [ ] Agent prompt validates this is the required output format

**Notes:**

- Keep code examples concise (2-5 lines max) to avoid token bloat
- Prioritize OWASP, Supabase docs, and CWE references
- Ensure examples are copy-paste ready for developers

---

### Task 2: Add per-finding confidence levels

**ID:** T2
**Priority:** p0
**Estimate:** 30min
**Dependencies:** T1
**Risk:** low

**Description:**
Add `confidence` field to each finding in the agent output format. Define clear criteria for high/medium/low confidence levels and update the agent prompt with guidance on assigning confidence based on evidence quality.

**Acceptance Criteria:**

- [ ] `confidence` field added to output format (high/medium/low)
- [ ] Confidence criteria documented in agent prompt
- [ ] All example findings include appropriate confidence levels
- [ ] Guidance provided on when to use each confidence level

**Notes:**

- High: Clear evidence, no context needed (e.g., missing RLS policy)
- Medium: Likely issue, needs verification (e.g., potentially unprotected endpoint)
- Low: Might be false positive (e.g., dynamic queries that might be safe)

---

### Task 3: Expand severity criteria with specific examples

**ID:** T3
**Priority:** p1
**Estimate:** 30min
**Dependencies:** T1
**Risk:** low

**Description:**
Enhance the severity criteria section in `.claude/agents/security-scanner.md` with comprehensive, specific examples for each severity level (CRITICAL, HIGH, MEDIUM, LOW) to guide the agent in accurate severity assignment.

**Acceptance Criteria:**

- [ ] CRITICAL severity has 5+ specific vulnerability types listed
- [ ] HIGH severity has 5+ specific vulnerability types listed
- [ ] MEDIUM severity has 5+ specific vulnerability types listed
- [ ] LOW severity has 3+ specific vulnerability types listed
- [ ] Each severity level includes concrete code examples

**Notes:**

- Align with OWASP Top 10 and CVSS standards
- Include Supabase-specific issues (RLS policies, auth checks)
- Provide context on why each example maps to that severity

---

### Task 4: Add reference source guidelines

**ID:** T4
**Priority:** p1
**Estimate:** 30min
**Dependencies:** T1
**Risk:** low

**Description:**
Document guidelines in the agent prompt for selecting appropriate security references. Create a curated list of reference sources (OWASP, CWE, Supabase docs, Next.js security) and provide examples of when to use each.

**Acceptance Criteria:**

- [ ] Reference source guidelines section added to agent prompt
- [ ] Curated list of 10-15 common reference URLs included
- [ ] Mapping provided: vulnerability category → recommended reference sources
- [ ] Examples show when to use OWASP vs CWE vs Supabase docs

**Notes:**

- Include direct links to OWASP Top 10, CWE categories, Supabase RLS guide
- Prioritize actionable docs over academic papers
- Include Next.js security best practices for frontend issues

---

### Task 5: Test agent output with sample scan

**ID:** T5
**Priority:** p0
**Estimate:** 30min
**Dependencies:** T1, T2, T3, T4
**Risk:** low

**Description:**
Run `/security:scan rls` on the current codebase to validate the agent produces the new enhanced output format. Verify all findings include structured remediation, code examples, references, and confidence levels. Check token usage stays under 3K limit.

**Acceptance Criteria:**

- [ ] Agent successfully returns JSON with new format
- [ ] All findings include remediation.description, remediation.code, remediation.references
- [ ] All findings include confidence field
- [ ] Output token count < 3000 tokens
- [ ] No JSON parsing errors

**Notes:**

- If token usage is high, identify which sections to make more concise
- Save sample output for reference when updating command/workflow
- Document any edge cases or unexpected behavior

---

### Task 6: Update workflow JSON parsing logic

**ID:** T6
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T5
**Risk:** high

**Description:**
Update `.github/workflows/security-review.yml` to parse the new enhanced JSON structure. Add error handling for backward compatibility and extract remediation.code and remediation.references from the structured object. Test parsing with sample output from T5.

**Acceptance Criteria:**

- [ ] Workflow parses remediation as structured object (not string)
- [ ] Workflow extracts description, code, and references separately
- [ ] Error handling added for missing fields (backward compatibility)
- [ ] Workflow handles both old format (string) and new format (object)
- [ ] No workflow syntax errors

**Notes:**

- Use `jq` for JSON parsing in bash
- Add fallback: if remediation is string, display as-is
- Test locally with sample JSON before committing

---

### Task 7: Add severity-grouped PR comments

**ID:** T7
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T6
**Risk:** medium

**Description:**
Update the workflow PR comment template to group findings by severity (CRITICAL, HIGH, MEDIUM, LOW) with collapsible sections. Include code examples from remediation.code and clickable reference links. Add emoji indicators for each severity level.

**Acceptance Criteria:**

- [ ] PR comment uses `<details>` tags for collapsible sections per severity
- [ ] Emoji indicators used (🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🟢 LOW)
- [ ] Code examples displayed in markdown code blocks
- [ ] References displayed as clickable links
- [ ] Summary section shows counts by severity

**Notes:**

- Ensure markdown rendering works in GitHub PR comments
- Test with multi-line code examples
- Keep comment size reasonable (collapse LOW findings by default)

---

### Task 8: Add GitHub annotations for CRITICAL/HIGH findings

**ID:** T8
**Priority:** p1
**Estimate:** 30min
**Dependencies:** T6
**Risk:** low

**Description:**
Add GitHub workflow annotations using `::error` syntax for all CRITICAL and HIGH severity findings. Include file, line number, title, and impact in the annotation message.

**Acceptance Criteria:**

- [ ] Annotations created for CRITICAL findings using `::error`
- [ ] Annotations created for HIGH findings using `::error`
- [ ] Annotations include file path and line number
- [ ] Annotations include vulnerability title and impact
- [ ] Annotations appear in GitHub PR "Files changed" view

**Notes:**

- Format: `::error file={file},line={line}::{title} - {impact}`
- Test that annotations appear correctly in PR UI
- Ensure annotations don't exceed GitHub's limits (max 10 annotations)

---

### Task 9: Implement severity filtering in /security:scan command

**ID:** T9
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T5
**Risk:** low

**Description:**
Update `.claude/commands/security/scan.md` to parse severity argument and filter findings after receiving agent output. Implement filtering logic: critical (show CRITICAL only), high (show CRITICAL + HIGH), medium (show CRITICAL + HIGH + MEDIUM), low (show all).

**Acceptance Criteria:**

- [ ] Severity argument parsing implemented (critical/high/medium/low)
- [ ] Filtering logic correctly filters findings array
- [ ] Default severity is "medium" if not specified
- [ ] Invalid severity values default to "medium" with warning
- [ ] Filtered findings correctly grouped in output

**Notes:**

- Filter AFTER agent returns results (agent always scans everything)
- `/security:scan api critical` → only show CRITICAL findings
- `/security:scan rls high` → show CRITICAL + HIGH findings
- Document filtering behavior in command metadata

---

### Task 10: Update command output format with severity grouping

**ID:** T10
**Priority:** p0
**Estimate:** 30min
**Dependencies:** T9
**Risk:** low

**Description:**
Update the output presentation in `/security:scan` command to group findings by severity with collapsible sections, emoji indicators, code examples, and reference links. Save detailed report to `scratch/security-scan-{date}.md`.

**Acceptance Criteria:**

- [ ] Output grouped by severity (CRITICAL → LOW)
- [ ] Emoji indicators used for each severity
- [ ] Code examples displayed from remediation.code
- [ ] References displayed as clickable links
- [ ] Summary section shows counts by severity
- [ ] Report saved to `scratch/security-scan-YYYY-MM-DD.md`

**Notes:**

- Use markdown collapsible sections `<details>` for readability
- Include confidence level in each finding
- Format matches workflow PR comment style for consistency

---

### Task 11: Create documentation and micro-lesson

**ID:** T11
**Priority:** p1
**Estimate:** 30min
**Dependencies:** T1, T2, T3, T4, T9, T10
**Risk:** low

**Description:**
Update `SECURITY.md` with severity criteria, confidence levels, and usage examples. Create micro-lesson documenting the Security Scanner enhancement with before/after examples.

**Acceptance Criteria:**

- [ ] `SECURITY.md` updated with severity criteria table
- [ ] `SECURITY.md` includes confidence level definitions
- [ ] `SECURITY.md` includes `/security:scan` usage examples
- [ ] Micro-lesson created at `docs/micro-lessons/{timestamp}-security-scanner-severity-levels.md`
- [ ] Micro-lesson includes before/after output examples
- [ ] Micro-lesson tagged with: security, sub-agents, tooling

**Notes:**

- Include copy-paste ready command examples
- Show sample output demonstrating new format
- Link to OWASP and Supabase security docs
- Capture key design decisions in micro-lesson

---

## Implementation Order

### Phase 1: Agent Enhancement (2.5 hours)

**Depends on:** None

- T1: Update agent output format structure (1h)
- T2: Add per-finding confidence levels (30min)
- T3: Expand severity criteria with specific examples (30min)
- T4: Add reference source guidelines (30min)
- T5: Test agent output with sample scan (30min)

**Deliverable:** Enhanced Security Scanner agent with structured remediation

---

### Phase 2: Workflow Integration (1.5 hours)

**Depends on:** Phase 1

- T6: Update workflow JSON parsing logic (1h)
- T7: Add severity-grouped PR comments (1h) _(can run parallel with T8)_
- T8: Add GitHub annotations for CRITICAL/HIGH findings (30min) _(can run parallel with T7)_

**Deliverable:** CI/CD workflow that displays structured findings in PRs

---

### Phase 3: Command Enhancement (1.5 hours)

**Depends on:** Phase 1

- T9: Implement severity filtering in /security:scan command (1h)
- T10: Update command output format with severity grouping (30min)

**Deliverable:** Enhanced `/security:scan` command with filtering

---

### Phase 4: Documentation (30 min)

**Depends on:** Phase 1, 2, 3

- T11: Create documentation and micro-lesson (30min)

**Deliverable:** Updated security documentation and learning resources

---

## Risk Mitigation

### High-Risk Tasks

**T6: Update workflow JSON parsing logic**

- **Risk:** Workflow could fail if JSON parsing breaks
- **Mitigation:**
  - Test parsing logic locally with sample JSON before committing
  - Add backward compatibility for old format (string remediation)
  - Add error handling with fallback to raw string display
  - Validate with multiple sample outputs
- **Rollback:** Revert to previous workflow version if parsing fails

### Medium-Risk Tasks

**T7: Add severity-grouped PR comments**

- **Risk:** Markdown rendering might break with complex code examples
- **Mitigation:**
  - Test comment rendering in test PR
  - Escape special characters in code blocks
  - Limit comment size (collapse sections if needed)
  - Validate markdown syntax before posting

### Dependencies

**Critical Path:**
Phase 1 → Phase 2/3 → Phase 4

- Phase 1 must complete before Phase 2 and 3 (they depend on new agent output)
- Phase 2 and 3 can run in parallel (independent implementations)
- Phase 4 requires all phases to document final behavior

**Potential Bottlenecks:**

- T5 (testing) might reveal issues requiring T1-T4 rework
- T6 (workflow parsing) is on critical path for Phase 2
- T9 (command filtering) is on critical path for Phase 3

**Parallelization Opportunities:**

- T7 and T8 can run in parallel (both enhance workflow)
- Phase 2 and Phase 3 can run in parallel (workflow and command are independent)

---

## Testing Strategy

### Per-Task Testing

**Phase 1 (Agent):**

- T5: Run `/security:scan` and validate JSON structure
- Check: All fields present, token usage <3K, no parsing errors

**Phase 2 (Workflow):**

- Create test PR with deliberate security issue (e.g., missing RLS policy)
- T6: Verify workflow parses JSON without errors
- T7: Check PR comment formatting, collapsible sections work
- T8: Verify annotations appear in "Files changed" view

**Phase 3 (Command):**

- T9: Test all filter levels: `/security:scan api critical/high/medium/low`
- T10: Check output grouping, emoji indicators, saved reports

**Phase 4 (Documentation):**

- T11: Review docs for accuracy, test example commands

### Integration Testing

**After Phase 1:**

- Run `/security:scan rls` and save output for use in Phase 2/3 testing

**After Phase 2:**

- Create PR, trigger workflow, verify end-to-end flow works

**After Phase 3:**

- Run all `/security:scan` variations and verify output matches spec

**After Phase 4:**

- Review all documentation for consistency with implementation

### Edge Case Testing

- **No findings:** Run scan on clean codebase, verify empty state handling
- **Single severity:** Ensure grouping works with findings in only one severity
- **Missing fields:** Test backward compatibility with old format
- **Long code examples:** Verify markdown rendering doesn't break
- **Invalid filter:** Test `/security:scan api invalid-severity`
- **All severities:** Test with findings across all 4 severity levels

### Coverage Targets

This is a prompt/workflow enhancement, not application code:

- No unit test coverage required (modifying markdown prompts)
- Manual testing required for each phase
- Validation: Agent outputs valid JSON, workflow parses correctly, command filters correctly

---

## Success Metrics

### Quantitative Metrics

- ✅ Agent output includes `remediation.code` in 90%+ of findings
- ✅ Agent output includes `remediation.references` in 90%+ of findings
- ✅ Agent output includes `confidence` in 100% of findings
- ✅ Agent output token count < 3000 tokens
- ✅ Workflow parses new JSON format with 0 errors
- ✅ PR comments display severity-grouped findings
- ✅ GitHub annotations appear for CRITICAL + HIGH findings
- ✅ Command filtering works correctly for all severity levels
- ✅ Reports saved to `scratch/` directory with correct format

### Qualitative Metrics

- ✅ Code examples are copy-paste ready and secure
- ✅ References are relevant and actionable
- ✅ Confidence levels accurately reflect certainty
- ✅ Severity assignments align with OWASP/CVSS standards
- ✅ PR comments are readable and well-formatted
- ✅ Documentation is clear and includes examples

### User Impact Metrics

- Developers can quickly identify critical vs. low-priority issues
- Developers can copy-paste remediation code without modification
- Developers can learn from reference documentation links
- Workflows automatically highlight high-severity issues
- Security reviews are faster and more actionable

---

## Effort Breakdown by Phase

| Phase                         | Tasks        | Estimated Hours | % of Total |
| ----------------------------- | ------------ | --------------- | ---------- |
| Phase 1: Agent Enhancement    | T1-T5        | 2.5h            | 42%        |
| Phase 2: Workflow Integration | T6-T8        | 1.5h            | 25%        |
| Phase 3: Command Enhancement  | T9-T10       | 1.5h            | 25%        |
| Phase 4: Documentation        | T11          | 0.5h            | 8%         |
| **Total**                     | **11 tasks** | **6h**          | **100%**   |

---

## Completion Checklist

**Phase 1 Complete When:**

- [ ] All 5 tasks (T1-T5) completed
- [ ] Agent outputs new JSON format successfully
- [ ] Sample scan demonstrates all new fields
- [ ] Token usage validated (<3K)

**Phase 2 Complete When:**

- [ ] All 3 tasks (T6-T8) completed
- [ ] Workflow parses new format without errors
- [ ] PR comment displays severity-grouped findings
- [ ] Annotations appear for CRITICAL/HIGH issues

**Phase 3 Complete When:**

- [ ] All 2 tasks (T9-T10) completed
- [ ] Command filtering works for all severity levels
- [ ] Output matches expected format
- [ ] Reports saved correctly to `scratch/`

**Phase 4 Complete When:**

- [ ] Task T11 completed
- [ ] `SECURITY.md` updated with criteria and examples
- [ ] Micro-lesson created and tagged

**Feature Complete When:**

- [ ] All 11 tasks completed
- [ ] All phases validated with testing
- [ ] PR created and ready for review
- [ ] No regressions in existing functionality

---

## References

- Spec: [specs/security-scanner-severity-levels.md](../specs/security-scanner-severity-levels.md)
- Plan: [plans/security-scanner-severity-levels.md](../plans/security-scanner-severity-levels.md)
- Issue: #261
- Related: #259 - Structured prompt templates
- Related: #257 - Integrate sub-agents into workflow lanes
- Agent: [.claude/agents/security-scanner.md](../.claude/agents/security-scanner.md)
- Command: [.claude/commands/security/scan.md](../.claude/commands/security/scan.md)
- Workflow: [.github/workflows/security-review.yml](../.github/workflows/security-review.yml)
