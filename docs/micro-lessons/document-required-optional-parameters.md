---
id: document-required-optional-parameters
title: "Explicitly Document Required vs Optional Parameters"
category: api-design
tags: [api, parameters, documentation, clarity, prompts, json-schema]
date: 2025-11-03
confidence: high
impact: high
effort: low
related:
  - issue: "#259"
  - files:
    - ".claude/prompts/*.md"
    - "docs/api/**"
---

# Explicitly Document Required vs Optional Parameters

## Context

During PR #273 code review, CodeRabbit identified ambiguity in the Research Agent's input parameters. The prompt showed examples omitting certain fields, but the CONTEXT section didn't clarify which fields were required vs optional.

**Problem:**

```markdown
- **Input Format**: JSON with { query, focus_areas, max_files, depth, include_external }
```

**Examples showed:**

- Example 1: Included all fields
- Example 2: Omitted `max_files`
- Example 3: Omitted `max_files` and changed `include_external`

**Question:** Are `max_files` and `include_external` optional? The prompt didn't say.

## What We Learned

### Always Explicitly Label Required vs Optional

**Before (ambiguous):**

```markdown
## CONTEXT

- **Input Format**: JSON with { query, focus_areas, max_files, depth, include_external }
```

**After (explicit):**

```markdown
## CONTEXT

- **Input Format**: JSON with required fields `{ query, depth }` and optional fields `{ focus_areas, max_files, include_external }`
  - `query` (required): Research question or topic
  - `depth` (required): "shallow" or "deep"
  - `focus_areas` (optional): Array of areas to focus on
  - `max_files` (optional): Maximum files to include (default: 10 shallow, 20 deep)
  - `include_external` (optional): Search external docs (default: true for deep, false for shallow)
```

**Benefits:**

- No ambiguity about what callers must provide
- Clear defaults for optional parameters
- Type information inline
- Expected values documented

## When to Use This Pattern

### ✅ Always Document Required/Optional For

1. **API Input Parameters**
   - Function arguments
   - HTTP API endpoints
   - CLI tool flags
   - JSON request bodies

2. **Prompt Input Schemas**
   - Sub-agent inputs (.claude/prompts/*.md)
   - Task delegation interfaces
   - Tool invocation parameters

3. **Configuration Objects**
   - Config file schemas
   - Environment variables
   - Feature flags

4. **Type Definitions**
   - TypeScript interfaces
   - JSON schemas
   - GraphQL schemas

### ✅ Especially Important When

1. **Examples Omit Fields**
   - If any example doesn't include a field, make optional/required explicit
   - Show defaults for omitted fields

2. **Parameters Have Defaults**
   - Document what happens when optional parameter is omitted
   - Show default values clearly

3. **Parameters Interact**
   - When one parameter affects another's behavior
   - When parameter combinations have special meaning

4. **Multiple Use Cases**
   - When the same input serves different scenarios
   - When some fields only matter in certain contexts

## How to Apply This Pattern

### 1. List Required Fields First

**Template:**

```markdown
- **Input Format**: JSON with required fields `{ field1, field2 }` and optional fields `{ field3, field4 }`
```

**Example:**

```markdown
- **Input Format**: JSON with required fields `{ component_path, test_type }` and optional fields `{ coverage_target, mock_strategy }`
```

### 2. Document Each Field

Provide:

- Name
- Required/optional status
- Type (string, number, array, object)
- Purpose/description
- Default value (for optional fields)
- Allowed values (for enums)

**Template:**

```markdown
- `field_name` (required|optional): Description
  - Type: string | number | array | object
  - Default: value (for optional)
  - Allowed: value1, value2, value3 (for enums)
```

**Example:**

```markdown
- `depth` (required): Research thoroughness level
  - Type: string
  - Allowed: "shallow", "deep"
- `max_files` (optional): Maximum number of files to include
  - Type: number
  - Default: 10 for shallow, 20 for deep
  - Range: 1-50
```

### 3. Show Defaults Clearly

For optional parameters, always document the default behavior:

**Good:**

```markdown
- `include_external` (optional): Whether to search external docs
  - Default: true for deep research, false for shallow research
```

**Bad (ambiguous):**

```markdown
- `include_external` (optional): Whether to search external docs
```

### 4. Align Examples with Documentation

If your examples omit optional fields, ensure the docs explain why:

**Example:**

```markdown
### Example 2: Quick Codebase Search

**Input:**
```json
{
  "query": "Where is auth configured?",
  "depth": "shallow"
}
```

**Note:** `max_files` omitted (uses default of 10 for shallow search)

## Code Examples

### Example 1: Research Agent (Fixed in PR #273)

**Before:**

```markdown
## CONTEXT

- **Input Format**: JSON with { query, focus_areas, max_files, depth, include_external }
- **Project**: Next.js 15 + Supabase monorepo
```

**Problem:** Can't tell which fields are required.

**After:**

```markdown
## CONTEXT

- **Input Format**: JSON with required fields `{ query, depth }` and optional fields `{ focus_areas, max_files, include_external }`
  - `query` (required): Research question or topic
  - `depth` (required): "shallow" or "deep"
  - `focus_areas` (optional): Array of areas to focus on (e.g., ["auth", "database"])
  - `max_files` (optional): Maximum number of files to include (default: 10 for shallow, 20 for deep)
  - `include_external` (optional): Whether to search external docs (default: true for deep, false for shallow)
- **Project**: Next.js 15 + Supabase monorepo
```

**Benefits:**

- Immediately clear what's required
- Defaults documented
- Type hints provided
- Example values shown

### Example 2: Database Migration Agent

**Before:**

```markdown
- **Input Format**: Natural language description of table structure and RLS requirements
```

**Problem:** Too vague - what exactly is the input?

**After:**

```markdown
- **Input Format**: Natural language with required fields `{ table_description, rls_requirements }` and optional fields `{ migration_name, include_validation }`
  - `table_description` (required): Table schema, columns, types, constraints
  - `rls_requirements` (required): Access control policies needed
  - `migration_name` (optional): Custom migration name (default: auto-generated from table name)
  - `include_validation` (optional): Generate validation queries (default: true)
```

**Benefits:**

- Structured input format
- Clear required components
- Sensible defaults

### Example 3: Test Generator

**Good (explicit required/optional):**

```markdown
- **Input Format**: JSON with required fields `{ component_path }` and optional fields `{ test_type, coverage_target, mock_dependencies }`
  - `component_path` (required): Path to component file
  - `test_type` (optional): "unit" | "integration" (default: "unit")
  - `coverage_target` (optional): Minimum coverage percentage (default: 80)
  - `mock_dependencies` (optional): Array of dependencies to mock (default: auto-detect)
```

**Why this works:**

- Only one truly required field (`component_path`)
- All optional fields have clear defaults
- Enum values shown inline
- Array type specified

## Tools & Patterns

### 1. JSON Schema Integration

Use JSON Schema `required` array:

```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "depth": { "type": "string", "enum": ["shallow", "deep"] },
    "max_files": { "type": "number", "default": 10 }
  },
  "required": ["query", "depth"]
}
```

Then document in prose:

```markdown
- **Input Format**: JSON matching the schema below
  - `query` (required): Research question
  - `depth` (required): "shallow" or "deep"
  - `max_files` (optional): Max files (default: 10)
```

### 2. TypeScript Interface Style

Borrow from TypeScript optional syntax:

```typescript
interface ResearchInput {
  query: string;          // required (no ?)
  depth: "shallow" | "deep";  // required
  max_files?: number;     // optional (with ?)
  include_external?: boolean;  // optional
}
```

Document similarly:

```markdown
Required: `query`, `depth`
Optional: `max_files`, `include_external`
```

### 3. Parameter Interaction Documentation

When parameters affect each other, document the relationships:

```markdown
**Parameter Interaction:**
- If `include_external: false` is set, external tools are skipped regardless of `depth`
- If `include_external: true` is set for shallow research, external research will be performed despite shallow depth
- Default behavior: shallow = no external, deep = yes external
```

This prevents confusion about precedence and interaction.

### 4. Default Value Table

For complex APIs, create a defaults table:

| Parameter | Required | Type | Default | Notes |
|-----------|----------|------|---------|-------|
| `query` | ✅ Yes | string | - | Search term |
| `depth` | ✅ Yes | "shallow"\|"deep" | - | Research level |
| `max_files` | ❌ No | number | 10 (shallow)<br>20 (deep) | 1-50 range |
| `include_external` | ❌ No | boolean | false (shallow)<br>true (deep) | External docs |

## Trade-offs & Considerations

### Pros ✅

1. **Eliminates Ambiguity**
   - Callers know exactly what to provide
   - No guessing about optional fields
   - Prevents missing required parameters

2. **Self-Documenting**
   - Code/prompts document themselves
   - Less need for separate API docs
   - Examples make sense in context

3. **Better Error Messages**
   - Can validate required fields explicitly
   - Can show helpful error: "Missing required field: query"
   - Can suggest defaults for omitted optional fields

4. **Easier Maintenance**
   - Changes to requirements are obvious
   - Adding new optional fields doesn't break existing calls
   - Deprecating fields can be clearly marked

5. **Better Tooling**
   - IDEs can provide better autocomplete
   - Linters can validate calls
   - Schema validators can check structure

### Cons ⚠️

1. **More Verbose Documentation**
   - Takes more space to document each field
   - May feel repetitive for simple APIs

2. **Maintenance Overhead**
   - Documentation must stay in sync with code
   - Defaults must be updated in both places
   - Schema changes need doc updates

3. **Can Be Overkill**
   - For APIs with 1-2 simple required parameters
   - For internal-only APIs with obvious parameters

### When Trade-offs Favor Explicit Documentation

✅ **Always document required/optional for:**

- Public APIs
- Sub-agent interfaces
- Prompts used by multiple agents
- Complex parameter sets (>3 fields)
- When parameters have defaults
- When examples omit fields

❌ **Can skip detailed docs for:**

- Single required parameter, no optional
- Obvious internal helpers
- Private functions with clear names
- When TypeScript types are sufficient

## Related Patterns

### 1. JSON Schema Validation

See [packages/shared/schemas/](../../packages/shared/schemas/) for how we validate JSON inputs at runtime.

### 2. TypeScript Type Definitions

See [packages/types/src/](../../packages/types/src/) for strongly-typed parameter interfaces.

### 3. Prompt Template Standards

See [.claude/prompts/_TEMPLATE.md](../../.claude/prompts/_TEMPLATE.md) for full prompt documentation guidelines.

## Saved Us From

### Issues Prevented

1. **Caller Confusion**
   - BEFORE: "Do I need to include max_files?"
   - AFTER: "It's optional with default 10"
   - **Impact:** Reduces support questions, faster integration

2. **Runtime Errors**
   - BEFORE: Missing required field, vague error
   - AFTER: Clear validation error with field name
   - **Impact:** Easier debugging, faster development

3. **Inconsistent Examples**
   - BEFORE: Examples omit fields without explanation
   - AFTER: Examples annotated with "uses default X"
   - **Impact:** Examples teach correct usage patterns

4. **Parameter Interaction Bugs**
   - BEFORE: Unclear what happens when depth=deep and include_external=false
   - AFTER: Documented precedence rules
   - **Impact:** Prevents unexpected behavior

### Specific Example from PR #273

**Issue:** Research Agent examples showed varying parameter sets without documentation

Example 1 (lines 370-377): Included all 5 parameters
Example 2 (lines 402-408): Omitted `max_files`
Example 3 (lines 450-457): Omitted `max_files`, changed `include_external`

**Question from CodeRabbit:** "Are max_files and include_external optional? Explicitly document which parameters are required vs optional."

**Fix Applied:**

- Changed line 27 to explicitly list required vs optional
- Added field-by-field documentation with types and defaults
- Added parameter interaction section
- Documented empty code_locations edge case

**Result:**

- Zero ambiguity about parameter requirements
- Clear defaults for all optional fields
- Interaction rules documented
- Examples now make sense in context

## Quick Reference Card

```markdown
# Parameter Documentation Template

## Required/Optional Declaration

- **Input Format**: JSON with required fields `{ field1, field2 }`
  and optional fields `{ field3, field4 }`

## Field Documentation

- `field_name` (required|optional): Purpose
  - Type: string | number | array | object
  - Default: value (if optional)
  - Allowed: enum values (if applicable)
  - Range: min-max (if applicable)

## Parameter Interactions

Document when parameters affect each other:
- If param1 = X, then param2 is ignored
- Default behavior: ...

## Examples

Show examples with annotations for omitted fields:
**Note:** field_name omitted (uses default value)
```

## Checklist

When documenting parameters:

- [ ] List required fields explicitly
- [ ] List optional fields explicitly
- [ ] Document type for each field
- [ ] Provide defaults for optional fields
- [ ] Show allowed values for enums
- [ ] Document parameter interactions
- [ ] Align examples with documented behavior
- [ ] Annotate examples that omit optional fields

## References

- **PR:** #273 - Structured Prompt Templates
- **CodeRabbit Comment:** research-agent.md lines 27, 402-408, 450-457
- **JSON Schema:** [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
- **TypeScript Handbook:** [Interfaces - Optional Properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#optional-properties)
- **API Design:** [Principles of API Design](https://swagger.io/resources/articles/best-practices-in-api-design/)

## Tags for Discovery

`#api-design` `#parameters` `#documentation` `#json-schema` `#clarity` `#prompts` `#required` `#optional` `#defaults` `#best-practices`
