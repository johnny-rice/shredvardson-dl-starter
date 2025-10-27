---
id: PLAN-20251021-token-measurement-tool
type: plan
parentId: SPEC-20251021-token-measurement-tool
issue: 177
spec: SPEC-20251021-token-measurement-tool
source: https://github.com/Shredvardson/dl-starter/issues/177
---

# Implementation Plan: Token Measurement Tool

## Architecture Decision

**Stack Alignment**:

- **Language**: TypeScript (consistency with existing scripts)
- **Runtime**: tsx (existing dev dependency)
- **Token Counting**: tiktoken library (industry standard for GPT token estimation)
- **Output**: Markdown reports + console output
- **Integration**: pnpm script wrapper

**Design Philosophy**:

- Simple, focused CLI tool
- Minimal dependencies
- Clear, actionable output
- Extensible for future metrics

## File Changes Required

### New Files

1. **`scripts/skills/measure-tokens.ts`** (Primary implementation)
   - CLI argument parsing
   - Workflow execution wrapper
   - Token counting logic
   - Results calculation and reporting
   - Report generation

2. **`scripts/skills/token-counter.ts`** (Token counting utility)
   - tiktoken integration
   - File/string token counting
   - Batch counting for workflows
   - Caching for performance

3. **`scripts/skills/__tests__/measure-tokens.test.ts`** (Unit tests)
   - Token counting accuracy
   - Calculation logic
   - Report generation
   - Error handling

### Modified Files

1. **`package.json`** (Add scripts and dependency)

   ```json
   {
     "scripts": {
       "skill:measure": "tsx scripts/skills/measure-tokens.ts"
     },
     "devDependencies": {
       "tiktoken": "^1.0.17"
     }
   }
   ```

2. **`docs/adr/002-skills-implementation-checklist.md`** (Update Phase 1 checkpoint)
   - Add token measurement completion checkbox
   - Document results

## Implementation Strategy

### Phase 1: Token Counting Infrastructure (30 min)

**Tasks**:

1. Install tiktoken dependency
2. Create `scripts/skills/token-counter.ts`
3. Implement token counting functions:
   - `countTokens(text: string): number`
   - `countFileTokens(filePath: string): number`
   - `countWorkflowTokens(files: string[]): WorkflowTokens`

**Token Counting Strategy**:

```typescript
interface WorkflowTokens {
  metadata: number; // YAML frontmatter
  prompts: number; // Slash command prompts
  scripts: number; // Executable scripts (should be 0 for Skills)
  docs: number; // Referenced documentation
  total: number; // Sum of all
}
```

**Models**:

- Use `cl100k_base` encoding (GPT-4/Claude-compatible)
- Account for system prompts and formatting

### Phase 2: Workflow Execution (30 min)

**Tasks**:

1. Create `scripts/skills/measure-tokens.ts`
2. Implement workflow runners:
   - `measureCommandWorkflow(commandName: string): WorkflowTokens`
   - `measureSkillWorkflow(skillName: string): WorkflowTokens`
3. Parse command files for token counting
4. Parse Skill metadata and SKILL.md files

**Command Workflow Measurement**:

```typescript
// For /db:migrate command:
// 1. Read .claude/commands/db/migrate.md
// 2. Count YAML frontmatter tokens
// 3. Count prompt body tokens
// 4. Count referenced scripts (inline or file paths)
// 5. Count referenced docs (if any)
```

**Skill Workflow Measurement**:

```typescript
// For /db Skill:
// 1. Read .claude/skills/supabase-integration/skill.json
// 2. Count metadata tokens
// 3. Read .claude/skills/supabase-integration/SKILL.md
// 4. Count SKILL.md tokens
// 5. List referenced docs (progressive disclosure)
// 6. Count only initially loaded docs
// 7. Scripts should never be in context (verify 0)
```

### Phase 3: Comparison & Reporting (30 min)

**Tasks**:

1. Implement comparison logic:

   ```typescript
   interface ComparisonResult {
     oldWorkflow: WorkflowTokens;
     newWorkflow: WorkflowTokens;
     savings: number;
     savingsPercent: number;
     threshold: number;
     pass: boolean;
   }
   ```

2. Implement report generation:
   - Console output (emoji + colors)
   - Markdown report to `scratch/token-measurement-{date}.md`
   - Include raw data for analysis

3. Add threshold validation:
   - 30% threshold for go/no-go decision
   - Clear Pass/Fail indicator
   - Recommendation based on savings tier

**Report Template**:

```markdown
# Token Measurement Report

**Date**: {date}
**Skill**: {skillName}
**Comparison**: {oldCommand} vs {newSkill}

## Results

### Old Command: {oldCommand}

- Metadata: {n} tokens
- Prompts: {n} tokens
- Scripts: {n} tokens
- Docs: {n} tokens
- **Total: {n} tokens**

### New Skill: {newSkill}

- Metadata: {n} tokens
- SKILL.md: {n} tokens
- Scripts: {n} tokens (should be 0)
- Docs (initial): {n} tokens
- **Total: {n} tokens**

## Analysis

- **Savings**: {n} tokens ({pct}%)
- **Threshold**: 30%
- **Result**: {PASS/FAIL}

## Recommendation

{Based on savings tier - see abort criteria}

## Raw Data

{JSON dump for detailed analysis}
```

### Phase 4: CLI & Integration (30 min)

**Tasks**:

1. Implement CLI argument parsing:

   ```bash
   pnpm skill:measure <skill-name> [options]

   Options:
     --iterations <n>  Run n times and average (default: 3)
     --output <path>   Custom report path
     --verbose         Show detailed breakdown
   ```

2. Add pnpm script to package.json

3. Add usage documentation to README

4. Add error handling:
   - Skill not found
   - Command not found
   - Token counting failures
   - File read errors

## Testing Strategy

### Unit Tests (TDD Order)

1. **Token Counter Tests**:

   ```typescript
   describe('TokenCounter', () => {
     it('counts tokens in simple text', () => {
       expect(countTokens('hello world')).toBe(2);
     });

     it('counts tokens in command file', () => {
       const tokens = countFileTokens('.claude/commands/test.md');
       expect(tokens).toBeGreaterThan(0);
     });

     it('separates metadata from prompt tokens', () => {
       const result = countWorkflowTokens([...]);
       expect(result.metadata).toBeLessThan(result.total);
     });
   });
   ```

2. **Measurement Tests**:

   ```typescript
   describe('MeasureTokens', () => {
     it('measures command workflow tokens', () => {
       const result = measureCommandWorkflow('db:migrate');
       expect(result.total).toBeGreaterThan(0);
     });

     it('measures skill workflow tokens', () => {
       const result = measureSkillWorkflow('supabase-integration');
       expect(result.total).toBeGreaterThan(0);
     });

     it('calculates savings correctly', () => {
       const comparison = compareWorkflows(...);
       expect(comparison.savingsPercent).toBeGreaterThan(0);
     });
   });
   ```

3. **Report Generation Tests**:

   ```typescript
   describe('ReportGenerator', () => {
     it('generates markdown report', () => {
       const report = generateReport(comparison);
       expect(report).toContain('# Token Measurement Report');
     });

     it('includes pass/fail indicator', () => {
       const report = generateReport(comparison);
       expect(report).toMatch(/✅ PASS|❌ FAIL/);
     });
   });
   ```

### Integration Tests

1. **End-to-End Workflow**:
   - Run tool against real command and Skill
   - Verify report generation
   - Verify threshold validation
   - Check for errors

2. **Multiple Iterations**:
   - Run with `--iterations 3`
   - Verify averaging logic
   - Check variance reporting

### Manual Testing

1. **Baseline Measurement**:
   - Measure old `/db:migrate` command
   - Document token breakdown
   - Verify against manual count

2. **Skills Measurement**:
   - Measure new `/db` Skill (when available)
   - Compare against baseline
   - Verify progressive disclosure (scripts = 0)

3. **Report Validation**:
   - Review generated report
   - Verify calculations
   - Check recommendations

## Security Considerations

**Low Risk Assessment**:

- Read-only file operations
- No network calls
- No user data processing
- No secrets handling

**Safeguards**:

- Validate file paths (prevent directory traversal)
- Limit file size for token counting (prevent DoS)
- Sanitize user input (command/skill names)

## Dependencies

**New Dependencies**:

1. **tiktoken** (^1.0.17)
   - Industry standard for GPT token counting
   - MIT licensed
   - 1.2MB package size (acceptable for dev tool)
   - Alternative: Manual implementation (more complex, less accurate)

**Existing Dependencies**:

- tsx (already in devDependencies)
- Node.js fs/path APIs (built-in)
- commander (already available) for CLI parsing

**Justification**:

- tiktoken is the de facto standard for token counting
- Used by OpenAI, Anthropic ecosystem tools
- Accurate token counts are critical for validation
- No viable lightweight alternative

## Risks & Mitigation

| Risk                              | Impact | Likelihood | Mitigation                                                             |
| --------------------------------- | ------ | ---------- | ---------------------------------------------------------------------- |
| Token counting inaccurate         | HIGH   | MEDIUM     | Use tiktoken (industry standard), validate against manual counts       |
| Skills not ready for measurement  | HIGH   | LOW        | Check for Phase 1 completion, graceful error if missing                |
| Environmental variance in results | MEDIUM | HIGH       | Run 3 iterations, document variance, average results                   |
| Tool shows <30% savings           | HIGH   | MEDIUM     | Document findings, analyze root cause, make informed go/no-go decision |
| tiktoken dependency bloat         | LOW    | LOW        | Dev dependency only, 1.2MB is acceptable                               |

## Implementation Checklist

### Setup

- [ ] Install tiktoken dependency
- [ ] Create directory `scripts/skills/`
- [ ] Add pnpm script `skill:measure`

### Core Implementation

- [ ] Implement `token-counter.ts` with tiktoken integration
- [ ] Implement `measure-tokens.ts` CLI tool
- [ ] Add command workflow measurement
- [ ] Add Skill workflow measurement
- [ ] Add comparison logic
- [ ] Add report generation (console + markdown)

### Testing

- [ ] Unit tests for token counting
- [ ] Unit tests for measurement logic
- [ ] Unit tests for report generation
- [ ] Integration test for full workflow
- [ ] Manual validation against Phase 1 Skill

### Documentation

- [ ] Update package.json scripts
- [ ] Add usage documentation to README
- [ ] Document results in ADR-002 addendum
- [ ] Update Phase 1 completion checklist

### Validation

- [ ] Run against old `/db:migrate` command
- [ ] Run against new `/db` Skill (when available)
- [ ] Verify ≥30% savings or document findings
- [ ] Make go/no-go decision for Phase 2

## Success Metrics

1. **Accuracy**: Token counts within ±5% of manual validation
2. **Repeatability**: <5% variance across 3 iterations
3. **Performance**: Complete measurement in <5 minutes
4. **Usability**: Clear, actionable output with recommendations
5. **Decision Support**: Clear go/no-go recommendation based on threshold

## Next Steps After Implementation

1. **If savings ≥50%** (Expected):
   - ✅ Proceed with Phase 2
   - Use tool for each new Skill
   - Document success in ADR addendum

2. **If savings 30-50%** (Caution):
   - Re-evaluate ROI for Phases 2-4
   - Consider consolidating phases
   - Proceed cautiously with tighter monitoring

3. **If savings <30%** (Abort):
   - Document findings in ADR addendum
   - Analyze why progressive disclosure didn't work
   - Consider hybrid approach or abort migration
   - **Do NOT proceed to Phase 2**

## Estimated Timeline

- **Setup**: 15 min
- **Token Counter**: 30 min
- **Workflow Measurement**: 30 min
- **Comparison & Reporting**: 30 min
- **CLI Integration**: 30 min
- **Testing**: 30 min
- **Documentation**: 15 min

**Total**: ~3 hours (includes testing and documentation)
**Risk Buffer**: +1 hour for debugging/refinement

## References

- [ADR-002: Skills Architecture](../docs/adr/002-skills-architecture.md)
- [Skills Risk Register](../docs/adr/002-skills-risk-register.md)
- [tiktoken Documentation](https://github.com/openai/tiktoken)
- [Claude Token Counting Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/token-counting)
