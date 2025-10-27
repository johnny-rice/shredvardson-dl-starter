---
UsedBy: 0
Severity: normal
---

# Phase-Based PR Strategy Reduces Risk and Enables Data-Driven Decisions

**Context.** Phase 4 of Skills Architecture had multiple sub-phases (4A-D). Merged Phase 4A and 4B separately instead of batching all phases into one PR. Phase 4C-D explicitly wait for 2-week observability data from Phase 4A.

**Rule.** **For multi-phase work with dependencies or data requirements, merge each phase separately to validate before proceeding.**

**Example.**

Example timeline from Phase 4 Skills Architecture (actual PR numbers/dates):

```text
❌ Wrong: Single massive PR for all phases
PR #X: Phase 4A-D Complete (all features at once)
- Phase 4A: Observability
- Phase 4B: Learning Capture
- Phase 4C: High-Confidence Skills
- Phase 4D: Data-Driven Skills
Problem: Can't use Phase 4A data to inform 4C-D, huge PR surface area

✅ Correct: Phase-gated PRs
PR #181: Phase 4A Complete (merged 2025-10-22)
- Observability operational
- Data collection started

PR #182: Phase 4B Complete (merged 2025-10-22)
- Learning capture enhanced
- Independent of 4A data

[Wait 2 weeks for observability data]

PR #N: Phase 4C-D (planned ~2025-11-05)
- Informed by actual usage metrics from 4A
- Build only high-value Skills identified by data
```

**Guardrails.**

- Define decision criteria upfront (e.g., ">10 invocations/week")
- Set explicit data review dates
- Merge independent phases immediately
- Gate dependent phases on data/validation
- Document "wait state" in ROADMAP and checklist

**Tags.** #git #workflow #pr-strategy #data-driven #phase-gating #observability #phase-4
