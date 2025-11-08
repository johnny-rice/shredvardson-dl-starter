---
id: PLAN-confidence-based-gating
parentId: SPEC-confidence-based-gating
title: Confidence-Based Gating - Implementation Plan
spec: specs/confidence-based-gating.md
type: plan
issue: 287
lane: spec-driven
created: 2025-11-08
status: implemented
confidence: high
confidence_rationale: Clear pattern match with existing sub-agent architecture (Research Agent, Review Agent severity scoring). Minimal code changes to proven patterns.
---

# Confidence-Based Gating - Implementation Plan

## Overview

Implement three-tier confidence-based decision gating for the `/spec:plan` workflow to reduce user interruptions by ~70% while maintaining oversight on uncertain decisions. Uses existing Research Agent confidence pattern (high/medium/low) with minimal code changes.

**Design Decision:** Option B - Minimal Confidence Extension
- Reuse existing 3-level confidence enum from Research Agent
- Add single `confidence` field to spec-planner output
- Wire gating logic in `/spec:plan` command
- No schema changes, no new dependencies, ~50 lines of code

## Design Decisions

**Key Decisions from Design Discovery:**

1. **Confidence Scoring:** Use existing 3-level enum (high/medium/low) for consistency with Research Agent pattern at `.claude/sub-agents/8-research.md:96`
   - Rejected 1-10 numeric scale (too complex for MVP, requires schema changes)
   - Maintains lightweight, token-friendly approach for starter template

2. **Auto-Proceed Behavior:** High confidence recommendations proceed immediately without countdown timer
   - Rejected 5-second review window (adds complexity, users can Ctrl+C if needed)
   - Simpler and faster for MVP

3. **Medium Confidence UX:** Show recommendation with yes/no/research prompt
   - User input: "Proceed with recommendation? (yes/no/research)"
   - Research option triggers same deep analysis as low confidence
   - Saves round-trip of user asking "what do you recommend?"

4. **Question Classification:** Skipped for MVP (Phase 4 deferred)
   - Confidence scores already capture uncertainty
   - Can add product vs. technical routing in future iteration
   - Focus on core value: reducing interruptions via confidence gating

## Architecture

### Core Flow

```
User runs: /spec:plan specs/my-feature.md
    ↓
spec-planner sub-agent analyzes spec
    ↓
spec-planner returns: {plan: "...", confidence: "high", confidence_rationale: "..."}
    ↓
/spec:plan evaluates confidence:
    - high → Show recommendation, auto-proceed
    - medium → Show recommendation, prompt (yes/no/research)
    - low → Trigger research, retry with findings
    ↓
Write plan file with confidence metadata
    ↓
Log decision to audit trail
```

### Component Breakdown

**Modified Files (2 total):**
1. `.claude/commands/spec/plan.md` - Add confidence evaluation logic after sub-agent response
2. `.claude/sub-agents/4-spec-planner.md` - Add confidence fields to output format

**New Files:**
- `artifacts/confidence-decisions.jsonl` - Audit trail (auto-created, append-only)

**Pattern Used:**
- Similar to Review sub-agent severity scoring (`.claude/sub-agents/7-review.md:78`)
- Confidence field in sub-agent output, decision logic in slash command
- Research sub-agent invocation already demonstrated in codebase

### Data Flow

**Spec-Planner Output Format:**
```json
{
  "plan": "Detailed implementation plan...",
  "confidence": "high",
  "confidence_rationale": "Clear pattern match with existing auth features",
  "research_performed": false,
  "uncertainty_factors": []
}
```

**Plan File Frontmatter (enhanced):**
```yaml
---
title: Feature Name - Implementation Plan
spec: specs/feature.md
lane: spec-driven
created: 2025-11-08
status: draft
confidence: high
confidence_rationale: "Clear pattern match with existing features"
---
```

**Audit Log Entry:**
```json
{
  "timestamp": "2025-11-08T10:30:00Z",
  "spec_file": "specs/oauth-integration.md",
  "confidence": "high",
  "action": "auto_proceed",
  "rationale": "Clear pattern match with existing auth",
  "user": "jonte"
}
```

## Implementation Phases

### Phase 1: Extend Spec-Planner Sub-Agent Output

**Goal:** Add confidence metadata to spec-planner sub-agent responses

**Tasks:**
- Modify `.claude/sub-agents/4-spec-planner.md` OUTPUT FORMAT section
- Add `confidence` field (enum: "high" | "medium" | "low")
- Add `confidence_rationale` field (string, required)
- Add `research_performed` field (boolean)
- Add `uncertainty_factors` field (array of strings)
- Document confidence level guidelines for sub-agent

**Deliverables:**
- Updated `.claude/sub-agents/4-spec-planner.md` with new output format
- Confidence guidelines added to sub-agent documentation

**Acceptance Criteria:**
- Spec-planner returns valid confidence enum value
- Rationale explains why that confidence level was chosen
- Uncertainty factors listed when confidence is medium/low

### Phase 2: Implement Confidence Gating Logic

**Goal:** Add decision logic to `/spec:plan` command based on confidence levels

**Tasks:**
- Modify `.claude/commands/spec/plan.md` workflow section
- Add confidence parsing after sub-agent response
- Implement high confidence path (auto-proceed with display)
- Implement medium confidence path (show recommendation, prompt yes/no/research)
- Implement low confidence path (auto-trigger research)
- Add research retry logic (re-invoke spec-planner with research findings)

**Deliverables:**
- Updated `.claude/commands/spec/plan.md` with gating logic
- Console output templates for each confidence level
- Research trigger and retry implementation

**Acceptance Criteria:**
- High confidence proceeds without user input
- Medium confidence shows recommendation and waits for user choice
- Low confidence automatically triggers research
- Research findings integrated into second planner invocation
- User can choose "research" option in medium confidence flow

### Phase 3: Add Security & Audit Logging

**Goal:** Implement security mitigations and audit trail for automated decisions

**Tasks:**
- Create `artifacts/confidence-decisions.jsonl` audit log structure
- Add logging calls after each automated decision
- Implement confidence field validation (enum check)
- Add research rate limiting (5 calls per hour)
- Add quota tracking and display
- Create graceful error messages for quota exceeded

**Deliverables:**
- Audit trail logging in JSON Lines format
- Rate limiting for research invocations
- Validation for confidence field values
- Quota exceeded error handling

**Acceptance Criteria:**
- All high/medium/low confidence decisions logged to audit trail
- Invalid confidence values default to "medium" with warning
- Research limited to 5 auto-triggers per hour
- Quota exceeded shows helpful error message
- Audit log includes timestamp, spec file, confidence, action, user

### Phase 4: Error Handling & Edge Cases

**Goal:** Handle failures gracefully with safe fallbacks

**Tasks:**
- Add error handling for research sub-agent failures
- Implement fallback to medium confidence for invalid responses
- Handle Ctrl+C cancellation gracefully
- Add timeout handling for research invocations
- Log all errors to audit trail

**Deliverables:**
- Error handling for research failures (fallback to medium confidence)
- Invalid confidence value handling (default to medium)
- Quota exceeded handling (show options without research)
- User cancellation handling (clean exit, log cancellation)

**Acceptance Criteria:**
- Research failures don't block workflow (fall back to showing options)
- Invalid confidence values handled gracefully
- User can always cancel with Ctrl+C
- All errors logged for debugging
- No path results in complete workflow block

### Phase 5: Testing & Documentation

**Goal:** Validate implementation and document new workflow

**Tasks:**
- Test high confidence path (auto-proceed)
- Test medium confidence path (user choice, research option)
- Test low confidence path (auto-research, retry)
- Test error scenarios (research failure, quota exceeded, invalid confidence)
- Test audit logging (verify all decisions logged)
- Update spec status to "ready"
- Document new workflow in plan file

**Deliverables:**
- Manual testing of all confidence paths
- Error scenario validation
- Audit log verification
- Updated spec file (status: ready)
- Implementation plan (this file)

**Acceptance Criteria:**
- All three confidence levels tested and working
- Research option in medium confidence tested
- Auto-research in low confidence tested
- Error handling validated
- Audit trail contains expected entries
- Spec file updated with plan reference

## Technical Specifications

### Confidence Level Guidelines (for Spec-Planner Sub-Agent)

**High Confidence:**
- Clear pattern exists in codebase with specific file references
- Straightforward implementation following established patterns
- No architectural decisions needed
- All dependencies available in current stack
- Example: "Add validation to existing form using pattern from user-profile.tsx:45"

**Medium Confidence:**
- Multiple valid approaches exist
- Some uncertainty about best fit for user's stack
- Missing context that could influence decision
- Requires choosing between alternatives
- Example: "Implement pub/sub - PostgreSQL LISTEN/NOTIFY (native) vs Redis (more features)"

**Low Confidence:**
- Novel pattern not found in codebase
- Significant unknowns or missing information
- Complex architectural decisions required
- External research needed to make informed recommendation
- Example: "Implement real-time collaboration - no existing WebSocket/pub-sub patterns found"

### Gating Logic Implementation

**High Confidence Flow:**
```
✅ High confidence recommendation

Confidence: high
Rationale: Clear pattern match with existing auth features at apps/web/src/lib/auth.ts

Plan: Implement OAuth integration using existing Supabase auth patterns...

Writing plan to: plans/oauth-integration.md
[Logged decision to artifacts/confidence-decisions.jsonl]
```

**Medium Confidence Flow:**
```
⚠️ Medium confidence - recommending best option

Confidence: medium
Uncertainty: No existing pub/sub pattern in codebase

🎯 RECOMMENDED: PostgreSQL LISTEN/NOTIFY
Rationale: Native to your stack, simpler setup, matches Supabase architecture

Alternative: Redis pub/sub (more features, adds dependency)

Proceed with recommendation? (yes/no/research): _
```

**Low Confidence Flow:**
```
🔍 Low confidence - triggering research

Confidence: low
Uncertainty: No existing WebSocket patterns, unclear best approach for real-time updates

Researching real-time collaboration patterns...
- Checking Context7 for library documentation
- Analyzing codebase for similar patterns
- Searching web for Supabase best practices

[Research sub-agent runs]

✅ Research complete

Updated confidence: high
New recommendation: Supabase Realtime (WebSocket-based)

Research findings:
- Supabase Realtime already in your stack (no new dependencies)
- Found 2 similar real-time patterns using Realtime channels
- Context7 shows Supabase Realtime is standard for collaborative features

Proceed with Supabase Realtime? (yes/no): _
```

### Audit Log Schema

**Format:** JSON Lines (one JSON object per line, append-only)

**Location:** `artifacts/confidence-decisions.jsonl`

**Schema:**
```typescript
{
  timestamp: string;        // ISO 8601 format
  spec_file: string;        // Relative path to spec file
  confidence: "high" | "medium" | "low";
  action: "auto_proceed" | "user_choice" | "research_triggered" | "cancelled";
  rationale: string;        // Confidence rationale from sub-agent
  user: string;             // $USER environment variable
  research_quota_used?: number; // Optional: track research usage
}
```

**Example:**
```json
{"timestamp":"2025-11-08T10:30:00Z","spec_file":"specs/oauth-integration.md","confidence":"high","action":"auto_proceed","rationale":"Clear pattern match with existing auth","user":"jonte"}
{"timestamp":"2025-11-08T10:35:00Z","spec_file":"specs/realtime-collab.md","confidence":"low","action":"research_triggered","rationale":"No existing WebSocket patterns","user":"jonte","research_quota_used":1}
```

### Research Rate Limiting

**Quota:** 5 auto-research invocations per hour

**Tracking:** In-memory counter (resets on process restart)

**Implementation:**
```bash
# In /spec:plan command
RESEARCH_QUOTA_FILE="/tmp/spec-plan-research-quota-$(date +%Y%m%d%H).lock"
CURRENT_COUNT=$(cat "$RESEARCH_QUOTA_FILE" 2>/dev/null || echo "0")

if [[ $CURRENT_COUNT -ge 5 ]]; then
  echo "⚠️ Research quota exceeded (5/hour limit)"
  echo "Wait or choose from available options"
  # Fall back to medium confidence flow without research option
else
  # Trigger research
  echo $((CURRENT_COUNT + 1)) > "$RESEARCH_QUOTA_FILE"
  # Invoke research sub-agent...
fi
```

**Quota Display:**
```
🔍 Triggering research (3/5 quota remaining this hour)
```

## Testing Strategy

### Unit Tests (Manual Verification)

**Test 1: High Confidence Auto-Proceed**
- Input: Spec with clear existing pattern
- Expected: Auto-proceed without user input, plan file created, audit log entry

**Test 2: Medium Confidence User Choice**
- Input: Spec with multiple valid approaches
- Expected: Show recommendation, wait for yes/no/research input

**Test 3: Medium Confidence Research Option**
- Input: Spec with uncertainty, user chooses "research"
- Expected: Trigger research, return with higher confidence, final yes/no prompt

**Test 4: Low Confidence Auto-Research**
- Input: Spec with novel pattern
- Expected: Auto-trigger research, retry spec-planner, proceed with updated confidence

**Test 5: Research Quota Exceeded**
- Input: 6th research trigger in same hour
- Expected: Show quota exceeded error, fall back to showing options without research

**Test 6: Invalid Confidence Value**
- Input: Spec-planner returns "unknown" confidence
- Expected: Default to "medium", show warning, continue with medium flow

**Test 7: Research Sub-Agent Failure**
- Input: Research times out or errors
- Expected: Log error, fall back to medium confidence, show options

**Test 8: User Cancellation (Ctrl+C)**
- Input: User presses Ctrl+C during prompt
- Expected: Clean exit, no plan file created, cancellation logged

### Integration Tests

**Test 9: End-to-End High Confidence Flow**
- Run: `/spec:plan specs/simple-feature.md`
- Verify: Plan created, audit log written, correct confidence metadata

**Test 10: End-to-End Medium Confidence Flow**
- Run: `/spec:plan specs/uncertain-feature.md`
- User: Choose "yes" to recommendation
- Verify: Plan created with chosen option, audit log written

**Test 11: End-to-End Research Flow**
- Run: `/spec:plan specs/low-confidence-feature.md`
- Verify: Research triggered, confidence updated, final plan created

### Audit Log Verification

**Test 12: Audit Trail Completeness**
- Run multiple spec planning workflows (high/medium/low confidence)
- Verify: `artifacts/confidence-decisions.jsonl` contains all decisions
- Check: Timestamp, spec file, confidence, action all present

## Deployment

**No deployment steps required** - changes are in Markdown files (slash commands and sub-agents)

**Activation:**
1. Commit modified files to repository
2. Next `/spec:plan` invocation will use new confidence-based gating

**Rollback:**
- Revert commits to `.claude/commands/spec/plan.md` and `.claude/sub-agents/4-spec-planner.md`
- No data migration needed

## Risk Mitigation

### Identified Risks & Mitigations

**Risk 1: Over-automation hides important decisions**
- **Mitigation:** Audit trail logs all auto-proceed decisions
- **Mitigation:** Medium confidence still requires user input
- **Mitigation:** User can always Ctrl+C and review plan file before running `/tasks`

**Risk 2: Confidence scoring needs calibration**
- **Mitigation:** Start with conservative guidelines (err toward medium/low)
- **Mitigation:** Audit log enables analysis of confidence accuracy
- **Mitigation:** Can adjust guidelines based on real-world usage

**Risk 3: Research quota too restrictive**
- **Mitigation:** 5/hour allows multiple iterations in single session
- **Mitigation:** Quota exceeded shows options instead of blocking entirely
- **Mitigation:** Can increase quota in future if needed

**Risk 4: Security - confidence threshold manipulation**
- **Mitigation:** Enum validation (only high/medium/low accepted)
- **Mitigation:** Invalid values default to medium (safest fallback)
- **Mitigation:** Audit trail tracks all decisions for review

**Risk 5: Research API costs**
- **Mitigation:** Rate limiting prevents runaway costs
- **Mitigation:** Only triggered on low confidence or user request
- **Mitigation:** Quota tracking visible to user

## Success Criteria

**Primary Metrics:**
- ✅ User interruptions reduced by ≥60% (measure pre/post implementation)
- ✅ High confidence specs auto-proceed without manual intervention
- ✅ Medium confidence specs show helpful recommendation with choice
- ✅ Low confidence specs trigger research and improve recommendations

**Quality Metrics:**
- ✅ Zero incidents of auto-proceeding with inappropriate decisions
- ✅ All automated decisions logged to audit trail
- ✅ User satisfaction with gating logic (qualitative feedback)
- ✅ Research improves confidence scores (track low→medium/high transitions)

**Technical Metrics:**
- ✅ Audit log contains valid JSON for all entries
- ✅ Confidence field validation working (invalid values caught)
- ✅ Research rate limiting enforced (no quota violations)
- ✅ Error handling graceful (no workflow blocks)

## References

**Spec:** [specs/confidence-based-gating.md](../specs/confidence-based-gating.md)

**Research Findings:**
- Research sub-agent confidence pattern: `.claude/sub-agents/8-research.md:96`
- Review sub-agent severity scoring: `.claude/sub-agents/7-review.md:78`
- Skill-based delegation pattern: `docs/llm/SKILLS.md:15-45`
- User confirmation pattern: `scripts/cleanup-packages.ts:1-50`

**Security References:**
- Missing audit trail (HIGH): Security Scanner finding
- No threshold validation (MEDIUM): Security Scanner finding
- Rate limiting needed (MEDIUM): Security Scanner finding

**Architecture Patterns:**
- Enum-based confidence levels for type safety
- Sub-agent responses include metadata for decision gating
- Delegation pattern separates invocation from response parsing
- Graceful degradation with medium confidence fallback
