#!/bin/bash

###############################################################################
# Phase 3 Full Test Suite Runner
#
# Executes all test scenarios for sub-agent workflow integration and generates
# aggregated comparison report.
#
# Usage:
#   ./run-all-tests.sh [--mode=simulation|real]
#
# Modes:
#   simulation - Use simulated token values for testing the harness (default)
#   real       - Execute actual workflows and measure real token usage
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MODE="${1:-simulation}"
TEST_DIR="tests/phase3-sub-agents"
REPORT_DIR="${TEST_DIR}/reports"

# Ensure report directory exists
mkdir -p "$REPORT_DIR"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      Phase 3 Sub-Agent Integration - Full Test Suite        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Mode:${NC}          ${MODE}"
echo -e "${GREEN}Test Directory:${NC} ${TEST_DIR}"
echo -e "${GREEN}Reports:${NC}       ${REPORT_DIR}"
echo ""

if [ "$MODE" = "simulation" ]; then
  echo -e "${YELLOW}⚠ SIMULATION MODE ⚠${NC}"
  echo "Using simulated token values for harness testing."
  echo "Run with --mode=real for actual workflow execution."
  echo ""
fi

# Test suite configuration
declare -a TESTS=(
  "001|/spec:plan|TC1.1 Auth Feature (Research + Security)"
  "002|/spec:plan|TC1.2 Simple Bugfix (No Sub-Agents)"
  "003|/spec:tasks|TC3.1 Payment System (Dependencies)"
  "004|/code|TC4.1 Admin Dashboard (Security Pre-Check)"
)

TOTAL_TESTS=${#TESTS[@]}
PASSED=0
FAILED=0

echo -e "${BLUE}Running ${TOTAL_TESTS} test scenarios...${NC}"
echo ""

# Run each test
for test_config in "${TESTS[@]}"; do
  IFS='|' read -r test_num workflow description <<< "$test_config"

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}Test ${test_num}: ${description}${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Run test
  if ./tests/phase3-sub-agents/run-test.sh "$test_num" "$workflow"; then
    ((PASSED++))
    echo -e "${GREEN}✓ Test ${test_num} PASSED${NC}"
  else
    ((FAILED++))
    echo -e "${RED}✗ Test ${test_num} FAILED${NC}"
  fi

  echo ""
  sleep 1
done

# Aggregate results
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Aggregating Test Results...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Find all report files
REPORT_FILES=$(find "$REPORT_DIR" -name "test-*.json" -type f | sort)

if [ -z "$REPORT_FILES" ]; then
  echo -e "${RED}Error: No report files found${NC}"
  exit 1
fi

echo "Found $(echo "$REPORT_FILES" | wc -l) report files:"
echo "$REPORT_FILES" | sed 's/^/  - /'
echo ""

# Aggregate reports
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
AGGREGATE_FILE="${REPORT_DIR}/aggregate-${TIMESTAMP}.md"

cat > "$AGGREGATE_FILE" << EOF
# Phase 3 Sub-Agent Integration - Test Results

**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Mode:** ${MODE}
**Tests Run:** ${TOTAL_TESTS}
**Passed:** ${PASSED}
**Failed:** ${FAILED}

---

## Summary

| Test | Workflow | Baseline | Actual | Token Savings | Cost Savings | Result |
|------|----------|----------|--------|---------------|--------------|--------|
EOF

# Parse each report and add to table
for report_file in $REPORT_FILES; do
  test_num=$(basename "$report_file" | sed -E 's/test-([0-9]+)-.*/\1/')
  workflow=$(jq -r '.workflow' "$report_file")
  baseline_tokens=$(jq -r '.baseline_comparison.baseline_tokens' "$report_file")
  total_tokens=$(jq -r '.total_tokens' "$report_file")
  token_savings=$(jq -r '.baseline_comparison.token_savings_pct' "$report_file")
  cost_savings=$(jq -r '.baseline_comparison.cost_savings_pct' "$report_file")

  # Determine pass/fail
  if (( $(echo "$token_savings >= 50" | bc -l) )) && (( $(echo "$cost_savings >= 50" | bc -l) )); then
    result="✅ PASS"
  else
    result="❌ FAIL"
  fi

  # Add row to table
  echo "| ${test_num} | ${workflow} | ${baseline_tokens} | ${total_tokens} | ${token_savings}% | ${cost_savings}% | ${result} |" >> "$AGGREGATE_FILE"
done

# Add detailed results section
cat >> "$AGGREGATE_FILE" << EOF

---

## Detailed Results

EOF

# Add detailed results for each test
for report_file in $REPORT_FILES; do
  test_num=$(basename "$report_file" | sed -E 's/test-([0-9]+)-.*/\1/')
  workflow=$(jq -r '.workflow' "$report_file")

  cat >> "$AGGREGATE_FILE" << EOF
### Test ${test_num}: ${workflow}

**Timestamp:** $(jq -r '.timestamp' "$report_file")

**Token Usage:**
- Research Agent: $(jq -r '.sub_agent_tokens.research // 0' "$report_file") tokens
- Security Agent: $(jq -r '.sub_agent_tokens.security // 0' "$report_file") tokens
- Sonnet Main: $(jq -r '.sonnet_tokens' "$report_file") tokens
- **Total:** $(jq -r '.total_tokens' "$report_file") tokens

**Cost:**
- Total Cost: \$$(jq -r '.total_cost_usd' "$report_file")
- Baseline Cost: \$$(jq -r '.baseline_comparison.baseline_cost_usd' "$report_file")
- **Savings:** $(jq -r '.baseline_comparison.cost_savings_pct' "$report_file")% (\$$(echo "$(jq -r '.baseline_comparison.baseline_cost_usd' "$report_file") - $(jq -r '.total_cost_usd' "$report_file")" | bc -l))

**Performance:**
- Execution Time: $(echo "$(jq -r '.execution_time_ms' "$report_file") / 1000" | bc -l)s

---

EOF
done

# Add recommendations
cat >> "$AGGREGATE_FILE" << EOF
## Recommendations

EOF

# Calculate overall savings
TOTAL_BASELINE_TOKENS=0
TOTAL_ACTUAL_TOKENS=0
TOTAL_BASELINE_COST=0
TOTAL_ACTUAL_COST=0

for report_file in $REPORT_FILES; do
  TOTAL_BASELINE_TOKENS=$((TOTAL_BASELINE_TOKENS + $(jq -r '.baseline_comparison.baseline_tokens' "$report_file")))
  TOTAL_ACTUAL_TOKENS=$((TOTAL_ACTUAL_TOKENS + $(jq -r '.total_tokens' "$report_file")))
  TOTAL_BASELINE_COST=$(echo "$TOTAL_BASELINE_COST + $(jq -r '.baseline_comparison.baseline_cost_usd' "$report_file")" | bc -l)
  TOTAL_ACTUAL_COST=$(echo "$TOTAL_ACTUAL_COST + $(jq -r '.total_cost_usd' "$report_file")" | bc -l)
done

AVG_TOKEN_SAVINGS=$(echo "scale=1; ($TOTAL_BASELINE_TOKENS - $TOTAL_ACTUAL_TOKENS) * 100 / $TOTAL_BASELINE_TOKENS" | bc -l)
AVG_COST_SAVINGS=$(echo "scale=1; ($TOTAL_BASELINE_COST - $TOTAL_ACTUAL_COST) * 100 / $TOTAL_BASELINE_COST" | bc -l)

cat >> "$AGGREGATE_FILE" << EOF
**Overall Performance:**
- Average Token Savings: ${AVG_TOKEN_SAVINGS}%
- Average Cost Savings: ${AVG_COST_SAVINGS}%
- Total Tests Passed: ${PASSED}/${TOTAL_TESTS}

**Target:** ≥50% token savings, ≥50% cost savings

EOF

if (( $(echo "$AVG_TOKEN_SAVINGS >= 50" | bc -l) )) && (( $(echo "$AVG_COST_SAVINGS >= 50" | bc -l) )); then
  cat >> "$AGGREGATE_FILE" << EOF
✅ **OVERALL RESULT: PASS**

The sub-agent workflow integration meets the target savings goals. Recommend:
1. Mark Issue #257 (Phase 1-2) as complete
2. Update documentation with actual metrics
3. Promote integration to production use
4. Monitor usage for 1 month, then re-evaluate ROI

EOF
else
  cat >> "$AGGREGATE_FILE" << EOF
❌ **OVERALL RESULT: FAIL**

The sub-agent workflow integration does not meet target savings goals. Recommend:
1. Profile workflows to identify overhead sources
2. Optimize sub-agent prompts and routing logic
3. Re-test with optimizations
4. Consider rollback if quality degraded

EOF
fi

cat >> "$AGGREGATE_FILE" << EOF
---

**Report Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Mode:** ${MODE}
**Raw Reports:** ${REPORT_DIR}
EOF

echo -e "${GREEN}✓ Aggregate report generated: ${AGGREGATE_FILE}${NC}"
echo ""

# Display summary
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Test Suite Summary                        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Tests Run:${NC}        ${TOTAL_TESTS}"
echo -e "${GREEN}Passed:${NC}           ${PASSED}"
echo -e "${RED}Failed:${NC}           ${FAILED}"
echo ""
echo -e "${GREEN}Avg Token Savings:${NC} ${AVG_TOKEN_SAVINGS}%"
echo -e "${GREEN}Avg Cost Savings:${NC}  ${AVG_COST_SAVINGS}%"
echo ""

if (( $(echo "$AVG_TOKEN_SAVINGS >= 50" | bc -l) )) && (( $(echo "$AVG_COST_SAVINGS >= 50" | bc -l) )); then
  echo -e "${GREEN}✓ OVERALL RESULT: PASS${NC}"
else
  echo -e "${RED}✗ OVERALL RESULT: FAIL${NC}"
fi

echo ""
echo -e "${BLUE}Full report available at:${NC} ${AGGREGATE_FILE}"
echo ""
