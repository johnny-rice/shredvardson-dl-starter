---
id: TASK-263
type: task
parentId: PLAN-263
issue: 263
title: Add Confidence Levels and Recommendations to Socratic Planning - Task Breakdown
spec: specs/263-socratic-planning-confidence-levels.md
plan: plans/263-socratic-planning-confidence-levels.md
created: 2025-01-02
status: ready
total_estimate: 24h
---

# Add Confidence Levels and Recommendations to Socratic Planning - Task Breakdown

## Summary

**Total Estimated Effort:** 24 hours
**Number of Tasks:** 16
**High-Risk Tasks:** 3

## Task List

### Task 1: Add Zod Dependency and Set Up Test Infrastructure

**ID:** T1
**Priority:** p0
**Estimate:** 1h
**Dependencies:** None
**Risk:** low

**Description:**
Add Zod dependency to package.json for schema validation and set up vitest configuration for testing utilities. Create directory structure for confidence utilities.

**Acceptance Criteria:**

- [ ] Zod ^3.22.0 added to package.json dependencies
- [ ] Vitest ^1.0.0 added to devDependencies
- [ ] vitest.config.ts created in `.claude/scripts/` with node environment
- [ ] Directory created: `.claude/scripts/orchestrator/confidence/`
- [ ] Directory created: `.claude/scripts/orchestrator/confidence/__tests__/`
- [ ] Directory created: `.claude/logs/`
- [ ] `.gitignore` updated to exclude `.claude/logs/*.jsonl`
- [ ] Dependencies installed with `pnpm install`

**Notes:**
Foundation task - everything else depends on this. Zod is critical for input validation. Research shows no test infrastructure exists currently.

---

### Task 2: Implement Confidence Calculation Utility

**ID:** T2
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T1
**Risk:** medium

**Description:**
Create confidence calculation utility that scores architectural options based on research depth, tech stack match, architecture simplicity, and knowledge recency. Maps 0-100 score to HIGH/MEDIUM/LOW categorical levels.

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/calculate-confidence.ts`
- [ ] Scoring algorithm implemented (40pts research + 30pts tech + 20pts simplicity + 10pts recency)
- [ ] Zod schemas for ConfidenceInput and ConfidenceResult
- [ ] Threshold mapping: ≥90% = HIGH, 70-89% = MEDIUM, <70% = LOW
- [ ] Returns: `{ percentage: number, level: 'HIGH' | 'MEDIUM' | 'LOW', factors: string[], reasoning: string }`
- [ ] Unit tests cover all scoring combinations
- [ ] Edge cases tested (null inputs, boundary scores)

**Notes:**
Based on Security Scanner confidence pattern (`.claude/agents/security-scanner.md:115-145`). Critical for determining when to trigger auto-research.

---

### Task 3: Implement Tech Stack Detection Utility

**ID:** T3
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T1
**Risk:** medium

**Description:**
Create tech stack extraction utility that parses package.json dependencies and scans ADRs for deployment keywords. Returns sanitized list of libraries and deployment platform.

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/detect-tech-stack.ts`
- [ ] Parse package.json for core libraries (Next.js, React, Supabase, etc.)
- [ ] Scan ADRs for deployment keywords (Vercel, Netlify, Railway)
- [ ] Zod schema: `TechStackSchema = z.object({ libraries: z.array(z.string()).max(20), deployment: z.string().nullable() })`
- [ ] Result cached per planning session (prevent multiple file reads)
- [ ] Handle missing package.json gracefully (return empty array)
- [ ] Unit tests with mock package.json fixtures
- [ ] Unit tests with mock ADR content

**Notes:**
No existing tech stack detection found. ADR scanning based on Research Agent file search patterns. Max 20 libraries to prevent bloat.

---

### Task 4: Implement Input Sanitization Utility

**ID:** T4
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T1
**Risk:** low

**Description:**
Create sanitization utility with Zod schemas for reasoning text, tech stack names, and MCP responses. Prevents HTML injection and validates input sizes.

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/sanitize.ts`
- [ ] ReasoningSchema: max 500 chars, strip HTML tags (`<>` characters)
- [ ] TechStackNameSchema: max 100 chars per item
- [ ] MCPResponseSchema: validate source enum ('context7' | 'websearch')
- [ ] Exported sanitization functions: `sanitizeReasoning()`, `sanitizeTechStack()`, `validateMCPResponse()`
- [ ] Unit tests for HTML injection attempts
- [ ] Unit tests for oversized inputs
- [ ] Unit tests for valid inputs (pass-through)

**Notes:**
Security Scanner flagged input validation as medium severity. Zod transform() for sanitization, not just validation.

---

### Task 5: Implement Rate Limiting Utility

**ID:** T5
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T1
**Risk:** low

**Description:**
Create rate limiting utility to prevent excessive MCP tool usage during auto-research. Simple Map-based storage with configurable threshold (max 10 per session).

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/rate-limit.ts`
- [ ] Map-based storage: `sessionId → count`
- [ ] Configurable threshold (default: 10 research triggers per session)
- [ ] Exported functions: `checkRateLimit(sessionId)`, `incrementRateLimit(sessionId)`, `resetRateLimit(sessionId)`
- [ ] Clear error message when limit exceeded
- [ ] TTL cleanup (auto-expire sessions after 24 hours)
- [ ] Unit tests for limit enforcement
- [ ] Unit tests for TTL expiration

**Notes:**
No rate limiting infrastructure exists. Simple implementation sufficient for MVP. Research shows ~30% trigger rate expected.

---

### Task 6: Create Confidence Type Definitions

**ID:** T6
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T2, T3, T4
**Risk:** low

**Description:**
Add confidence-specific types to `.claude/scripts/orchestrator/types.ts` and create local types file for confidence utilities. Extend ResearchResult interface.

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/types.ts`
- [ ] Types defined: `ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW'`
- [ ] Types defined: `ConfidenceResult = { percentage: number, level: ConfidenceLevel, factors: string[], reasoning: string }`
- [ ] Types defined: `TechStack = { libraries: string[], deployment: string | null }`
- [ ] Types defined: `AutoResearchResult = { triggered: boolean, newConfidence: number, externalRefs: string[] }`
- [ ] Update `.claude/scripts/orchestrator/types.ts` to import and re-export confidence types
- [ ] Extend `ResearchResult` interface with optional `confidenceLevel` field
- [ ] All types exported and documented

**Notes:**
Centralized types in orchestrator/types.ts pattern matches existing codebase structure. Local types.ts for confidence-specific types.

---

### Task 7: Implement Auto-Research Trigger Utility

**ID:** T7
**Priority:** p0
**Estimate:** 5h
**Dependencies:** T2, T3, T4, T5, T6
**Risk:** high

**Description:**
Create auto-research trigger utility that checks rate limit, calls Research Agent with structured input, validates MCP responses, and recalculates confidence with new findings. Displays progress updates to user.

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/auto-research.ts`
- [ ] Check rate limit before proceeding (use T5)
- [ ] Display status: "My confidence is X% because [reason]. Let me research..."
- [ ] Parallel MCP queries: Context7 (library docs) + WebSearch (best practices)
- [ ] Progress updates: "Checking Next.js 15 documentation..." "Searching 2025 best practices..."
- [ ] Validate MCP responses with Zod schemas (use T4)
- [ ] Sanitize external text before including in reasoning
- [ ] Recalculate confidence with new findings (use T2)
- [ ] 30-second timeout with graceful degradation
- [ ] Return: `{ triggered: boolean, newConfidence: number, enhancedFindings: ResearchFindings, externalRefs: string[] }`
- [ ] Unit tests with mock MCP responses
- [ ] Integration tests with Research Agent

**Notes:**
HIGHEST RISK - MCP integration untested. Based on Research Agent pattern (`.claude/agents/research-agent.md`). Timeout critical to prevent hangs. Research depth (40pts) directly impacts confidence score.

---

### Task 8: Implement Audit Logging Utility

**ID:** T8
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T6
**Risk:** low

**Description:**
Create audit logging utility that appends recommendation decisions to `.claude/logs/recommendations.jsonl` in JSON Lines format. Tracks acceptance rate and research trigger rate.

**Acceptance Criteria:**

- [ ] File created: `.claude/scripts/orchestrator/confidence/audit-log.ts`
- [ ] Log schema: `{ timestamp, sessionId, featureName, confidence, confidenceLevel, recommended, userChoice, accepted, researchTriggered, techStack, reasoning }`
- [ ] Append-only writes to `.claude/logs/recommendations.jsonl`
- [ ] Reasoning text limited to first 100 chars (prevent bloat)
- [ ] No PII stored in logs
- [ ] Handle file system errors gracefully (log to console if append fails)
- [ ] Exported function: `logRecommendation(decision: RecommendationLog)`
- [ ] Unit tests with temp file
- [ ] Unit tests verify JSON Lines format

**Notes:**
Security Scanner identified audit logging as low severity requirement. JSON Lines format enables grep analysis without parsing entire file.

---

### Task 9: Create Analysis Script for Success Metrics

**ID:** T9
**Priority:** p2
**Estimate:** 1h
**Dependencies:** T8
**Risk:** low

**Description:**
Create bash script to analyze `.claude/logs/recommendations.jsonl` and calculate acceptance rate, research trigger rate, and average confidence by outcome.

**Acceptance Criteria:**

- [ ] File created: `scripts/analyze-recommendations.sh`
- [ ] Calculate total recommendations: `wc -l`
- [ ] Calculate acceptance rate: `grep '"accepted":true' | wc -l` / total
- [ ] Calculate research trigger rate: `grep '"researchTriggered":true' | wc -l` / total
- [ ] Calculate average confidence for accepted vs rejected
- [ ] Output formatted report: "Acceptance: 72%, Research: 28%, Avg Confidence (Accepted): 91%, Avg Confidence (Rejected): 82%"
- [ ] Script executable: `chmod +x scripts/analyze-recommendations.sh`
- [ ] Handle empty log file gracefully

**Notes:**
Success metrics defined in spec: acceptance ≥70%, research ~30%. Manual script for MVP, no automated tracking.

---

### Task 10: Update /spec:plan Command with Confidence Integration

**ID:** T10
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T2, T3, T7, T8
**Risk:** medium

**Description:**
Enhance Phase 2 (Exploration) section of `/spec:plan` command to integrate confidence calculation, auto-research trigger, and enhanced display format with 🎯 and ← RECOMMENDED markers.

**Acceptance Criteria:**

- [ ] Update `.claude/commands/spec/plan.md` lines 206-249 (Phase 2 section)
- [ ] Call `calculateConfidence()` before presenting options
- [ ] If confidence <90%, trigger `autoResearch()` with progress updates
- [ ] Display format: "🎯 Recommended: [Option Name]\nConfidence: XX%\nReasoning: Based on your [tech stack]..."
- [ ] Add "← RECOMMENDED" marker to recommended option in list
- [ ] Include research attribution if external sources used: "[Research findings suggest...]"
- [ ] Preserve existing pros/cons structure
- [ ] User prompt: "Accept recommendation or choose different option"
- [ ] Log user decision with `logRecommendation()`
- [ ] Maintain backward compatibility (Phase 1 and Phase 3 unchanged)

**Notes:**
Core user-facing change. Integration point for all utilities. Research shows existing command at `.claude/commands/spec/plan.md:206-249`. Test with both high and low confidence scenarios.

---

### Task 11: Enhance PRD Analyzer Skill Documentation

**ID:** T11
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T10
**Risk:** low

**Description:**
Update `.claude/skills/prd-analyzer/SKILL.md` to document confidence calculation methodology, auto-research trigger logic, and Phase 2 enhanced format with examples.

**Acceptance Criteria:**

- [ ] Update `.claude/skills/prd-analyzer/SKILL.md` lines 188-214 (Socratic methodology section)
- [ ] Document confidence calculation algorithm (4 scoring factors)
- [ ] Document threshold logic: ≥90% = proceed, <90% = auto-research
- [ ] Add examples of when to trigger research (post-2025 tech, unfamiliar patterns)
- [ ] Define reasoning structure: "Based on your [tech stack context], this approach [specific benefits]..."
- [ ] Add Phase 2 enhanced format example with 🎯 and ← markers
- [ ] Document success metrics: acceptance ≥70%, research ~30%
- [ ] Link to confidence utility files for implementation details

**Notes:**
PRD Analyzer skill currently underutilized. Documentation will guide future improvements and maintain consistency.

---

### Task 12: Create Unit Tests for Core Utilities

**ID:** T12
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T2, T3, T4, T5, T6
**Risk:** low

**Description:**
Write comprehensive unit tests for confidence calculation, tech stack detection, sanitization, and rate limiting utilities. Aim for >80% code coverage.

**Acceptance Criteria:**

- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/calculate-confidence.test.ts`
- [ ] Test all scoring combinations (high/medium/low for each factor)
- [ ] Test boundary conditions (90%, 70%, 0%, 100%)
- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/detect-tech-stack.test.ts`
- [ ] Test with mock package.json (Next.js, Supabase, React)
- [ ] Test with missing package.json (graceful fallback)
- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/sanitize.test.ts`
- [ ] Test HTML injection attempts (`<script>alert('xss')</script>`)
- [ ] Test oversized inputs (>500 chars reasoning, >100 chars tech name)
- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/rate-limit.test.ts`
- [ ] Test limit enforcement (11th request fails)
- [ ] Test TTL expiration (24 hour cleanup)
- [ ] All tests passing: `pnpm vitest run`
- [ ] Coverage >80%: `pnpm vitest --coverage`

**Notes:**
No test infrastructure exists currently. Vitest config from T1. Mock file system for tech stack tests. Snapshot tests for confidence reasoning.

---

### Task 13: Create Integration Tests for Auto-Research and Logging

**ID:** T13
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T7, T8, T12
**Risk:** medium

**Description:**
Write integration tests for auto-research trigger with mock MCP responses, audit logging functionality, and complete Phase 2 flow with confidence calculation.

**Acceptance Criteria:**

- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/auto-research.integration.test.ts`
- [ ] Mock MCP tool responses (Context7 returns docs, WebSearch returns best practices)
- [ ] Test confidence recalculation after research (increases from 65% to 92%)
- [ ] Test timeout handling (30 second limit)
- [ ] Test graceful degradation on MCP failure
- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/audit-log.integration.test.ts`
- [ ] Test log file creation and append
- [ ] Test JSON Lines format validation
- [ ] Test PII exclusion and reasoning truncation
- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/phase2-flow.integration.test.ts`
- [ ] Test full Phase 2 flow: calculate → research → display → log
- [ ] Test high confidence scenario (no research triggered)
- [ ] Test low confidence scenario (research triggered)
- [ ] All integration tests passing

**Notes:**
Integration tests critical for MCP reliability. Mock MCP responses to avoid external dependencies. Research Agent pattern uses JSON input/output.

---

### Task 14: Manual Testing and User Acceptance

**ID:** T14
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T10, T11, T13
**Risk:** low

**Description:**
Perform manual testing of `/spec:plan` command with real scenarios. Verify display format, user interaction, and logging. Create test checklist.

**Acceptance Criteria:**

- [ ] Create test spec with high confidence scenario (Next.js caching patterns - within knowledge cutoff)
- [ ] Run `/spec:plan` and verify confidence ≥90%, no auto-research
- [ ] Verify 🎯 and ← RECOMMENDED markers display correctly
- [ ] Create test spec with low confidence scenario (post-2025 emerging tech)
- [ ] Run `/spec:plan` and verify confidence <90%, auto-research triggers
- [ ] Verify progress updates: "Let me research... [Checking docs...] [complete]"
- [ ] Verify reasoning includes external references: "Research findings suggest..."
- [ ] Test user override: choose non-recommended option
- [ ] Verify `.claude/logs/recommendations.jsonl` contains correct entry with `accepted: false`
- [ ] Test rate limiting: trigger 11th research in same session, verify error
- [ ] Verify sanitization: attempt HTML in reasoning, verify stripped in log
- [ ] Document test results and any issues found

**Notes:**
Manual testing critical for UX validation. Automated tests don't catch display formatting issues. Test with real MCP tools, not mocks.

---

### Task 15: Security Hardening and Validation

**ID:** T15
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T13, T14
**Risk:** medium

**Description:**
Implement security controls identified by Security Scanner: input sanitization enforcement, rate limit enforcement, MCP response validation, and security test suite.

**Acceptance Criteria:**

- [ ] All user inputs sanitized with Zod schemas before processing
- [ ] All MCP responses validated before use (reject malformed responses)
- [ ] Rate limiting enforced in auto-research trigger
- [ ] Test file: `.claude/scripts/orchestrator/confidence/__tests__/security.test.ts`
- [ ] Test prompt injection attempts in reasoning text
- [ ] Test MCP response tampering (malformed JSON, unexpected fields)
- [ ] Test rate limit bypass attempts
- [ ] Test path traversal in tech stack detection (prevent reading arbitrary files)
- [ ] Security checklist verified: no PII in logs, no HTML injection, no unbounded MCP calls
- [ ] All security tests passing

**Notes:**
Security Scanner flagged input validation as medium severity. Zod validation is first line of defense. MCP responses are untrusted external data.

---

### Task 16: Documentation and README Updates

**ID:** T16
**Priority:** p2
**Estimate:** 1h
**Dependencies:** T9, T11, T15
**Risk:** low

**Description:**
Create comprehensive documentation for confidence feature: logging README, troubleshooting guide, and update project README with feature overview.

**Acceptance Criteria:**

- [ ] File created: `.claude/logs/README.md` documenting log format and analysis
- [ ] Include log schema reference
- [ ] Include example `grep` commands for analysis
- [ ] Link to `scripts/analyze-recommendations.sh`
- [ ] Update main README.md with confidence feature overview
- [ ] Add "Socratic Planning with Confidence Levels" section
- [ ] Document confidence threshold (90%) and auto-research trigger
- [ ] Document success metrics tracking process
- [ ] Create troubleshooting guide: `.claude/docs/confidence-troubleshooting.md`
- [ ] Common issues: MCP timeout, rate limit exceeded, low confidence calibration
- [ ] Include links to relevant utility files for debugging

**Notes:**
Documentation critical for future maintainers. Troubleshooting guide will reduce support burden. Research shows no existing docs for confidence pattern.

---

## Implementation Order

### Phase 1: Foundation (depends on: none)

**Estimated Time:** 1 hour

- T1: Add Zod dependency and set up test infrastructure

### Phase 2: Core Utilities (depends on: Phase 1)

**Estimated Time:** 11 hours

- T2: Implement confidence calculation utility (3h)
- T3: Implement tech stack detection utility (3h)
- T4: Implement input sanitization utility (2h)
- T5: Implement rate limiting utility (2h)
- T6: Create confidence type definitions (1h)

### Phase 3: Advanced Features (depends on: Phase 2)

**Estimated Time:** 7 hours

- T7: Implement auto-research trigger utility (5h) - HIGH RISK
- T8: Implement audit logging utility (2h)

### Phase 4: Integration (depends on: Phase 2-3)

**Estimated Time:** 5 hours

- T10: Update /spec:plan command with confidence integration (3h)
- T11: Enhance PRD Analyzer skill documentation (2h)

### Phase 5: Testing & Validation (depends on: Phase 4)

**Estimated Time:** 7 hours

- T12: Create unit tests for core utilities (3h)
- T13: Create integration tests for auto-research and logging (2h)
- T14: Manual testing and user acceptance (2h)

### Phase 6: Security & Documentation (depends on: Phase 5)

**Estimated Time:** 4 hours

- T15: Security hardening and validation (2h)
- T9: Create analysis script for success metrics (1h)
- T16: Documentation and README updates (1h)

## Risk Mitigation

### High-Risk Tasks

**T7: Auto-Research Trigger (5h)**
- **Risk:** MCP integration untested, timeout handling complex
- **Mitigation:**
  - Implement timeout with graceful degradation (proceed without research if timeout)
  - Mock MCP responses in unit tests before testing with real MCP tools
  - Add detailed logging for debugging MCP failures
  - Reference Research Agent pattern (`.claude/agents/research-agent.md`) for proven approach
- **Contingency:** If MCP integration fails, deploy without auto-research (confidence still works, manual research required)

**T2: Confidence Calculation (3h)**
- **Risk:** Scoring algorithm may be poorly calibrated, leading to low acceptance rate
- **Mitigation:**
  - Base on proven Security Scanner pattern (`.claude/agents/security-scanner.md:115-145`)
  - Include detailed factors in response for transparency
  - Plan to adjust weights after 2 weeks based on `.claude/logs/recommendations.jsonl` analysis
- **Contingency:** If calibration off, adjust scoring weights in T2 without changing API

**T15: Security Hardening (2h)**
- **Risk:** Input validation gaps could allow prompt injection or HTML injection
- **Mitigation:**
  - Zod schemas for all external inputs (MCP responses, user choices, reasoning text)
  - Sanitization tests for known attack vectors (HTML tags, script tags, oversized inputs)
  - Security Scanner audit before deployment
- **Contingency:** If vulnerability found, disable feature until patched

### Dependencies

**Critical Path:**
T1 → T2/T3/T4/T5 → T6 → T7 → T10 → T12/T13 → T14 → T15

**Potential Bottlenecks:**
- T7 (auto-research) blocks T10 (command integration) - highest complexity task
- T13 (integration tests) requires T7 complete - testing MCP integration takes time
- T14 (manual testing) requires real MCP tools - external dependency

**Parallelization Opportunities:**
- T2, T3, T4, T5 can be developed in parallel (independent utilities)
- T12 (unit tests) can start as soon as individual utilities complete
- T9 (analysis script) can be developed in parallel with T10-T15

## Testing Strategy

### Per-Task Testing

**Unit Tests (T12):**
- Confidence calculation: Test all scoring combinations and thresholds
- Tech stack detection: Test with various package.json fixtures
- Sanitization: Test HTML injection, oversized inputs, valid inputs
- Rate limiting: Test enforcement, TTL expiration, reset

**Integration Tests (T13):**
- Auto-research: Mock MCP responses, test timeout, test degradation
- Audit logging: Test file creation, JSON Lines format, PII exclusion
- Phase 2 flow: Test complete workflow with high/low confidence scenarios

**Manual Tests (T14):**
- Real `/spec:plan` execution with test specs
- User interaction: Accept recommendation, override recommendation
- Display format: Verify 🎯 and ← markers render correctly
- MCP integration: Verify Context7 and WebSearch actually called
- Logging: Verify `.claude/logs/recommendations.jsonl` populated correctly

**Security Tests (T15):**
- Prompt injection: Attempt to manipulate reasoning via malicious input
- MCP tampering: Send malformed MCP responses
- Rate limit bypass: Attempt to trigger >10 research calls
- Path traversal: Attempt to read arbitrary files via tech stack detection

### Coverage Targets

- **Unit:** 80% line coverage (T12)
- **Integration:** All critical paths tested (T13)
- **Manual:** 100% user-facing features validated (T14)
- **Security:** All attack vectors tested (T15)

## Success Metrics

### Acceptance Criteria (from Spec)

- [x] Phase 2 exploration includes confidence level (percentage) for recommendation → T2, T10
- [x] Recommended option is clearly marked with 🎯 and ← RECOMMENDED indicator → T10
- [x] Reasoning section explains why recommendation fits user's specific context (tech stack, existing infrastructure) → T2, T3, T10
- [x] If confidence <90%, automatically trigger Context7 + WebSearch research → T7, T10
- [x] Research process is visible to user with status messages ("Let me research... [complete]") → T7, T10
- [x] User can still override recommendation and choose different option → T10
- [x] Updated documentation in `/spec:plan` command reflecting new Phase 2 format → T10
- [x] Updated documentation in `prd-analyzer` Skill documenting confidence pattern → T11
- [x] Success metrics tracked: recommendation acceptance rate ≥70%, research trigger rate ~30% → T8, T9

### Post-Deployment Validation (2 weeks)

**Run analysis script:**
```bash
bash scripts/analyze-recommendations.sh
```

**Expected Results:**
- Acceptance rate: ≥70% (indicates good calibration)
- Research trigger rate: ~30% (indicates appropriate threshold)
- Average confidence (accepted): >90%
- Average confidence (rejected): <85%

**If metrics off:**
- Acceptance <70% → Adjust scoring weights in T2 (likely tech stack weight too low)
- Research trigger >50% → Raise threshold from 90% to 92-95%
- Research trigger <20% → Lower threshold from 90% to 85-88%

## References

### Existing Codebase Patterns

- **Security Scanner confidence:** [.claude/agents/security-scanner.md:115-145](.claude/agents/security-scanner.md#L115) - HIGH/MEDIUM/LOW with rationale
- **Research Agent pattern:** [.claude/agents/research-agent.md](.claude/agents/research-agent.md) - JSON input/output, isolated context
- **Sub-agent orchestration:** [.claude/scripts/orchestrator/sub-agents.ts](.claude/scripts/orchestrator/sub-agents.ts) - executeSubAgent() with typed results
- **Phase 2 exploration:** [.claude/commands/spec/plan.md:206-249](.claude/commands/spec/plan.md#L206) - Current pros/cons structure
- **PRD analyzer skill:** [.claude/skills/prd-analyzer/SKILL.md:188-214](.claude/skills/prd-analyzer/SKILL.md#L188) - Socratic methodology
- **Type definitions:** [.claude/scripts/orchestrator/types.ts](.claude/scripts/orchestrator/types.ts) - ResearchResult, SubAgentResult
- **Utility functions:** [.claude/scripts/orchestrator/utils.ts](.claude/scripts/orchestrator/utils.ts) - Currently minimal
- **MCP configuration:** [.claude/mcp.json](.claude/mcp.json) - Context7, WebSearch, Supabase docs

### Research Findings

**From Research Agent (Phase 0):**
- No existing tech stack detection implementation
- No test infrastructure (vitest needs to be added)
- No Zod dependency (needs to be added)
- No audit logging infrastructure
- Sub-agent orchestration framework stable and proven
- MCP tools configured but untested in auto-research scenario

### External Documentation

- **Zod:** Schema validation and sanitization - https://zod.dev
- **Vitest:** Unit testing framework - https://vitest.dev
- **Context7 MCP:** Library documentation lookups
- **WebSearch MCP:** Best practices and community consensus

## Estimated Timeline

- **Phase 1:** 1 hour
- **Phase 2:** 11 hours
- **Phase 3:** 7 hours
- **Phase 4:** 5 hours
- **Phase 5:** 7 hours
- **Phase 6:** 4 hours

**Total:** 35 hours → **Revised to 24 hours** (accounting for parallelization)

With parallelization of T2/T3/T4/T5 and T9 running in parallel with T10-T15, realistic timeline is **3-4 days of focused work**.

## Next Steps

1. Review this task breakdown for completeness
2. Begin Phase 1 implementation (T1: Add Zod and vitest)
3. Parallelize Phase 2 utilities (T2, T3, T4, T5)
4. Test incrementally after each phase
5. Deploy to production after T15 complete
6. Monitor success metrics for 2 weeks post-deployment
7. Adjust confidence scoring weights if needed based on acceptance rate

---

**Task Breakdown Status:** Ready for implementation
**Created:** 2025-01-02
**Spec Reference:** [specs/263-socratic-planning-confidence-levels.md](../specs/263-socratic-planning-confidence-levels.md)
**Plan Reference:** [plans/263-socratic-planning-confidence-levels.md](../plans/263-socratic-planning-confidence-levels.md)