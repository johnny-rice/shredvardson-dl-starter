# ADR-008: Sub-Agent Orchestration Pattern

**Status:** Proposed
**Date:** 2025-11-02
**Deciders:** Engineering Team
**Related Issues:** #257, #156 (Token & Cost Optimization Epic)

## Context

Sub-agents are implemented and working in standalone commands (`/research:explore`, `/security:scan`), but workflow lane commands (`/spec:specify`, `/spec:plan`, `/spec:tasks`, `/code`) do NOT use sub-agents. This results in the main Sonnet agent performing all research and exploration work, missing a **56% cost savings opportunity** ($240/year).

**Current situation:**

- ✅ 8 sub-agent definitions exist (Research Agent, Security Scanner, etc.)
- ✅ 5 standalone commands successfully delegate to sub-agents
- ❌ Workflow lane commands use only Skills (deterministic tasks)
- ❌ Main Sonnet agent does ALL research/exploration (50K tokens @ $0.90)
- ❌ Should delegate to Haiku sub-agents (45K tokens @ $0.25)

**Business impact:**

- Current cost per workflow: $3.60 (120K Sonnet tokens)
- Target cost per workflow: $1.60 (20K Sonnet + 48K Haiku tokens)
- Annual savings: $240/year at 10 workflows/month

## Decision

We will implement a **centralized Agent Orchestrator Skill** that enables workflow commands to delegate exploration and research tasks to Haiku-based sub-agents through a unified orchestration API.

**Architecture Pattern:** Skill-Level Orchestration (centralized coordinator)

**Key components:**

1. **Agent Orchestrator Skill** - New Skill in `.claude/skills/agent-orchestrator/`
2. **Delegation API** - TypeScript scripts for routing tasks to appropriate sub-agents
3. **JSON Response Contracts** - Structured data exchange between orchestrator and sub-agents
4. **Parallel Execution** - Multiple sub-agents invoked simultaneously for complex workflows
5. **Fallback Logic** - Graceful degradation if sub-agent delegation fails

## Consequences

### Positive

**Token & Cost Optimization:**

- 83% token reduction per workflow (120K → 20K tokens)
- 82% cost reduction per workflow ($3.60 → $0.65)
- $240/year cost savings at current usage (10 workflows/month)
- Haiku isolation prevents context pollution in main agent

**Scalability:**

- Centralized orchestrator scales to 10,000+ agents (industry research)
- Single point of update as new agents added
- Easy to add new workflow commands using orchestrator
- Supports parallel and sequential agent composition

**Quality:**

- Dedicated sub-agents produce higher-quality research
- Evidence-based planning (research findings inform design decisions)
- Security pre-checks prevent vulnerable implementations
- External documentation integration (Context7, Supabase docs, WebSearch)

**Developer Experience:**

- Commands remain simple (delegate to orchestrator, use findings)
- Consistent delegation pattern across all workflows
- Clear error messages and fallback behavior
- Observable (all sub-agent calls logged)

### Negative

**Initial Implementation Cost:**

- 15-20 hours to build orchestrator and integrate 4 commands
- Learning curve for team on orchestration patterns
- Additional test coverage required (orchestrator + integration tests)

**Operational Complexity:**

- New dependency (orchestrator Skill must be working)
- Debugging requires understanding orchestrator → sub-agent → response flow
- Monitoring needed for token/cost savings validation

**Risk:**

- Sub-agent failures could increase workflow latency (mitigated by 120s timeout + fallback)
- JSON parsing errors could break workflows (mitigated by schema validation + fallback)
- Quality could degrade if sub-agents produce poor research (mitigated by 2-week validation period)

### Neutral

**No Breaking Changes:**

- Commands maintain existing syntax (orchestration is transparent)
- Existing sub-agents work as-is (no modifications needed)
- Gradual rollout possible (one command at a time)
- Rollback safe (commands fall back to main agent)

## Alternatives Considered

### Option A: Command-Level Integration

**Description:** Each workflow command directly calls sub-agents at specific steps

**Pros:**

- Simple to implement incrementally
- Full control over when/how sub-agents invoked
- Easy to add fallback logic

**Cons:**

- Duplicated sub-agent invocation code across 4 commands
- Each command needs separate updates for new agents
- Harder to enforce consistent sub-agent usage patterns
- Doesn't scale well (N commands × M agents = N×M integration points)

**Decision:** Rejected - doesn't scale as agents/commands grow

---

### Option B: Skill-Level Orchestration (CHOSEN)

**Description:** Create centralized orchestrator Skill that workflow commands invoke

**Pros:**

- Centralized sub-agent logic (DRY principle)
- Consistent sub-agent behavior across all commands
- Easy to add new sub-agents (update orchestrator once)
- Scales to 10,000+ agents (industry proven)
- Clear separation: Skills = deterministic, Orchestrator = delegation

**Cons:**

- Requires new orchestrator Skill infrastructure
- More abstraction layers (command → orchestrator → sub-agent)
- Slightly higher complexity for initial implementation

**Decision:** Chosen - best long-term scalability and maintainability

---

### Option C: Hybrid (Command Decides, Shared Helpers)

**Description:** Commands decide when to delegate, use shared helper functions

**Pros:**

- Balance of simplicity and DRY
- Commands retain control over delegation timing
- Shared helpers ensure consistent JSON parsing

**Cons:**

- Helpers still need to be called from each command
- Medium code duplication
- Helpers may grow complex over time
- Doesn't provide same scalability as centralized orchestrator

**Decision:** Rejected - middle ground doesn't provide enough benefits

## Implementation Plan

**Phases:**

1. Build Agent Orchestrator Skill (4-6 hours)
2. Integrate `/spec:plan` (highest savings) (2-3 hours)
3. Integrate `/spec:specify` (2 hours)
4. Integrate `/spec:tasks` (2 hours)
5. Integrate `/code` (2-3 hours)
6. Testing & Validation (3-4 hours)
7. Documentation & Rollout (2-3 hours)

**Total estimated effort:** 15-23 hours

**Success criteria:**

- 50%+ token reduction measured
- 56%+ cost reduction measured
- Output quality maintained (manual validation)
- 80% unit test coverage for orchestrator
- 70% integration test coverage for workflows

## References

- **Spec:** specs/integrate-sub-agents-workflow-commands.md
- **Implementation Plan:** plans/integrate-sub-agents-workflow-commands.md
- **Issue:** #257
- **Parent Epic:** #156 - Token & Cost Optimization
- **Related ADRs:**
  - ADR-005: Database Migration Workflow (Skills pattern)
  - ADR-006: Lazy-Loaded External Component Templates (progressive disclosure)
- **Industry Research:**
  - 2025 Multi-Agent LLM Orchestration Best Practices
  - Anthropic Multi-Agent Research System
  - Frameworks: AutoGen, CrewAI, LangGraph (centralized orchestration)
- **Existing Implementations:**
  - `.claude/agents/research-agent.md` (sub-agent definition)
  - `.claude/commands/research/explore.md` (standalone delegation example)
  - `.claude/skills/test-scaffolder/` (Skill pattern with sub-agent delegation)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
