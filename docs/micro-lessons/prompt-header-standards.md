# Follow Standard Prompt Header Format

## Problem

Prompt files without standardized headers make it difficult to understand purpose, requirements, and safety constraints, leading to inconsistent usage.

## Solution

Include all four required headers with exact formatting:

```markdown
# Prompt Title

**Intent:** What the prompt aims to achieve
**Inputs:** Required data or variables needed  
**Expected Output:** Format and content of the expected response
**Risks/Guardrails:** Safety constraints, forbidden outputs, and mitigation notes

## Rest of prompt content...
```

## Required Headers

1. **Intent:** - Clear purpose statement
2. **Inputs:** - Data requirements and variables
3. **Expected Output:** - Response format and content expectations
4. **Risks/Guardrails:** - Safety constraints and forbidden behaviors

## Benefits

- **Clarity**: Immediate understanding of prompt purpose
- **Safety**: Explicit risk mitigation documented upfront
- **Consistency**: Standardized format across all prompts
- **Automation**: Enables automated validation checks

## Context

- Essential for prompt governance and safety
- Required by starter-doctor validation
- Improves prompt maintainability and reuse

**Tags:** `prompts,headers,standards,safety,governance,documentation,coderabbit`
