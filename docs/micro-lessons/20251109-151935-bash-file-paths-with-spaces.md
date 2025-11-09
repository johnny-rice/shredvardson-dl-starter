---
title: Bash loops with file paths containing spaces
created: 2025-11-09
tags: [bash, ci, workflows, shell-scripts, validation]
context: PR #326 - Token Optimization Guard workflow failing on file paths with spaces
reuse_count: 0
effectiveness_score: 0
---

# Problem

GitHub Actions workflow failed with error when processing documentation files:

```text
/home/runner/work/_temp/30e0a0c5-fcbc-4edc-802b-0d3f017114ed.sh: line 6: docs/research/AI: No such file or directory
##[error]Process completed with exit code 1.
```

The bash script used command substitution with `find` in a `for` loop, which breaks on file paths containing spaces:

```bash
# ❌ BREAKS on paths with spaces
for doc in $(find docs/ -name "*.md" -type f); do
  lines=$(wc -l < "$doc")
  # Processing...
done
```

When `find` returns `docs/research/AI & Agents Discovery/file.md`, the unquoted expansion splits it into multiple words: `docs/research/AI`, `&`, `Agents`, `Discovery/file.md`.

## Solution

**Use null-delimited output with process substitution instead of command substitution:**

```bash
# ✅ SAFE for paths with spaces, newlines, and special characters
while IFS= read -r -d '' doc; do
  lines=$(wc -l < "$doc")
  # Processing...
done < <(find docs/ -name "*.md" -type f -print0)
```

### How It Works

1. **`find ... -print0`**: Uses null byte (`\0`) as delimiter instead of newline
2. **`read -r -d ''`**: Reads until null byte (empty string = null in bash)
3. **`IFS=`**: Prevents word splitting on whitespace
4. **`< <(...)`**: Process substitution feeds find output to while loop

This is the **canonical safe pattern** for iterating over file paths in bash.

## Alternative (Array-Based)

For simpler cases without special characters in filenames:

```bash
# ✅ SAFE using arrays (bash 4.0+)
readarray -d '' files < <(find docs/ -name "*.md" -type f -print0)
for doc in "${files[@]}"; do
  lines=$(wc -l < "$doc")
  # Processing...
done
```

## Guardrails

1. **Never use `for file in $(find ...)`** - Always breaks on spaces
2. **Never use backtick command substitution** - Same problem, older syntax
3. **Always use `-print0` with `find`** when paths might have spaces
4. **Always use `read -d ''`** to consume null-delimited output
5. **Test with paths containing spaces** - Create test files like `test file.txt`

## When This Matters

- CI/CD workflows processing file lists
- Build scripts iterating over source files
- Documentation generation from markdown files
- Any automation dealing with user-generated filenames

## Related

- ShellCheck warning SC2045: "Iterating over ls/find output is fragile"
- Bash Pitfalls: [#1 for f in $(ls *.mp3)](https://mywiki.wooledge.org/BashPitfalls#for_f_in_.24.28ls_.2A.mp3.29)
- POSIX recommendation: Always quote variable expansions
