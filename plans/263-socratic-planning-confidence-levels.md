---
id: PLAN-263
type: plan
parentId: SPEC-263
issue: 263
title: Add Confidence Levels and Recommendations to Socratic Planning - Implementation Plan
spec: specs/263-socratic-planning-confidence-levels.md
lane: spec-driven
created: 2025-01-02
status: draft
---

# Add Confidence Levels and Recommendations to Socratic Planning - Implementation Plan

## Overview

Enhance Phase 2 (Exploration) of the Socratic planning methodology to include confidence-based recommendations with explicit percentages, auto-research triggers when confidence drops below 90%, clear visual indicators for recommended options, and transparent reasoning that explains why the recommendation fits the user's specific context.

**Approach**: Hybrid implementation with extracted utility functions for confidence calculation and auto-research, while keeping display logic in the existing `/spec:plan` command markdown file.

## Design Decisions

### Decision 1: Confidence Format
**Chosen**: Hybrid approach - categorical internally (high/medium/low), percentage display (0-100%)
**Rationale**: Maintains consistency with existing sub-agent patterns (Research Agent, Security Scanner use categorical) while meeting spec requirement for user-facing percentage display
**Mapping**: ≥90% = high, 70-89% = medium, <70% = low

### Decision 2: Research Visibility
**Chosen**: Progress updates visible to user
**Rationale**: Research takes 10-30 seconds; users need transparency about what's happening and why confidence improved. Builds trust and educates users about information sources.

### Decision 3: Tech Stack Context Source
**Chosen**: Parse multiple sources (package.json + ADRs)
**Rationale**: Research findings show no automated tech stack detection exists. Parsing package.json provides library info, ADRs add deployment context. Zod validation for sanitization.
**Confidence**: 92% (High - validated with targeted research)

### Decision 4: User Override Tracking
**Chosen**: Basic logging to `.claude/logs/recommendations.jsonl`
**Rationale**: Lightweight, token-friendly, enables manual validation of 90% confidence threshold calibration. Addresses Security Scanner audit logging requirement.

### Decision 5: Implementation Architecture
**Chosen**: Hybrid with Command Enhancement (Option C)
**Rationale**: Balances MVP speed with maintainability. Confidence calculation and auto-research extracted as testable utilities. Display logic stays in markdown command file (no token cost).
**Confidence**: 92%

## Architecture

### Component Breakdown

```
.claude/
├── commands/
│   └── spec/
│       └── plan.md                    # Phase 2 display enhancement
├── utils/
│   ├── confidence.ts                  # NEW: Confidence calculator
│   ├── tech-stack.ts                  # NEW: Tech stack context extractor
│   ├── auto-research.ts               # NEW: Auto-research trigger
│   ├── sanitize.ts                    # NEW: Input sanitization
│   └── rate-limit.ts                  # NEW: Rate limiting
├── logs/
│   └── recommendations.jsonl          # NEW: Audit log (append-only)
└── skills/
    └── prd-analyzer/
        └── SKILL.md                   # Update: Document confidence pattern
```

### Data Flow

```
Phase 2 Start
  ↓
Extract Tech Stack Context (cache)
  ↓
Calculate Initial Confidence
  ↓
Confidence < 90%?
  ├─ Yes → Auto-Research (Context7 + WebSearch)
  │         ↓
  │         Recalculate Confidence → Display Enhanced
  └─ No  → Display with Recommendation
  ↓
User Chooses Option
  ↓
Log Decision to recommendations.jsonl
```

## Implementation Phases

### Phase 1: Foundation (Utility Functions)

**Goal**: Create reusable utility functions for confidence calculation and context extraction

**Tasks**:
- Create `.claude/utils/confidence.ts`
  - Implement `calculateConfidence()` function
  - Scoring: Research depth (40 pts) + Tech stack match (30 pts) + Architecture simplicity (20 pts) + Knowledge recency (10 pts)
  - Return: `{ percentage: number, level: 'high' | 'medium' | 'low', factors: string[] }`
- Create `.claude/utils/tech-stack.ts`
  - Implement `extractTechStack()` function
  - Parse `package.json` dependencies (Next.js, React, Supabase, etc.)
  - Scan ADRs for deployment keywords (Vercel, Netlify, Railway)
  - Cache results per planning session
  - Return: `{ libraries: string[], deployment: string | null }`
- Create `.claude/utils/sanitize.ts`
  - Zod schemas for reasoning text (max 500 chars, remove HTML)
  - Zod schema for tech stack array (max 20 items, 100 chars each)
- Create `.claude/utils/rate-limit.ts`
  - Per-session rate limiter (max 10 research triggers)
  - Simple Map-based storage (no external dependencies)

**Deliverables**:
- 4 utility files with TypeScript types
- Unit tests for confidence scoring algorithm
- Zod schema validation tests

**Estimate**: 4-6 hours

### Phase 2: Auto-Research Integration

**Goal**: Implement auto-research trigger with MCP integration

**Tasks**:
- Create `.claude/utils/auto-research.ts`
  - Implement `triggerAutoResearch()` async function
  - Check rate limit before proceeding
  - Display initial status message with confidence reason
  - Parallel MCP queries:
    - Context7 for library-specific docs
    - WebSearch for latest best practices
  - Show progress updates ("Checking Next.js 15 documentation...")
  - Validate MCP responses with Zod schemas
  - Sanitize external text before including in reasoning
  - Recalculate confidence with new findings
  - Return: `{ newConfidence: number, enhancedFindings: ResearchFindings, externalRefs: string[] }`
- Add timeout handling (30 seconds max)
- Add error handling for MCP failures (graceful degradation)

**Deliverables**:
- Auto-research utility with MCP integration
- Integration tests with mock MCP responses
- Error handling for timeout and MCP failures

**Estimate**: 6-8 hours

### Phase 3: Phase 2 Display Enhancement

**Goal**: Update Phase 2 exploration format in `/spec:plan` command

**Tasks**:
- Update `.claude/commands/spec/plan.md` (lines 206-249)
  - Add confidence calculation call before presenting options
  - Add auto-research trigger logic (if confidence < 90%)
  - Update display format:
    - Add top banner: "🎯 Recommended: [Option Name]"
    - Add confidence percentage: "Confidence: XX%"
    - Add reasoning section with tech stack context
    - Add "← RECOMMENDED" marker to recommended option
    - Add research attribution if external sources used
  - Preserve existing pros/cons structure
  - Add user prompt: "Accept recommendation or choose different option"
- Update `.claude/skills/prd-analyzer/SKILL.md` (lines 188-214)
  - Document confidence calculation methodology
  - Add examples of when to trigger research
  - Define reasoning structure for recommendations
  - Add Phase 2 enhanced format example

**Deliverables**:
- Updated Phase 2 display format in plan.md
- Updated prd-analyzer SKILL documentation
- Example outputs in documentation

**Estimate**: 3-4 hours

### Phase 4: Audit Logging

**Goal**: Implement recommendation decision logging for success metrics

**Tasks**:
- Create logging directory: `.claude/logs/`
- Add `.gitignore` entry for `recommendations.jsonl`
- Implement logging function in Phase 2 logic:
  - Capture: timestamp, sessionId, confidence, recommended option, user choice, accepted boolean, research triggered, tech stack, reasoning snippet
  - Append to `.claude/logs/recommendations.jsonl` (JSON Lines format)
  - Sanitize reasoning text (first 100 chars, no PII)
- Create analysis script: `scripts/analyze-recommendations.sh`
  - Calculate acceptance rate: `grep '"accepted":true' | wc -l`
  - Calculate research trigger rate: `grep '"researchTriggered":true' | wc -l`
  - Average confidence by outcome (accepted vs rejected)

**Deliverables**:
- Audit logging implementation
- Analysis script for success metrics
- Documentation on how to review logs

**Estimate**: 2-3 hours

### Phase 5: Security Hardening

**Goal**: Implement security controls identified by Security Scanner

**Tasks**:
- Input sanitization (sanitize.ts):
  - Apply Zod schemas to all user inputs
  - Sanitize reasoning text before display
  - Validate tech stack extraction output
- Rate limiting (rate-limit.ts):
  - Enforce 10 research triggers per session
  - Return clear error if limit exceeded
- MCP response validation:
  - Create Zod schema for Context7/WebSearch responses
  - Validate before using external data
  - Log validation failures
- Security testing:
  - Test prompt injection scenarios
  - Test rate limit enforcement
  - Test MCP response tampering handling

**Deliverables**:
- Security utilities with Zod validation
- Security test suite
- Security checklist verification

**Estimate**: 3-4 hours

### Phase 6: Testing & Documentation

**Goal**: Comprehensive testing and user documentation

**Tasks**:
- Unit tests:
  - Confidence calculation with various input combinations
  - Tech stack extraction from package.json
  - Sanitization and validation functions
  - Rate limiting logic
- Integration tests:
  - Full Phase 2 flow with auto-research
  - MCP integration with mock responses
  - Logging verification
- Manual testing:
  - Run `/spec:plan` on test spec with low confidence scenario
  - Verify progress updates display correctly
  - Verify recommendation display format
  - Verify user override logging
- Documentation:
  - Update README with confidence feature overview
  - Add troubleshooting guide for common issues
  - Document success metrics tracking process

**Deliverables**:
- Test suite with >80% coverage
- Updated documentation
- Manual test verification checklist

**Estimate**: 4-5 hours

## Technical Specifications

### Confidence Calculation Algorithm

**Scoring** (Total: 100 points):

1. **Research Depth** (40 points)
   - High confidence findings from Research Agent: 40 pts
   - Medium confidence findings: 25 pts
   - Low confidence or no findings: 10 pts

2. **Tech Stack Match** (30 points)
   - All options compatible with user's stack: 30 pts
   - Partial compatibility (1-2 options match): 20 pts
   - Generic options (no stack-specific info): 10 pts

3. **Architecture Simplicity** (20 points)
   - Simple patterns (well-documented, common): 20 pts
   - Moderate complexity: 12 pts
   - Complex/novel architecture: 5 pts

4. **Knowledge Recency** (10 points)
   - Pre-2025 tech (within knowledge cutoff): 10 pts
   - Post-2025 or emerging tech: 0 pts (triggers auto-research)

**Thresholds**:
- ≥90 points (≥90%): High confidence - proceed with recommendation
- 70-89 points (70-89%): Medium confidence - proceed with recommendation
- <70 points (<70%): Low confidence - trigger auto-research

### Phase 2 Enhanced Display Format

```markdown
🎯 Recommended: [Option Name]
Confidence: [XX]%
Reasoning: Based on your [tech stack context], this approach [specific benefits].
[If research triggered] Research findings suggest [external insight from Context7/WebSearch].

---

**Option A:** [Approach Name]
[If found in research] Similar to: [file:line reference from codebase]

✅ Pros:
- [Benefit 1]
- [Benefit 2 - backed by research findings]
- [Benefit 3]

❌ Cons:
- [Drawback 1]
- [Security concern from scanner, if applicable]
- [Drawback 3]

Best for: [Specific use case]

**Option B:** [Approach Name] ← RECOMMENDED
[Same structure]

**Option C:** [Approach Name]
[Same structure]

---

Security considerations:
[List P0/high severity issues from Security Scanner]

Which approach fits your needs? (Accept recommendation or choose different option)
```

### Audit Log Schema

```typescript
interface RecommendationLog {
  timestamp: string;           // ISO 8601 format
  sessionId: string;           // Planning session identifier
  featureName: string;         // From spec title
  confidence: number;          // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  recommended: string;         // Option name (e.g., "Option B")
  userChoice: string;          // Option user selected
  accepted: boolean;           // userChoice === recommended
  researchTriggered: boolean;  // Auto-research happened
  techStack: string[];         // Extracted dependencies
  reasoning: string;           // First 100 chars of reasoning text
}
```

### Security Controls

**Input Sanitization**:
```typescript
// Reasoning text
const ReasoningSchema = z.string()
  .max(500)
  .transform(str => str.replace(/[<>]/g, ''))
  .transform(str => str.trim());

// Tech stack names
const TechStackSchema = z.array(z.string().max(100)).max(20);

// MCP responses
const MCPResponseSchema = z.object({
  data: z.unknown(),
  source: z.enum(['context7', 'websearch'])
});
```

**Rate Limiting**:
- Max 10 research triggers per planning session
- Simple Map-based tracking (sessionId → count)
- Clear error message if limit exceeded

**Audit Logging**:
- Append-only `.claude/logs/recommendations.jsonl`
- No PII stored
- Reasoning text limited to 100 chars

## Testing Strategy

### Unit Tests
- `confidence.test.ts`: Test scoring algorithm with various input combinations
- `tech-stack.test.ts`: Test package.json parsing and ADR scanning
- `sanitize.test.ts`: Test Zod schema validation and sanitization
- `rate-limit.test.ts`: Test rate limiting enforcement

### Integration Tests
- `auto-research.test.ts`: Test MCP integration with mock responses
- `phase2-flow.test.ts`: Test complete Phase 2 flow with confidence calculation
- `logging.test.ts`: Test audit log writing and format

### Manual Testing Checklist
- [ ] Run `/spec:plan` with high confidence scenario (≥90%)
- [ ] Run `/spec:plan` with low confidence scenario (<70%)
- [ ] Verify auto-research triggers and displays progress
- [ ] Verify recommendation display format with 🎯 and ← markers
- [ ] Verify user override logs to recommendations.jsonl
- [ ] Verify rate limiting after 10 research triggers
- [ ] Verify sanitization prevents HTML injection in reasoning

## Deployment

### Rollout Steps
1. Merge utility functions (Phase 1) - no user-facing changes
2. Merge auto-research integration (Phase 2) - no user-facing changes
3. Deploy Phase 2 display enhancement (Phase 3) - FEATURE LIVE
4. Enable audit logging (Phase 4)
5. Run security tests (Phase 5)
6. Update documentation (Phase 6)

### Rollback Plan
- If Phase 2 display breaks: Revert `.claude/commands/spec/plan.md` to previous version
- If auto-research fails: Disable research trigger (confidence < 90% still proceeds without research)
- Logging failures are non-critical (can be fixed post-deployment)

### Migration Strategy
No migration needed - this is a net-new feature enhancement. Existing Phase 2 exploration continues to work if new code fails.

## Risk Mitigation

### Identified Risks

1. **Risk**: MCP queries timeout or fail during auto-research
   **Mitigation**: 30-second timeout with graceful degradation. Display original confidence if research fails. Log failure for investigation.

2. **Risk**: Confidence threshold (90%) is too aggressive, triggering research too often
   **Mitigation**: Monitor `.claude/logs/recommendations.jsonl` for research trigger rate. Target: ~30% of sessions. Adjust threshold if needed.

3. **Risk**: Reasoning text contains prompt injection attempts
   **Mitigation**: Zod sanitization removes HTML chars, length-limits text. Security Scanner identified this as medium severity - mitigated.

4. **Risk**: Tech stack extraction fails if no package.json or ADRs found
   **Mitigation**: Return empty context gracefully. Confidence calculation still works with generic options (lower score).

5. **Risk**: Recommendation acceptance rate is too low (<70%), indicating poor calibration
   **Mitigation**: Manual log analysis after 2 weeks. Adjust confidence scoring algorithm if needed.

## Success Criteria

### Acceptance Criteria (from Spec)
- [x] Phase 2 exploration includes confidence level (percentage) for recommendation
- [x] Recommended option is clearly marked with 🎯 and ← RECOMMENDED indicator
- [x] Reasoning section explains why recommendation fits user's specific context (tech stack, existing infrastructure)
- [x] If confidence <90%, automatically trigger Context7 + WebSearch research
- [x] Research process is visible to user with status messages ("Let me research... [complete]")
- [x] User can still override recommendation and choose different option
- [x] Updated documentation in `/spec:plan` command reflecting new Phase 2 format
- [x] Updated documentation in `prd-analyzer` Skill documenting confidence pattern
- [x] Success metrics tracked: recommendation acceptance rate ≥70%, research trigger rate ~30%

### Success Metrics (2 weeks post-deployment)
- User accepts recommendation ≥70% of time (indicates good calibration)
- Research triggered in ~30% of planning sessions
- Subjective: User reports reduced decision paralysis in feedback

### Validation Methods
1. Review `.claude/logs/recommendations.jsonl`:
   ```bash
   # Acceptance rate
   total=$(wc -l < .claude/logs/recommendations.jsonl)
   accepted=$(grep '"accepted":true' .claude/logs/recommendations.jsonl | wc -l)
   echo "Acceptance rate: $((accepted * 100 / total))%"

   # Research trigger rate
   research=$(grep '"researchTriggered":true' .claude/logs/recommendations.jsonl | wc -l)
   echo "Research trigger rate: $((research * 100 / total))%"
   ```

2. User feedback collection (manual observation)

## References

### Related Codebase Patterns
- Research Agent confidence pattern: `.claude/sub-agents/research-agent.md` (categorical confidence levels)
- Security Scanner confidence pattern: `.claude/sub-agents/security-scanner.md` (severity + confidence dual-rating)
- Phase 2 exploration format: `.claude/commands/spec/plan.md:206-249` (current pros/cons structure)
- PRD analyzer Skill: `.claude/skills/prd-analyzer/SKILL.md:188-214` (Socratic methodology documentation)
- Tech stack extraction: Research Agent uses package.json parsing (no current implementation found)
- Zod validation: `packages/db/src/schema.ts` (schema validation patterns)

### Architecture Decision Records
- ADR 009: Sub-agent orchestration pattern for delegating research
- ADR 010: Research Agent workflow with external MCP integration

### External Documentation
- Context7 MCP: For library-specific documentation lookups
- WebSearch MCP: For latest best practices and community consensus
- Zod: Schema validation and sanitization

### Security Scanner Findings
- High severity: No implementation exists yet - implement security controls from start
- Medium severity: Input validation for agent delegation (mitigated with Zod)
- Medium severity: MCP credential management (use environment variables)
- Low severity: Rate limiting for research triggers (implemented in Phase 2)
- Low severity: Audit logging for recommendation decisions (implemented in Phase 4)

## Estimated Timeline

- **Phase 1**: 4-6 hours
- **Phase 2**: 6-8 hours
- **Phase 3**: 3-4 hours
- **Phase 4**: 2-3 hours
- **Phase 5**: 3-4 hours
- **Phase 6**: 4-5 hours

**Total**: 22-30 hours (approximately 3-4 days of focused work)

## Next Steps

1. Review this implementation plan for completeness
2. Create implementation tasks: `/tasks specs/263-socratic-planning-confidence-levels.md`
3. Begin Phase 1 implementation (utility functions)
4. Test incrementally after each phase
5. Deploy to production after Phase 6 complete
6. Monitor success metrics for 2 weeks post-deployment

---

**Plan Status**: Draft (awaiting review)
**Plan Created**: 2025-01-02
**Spec Reference**: [specs/263-socratic-planning-confidence-levels.md](../specs/263-socratic-planning-confidence-levels.md)
