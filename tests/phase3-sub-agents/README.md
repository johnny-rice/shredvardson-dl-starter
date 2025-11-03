# Phase 3 Sub-Agent Integration Testing

This directory contains the complete test suite for validating the sub-agent workflow integration (Issue #257, Phase 3).

## Directory Structure

```
tests/phase3-sub-agents/
├── README.md                    # This file
├── specs/                       # Test specification files
│   ├── test-001-auth-feature.md
│   ├── test-002-simple-bugfix.md
│   ├── test-003-payment-system.md
│   └── test-004-admin-dashboard.md
├── reports/                     # Generated test reports (gitignored)
├── run-test.sh                  # Run individual test
└── run-all-tests.sh             # Run full test suite
```

## Test Scenarios

### Test 001: Auth Feature (TC1.1)

- **Workflow:** `/spec:plan`
- **Lane:** spec-driven
- **Sub-Agents:** Research + Security (parallel)
- **Expected Savings:** 58% tokens, 79% cost
- **Purpose:** Validate standard spec-driven feature with research-enriched design discovery

### Test 002: Simple Bugfix (TC1.2)

- **Workflow:** `/spec:plan`
- **Lane:** simple
- **Sub-Agents:** None
- **Expected Savings:** N/A (baseline comparison)
- **Purpose:** Validate simple lane skips sub-agent delegation

### Test 003: Payment System (TC3.1)

- **Workflow:** `/spec:tasks`
- **Lane:** spec-driven
- **Sub-Agents:** Research (dependencies)
- **Expected Savings:** 56% tokens, 80% cost
- **Purpose:** Validate task dependency research with complex multi-phase feature

### Test 004: Admin Dashboard (TC4.1)

- **Workflow:** `/code`
- **Lane:** spec-driven
- **Sub-Agents:** Security (pre-check)
- **Expected Savings:** 44% tokens, 72% cost
- **Purpose:** Validate security scanning catches vulnerabilities early

## Running Tests

### Prerequisites

1. Ensure Phase 1-2 implementation is complete:

   ```bash
   # Verify orchestrator scripts exist
   ls .claude/skills/agent-orchestrator/scripts/
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Run Individual Test

Execute a single test scenario:

```bash
./tests/phase3-sub-agents/run-test.sh <test-num> <workflow>
```

**Examples:**

```bash
# Test 001: Auth feature with /spec:plan
./tests/phase3-sub-agents/run-test.sh 001 /spec:plan

# Test 002: Simple bugfix with /spec:plan
./tests/phase3-sub-agents/run-test.sh 002 /spec:plan

# Test 003: Payment system with /spec:tasks
./tests/phase3-sub-agents/run-test.sh 003 /spec:tasks

# Test 004: Admin dashboard with /code
./tests/phase3-sub-agents/run-test.sh 004 /code
```

### Run Full Test Suite

Execute all test scenarios and generate aggregate report:

```bash
./tests/phase3-sub-agents/run-all-tests.sh
```

**Modes:**

- `simulation` (default): Uses simulated token values for testing the harness
- `real`: Executes actual workflows and measures real token usage

```bash
# Simulation mode (test harness validation)
./tests/phase3-sub-agents/run-all-tests.sh simulation

# Real mode (actual workflow execution)
./tests/phase3-sub-agents/run-all-tests.sh real
```

## Understanding Results

### Individual Test Report

After running a test, you'll see a detailed report like:

```
╔══════════════════════════════════════════════════════════════╗
║          Token Usage Report - Sub-Agent Integration         ║
╚══════════════════════════════════════════════════════════════╝

Workflow:  /spec:plan
Timestamp: 2025-11-02T15:30:45.123Z
Duration:  28.50s

─────────────────────────────────────────────────────────────
  Token Usage Breakdown
─────────────────────────────────────────────────────────────
  Research Agent: 22,000 tokens
  Security Agent: 18,000 tokens
  Sub-Agent Total: 40,000 tokens (Haiku)
  Sonnet Main:     8,000 tokens
  ────────────────────────────────────────────────────────────
  TOTAL:           48,000 tokens

─────────────────────────────────────────────────────────────
  Cost Analysis
─────────────────────────────────────────────────────────────
  Haiku Cost:   $0.0220
  Sonnet Cost:  $0.0720
  ────────────────────────────────────────────────────────────
  TOTAL COST:   $0.0940

─────────────────────────────────────────────────────────────
  Baseline Comparison
─────────────────────────────────────────────────────────────
  Baseline Tokens: 120,000
  Baseline Cost:   $2.1600
  ────────────────────────────────────────────────────────────
  Token Savings:   60.0% (72,000 tokens)
  Cost Savings:    95.7% ($2.0660)

─────────────────────────────────────────────────────────────
  Test Results
─────────────────────────────────────────────────────────────
  Token Savings (≥50%):  ✅ PASS
  Cost Savings (≥50%):   ✅ PASS
```

### Aggregate Report

After running the full suite, an aggregate markdown report is generated:

**Location:** `tests/phase3-sub-agents/reports/aggregate-<timestamp>.md`

**Contents:**

- Summary table with all test results
- Detailed results for each test
- Overall performance metrics
- Pass/fail determination
- Recommendations for next steps

### Success Criteria

A test **PASSES** if:

- Token savings ≥50% compared to baseline
- Cost savings ≥50% compared to baseline
- No workflow execution errors

The full suite **PASSES** if:

- All individual tests pass
- Average token savings ≥50%
- Average cost savings ≥50%

## Interpreting Token Savings

### Token Breakdown

**Haiku tokens** (sub-agents):

- Research Agent: Codebase exploration, pattern discovery
- Security Scanner: Vulnerability detection, RLS policy checks
- Test Generator: Test scaffolding and generation

**Sonnet tokens** (main conversation):

- Loading sub-agent findings
- Design discovery (enriched by research)
- Final plan/task/code generation

### Cost Calculation

**Haiku pricing:** ~$0.55/1M tokens (average of input + output)
**Sonnet pricing:** ~$9/1M tokens (average of input + output)

**Example calculation:**

```
Haiku:  40,000 tokens × $0.55/1M = $0.0220
Sonnet:  8,000 tokens × $9.00/1M = $0.0720
Total:                            = $0.0940
```

**Baseline (no sub-agents):**

```
Sonnet: 120,000 tokens × $9.00/1M = $1.0800
```

**Savings:** $1.0800 - $0.0940 = $0.9860 (91.3%)

## Troubleshooting

### Test Script Fails to Find Spec File

**Error:** `Test spec file not found for test XXX`

**Solution:**

```bash
# Check if spec file exists
ls tests/phase3-sub-agents/specs/test-XXX-*.md

# Ensure test number is 3 digits with leading zeros
./tests/phase3-sub-agents/run-test.sh 001 /spec:plan  # ✅ Correct
./tests/phase3-sub-agents/run-test.sh 1 /spec:plan    # ❌ Incorrect
```

### Token Tracking Script Not Found

**Error:** `pnpm tsx .claude/skills/agent-orchestrator/scripts/track-tokens.ts: command not found`

**Solution:**

```bash
# Ensure track-tokens.ts exists
ls .claude/skills/agent-orchestrator/scripts/track-tokens.ts

# Run from project root
cd /path/to/dl-starter-new
./tests/phase3-sub-agents/run-test.sh 001 /spec:plan
```

### jq Command Not Found

**Error:** `jq: command not found`

**Solution:**

```bash
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt-get install jq

# Linux (RHEL/CentOS)
sudo yum install jq
```

### bc Command Not Found

**Error:** `bc: command not found`

**Solution:**

```bash
# macOS
brew install bc

# Linux (Debian/Ubuntu)
sudo apt-get install bc

# Linux (RHEL/CentOS)
sudo yum install bc
```

## Next Steps

After running Phase 3 tests:

### If Tests Pass (≥50% savings)

1. Update [docs/implementation/sub-agent-workflow-integration.md](../../docs/implementation/sub-agent-workflow-integration.md) with actual results
2. Mark Issue #257 as complete
3. Update [ADR-008](../../docs/decisions/ADR-008-sub-agent-orchestration.md) with outcomes
4. Promote integration to production use
5. Monitor usage for 1 month

### If Tests Fail (<50% savings)

1. Profile workflows to identify overhead sources
2. Review sub-agent prompts for optimization opportunities
3. Check for network/API latency issues
4. Adjust routing logic or agent selection
5. Re-test with optimizations

### Phase 3.2: Real-World Testing

1. Select 2-3 real features from backlog
2. Execute full workflow: `/specify` → `/plan` → `/tasks` → `/code`
3. Measure end-to-end token usage
4. Collect developer feedback on quality

### Phase 3.3: Failure Testing

1. Simulate Research Agent timeout
2. Simulate Security Scanner JSON parsing failure
3. Simulate parallel execution failure
4. Verify graceful degradation

## References

- [Phase 3 Test Plan](../../docs/testing/phase3-sub-agent-integration-test-plan.md)
- [Sub-Agent Architecture Spec](../../specs/SPEC-20251017-sub-agent-architecture.md)
- [ADR-008: Sub-Agent Orchestration](../../docs/decisions/ADR-008-sub-agent-orchestration.md)
- [Issue #257: Sub-Agent Workflow Integration](https://github.com/Shredvardson/dl-starter/issues/257)

---

**Last Updated:** 2025-11-02
**Status:** Ready for execution
