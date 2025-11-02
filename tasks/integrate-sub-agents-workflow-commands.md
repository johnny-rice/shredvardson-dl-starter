---
id: TASK-257
type: task
parentId: PLAN-257
issue: 257
title: Integrate sub-agents into workflow lane commands - Task Breakdown
spec: specs/integrate-sub-agents-workflow-commands.md
plan: plans/integrate-sub-agents-workflow-commands.md
created: 2025-11-02
status: ready
total_estimate: 21h
---

# Integrate sub-agents into workflow lane commands - Task Breakdown

## Summary

**Total Estimated Effort:** 21 hours
**Number of Tasks:** 18
**High-Risk Tasks:** 2

## Task List

### Task 1: Create Agent Orchestrator Skill directory structure

**ID:** T1
**Priority:** p0
**Estimate:** 1h
**Dependencies:** None
**Risk:** low

**Description:**
Create the complete directory structure for the agent-orchestrator Skill including all TypeScript files with basic scaffolding. Set up the skill.json metadata file and SKILL.md discovery documentation.

**Acceptance Criteria:**

- [ ] Directory `.claude/skills/agent-orchestrator/` created
- [ ] File `skill.json` created with correct metadata (name, version, description)
- [ ] File `SKILL.md` created with progressive disclosure documentation (~200 tokens)
- [ ] Directory `scripts/` created
- [ ] Stub files created: `orchestrate.ts`, `delegate-research.ts`, `delegate-security.ts`, `delegate-test.ts`, `parse-response.ts`, `types.ts`
- [ ] All files have basic TypeScript structure (imports, exports)

**Notes:**
Follow existing Skill patterns from supabase-integration and test-scaffolder. The skill.json should target ~20 tokens. SKILL.md should provide enough context for main agent to understand when to use orchestrator without loading full scripts.

---

### Task 2: Implement TypeScript type definitions

**ID:** T2
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T1
**Risk:** low

**Description:**
Define all TypeScript interfaces for orchestration requests/responses, research findings, security scan results, and internal data structures. These types form the contract between orchestrator and sub-agents.

**Acceptance Criteria:**

- [ ] Interface `OrchestrationRequest` defined with task_type, context, agents fields
- [ ] Interface `OrchestrationResponse` defined with success, findings, tokens_used, confidence fields
- [ ] Interface `ResearchResponse` defined matching Research Agent output schema
- [ ] Interface `SecurityResponse` defined matching Security Scanner output schema
- [ ] Interface `TestResponse` defined for future Test Generator integration
- [ ] All interfaces exported from `types.ts`
- [ ] JSDoc comments added for all interfaces and fields

**Notes:**
Refer to plan lines 322-392 for complete schema definitions. These types must match existing sub-agent response formats (see `.claude/agents/research-agent.md` and `.claude/agents/security-scanner.md`).

---

### Task 3: Implement JSON response parser with validation

**ID:** T3
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T2
**Risk:** medium

**Description:**
Build robust JSON parsing and validation logic for sub-agent responses. Must gracefully handle malformed JSON, missing fields, and provide helpful error messages. Include schema validation using TypeScript type guards.

**Acceptance Criteria:**

- [ ] Function `parseAgentResponse<T>(json: string, schema: string): T | null` implemented
- [ ] Type guards for each response type (isResearchResponse, isSecurityResponse, etc.)
- [ ] Error handling for malformed JSON (JSON.parse errors caught)
- [ ] Error handling for schema mismatches (missing required fields)
- [ ] Sanitized error messages (no sensitive data leaks)
- [ ] Returns null on failure (no exceptions thrown)
- [ ] Unit tests covering valid JSON, malformed JSON, partial schemas

**Notes:**
This is medium risk because JSON parsing errors could break workflows. Comprehensive error handling and fallback logic are critical. Consider using zod or similar schema validation library.

---

### Task 4: Implement Research Agent delegation script

**ID:** T4
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T2, T3
**Risk:** low

**Description:**
Create delegation script that invokes Research Agent via Task tool with correct prompt format, context, and parameters. Parse response JSON and return structured findings.

**Acceptance Criteria:**

- [ ] Function `delegateResearch(context: OrchestrationContext): Promise<ResearchResponse>` implemented
- [ ] Builds correct Task tool invocation with research-agent subagent_type
- [ ] Constructs prompt with query, focus_areas, depth from context
- [ ] Executes agent in isolated context (0 tokens in main agent)
- [ ] Parses JSON response using parseAgentResponse
- [ ] Handles agent failures gracefully (timeout, errors)
- [ ] Returns fallback message on failure
- [ ] 120s timeout enforced

**Notes:**
Reference existing standalone `/research:explore` command for prompt patterns. Ensure prompt clearly requests JSON response format.

---

### Task 5: Implement Security Scanner delegation script

**ID:** T5
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T2, T3
**Risk:** low

**Description:**
Create delegation script that invokes Security Scanner via Task tool. Similar to T4 but for security analysis focused on RLS gaps, vulnerabilities, and security recommendations.

**Acceptance Criteria:**

- [ ] Function `delegateSecurity(context: OrchestrationContext): Promise<SecurityResponse>` implemented
- [ ] Builds correct Task tool invocation with security-scanner subagent_type
- [ ] Constructs prompt with security focus (RLS, vulnerabilities, auth patterns)
- [ ] Executes agent in isolated context
- [ ] Parses JSON response using parseAgentResponse
- [ ] Handles agent failures gracefully
- [ ] Returns fallback message on failure
- [ ] 120s timeout enforced

**Notes:**
Reference existing standalone `/security:scan` command. Security Scanner returns severity levels (critical, high, medium, low) - ensure response parsing handles all levels.

---

### Task 6: Implement Test Generator delegation script (stub)

**ID:** T6
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T2, T3
**Risk:** low

**Description:**
Create stub implementation for Test Generator delegation to enable future integration. Function should return placeholder response for now.

**Acceptance Criteria:**

- [ ] Function `delegateTest(context: OrchestrationContext): Promise<TestResponse>` implemented
- [ ] Returns success=false with message "Test Generator integration coming soon"
- [ ] Follows same structure as delegateResearch/delegateSecurity
- [ ] TypeScript interfaces ready for future implementation
- [ ] Documentation notes future integration plan

**Notes:**
This is P1 (nice-to-have) because Test Generator is not part of immediate workflow integration. Stubbing out enables future enhancement without refactoring.

---

### Task 7: Implement orchestrator main entry point

**ID:** T7
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T4, T5, T6
**Risk:** high

**Description:**
Build the main orchestrate() function that routes tasks to appropriate agents, handles parallel execution for multi-agent requests, merges responses, and coordinates overall orchestration flow.

**Acceptance Criteria:**

- [ ] Function `orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse>` implemented
- [ ] Routes single-agent tasks (task_type: 'research'/'security'/'test') to correct delegation script
- [ ] Executes multi-agent tasks (task_type: 'multi') in parallel using Promise.all
- [ ] Merges findings from multiple agents into single response
- [ ] Tracks execution time and token usage
- [ ] Returns confidence level based on agent responses
- [ ] Handles partial failures (e.g., research succeeds but security fails)
- [ ] Comprehensive error handling with fallback logic
- [ ] Logs orchestration events for debugging

**Notes:**
This is high risk because it's the central coordination logic. Parallel execution must be tested thoroughly. Consider timeout strategy: should one slow agent block others? Current plan: use Promise.race with timeout fallback.

---

### Task 8: Add unit tests for orchestrator core logic

**ID:** T8
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T7
**Risk:** low

**Description:**
Write comprehensive unit tests for orchestrate(), delegation scripts, and JSON parsing. Target 80% coverage for orchestrator scripts.

**Acceptance Criteria:**

- [ ] Test file `tests/skills/agent-orchestrator/orchestrate.test.ts` created
- [ ] Tests for single-agent routing (research, security, test)
- [ ] Tests for multi-agent parallel execution
- [ ] Tests for findings merging from multiple agents
- [ ] Tests for error handling and fallback logic
- [ ] Tests for timeout enforcement
- [ ] Test file `tests/skills/agent-orchestrator/parse-response.test.ts` created
- [ ] Tests for valid JSON parsing
- [ ] Tests for malformed JSON handling
- [ ] Tests for schema validation
- [ ] Coverage report shows ≥80% for orchestrator scripts

**Notes:**
Mock Task tool invocations to avoid actually running sub-agents during unit tests. Use test fixtures for JSON responses.

---

### Task 9: Update `/spec:plan` command with orchestrator integration

**ID:** T9
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T7, T8
**Risk:** medium

**Description:**
Integrate orchestrator into `/spec:plan` command to delegate research and security analysis before Socratic planning. This is the first workflow command integration and highest token savings opportunity.

**Acceptance Criteria:**

- [ ] File `.claude/commands/spec/plan.md` updated with orchestration step
- [ ] Orchestrator invoked before Phase 1 (Understanding) with multi-agent request
- [ ] Delegation context includes spec summary, feature type, domain keywords
- [ ] JSON response parsed and validated
- [ ] Research findings used to enrich Socratic questions in Phase 2 (Exploration)
- [ ] Security recommendations included in Phase 3 (Design) architecture options
- [ ] Fallback to current behavior if orchestrator fails
- [ ] Command still works if orchestrator unavailable

**Notes:**
This is medium risk because it's the first integration. Test thoroughly with various spec types. Ensure fallback preserves existing behavior. Token usage should drop from ~50K to ~10K for research phase.

---

### Task 10: Update `/spec:specify` command with orchestrator integration

**ID:** T10
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T7, T8
**Risk:** low

**Description:**
Integrate orchestrator into `/spec:specify` command to find similar implementations and include evidence-based patterns in generated spec.

**Acceptance Criteria:**

- [ ] File `.claude/commands/spec/specify.md` updated with research step
- [ ] Orchestrator invoked with research-only task_type
- [ ] Delegation context includes feature description and keywords
- [ ] Research findings included in spec "Proposed Solution" section
- [ ] Code references included in spec "References" section
- [ ] Similar patterns from codebase highlighted
- [ ] Fallback to current behavior if orchestrator fails

**Notes:**
Lower risk than T9 because this is simpler integration (research-only, no multi-agent). Focus on making generated specs more evidence-based with actual codebase examples.

---

### Task 11: Update `/spec:tasks` command with orchestrator integration

**ID:** T11
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T7, T8
**Risk:** low

**Description:**
Integrate orchestrator into `/spec:tasks` command to analyze dependencies and order tasks based on dependency graph from codebase analysis.

**Acceptance Criteria:**

- [ ] File `.claude/commands/spec/tasks.md` updated with dependency research step
- [ ] Orchestrator invoked with research task focused on dependencies
- [ ] Delegation context includes spec acceptance criteria and feature scope
- [ ] Dependency findings used to order tasks in Implementation Order section
- [ ] Blocking dependencies flagged in Risk Mitigation section
- [ ] Missing prerequisites identified and added as tasks
- [ ] Fallback to current behavior if orchestrator fails

**Notes:**
Research Agent should analyze codebase to find what other features depend on (e.g., "payment feature needs auth system complete"). This makes task ordering more accurate.

---

### Task 12: Update `/code` command with orchestrator integration

**ID:** T12
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T7, T8
**Risk:** medium

**Description:**
Integrate orchestrator into `/code` command to run security pre-check before implementation. P0 security issues should block code generation until resolved.

**Acceptance Criteria:**

- [ ] File `.claude/commands/code/code.md` updated with security gate step
- [ ] Orchestrator invoked with security-only task_type before implementation
- [ ] Delegation context includes feature description and file paths
- [ ] P0/critical security issues block code generation with clear error message
- [ ] High/medium security issues shown as warnings, included in implementation plan
- [ ] Security patterns incorporated into generated code (e.g., input validation)
- [ ] Security tests added to implementation checklist
- [ ] Fallback to current behavior if orchestrator fails

**Notes:**
This is medium risk because blocking on security could frustrate users if false positives occur. Clear error messages and override mechanism (manual review) recommended. Security pre-check prevents implementing vulnerable code.

---

### Task 13: Write integration tests for workflow commands

**ID:** T13
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T9, T10, T11, T12
**Risk:** low

**Description:**
Write integration tests validating end-to-end flow from command invocation through orchestrator delegation to sub-agent execution and response handling.

**Acceptance Criteria:**

- [ ] Test file `tests/integration/workflow-orchestration.test.ts` created
- [ ] Test: `/spec:plan` delegates research and security before planning
- [ ] Test: `/spec:plan` uses findings in Socratic questions
- [ ] Test: `/spec:specify` includes research findings in spec template
- [ ] Test: `/spec:tasks` orders tasks by dependency graph
- [ ] Test: `/code` blocks implementation on P0 security issues
- [ ] Tests use real sub-agents (not mocked) for E2E validation
- [ ] Coverage ≥70% for workflow integration paths

**Notes:**
These tests will be slower than unit tests because they invoke actual sub-agents. Consider running in CI only or with shorter timeouts for local development.

---

### Task 14: Write E2E token optimization validation tests

**ID:** T14
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T13
**Risk:** low

**Description:**
Create E2E tests that measure token usage before/after orchestrator integration to validate 50%+ token reduction and 56%+ cost reduction targets.

**Acceptance Criteria:**

- [ ] Test file `tests/e2e/token-optimization.test.ts` created
- [ ] Baseline measurement: run `/spec:plan` WITHOUT orchestrator, capture token usage
- [ ] Optimized measurement: run `/spec:plan` WITH orchestrator, capture token usage
- [ ] Calculate reduction percentage (baseline - optimized) / baseline
- [ ] Assert token reduction ≥50%
- [ ] Calculate cost reduction using Sonnet/Haiku pricing
- [ ] Assert cost reduction ≥56%
- [ ] Tests run on sample specs (auth, payments, CRUD feature)

**Notes:**
This is P1 because validation could be done manually. However, automated tests provide ongoing regression detection if orchestrator changes. Consider making these tests optional (skip in CI if slow).

---

### Task 15: Create ADR for Sub-Agent Orchestration Pattern

**ID:** T15
**Priority:** p0
**Estimate:** 1h
**Dependencies:** None
**Risk:** low

**Description:**
Document architectural decision to use Skill-Level Orchestration pattern with structured JSON communication. Explain rationale, alternatives considered, and implementation details.

**Acceptance Criteria:**

- [ ] File `docs/decisions/ADR-008-sub-agent-orchestration-pattern.md` already exists (checked)
- [ ] ADR follows standard format: Context, Decision, Rationale, Consequences, Alternatives
- [ ] Documents why Skill-Level pattern chosen over Command-Level or Distributed
- [ ] Documents why Structured JSON chosen over Shared Files or Conversational
- [ ] Includes token/cost savings projections
- [ ] Includes scalability analysis (10,000+ agents reference)
- [ ] References research sources and industry best practices

**Notes:**
ADR already exists at `docs/decisions/ADR-008-sub-agent-orchestration-pattern.md` - verify it's complete and update if needed based on implementation learnings.

---

### Task 16: Update Skills catalog documentation

**ID:** T16
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T7
**Risk:** low

**Description:**
Add agent-orchestrator to the Skills catalog README. Document usage, API, response format, and integration examples.

**Acceptance Criteria:**

- [ ] File `.claude/skills/README.md` updated with agent-orchestrator section
- [ ] Usage example showing orchestrate() invocation
- [ ] API documentation for OrchestrationRequest/Response
- [ ] Response format examples for research, security, multi-agent tasks
- [ ] Integration examples for workflow commands
- [ ] Troubleshooting section (common errors, fallback behavior)
- [ ] Performance notes (token savings, execution time)

**Notes:**
Follow existing Skill documentation patterns from supabase-integration and test-scaffolder entries in Skills README.

---

### Task 17: Update workflow command documentation

**ID:** T17
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T9, T10, T11, T12
**Risk:** low

**Description:**
Update documentation for each workflow command to explain orchestrator integration, what research/security analysis happens automatically, and how findings are used.

**Acceptance Criteria:**

- [ ] Each command file (plan.md, specify.md, tasks.md, code.md) has updated documentation section
- [ ] Explains what orchestrator does for that command
- [ ] Shows example of delegated research/security findings
- [ ] Notes token/cost savings vs previous version
- [ ] Explains fallback behavior if orchestrator fails
- [ ] User-facing: no complex technical details, focus on benefits

**Notes:**
Keep documentation user-focused. Users don't need to know implementation details, just what benefits they get (faster, cheaper, more evidence-based outputs).

---

### Task 18: Measure and document token/cost metrics

**ID:** T18
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T9, T10, T11, T12, T14
**Risk:** low

**Description:**
Run baseline and optimized measurements for all workflow commands. Calculate actual token reduction, cost reduction, and execution time. Document findings and compare to targets.

**Acceptance Criteria:**

- [ ] Baseline measurements for `/spec:plan`, `/spec:specify`, `/spec:tasks`, `/code` WITHOUT orchestrator
- [ ] Optimized measurements for all commands WITH orchestrator
- [ ] Token reduction calculated and documented per command
- [ ] Cost reduction calculated and documented per command
- [ ] Execution time comparison documented
- [ ] Results documented in `docs/architecture/orchestration-metrics.md`
- [ ] Actual results compared to targets (50%+ tokens, 56%+ cost)
- [ ] If targets not met, document why and what adjustments needed

**Notes:**
Run measurements on 3-5 different feature types (auth, CRUD, external API, refactoring, security) to get representative averages. Use actual Anthropic API pricing for cost calculations.

---

## Implementation Order

### Phase 1: Foundation (depends on: none)

**Total: 8h**

- T1: Create Agent Orchestrator Skill directory structure (1h)
- T2: Implement TypeScript type definitions (2h)
- T3: Implement JSON response parser with validation (3h)
- T15: Create ADR for Sub-Agent Orchestration Pattern (1h)
- T16: Update Skills catalog documentation (1h)

### Phase 2: Core Orchestration (depends on: Phase 1)

**Total: 8h**

- T4: Implement Research Agent delegation script (2h)
- T5: Implement Security Scanner delegation script (2h)
- T6: Implement Test Generator delegation script stub (1h)
- T7: Implement orchestrator main entry point (3h)

### Phase 3: Testing Orchestrator (depends on: Phase 2)

**Total: 2h**

- T8: Add unit tests for orchestrator core logic (2h)

### Phase 4: Workflow Integration (depends on: Phase 3)

**Total: 8h**

- T9: Update `/spec:plan` command with orchestrator integration (2h)
- T10: Update `/spec:specify` command with orchestrator integration (2h)
- T11: Update `/spec:tasks` command with orchestrator integration (2h)
- T12: Update `/code` command with orchestrator integration (2h)

### Phase 5: Integration Testing (depends on: Phase 4)

**Total: 4h**

- T13: Write integration tests for workflow commands (2h)
- T14: Write E2E token optimization validation tests (2h)

### Phase 6: Documentation & Metrics (depends on: Phase 5)

**Total: 3h**

- T17: Update workflow command documentation (1h)
- T18: Measure and document token/cost metrics (2h)

## Risk Mitigation

### High-Risk Tasks

**T7: Implement orchestrator main entry point**

- **Risk:** Central coordination logic, parallel execution complexity, partial failure handling
- **Mitigation:**
  - Write unit tests before integration (T8 depends on T7)
  - Use Promise.all with timeout wrapper for parallel execution
  - Comprehensive error handling with fallback to main agent
  - Test with intentionally failing sub-agents to validate error paths
  - Consider circuit breaker pattern if sub-agents repeatedly fail

**T3: Implement JSON response parser with validation**

- **Risk:** Malformed JSON from sub-agents could break workflows
- **Mitigation:**
  - Use try-catch for JSON.parse with graceful fallback
  - Schema validation with type guards for required fields
  - Return null on failure (never throw exceptions)
  - Sanitize error messages to prevent data leaks
  - Consider using zod or similar library for robust validation

### Dependencies

**Critical Path:**
T1 → T2 → T3 → T4,T5 → T7 → T8 → T9,T10,T11,T12 → T13,T14 → T18

**Potential Bottlenecks:**

- T7 (orchestrator entry point) blocks all workflow integration tasks
- T8 (unit tests) must pass before workflow integration to ensure stability
- T13 (integration tests) needed before metrics measurement to validate correctness

**Parallelization Opportunities:**

- Phase 1: T1, T15, T16 can run in parallel (independent)
- Phase 2: T4, T5, T6 can run in parallel after T2, T3 complete
- Phase 4: T9, T10, T11, T12 can run in parallel after T8 completes
- Phase 5: T13, T14 can run in parallel
- Phase 6: T17, T18 can run in parallel

## Testing Strategy

### Per-Task Testing

Each implementation task (T4-T7, T9-T12) should include:

- Unit tests for core logic (80% coverage target)
- Error handling tests (malformed input, missing data)
- Timeout tests (sub-agent hangs, exceeds 120s limit)
- Fallback tests (sub-agent fails, orchestrator unavailable)

### Integration Testing (T13)

After Phase 4, run integration tests validating:

- Command → Orchestrator → Sub-Agent → Response flow
- Findings incorporated into command outputs
- Fallback behavior when orchestrator fails
- 70% coverage target for integration paths

### E2E Testing (T14)

After Phase 5, run E2E tests validating:

- Token reduction ≥50% vs baseline
- Cost reduction ≥56% vs baseline
- Output quality maintained (manual review)
- Execution time improved (parallel execution benefit)

### Coverage Targets

- **Unit tests:** 80% coverage for orchestrator scripts
- **Integration tests:** 70% coverage for workflow integration paths
- **E2E tests:** 100% coverage of success metrics (token, cost, quality)

## Success Metrics

### Quantitative (Measured by T18)

- **Token reduction:** ≥50% (target: 120K → 50-60K per workflow)
- **Cost reduction:** ≥56% (target: $3.60 → $1.60 per workflow)
- **Annual savings:** $240/year (based on 10 workflows/month)
- **Execution time:** Faster or equal (parallel execution benefit)
- **Test coverage:** ≥80% unit, ≥70% integration

### Qualitative (Manual Validation)

- **Output quality:** Maintained or improved over 2-week period
  - Specs more evidence-based (similar patterns found)
  - Plans more security-aware (vulnerabilities identified early)
  - Tasks better ordered (dependencies analyzed)
  - Code more secure (pre-implementation checks)
- **User experience:** Transparent integration (no workflow disruption)
- **Reliability:** Fallback preserves functionality on orchestrator failure

### Acceptance Criteria Mapping

All acceptance criteria from spec must be validated:

- ✅ `/spec:specify` delegates research (T10)
- ✅ `/spec:plan` uses Research + Security (T9)
- ✅ `/spec:tasks` uses Research for dependencies (T11)
- ✅ `/code` uses Security Scanner pre-check (T12)
- ✅ Token usage reduced 50%+ (T14, T18)
- ✅ Cost per workflow reduced 56%+ (T14, T18)
- ✅ Documentation updated (T15, T16, T17)
- ✅ Quality maintained (manual validation during T18)

## References

- **Spec:** [specs/integrate-sub-agents-workflow-commands.md](../specs/integrate-sub-agents-workflow-commands.md)
- **Plan:** [plans/integrate-sub-agents-workflow-commands.md](../plans/integrate-sub-agents-workflow-commands.md)
- **Issue:** #257
- **Parent Epic:** Issue #156 - Token & Cost Optimization
- **Related Issues:**
  - Issue #157: Implement Sub-Agent Architecture (✅ CLOSED)
  - Issue #210: Wire up sub-agent delegation (✅ CLOSED)
- **ADR:** [docs/decisions/ADR-008-sub-agent-orchestration-pattern.md](../docs/decisions/ADR-008-sub-agent-orchestration-pattern.md)
- **Existing Sub-Agents:**
  - [.claude/agents/research-agent.md](../.claude/agents/research-agent.md)
  - [.claude/agents/security-scanner.md](../.claude/agents/security-scanner.md)
  - [.claude/agents/test-generator.md](../.claude/agents/test-generator.md)
- **Skills Architecture:**
  - [.claude/skills/README.md](../.claude/skills/README.md)
  - ADR-002: Skills Architecture
