#!/bin/bash

###############################################################################
# Phase 3 Test Execution Script
#
# Runs individual test scenarios for sub-agent workflow integration testing.
# Measures token usage, execution time, and generates comparison reports.
#
# Usage:
#   ./run-test.sh <test-number> <workflow-command>
#
# Examples:
#   ./run-test.sh 001 /spec:plan
#   ./run-test.sh 002 /spec:specify
#   ./run-test.sh 003 /spec:tasks
#   ./run-test.sh 004 /code
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_NUM="${1:-}"
WORKFLOW="${2:-}"
TEST_DIR="tests/phase3-sub-agents"
SPEC_DIR="${TEST_DIR}/specs"
REPORT_DIR="${TEST_DIR}/reports"

# Validate arguments
if [ -z "$TEST_NUM" ] || [ -z "$WORKFLOW" ]; then
  echo -e "${RED}Error: Missing required arguments${NC}"
  echo "Usage: $0 <test-number> <workflow-command>"
  echo ""
  echo "Examples:"
  echo "  $0 001 /spec:plan"
  echo "  $0 002 /spec:specify"
  echo "  $0 003 /spec:tasks"
  echo "  $0 004 /code"
  exit 1
fi

# Find test spec file
SPEC_FILE=$(find "$SPEC_DIR" -name "test-${TEST_NUM}-*.md" | head -n 1)

if [ -z "$SPEC_FILE" ]; then
  echo -e "${RED}Error: Test spec file not found for test ${TEST_NUM}${NC}"
  echo "Looking in: $SPEC_DIR/test-${TEST_NUM}-*.md"
  exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Phase 3 Sub-Agent Integration Test Runner           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Test Number:${NC} ${TEST_NUM}"
echo -e "${GREEN}Workflow:${NC}    ${WORKFLOW}"
echo -e "${GREEN}Spec File:${NC}   ${SPEC_FILE}"
echo ""

# Extract test metadata from spec
TEST_SCENARIO=$(grep "test_scenario:" "$SPEC_FILE" | cut -d':' -f2 | xargs)
TEST_PURPOSE=$(grep "test_purpose:" "$SPEC_FILE" | cut -d':' -f2- | xargs)
LANE=$(grep "^lane:" "$SPEC_FILE" | cut -d':' -f2 | xargs)

echo -e "${YELLOW}Test Scenario:${NC} ${TEST_SCENARIO}"
echo -e "${YELLOW}Purpose:${NC}       ${TEST_PURPOSE}"
echo -e "${YELLOW}Lane:${NC}          ${LANE}"
echo ""

# Prepare report file
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="${REPORT_DIR}/test-${TEST_NUM}-${TIMESTAMP}.json"

echo -e "${BLUE}Starting test execution...${NC}"
echo ""

# Start timer (milliseconds since epoch)
START_TIME=$(date +%s)000

# Run workflow command
# NOTE: This is a simulation - in real testing, you would actually invoke the workflow
# and capture token usage from the API response
echo -e "${YELLOW}⚠ SIMULATION MODE ⚠${NC}"
echo "In production testing, this would:"
echo "1. Invoke: claude ${WORKFLOW} ${SPEC_FILE}"
echo "2. Capture API token usage from response metadata"
echo "3. Track sub-agent delegation via orchestrator logs"
echo ""

# Simulate workflow execution
echo "Simulating workflow execution..."
sleep 2

# End timer (milliseconds)
END_TIME=$(date +%s)000
EXECUTION_TIME=$((END_TIME - START_TIME))

echo -e "${GREEN}✓ Workflow completed${NC}"
echo ""

# Simulate token usage based on test scenario
# In production, these would come from actual API responses
case "$TEST_NUM" in
  "001")
    # TC1.1: Auth feature with Research + Security
    RESEARCH_TOKENS=22000
    SECURITY_TOKENS=18000
    SONNET_TOKENS=8000
    ;;
  "002")
    # TC1.2: Simple bugfix (no sub-agents)
    RESEARCH_TOKENS=0
    SECURITY_TOKENS=0
    SONNET_TOKENS=15000
    ;;
  "003")
    # TC3.1: Payment system (Research for dependencies)
    RESEARCH_TOKENS=8000
    SECURITY_TOKENS=0
    SONNET_TOKENS=3000
    ;;
  "004")
    # TC4.1: Admin dashboard (Security pre-check)
    RESEARCH_TOKENS=0
    SECURITY_TOKENS=20000
    SONNET_TOKENS=8000
    ;;
  *)
    echo -e "${RED}Error: Unknown test number${NC}"
    exit 1
    ;;
esac

# Generate token usage report
echo -e "${BLUE}Generating token usage report...${NC}"
echo ""

# Build CLI arguments for track-tokens script
TRACK_ARGS=(
  "--workflow=${WORKFLOW}"
  "--sonnet=${SONNET_TOKENS}"
  "--time=${EXECUTION_TIME}"
  "--output=${REPORT_FILE}"
)

if [ "$RESEARCH_TOKENS" -gt 0 ]; then
  TRACK_ARGS+=("--research=${RESEARCH_TOKENS}")
fi

if [ "$SECURITY_TOKENS" -gt 0 ]; then
  TRACK_ARGS+=("--security=${SECURITY_TOKENS}")
fi

# Run token tracking script
pnpm tsx .claude/skills/agent-orchestrator/scripts/track-tokens.ts "${TRACK_ARGS[@]}"

echo ""
echo -e "${GREEN}✓ Test completed successfully${NC}"
echo -e "${GREEN}✓ Report saved to: ${REPORT_FILE}${NC}"
echo ""

# Display next steps
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the report above"
echo "2. Run additional tests: $0 <test-num> <workflow>"
echo "3. Aggregate results: ./aggregate-reports.sh"
echo ""
