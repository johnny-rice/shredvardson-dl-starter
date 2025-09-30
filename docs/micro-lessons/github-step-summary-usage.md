# GitHub Step Summary for Enhanced CI UX

**Pattern:** CI scripts outputting important information only to console logs, making it hard for developers to find key details.

**Context:** GitHub Actions provides `$GITHUB_STEP_SUMMARY` for displaying structured information in the Actions UI.

## Problem

```bash
# Information buried in console output
echo "## 📋 Spec Traceability"
echo "This PR references: SPEC-20250923-feature"
```

## Solution

```bash
# Visible in both console and GitHub UI
SUMMARY="## 📋 Spec Traceability
This PR references: SPEC-20250923-feature"

# Output to console
echo "$SUMMARY"

# Also write to GitHub Step Summary if available
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "$SUMMARY" >> "$GITHUB_STEP_SUMMARY"
fi
```

## Benefits

- **Visibility**: Key information surfaces in GitHub Actions UI
- **Developer experience**: No need to dig through console logs
- **Structured presentation**: Markdown formatting in GitHub interface

## When to Apply

- CI scripts generating validation summaries
- Traceability or compliance reporting
- Any information developers need to see quickly

**Estimated reading time:** 45 seconds
