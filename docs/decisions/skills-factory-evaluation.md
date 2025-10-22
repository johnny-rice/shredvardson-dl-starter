# Skills Factory Evaluation

**Date:** 2025-10-22
**Status:** REJECTED
**Decision:** Defer indefinitely, focus on observability instead

## Summary

Evaluated "Skills Factory" concept (meta-generation of Skills via factory pattern + comprehensive registry). Determined it's premature optimization that doesn't align with DL Starter's solo-developer context and current maturity (Phase 3 complete).

## What Was Proposed

A meta-prompt-driven system to mass-generate Skills with:

- Factory template scaffolding (TypeScript/Python variants)
- Comprehensive registry schema (io_schema, risk_level, confidence_policy, test_cmd, owners)
- CI validation gates (SAST/SCA, golden test cases)
- Telemetry infrastructure (task_completion_rate, avg_cost, latency_ms, human_interventions)
- Skill taxonomy and deprecation workflows

**Estimated Effort:** 40-60 hours

## Why Rejected

### 1. **You've Already Built the Core Value**

✅ Current implementation delivers:

- Progressive disclosure (65-90% token savings)
- 6 domain Skills with bash script routing
- skill.json metadata schema with versioning
- Zero context pollution maintained

### 2. **Solving for Scale You Don't Have**

- Solo developer (not enterprise team)
- 6 stable Skills (not 50+ in a marketplace)
- ~1.3 Skills/month velocity (not 2+/week)
- Pre-1.0 template (not production SaaS)

### 3. **Factory Creates More Problems Than It Solves**

❌ **Downsides:**

- 40-60 hours implementation cost
- Generated Skills are generic (lose DL Starter conventions)
- Maintenance burden multiplies with each generated Skill
- Testing complexity increases dramatically
- Registry schema adds boilerplate without proportional value

✅ **What you have is better:**

- Hand-crafted, battle-tested Skills
- Tight integration with DL Starter patterns
- Lightweight skill.json already captures essentials
- Bash scripts provide deterministic validation

## What to Build Instead (Phase 4)

### ✅ Approved: Skills Observability (P0 - 2-4 hours)

**The one genuinely valuable idea from the factory proposal.**

- Lightweight usage logging (CSV-based)
  - Track: timestamp, skill, action, exit_code
  - Zero external dependencies
- `/skills stats` command
  - Most/least used Skills
  - Success/failure rates
  - Recommendations (deprecate low-value Skills)
- Monthly review workflow

**Why:** 6 Skills operational but zero usage data. Need empirical evidence before building more.

**Implementation:**

```bash
# In scripts/skills/git.sh
log_skill_invocation() {
  echo "$(date -u +%s),git,$ACTION,$?" >> .logs/skill-usage.csv
}
trap log_skill_invocation EXIT
```

### ✅ Approved: Learning Capture Enhancement (P1 - 4-6 hours)

**Build on existing 73-lesson foundation.**

- Enhance `/github:github-learning-capture`
  - Auto-detect session context
  - Suggest tags from recent work
  - Auto-update `docs/micro-lessons/INDEX.md`
- Add `/learn search <tag>` command
  - Query existing micro-lessons
  - Surface relevant patterns

**Why:** 73 micro-lessons prove active learning culture. Reduce friction to capture more.

### ❌ Deferred: skill-creator, Advanced Skills, Orchestration

**Re-evaluate when:**

- Creating >2 Skills/month (current: ~1.3/month)
- Clear use case for orchestration emerges
- Observability data shows demand

## Lessons Learned

### GPT-5 Over-Generalized from Enterprise Patterns

The transcript summary correctly identified Skills as valuable but **over-indexed on scaling patterns** from:

- Rakuten's enterprise finance workflow (day → 1 hour automation)
- Community marketplaces (awesome-claude-skills with 50+ Skills)
- Theoretical self-improving agents

**None match DL Starter's context:**

- Solo dev, not enterprise
- 6 curated Skills, not 50+
- Pre-1.0 template, not production SaaS

### The Right Pattern: Refine Before Scale

**Current architecture is excellent:**

- Token efficiency proven (65-90% savings)
- Skills stable and maintainable
- Zero context pollution maintained

**Next step is refinement:**

- Add observability to validate ROI
- Enhance learning capture (already working)
- Let data inform Phase 5+ decisions

## References

- [ROADMAP.md Phase 4](../../ROADMAP.md#phase-4-skills-refinement--data-driven-optimization)
- [ADR-002: Skills Architecture](../adr/002-skills-architecture.md)
- [Claude Skills Research](../scratch/Claude-skills-research.md)

## Decision Maker

@jonte (solo developer)

**Rationale:** Trust your implementation - it's already excellent. Ship what you have, add observability, capture learnings, revisit factories when drowning in Skill creation.
