#!/usr/bin/env bash
set -euo pipefail

echo "[spec-gate] Running spec-driven development validation..."

# Get PR body if available
PR_BODY=""
if [ -n "${GITHUB_EVENT_PATH:-}" ] && [ -f "${GITHUB_EVENT_PATH}" ]; then
  PR_BODY=$(jq -r '.pull_request.body // ""' "${GITHUB_EVENT_PATH}" 2>/dev/null || echo "")
fi

# Check if this is a spec-driven PR (references SPEC-, PLAN-, or TASK-)
SPEC_REFS=$(printf "%s" "$PR_BODY" | grep -oE '(SPEC|PLAN|TASK)-[0-9]{8}-[A-Za-z0-9_-]+' | sort -u || true)

if [ -z "$SPEC_REFS" ]; then
  echo "[spec-gate] ✅ No spec references found - lightweight PR, no spec validation required"
  exit 0
fi

echo "[spec-gate] 📋 Found spec references: $SPEC_REFS"

# Validate each referenced artifact exists
EXIT_CODE=0
for ref in $SPEC_REFS; do
  TYPE=$(echo "$ref" | cut -d'-' -f1 | tr '[:upper:]' '[:lower:]')
  
  case "$TYPE" in
    "spec")
      if [ ! -d "specs" ]; then
        echo "[spec-gate] ❌ ERROR: Referenced $ref but specs/ directory doesn't exist"
        EXIT_CODE=1
        continue
      fi
      ARTIFACT_FILE=$(grep -RIl -E -- "^[[:space:]]*id[[:space:]]*:[[:space:]]*${ref}[[:space:]]*$" specs 2>/dev/null || true)
      ;;
    "plan")
      if [ ! -d "plans" ]; then
        echo "[spec-gate] ❌ ERROR: Referenced $ref but plans/ directory doesn't exist"
        EXIT_CODE=1
        continue
      fi
      ARTIFACT_FILE=$(grep -RIl -E -- "^[[:space:]]*id[[:space:]]*:[[:space:]]*${ref}[[:space:]]*$" plans 2>/dev/null || true)
      ;;
    "task")
      if [ ! -d "tasks" ]; then
        echo "[spec-gate] ❌ ERROR: Referenced $ref but tasks/ directory doesn't exist"
        EXIT_CODE=1
        continue
      fi
      ARTIFACT_FILE=$(grep -RIl -E -- "^[[:space:]]*id[[:space:]]*:[[:space:]]*${ref}[[:space:]]*$" tasks 2>/dev/null || true)
      ;;
    *)
      echo "[spec-gate] ❌ ERROR: Unknown artifact type in reference: $ref"
      EXIT_CODE=1
      continue
      ;;
  esac
  
  if [ -z "$ARTIFACT_FILE" ]; then
    echo "[spec-gate] ❌ ERROR: Referenced artifact $ref not found in ${TYPE}s/ directory"
    EXIT_CODE=1
  else
    echo "[spec-gate] ✅ Found artifact: $ref → $ARTIFACT_FILE"
  fi
done

# Run traceability validation if we have spec directories
if [ -d "specs" ] || [ -d "plans" ] || [ -d "tasks" ]; then
  echo "[spec-gate] 🔗 Running traceability validation..."
  
  # Guard against missing pnpm/tsx in CI environments
  if command -v pnpm >/dev/null 2>&1; then
    if ! pnpm tsx scripts/validate-traceability.ts; then
      echo "[spec-gate] ❌ ERROR: Traceability validation failed"
      EXIT_CODE=1
    else
      echo "[spec-gate] ✅ Traceability validation passed"
    fi
  elif command -v npx >/dev/null 2>&1; then
    echo "[spec-gate] ℹ️ pnpm not found, using npx tsx fallback"
    if ! npx -y tsx scripts/validate-traceability.ts; then
      echo "[spec-gate] ❌ ERROR: Traceability validation failed"
      EXIT_CODE=1
    else
      echo "[spec-gate] ✅ Traceability validation passed"
    fi
  else
    echo "[spec-gate] ⚠️ WARNING: Neither pnpm nor npx available, skipping traceability validation"
  fi
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "[spec-gate] ✅ All spec-gate validations passed"
  
  # Output traceability summary for GitHub
  if [ -n "$SPEC_REFS" ]; then
    TRACEABILITY_SUMMARY="## 📋 Spec Traceability
This PR references the following artifacts:"
    
    for ref in $SPEC_REFS; do
      TRACEABILITY_SUMMARY="$TRACEABILITY_SUMMARY
- \`$ref\`"
    done
    
    # Output to console
    echo "$TRACEABILITY_SUMMARY"
    
    # Also write to GitHub Step Summary if available
    if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
      echo "$TRACEABILITY_SUMMARY" >> "$GITHUB_STEP_SUMMARY"
    fi
  fi
else
  echo "[spec-gate] ❌ Spec-gate validation failed"
fi

exit $EXIT_CODE