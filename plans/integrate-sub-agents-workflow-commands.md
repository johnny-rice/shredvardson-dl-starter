---
title: Integrate sub-agents into workflow lane commands - Implementation Plan
spec: specs/integrate-sub-agents-workflow-commands.md
lane: spec-driven
created: 2025-11-02
status: draft
---

# Integrate sub-agents into workflow lane commands - Implementation Plan

## Overview

This plan implements a centralized **Agent Orchestrator Skill** that enables workflow commands (`/spec:specify`, `/spec:plan`, `/spec:tasks`, `/code`) to delegate exploration and research tasks to Haiku-based sub-agents, achieving 56% cost reduction per workflow ($1.60 vs $3.60) through token isolation.

**Architecture Pattern:** Skill-Level Orchestration (centralized coordinator)

**Key Innovation:** Sub-agents execute in isolated context (0 tokens in main agent), with structured JSON responses parsed by the orchestrator.

## Design Decisions

### 1. Orchestration Pattern: Skill-Level (Option B)

**Chosen:** Centralized orchestrator Skill that all workflow commands invoke

**Rationale:**
- Industry best practice for production multi-agent systems (2025 research)
- Scales to 10,000+ agents with 80%+ coordination efficiency
- Matches existing Skills architecture (supabase-integration, test-scaffolder)
- Single point of update as new agents added
- Research shows 8-10x memory reduction vs distributed delegation

**Alternatives considered:**
- Command-level integration: Too much duplication, doesn't scale
- Distributed delegation: Higher coordination overhead, context pollution risk

### 2. Communication Pattern: Structured JSON (Option A)

**Chosen:** Sub-agents return structured JSON, orchestrator parses and validates

**Rationale:**
- Already implemented in existing sub-agents (Research Agent, Security Scanner)
- Most token-efficient (vs conversational extraction or file I/O)
- Clear contracts enable debugging and testing
- Supports parallel execution with mergeable responses

**Alternatives considered:**
- Shared context files: Adds I/O overhead
- Conversational extraction: Uses more tokens for parsing

### 3. Progressive Disclosure Strategy

**Implementation:**
- Orchestrator Skill loads in 3 tiers: metadata (20 tokens) → SKILL.md (200 tokens) → scripts (0 tokens, executed)
- Sub-agents execute in isolated context (0 tokens in main agent)
- Only JSON responses loaded into main agent context (~2-5K tokens per agent)

**Token budget per workflow:**
- Command: 50-200 tokens
- Orchestrator SKILL.md: 200 tokens
- Sub-agent responses: 2-5K tokens each
- **Total overhead:** 3-8K tokens (vs 120K baseline)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Commands Layer                   │
│  (/spec:specify, /spec:plan, /spec:tasks, /code)            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Invokes via pnpm skill:run
                    ↓
┌─────────────────────────────────────────────────────────────┐
│              Agent Orchestrator Skill (NEW)                  │
│  .claude/skills/agent-orchestrator/                         │
│                                                              │
│  • Centralized delegation logic                             │
│  • Sub-agent routing based on task type                     │
│  • JSON response parsing & validation                       │
│  • Error handling & fallback                                │
│  • Parallel execution coordination                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Delegates via Task tool
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Sub-Agent Layer                           │
│                                                              │
│  Research Agent ────┐                                       │
│  Security Scanner ──┼── Return structured JSON             │
│  Test Generator ────┤                                       │
│  (Future agents)────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Agent Orchestrator Skill:**
- `skill.json`: Metadata (20 tokens)
- `SKILL.md`: Discovery documentation (200 tokens)
- `scripts/orchestrate.ts`: Main entry point
- `scripts/delegate-research.ts`: Research Agent delegation
- `scripts/delegate-security.ts`: Security Scanner delegation
- `scripts/delegate-test.ts`: Test Generator delegation
- `scripts/parse-response.ts`: JSON parsing & validation
- `scripts/types.ts`: TypeScript interfaces

**Workflow Commands (Updated):**
- `/spec:specify`: Add research step for similar implementations
- `/spec:plan`: Add multi-agent research before Socratic planning
- `/spec:tasks`: Add dependency analysis via research
- `/code`: Add security pre-check before implementation

### Data Flow

**Example: `/spec:plan` with Multi-Agent Delegation**

1. User invokes: `/spec:plan specs/payment-processing.md`
2. Command reads spec, extracts context (payment, Stripe, PCI)
3. Command delegates to orchestrator:
   ```bash
   pnpm skill:run agent-orchestrator orchestrate '{
     "task_type": "multi",
     "agents": ["research", "security"],
     "context": {
       "query": "Analyze payment processing patterns",
       "focus_areas": ["stripe", "payments", "PCI"],
       "depth": "deep"
     }
   }'
   ```
4. Orchestrator invokes Research Agent + Security Scanner in parallel (isolated context)
5. Orchestrator merges JSON responses:
   ```json
   {
     "success": true,
     "agents_used": ["research", "security"],
     "findings": {
       "research": { "key_findings": [...], "code_locations": [...] },
       "security": { "vulnerabilities": [...], "recommendations": [...] }
     },
     "execution_time_ms": 45000,
     "tokens_used": 48000,
     "confidence": "high"
   }
   ```
6. Command uses findings to enrich Socratic planning with evidence-based options

**Token Comparison:**
- Without orchestrator: 120K tokens ($3.60)
- With orchestrator: 20K tokens ($0.65)
- **Savings: 83% tokens, 82% cost**

## Implementation Phases

### Phase 1: Build Agent Orchestrator Skill

**Goal:** Create centralized orchestration infrastructure

**Tasks:**
- Create `.claude/skills/agent-orchestrator/` directory structure
- Implement `skill.json` metadata
- Write `SKILL.md` progressive disclosure documentation
- Implement `scripts/types.ts` with TypeScript interfaces
- Implement `scripts/orchestrate.ts` main entry point
- Implement `scripts/delegate-research.ts` for Research Agent
- Implement `scripts/delegate-security.ts` for Security Scanner
- Implement `scripts/delegate-test.ts` for Test Generator (future)
- Implement `scripts/parse-response.ts` JSON validation
- Add error handling and fallback logic

**Deliverables:**
- Working orchestrator Skill callable via `pnpm skill:run agent-orchestrator orchestrate '{...}'`
- Unit tests for orchestration logic (80% coverage target)
- Documentation in `README.md`

**Estimated time:** 4-6 hours

---

### Phase 2: Integrate `/spec:plan` Command

**Goal:** First workflow command integration (highest token savings)

**Tasks:**
- Update `.claude/commands/spec/plan.md` to add orchestration step
- Add delegation call before Phase 1 (Understanding)
- Parse orchestrator JSON response
- Use findings to enrich Socratic questions in Phase 2 (Exploration)
- Include architecture patterns and security recommendations in Phase 3 (Design)
- Add fallback logic if orchestrator fails
- Test integration end-to-end
- Measure token usage before/after

**Deliverables:**
- Updated `/spec:plan` command with orchestrator integration
- Integration tests for command → orchestrator flow
- Token usage measurement showing 80%+ reduction

**Estimated time:** 2-3 hours

---

### Phase 3: Integrate `/spec:specify` Command

**Goal:** Add research for similar implementations during spec creation

**Tasks:**
- Update `.claude/commands/spec/specify.md` to add research step
- Delegate "find similar implementations" query to orchestrator
- Parse findings and include in spec template
- Add similar patterns to "Proposed Solution" section
- Add code references to "References" section
- Test with various feature types
- Measure token usage

**Deliverables:**
- Updated `/spec:specify` command
- Specs include evidence-based patterns and references
- Token usage measurement showing 90%+ reduction for research step

**Estimated time:** 2 hours

---

### Phase 4: Integrate `/spec:tasks` Command

**Goal:** Add dependency analysis for task ordering

**Tasks:**
- Update `.claude/commands/spec/tasks.md` to add dependency research
- Delegate dependency discovery to orchestrator
- Parse findings to identify blocking tasks
- Order tasks based on dependency graph
- Flag missing prerequisites
- Test with complex multi-dependency features
- Measure token usage

**Deliverables:**
- Updated `/spec:tasks` command
- Task breakdowns include dependency ordering
- Token usage measurement showing 73%+ reduction

**Estimated time:** 2 hours

---

### Phase 5: Integrate `/code` Command

**Goal:** Add security pre-check before implementation

**Tasks:**
- Update `.claude/commands/code/code.md` to add security scan step
- Delegate security analysis to orchestrator (Security Scanner)
- Parse findings and block implementation on P0 issues
- Include security patterns in generated code
- Add security tests to implementation plan
- Test with security-sensitive features (auth, payments, data exposure)
- Measure token usage

**Deliverables:**
- Updated `/code` command with security gate
- P0 security issues block implementation
- Token usage measurement showing 76%+ reduction

**Estimated time:** 2-3 hours

---

### Phase 6: Testing & Validation

**Goal:** Validate token savings, cost reduction, and quality

**Tasks:**
- Write unit tests for orchestrator (80% coverage)
- Write integration tests for each workflow command (70% coverage)
- Write E2E tests for token optimization validation
- Run baseline measurements (without orchestrator)
- Run optimized measurements (with orchestrator)
- Calculate token reduction percentage
- Calculate cost reduction percentage
- Validate output quality over 2-week period (manual)
- Document findings and metrics

**Deliverables:**
- Test suite with 75%+ overall coverage
- Token/cost measurements proving 50%+ reduction
- Quality validation report
- Updated documentation with metrics

**Estimated time:** 3-4 hours

---

### Phase 7: Documentation & Rollout

**Goal:** Document architecture and enable team adoption

**Tasks:**
- Update `docs/architecture/` with orchestration pattern
- Create ADR documenting orchestration decision
- Update `.claude/skills/README.md` with agent-orchestrator
- Update workflow command documentation
- Create troubleshooting guide
- Add metrics dashboard (token usage, cost, execution time)
- Gradual rollout: enable one command at a time
- Monitor for issues during rollout
- Gather feedback from users

**Deliverables:**
- ADR: Sub-Agent Orchestration Pattern
- Updated Skills catalog
- Troubleshooting documentation
- Rollout complete with monitoring

**Estimated time:** 2-3 hours

## Technical Specifications

### Data Model

**Orchestration Request:**
```typescript
interface OrchestrationRequest {
  task_type: 'research' | 'security' | 'test' | 'multi';
  context: {
    query: string;
    focus_areas?: string[];
    depth?: 'shallow' | 'deep';
    include_external?: boolean;
  };
  agents?: Array<'research' | 'security' | 'test'>; // For parallel execution
}
```

**Orchestration Response:**
```typescript
interface OrchestrationResponse {
  success: boolean;
  agent_used: string | string[];
  findings: any; // Structured JSON from sub-agent(s)
  execution_time_ms: number;
  tokens_used: number;
  confidence: 'high' | 'medium' | 'low';
  error?: string;
  fallback?: string; // If delegation failed
}
```

**Research Agent Response:**
```typescript
interface ResearchResponse {
  key_findings: Array<{
    finding: string;
    source: 'internal' | 'external';
    location: string;
    reference?: string;
  }>;
  architecture_patterns: string[];
  recommendations: Array<{
    action: string;
    rationale: string;
  }>;
  code_locations: Array<{
    file: string;
    line: number;
    purpose: string;
  }>;
  external_references: Array<{
    library: string;
    topic: string;
    url: string;
  }>;
  research_depth: 'shallow' | 'deep';
  confidence: 'high' | 'medium' | 'low';
}
```

**Security Scanner Response:**
```typescript
interface SecurityResponse {
  vulnerabilities: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    location: string;
    recommendation: string;
  }>;
  rls_gaps: string[];
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
}
```

### API Design

**Orchestrator Entry Point:**
```bash
pnpm skill:run agent-orchestrator orchestrate '{
  "task_type": "research",
  "context": {
    "query": "How does authentication work?",
    "focus_areas": ["auth", "session"],
    "depth": "deep"
  }
}'
```

**Response:**
```json
{
  "success": true,
  "agent_used": "research",
  "findings": {
    "key_findings": [...],
    "architecture_patterns": [...],
    "code_locations": [...]
  },
  "execution_time_ms": 45000,
  "tokens_used": 48000,
  "confidence": "high"
}
```

**Parallel Execution:**
```bash
pnpm skill:run agent-orchestrator orchestrate '{
  "task_type": "multi",
  "agents": ["research", "security"],
  "context": {...}
}'
```

**Response:**
```json
{
  "success": true,
  "agents_used": ["research", "security"],
  "findings": {
    "research": {...},
    "security": {...}
  },
  "execution_time_ms": 45000,
  "tokens_used": 48000,
  "confidence": "high"
}
```

### Security

**Orchestrator Security:**
- Read-only operations (no file writes)
- JSON parsing with schema validation
- Error messages sanitized (no sensitive data leaks)
- Sub-agent timeout enforcement (120s max)

**Sub-Agent Security:**
- Existing sub-agents already scoped to read-only tools
- Research Agent: Read, Glob, Grep, Bash (read-only)
- Security Scanner: Read, Glob, Grep, MCP tools
- Token limits enforced by agent definitions

**Fallback Security:**
- If orchestrator fails, commands fall back to main agent
- No silent failures (all errors logged)
- User notified if delegation failed

## Testing Strategy

### Unit Tests (Tier 1)

**Target:** 80% coverage for orchestrator scripts

**Test files:**
- `tests/skills/agent-orchestrator/orchestrate.test.ts`
- `tests/skills/agent-orchestrator/delegate-research.test.ts`
- `tests/skills/agent-orchestrator/delegate-security.test.ts`
- `tests/skills/agent-orchestrator/parse-response.test.ts`

**Key tests:**
- Build correct JSON input for sub-agents
- Parse sub-agent JSON responses
- Handle malformed JSON gracefully
- Execute agents in parallel (timing validation)
- Merge findings from multiple agents
- Return fallback on sub-agent failure

**Run:** `pnpm test:unit tests/skills/agent-orchestrator/`

---

### Integration Tests (Tier 2)

**Target:** 70% coverage for workflow integration paths

**Test files:**
- `tests/integration/workflow-orchestration.test.ts`

**Key tests:**
- `/spec:plan` delegates research before planning
- `/spec:plan` uses findings in Socratic questions
- `/spec:specify` includes research findings in spec template
- `/spec:tasks` orders tasks by dependency graph
- `/code` blocks implementation on P0 security issues

**Run:** `pnpm test:integration tests/integration/workflow-orchestration.test.ts`

---

### E2E Tests (Tier 3)

**Target:** Validate token/cost reduction and quality

**Test files:**
- `tests/e2e/token-optimization.test.ts`

**Key tests:**
- Token reduction: 50%+ for `/spec:plan` workflow
- Cost reduction: 56%+ per workflow
- Output quality maintained (manual validation)

**Run:** `pnpm test:e2e tests/e2e/token-optimization.test.ts`

---

### Success Metrics

**Track for 2 weeks after implementation:**
- **Token usage per workflow:** Target 50-60K vs current 120K (50%+ reduction)
- **Cost per workflow:** Target $1.60 vs current $3.60 (56% reduction)
- **Time to completion:** Should be faster due to parallel execution
- **Output quality:** Should improve with dedicated research (manual validation)
- **Annual cost savings:** $240/year (based on 10 workflows/month)

## Deployment

### Deployment Steps

1. **Phase 1:** Deploy agent-orchestrator Skill
   - Create Skill directory structure
   - Deploy scripts to `.claude/skills/agent-orchestrator/scripts/`
   - Validate via `pnpm skill:run agent-orchestrator orchestrate '{...}'`

2. **Phase 2-5:** Gradual command rollout
   - Deploy `/spec:plan` integration (highest savings)
   - Monitor for 2-3 days, gather feedback
   - Deploy `/spec:specify`, `/spec:tasks`, `/code` sequentially
   - Monitor each for issues before next deployment

3. **Phase 6:** Testing & validation
   - Run full test suite
   - Measure token/cost metrics
   - Manual quality validation

4. **Phase 7:** Documentation & announcement
   - Publish ADR
   - Update Skills catalog
   - Team announcement with usage guide

### Rollback Plan

**If issues detected:**
1. Disable orchestrator integration in affected command
2. Commands fall back to main agent (existing behavior)
3. Investigate issue in orchestrator scripts
4. Fix and redeploy incrementally

**Rollback is safe because:**
- Commands check `response.success` before using findings
- Fallback logic returns control to main agent
- No breaking changes to command syntax
- Users see no difference if orchestrator disabled

### Migration Strategy

**No migration needed:**
- New orchestrator Skill is additive (no breaking changes)
- Existing sub-agents work as-is (no modifications)
- Commands updated incrementally (gradual rollout)
- Users experience improved performance transparently

**Configuration:**
- No environment variables needed
- No feature flags required
- Orchestrator enabled by default once deployed

## Risk Mitigation

### Identified Risks

**Risk 1: Sub-agent failures increase workflow latency**
- **Mitigation:** 120s timeout enforced, fallback to main agent
- **Impact:** Medium (users wait 120s then proceed)
- **Likelihood:** Low (existing sub-agents stable)

**Risk 2: JSON parsing errors break workflows**
- **Mitigation:** Schema validation, graceful error handling, fallback logic
- **Impact:** Low (fallback preserves functionality)
- **Likelihood:** Low (sub-agents return valid JSON)

**Risk 3: Token savings don't materialize**
- **Mitigation:** E2E tests validate savings before rollout
- **Impact:** Medium (no cost reduction achieved)
- **Likelihood:** Very low (research proven, existing sub-agents work)

**Risk 4: Output quality degrades**
- **Mitigation:** 2-week manual validation period, rollback if quality drops
- **Impact:** High (user experience suffers)
- **Likelihood:** Very low (sub-agents designed for quality research)

**Risk 5: Orchestrator becomes bottleneck as agents scale**
- **Mitigation:** Parallel execution, stateless design, performance monitoring
- **Impact:** Medium (slower workflows)
- **Likelihood:** Low (research shows 10,000+ agent scalability)

## Success Criteria

### Must-Have (P0)

- [ ] Agent orchestrator Skill deployed and functional
- [ ] `/spec:plan` delegates to orchestrator successfully
- [ ] `/spec:specify` delegates to orchestrator successfully
- [ ] `/spec:tasks` delegates to orchestrator successfully
- [ ] `/code` delegates to orchestrator successfully
- [ ] Token usage reduced by 50%+ (measured)
- [ ] Cost reduced by 56%+ (measured)
- [ ] Output quality maintained (manual validation)
- [ ] Unit test coverage ≥80% for orchestrator
- [ ] Integration test coverage ≥70% for workflows
- [ ] Documentation complete (ADR, Skills catalog, troubleshooting)

### Nice-to-Have (P1)

- [ ] Metrics dashboard for token/cost tracking
- [ ] Automated quality validation (vs manual)
- [ ] Additional sub-agents integrated (Design, Marketing, Analytics)
- [ ] Performance benchmarking across different feature types
- [ ] A/B testing framework for orchestration strategies

### Future Enhancements (P2)

- [ ] Dynamic agent routing (LLM chooses which agents to invoke)
- [ ] Agent composition (chain multiple agents sequentially)
- [ ] Learning from past orchestrations (improve routing over time)
- [ ] Multi-language support for sub-agents (Python, Go agents)
- [ ] Distributed orchestration (multiple orchestrators in parallel)

## References

- **Spec:** [specs/integrate-sub-agents-workflow-commands.md](../specs/integrate-sub-agents-workflow-commands.md)
- **Issue:** #257
- **Parent Epic:** Issue #156 - Token & Cost Optimization
- **Related Issues:**
  - Issue #157: Implement Sub-Agent Architecture (✅ CLOSED)
  - Issue #210: Wire up sub-agent delegation (✅ CLOSED - standalone commands only)
- **ADR:** ADR-008 (to be created) - Sub-Agent Orchestration Pattern
- **Existing Sub-Agents:**
  - [.claude/agents/research-agent.md](../.claude/agents/research-agent.md)
  - [.claude/agents/security-scanner.md](../.claude/agents/security-scanner.md)
  - [.claude/agents/test-generator.md](../.claude/agents/test-generator.md)
- **Skills Architecture:**
  - [.claude/skills/README.md](../.claude/skills/README.md)
  - Existing Skills: supabase-integration, test-scaffolder, prd-analyzer, implementation-assistant
- **Research References:**
  - 2025 Multi-Agent LLM Orchestration Best Practices
  - Anthropic Multi-Agent Research System
  - Industry patterns: AutoGen, CrewAI, LangGraph

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
