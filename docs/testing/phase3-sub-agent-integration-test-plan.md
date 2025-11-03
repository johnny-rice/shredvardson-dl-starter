---
title: Phase 3 Testing Plan - Sub-Agent Workflow Integration
spec: SPEC-20251017-sub-agent-architecture
created: 2025-11-02
status: ready
---

# Phase 3 Testing Plan: Sub-Agent Workflow Integration

## Overview

This document defines the comprehensive testing strategy for validating the sub-agent workflow integration (Issue #257), measuring actual token savings vs. projections, and ensuring quality parity with legacy workflows.

**Testing Goals:**

- Validate 57% projected token savings across all 4 workflow commands
- Ensure quality parity (≥90% task success rate)
- Measure real-world execution time improvements
- Verify graceful degradation on sub-agent failures
- Confirm parallel execution efficiency

---

## Test Scenarios

### Scenario 1: `/spec:plan` with Research + Security (Spec-Driven Lane)

**Baseline (Legacy - No Sub-Agents):**

- Projected tokens: ~120K Sonnet ($2.16)
- Execution time: ~45-60 seconds
- Quality: Full design discovery with manual research

**Optimized (With Sub-Agents):**

- Projected tokens: ~50K total (45K Haiku + 5K Sonnet = $0.36 + $0.09 = $0.45)
- Projected savings: 58% tokens, 79% cost
- Execution: Research + Security in parallel, then design discovery
- Quality: Research-enriched design discovery with security pre-checks

**Test Cases:**

#### TC1.1: Standard Spec-Driven Feature

- **Input:** New authentication feature spec
- **Expected Sub-Agent Behavior:**
  - Research Agent finds similar auth patterns in codebase
  - Security Scanner identifies RLS gaps, auth vulnerabilities
  - Both complete in <30s (parallel execution)
- **Expected Sonnet Behavior:**
  - Loads sub-agent findings (~5K tokens)
  - Asks design questions informed by research
  - References code locations from research findings
  - Includes security concerns from scanner in trade-offs
- **Success Metrics:**
  - Token usage ≤55K total
  - Cost ≤$0.50
  - Quality: Plan references research findings and security recommendations
  - User survey: "Design options felt more grounded in existing codebase" (≥4/5)

#### TC1.2: Simple Lane Feature (No Sub-Agents)

- **Input:** Simple bugfix spec
- **Expected Behavior:**
  - Skips sub-agent delegation (simple lane)
  - Creates basic plan without design discovery
- **Success Metrics:**
  - Token usage ≤20K Sonnet
  - Cost ≤$0.36
  - Execution time ≤15s

#### TC1.3: Sub-Agent Failure - Research Agent Timeout

- **Input:** Spec with complex research requirements
- **Expected Behavior:**
  - Research Agent times out after 120s
  - Orchestrator logs error, continues without research findings
  - Security Scanner completes successfully
  - Sonnet proceeds with design discovery using security findings only
- **Success Metrics:**
  - Graceful degradation (no crash)
  - Warning message logged
  - Plan created but without research references
  - Quality ≥80% (slightly degraded but acceptable)

---

### Scenario 2: `/spec:specify` with Research Agent

**Baseline (Legacy):**

- Projected tokens: ~30K Sonnet ($0.54)
- Execution time: ~15-20s
- Quality: Generic spec template

**Optimized (With Research Agent):**

- Projected tokens: ~13K total (10K Haiku + 3K Sonnet = $0.06 + $0.05 = $0.11)
- Projected savings: 57% tokens, 80% cost
- Quality: Spec enriched with similar implementation references

**Test Cases:**

#### TC2.1: Feature with Similar Implementations

- **Input:** "Add email notification system"
- **Expected Behavior:**
  - Research Agent finds existing notification patterns
  - Returns code references and architecture patterns
  - Spec includes references section with findings
- **Success Metrics:**
  - Token usage ≤15K total
  - Cost ≤$0.15
  - Spec includes ≥3 code references from research
  - References section populated with similar implementations

#### TC2.2: Novel Feature (No Similar Implementations)

- **Input:** "Add blockchain integration"
- **Expected Behavior:**
  - Research Agent searches but finds no similar patterns
  - Returns empty findings with "no similar implementations found"
  - Spec created with generic template
- **Success Metrics:**
  - Token usage ≤15K total
  - Graceful handling of empty research results
  - Spec still valid with placeholder references

---

### Scenario 3: `/spec:tasks` with Research Agent

**Baseline (Legacy):**

- Projected tokens: ~25K Sonnet ($0.45)
- Execution time: ~15s
- Quality: Task breakdown without dependency analysis

**Optimized (With Research Agent):**

- Projected tokens: ~11K total (8K Haiku + 3K Sonnet = $0.04 + $0.05 = $0.09)
- Projected savings: 56% tokens, 80% cost
- Quality: Task breakdown with dependency insights from research

**Test Cases:**

#### TC3.1: Complex Multi-Phase Feature

- **Input:** Spec for payment processing system
- **Expected Behavior:**
  - Research Agent identifies dependencies (Stripe SDK, webhook handlers)
  - Returns dependency graph and order recommendations
  - Task breakdown reflects proper sequencing
- **Success Metrics:**
  - Token usage ≤13K total
  - Cost ≤$0.12
  - Tasks ordered based on research-identified dependencies
  - External library setup tasks appear first

#### TC3.2: Independent Task Feature

- **Input:** Spec for UI component library
- **Expected Behavior:**
  - Research Agent finds minimal dependencies
  - Tasks can be parallelized
  - Task breakdown notes independent execution
- **Success Metrics:**
  - Token usage ≤13K total
  - Task list includes parallelization hints

---

### Scenario 4: `/code` with Security Pre-Check

**Baseline (Legacy):**

- Projected tokens: ~50K Sonnet ($0.90)
- Execution time: ~30s
- Quality: Implementation without security pre-checks

**Optimized (With Security Scanner):**

- Projected tokens: ~28K total (20K Haiku + 8K Sonnet = $0.11 + $0.14 = $0.25)
- Projected savings: 44% tokens, 72% cost
- Quality: Implementation with security vulnerabilities caught early

**Test Cases:**

#### TC4.1: Feature with Security Risks

- **Input:** "Implement admin dashboard"
- **Expected Behavior:**
  - Security Scanner identifies missing RLS policies
  - Reports P0 auth/authorization gaps
  - Sonnet includes security patterns in implementation
- **Success Metrics:**
  - Token usage ≤30K total
  - Cost ≤$0.30
  - Generated code includes security recommendations
  - No P0 vulnerabilities in implementation

#### TC4.2: Non-Security-Sensitive Feature

- **Input:** "Add CSS animation utilities"
- **Expected Behavior:**
  - Security Scanner finds no vulnerabilities
  - Returns minimal findings
  - Sonnet proceeds with straightforward implementation
- **Success Metrics:**
  - Token usage ≤30K total
  - Security scan overhead ≤5s

---

## Token Usage Tracking Harness

### Instrumentation Strategy

**Pre-Execution:**

1. Capture initial conversation token count (API metadata)
2. Log workflow start time
3. Record sub-agent invocation details

**During Execution:**

1. Track sub-agent token usage (from Agent Tool API response)
2. Log Sonnet token usage (from main conversation API metadata)
3. Measure execution time per phase

**Post-Execution:**

1. Calculate total tokens used (sub-agents + Sonnet)
2. Compute cost using pricing model:
   - Haiku: $0.25/1M input, $1.25/1M output (average $0.55/1M)
   - Sonnet: $3/1M input, $15/1M output (average $9/1M)
3. Compare to baseline projection
4. Generate test report

### Token Tracking Script

Location: [.claude/skills/agent-orchestrator/scripts/track-tokens.ts](.claude/skills/agent-orchestrator/scripts/track-tokens.ts)

```typescript
/**
 * Token tracking harness for sub-agent workflow testing
 */

interface TokenUsageReport {
  workflow: string;
  timestamp: string;
  sub_agent_tokens: {
    research?: number;
    security?: number;
    test?: number;
  };
  sonnet_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  execution_time_ms: number;
  baseline_comparison: {
    baseline_tokens: number;
    baseline_cost_usd: number;
    token_savings_pct: number;
    cost_savings_pct: number;
  };
}

// Haiku pricing: ~$0.55/1M average (input $0.25, output $1.25)
const HAIKU_COST_PER_TOKEN = 0.55 / 1_000_000;

// Sonnet pricing: ~$9/1M average (input $3, output $15)
const SONNET_COST_PER_TOKEN = 9 / 1_000_000;

function calculateCost(haikuTokens: number, sonnetTokens: number): number {
  return haikuTokens * HAIKU_COST_PER_TOKEN + sonnetTokens * SONNET_COST_PER_TOKEN;
}

function generateReport(data: TokenUsageReport): void {
  console.log('\n=== Token Usage Report ===\n');
  console.log(`Workflow: ${data.workflow}`);
  console.log(`Timestamp: ${data.timestamp}`);
  console.log(`\nSub-Agent Tokens:`);

  if (data.sub_agent_tokens.research) {
    console.log(`  Research: ${data.sub_agent_tokens.research.toLocaleString()}`);
  }
  if (data.sub_agent_tokens.security) {
    console.log(`  Security: ${data.sub_agent_tokens.security.toLocaleString()}`);
  }
  if (data.sub_agent_tokens.test) {
    console.log(`  Test: ${data.sub_agent_tokens.test.toLocaleString()}`);
  }

  console.log(`\nSonnet Tokens: ${data.sonnet_tokens.toLocaleString()}`);
  console.log(`Total Tokens: ${data.total_tokens.toLocaleString()}`);
  console.log(`Total Cost: $${data.total_cost_usd.toFixed(4)}`);
  console.log(`Execution Time: ${(data.execution_time_ms / 1000).toFixed(2)}s`);

  console.log(`\n=== Baseline Comparison ===\n`);
  console.log(`Baseline Tokens: ${data.baseline_comparison.baseline_tokens.toLocaleString()}`);
  console.log(`Baseline Cost: $${data.baseline_comparison.baseline_cost_usd.toFixed(4)}`);
  console.log(`Token Savings: ${data.baseline_comparison.token_savings_pct.toFixed(1)}%`);
  console.log(`Cost Savings: ${data.baseline_comparison.cost_savings_pct.toFixed(1)}%`);

  // Pass/Fail based on projections
  const passTokens = data.baseline_comparison.token_savings_pct >= 50;
  const passCost = data.baseline_comparison.cost_savings_pct >= 50;

  console.log(`\n=== Test Result ===\n`);
  console.log(`Token Savings Target (≥50%): ${passTokens ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cost Savings Target (≥50%): ${passCost ? '✅ PASS' : '❌ FAIL'}`);
}
```

---

## Test Execution Plan

### Phase 3.1: Controlled Testing (Week 1)

**Objective:** Validate token tracking and sub-agent integration in isolated scenarios

**Tasks:**

1. Create 4 test spec files (auth feature, simple bugfix, payment system, admin dashboard)
2. Execute each workflow command with token tracking enabled
3. Collect baseline measurements (without sub-agents)
4. Collect optimized measurements (with sub-agents)
5. Generate comparison reports

**Success Criteria:**

- All 4 workflows execute without errors
- Token tracking harness produces valid reports
- Savings ≥50% for all workflows

### Phase 3.2: Real-World Testing (Week 2)

**Objective:** Validate sub-agent integration with actual development workflows

**Tasks:**

1. Select 2-3 real features from backlog
2. Execute full workflow: `/specify` → `/plan` → `/tasks` → `/code`
3. Measure end-to-end token usage and cost
4. Collect developer feedback on quality
5. Document any degradation or issues

**Success Criteria:**

- End-to-end token savings ≥40%
- Quality parity (developers rate ≥4/5)
- No P0 bugs introduced by sub-agent findings

### Phase 3.3: Failure Testing (Week 2)

**Objective:** Validate graceful degradation and error handling

**Tasks:**

1. Simulate Research Agent timeout (kill process after 60s)
2. Simulate Security Scanner JSON parsing failure (malformed response)
3. Simulate parallel execution failure (both agents timeout)
4. Verify fallback behavior and error messages

**Success Criteria:**

- All failures handled gracefully (no crashes)
- Fallback to Sonnet-only workflow succeeds
- Clear error messages logged
- User notified of degraded mode

### Phase 3.4: Performance Testing (Week 3)

**Objective:** Validate parallel execution and latency improvements

**Tasks:**

1. Measure sequential vs. parallel sub-agent execution
2. Test with 2-agent, 3-agent configurations
3. Measure total workflow time (end-to-end)
4. Identify bottlenecks

**Success Criteria:**

- Parallel execution ≥2x faster than sequential
- End-to-end workflow time reduced by ≥20%
- No network/API rate limiting issues

---

## Quality Assurance Metrics

### Metric 1: Task Success Rate

**Definition:** Percentage of workflows that complete successfully and produce usable output

**Target:** ≥90% (maintain current quality)

**Measurement:**

- Manual review of generated plans, tasks, and code
- Developer rating (1-5 scale)
- Acceptance by user without major revisions

### Metric 2: Research Findings Usefulness

**Definition:** Percentage of research findings that are referenced in final output

**Target:** ≥60% of findings used

**Measurement:**

- Count references to research findings in plans
- Track code locations cited in design decisions
- Developer feedback on relevance

### Metric 3: Security Findings Accuracy

**Definition:** Percentage of security findings that are true positives

**Target:** ≤10% false positives

**Measurement:**

- Manual review by security expert
- Classification: true positive, false positive, false negative
- Severity distribution (P0, high, medium, low)

### Metric 4: Token Savings Accuracy

**Definition:** Actual token savings vs. projected savings

**Target:** ±10% of projection

**Measurement:**

- Compare tracked tokens to baseline
- Calculate variance from projection
- Identify outliers and root causes

---

## Cost-Benefit Analysis

### Projected Annual Savings

**Assumptions:**

- 10 workflows per month (modest estimate)
- Average savings: $1.24 per workflow (57% reduction)

**Annual Savings:**

- 10 workflows/month × 12 months = 120 workflows/year
- 120 workflows × $1.24 savings = **$148.80/year**

**ROI:**

- Phase 1-2 development time: ~8 hours ($800 at $100/hr)
- Payback period: ~5.4 years at current volume

**Break-Even Analysis:**

- Need ~650 workflows/year to break even in Year 1
- Need ~55 workflows/month to break even

**Recommendation:**

- If actual workflow volume <20/month → ROI is low but quality improvements still valuable
- If actual workflow volume >50/month → Strong ROI case
- Monitor usage and re-evaluate after 3 months

---

## Documentation Updates

### Files to Update Post-Testing

1. **[docs/implementation/sub-agent-workflow-integration.md](docs/implementation/sub-agent-workflow-integration.md)**
   - Add Phase 3 test results
   - Update token savings with actual measurements
   - Document lessons learned

2. **[docs/decisions/ADR-008-sub-agent-orchestration.md](docs/decisions/ADR-008-sub-agent-orchestration.md)**
   - Update "Consequences" section with actual outcomes
   - Add "Follow-Up Decisions" if needed

3. **[.claude/skills/agent-orchestrator/README.md](.claude/skills/agent-orchestrator/README.md)**
   - Add troubleshooting section
   - Document known limitations
   - Include usage examples with token estimates

4. **[specs/SPEC-20251017-sub-agent-architecture.md](specs/SPEC-20251017-sub-agent-architecture.md)**
   - Update acceptance criteria with actual results
   - Mark as "completed" in frontmatter

---

## Next Steps

After Phase 3 testing completes:

1. **If results meet targets (≥50% savings, ≥90% quality):**
   - Mark Issue #257 as complete
   - Update documentation with actual metrics
   - Promote integration to production use
   - Monitor usage for 1 month, then re-evaluate

2. **If results fall short (<50% savings or <90% quality):**
   - Identify root causes (profiling, logging)
   - Adjust sub-agent prompts or routing logic
   - Re-test with optimizations
   - Consider rollback if quality degraded

3. **If results exceed targets (>60% savings, ≥95% quality):**
   - Expand to additional workflow commands
   - Explore more aggressive optimizations
   - Document as case study for future optimizations

---

**Test Plan Status:** READY FOR EXECUTION
**Estimated Effort:** 2-3 weeks (phased testing)
**Owner:** Development Team
**Review Date:** 2025-11-22

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
