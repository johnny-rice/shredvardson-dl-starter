# ADR 003: Structured Prompt Templates for Sub-Agents

**Status:** Accepted
**Date:** 2025-11-03
**Decision Makers:** Development Team
**Consultation:** Anthropic Claude Code best practices, Superclaude prompt engineering patterns

## Context

Our sub-agents (Research Agent, Security Scanner, Test Generator, etc.) currently use unstructured markdown prompts. This leads to:

- **Inconsistent outputs**: No explicit output format enforcement
- **Maintenance challenges**: Hard to update specific aspects of prompts
- **Quality issues**: Vague constraints allow hallucinations and off-topic responses
- **Onboarding friction**: New contributors struggle to understand prompt structure

### Inspiration

Analysis of [Superclaude](https://github.com/gwendall/superclaude) revealed that structured prompts with explicit sections significantly improve LLM output consistency and quality. Their approach uses clear PURPOSE, CONTEXT, CONSTRAINTS, and OUTPUT FORMAT sections.

## Decision

Adopt a **four-section structured template** for all sub-agent prompts:

### 1. PURPOSE (Required)

One-sentence description of what the prompt does.

**Example:**

```markdown
## PURPOSE

Explore the codebase deeply to answer architectural questions and return focused, actionable insights.
```

### 2. CONTEXT (Required)

Available inputs, project-specific context, tools, model, and timeout information.

**Example:**

```markdown
## CONTEXT

- **Input Format**: JSON with { query, focus_areas, max_files, depth, include_external }
- **Project**: Next.js 15 + Supabase monorepo with Turborepo
- **Tools Available**: Read, Glob, Grep, Bash (read-only), WebSearch, MCP tools
- **Model**: Haiku 4.5 (fast, cost-effective)
- **Timeout**: 120 seconds
```

### 3. CONSTRAINTS (Required)

Output format requirements, token limits, quality standards, and prohibited behaviors.

**Example:**

```markdown
## CONSTRAINTS

- **Token Budget**: Return summary in <5K tokens (exploration unlimited)
- **Output Format**: Valid JSON with required schema (see OUTPUT FORMAT)
- **File References**: Include file:line references for all findings
- **Confidence Level**: Required - high | medium | low
- **No Hallucinations**: Only report findings with evidence
```

### 4. OUTPUT FORMAT (Required)

Explicit JSON schema with required/optional fields and data types.

**Example:**

```markdown
## OUTPUT FORMAT

Return findings as JSON:

\`\`\`json
{
"key_findings": [...],
"recommendations": [...],
"confidence": "high" | "medium" | "low"
}
\`\`\`

**Required Fields:**

- `key_findings`: 3-5 findings with file:line references
- `recommendations`: 2-4 actionable next steps
- `confidence`: Overall confidence (high | medium | low)
```

### Additional Sections (Optional)

After the four core sections, prompts may include:

- Examples (input/output demonstrations)
- Success Criteria (checklist for valid output)
- Failure Modes & Handling (error scenarios)
- Process/Guidelines (step-by-step workflows)

## Consequences

### Positive

✅ **Consistency**: All sub-agents follow the same structure
✅ **Maintainability**: Easy to update specific sections without rewriting entire prompt
✅ **Quality**: Explicit constraints reduce hallucinations and off-topic responses
✅ **Debugging**: Clear sections make it easy to identify which part needs adjustment
✅ **Onboarding**: New contributors understand prompt structure immediately
✅ **Documentation**: Prompts serve as their own documentation

### Negative

⚠️ **Migration Effort**: Requires updating 8 existing sub-agent prompts (4-6 hours one-time cost)
⚠️ **Verbosity**: Structured format is more verbose than freeform prompts
⚠️ **Learning Curve**: Team needs to learn new prompt structure (mitigated by template)

### Neutral

ℹ️ **Token Usage**: Slightly higher token usage due to structured format (negligible impact for Haiku model)
ℹ️ **Testing Required**: Need to validate that updated prompts produce same quality output

## Alternatives Considered

### Alternative 1: Keep Unstructured Prompts

**Why rejected:** Ongoing quality and maintenance issues outweigh short-term convenience. Lack of structure makes prompts hard to improve systematically.

### Alternative 2: Minimal Structure (PURPOSE + OUTPUT only)

**Why rejected:** Missing CONTEXT and CONSTRAINTS leads to ambiguity about inputs, tools, and quality standards. Half-measures don't solve the core problems.

### Alternative 3: Use XML Tags Instead of Markdown Sections

**Why rejected:** Markdown headings are more readable and already widely used in the codebase. XML tags add cognitive overhead without significant benefits.

## Implementation

### Phase 1: Create Template Library (Completed)

- ✅ Created `.claude/prompts/` directory
- ✅ Created `_TEMPLATE.md` with structure and guidelines
- ✅ Documented migration process

### Phase 2: Update Sub-Agent Prompts (Completed)

Updated all 8 sub-agents (6 converted, 2 migrated):

- ✅ Research Agent (migrated from .claude/agents/)
- ✅ Security Scanner (migrated from .claude/agents/)
- ✅ Test Generator (converted)
- ✅ Refactor Analyzer (converted)
- ✅ Documentation Writer (converted)
- ✅ Database Migration Agent (converted)
- ✅ PR Template Agent (converted)
- ✅ Issue Creator Agent (converted)

### Phase 3: Validation (Completed)

- ✅ Tested Test Generator (22/22 tests passing, 100% coverage)
- ✅ Tested PR Template Agent (complete PR description, all sections)
- ✅ Tested Database Migration Agent (production-ready SQL with RLS)
- ✅ Compared output quality (60% → 100% first-attempt success)
- ✅ Documented improvements in micro-lesson (259-structured-prompt-validation.md)

### Phase 4: Add Validation Script (Completed)

Created `scripts/validate-prompts.ts`:

- ✅ Verifies all 4 required sections present
- ✅ Checks OUTPUT FORMAT includes JSON schema
- ✅ Validates section order and formatting
- ✅ Provides detailed error messages
- ✅ 8/8 prompts passing validation

## Success Metrics

- ✅ All 8 sub-agents use structured format
- ✅ Output quality maintained or improved (60% → 100% first-attempt success, 0 revisions needed)
- ✅ Prompt template library established (`.claude/prompts/_TEMPLATE.md`)
- ✅ ADR documenting prompt engineering standards (this document)
- ✅ Automated validation preventing quality drift

## References

- [Superclaude Prompt Engineering](https://github.com/gwendall/superclaude) - Inspiration for structured approach
- [Issue #259](https://github.com/org/repo/issues/259) - Implementation tracking
- [Prompt Template](.claude/prompts/_TEMPLATE.md) - Standard template for new prompts
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering) - Best practices

## Related ADRs

- ADR-002: Skills Architecture (sub-agents are complementary to skills)

---

**Last Updated:** 2025-11-03
**Status:** Accepted (Implementation Complete)
