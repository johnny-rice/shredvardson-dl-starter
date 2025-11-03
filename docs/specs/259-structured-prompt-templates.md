# Issue #259: Adopt Structured Prompt Templates for Sub-Agents

```yaml
---
title: Adopt structured prompt templates for sub-agents (inspired by Superclaude)
type: enhancement
priority: p1
status: ready
lane: automation
estimate: 4-6 hours
labels: [enhancement, tokens, automation]
---
```

## Problem Statement

Our sub-agents currently use unstructured markdown prompts without clear sections. This leads to:

- Inconsistent LLM outputs
- Harder to maintain prompts
- No explicit constraints or output format enforcement
- More hallucinations and off-topic responses

**Current approach:**

```markdown
# Research Agent

You are a research agent. Research the codebase...
```

**What we learned from Superclaude:**
Structured prompts with explicit sections significantly improve output consistency and quality.

## Proposed Solution

Adopt structured prompt templates with four key sections for all sub-agents:

```markdown
## PURPOSE

Clear, one-sentence description of what this prompt does

## CONTEXT

- Input data available
- Project-specific context
- Relevant constraints from conversation

## CONSTRAINTS

- Output format requirements
- Length limits
- Style guidelines
- What NOT to do

## OUTPUT FORMAT

Explicit schema or template for expected output
```

### Benefits

**Consistency:** Explicit output format reduces parsing errors
**Maintainability:** Clear sections make prompts easier to update
**Quality:** Constraints prevent off-topic responses and hallucinations
**Debugging:** Easier to identify which section needs adjustment
**Onboarding:** New contributors understand prompt structure immediately

## Implementation Plan

### Phase 1: Update Sub-Agent Prompts (2-3 hours)

Update all 8 sub-agent prompts with structured format:

1. Research Agent
2. Security Scanner
3. Test Generator
4. Refactor Analyzer
5. Documentation Writer
6. Database Migration Agent
7. PR Template Agent
8. Issue Creator Agent

Each prompt should include:

- PURPOSE section (1 sentence)
- CONTEXT section (available inputs, project context)
- CONSTRAINTS section (output requirements, limits)
- OUTPUT FORMAT section (explicit JSON schema or template)

### Phase 2: Create Prompt Template Library (1-2 hours)

1. Create `.claude/prompts/` directory
2. Create `_TEMPLATE.md` with standard structure
3. Document prompt engineering guidelines in ADR
4. Add validation script to check prompt structure

### Phase 3: Validation (30 min)

1. Test each updated sub-agent
2. Compare output quality before/after
3. Document improvements in micro-lesson

## Acceptance Criteria

- [x] All 8 sub-agents use structured format (PURPOSE, CONTEXT, CONSTRAINTS, OUTPUT FORMAT)
- [x] `.claude/prompts/` directory created with `_TEMPLATE.md`
- [x] ADR documenting prompt engineering standards (docs/adr/003-structured-prompt-templates.md)
- [x] Validation script to check prompt structure (scripts/validate-prompts.ts)
- [x] Output quality improved (60% → 100% first-attempt success rate) - Validated in Phase 3
- [x] Micro-lesson documenting improvements (docs/micro-lessons/259-structured-prompt-validation.md)

## Technical Details

### Example: Research Agent Before/After

**Before (unstructured):**

```markdown
# Research Agent

You are a specialized research agent. Explore the codebase deeply and return focused insights.
```

**After (structured):**

````markdown
## PURPOSE

Explore the codebase deeply to answer architectural questions and return focused, actionable insights.

## CONTEXT

- Input: { query, focus_areas, max_files, depth, include_external }
- Project: Next.js 15 + Supabase monorepo with Turborepo
- Access: Read, Glob, Grep, Bash, WebSearch tools

## CONSTRAINTS

- Return summary in <5K tokens
- Burn tokens freely in isolated context (you're Haiku, not Sonnet)
- Include specific file:line references
- Focus on actionable insights, not exhaustive documentation
- Confidence level required: high | medium | low

## OUTPUT FORMAT

```json
{
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "architecture_patterns": ["Pattern 1", "Pattern 2"],
  "recommendations": [{ "action": "...", "rationale": "..." }],
  "code_locations": [{ "file": "...", "line": 42, "purpose": "..." }],
  "confidence": "high"
}
```
````

### Inspiration

Based on analysis of [Superclaude](https://github.com/gwendall/superclaude) prompt engineering patterns, specifically:

- `src/prompts/commit.ts` - Commit message generation
- `src/prompts/review.ts` - Code review structure
- `src/context/git.ts` - Context injection patterns

### Sub-Agent Locations

All sub-agents are defined in the main Claude Code configuration. Current locations to update:

1. **Research Agent** - General-purpose exploration agent
2. **Security Scanner** - Vulnerability detection agent
3. **Test Generator** - Test creation agent
4. **Refactor Analyzer** - Code quality agent
5. **Documentation Writer** - Documentation generation agent
6. **Database Migration Agent** - SQL migration agent
7. **PR Template Agent** - PR template filler agent
8. **Issue Creator Agent** - GitHub issue creator agent

### Non-Goals

- ❌ Changing sub-agent functionality
- ❌ Adding new sub-agents
- ❌ Changing JSON output schemas (just make them explicit in prompts)

This is purely about **improving prompt structure**, not changing what sub-agents do.

## Success Metrics

- All 8 sub-agents use structured format
- Output quality improved (fewer retries needed)
- Prompt template library established
- ADR documenting prompt engineering standards

## Related Issues

- Related to #257 - Integrate sub-agents into workflow lanes (better prompts → better integration)
- Blocks: Improved sub-agent output quality

## Lane Assignment

**Automation Lane** - This is a developer experience improvement that enhances our automation infrastructure. It directly impacts token efficiency and output quality of our sub-agent system.
