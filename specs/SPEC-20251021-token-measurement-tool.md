---
id: SPEC-20251021-token-measurement-tool
type: spec
issue: 177
source: https://github.com/Shredvardson/dl-starter/issues/177
---

# Token Measurement Tool for Skills Validation

## Overview

**Purpose**: Build a token measurement tool to validate the Skills architecture's 51-90% token savings hypothesis before investing 76 more hours in Phases 2-4.

**Priority**: P0 (BLOCKER) - Checkpoint for Phase 1 completion
**Estimated Effort**: 1-2 hours
**Dependencies**: Phase 1 completion (supabase-integration Skill)

## Problem Statement

The Skills architecture promises 51-90% token savings via progressive disclosure. Before investing 76 more hours in Phases 2-4, we must:

1. **Measure actual savings** from Phase 1 implementation
2. **Validate** the progressive disclosure hypothesis
3. **Make go/no-go decision** based on measurable data

**Abort Criteria**:

- If savings <30%: Document findings, analyze why, abort migration
- If savings 30-49%: Re-evaluate ROI, consider consolidating phases
- If savings ≥50%: ✅ Proceed with Phase 2

## Requirements

### Functional Requirements

1. **Command Interface**:

   ```bash
   pnpm skill:measure <skill-name>
   ```

2. **Workflow Comparison**:
   - Run old command workflow (e.g., `/db:migrate create test_table`)
   - Capture token count from execution
   - Run new Skill workflow (e.g., `/db create test_table`)
   - Capture token count from execution
   - Calculate % savings
   - Report results with Pass/Fail based on 30% threshold

3. **Token Counting**:
   - Primary: Estimate via tiktoken library (cl100k_base encoding)
   - Secondary: Manual inspection with Claude logs (for validation only)
   - Fallback: Manual inspection with documentation

4. **Output Format**:

   ```text
   📊 Token Measurement: supabase-integration Skill

   Old command (/db:migrate):
   - Tokens loaded: 3,847
   - Workflow: Create migration + validate RLS + generate types

   New Skill (/db):
   - Metadata loaded: 127
   - SKILL.md loaded: 412
   - Scripts executed: 0 (code never in context)
   - Docs loaded: 891 (RLS_PATTERNS.md)
   - Total tokens: 1,430

   💰 Savings: 2,417 tokens (62.8%)

   ✅ PASS: Exceeds 30% threshold
   ```

5. **Comparison Methodology**:
   - Identical operations (apples-to-apples)
   - Run 3 times, average results (control for variance)
   - Document all environmental factors
   - Save detailed logs for analysis

### Non-Functional Requirements

1. **Accuracy**: Token counts must be within ±5% margin of error
2. **Repeatability**: Same workflow produces consistent results
3. **Documentation**: All results logged to `scratch/token-measurement-{date}.md`
4. **Performance**: Complete measurement in <5 minutes
5. **Reliability**: Graceful error handling with clear failure messages

## Success Criteria

- [ ] Tool measures tokens for old command workflow
- [ ] Tool measures tokens for new Skill workflow
- [ ] Tool calculates % savings accurately
- [ ] Tool reports Pass/Fail based on 30% threshold
- [ ] Results documented in Phase 1 summary
- [ ] Go/no-go decision made for Phase 2

## Technical Constraints

1. **Language**: TypeScript (consistency with existing scripts)
2. **Location**: `scripts/skills/measure-tokens.ts`
3. **Integration**: Run via pnpm script `skill:measure`
4. **Dependencies**: Minimal - prefer built-in Node.js APIs
5. **Token Counting**:
   - Option 1: Parse Claude API response headers (if available)
   - Option 2: Use tiktoken library for estimation
   - Option 3: Manual inspection with structured logging

## Out of Scope

- Automated CI/CD integration (Phase 2)
- Historical trend analysis (Phase 2)
- Multi-Skill comparison dashboard (Phase 3)
- Production telemetry integration (Phase 4)

## Risks & Mitigation

| Risk                                  | Impact | Mitigation                                             |
| ------------------------------------- | ------ | ------------------------------------------------------ |
| Cannot access Claude API token counts | HIGH   | Use tiktoken estimation + manual validation            |
| Results show <30% savings             | HIGH   | Document findings, analyze root cause, abort migration |
| Tool produces inconsistent results    | MEDIUM | Run multiple iterations, document variance             |
| Environmental factors skew results    | MEDIUM | Standardize test environment, document all variables   |

## Dependencies

- Phase 1 completion (supabase-integration Skill must exist)
- Old `/db:migrate` command still available for comparison
- Claude Code logs accessible for parsing
- tiktoken library (optional fallback)

## Related Documents

- [ADR-002: Skills Architecture](../docs/adr/002-skills-architecture.md)
- [Skills Risk Register](../docs/adr/002-skills-risk-register.md)
- [Skills Implementation Checklist](../docs/adr/002-skills-implementation-checklist.md)
