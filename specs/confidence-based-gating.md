---
id: SPEC-confidence-based-gating
title: Implement confidence-based gating to reduce unnecessary decision bottlenecks
type: spec
priority: p1
status: implemented
lane: spec-driven
issue: 287
created: 2025-11-08
plan: plans/confidence-based-gating.md
tasks: tasks/confidence-based-gating.md
---

# Implement Confidence-Based Gating for Spec Planning

## Summary

Add confidence-based decision gating to the spec planning workflow to reduce user interruptions by ~70% while maintaining oversight on uncertain decisions. The system will automatically proceed with high-confidence recommendations, present options for medium-confidence scenarios, and trigger research for low-confidence situations.

## Problem Statement

The current spec planning workflow creates decision bottlenecks even when technical choices are straightforward. Users report frustration: "I can't judge whether option A is better than option B... I constantly reply 'go with your recommendation'... It's just slowing me down because I just say yes to everything."

**Current State:**
- Research sub-agent returns confidence scores (high/medium/low) but they're not used
- Spec planner doesn't propagate confidence metadata
- No differentiation between product decisions (require user input) vs. technical decisions (can be automated)
- No automatic research triggering for low-confidence scenarios

## Proposed Solution

Implement three-tier confidence-based gating:

**High Confidence (≥8/10):** Present single recommendation with rationale, auto-proceed after 5-second review window

**Medium Confidence (5-7/10):** Present top 2 options with comparison, ask "Research more or choose now?"

**Low Confidence (<5/10):** Auto-trigger research (Context7, codebase, web), return with recommendation

### Implementation Phases

**Phase 1:** Add confidence scoring to spec-planner sub-agent output format
**Phase 2:** Integrate research sub-agent invocation into planning workflow
**Phase 3:** Implement confidence-based gating logic in `/spec:plan` command
**Phase 4:** Add question classifier (product vs. technical vs. implementation)

## Acceptance Criteria

- [ ] Spec planner returns confidence scores (1-10 scale) with rationale
- [ ] Research sub-agent automatically invoked when confidence < 8
- [ ] High-confidence decisions (≥8) proceed with single recommendation and reasoning
- [ ] Medium-confidence decisions (5-7) present 2 options with comparison
- [ ] Low-confidence decisions (<5) trigger automatic research before escalation
- [ ] User only interrupted for:
  - Product direction questions (vision/priorities)
  - Confidence < 7 after research
  - High-risk changes detected
- [ ] All plans include confidence metadata and rationale
- [ ] 5-second review window implemented for high-confidence auto-proceed

## Technical Constraints

**Files to Modify:**
- `.claude/commands/spec/plan.md` - Add confidence evaluation and gating logic
- `.claude/sub-agents/4-spec-planner.md` - Add confidence scoring to output, invoke research sub-agent
- Potentially: `.claude/sub-agents/8-research.md` - Ensure confidence schema compatibility

**Dependencies:**
- Research sub-agent already implements confidence scoring (`.claude/sub-agents/8-research.md:96`)
- ResearchResponse schema enforces confidence enum validation (`delegation-packages/delegation-core/src/schemas/research.ts:45`)
- DelegationClient provides type-safe sub-agent invocation pattern

**Risks:**
- Over-automation could hide important decisions → Mitigate with conservative thresholds and logging
- Confidence scoring needs calibration → Start conservative, adjust based on results
- 5-second review window might be too short → Make configurable in future iteration

## Success Metrics

- User interruptions reduced by ≥60% (measure pre/post implementation)
- Auto-research improves confidence scores (track low→medium/high transitions)
- Zero incidents of auto-proceeding with inappropriate decisions
- User satisfaction with gating logic (qualitative feedback)

## Out of Scope

- User-configurable confidence thresholds (future enhancement)
- Machine learning-based confidence calibration
- Historical decision tracking/analytics
- Extended thinking integration (separate issue)
- Multi-agent debate for edge cases

## References

**Research Findings:**
- Research sub-agent confidence pattern: `.claude/sub-agents/8-research.md:96`
- ResearchResponse schema: `delegation-packages/delegation-core/src/schemas/research.ts:45`
- Review sub-agent severity scoring (alternative pattern): `.claude/sub-agents/7-review.md:78`
- DelegationClient invocation pattern: `delegation-packages/delegation-core/src/DelegationClient.ts:42`

**Similar Implementations:**
- Review sub-agent uses four-level severity (critical/major/minor/info) for decision gating
- Research sub-agent adjusts confidence based on research completeness (`.claude/sub-agents/8-research.md:200-250`)

**Architecture Patterns:**
- Enum-based confidence levels in Zod schemas for type safety
- Sub-agent responses include metadata fields for decision gating
- Delegation pattern separates invocation from response parsing

**Related Issues:**
- Complements future extended thinking integration
- Part of workflow efficiency improvements from user feedback
