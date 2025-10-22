---
description: Display Skills usage statistics and analytics
tags: [ops, analytics, skills, observability]
---

# Skills Usage Statistics

Analyze Skill usage patterns, success rates, and performance metrics.

## Instructions

1. Run the analytics script to generate statistics
2. Present the results in a formatted table
3. Provide actionable recommendations

## Command

```bash
pnpm exec tsx scripts/tools/analyze-skill-usage.ts
```

## Output Format

Present statistics in a clear, readable format showing:
- Total invocations by Skill
- Success/failure rates
- Average execution time
- Most used actions
- Recommendations for optimization or deprecation

## Time Range

Default to last 30 days. Support filtering by:
- Last 7 days
- Last 30 days
- Last 90 days
- All time