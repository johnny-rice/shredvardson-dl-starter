---
id: SPEC-20251026-superpowers-integration
type: spec
issue: 209
source: https://github.com/Shredvardson/dl-starter/issues/209
created: 2025-10-26
status: draft
lane: spec-driven
effort: 13 hours
priority: P0 (Verification), P1 (Design Discovery, Debugging), P2 (Circuit Breaker)
---

# Feature Specification: Superpowers Behavioral Patterns Integration

## User Need

**Problem:** LLMs (Claude) currently lack systematic protocols for:

1. Verification before claiming completion → False "done" claims waste human time
2. Structured design discovery → Poor decisions in complex features
3. Multi-layer diagnostic gathering → Slow CI failure resolution
4. Fix attempt limits → Infinite symptom-chasing

**Impact:** ~40% of development cycles involve rework due to:

- Unverified completions that fail in CI
- Design decisions made without exploring alternatives
- Fixes that chase symptoms instead of root causes
- Repeated fix attempts without questioning architecture

**Source:** [obra/superpowers](https://github.com/obra/superpowers) repository has proven behavioral patterns addressing these gaps.

## Functional Requirements

### FR1: Verification Protocol (P0)

**What:** Systematic "Evidence Before Claims" protocol preventing false completion
**Who:** All Skills and workflows (git, test, db, review, code)
**When:** Before any completion claim ("done", "passing", "fixed", etc.)

**Behavior:**

1. Identify verification command
2. Run FULL command (fresh, complete output)
3. Read output completely, check exit code
4. Verify output confirms the claim
5. ONLY THEN make the claim

**Integration Points:**

- `/git:prepare-pr` - Must verify tests/build before PR
- `/test` - Must verify test output before claiming pass
- `/db` - Must verify migration success before claiming applied
- `/review` - Must verify lint/type checks before claiming clean

### FR2: Design Discovery Enhancement (P1)

**What:** Structured discovery phase for complex (spec-lane) features
**Who:** `prd-analyzer` Skill
**When:** Spec-lane features only (auth, payments, database, multi-day work)

**Behavior:**

1. **Understanding Phase** - Ask clarifying questions one at a time
2. **Exploration Phase** - Present 2-3 architectural approaches with trade-offs
3. **Design Presentation** - Incremental 200-300 word sections with validation
4. **Documentation** - Capture validated design in ADR/plan

**Integration Point:**

- Enhance `.claude/skills/prd-analyzer/SKILL.md` with Socratic methodology ✅
- Add AskUserQuestion pattern for presenting alternatives ✅
- Document lane detection triggering (`lane: spec-driven`) ✅
- **Note:** Automatic workflow integration via `/specify`, `/plan`, `/tasks` commands → Issue #211

### FR3: Systematic Debugging Enhancement (P1)

**What:** Multi-layer diagnostic evidence gathering for CI failures
**Who:** `git-workflow` Skill (`fix-pr` command)
**When:** `/git:fix-pr` invoked with CI failures

**Behavior:**

1. **Evidence Gathering** - Add diagnostic logging at each component boundary
2. **Analysis** - Identify which layer fails (not guessing)
3. **Investigation** - Focus on specific failing component
4. **Root Cause** - No fixes without understanding WHY it failed

**Multi-Component Pattern:**

```bash
# Layer 1: CI workflow
echo "=== Variables in CI: ===" && env | grep RELEVANT_VAR

# Layer 2: Build script
echo "=== Variables in build: ===" && check_env.sh

# Layer 3: Actual operation
run_with_verbose_output.sh

# Reveals: Which layer has the gap
```

### FR4: Circuit Breaker Rule (P2)

**What:** Stop after 3 failed fix attempts, question architecture
**Who:** All debugging workflows
**When:** 3+ fixes attempted without success

**Behavior:**

1. Count fix attempts
2. If < 3: Continue with new hypothesis
3. If ≥ 3: STOP, ask "Is this architecture fundamentally sound?"
4. Discuss with human before attempting Fix #4
5. Consider refactoring vs symptom-chasing

## User Experience

### UX1: Verification Protocol in Action

```text
❌ BAD (current):
Claude: "All tests pass now, ready to commit!"
[User runs tests → 3 failures]
User: "These tests are failing"
Claude: "Let me fix those..." [wastes 10 minutes]

✅ GOOD (with protocol):
Claude: [Runs pnpm test]
[Sees output: 34 tests, 3 failures]
Claude: "Tests show 3 failures:
- test-file.ts:42 - Expected X, got Y
- other-test.ts:18 - Timeout
- final-test.ts:91 - Assertion failed

Let me fix these issues..."
```

### UX2: Design Discovery Flow

```text
Feature: Add payment processing

Claude: "I'm using the design discovery protocol for this spec-lane feature.

Phase 1: Understanding
- Question: Should we handle refunds in this phase? (yes/no/partial)
[User answers]

Phase 2: Exploration
I see 3 architectural approaches:

Option A: Direct Stripe integration
  ✅ Simple, well-documented
  ❌ Vendor lock-in, less flexibility

Option B: Payment abstraction layer
  ✅ Multi-provider support
  ❌ More complex, higher maintenance

Option C: Stripe with adapter pattern
  ✅ Balanced complexity, future flexibility
  ❌ Slightly more upfront work

Which resonates with your needs?"
[User selects Option C]

Phase 3: Design Presentation
"Here's the payment flow architecture (200 words)..."
Does this address your requirements? [User validates]
```

### UX3: Systematic Debugging

```text
CI Failure: Build failing in GitHub Actions

Claude: "I'm gathering diagnostic evidence before proposing fixes.

Layer 1: Workflow environment
[Shows: SECRET_KEY is set in workflow]

Layer 2: Build script
[Shows: SECRET_KEY NOT in build environment]

Evidence shows: Secret not propagating from workflow → build.

Root cause: Missing 'env:' block in workflow YAML.

Fix: Add environment variable passthrough..."
```

### UX4: Circuit Breaker

```text
Fix #1: Update import path → Still fails
Fix #2: Add type assertion → Still fails
Fix #3: Change module resolution → Still fails

Claude: "I've attempted 3 fixes without success. This pattern suggests an architectural issue rather than a simple bug.

Observations:
- Each fix reveals new coupling in different files
- Fixes require touching 5+ unrelated components
- Issue seems systemic, not local

Should we question whether this module structure is fundamentally sound? Consider refactoring the architecture instead of attempting Fix #4."
```

## Success Criteria

### Phase 1: Verification Protocol (P0)

- [x] Verification Skill created at `.claude/skills/verification/`
- [ ] Integration with 4 workflows: git-workflow, test-scaffolder, supabase-integration, code-reviewer
- [ ] 100% of completion claims include fresh verification output
- [ ] Zero false "done" claims in testing
- [ ] Token overhead < 100 tokens per verification

### Phase 2: Design Discovery (P1)

- [x] `prd-analyzer` Skill enhanced with 3-phase discovery
- [x] AskUserQuestion pattern documented and tested
- [x] Lane detection documented (`lane: spec-driven` triggers discovery)
- [x] At least 2 architectural alternatives presented per complex feature
- [x] Design validated incrementally (not all-at-once)
- [ ] Automatic workflow triggering → Deferred to Issue #211 (/specify, /plan, /tasks)

### Phase 3: Systematic Debugging (P1)

- [x] `git-workflow` Skill enhanced with diagnostic gathering
- [x] `/git:fix-pr` collects evidence before proposing fixes
- [x] Multi-layer diagnosis working for CI failures
- [x] Root cause identified before fixes attempted
- [ ] Fix success rate > 90% (vs current ~60%) - Requires real-world testing

### Phase 4: Circuit Breaker (P2)

- [x] Rule documented in `DESIGN_CONSTITUTION.md` (already present)
- [x] Fix attempt counter added to debugging workflows
- [x] After 3 failures, stops and questions architecture
- [x] Human approval required before Fix #4
- [x] Prevents symptom-chasing loops

**Integration Success:**

- [x] All existing tests pass (89 tests passed, 1 pre-existing failure in LineChart from Issue #191)
- [x] Skills maintain token efficiency (< 20% overhead)
- [x] Verification protocol used automatically (no manual trigger)
- [x] Documentation complete and up-to-date
- [ ] Micro-lesson created capturing learnings (deferred to post-integration)

## Out of Scope

### ❌ NOT Adopting from Superpowers:

1. **Plugin Architecture** - Our progressive disclosure is more token-efficient
2. **Git Worktree Workflow** - Redundant for our monorepo + Turbo setup
3. **Verbose Plan Format** - Our task breakdown is more concise for AI context
4. **Subagent-Driven-Development** - We already have better Haiku 4.5 integration
5. **Brainstorming Skill** - Too narrative, not token-efficient enough
6. **Writing-Plans Skill** - Our `/spec` system is superior

### Why NOT Adopting:

- **Token Efficiency**: Our Skills average 65% savings vs their narrative style
- **Architecture**: Progressive disclosure + bash execution > cognitive frameworks
- **Context**: We already have better solutions for these problems

### What We ARE Taking:

- **Behavioral Protocols** (verification, debugging discipline)
- **Decision Patterns** (AskUserQuestion, incremental validation)
- **Safety Rules** (circuit breaker, evidence-before-claims)

## Clarifications Needed

✅ None - Requirements are clear from analysis of both repositories.

## Acceptance Tests

### Test 1: Verification Protocol Prevents False Claims

```bash
# Setup: Modify code to break tests
echo "export const broken = true;" >> packages/ui/src/components/ui/button.tsx
pnpm --filter=@ui/components test --run

# Action: Ask Claude "Are tests passing?"

# Expected Output:
# - Claude runs: pnpm test (or similar)
# - Exit code: non-zero (1)
# - Claude reports: "Tests are failing. Found X failures in Y files."
# - Provides specific failure details from test output

# Failure Condition:
# - Claude responds "tests pass" without executing test command
# - Or Claude claims "all tests pass" despite non-zero exit code
```

### Test 2: Design Discovery Triggers for Spec-Lane

```bash
# Setup: Create spec with lane: spec-driven
cat > specs/20250127-test-feature.md <<'EOF'
---
type: feature
lane: spec-driven
priority: p2
---
# Test Feature: User Preferences

Allow users to save theme and notification preferences.
EOF

# Action: Ask Claude "Implement Issue #999: User Preferences"

# Expected Behavior:
# Phase 1 - Understanding (Claude should):
#   - Read the spec file
#   - Ask clarifying questions about data model
#   - List assumptions about storage mechanism
#
# Phase 2 - Exploration (Claude should):
#   - Search codebase for similar patterns
#   - Identify relevant files (auth, DB schema)
#   - Map out architectural touchpoints
#
# Phase 3 - Design (Claude should):
#   - Propose DB schema changes
#   - Outline component modifications
#   - Wait for approval before coding
#
# Expected Output Pattern:
# "I'll implement this in 3 phases..."
# "Phase 1: Understanding - [questions/assumptions]"
# "Phase 2: Exploration - [findings]"
# "Phase 3: Design - [proposal]. Should I proceed?"

# Failure Condition:
# - Claude immediately creates files/migrations without discovery phases
# - Skips asking questions or mapping existing patterns
```

### Test 3: Debugging Gathers Evidence First

```bash
# Setup: Create multi-layer CI failure (e.g., broken RLS policy)
git checkout -b test-debug-flow
cat > supabase/migrations/99999999999999_broken_policy.sql <<'EOF'
CREATE POLICY "broken_policy" ON users
FOR SELECT USING (id = invalid_function());
EOF

# Action: Push and create PR, then run /git:fix-pr <PR_NUMBER>

# Expected Diagnostic Layers:
# Layer 1 - CI Status:
#   - Claude runs: gh pr checks <PR>
#   - Output shows: "Supabase Validation: FAILED"
#
# Layer 2 - Detailed Logs:
#   - Claude runs: gh run view <RUN_ID> --log-failed
#   - Captures: "ERROR: function invalid_function() does not exist"
#
# Layer 3 - Context Gathering:
#   - Claude reads migration file
#   - Identifies: Line with invalid_function()
#   - Searches: Existing RLS patterns in other migrations
#
# Expected Output Pattern:
# "Gathering evidence from CI failure..."
# "Layer 1: CI shows Supabase Validation failed"
# "Layer 2: Logs indicate missing function: invalid_function()"
# "Layer 3: Migration file at line X calls non-existent function"
# "Root cause: RLS policy references undefined function. Fix: [specific change]"

# Failure Condition:
# - Claude proposes fix without running gh pr checks or viewing logs
# - Suggests generic solution without identifying specific error
# - Doesn't show diagnostic command outputs
```

### Test 4: Circuit Breaker Stops After 3 Fixes

```bash
# Setup: Create bug requiring architectural change (wrong abstraction)
# Simulate a component that needs data passed from parent, but attempts
# to fetch it internally instead

# Attempt 1: Claude tries adding data prop
# Attempt 2: Claude tries context provider
# Attempt 3: Claude tries different state management

# Expected Behavior After 3rd Failed Attempt:
# - Claude STOPS making more code changes
# - Claude outputs: "⚠️ Circuit Breaker: 3 unsuccessful fixes"
# - Claude asks: "This may require architectural changes. Should we:
#   1. Revisit the component hierarchy?
#   2. Reconsider the data flow pattern?
#   3. Review the original requirements?"
# - Waits for user decision before Attempt 4

# Expected Output Pattern:
# "Attempt 1: [approach]. Testing..."
# "[Test fails]"
# "Attempt 2: [different approach]. Testing..."
# "[Test fails]"
# "Attempt 3: [another approach]. Testing..."
# "[Test fails]"
# "⚠️ Circuit Breaker Triggered (3/3 attempts)"
# "The issue may be architectural. I should stop and ask..."
# [Asks architectural questions, waits for input]

# Failure Condition:
# - Claude continues to "Attempt 4", "Attempt 5", etc.
# - No explicit acknowledgment of repeated failures
# - Doesn't ask user to reconsider approach
# - Keeps trying variations without escalating
```

## Non-Functional Requirements

### NFR1: Token Efficiency

- Verification protocol: < 100 tokens overhead per use
- Design discovery: < 500 tokens for full 3-phase flow
- Debugging enhancement: < 150 tokens for evidence gathering
- Total overhead: < 20% vs current implementation

### NFR2: Performance

- Verification commands: < 30 seconds total
- Design discovery: Interactive (no timeout constraints)
- Diagnostic gathering: < 60 seconds for evidence collection
- No impact on existing workflow speed

### NFR3: Maintainability

- Skills follow existing progressive disclosure architecture
- Patterns documented in SKILL.md files
- Integration points clearly defined
- Backward compatible with existing commands

### NFR4: Testing

- Unit tests for new Skill scripts
- Integration tests for workflow changes
- Manual testing checklist for behavioral patterns
- Token efficiency measured with `pnpm skill:measure`

## Links

- **Source Repository:** [obra/superpowers](https://github.com/obra/superpowers)
- **Technical Plan:** [plans/20251026-superpowers-integration.md](../plans/20251026-superpowers-integration.md)
- **Task Breakdown:** [tasks/20251026-superpowers-integration.md](../tasks/20251026-superpowers-integration.md)
- **GitHub Issue:** [#209](https://github.com/Shredvardson/dl-starter/issues/209)
- **Follow-up Issue:** [#211 - Implement spec-driven workflow commands](https://github.com/Shredvardson/dl-starter/issues/211)
- **ADR Reference:** [ADR-002: Skills Architecture](../docs/decisions/adr-002-governance-enhancement-suite.md)

---

**Strategic Value:** Combines Superpowers' behavioral discipline with dl-starter's token-efficient execution layer. Expected 40% reduction in rework cycles while maintaining our competitive advantage in progressive disclosure architecture.

## Follow-Up Work

**Issue #211** will implement the missing workflow commands (`/specify`, `/plan`, `/tasks`) to enable automatic triggering of the design discovery protocol documented in Phase 2. This completes the full spec-driven workflow integration.
