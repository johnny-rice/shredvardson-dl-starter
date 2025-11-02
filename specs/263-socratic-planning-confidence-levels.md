---
id: SPEC-263
title: Add confidence levels and recommendations to Socratic planning (Phase 2 exploration)
type: spec
priority: p2
status: ready
lane: spec-driven
issue: 263
created: 2025-01-02
labels: [documentation, enhancement, spec-lane]
plan: plans/263-socratic-planning-confidence-levels.md
tasks: tasks/263-socratic-planning-confidence-levels.md
---

# Add Confidence Levels and Recommendations to Socratic Planning (Phase 2 Exploration)

## Summary

Enhance Phase 2 (Exploration) of the Socratic planning methodology to include confidence-based recommendations with explicit percentages, auto-research triggers when confidence drops below 90%, clear visual indicators for recommended options, and transparent reasoning that explains why the recommendation fits the user's specific context.

## Problem Statement

During Phase 2 of design discovery (`/spec:plan` for `lane: spec-driven` features), Claude presents 2-3 architectural approaches with pros/cons but no recommendation. This leaves the technical decision burden entirely on the user, creating decision fatigue especially for users without deep technical expertise.

### Current Behavior

```
Option A: Redis Queue + Worker
✅ Pros: [...]
❌ Cons: [...]

Option B: Supabase Edge Functions
✅ Pros: [...]
❌ Cons: [...]

Which approach fits your needs?
```

The user must evaluate all options without guidance on which is most appropriate for their specific context and tech stack.

## Proposed Solution

Enhance Phase 2 (Exploration) of the Socratic planning methodology to include:

1. **Confidence-based recommendations** with explicit percentage (e.g., "Confidence: 88%")
2. **Auto-research triggers** when confidence drops below 90% (uses Context7, WebSearch)
3. **Clear visual indicators** for recommended options (🎯 and ← RECOMMENDED markers)
4. **Transparent reasoning** explaining why the recommendation fits the user's context

### Enhanced Output Format

```
🎯 Recommended: Option B - Vercel Cron + Database Queue
Confidence: 88%
Reasoning: Based on your Vercel + Supabase stack, this avoids new infrastructure...

Option A: Redis Queue + Worker
✅ Pros: [...]
❌ Cons: [...]

Option B: Vercel Cron + Database Queue ← RECOMMENDED
✅ Pros: [...]
❌ Cons: [...]

Option C: Edge Functions
✅ Pros: [...]
❌ Cons: [...]

Which approach fits your needs? (Accept recommendation or choose different option)
```

### Confidence & Research Logic

**Confidence Threshold: 90%**
- ≥90%: Proceed with recommendation presentation
- <90%: Auto-trigger research before presenting options

**Auto-Research Sources:**
- Context7 MCP for library/framework documentation
- WebSearch for community consensus, 2025 best practices, security advisories

**Research Process Example:**
```
My confidence is 65% because the technology landscape may have shifted since January 2025.

Let me research:
[Context7] Checking Next.js 15 caching best practices...
[WebSearch] Searching "Next.js caching vs Redis 2025"...

[Research complete - confidence now: 92%]

🎯 Recommended: Option B...
```

### Scope Boundaries

**Apply to Phase 2 Only:**
- Phase 1 (Understanding): No changes - clarifying questions don't need confidence
- Phase 2 (Exploration): Add confidence + recommendation ✅
- Phase 3 (Design Presentation): No changes

## Acceptance Criteria

- [ ] Phase 2 exploration includes confidence level (percentage) for recommendation
- [ ] Recommended option is clearly marked with 🎯 and ← RECOMMENDED indicator
- [ ] Reasoning section explains why recommendation fits user's specific context (tech stack, existing infrastructure)
- [ ] If confidence <90%, automatically trigger Context7 + WebSearch research
- [ ] Research process is visible to user with status messages ("Let me research... [complete]")
- [ ] User can still override recommendation and choose different option
- [ ] Updated documentation in `/spec:plan` command reflecting new Phase 2 format
- [ ] Updated documentation in `prd-analyzer` Skill documenting confidence pattern
- [ ] Success metrics tracked: recommendation acceptance rate ≥70%, research trigger rate ~30%

## Technical Constraints

### Files to Update

1. **`.claude/commands/spec/plan.md`** (lines ~206-249)
   - Update Phase 2 (Exploration) format to include confidence section
   - Add recommendation visual indicators
   - Document research trigger logic

2. **`.claude/skills/prd-analyzer/SKILL.md`** (lines ~188-214)
   - Document confidence level calculation methodology
   - Add examples of when to trigger research
   - Define reasoning structure for recommendations

### Integration Points

- **Context7 MCP**: Already integrated, use for documentation lookups
- **WebSearch**: Already available, use for best practices validation
- **Tech Stack Context**: Pull from `project_context` in PRD analysis and research findings

### Confidence Calibration

Confidence should be based on:
- **Recency of knowledge** (post-2025 topics = lower confidence due to cutoff)
- **Tech stack familiarity** (Supabase/Next.js/Vercel = higher confidence)
- **Architecture complexity** (simpler patterns = higher confidence)
- **Community consensus availability** (well-documented patterns = higher confidence)

## Success Metrics

After 2 weeks of usage:
- User accepts recommendation ≥70% of time (indicates good calibration)
- Research triggered in ~30% of planning sessions
- Subjective: User reports reduced decision paralysis in feedback

## Out of Scope

- Confidence levels in Phase 1 (Understanding) or Phase 3 (Design Presentation)
- Machine learning or automated acceptance tracking (manual observation for now)
- Confidence levels in other workflows beyond `/spec:plan`

## References

### Similar Implementations Found

- **Research Agent confidence pattern**: `.claude/sub-agents/research-agent.md` uses `confidence: "high" | "medium" | "low"` format
- **Security Scanner confidence pattern**: `.claude/sub-agents/security-scanner.md` uses similar confidence ratings for findings
- **Phase 2 exploration format**: `.claude/commands/spec/plan.md:206-249` defines current pros/cons structure
- **PRD analyzer Skill**: `.claude/skills/prd-analyzer/SKILL.md:188-214` documents Socratic methodology

### Related Architecture Docs

- ADR 009: Sub-agent orchestration pattern for delegating research
- ADR 010: Research Agent workflow with external MCP integration
- Workflow: `/research` for external documentation research patterns

### External Library Documentation

- Context7 MCP: For library-specific documentation lookups
- WebSearch: For latest best practices and community consensus