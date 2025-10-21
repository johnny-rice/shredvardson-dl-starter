---
id: TASK-20251017-sub-agent-architecture
type: task
parentId: PLAN-20251017-sub-agent-architecture
issue: 157
plan: PLAN-20251017-sub-agent-architecture
spec: SPEC-20251017-sub-agent-architecture
branch: feature/157-sub-agent-architecture
source: https://github.com/Shredvardson/dl-starter/issues/157
---

# Task Breakdown: Sub-Agent Architecture with Haiku 4.5

## Overview

Implement multi-model agent orchestration system to achieve 30-40% cost reduction and 4-5x faster response times on routine tasks.

**Parent Plan:** [PLAN-20251017-sub-agent-architecture](../plans/PLAN-20251017-sub-agent-architecture.md)
**Parent Spec:** [SPEC-20251017-sub-agent-architecture](../specs/SPEC-20251017-sub-agent-architecture.md)

---

## Phase 1: Contracts & Interfaces (Day 1 - 4 hours)

**Goal:** Define behavioral contracts and validation criteria before any implementation.

### Task 1.1: Create Sub-Agent Contract Definitions

**File:** `tests/sub-agents/contracts.md`

**Acceptance Criteria:**

- [ ] Research Agent contract defined (input/output/timeout/success)
- [ ] Security Scanner contract defined
- [ ] Test Generator contract defined
- [ ] Refactor Analyzer contract defined
- [ ] Documentation Writer contract defined
- [ ] Each contract specifies:
  - Required input fields
  - Output structure and size limits (<5K tokens)
  - Timeout thresholds (30-90 seconds)
  - Success criteria (validation rules)

**Commands:**

```bash
mkdir -p tests/sub-agents
# Create contracts.md with all 5 agent contracts
```

**Estimated Time:** 2 hours

---

### Task 1.2: Create Directory Structure

**Files:**

```
.claude/agents/          # Create if not exists
.claude/commands/security/  # Create if not exists
tests/sub-agents/        # Created in Task 1.1
```

**Acceptance Criteria:**

- [ ] `.claude/agents/` directory created
- [ ] `.claude/commands/security/` directory created
- [ ] `tests/sub-agents/` directory created
- [ ] All directories added to git

**Commands:**

```bash
mkdir -p .claude/agents
mkdir -p .claude/commands/security
git add .claude/agents/.gitkeep
git add .claude/commands/security/.gitkeep
git add tests/sub-agents/.gitkeep
```

**Estimated Time:** 15 minutes

---

### Task 1.3: Define TypeScript Types (Optional)

**File:** `types/sub-agents.ts`

**Purpose:** Type definitions for sub-agent inputs/outputs (if needed for validation)

**Acceptance Criteria:**

- [ ] ResearchAgentInput type defined
- [ ] ResearchAgentOutput type defined
- [ ] SecurityScannerInput/Output types defined
- [ ] TestGeneratorInput/Output types defined
- [ ] RefactorAnalyzerInput/Output types defined
- [ ] DocumentationWriterInput/Output types defined

**Commands:**

```bash
# Optional - only if TypeScript validation needed
# Skip if using pure markdown specs
```

**Estimated Time:** 1 hour (optional)

---

## Phase 2: Test Foundation (Day 1-2 - 6 hours)

**Goal:** Implement tests that validate sub-agent contracts BEFORE agents exist (TDD).

### Task 2.1: Create Integration Test Framework

**File:** `tests/sub-agents/delegation.test.ts`

**Acceptance Criteria:**

- [ ] Test setup with agent delegation utilities
- [ ] Mock sub-agent responses for testing
- [ ] Helper functions for validation
- [ ] Timeout handling tests
- [ ] Parallel execution tests

**Tests:**

```typescript
describe('Sub-Agent Delegation Framework', () => {
  test('delegateToAgent validates input structure');
  test('delegateToAgent enforces timeout limits');
  test('delegateToAgent validates output structure');
  test('delegateToAgent handles agent failures gracefully');
  test('parallel delegation runs concurrently');
});
```

**Commands:**

```bash
pnpm add -D @types/node  # If not already present
# Create test file and run
pnpm test tests/sub-agents/delegation.test.ts
```

**Estimated Time:** 3 hours

---

### Task 2.2: Create Contract Validation Tests

**File:** `tests/sub-agents/contracts.test.ts`

**Acceptance Criteria:**

- [ ] Tests validate each agent's contract compliance
- [ ] Tests fail initially (no agents implemented yet)
- [ ] Tests check input validation
- [ ] Tests check output structure
- [ ] Tests check token limits (<5K)
- [ ] Tests check timeout enforcement

**Tests:**

```typescript
describe('Research Agent Contract', () => {
  test('accepts valid input structure');
  test('rejects invalid input');
  test('returns output with all required fields');
  test('output size is <5K tokens');
  test('completes within 60 seconds');
});

// Repeat for each agent type
```

**Commands:**

```bash
pnpm test tests/sub-agents/contracts.test.ts
# Expected: All tests fail (agents not implemented yet)
```

**Estimated Time:** 2 hours

---

### Task 2.3: Create E2E Test Stubs

**File:** `tests/sub-agents/e2e.spec.ts`

**Acceptance Criteria:**

- [ ] E2E test stubs for command integration
- [ ] Tests initially skipped or failing
- [ ] Clear TODOs for what each test validates

**Tests:**

```typescript
describe.skip('Sub-Agent E2E Workflows', () => {
  test.todo('/dev:implement delegates research automatically');
  test.todo('/security:scan produces comprehensive report');
  test.todo('/research:explore returns actionable insights');
  test.todo('Command integration preserves backward compatibility');
});
```

**Commands:**

```bash
pnpm test tests/sub-agents/e2e.spec.ts
# Expected: All tests skipped
```

**Estimated Time:** 1 hour

---

## Phase 3: Implementation (Day 3-6 - 16 hours)

**Goal:** Implement sub-agents and commands to pass all tests.

### Task 3.1: Implement Research Agent

**File:** `.claude/agents/research-agent.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with `model: haiku-4.5`
- [ ] Clear mission statement
- [ ] Context isolation instructions
- [ ] Input format specification
- [ ] Output format specification (with structure)
- [ ] Examples of input/output
- [ ] Tools list: Read, Glob, Grep, Bash (read-only)
- [ ] Token budget guidance (explore freely, summarize <5K)

**Template Structure:**

```markdown
---
model: haiku-4.5
name: Research Agent
description: Deep codebase exploration with isolated context
tools: [Read, Glob, Grep, Bash]
---

# Research Agent

[Mission statement]

## Context Isolation

- Burn tokens freely in isolated context
- Return summaries <5K tokens
- Focus on actionable insights

## Input Format

[Expected input structure]

## Output Format

## Key Findings

- [3-5 bullet points with file:line references]

## Architecture Patterns

- [Identified patterns]

## Recommendations

- [Actionable next steps]

## Code Locations

- [Relevant files]

## Success Criteria

[What constitutes successful research]

## Examples

[Concrete input/output examples]
```

**Validation:**

```bash
# Run contract tests
pnpm test tests/sub-agents/contracts.test.ts -t "Research Agent"
# Expected: Tests pass
```

**Estimated Time:** 2 hours

---

### Task 3.2: Implement Security Scanner

**File:** `.claude/agents/security-scanner.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with `model: haiku-4.5`
- [ ] Security scanning mission
- [ ] RLS policy validation instructions
- [ ] OWASP Top 10 check guidelines
- [ ] Input format (scan_type, targets, severity_threshold)
- [ ] Output format (critical/high/medium/low findings)
- [ ] Tools list: Read, Glob, Grep
- [ ] Examples of security findings

**Validation:**

```bash
pnpm test tests/sub-agents/contracts.test.ts -t "Security Scanner"
```

**Estimated Time:** 2 hours

---

### Task 3.3: Implement Test Generator

**File:** `.claude/agents/test-generator.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with `model: haiku-4.5`
- [ ] Test generation mission
- [ ] Unit/E2E/Integration test guidance
- [ ] Input format (test_type, targets, coverage_goal)
- [ ] Output format (generated tests, coverage strategy)
- [ ] Tools list: Read, Glob, Grep, Write (for test files)
- [ ] Vitest + React Testing Library patterns
- [ ] Playwright E2E patterns

**Validation:**

```bash
pnpm test tests/sub-agents/contracts.test.ts -t "Test Generator"
```

**Estimated Time:** 2 hours

---

### Task 3.4: Implement Refactor Analyzer

**File:** `.claude/agents/refactor-analyzer.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with `model: haiku-4.5`
- [ ] Code quality analysis mission
- [ ] Complexity metrics guidelines
- [ ] Coupling/cohesion detection
- [ ] Input format (targets, focus, priority_threshold)
- [ ] Output format (critical opportunities, code smells, metrics)
- [ ] Tools list: Read, Glob, Grep

**Validation:**

```bash
pnpm test tests/sub-agents/contracts.test.ts -t "Refactor Analyzer"
```

**Estimated Time:** 2 hours

---

### Task 3.5: Implement Documentation Writer

**File:** `.claude/agents/documentation-writer.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with `model: haiku-4.5`
- [ ] Documentation generation mission
- [ ] JSDoc/README/ADR/API doc guidance
- [ ] Input format (doc_type, targets, style)
- [ ] Output format (documentation draft, examples)
- [ ] Tools list: Read, Glob, Grep
- [ ] Markdown formatting guidelines

**Validation:**

```bash
pnpm test tests/sub-agents/contracts.test.ts -t "Documentation Writer"
```

**Estimated Time:** 2 hours

---

### Task 3.6: Update `/dev:implement` Command

**File:** `.claude/commands/dev/implement.md`

**Changes:**

- [ ] Add research delegation step before implementation
- [ ] Use `Task` tool with `subagent_type="research-agent"`
- [ ] Include input structure for research task
- [ ] Process research summary before coding
- [ ] Maintain backward compatibility

**Implementation:**

```markdown
## Research Phase (New)

Before implementing, delegate codebase research:

Use Task tool with:

- subagent_type: "research-agent"
- prompt: Structured research task with focus areas
- description: "Researching codebase patterns"

Review research summary (<5K tokens) and proceed with implementation.

## [Rest of existing implement.md content]
```

**Validation:**

```bash
# Manual test: Run /dev:implement and verify research delegation occurs
# E2E test should pass after this change
```

**Estimated Time:** 2 hours

---

### Task 3.7: Update `/dev:refactor-secure` Command

**File:** `.claude/commands/dev/refactor-secure.md`

**Changes:**

- [ ] Add security scanner delegation
- [ ] Add refactor analyzer delegation
- [ ] Run both in parallel using multiple Task calls
- [ ] Consolidate reports before implementation

**Validation:**

```bash
# Manual test: Run /dev:refactor-secure and verify dual delegation
```

**Estimated Time:** 2 hours

---

### Task 3.8: Update `/test:scaffold` Command

**File:** `.claude/commands/test/scaffold.md`

**Changes:**

- [ ] Add test generator delegation
- [ ] Pass test type and targets to sub-agent
- [ ] Review generated tests before writing
- [ ] Allow user to adjust if needed

**Validation:**

```bash
# Manual test: Run /test:scaffold and verify test generation delegation
```

**Estimated Time:** 1 hour

---

### Task 3.9: Update `/docs:generate` Command

**File:** `.claude/commands/docs/generate.md`

**Changes:**

- [ ] Add documentation writer delegation
- [ ] Pass doc type and targets to sub-agent
- [ ] Review generated docs before writing
- [ ] Allow user to refine if needed

**Validation:**

```bash
# Manual test: Run /docs:generate and verify doc generation delegation
```

**Estimated Time:** 1 hour

---

## Phase 4: Integration & Polish (Day 7-8 - 8 hours)

**Goal:** Create new commands, enable all tests, add polish features.

### Task 4.1: Create `/research:explore` Command

**File:** `.claude/commands/dev/research-explore.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with command metadata
- [ ] Direct delegation to research-agent
- [ ] Accept natural language query from user
- [ ] Present findings with option to drill deeper
- [ ] Support follow-up questions

**Template:**

```markdown
---
model: sonnet-4.5
name: /research:explore
description: Deep codebase exploration
tools: [Task]
---

# Research & Explore

Direct delegation to research-agent with user query.

[Implementation details]
```

**Validation:**

```bash
# Manual test: Run /research:explore "How does auth work?"
```

**Estimated Time:** 2 hours

---

### Task 4.2: Create `/security:scan` Command

**File:** `.claude/commands/security/scan.md`

**Acceptance Criteria:**

- [ ] YAML frontmatter with command metadata
- [ ] Direct delegation to security-scanner
- [ ] Support scan type flags (--type=rls|owasp|full)
- [ ] Support severity threshold (--severity=critical|high|medium|low)
- [ ] Present security report with remediation steps

**Validation:**

```bash
# Manual test: Run /security:scan --type=full
```

**Estimated Time:** 2 hours

---

### Task 4.3: Implement Parallel Execution

**Location:** Update existing commands to parallelize independent tasks

**Acceptance Criteria:**

- [ ] `/dev:refactor-secure` runs security + refactor in parallel
- [ ] Progress indicators show parallel execution ("Running 2 tasks...")
- [ ] Results consolidated after both complete
- [ ] Error handling if one task fails

**Validation:**

```bash
# Manual test: Verify parallel execution completes faster than sequential
# Integration test in delegation.test.ts passes
```

**Estimated Time:** 2 hours

---

### Task 4.4: Add Environment Variable Support

**Files:**

- `.env.example`
- `docs/ai/CLAUDE.md`

**Acceptance Criteria:**

- [ ] Add `DISABLE_DELEGATION=false` to `.env.example`
- [ ] Document behavior in `docs/ai/CLAUDE.md`
- [ ] Commands respect env var (fallback to Sonnet if true)
- [ ] Clear instructions for opt-out

**Changes:**

```bash
# .env.example
DISABLE_DELEGATION=false  # Set to true to disable Haiku sub-agents
```

**Validation:**

```bash
# Set DISABLE_DELEGATION=true and verify commands use Sonnet
```

**Estimated Time:** 1 hour

---

### Task 4.5: Enable E2E Tests

**File:** `tests/sub-agents/e2e.spec.ts`

**Acceptance Criteria:**

- [ ] Remove `.skip` from all E2E tests
- [ ] Implement test bodies
- [ ] All E2E tests pass
- [ ] Verify backward compatibility

**Validation:**

```bash
pnpm test tests/sub-agents/e2e.spec.ts
# Expected: All tests pass
```

**Estimated Time:** 1 hour

---

## Phase 5: Documentation & Release (Day 9-10 - 6 hours)

**Goal:** Document behavior, validate metrics, prepare for release.

### Task 5.1: Update AI Documentation

**File:** `docs/ai/CLAUDE.md`

**Acceptance Criteria:**

- [ ] Section on sub-agent architecture
- [ ] Explanation of when delegation occurs
- [ ] Examples of delegated workflows
- [ ] Opt-out instructions (`DISABLE_DELEGATION`)
- [ ] Performance characteristics (faster, cheaper)

**Content:**

```markdown
## Sub-Agent Architecture

Claude Code uses multi-model orchestration:

- **Main Agent (Sonnet 4.5):** Complex decisions, user interaction
- **Sub-Agents (Haiku 4.5):** Routine tasks (research, scanning, tests, docs)

### When Delegation Occurs

- Research-heavy feature implementation
- Security scanning in `/dev:refactor-secure`
- Test generation in `/test:scaffold`
- Documentation in `/docs:generate`

### Performance

- 30% faster on research tasks
- 60% cost reduction on routine work
- Transparent to users

### Opt-Out

Set `DISABLE_DELEGATION=true` in `.env` to use Sonnet for all tasks.
```

**Estimated Time:** 2 hours

---

### Task 5.2: Update Command Documentation

**Files:**

- `.claude/commands/dev/implement.md`
- `.claude/commands/dev/refactor-secure.md`
- `.claude/commands/test/scaffold.md`
- `.claude/commands/docs/generate.md`
- `.claude/commands/dev/research-explore.md` (new)
- `.claude/commands/security/scan.md` (new)

**Acceptance Criteria:**

- [ ] Each command documents delegation behavior
- [ ] Examples show expected output
- [ ] Performance notes added where relevant

**Estimated Time:** 1 hour

---

### Task 5.3: Create Troubleshooting Guide

**File:** `docs/ai/sub-agents-troubleshooting.md`

**Acceptance Criteria:**

- [ ] Common issues and solutions
- [ ] Quality degradation handling
- [ ] Timeout handling
- [ ] Fallback procedures
- [ ] When to escalate to Sonnet

**Content Outline:**

```markdown
# Sub-Agent Troubleshooting

## Issue: Sub-Agent Summary Insufficient

**Solution:** Ask follow-up question: "Show me full findings for [area]"

## Issue: Research Task Times Out

**Solution:** Narrow scope: "Research only auth-related patterns"

## Issue: Quality Lower Than Expected

**Solution:** Disable delegation: `DISABLE_DELEGATION=true`

[More issues and solutions]
```

**Estimated Time:** 1 hour

---

### Task 5.4: Validate Performance Metrics

**Goal:** Measure actual savings vs. projections

**Tasks:**

- [ ] Run research task with and without delegation
- [ ] Measure token usage (input + output)
- [ ] Calculate cost differential
- [ ] Measure end-to-end time
- [ ] Document results in issue #157

**Validation:**

```bash
# Example: Research auth patterns
# Without delegation: 50K Sonnet tokens = $0.90
# With delegation: 5K Sonnet + 50K Haiku = $0.30
# Savings: 67% cost, 30% faster
```

**Estimated Time:** 1 hour

---

### Task 5.5: Update Issue #157 with Results

**Task:**

- [ ] Comment on issue #157 with performance results
- [ ] Include token usage before/after
- [ ] Include cost savings calculation
- [ ] Include timing comparisons
- [ ] Link to documentation

**Template:**

```markdown
## Implementation Complete ✅

### Performance Results

- **Research tasks:** 35% faster, 68% cheaper
- **Security scanning:** 40% faster, 62% cheaper
- **Test generation:** 30% faster, 65% cheaper

### Files Changed

- 5 new sub-agent specs
- 4 updated commands
- 2 new commands
- Tests: 15 integration, 4 E2E

### Documentation

- [Sub-Agent Architecture](docs/ai/CLAUDE.md#sub-agent-architecture)
- [Troubleshooting Guide](docs/ai/sub-agents-troubleshooting.md)

### Next Steps

- Monitor quality metrics over next month
- Collect user feedback
- Adjust delegation rules if needed
```

**Estimated Time:** 30 minutes

---

### Task 5.6: Create Pull Request

**Task:**

- [ ] Create PR from `feature/157-sub-agent-architecture` to `main`
- [ ] Use `/git:prepare-pr` command
- [ ] Include performance metrics in PR body
- [ ] Link to issue #157
- [ ] Request review

**Commands:**

```bash
pnpm git:status  # Verify all changes committed
/git:prepare-pr  # Generate PR
```

**Estimated Time:** 30 minutes

---

## Implementation Commands

### Initial Setup

```bash
# Create and switch to feature branch
git checkout -b feature/157-sub-agent-architecture

# Create directory structure
mkdir -p .claude/agents
mkdir -p .claude/commands/security
mkdir -p tests/sub-agents

# Add .gitkeep files
touch .claude/agents/.gitkeep
touch .claude/commands/security/.gitkeep
touch tests/sub-agents/.gitkeep

git add .
git commit -m "feat: add directory structure for sub-agents"
```

### Phase 1: Contracts

```bash
# Create contract definitions
# (Manual task - create contracts.md)

git add tests/sub-agents/contracts.md
git commit -m "test: define sub-agent contracts"
```

### Phase 2: Tests

```bash
# Create integration tests
# (Manual task - create delegation.test.ts and contracts.test.ts)

pnpm test tests/sub-agents/
# Expected: Tests fail (not implemented yet)

git add tests/sub-agents/
git commit -m "test: add sub-agent integration and contract tests (failing)"
```

### Phase 3: Implementation

```bash
# Implement sub-agents one by one
# After each agent:
pnpm test tests/sub-agents/contracts.test.ts -t "[Agent Name]"
git add .claude/agents/[agent-name].md
git commit -m "feat: implement [agent-name] sub-agent"

# Update commands one by one
# After each command:
git add .claude/commands/[path]/[command].md
git commit -m "feat: add delegation to /[command-name]"
```

### Phase 4: Integration

```bash
# Create new commands
git add .claude/commands/dev/research-explore.md
git commit -m "feat: add /research:explore command"

git add .claude/commands/security/scan.md
git commit -m "feat: add /security:scan command"

# Add environment variable
git add .env.example
git commit -m "feat: add DISABLE_DELEGATION env var"

# Enable E2E tests
pnpm test tests/sub-agents/e2e.spec.ts
# Expected: All tests pass

git add tests/sub-agents/e2e.spec.ts
git commit -m "test: enable sub-agent E2E tests"
```

### Phase 5: Documentation

```bash
# Update documentation
git add docs/ai/CLAUDE.md
git add docs/ai/sub-agents-troubleshooting.md
git commit -m "docs: document sub-agent architecture"

# Update command docs
git add .claude/commands/
git commit -m "docs: update command documentation for delegation"
```

### Final Steps

```bash
# Validate all tests pass
pnpm test tests/sub-agents/

# Validate existing tests still pass
pnpm test

# Create PR
pnpm git:status
/git:prepare-pr
```

---

## Branch Strategy

**Feature Branch:** `feature/157-sub-agent-architecture`

**Commit Strategy:**

1. Phase 1: 2-3 commits (directory structure, contracts)
2. Phase 2: 2-3 commits (test files)
3. Phase 3: 9 commits (5 agents + 4 command updates)
4. Phase 4: 3-4 commits (new commands, env var, E2E)
5. Phase 5: 2-3 commits (documentation)

**Total Commits:** ~20-25 commits

**PR Strategy:**

- Single PR to `main`
- Squash merge recommended
- Include performance metrics in PR body

---

## Success Criteria

### Functional Requirements

- [ ] All 5 sub-agents implemented and passing contracts
- [ ] 4 existing commands updated with delegation
- [ ] 2 new commands created (/research:explore, /security:scan)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Backward compatibility maintained (existing commands work)

### Performance Requirements

- [ ] Research tasks ≥30% faster
- [ ] Routine tasks ≥60% cheaper
- [ ] Sub-agent responses <5K tokens (95% of time)
- [ ] Parallel execution works correctly

### Quality Requirements

- [ ] Task success rate ≥90%
- [ ] Security scan false positives <10%
- [ ] Generated tests are executable
- [ ] Documentation is clear and complete

### User Experience

- [ ] Delegation is transparent (progress indicators)
- [ ] Opt-out mechanism works (`DISABLE_DELEGATION=true`)
- [ ] Commands remain simple (no new syntax)
- [ ] Follow-up questions supported

---

## Risk Mitigation

### Risk: Haiku Quality Insufficient

**Monitor:** Task success rate, user feedback
**Threshold:** If success rate <85%, pause rollout
**Mitigation:** Implement fallback to Sonnet for failed tasks

### Risk: Coordination Overhead

**Monitor:** End-to-end task timing
**Threshold:** If delegation slower than manual, disable
**Mitigation:** Optimize parallel execution, reduce summary size

### Risk: User Confusion

**Monitor:** User questions, support requests
**Threshold:** If confusion high, improve messaging
**Mitigation:** Better progress indicators, clearer documentation

---

## Timeline

**Total Duration:** 10 working days (2 weeks)

- **Day 1:** Phase 1 + Phase 2 start
- **Day 2:** Phase 2 complete
- **Days 3-6:** Phase 3 (implementation)
- **Days 7-8:** Phase 4 (integration & polish)
- **Days 9-10:** Phase 5 (documentation & release)

**Estimated Effort:** 40-50 hours

---

## Next Steps

1. **Create feature branch:**

   ```bash
   git checkout -b feature/157-sub-agent-architecture
   ```

2. **Start Phase 1:** Create directory structure and contracts

3. **Run tests frequently:** Validate each agent implementation

4. **Track metrics:** Measure performance improvements

5. **Document learnings:** Update issue #157 with findings

---

## Checklist for GitHub Issue #157

Copy to issue for tracking:

### Phase 1: Contracts & Interfaces

- [ ] Task 1.1: Create sub-agent contract definitions
- [ ] Task 1.2: Create directory structure
- [ ] Task 1.3: Define TypeScript types (optional)

### Phase 2: Test Foundation

- [ ] Task 2.1: Create integration test framework
- [ ] Task 2.2: Create contract validation tests
- [ ] Task 2.3: Create E2E test stubs

### Phase 3: Implementation

- [ ] Task 3.1: Implement research-agent
- [ ] Task 3.2: Implement security-scanner
- [ ] Task 3.3: Implement test-generator
- [ ] Task 3.4: Implement refactor-analyzer
- [ ] Task 3.5: Implement documentation-writer
- [ ] Task 3.6: Update `/dev:implement` command
- [ ] Task 3.7: Update `/dev:refactor-secure` command
- [ ] Task 3.8: Update `/test:scaffold` command
- [ ] Task 3.9: Update `/docs:generate` command

### Phase 4: Integration & Polish

- [ ] Task 4.1: Create `/research:explore` command
- [ ] Task 4.2: Create `/security:scan` command
- [ ] Task 4.3: Implement parallel execution
- [ ] Task 4.4: Add environment variable support
- [ ] Task 4.5: Enable E2E tests

### Phase 5: Documentation & Release

- [ ] Task 5.1: Update AI documentation
- [ ] Task 5.2: Update command documentation
- [ ] Task 5.3: Create troubleshooting guide
- [ ] Task 5.4: Validate performance metrics
- [ ] Task 5.5: Update issue #157 with results
- [ ] Task 5.6: Create pull request

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
