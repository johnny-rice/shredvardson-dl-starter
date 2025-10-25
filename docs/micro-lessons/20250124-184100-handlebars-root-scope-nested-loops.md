# Lesson: Handlebars @root.name for Nested Loop Component Names

**Date:** 2025-01-24
**Context:** Issue #151 - Phase 4 Template Generation Fix
**Severity:** normal
**UsedBy:** 0

## Context

Handlebars templates using `../name` inside nested `{{#each}}` blocks resolved to the parent loop context (e.g., variant name or prop name) instead of the root component name, generating incorrect JSX tags.

## Rule

**Use `@root.name` to reference top-level template variables inside nested Handlebars loops, not `../name`.**

## Why It Breaks

In Handlebars, `../` navigates UP the context stack. Inside nested loops:
- `../name` = parent loop's `name` (e.g., variant name)
- `@root.name` = template's root-level `name` (e.g., component name)

## Example

### ❌ Before (Broken)
```handlebars
{{!-- test.hbs --}}
{{#if variants}}
{{#each variants}}
describe('{{name}} variants', () => {
  {{#each options}}
  it('renders {{@key}} variant', () => {
    render(
      <{{pascalCase ../name}} {{../name}}="{{@key}}">
        {{!-- ❌ ../name resolves to variants[].name, not component name --}}
      </{{pascalCase ../name}}>
    );
  });
  {{/each}}
});
{{/each}}
{{/if}}
```

**Generated Output (WRONG):**
```tsx
// If component is Button, variant.name is "variant"
<variant variant="primary">  // ❌ Should be <Button variant="primary">
```

### ✅ After (Fixed)
```handlebars
{{!-- test.hbs --}}
{{#if variants}}
{{#each variants}}
describe('{{name}} variants', () => {
  {{#each options}}
  it('renders {{@key}} variant', () => {
    render(
      <{{pascalCase @root.name}} {{../name}}="{{@key}}">
        {{!-- ✅ @root.name always resolves to component name --}}
        {{!-- ✅ ../name correctly resolves to variants[].name for the prop --}}
      </{{pascalCase @root.name}}>
    );
  });
  {{/each}}
});
{{/each}}
{{/if}}
```

**Generated Output (CORRECT):**
```tsx
<Button variant="primary">  // ✅ Correct component tag and prop
```

## When to Use Each

| Reference | Use Case | Resolves To |
|-----------|----------|-------------|
| `{{name}}` | Current context | Loop item's `name` |
| `{{../name}}` | Parent context | One level up in context stack |
| `{{@root.name}}` | Top-level variable | Template root data's `name` |
| `{{@index}}` | Loop index | Current iteration number |
| `{{@key}}` | Object key | Current key in `{{#each obj}}` |

## Guardrails

- **Template Testing:** Generate test components and verify JSX tags match expected component names
- **Code Review:** Check all `../` references in nested loops—are they intentional or should be `@root.`?
- **Linting:** Consider custom linter for `.hbs` files that warns on `<{{pascalCase ../name}}>` patterns
- **Documentation:** Comment complex nested loops explaining which context each variable references
- **Use Explicit Names:** If ambiguous, rename loop variables: `{{#each variants as |v|}}` then use `{{v.name}}`

## Related

- CodeRabbit PR #190 critical issue: "Use root-scoped component name in nested blocks"
- [Handlebars documentation on `@root`](https://handlebarsjs.com/guide/expressions.html#path-expressions)
- Similar issue occurs in Mustache, Liquid, and other template engines with nested scopes

**Tags.** #handlebars #templates #nested-loops #scope-resolution #root-context #jsx-generation #phase-4
