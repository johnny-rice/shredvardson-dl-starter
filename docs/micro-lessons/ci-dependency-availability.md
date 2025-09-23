# CI Dependency Availability Guards

**Pattern:** Scripts failing in CI environments due to missing dependencies like `pnpm`, `tsx`, or `npx`.

**Context:** CI environments may have different tool availability than local development, requiring graceful fallbacks.

## Problem
```bash
# Brittle - fails if pnpm unavailable
pnpm tsx scripts/validate-traceability.ts
```

## Solution
```bash
# Robust - checks availability and provides fallbacks
if command -v pnpm >/dev/null 2>&1; then
  pnpm tsx scripts/validate-traceability.ts
elif command -v npx >/dev/null 2>&1; then
  echo "ℹ️ pnpm not found, using npx tsx fallback"
  npx -y tsx scripts/validate-traceability.ts
else
  echo "⚠️ WARNING: Neither pnpm nor npx available, skipping"
fi
```

## Benefits
- **Resilience**: Scripts work across different CI environments
- **Clarity**: Clear messaging about fallback behavior
- **Graceful degradation**: Operations continue with warnings rather than hard failures

## When to Apply
- Any CI script using package managers or CLI tools
- Scripts that might run in constrained environments
- Cross-platform compatibility requirements

**Estimated reading time:** 60 seconds