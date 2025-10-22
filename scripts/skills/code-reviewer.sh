#!/bin/bash
set -euo pipefail

# Code Reviewer Skill
# Automated code quality checks

AUTO_FIX=false
if [[ "${1:-}" == "--fix" ]]; then
  AUTO_FIX=true
fi

# Initialize results
RESULTS='{
  "status": "success",
  "checks": [],
  "recommendations": [],
  "blocking_issues": [],
  "warnings": []
}'

# Track overall status
HAS_ERRORS=false
HAS_WARNINGS=false

echo "Running code quality checks..." >&2

# 1. TypeScript Check
echo "→ TypeScript..." >&2
if pnpm typecheck >/dev/null 2>&1; then
  RESULTS=$(echo "$RESULTS" | jq '.checks += [{
    "name": "TypeScript",
    "status": "pass",
    "message": "No type errors found"
  }]')
else
  HAS_ERRORS=true
  TS_ERRORS=$(pnpm typecheck 2>&1 || true)
  ERROR_COUNT=$(echo "$TS_ERRORS" | grep -c "error TS" || echo "0")
  RESULTS=$(echo "$RESULTS" | jq --arg count "$ERROR_COUNT" '.checks += [{
    "name": "TypeScript",
    "status": "fail",
    "message": ($count + " type errors found"),
    "details": "Run: pnpm typecheck"
  }] | .blocking_issues += ["TypeScript errors must be fixed"]')
fi

# 2. ESLint Check
echo "→ ESLint..." >&2
if pnpm lint >/dev/null 2>&1; then
  RESULTS=$(echo "$RESULTS" | jq '.checks += [{
    "name": "ESLint",
    "status": "pass",
    "message": "No lint errors found"
  }]')
else
  if [[ "$AUTO_FIX" == "true" ]]; then
    echo "  Auto-fixing..." >&2
    if pnpm lint:fix >/dev/null 2>&1; then
      RESULTS=$(echo "$RESULTS" | jq '.checks += [{
        "name": "ESLint",
        "status": "fixed",
        "message": "Auto-fixed lint issues"
      }]')
    else
      HAS_WARNINGS=true
      RESULTS=$(echo "$RESULTS" | jq '.checks += [{
        "name": "ESLint",
        "status": "fail",
        "message": "Some lint errors could not be auto-fixed",
        "details": "Run: pnpm lint"
      }] | .warnings += ["Manual lint fixes may be needed"]')
    fi
  else
    HAS_WARNINGS=true
    RESULTS=$(echo "$RESULTS" | jq '.checks += [{
      "name": "ESLint",
      "status": "fail",
      "message": "Lint errors found",
      "details": "Run: pnpm lint"
    }] | .warnings += ["Run with --fix flag to auto-fix"] | .recommendations += ["pnpm lint:fix"]')
  fi
fi

# 3. Tests Check
echo "→ Tests..." >&2
if pnpm test:ci-scripts >/dev/null 2>&1; then
  RESULTS=$(echo "$RESULTS" | jq '.checks += [{
    "name": "Tests",
    "status": "pass",
    "message": "All tests passing"
  }]')
else
  HAS_ERRORS=true
  RESULTS=$(echo "$RESULTS" | jq '.checks += [{
    "name": "Tests",
    "status": "fail",
    "message": "Some tests failing",
    "details": "Run: pnpm test"
  }] | .blocking_issues += ["Failing tests must be fixed"]')
fi

# 4. Coverage Check (if tests pass)
if [[ "$HAS_ERRORS" == "false" ]]; then
  echo "→ Coverage..." >&2
  COVERAGE_OUTPUT=$(pnpm test:coverage --silent 2>&1 || true)
  COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep -oP '\d+\.\d+(?=%)' | head -1 || echo "0")

  # Use awk for portable numeric comparison (no bc dependency)
  if awk -v cov="$COVERAGE" 'BEGIN { exit (cov >= 70 ? 0 : 1) }'; then
    RESULTS=$(echo "$RESULTS" | jq --arg cov "$COVERAGE" '.checks += [{
      "name": "Coverage",
      "status": "pass",
      "message": ("Coverage: " + $cov + "%")
    }]')
  else
    HAS_WARNINGS=true
    RESULTS=$(echo "$RESULTS" | jq --arg cov "$COVERAGE" '.checks += [{
      "name": "Coverage",
      "status": "fail",
      "message": ("Coverage: " + $cov + "% (target: 70%)")
    }] | .warnings += ["Coverage below target"] | .recommendations += ["Add more tests to reach 70% coverage"]')
  fi
fi

# 5. Build Check
echo "→ Build..." >&2
if pnpm build >/dev/null 2>&1; then
  RESULTS=$(echo "$RESULTS" | jq '.checks += [{
    "name": "Build",
    "status": "pass",
    "message": "Build successful"
  }]')
else
  HAS_ERRORS=true
  RESULTS=$(echo "$RESULTS" | jq '.checks += [{
    "name": "Build",
    "status": "fail",
    "message": "Build failed",
    "details": "Run: pnpm build"
  }] | .blocking_issues += ["Build errors must be fixed"]')
fi

# Set final status
if [[ "$HAS_ERRORS" == "true" ]]; then
  RESULTS=$(echo "$RESULTS" | jq '.status = "error"')
elif [[ "$HAS_WARNINGS" == "true" ]]; then
  RESULTS=$(echo "$RESULTS" | jq '.status = "warning"')
fi

# Add next steps
if [[ "$HAS_ERRORS" == "true" ]]; then
  RESULTS=$(echo "$RESULTS" | jq '.next_steps = [
    "Fix blocking issues listed above",
    "Re-run /code review to verify"
  ]')
elif [[ "$HAS_WARNINGS" == "true" ]]; then
  RESULTS=$(echo "$RESULTS" | jq '.next_steps = [
    "Address warnings (non-blocking)",
    "Proceed with /git pr prepare if ready"
  ]')
else
  RESULTS=$(echo "$RESULTS" | jq '.next_steps = [
    "All checks passed!",
    "Ready for /git pr prepare"
  ]')
fi

# Output results
echo "$RESULTS" | jq '.'

# Exit with appropriate code
if [[ "$HAS_ERRORS" == "true" ]]; then
  exit 1
fi
