# Robust YAML Field Matching with grep

**Pattern:** Brittle grep patterns for YAML fields that fail with extra whitespace or formatting variations.

**Context:** YAML allows flexible whitespace around colons and values, so exact pattern matching often fails.

## Problem

```bash
# Brittle - fails with extra spaces or indentation
ARTIFACT_FILE=$(find specs -name "*.md" -exec grep -l "^id: $ref$" {} \; 2>/dev/null || true)

# Fails on:
# "  id: SPEC-001  " (leading/trailing spaces)
# "id : SPEC-001" (space before colon)
# "	id:	SPEC-001" (tabs instead of spaces)
```

## Solution

```bash
# Robust - tolerates whitespace variations + better performance
ARTIFACT_FILE=$(grep -RIl -E -- "^[[:space:]]*id[[:space:]]*:[[:space:]]*${ref}[[:space:]]*$" specs 2>/dev/null || true)
```

## Improvements Made

- **`[[:space:]]*`**: Matches any amount of whitespace (spaces, tabs)
- **`grep -R`**: Recursive search instead of `find -exec` (better performance)
- **`grep -I`**: Skip binary files automatically
- **`grep -l`**: Return filename only (not matching lines)
- **`grep -E`**: Extended regex for better pattern support
- **`--`**: Prevents option interpretation if variable starts with `-`

## Benefits

- **Whitespace tolerant**: Works with varied YAML formatting
- **Better performance**: Direct recursive grep vs find+exec
- **Case insensitive option available**: Add `-i` flag if needed
- **Security**: `--` prevents injection attacks

## When to Apply

- YAML/frontmatter field extraction
- Configuration file parsing
- Any structured text pattern matching
- File content searches that need flexibility

## Pattern Breakdown

```bash
^[[:space:]]*     # Start of line + optional leading whitespace
id                # Literal "id"
[[:space:]]*      # Optional whitespace before colon
:                 # Literal colon
[[:space:]]*      # Optional whitespace after colon
${ref}            # The reference value (shell variable)
[[:space:]]*      # Optional trailing whitespace
$                 # End of line
```

**Estimated reading time:** 80 seconds
