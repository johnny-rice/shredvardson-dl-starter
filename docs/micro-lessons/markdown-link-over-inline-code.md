# Prefer Clickable Links Over Inline Code for Existing Paths

## Problem
Using inline code backticks for existing directory/file references makes them non-clickable in markdown viewers, reducing navigation convenience.

## Solution
Convert inline code to clickable markdown links when referencing existing filesystem paths:

```markdown
// Before: not clickable
See `/prompts/tasks` for implementation guidance

// After: clickable navigation
See [prompts/tasks](../../prompts/tasks/) for implementation guidance
```

## When to Apply
- Path exists in the repository
- Reader benefit from clicking through to browse contents
- Context suggests navigation rather than literal code

## When NOT to Apply
- Command-line examples where backticks indicate literal typing
- Code snippets showing exact syntax
- Non-existent paths used as examples

## Context
- Improves documentation UX by enabling one-click navigation
- Particularly valuable for directories with multiple files to browse
- Maintains semantic meaning while adding functionality

**Tags:** `markdown,links,navigation,ux,filesystem,coderabbit`