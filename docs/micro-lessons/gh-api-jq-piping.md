# Use External jq with gh api Commands

## Summary

When you need jq variables (`--arg`) or multi‑line filters, pipe `gh api` output to an external `jq` process instead of using `gh api --jq`.

## When to use

- Use when the jq filter needs variables (`--arg`/`--slurpfile`) or formatting not supported by `gh api --jq`.
- Avoid when a simple, variable‑free jq filter suffices; `--jq` is fine for that.

## Problem

`gh api --jq --arg` is invalid syntax. The `--jq` flag doesn't accept `--arg` parameters, causing commands to silently fail and fall back to error handling.

## Solution

Pipe `gh api` output to external `jq` instead of using the built-in `--jq` flag when you need `--arg`:

```bash
# ❌ Invalid: gh api --jq doesn't accept --arg
AI_CONTENT=$(gh api repos/owner/repo/issues/123/comments \
  --jq --arg sha "$SHA" '.[] | select(.body | contains($sha))' || true)

# ✅ Correct: pipe to external jq
AI_CONTENT=$(gh api repos/owner/repo/issues/123/comments 2>/dev/null \
  | jq -r --arg sha "$SHA" '.[]
    | select(.body|contains($sha))
    | .body' || true)
```

## Key Changes

- Move `2>/dev/null` to `gh api` command
- Pipe output to external `jq -r`
- Use `--arg` with external jq
- Format multiline jq for readability
- Consider `--paginate` for list endpoints to avoid partial results

## Context

- `gh api --jq` is a convenience wrapper but has limitations
- External jq provides full functionality including variables
- Silent failures can mask configuration issues

**Tags:** `github-cli,jq,api,json-processing,shell,coderabbit`
