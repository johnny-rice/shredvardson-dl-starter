---
id: SPEC-257
title: Integrate sub-agents into workflow lane commands for token optimization
type: spec
priority: p2
status: ready
lane: spec-driven
issue: 257
created: 2025-11-02
plan: plans/integrate-sub-agents-workflow-commands.md
adr: docs/decisions/ADR-008-sub-agent-orchestration-pattern.md
tasks: tasks/integrate-sub-agents-workflow-commands.md
---

# Integrate sub-agents into workflow lane commands for token optimization

## Summary

Integrate sub-agents (Research Agent, Security Scanner, etc.) into spec-driven workflow commands (`/spec:specify`, `/spec:plan`, `/spec:tasks`, `/code`) to delegate exploration and research tasks from the expensive main Sonnet agent to cheaper Haiku-based sub-agents, achieving 56% cost reduction per workflow ($1.60 vs $3.60).

## Problem Statement

Sub-agents are implemented and working in standalone commands (`/research:explore`, `/security:scan`, etc.) but are **NOT integrated** into the spec-driven workflow lanes (`/spec:specify`, `/spec:plan`, `/spec:tasks`, `/code`).

**Current situation:**

- ✅ 8 sub-agent definitions exist in `.claude/agents/` (Research Agent, Security Scanner, etc.)
- ✅ 5 standalone commands successfully delegate to sub-agents
- ❌ Workflow lane commands (spec/code) do NOT use sub-agents
- ❌ Main Sonnet agent does ALL research/exploration work
- ❌ Missing **56% cost savings opportunity** ($240/year)

**Gap identified:**
Workflow lanes use Skills (TypeScript scripts) for deterministic tasks, but they should ALSO delegate exploration/research tasks to sub-agents for token isolation.

**Example:**
When user runs `/spec:plan`, the main agent explores the codebase with expensive Sonnet tokens (50K tokens = $0.90), when it should delegate to Research Agent with cheap Haiku tokens (45K tokens = $0.25).

## Proposed Solution

Implement a **hybrid architecture** that combines Skills and sub-agents with clear boundaries:

- **Skills** → Deterministic execution (migrations, validation, parsing)
- **Sub-agents** → Exploration/research (codebase analysis, security scanning, pattern discovery)

**Commands to update:**

1. `/spec:specify` → Add Research Agent for finding similar implementations
2. `/spec:plan` → Add Research Agent + Security Scanner before planning
3. `/spec:tasks` → Add Research Agent for dependency analysis
4. `/code` → Add Security Scanner pre-check before implementation

**Integration Pattern:**

```typescript
// Example: /spec:plan with sub-agent delegation
1. Delegate to Research Agent: "Analyze codebase for X"
2. Delegate to Security Scanner: "Scan for vulnerabilities in Y"
3. Collect findings from both agents
4. Pass to main agent for Socratic planning
5. Execute planning Skills with enriched context
```

## Acceptance Criteria

- [ ] `/spec:specify` delegates research to Research Agent to find similar implementations
- [ ] `/spec:plan` uses Research Agent for codebase exploration + Security Scanner for security analysis
- [ ] `/spec:tasks` uses Research Agent for dependency analysis
- [ ] `/code` uses Security Scanner for pre-implementation security checks
- [ ] Token usage measured before/after (target: 50%+ reduction from 120K to 50-60K tokens)
- [ ] Cost per workflow measured (target: $1.60 vs current $3.60)
- [ ] Documentation updated with Skills vs sub-agents integration guidelines
- [ ] Quality validation: output quality maintained or improved (measured over 2-week period)

## Technical Constraints

**File locations:**

- Sub-agent definitions: `.claude/agents/`
- Command implementations: `.claude/commands/spec/` and `.claude/commands/code/`
- Skills: `.claude/skills/`
- Documentation: `docs/architecture/`

**Existing architecture:**

- ADR-002: Skills Architecture (must maintain compatibility)
- Existing sub-agent implementations must be used as-is
- Working standalone commands provide reference implementation

**Requirements:**

- No breaking changes to existing command syntax
- Fallback to current behavior if sub-agents unavailable
- Gradual rollout possible (one command at a time)
- New sub-agent delegation must be transparent to users

## Success Metrics

Track for 2 weeks after implementation:

- **Token usage per workflow:** Target 50-60K vs current 120K (50%+ reduction)
- **Cost per workflow:** Target $1.60 vs current $3.60 (56% reduction)
- **Time to completion:** Should be faster due to parallel execution
- **Output quality:** Should improve with dedicated research (measured subjectively)
- **Annual cost savings:** $240/year (based on 10 workflows/month)

## Out of Scope

- Changes to standalone sub-agent commands (already working)
- New sub-agent implementations (use existing 8 agents)
- Changes to Skills architecture or ADR-002
- Complete rewrite of workflow commands (enhancement only)
- Automated quality measurement (manual validation acceptable for v1)

## References

- Issue #257: https://github.com/[org]/[repo]/issues/257
- Issue #157: Implement Sub-Agent Architecture (✅ CLOSED)
- Issue #210: Wire up sub-agent delegation (✅ CLOSED - standalone commands only)
- Issue #156: Token & Cost Optimization (PARENT EPIC)
- ADR-002: Skills Architecture
- Sub-agent definitions: `.claude/agents/`
- Existing standalone commands: `.claude/commands/research/`, `.claude/commands/security/`
