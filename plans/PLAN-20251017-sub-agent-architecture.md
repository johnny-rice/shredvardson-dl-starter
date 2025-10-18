---
id: PLAN-20251017-sub-agent-architecture
type: plan
parentId: SPEC-20251017-sub-agent-architecture
issue: 157
spec: SPEC-20251017-sub-agent-architecture
source: https://github.com/Shredvardson/dl-starter/issues/157
---

# Technical Implementation Plan: Sub-Agent Architecture with Haiku 4.5

## Overview

This plan implements a multi-model agent orchestration system where the main Sonnet 4.5 agent delegates routine tasks to specialized Haiku 4.5 sub-agents, achieving 30-40% cost reduction and 4-5x faster response times on delegable tasks.

**Parent Specification:** [SPEC-20251017-sub-agent-architecture](../specs/SPEC-20251017-sub-agent-architecture.md)

---

## Architecture Decision

### Model Selection Strategy

```
Main Agent (Sonnet 4.5)
├── Orchestrates complex decisions
├── Maintains conversation context
├── Handles user interaction
└── Delegates to Haiku 4.5 workers:
    ├── Research Agent (codebase exploration)
    ├── Security Scanner (vulnerability detection)
    ├── Test Generator (test creation)
    ├── Refactor Analyzer (code quality)
    └── Documentation Writer (docs generation)
```

### Claude Code Agent System Integration

**Existing System:**

- Claude Code uses the `Task` tool to launch specialized agents
- Agents are defined in `.claude/agents/` directory
- Agent specs use YAML frontmatter with `model` parameter
- Agents communicate through final report messages

**Implementation Approach:**

1. Create agent specification files in `.claude/agents/`
2. Each spec declares `model: haiku-4.5` in frontmatter
3. Main agent uses `Task` tool with `subagent_type` parameter
4. Sub-agents return concise summaries (<5K tokens)
5. Main agent synthesizes results for user

### Constitutional Alignment

- **No new dependencies:** Uses existing Claude Code agent system
- **No breaking changes:** Existing commands continue working
- **Backward compatible:** Delegation is transparent to users
- **Opt-out capable:** `DISABLE_DELEGATION=true` env var
- **TDD-first:** Test delegation logic before integration

---

## File Changes Required

### New Files

#### 1. Sub-Agent Specification Files

```
.claude/agents/
├── research-agent.md           # Codebase exploration (Haiku 4.5)
├── security-scanner.md         # Vulnerability detection (Haiku 4.5)
├── test-generator.md           # Test creation (Haiku 4.5)
├── refactor-analyzer.md        # Code quality analysis (Haiku 4.5)
└── documentation-writer.md     # Documentation generation (Haiku 4.5)
```

#### 2. New Slash Commands

```
.claude/commands/
├── dev/research-explore.md     # Deep codebase exploration
└── security/scan.md            # Comprehensive security scan
```

### Modified Files

#### 3. Existing Command Updates

```
.claude/commands/dev/
├── implement.md                # Add research delegation
└── refactor-secure.md          # Add security scanner delegation

.claude/commands/test/
└── scaffold.md                 # Add test generator delegation

.claude/commands/docs/
└── generate.md                 # Add documentation writer delegation
```

### Configuration Files

#### 4. Environment Configuration

```
.env.example                    # Add DISABLE_DELEGATION flag
docs/ai/CLAUDE.md               # Document delegation behavior
```

---

## Implementation Strategy

### Phase 1: Core Sub-Agent Specifications (2 hours)

#### 1.1 Research Agent

**File:** `.claude/agents/research-agent.md`

**Capabilities:**

- Deep codebase exploration using Glob, Grep, Read tools
- Pattern and architecture discovery
- Similar implementation analysis
- Technology stack assessment

**Input:**

```typescript
{
  task: string; // Research task description
  focus_areas?: string[]; // Optional specific areas
  scope?: 'full' | 'targeted'; // Default: targeted
}
```

**Output Format:**

```markdown
## Key Findings

- [3-5 bullet points with file:line references]

## Architecture Patterns

- [Identified patterns with examples]

## Recommendations

- [Actionable next steps]

## Code Locations

- [Relevant files and functions]
```

**Token Budget:** 50K input exploration → <5K output summary

#### 1.2 Security Scanner

**File:** `.claude/agents/security-scanner.md`

**Capabilities:**

- RLS policy validation (Supabase)
- OWASP Top 10 vulnerability checks
- SQL injection risk detection
- Environment variable exposure
- XSS vulnerability scanning

**Input:**

```typescript
{
  scan_type: 'rls' | 'owasp' | 'full';
  targets?: string[]; // Specific files/patterns
  severity_threshold?: 'critical' | 'high' | 'medium' | 'low';
}
```

**Output Format:**

```markdown
## Critical Findings (P0)

- [Severity, location, description, remediation]

## High Priority Findings (P1)

- [Same format]

## Medium/Low Findings

- [Summary only]

## Pass/Fail Status

- [Overall security posture]
```

**Token Budget:** 30K input scanning → <5K output report

#### 1.3 Test Generator

**File:** `.claude/agents/test-generator.md`

**Capabilities:**

- Unit test generation (Vitest + React Testing Library)
- E2E test generation (Playwright)
- Integration test generation
- Test coverage analysis

**Input:**

```typescript
{
  test_type: 'unit' | 'e2e' | 'integration';
  targets: string[]; // Files/components to test
  coverage_goal?: number; // Default: 70%
}
```

**Output Format:**

```markdown
## Generated Tests

- [Test file paths with line counts]

## Coverage Strategy

- [What's covered and why]

## Edge Cases Covered

- [List of edge cases]

## Mock/Fixture Suggestions

- [Required test infrastructure]
```

**Token Budget:** 20K input analysis → <3K output summary + test files

#### 1.4 Refactor Analyzer

**File:** `.claude/agents/refactor-analyzer.md`

**Capabilities:**

- Complexity analysis (cyclomatic, cognitive)
- Coupling and cohesion detection
- Performance optimization opportunities
- Code smell identification

**Input:**

```typescript
{
  targets: string[]; // Files to analyze
  focus?: 'complexity' | 'coupling' | 'performance' | 'all';
  priority_threshold?: 'critical' | 'high' | 'medium';
}
```

**Output Format:**

```markdown
## Critical Refactoring Opportunities

- [Priority, file:line, issue, impact, effort]

## Code Smells Identified

- [Categorized by type]

## Complexity Metrics

- [High-complexity functions with metrics]

## Recommendations

- [Prioritized refactoring plan]
```

**Token Budget:** 40K input analysis → <5K output report

#### 1.5 Documentation Writer

**File:** `.claude/agents/documentation-writer.md`

**Capabilities:**

- JSDoc generation for components
- README section generation
- ADR (Architecture Decision Record) drafting
- API documentation

**Input:**

```typescript
{
  doc_type: 'jsdoc' | 'readme' | 'adr' | 'api';
  targets: string[]; // Files/components to document
  style?: 'concise' | 'detailed'; // Default: concise
}
```

**Output Format:**

```markdown
## Documentation Draft

- [Generated documentation with formatting]

## Code Examples

- [Usage examples where applicable]

## Accessibility Notes

- [For UI components]
```

**Token Budget:** 15K input analysis → <3K output draft

### Phase 2: Command Integration (4-6 hours)

#### 2.1 Update `/dev:implement`

**Current Behavior:**

```markdown
1. Read issue/feature request
2. Research codebase manually (50K tokens)
3. Plan implementation
4. Write code
```

**New Behavior:**

```markdown
1. Read issue/feature request
2. Delegate research to research-agent (returns <5K summary)
3. Plan implementation based on summary
4. Write code
```

**Implementation:**

```markdown
## Research Phase

Before implementing, delegate codebase research:

<Task tool with subagent_type="research-agent">
Input: {
  task: "Research {feature} implementation patterns",
  focus_areas: ["relevant areas from issue"],
  scope: "targeted"
}
</Task>

Review research summary and proceed with implementation.
```

**Savings:** 50K → 5K Sonnet tokens (90% reduction in research phase)

#### 2.2 Update `/dev:refactor-secure`

**New Delegation:**

```markdown
## Security Analysis

Delegate security scanning to security-scanner:

<Task tool with subagent_type="security-scanner">
Input: {
  scan_type: "full",
  targets: [files being refactored],
  severity_threshold: "medium"
}
</Task>

Delegate refactoring analysis to refactor-analyzer:

<Task tool with subagent_type="refactor-analyzer">
Input: {
  targets: [files being refactored],
  focus: "all",
  priority_threshold: "medium"
}
</Task>

Review consolidated reports and implement fixes.
```

**Savings:** 70K → 10K Sonnet tokens (86% reduction)

#### 2.3 Update `/test:scaffold`

**New Delegation:**

```markdown
## Test Generation

Delegate test generation to test-generator:

<Task tool with subagent_type="test-generator">
Input: {
  test_type: "{unit|e2e|integration}",
  targets: [components/functions to test],
  coverage_goal: 70
}
</Task>

Review generated tests, approve or request adjustments.
```

**Savings:** 20K → 3K Sonnet tokens (85% reduction)

#### 2.4 Update `/docs:generate`

**New Delegation:**

```markdown
## Documentation Generation

Delegate documentation to documentation-writer:

<Task tool with subagent_type="documentation-writer">
Input: {
  doc_type: "{jsdoc|readme|adr|api}",
  targets: [files to document],
  style: "concise"
}
</Task>

Review generated documentation, approve or refine.
```

**Savings:** 15K → 3K Sonnet tokens (80% reduction)

### Phase 3: New Automation Commands (2 hours)

#### 3.1 New Command: `/research:explore`

**File:** `.claude/commands/dev/research-explore.md`

**Purpose:** Deep codebase exploration for understanding unfamiliar code

**Usage:**

```bash
/research:explore "How does authentication work?"
/research:explore "Find all API endpoints"
/research:explore "Analyze state management patterns"
```

**Implementation:**

```markdown
---
model: sonnet-4.5
name: /research:explore
description: Deep codebase exploration
tools: Task
---

# Research & Explore

Direct delegation to research-agent with user query.

<Task tool with subagent_type="research-agent">
Input: {
  task: "{user query}",
  scope: "full"
}
</Task>

Present findings to user with option to drill deeper.
```

#### 3.2 New Command: `/security:scan`

**File:** `.claude/commands/security/scan.md`

**Purpose:** Comprehensive security validation

**Usage:**

```bash
/security:scan --type=rls
/security:scan --type=owasp
/security:scan --type=full --severity=critical
```

**Implementation:**

```markdown
---
model: sonnet-4.5
name: /security:scan
description: Comprehensive security scanning
tools: Task
---

# Security Scan

Direct delegation to security-scanner with scan parameters.

<Task tool with subagent_type="security-scanner">
Input: {
  scan_type: "{rls|owasp|full}",
  severity_threshold: "{critical|high|medium|low}"
}
</Task>

Present security report to user with remediation steps.
```

---

## Testing Strategy

### TDD Order: Contracts → Integration → E2E → Unit

#### Phase 1: Contract Definition (1 hour)

**File:** `tests/sub-agents/contracts.md`

**Contracts:**

1. **Research Agent Contract**

   - Input: Valid task object with required fields
   - Output: Summary <5K tokens with required sections
   - Timeout: <60 seconds for targeted research
   - Success: All required sections present, actionable insights

2. **Security Scanner Contract**

   - Input: Valid scan configuration
   - Output: Report <5K tokens with findings categorized by severity
   - Timeout: <90 seconds for full scan
   - Success: Critical findings highlighted, pass/fail clear

3. **Test Generator Contract**

   - Input: Valid test type and targets
   - Output: Test files generated with coverage strategy
   - Timeout: <45 seconds
   - Success: Tests executable, coverage strategy documented

4. **Refactor Analyzer Contract**

   - Input: Valid file list
   - Output: Report <5K tokens with prioritized recommendations
   - Timeout: <60 seconds
   - Success: Metrics calculated, recommendations actionable

5. **Documentation Writer Contract**
   - Input: Valid doc type and targets
   - Output: Documentation draft <3K tokens
   - Timeout: <30 seconds
   - Success: Properly formatted, code examples included

#### Phase 2: Integration Tests (3 hours)

**File:** `tests/sub-agents/delegation.test.ts`

**Tests:**

```typescript
describe('Sub-Agent Delegation', () => {
  test('research-agent returns valid summary structure', async () => {
    const result = await delegateToResearchAgent({
      task: 'Find authentication patterns',
      scope: 'targeted',
    });

    expect(result).toHaveProperty('keyFindings');
    expect(result).toHaveProperty('architecturePatterns');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('codeLocations');
    expect(result.summary.length).toBeLessThan(5000);
  });

  test('security-scanner identifies RLS policy gaps', async () => {
    const result = await delegateToSecurityScanner({
      scan_type: 'rls',
      targets: ['packages/db/src/**'],
    });

    expect(result).toHaveProperty('criticalFindings');
    expect(result).toHaveProperty('passFailStatus');
    expect(result.summary.length).toBeLessThan(5000);
  });

  test('test-generator creates executable tests', async () => {
    const result = await delegateToTestGenerator({
      test_type: 'unit',
      targets: ['src/components/Button.tsx'],
      coverage_goal: 70,
    });

    expect(result).toHaveProperty('generatedTests');
    expect(result).toHaveProperty('coverageStrategy');
    expect(result.testFiles.length).toBeGreaterThan(0);
  });

  test('parallel delegation runs concurrently', async () => {
    const start = Date.now();

    const [research, security] = await Promise.all([
      delegateToResearchAgent({ task: 'Find auth patterns' }),
      delegateToSecurityScanner({ scan_type: 'full' }),
    ]);

    const duration = Date.now() - start;

    // Should complete faster than sequential (< 120s vs 150s)
    expect(duration).toBeLessThan(120000);
    expect(research).toBeDefined();
    expect(security).toBeDefined();
  });

  test('delegation respects DISABLE_DELEGATION env var', async () => {
    process.env.DISABLE_DELEGATION = 'true';

    const result = await delegateToResearchAgent({
      task: 'Find patterns',
    });

    // Should use Sonnet instead of Haiku
    expect(result.metadata.model).toBe('sonnet-4.5');
  });
});
```

#### Phase 3: E2E Tests (2 hours)

**File:** `tests/sub-agents/e2e.spec.ts`

**Tests:**

```typescript
describe('Sub-Agent E2E Workflows', () => {
  test('/dev:implement delegates research automatically', async () => {
    // Trigger /dev:implement command
    const output = await runCommand('/dev:implement "Add user profile page"');

    // Verify research delegation occurred
    expect(output).toContain('Researching codebase patterns');
    expect(output).toContain('Key Findings');

    // Verify summary is concise
    const summarySize = extractSummarySize(output);
    expect(summarySize).toBeLessThan(5000);
  });

  test('/security:scan produces comprehensive report', async () => {
    const output = await runCommand('/security:scan --type=full');

    expect(output).toContain('Critical Findings');
    expect(output).toContain('Pass/Fail Status');
    expect(output).toMatch(/\d+ total findings/);
  });

  test('/research:explore returns actionable insights', async () => {
    const output = await runCommand(
      '/research:explore "How does auth work?"'
    );

    expect(output).toContain('Key Findings');
    expect(output).toContain('Architecture Patterns');
    expect(output).toContain('Code Locations');
  });

  test('Command integration preserves backward compatibility', async () => {
    // Old commands should still work without errors
    const implementOutput = await runCommand('/dev:implement "Fix bug"');
    expect(implementOutput).not.toContain('ERROR');

    const testOutput = await runCommand('/test:scaffold Button');
    expect(testOutput).not.toContain('ERROR');
  });
});
```

#### Phase 4: Unit Tests (1 hour)

**File:** `tests/sub-agents/utils.test.ts`

**Tests:**

```typescript
describe('Sub-Agent Utilities', () => {
  test('detectDelegatableTask identifies research tasks', () => {
    expect(detectDelegatableTask('Research auth patterns')).toBe('research');
    expect(detectDelegatableTask('Find similar implementations')).toBe(
      'research'
    );
  });

  test('formatSummary truncates long outputs', () => {
    const longOutput = 'x'.repeat(10000);
    const formatted = formatSummary(longOutput, 5000);

    expect(formatted.length).toBeLessThanOrEqual(5000);
    expect(formatted).toContain('...[truncated]');
  });

  test('validateAgentOutput checks required fields', () => {
    const validOutput = {
      keyFindings: ['finding 1'],
      recommendations: ['rec 1'],
    };

    expect(validateAgentOutput(validOutput, 'research')).toBe(true);

    const invalidOutput = { keyFindings: [] };
    expect(validateAgentOutput(invalidOutput, 'research')).toBe(false);
  });
});
```

### Test Coverage Goals

- **Sub-agent specs:** N/A (documentation files)
- **Delegation logic:** 80% (critical path)
- **Command integration:** 70% (integration tests)
- **Utilities:** 90% (pure functions)

---

## Security Considerations

### 1. Prompt Injection Prevention

**Risk:** User input passed to sub-agents could contain malicious instructions

**Mitigation:**

- Sub-agents have restricted tool access (Read, Glob, Grep only)
- No Write or Edit tools for security-scanner and research-agent
- Clear role boundaries in agent prompts
- Output validation before presenting to user

### 2. Context Leakage

**Risk:** Sensitive code exposed in sub-agent summaries

**Mitigation:**

- Sub-agents instructed to summarize, not copy-paste code
- Output validation checks for overly long summaries
- User approval required before applying changes
- `.env` and credential files excluded from scanning

### 3. Token Budget Exhaustion

**Risk:** Sub-agents exceed token budgets and increase costs

**Mitigation:**

- Hard limits on summary size (<5K tokens)
- Timeout enforcement (30-90 seconds)
- Cost tracking per delegation
- Fallback to Sonnet if Haiku inadequate

### 4. Dependency Chain Attacks

**Risk:** None (uses existing Claude Code agent system)

**Mitigation:** No new dependencies required

---

## Dependencies

### Existing System (No New Dependencies)

- **Claude Code Agent System:** Already supports `Task` tool and agent specifications
- **Claude Code Tools:** Read, Glob, Grep, Bash, Write, Edit
- **YAML Frontmatter Parsing:** Already supported in `.claude/agents/`

### Justification for Zero New Dependencies

- Leverages existing agent infrastructure
- Uses standard Claude Code tools
- No external APIs or libraries
- Purely configuration-based implementation

---

## Risk & Mitigation

### Risk 1: Haiku 4.5 Quality Insufficient

**Probability:** Medium
**Impact:** High (degrades user experience)

**Mitigation:**

- Start with research-agent only (lowest risk)
- Measure quality metrics (task success rate)
- Maintain fallback to Sonnet if quality <90%
- Gradual rollout: opt-in → default → always-on

**Rollback:** Disable delegation via `DISABLE_DELEGATION=true`

### Risk 2: Coordination Overhead Exceeds Benefits

**Probability:** Low
**Impact:** Medium (negates performance gains)

**Mitigation:**

- Measure end-to-end task time before/after
- Optimize delegation only if net positive (≥30% faster)
- Parallel execution for independent tasks
- Cache research results for similar queries

**Rollback:** Remove delegation from commands

### Risk 3: User Confusion About Delegation

**Probability:** Medium
**Impact:** Low (minor UX friction)

**Mitigation:**

- Clear progress indicators ("Researching patterns...")
- Transparent summaries show what was delegated
- Documentation in `docs/ai/CLAUDE.md`
- Opt-out mechanism via environment variable

**Rollback:** Add `--no-delegate` flag to commands

### Risk 4: Context Loss Between Agents

**Probability:** Low
**Impact:** Medium (incomplete information)

**Mitigation:**

- Sub-agents return structured, complete summaries
- Main agent maintains conversation context
- Follow-up questions supported ("Show me full findings")
- Escalation path if Haiku summary inadequate

**Rollback:** Re-run task with Sonnet if needed

### Risk 5: Cost Tracking Inaccuracy

**Probability:** Low
**Impact:** Low (financial)

**Mitigation:**

- Track tokens per delegation (input + output)
- Calculate cost per task (Haiku vs Sonnet)
- Report savings in command outputs
- Monitor monthly cost trends

**Rollback:** Disable delegation if costs increase

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Duration:** 2 days

**Tasks:**

1. Create `.claude/agents/` directory structure
2. Implement research-agent.md specification
3. Write delegation contracts in `tests/sub-agents/contracts.md`
4. Create integration tests for research-agent
5. Validate research-agent with real codebase queries

**Success Criteria:**

- Research-agent returns valid summaries <5K tokens
- Integration tests pass
- Quality matches or exceeds manual research

### Phase 2: Security & Testing Agents (Week 1)

**Duration:** 2 days

**Tasks:**

1. Implement security-scanner.md specification
2. Implement test-generator.md specification
3. Create integration tests for both agents
4. Validate with real security scans and test generation

**Success Criteria:**

- Security-scanner identifies RLS gaps accurately
- Test-generator creates executable tests
- False positive rate <10%

### Phase 3: Command Integration (Week 2)

**Duration:** 3 days

**Tasks:**

1. Update `/dev:implement` to delegate research
2. Update `/dev:refactor-secure` to delegate security + refactoring
3. Update `/test:scaffold` to delegate test generation
4. Update `/docs:generate` to delegate documentation
5. Create E2E tests for updated commands

**Success Criteria:**

- Commands work identically from user perspective
- Delegation is transparent
- Backward compatibility maintained
- 30% faster on research-heavy tasks

### Phase 4: New Commands & Optimization (Week 2)

**Duration:** 2 days

**Tasks:**

1. Create `/research:explore` command
2. Create `/security:scan` command
3. Implement parallel execution for independent tasks
4. Add progress indicators
5. Implement `DISABLE_DELEGATION` env var

**Success Criteria:**

- New commands provide value over existing ones
- Parallel execution works correctly
- Opt-out mechanism functions

### Phase 5: Documentation & Validation (Week 2)

**Duration:** 1 day

**Tasks:**

1. Update `docs/ai/CLAUDE.md` with delegation behavior
2. Add examples to command documentation
3. Create troubleshooting guide
4. Measure and report cost/time savings

**Success Criteria:**

- Documentation complete and accurate
- Users understand when delegation occurs
- Cost savings validated (≥60% on routine tasks)

---

## Validation Criteria

### Performance Metrics

- [ ] Research tasks complete ≥30% faster
- [ ] Routine tasks cost ≥60% less
- [ ] Sub-agent responses <5K tokens (95% of time)
- [ ] Parallel execution works correctly
- [ ] Main context stays <50K tokens per conversation

### Quality Metrics

- [ ] Task success rate ≥90% (no degradation)
- [ ] User can act on summaries without re-reading source
- [ ] Security scan false positives <10%
- [ ] Generated tests executable and meaningful

### User Experience

- [ ] Delegation is transparent (clear progress indicators)
- [ ] Users prefer delegated workflow (informal feedback)
- [ ] Backward compatibility maintained (zero breaking changes)
- [ ] Opt-out mechanism works (`DISABLE_DELEGATION=true`)

### Cost Efficiency

- [ ] Overall token usage reduces ≥30%
- [ ] Per-task costs reduce ≥40% for routine work
- [ ] No increase in failure rates or rework
- [ ] ROI positive within first month

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Token usage per task** (before/after sub-agents)
2. **Cost per task** (before/after sub-agents)
3. **Sub-agent response size** (should be <5K tokens)
4. **Task completion time** (end-to-end)
5. **Task success rate** (% of tasks completed successfully)
6. **User satisfaction** (informal feedback)

### Success Thresholds

- Token savings: ≥30% on research tasks
- Cost savings: ≥60% on sub-agent tasks
- Response size: <5K tokens per sub-agent (95th percentile)
- Quality: ≥90% task success rate
- Speed: ≥30% faster on research-heavy tasks

### Monitoring Approach

**Manual tracking during rollout:**

- Log token counts per delegation
- Calculate cost differential (Haiku vs Sonnet)
- Track task success/failure rates
- Collect user feedback during implementation

**Future enhancement (out of scope):**

- Automated cost tracking dashboard
- A/B testing framework
- Real-time quality monitoring

---

## Rollback Plan

### Trigger Conditions

Rollback if any of:

1. Task success rate drops below 85%
2. User feedback is overwhelmingly negative
3. Costs increase instead of decrease
4. Security vulnerabilities introduced
5. Breaking changes to existing workflows

### Rollback Steps

1. **Immediate:** Set `DISABLE_DELEGATION=true` in `.env`
2. **Commands:** Remove delegation logic from updated commands
3. **Testing:** Verify all commands work without delegation
4. **Communication:** Notify users of rollback and reasons
5. **Analysis:** Investigate root cause, plan fixes

### Recovery Time Objective

- **Immediate disable:** <5 minutes (env var change)
- **Full rollback:** <1 hour (revert command changes)
- **Verification:** <2 hours (test all workflows)

---

## Next Steps

After plan approval:

1. Create task breakdown (`/tasks`) - granular implementation tickets
2. Implement Phase 1 (research-agent + contracts)
3. Validate quality and cost savings
4. Proceed to subsequent phases if Phase 1 successful
5. Track metrics and adjust strategy based on results

---

**Implementation Timeline:** 2 weeks (10 working days)
**Estimated Effort:** 40-50 hours
**Risk Level:** Medium (new architecture pattern)
**Dependencies:** None (uses existing Claude Code system)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>