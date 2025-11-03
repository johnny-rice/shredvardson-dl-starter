# Sub-Agent Prompt Template

This template provides a standardized structure for all sub-agent prompts, inspired by best practices from Superclaude and other production LLM systems.

## Structure

All sub-agent prompts should follow this four-section structure:

### 1. PURPOSE

A clear, one-sentence description of what this prompt does.

**Example:**

```markdown
## PURPOSE

Explore the codebase deeply to answer architectural questions and return focused, actionable insights.
```

**Guidelines:**

- Keep it to 1 sentence
- Focus on the "what" and "why"
- Be specific about the agent's role
- Avoid implementation details

### 2. CONTEXT

Input data available, project-specific context, and relevant constraints from the conversation.

**Example:**

```markdown
## CONTEXT

- **Input Format**: { query, focus_areas, max_files, depth, include_external }
- **Project**: Next.js 15 + Supabase monorepo with Turborepo
- **Tools Available**: Read, Glob, Grep, Bash, WebSearch, MCP tools
- **Model**: Haiku 4.5 (fast, cost-effective)
- **Timeout**: 120 seconds
```

**Guidelines:**

- Specify input format/schema
- Mention project-specific technologies
- List available tools
- Note any performance constraints (timeouts, token limits)
- Include relevant project context

### 3. CONSTRAINTS

Output format requirements, length limits, style guidelines, and what NOT to do.

**Example:**

```markdown
## CONSTRAINTS

- **Token Budget**: Return summary in <5K tokens (exploration unlimited)
- **Output Format**: Valid JSON with specific schema (see OUTPUT FORMAT section)
- **File References**: Include file:line references for all findings
- **Confidence Level**: Must include high | medium | low
- **No Hallucinations**: Only report findings with evidence
- **Focus**: Actionable insights over exhaustive documentation
```

**Guidelines:**

- Be explicit about output requirements
- Specify token limits
- Define quality standards
- List prohibited behaviors
- Set expectations for completeness

### 4. OUTPUT FORMAT

Explicit schema or template for expected output.

**Example:**

```markdown
## OUTPUT FORMAT

Return findings as JSON:

\`\`\`json
{
"key_findings": [
{
"finding": "Description",
"source": "internal" | "external",
"location": "file.ts:42"
}
],
"recommendations": [
{
"action": "Actionable step",
"rationale": "Why this matters"
}
],
"confidence": "high" | "medium" | "low"
}
\`\`\`

**Required Fields:**

- \`key_findings\`: Array of findings with file references
- \`recommendations\`: Array of actionable next steps
- \`confidence\`: Overall confidence level

**Optional Fields:**

- \`architecture_patterns\`: Identified design patterns
- \`code_locations\`: Key file locations
```

**Guidelines:**

- Provide complete JSON schema
- Define required vs optional fields
- Show example output
- Specify data types
- Document enum values

## Additional Sections

After the four core sections, you may include:

### Examples

Show concrete input/output examples demonstrating the agent's behavior.

**IMPORTANT - Markdown Code Blocks:**

- Always use language identifiers in code blocks (e.g., ` ```text`, ` ```json`, ` ```bash`)
- Use ` ```text` for user input examples and natural language instructions
- Use specific identifiers (` ```json`, ` ```typescript`) for code/data
- Never leave code blocks without a language identifier
- This ensures proper syntax highlighting, accessibility, and linting compliance
- See: [docs/micro-lessons/markdown-code-blocks.md](../../docs/micro-lessons/markdown-code-blocks.md)

### Success Criteria

Checklist of requirements for a successful output:

- [ ] Output is valid JSON
- [ ] All required fields present
- [ ] File references are valid
- [ ] etc.

### Failure Modes & Handling

Document how to handle common failure scenarios:

- Query too broad
- No matches found
- Timeout approaching
- Missing dependencies

### Process (Optional)

Step-by-step workflow the agent should follow. Keep this concise.

## Anti-Patterns to Avoid

❌ **Unstructured prose**: Don't write long paragraphs explaining the agent's purpose
❌ **Missing output schema**: Always provide explicit JSON schema
❌ **Vague constraints**: Be specific about limits and requirements
❌ **Implementation details in PURPOSE**: Keep PURPOSE high-level
❌ **Redundant information**: Don't repeat the same info across sections

## Benefits of This Structure

**Consistency**: All sub-agents follow the same structure
**Maintainability**: Easy to update specific sections
**Quality**: Explicit constraints reduce hallucinations
**Debugging**: Clear sections make it easy to identify issues
**Onboarding**: New contributors understand prompts immediately

## Migration Guide

When updating existing prompts:

1. **Identify PURPOSE**: Extract or write a 1-sentence mission statement
2. **Gather CONTEXT**: List input format, tools, project info, constraints
3. **Define CONSTRAINTS**: Specify output requirements, limits, quality standards
4. **Document OUTPUT FORMAT**: Show complete JSON schema with examples
5. **Preserve examples**: Keep existing examples, they're valuable
6. **Test thoroughly**: Ensure updated prompt produces same quality output

## References

- [Superclaude Prompt Engineering](https://github.com/gwendall/superclaude) - Inspiration for structured prompts
- [ADR: Prompt Engineering Standards](../../docs/adr/XXX-prompt-engineering.md) - Project guidelines
- [Issue #259](https://github.com/org/repo/issues/259) - Implementation tracking

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
