---
id: TASK-confidence-based-gating
parentId: PLAN-confidence-based-gating
title: Confidence-Based Gating - Task Breakdown
spec: specs/confidence-based-gating.md
plan: plans/confidence-based-gating.md
type: task
issue: 287
created: 2025-11-08
status: completed
total_estimate: 5h
---

# Confidence-Based Gating - Task Breakdown

## Summary

**Total Estimated Effort:** 5 hours (reduced from 13h - confidence infrastructure already exists!)
**Number of Tasks:** 3 tasks
**High-Risk Tasks:** 0

**Implementation Approach:**
- ✅ **Confidence calculation already implemented** in `.claude/scripts/orchestrator/confidence/calculate-confidence.ts`
- ✅ **Auto-research logic already exists** in `.claude/scripts/orchestrator/confidence/auto-research.ts`
- ✅ **Audit logging already exists** in `.claude/scripts/orchestrator/confidence/audit-log.ts`
- ✅ **Rate limiting already exists** in `.claude/scripts/orchestrator/confidence/rate-limit.ts`

**What's Missing:** Only the **gating logic** in `/spec:plan` command to use the existing confidence system.

## Task List

### Task 1: Add Confidence-Based Gating to Phase 2 (Option Presentation)

**ID:** T1
**Priority:** p0
**Estimate:** 3h
**Dependencies:** None
**Risk:** Low

**Description:**

Modify `.claude/commands/spec/plan.md` Phase 2 (lines 206-286) to implement actual gating logic based on confidence levels. The confidence calculation code already exists - we just need to add the decision branching.

**Current State Analysis:**
- Lines 210-211: References confidence scripts (already exist ✅)
- Lines 254-266: Describes confidence thresholds but doesn't implement gating
- Line 268-269: Mentions logging but doesn't enforce it

**Changes Needed:**
Add conditional gating after confidence calculation:

```typescript
if (confidence.level === 'HIGH') {
  // Auto-proceed with recommendation
  display("🎯 HIGH confidence - auto-proceeding with recommendation")
  display(confidence.reasoning)
  // No user prompt - continue to Phase 3
} else if (confidence.level === 'MEDIUM') {
  // Show recommendation + yes/no/research prompt
  display("⚠️ MEDIUM confidence - review recommendation")
  display(confidence.reasoning)
  prompt("Accept recommendation? (yes/no/research):")
  // Wait for user input
} else {
  // LOW confidence - auto-trigger research
  display("🔍 LOW confidence - triggering auto-research")
  await triggerAutoResearch() // Already exists!
  // Recalculate confidence with research findings
  // Then proceed based on new confidence level
}
```

**Acceptance Criteria:**

- [ ] HIGH confidence (≥90%) → Auto-proceed to Phase 3 without user prompt
- [ ] MEDIUM confidence (70-89%) → Show recommendation + yes/no/research options
- [ ] LOW confidence (<70%) → Auto-trigger research, recalculate, then proceed
- [ ] All decisions logged via existing `audit-log.ts`
- [ ] Rate limiting enforced via existing `rate-limit.ts`
- [ ] Display confidence percentage and reasoning in all cases

**Notes:**

- **Reuse existing infrastructure** - don't reimplement confidence calculation
- Phase 2 already describes the UX (lines 215-252) - just add the gating logic
- Confidence scripts in `.claude/scripts/orchestrator/confidence/` handle all the heavy lifting
- Just need to add if/else branching and user prompts

**Files Modified:**
- [.claude/commands/spec/plan.md](.claude/commands/spec/plan.md) (lines 206-286)

---

### Task 2: Add Plan Frontmatter with Confidence Metadata

**ID:** T2
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T1
**Risk:** Low

**Description:**

Update the plan file creation logic (`.claude/commands/spec/plan.md` lines 323-408) to include confidence metadata in the YAML frontmatter.

**Acceptance Criteria:**

- [ ] Add `confidence_level` field to plan frontmatter (HIGH/MEDIUM/LOW)
- [ ] Add `confidence_percentage` field (0-100)
- [ ] Add `confidence_reasoning` field (truncated to 200 chars)
- [ ] Add `research_triggered` boolean field
- [ ] Example frontmatter:
  ```yaml
  ---
  title: Feature Name - Implementation Plan
  spec: specs/feature.md
  lane: spec-driven
  created: 2025-11-08
  status: draft
  confidence_level: HIGH
  confidence_percentage: 95
  confidence_reasoning: "Based on your Next.js, Supabase stack, I have high confidence..."
  research_triggered: false
  ---
  ```
- [ ] Maintain backward compatibility (old plans without confidence still valid)

**Notes:**

- Confidence data comes from `calculateConfidence()` result
- Enables future analysis of confidence accuracy
- Git history provides implicit audit trail

**Files Modified:**
- [.claude/commands/spec/plan.md](.claude/commands/spec/plan.md) (lines 323-408)

---

### Task 3: Testing & Documentation

**ID:** T3
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T1, T2
**Risk:** Low

**Description:**

Test all confidence paths (HIGH/MEDIUM/LOW) with real specs and update documentation. Update constitution checksum.

**Test Scenarios:**

1. **HIGH Confidence (≥90%)**:
   - Input: Spec with clear tech stack match, simple architecture
   - Expected: Auto-proceed to Phase 3, no user prompt
   - Verify: Plan created with confidence metadata

2. **MEDIUM Confidence (70-89%)**:
   - Input: Spec with multiple valid approaches
   - User Action: Test "yes", "no", and "research" options
   - Expected: Recommendation shown, user prompted
   - Verify: Plan includes confidence data

3. **LOW Confidence (<70%)**:
   - Input: Spec with novel patterns, no codebase match
   - Expected: Auto-research triggers (via existing `auto-research.ts`)
   - Verify: Research findings incorporated, confidence recalculated

**Acceptance Criteria:**

- [ ] Test all 3 confidence paths work correctly
- [ ] Verify audit logging works (check `.claude/logs/`)
- [ ] Verify rate limiting enforced (try >10 research calls in session)
- [ ] Update spec status to "implemented"
- [ ] Add confidence gating pattern to `.claude/CONVENTIONS.md`
- [ ] Run `pnpm constitution:update` to update checksum

**Notes:**

- Use actual specs of varying completeness for realistic testing
- Document any edge cases discovered
- CONVENTIONS.md establishes pattern for future workflows

**Files Modified:**
- [specs/confidence-based-gating.md](specs/confidence-based-gating.md)
- [.claude/CONVENTIONS.md](.claude/CONVENTIONS.md)
- [docs/llm/CONSTITUTION.CHECKSUM](docs/llm/CONSTITUTION.CHECKSUM)

---

## Implementation Order

**Total Duration:** 5 hours (drastically reduced from original 13h estimate!)

### Phase 1: Gating Logic (3h)
- **T1:** Add confidence-based gating to Phase 2

### Phase 2: Metadata & Testing (2h)
- **T2:** Add plan frontmatter with confidence metadata
- **T3:** Testing & documentation

**Critical Path:** T1 → T2 → T3 (sequential)

**Why So Fast?**
- ✅ Confidence calculation already implemented
- ✅ Auto-research logic already exists
- ✅ Audit logging already exists
- ✅ Rate limiting already exists
- Just need to wire up the gating logic!

---

## Dependencies

### External Files Already Implemented

**Confidence Infrastructure:** (No changes needed - just reference these)
- `.claude/scripts/orchestrator/confidence/calculate-confidence.ts` - Calculates confidence percentage and level
- `.claude/scripts/orchestrator/confidence/auto-research.ts` - Triggers research on low confidence
- `.claude/scripts/orchestrator/confidence/audit-log.ts` - Logs decisions for audit trail
- `.claude/scripts/orchestrator/confidence/rate-limit.ts` - Enforces 10/session research limit
- `.claude/scripts/orchestrator/confidence/detect-tech-stack.ts` - Detects tech stack from package.json

**Integration Pattern:**
```typescript
// Already documented in /plan command (lines 254-266)
import { calculateConfidence } from './.claude/scripts/orchestrator/confidence';
import { triggerAutoResearch } from './.claude/scripts/orchestrator/confidence/auto-research';

const confidence = calculateConfidence({
  researchDepth: 'high',
  techStackMatch: 'full',
  architectureSimplicity: 'simple',
  knowledgeRecency: 'current'
});

if (confidence.level === 'LOW') {
  await triggerAutoResearch();
}
```

---

## Risk Mitigation

### Low Risk Profile

**Why This Is Low Risk:**
1. **Infrastructure exists** - not building from scratch
2. **Single file modification** - only `.claude/commands/spec/plan.md`
3. **Clear integration points** - confidence scripts have well-defined APIs
4. **Graceful degradation** - existing workflow works if confidence fails

**Potential Issues:**
- **TypeScript import in markdown** - May need to document calling pattern (not actual TypeScript execution)
- **Confidence threshold calibration** - May need to adjust 90% threshold based on real usage

**Mitigations:**
- Test with real specs of varying completeness
- Document expected behavior in each confidence range
- Add escape hatch (Ctrl+C) for high confidence auto-proceed

---

## Testing Strategy

### Manual Testing (T3)

**Test Cases:**

1. **HIGH Confidence Scenario** (Expected: ≥90%):
   - Spec with Next.js + Supabase features (matches tech stack)
   - Simple CRUD operation (common pattern)
   - All acceptance criteria defined
   - **Expected:** Auto-proceed to Phase 3, no prompt

2. **MEDIUM Confidence Scenario** (Expected: 70-89%):
   - Spec with multiple valid architecture options
   - Some ambiguity in requirements
   - **Expected:** Show recommendation, prompt for yes/no/research

3. **LOW Confidence Scenario** (Expected: <70%):
   - Spec with novel integration (no codebase match)
   - Post-2025 emerging technology
   - **Expected:** Auto-trigger research, recalculate

4. **Rate Limiting**:
   - Trigger 11 research calls in one session
   - **Expected:** 11th call blocked with helpful message

5. **Audit Logging**:
   - Check `.claude/logs/` for decision records
   - **Expected:** All confidence decisions logged with timestamps

### Success Criteria

- [ ] All 3 confidence levels tested and working
- [ ] Rate limiting enforced
- [ ] Audit trail verified
- [ ] User can override recommendation (MEDIUM confidence)
- [ ] Research improves confidence (LOW → MEDIUM/HIGH transitions observed)

---

## Success Metrics

### Functionality
- [ ] HIGH confidence (≥90%) auto-proceeds without user prompt
- [ ] MEDIUM confidence (70-89%) shows recommendation + yes/no/research options
- [ ] LOW confidence (<70%) triggers auto-research, recalculates
- [ ] All decisions logged to audit trail (`.claude/logs/`)
- [ ] Rate limiting enforced (10 research calls per session)

### User Experience
- [ ] User interruptions reduced by ≥60% (measure high confidence auto-proceed rate)
- [ ] Clear confidence reasoning displayed in all cases
- [ ] User can override recommendation (not forced to accept)
- [ ] Research findings improve confidence scores

### Code Quality
- [ ] Single file modified (`.claude/commands/spec/plan.md`)
- [ ] Reuses existing confidence infrastructure (no duplication)
- [ ] Backward compatible (existing `/plan` workflow still works)
- [ ] Documentation updated (CONVENTIONS.md)

---

## References

**Source Files:**
- Spec: [specs/confidence-based-gating.md](specs/confidence-based-gating.md)
- Plan: [plans/confidence-based-gating.md](plans/confidence-based-gating.md)

**Confidence Infrastructure:**
- Calculate confidence: [.claude/scripts/orchestrator/confidence/calculate-confidence.ts](.claude/scripts/orchestrator/confidence/calculate-confidence.ts)
- Auto-research: [.claude/scripts/orchestrator/confidence/auto-research.ts](.claude/scripts/orchestrator/confidence/auto-research.ts)
- Audit logging: [.claude/scripts/orchestrator/confidence/audit-log.ts](.claude/scripts/orchestrator/confidence/audit-log.ts)
- Rate limiting: [.claude/scripts/orchestrator/confidence/rate-limit.ts](.claude/scripts/orchestrator/confidence/rate-limit.ts)

**Integration Point:**
- Slash command: [.claude/commands/spec/plan.md](.claude/commands/spec/plan.md) (lines 206-286)

---

## Notes for Implementation

### Key Insight

**The infrastructure is already there!** Lines 206-286 of `/plan` already reference the confidence system - they just don't implement the **gating logic** yet.

**Current State:**
- Line 210-211: "Before presenting options: Calculate confidence using calculate-confidence.ts"
- Line 212: "If confidence < 90%, trigger auto-research"
- Line 268-269: "Log decision with audit-log.ts"

**What's Missing:**
The actual if/else branching to:
1. Skip user prompt on HIGH confidence
2. Offer yes/no/research options on MEDIUM
3. Trigger research automatically on LOW

### Implementation Approach

**Don't overthink this!** The command already describes what should happen - just add the control flow logic.

**Before (current - no gating):**
```
Display options → Wait for user choice → Proceed
```

**After (with gating):**
```
Calculate confidence →
  if HIGH: Display reasoning → Auto-proceed
  if MEDIUM: Display recommendation → Prompt (yes/no/research)
  if LOW: Trigger research → Recalculate → Proceed based on new level
```

### Future Enhancements (Out of Scope)

- User-configurable confidence thresholds (via settings.toml)
- Historical confidence accuracy tracking
- Machine learning-based calibration
- Extended thinking integration for complex decisions
