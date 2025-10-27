---
title: 'Never Output Multiple JSON Objects in Bash Scripts - Breaks Parsing'
date: 2025-10-21
category: shell-scripting
tags: [json, bash, error-handling, structured-output]
severity: critical
---

## Problem

Outputting multiple JSON objects in sequence breaks JSON parsers:

```bash
# ❌ BUG: Outputs 2 JSON objects
if git diff --cached --quiet; then
  jq -n '{ error: "No staged changes", unstaged_files: [] }'

  if ! git diff --quiet; then
    UNSTAGED=$(git diff --name-only | jq -R . | jq -s .)
    jq -n --argjson files "$UNSTAGED" '{
      error: "No staged changes",
      unstaged_files: $files
    }'
  fi
  exit 1
fi

# Output when unstaged files exist:
# {"error":"No staged changes","unstaged_files":[]}
# {"error":"No staged changes","unstaged_files":["app.ts","test.ts"]}
# ^ TWO JSON objects! Parser fails.
```

## Why It Breaks

```javascript
// JavaScript consumer
const output = execSync('script.sh').toString();
JSON.parse(output);
// ❌ SyntaxError: Unexpected token { in JSON at position 50
```

JSON parsers expect **one** top-level value per parse call. Multiple objects aren't valid JSON.

## Solution

Structure logic to ensure **exactly one** JSON output:

```bash
# ✅ CORRECT: Single JSON output
if git diff --cached --quiet; then
  # Compute data first
  if ! git diff --quiet; then
    UNSTAGED=$(git diff --name-only | jq -R . | jq -s .)
  else
    UNSTAGED="[]"
  fi

  # Single output at end
  jq -n --argjson files "$UNSTAGED" '{
    status: "error",
    error: "No staged changes",
    suggestion: "Stage files with: git add <files>",
    unstaged_files: $files
  }'
  exit 1
fi

# Output (valid JSON):
# {"status":"error","error":"No staged changes","unstaged_files":["app.ts"]}
```

## Pattern: Compute First, Output Last

```bash
#!/bin/bash
# ✅ GOOD PATTERN

# 1. Gather all data
ERROR_MSG=""
DATA="{}"
if [[ condition ]]; then
  ERROR_MSG="Something failed"
  DATA=$(compute_data)
fi

# 2. Single JSON output at end
jq -n \
  --arg error "$ERROR_MSG" \
  --argjson data "$DATA" \
  '{
    status: (if ($error | length) > 0 then "error" else "success" end),
    error: (if ($error | length) > 0 then $error else null end),
    data: $data
  }'
```

## Common Mistake Patterns

### Pattern 1: Output in Both Branches

```bash
# ❌ BAD: Outputs twice
if [[ condition ]]; then
  jq -n '{ error: "failed" }'
  jq -n '{ details: "more info" }'  # Second output!
fi
```

### Pattern 2: Overlapping Conditionals

```bash
# ❌ BAD: Nested conditions both output
if [[ condition1 ]]; then
  jq -n '{ error: "first" }'

  if [[ condition2 ]]; then
    jq -n '{ error: "second" }'  # Second output!
  fi
fi
```

### Pattern 3: Output Before Exit

```bash
# ❌ BAD: Outputs twice when unstaged changes exist
jq -n '{ error: "no staged" }'

if has_unstaged; then
  jq -n '{ error: "no staged", files: [...] }'  # Second output!
fi
exit 1
```

## Detection Checklist

When reviewing bash scripts outputting JSON:

1. ✅ Count all `jq -n` calls in each code path
2. ✅ Check `if/else` branches - do both output JSON?
3. ✅ Look for sequential `echo "{...}"` commands
4. ✅ Verify only one JSON output before each `exit`
5. ✅ Test script with all conditional branches

## Why This Matters

- **Parser failures**: Consumers can't parse multiple JSON objects
- **Silent errors**: With `|| true`, second object ignored silently
- **API contracts**: Skills architecture expects single JSON response
- **Debugging nightmare**: Hard to spot without careful testing

## Testing Strategy

```bash
# Test all code paths
./script.sh 2>&1 | jq . # Should succeed
./script.sh 2>&1 | jq -s . # If this works but previous fails, multiple objects!

# Count JSON objects
./script.sh 2>&1 | jq -s 'length' # Should output: 1
```

## Files Fixed

- `scripts/skills/git/commit.sh:11-28`

## Related Patterns

- Use `--slurp` (`-s`) in jq if you intentionally need multiple objects: `jq -s '.'`
- For streaming JSON, use newline-delimited JSON (NDJSON) format
- For structured logs, output one JSON per line with explicit line breaks

## References

- [JSON Specification](https://www.json.org/)
- [NDJSON (Newline Delimited JSON)](http://ndjson.org/)
- [jq Manual: Multiple Inputs](https://jqlang.github.io/jq/manual/#multiple-inputs)
