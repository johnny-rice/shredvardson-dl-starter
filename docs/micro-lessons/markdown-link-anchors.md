# Handle Anchors and Query Params in Markdown Link Checking

## Problem
Doc link checkers fail when markdown links include anchors (`#section`) or query parameters (`?param=value`) because they treat the entire string as a file path.

## Solution
Strip anchors and query parameters before checking file existence:

```typescript
// Before: fails on [link](file.md#section)
const linkPath = match[2];
if (!existsSync(resolve(dirname(file), linkPath))) {
  // Error: file.md#section doesn't exist
}

// After: handles anchors and queries correctly
const linkPath = match[2];
const cleanPath = linkPath.split('#')[0].split('?')[0];
if (cleanPath.endsWith('.md') && !cleanPath.startsWith('http')) {
  const absolutePath = resolve(dirname(file), cleanPath);
  if (!existsSync(absolutePath)) {
    brokenLinks.push(`${file}: ${linkPath}`);
  }
}
```

## Context
- Common in documentation with deep-linked sections
- File existence check should ignore URL fragments
- Preserve original link in error messages for debugging

**Tags:** `markdown,links,anchors,url-fragments,file-checking,coderabbit`