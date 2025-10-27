# Phase 4A: Skills Observability

**Status:** In Progress
**Priority:** P0
**Estimated Effort:** 2-4 hours
**Phase:** 4A (of 4A-D)

## Context

We have 6 operational Skills (`/test`, `/db`, `/spec`, `/code`, `/git`, `/review`, `/docs`) that have been battle-tested through Phases 1-3. However, we have **zero empirical usage data** to inform:

- Which Skills are most valuable
- Which actions within Skills are actually used
- Success/failure rates
- Which Skills might be candidates for deprecation or enhancement

**Before building more Skills, we need data to make informed decisions.**

## Goals

1. **Lightweight Usage Tracking** - CSV-based logging (no external dependencies)
2. **Basic Analytics** - `/skills stats` command for insights
3. **Actionable Insights** - Identify high/low-value Skills based on data
4. **Zero Overhead** - Logging should not impact performance or DX

## Non-Goals

- Real-time dashboards (too heavy for solo dev)
- External telemetry services (maintain data sovereignty)
- Complex event streaming (CSV is sufficient)
- Historical trend analysis (keep it simple for now)

## Design

### 1. Logging Infrastructure

**Location:** `.logs/skill-usage.csv`

**Schema:**

```csv
timestamp,skill,action,exit_code,duration_ms
1705929600,git,branch,0,234
1705929650,test,run,0,1523
1705929700,db,migrate,1,456
```

**Fields:**

- `timestamp` - Unix timestamp (UTC)
- `skill` - Skill name (git, test, db, spec, code, review, docs)
- `action` - Action within Skill (branch, commit, pr, etc.)
- `exit_code` - 0 for success, >0 for failure
- `duration_ms` - Execution time in milliseconds

### 2. Logging Implementation

**Approach:** Add logging to each Skill's bash script

**Example (scripts/skills/git.sh):**

```bash
#!/bin/bash

# Logging configuration
LOG_FILE=".logs/skill-usage.csv"
# Use Python 3 for millisecond precision (cross-platform compatible)
START_TIME=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))

# Ensure log directory exists
mkdir -p .logs

# Create header if file doesn't exist
if [ ! -f "$LOG_FILE" ]; then
  echo "timestamp,skill,action,exit_code,duration_ms" > "$LOG_FILE"
fi

# Log skill invocation on exit
log_skill_invocation() {
  local exit_code=$?
  local end_time=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))
  local duration=$((end_time - START_TIME))
  local timestamp=$(date -u +%s)

  echo "$timestamp,git,$ACTION,$exit_code,$duration" >> "$LOG_FILE"
}
trap 'log_skill_invocation $skill $action $?' EXIT

# ... rest of script
```

**Note on Millisecond Timestamps:** The implementation uses Python 3 for cross-platform millisecond precision, as `date +%s%3N` is not POSIX-standard. Falls back to second-based timing if Python is unavailable.

### 3. Analytics Command

**New Command:** `.claude/commands/ops/skills-stats.md`

**Functionality:**

- Parse `.logs/skill-usage.csv`
- Generate statistics:
  - Total invocations per Skill
  - Success/failure rates
  - Average duration
  - Most/least used actions
  - Recommendations (deprecate low-value Skills)

**Output Example:**

```text
Skills Usage Statistics (Last 30 Days)
======================================

Summary:
- Total invocations: 147
- Unique Skills: 6
- Overall success rate: 94.6%

By Skill:
┌─────────┬────────────┬──────────┬──────────┬──────────┐
│ Skill   │ Count      │ Success  │ Avg Time │ Top Action│
├─────────┼────────────┼──────────┼──────────┼──────────┤
│ git     │ 68 (46.3%) │ 97.1%    │ 1.2s     │ commit   │
│ test    │ 34 (23.1%) │ 91.2%    │ 8.4s     │ run      │
│ review  │ 21 (14.3%) │ 95.2%    │ 12.3s    │ auto     │
│ docs    │ 15 (10.2%) │ 100%     │ 0.8s     │ sync     │
│ db      │ 7 (4.8%)   │ 85.7%    │ 2.1s     │ migrate  │
│ spec    │ 2 (1.4%)   │ 50.0%    │ 0.5s     │ analyze  │
└─────────┴────────────┴──────────┴──────────┴──────────┘

Recommendations:
✅ /git - High usage, excellent reliability - keep investing
✅ /test - High usage, good reliability - monitor failures
⚠️  /spec - Very low usage (2 invocations) - evaluate value
❌ /code - Zero usage in 30 days - consider deprecating
```

### 4. Integration Points

**All Skill Scripts:**

- `scripts/skills/git.sh` ✅
- `scripts/skills/test.sh` ✅
- `scripts/skills/db.sh` ✅
- `scripts/skills/spec.sh` ✅
- `scripts/skills/code.sh` ✅
- `scripts/skills/review.sh` ✅
- `scripts/skills/docs.sh` ✅

**New Command:**

- `.claude/commands/ops/skills-stats.md` (analytics viewer)

## Implementation Plan

### Step 1: Create Logging Utility (30 min)

**File:** `scripts/utils/skill-logger.sh`

```bash
#!/bin/bash
# Reusable logging functions for Skills

LOG_FILE="${LOG_FILE:-.logs/skill-usage.csv}"
# Use Python for millisecond precision (cross-platform compatible)
START_TIME=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))

init_skill_logging() {
  mkdir -p .logs
  if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,skill,action,exit_code,duration_ms" > "$LOG_FILE"
  fi
}

log_skill_invocation() {
  local skill=$1
  local action=$2
  local exit_code=${3:-$?}
  # Calculate duration (declare and assign separately)
  local end_time
  end_time=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))
  local duration=$((end_time - START_TIME))
  # Get current timestamp (declare and assign separately)
  local timestamp
  timestamp=$(date -u +%s)

  echo "$timestamp,$skill,$action,$exit_code,$duration" >> "$LOG_FILE"
}

# Setup trap for automatic logging
setup_skill_logging() {
  local skill=$1
  local action=$2

  init_skill_logging
  trap 'log_skill_invocation "$skill" "$action"' EXIT
}
```

### Step 2: Integrate Logging into All Skills (1 hour)

For each Skill script, add at the top:

```bash
#!/bin/bash
source "$(dirname "$0")/../utils/skill-logger.sh"
setup_skill_logging "SKILL_NAME" "$ACTION"
```

### Step 3: Create Analytics Command (1-2 hours)

**File:** `.claude/commands/ops/skills-stats.md`

**Implementation:** TypeScript script that:

1. Reads `.logs/skill-usage.csv`
2. Filters by date range (default: last 30 days)
3. Calculates statistics
4. Generates formatted report
5. Provides recommendations

### Step 4: Testing (30 min)

- Run each Skill and verify CSV logging
- Check log format correctness
- Verify `/skills stats` output
- Test edge cases (no logs, corrupted CSV)

### Step 5: Documentation (30 min)

- Update `SKILLS.md` with observability section
- Add `.logs/` to `.gitignore`
- Document analytics command usage
- Update ROADMAP.md

## Success Criteria

- [ ] All 7 Skills log to `.logs/skill-usage.csv`
- [ ] CSV format is valid and parseable
- [ ] `/skills stats` command produces accurate reports
- [ ] Zero performance impact (logging < 10ms overhead)
- [ ] `.logs/` directory excluded from git
- [ ] Documentation updated

## Risks & Mitigations

| Risk                     | Mitigation                                       |
| ------------------------ | ------------------------------------------------ |
| Log file grows too large | Add log rotation (monthly archives)              |
| CSV parsing fails        | Validate format, handle corrupt lines gracefully |
| Performance impact       | Keep logging async, minimal I/O                  |
| Privacy concerns         | Keep logs local, never commit to git             |

## Future Enhancements (Not Phase 4A)

- **Log Rotation:** Monthly archives (`.logs/skill-usage-2025-01.csv`)
- **Weekly Reports:** Automated summary emails
- **Anomaly Detection:** Alert on unusual failure rates
- **Export to JSON:** For more advanced analysis tools
- **Skill Health Score:** Composite metric of usage + success rate + performance

## Deliverables

1. `scripts/utils/skill-logger.sh` - Logging utility
2. Updated Skill scripts (7 files) - Integrated logging
3. `.claude/commands/ops/skills-stats.md` - Analytics command
4. `scripts/tools/analyze-skill-usage.ts` - Analytics implementation
5. Updated `.gitignore` - Exclude `.logs/`
6. Updated documentation - SKILLS.md, ROADMAP.md

## Timeline

- **Total Effort:** 3-4 hours
- **Week 1:** Implement logging (1.5 hours)
- **Week 1:** Build analytics (2 hours)
- **Week 1:** Testing & docs (0.5 hours)

## References

- [Skills Factory Evaluation](../decisions/skills-factory-evaluation.md) - Context for why observability is P0
- [ROADMAP.md Phase 4](../../ROADMAP.md#phase-4-advanced-skills--orchestration) - Overall Phase 4 plan
- [ADR-002: Skills Architecture](../adr/002-skills-architecture.md) - Original architecture

## Next Steps After Phase 4A

Once observability is operational:

1. **Collect Data:** Run for 2 weeks minimum
2. **Analyze Usage:** Identify high/low-value Skills
3. **Phase 4B:** Enhance Learning Capture based on insights
4. **Phase 4C:** Build high-confidence new Skills (e.g., `/github` expansion)
5. **Phase 4D:** Data-driven Skills based on behavioral patterns

---

**Author:** @jonte
**Date:** 2025-10-22
**Status:** Ready for Implementation
