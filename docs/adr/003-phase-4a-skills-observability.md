# ADR-003: Phase 4A Skills Observability

**Status:** Accepted
**Date:** 2025-10-22
**Deciders:** @jonte
**Related:** [ADR-002](002-skills-architecture.md), [Phase 4A Spec](../specs/phase-4a-skills-observability.md)

## Context

After completing Phase 3 of the Skills architecture, we have 6 operational Skills (`/git`, `/review`, `/docs`, `/spec`, `/test`, `/db`) with zero empirical usage data. We need to:

1. Understand which Skills are actually valuable in practice
2. Identify high/low usage patterns to inform Phase 4B-D development
3. Track success/failure rates to improve reliability
4. Measure performance to identify optimization opportunities

**Key Constraint:** Solo developer context requires minimal overhead - no external dependencies, no complex infrastructure, no ongoing maintenance burden.

## Decision

Implement **lightweight CSV-based usage logging** with terminal-based analytics.

### Logging Design

**Storage:** `.logs/skill-usage.csv` (git-ignored, local-only)

**Schema:**
```csv
timestamp,skill,action,exit_code,duration_ms
1761122800,git,branch,0,234
```

**Fields:**
- `timestamp` (int) - Unix timestamp in seconds (UTC)
- `skill` (string) - Skill name (`git`, `review`, `docs`, etc.)
- `action` (string) - Action within Skill (`branch`, `commit`, `auto`, etc.)
- `exit_code` (int) - 0 for success, >0 for failure
- `duration_ms` (int) - Execution time in milliseconds

### Implementation Approach

**Logging Utility:** `scripts/utils/skill-logger.sh`
- Reusable bash library sourced by all Skills
- Automatic logging via EXIT trap
- Cross-platform millisecond timestamps (Python 3 with bash fallback)
- Zero configuration required

**Integration Pattern:**
```bash
#!/bin/bash
# ADR: docs/adr/003-phase-4a-skills-observability.md
source "$(dirname "$0")/../utils/skill-logger.sh"
setup_skill_logging "SKILL_NAME" "ACTION"
```

**Analytics:** `scripts/tools/analyze-skill-usage.ts`
- TypeScript CLI tool (uses existing toolchain)
- Generates formatted tables with recommendations
- Supports time filtering (7d, 30d, 90d, all)
- No external dependencies beyond TypeScript/Node

**Command:** `.claude/commands/ops/skills-stats.md`
- Routes `/skills stats` to analytics script
- Integrates into existing command framework

### Data Retention

**Current:** No rotation (manual cleanup if needed)

**Future:** If `.logs/skill-usage.csv` grows >1MB, implement monthly rotation:
```
.logs/skill-usage-2025-01.csv
.logs/skill-usage-2025-02.csv
```

## Alternatives Considered

### 1. External Telemetry (PostHog, Mixpanel, etc.)

**Pros:**
- Rich dashboards and visualizations
- Time-series analysis
- Real-time monitoring

**Cons:**
- External dependency
- Data sovereignty concerns
- Overkill for solo developer
- Ongoing costs

**Rejected:** Too heavy for solo dev context, violates "zero external dependencies" principle.

### 2. SQLite Database

**Pros:**
- Better query capabilities
- Structured data model
- Built-in aggregation

**Cons:**
- Requires SQLite tooling
- More complex parsing logic
- Binary format (not human-readable)

**Rejected:** CSV is simpler, human-readable, and sufficient for current needs.

### 3. JSON Lines (.jsonl)

**Pros:**
- Structured data
- Easy to parse
- Extensible

**Cons:**
- Larger file size
- Requires JSON parsing library
- Overkill for tabular data

**Rejected:** CSV is simpler and more efficient for tabular logs.

### 4. Real-Time Dashboards

**Pros:**
- Live monitoring
- Immediate feedback

**Cons:**
- Complex infrastructure (web server, DB, UI)
- Maintenance burden
- Not needed for batch analysis

**Rejected:** Terminal-based analytics sufficient for periodic review (weekly/monthly).

## Consequences

### Positive

✅ **Zero external dependencies** - Pure bash + Python 3 (already required)
✅ **Zero configuration** - Works out of the box
✅ **Zero performance impact** - <50ms overhead per invocation
✅ **Data sovereignty** - All data stays local
✅ **Human-readable** - CSV can be inspected with any text editor
✅ **Actionable insights** - Recommendations guide Phase 4B-D decisions
✅ **Minimal maintenance** - No services to run, no DB to manage

### Negative

⚠️ **No real-time dashboards** - Requires manual `/skills stats` invocation
⚠️ **Limited query capabilities** - No time-series analysis, just basic aggregation
⚠️ **Manual cleanup** - No automatic log rotation (mitigated: logs are tiny)
⚠️ **Local-only data** - Can't aggregate across machines (acceptable for solo dev)

### Neutral

- CSV format is simple but not extensible (can migrate to JSON later if needed)
- Terminal-based analytics are functional but not as polished as web dashboards
- Python 3 dependency for millisecond timestamps (acceptable - Python 3 already required)

## Validation Criteria

Phase 4A is successful if:

- [ ] All 7 Skills log to `.logs/skill-usage.csv` automatically
- [ ] `/skills stats` command produces accurate, actionable reports
- [ ] Logging overhead is <50ms per Skill invocation
- [ ] 2 weeks of data collection identifies at least 1 high-value Skill and 1 candidate for deprecation
- [ ] Zero developer friction (no manual logging calls, no configuration)

## Next Steps (Phase 4B-D)

1. **Collect 2 weeks of usage data** (passive, automatic)
2. **Analyze patterns**: Which Skills are used? Which actions? Success rates?
3. **Phase 4B**: Enhance Learning Capture based on insights
4. **Phase 4C**: Build high-confidence Skills (e.g., `/github` expansion)
5. **Phase 4D**: Data-driven Skills for top 3 pain points identified from logs

## References

- [Phase 4A Spec](../specs/phase-4a-skills-observability.md) - Full technical specification
- [Skills Factory Evaluation](../decisions/skills-factory-evaluation.md) - Why we rejected meta-generation
- [ADR-002: Skills Architecture](002-skills-architecture.md) - Original Skills design
- [ROADMAP.md](../../ROADMAP.md) - Phase 4A-D breakdown

---

**Approved by:** @jonte
**Implementation:** PR #181
**Status:** Implemented ✅
