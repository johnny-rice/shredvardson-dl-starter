#!/usr/bin/env bash
#
# Analyze confidence-based recommendation decisions
# Reads .claude/logs/recommendations.jsonl and calculates metrics
#

set -euo pipefail

LOG_FILE=".claude/logs/recommendations.jsonl"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Confidence Recommendation Analysis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
  echo -e "${YELLOW}⚠️  No recommendation log found at $LOG_FILE${NC}"
  echo "   Run /spec:plan on a spec file to generate recommendations."
  exit 0
fi

# Count total recommendations
total=$(wc -l < "$LOG_FILE" | tr -d ' ')
if [ "$total" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Log file exists but is empty${NC}"
  exit 0
fi

# Count accepted recommendations
accepted=$(grep -c '"accepted":true' "$LOG_FILE" || echo "0")

# Count research triggered
research_triggered=$(grep -c '"researchTriggered":true' "$LOG_FILE" || echo "0")

# Calculate percentages
if [ "$total" -gt 0 ]; then
  acceptance_rate=$((accepted * 100 / total))
  research_rate=$((research_triggered * 100 / total))
else
  acceptance_rate=0
  research_rate=0
fi

# Calculate average confidence for accepted vs rejected
avg_confidence_accepted=$(grep '"accepted":true' "$LOG_FILE" | \
  grep -o '"confidence":[0-9]*' | \
  cut -d':' -f2 | \
  awk '{sum+=$1; count++} END {if (count>0) print int(sum/count); else print 0}')

avg_confidence_rejected=$(grep '"accepted":false' "$LOG_FILE" | \
  grep -o '"confidence":[0-9]*' | \
  cut -d':' -f2 | \
  awk '{sum+=$1; count++} END {if (count>0) print int(sum/count); else print 0}')

# Display results
echo -e "${GREEN}📈 Overall Metrics${NC}"
echo "   Total recommendations: $total"
echo "   Accepted: $accepted ($acceptance_rate%)"
echo "   Rejected: $((total - accepted)) ($((100 - acceptance_rate))%)"
echo

echo -e "${GREEN}🔍 Research Triggers${NC}"
echo "   Research triggered: $research_triggered ($research_rate%)"
echo "   Direct recommendations: $((total - research_triggered)) ($((100 - research_rate))%)"
echo

echo -e "${GREEN}🎯 Confidence Levels${NC}"
echo "   Avg confidence (accepted): ${avg_confidence_accepted}%"
echo "   Avg confidence (rejected): ${avg_confidence_rejected}%"
echo

# Success criteria check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Success Criteria (after 2 weeks)${NC}"
echo

if [ "$acceptance_rate" -ge 70 ]; then
  echo -e "   ✅ Acceptance rate: ${acceptance_rate}% (target: ≥70%)"
else
  echo -e "   ${YELLOW}⚠️  Acceptance rate: ${acceptance_rate}% (target: ≥70%)${NC}"
fi

if [ "$research_rate" -ge 25 ] && [ "$research_rate" -le 35 ]; then
  echo -e "   ✅ Research trigger rate: ${research_rate}% (target: ~30%)"
elif [ "$research_rate" -lt 25 ]; then
  echo -e "   ${YELLOW}⚠️  Research trigger rate: ${research_rate}% (target: ~30%, consider lowering threshold)${NC}"
else
  echo -e "   ${YELLOW}⚠️  Research trigger rate: ${research_rate}% (target: ~30%, consider raising threshold)${NC}"
fi

echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Detailed Logs${NC}"
echo "   View log file: $LOG_FILE"
echo "   Recent entries:"
echo
tail -n 3 "$LOG_FILE" | while read -r line; do
  feature=$(echo "$line" | grep -o '"featureName":"[^"]*"' | cut -d'"' -f4)
  confidence=$(echo "$line" | grep -o '"confidence":[0-9]*' | cut -d':' -f2)
  accepted=$(echo "$line" | grep -o '"accepted":[^,]*' | cut -d':' -f2)
  echo "   - $feature (${confidence}% confidence, accepted: $accepted)"
done

echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
