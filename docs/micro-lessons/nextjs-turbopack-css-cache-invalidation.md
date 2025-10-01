---
UsedBy: 0
Severity: high
# Severity: high - Prevents hours of debugging configuration when the real issue is stale cache
---

# Next.js/Turbopack CSS Cache Can Mask Configuration Issues

**Context.** After major CSS tooling changes (Tailwind v3↔v4, PostCSS plugins), dev server may serve stale compiled CSS while production builds work correctly. Utilities appear missing (`py-2`, `inline-flex` not generated) despite correct configuration.

**Rule.** **Always clear `.next`, `.turbo`, and `node_modules/.cache` after changing CSS build tooling (Tailwind version, PostCSS plugins) before debugging configuration.**

**Example.**

```bash
# ❌ BAD: Assuming configuration is wrong because dev server shows broken styles
# Leads to: Hours spent tweaking tailwind.config.ts, content paths, etc.

# ✅ GOOD: Use clean:cache script to clear all build caches
pnpm -w clean:cache  # Clears .next, .turbo, node_modules/.cache (use -w from subdirs)
pnpm dev

# Or combine with fresh install if dependencies changed
pnpm -w clean:install  # Clears caches + reinstalls dependencies

# Then verify with production build
pnpm build
grep -o "\.py-2\|\.inline-flex" apps/web/.next/static/**/*.css
```

**Guardrails.**

- After Tailwind version changes (v3↔v4), clear all three cache directories before testing
- When CSS utilities appear missing in dev but you're confident config is correct, try production build (`pnpm build`) to verify config correctness
- Next.js/Turbopack caches aggressive CSS compilation - dev server stale cache != broken configuration
- Add to debugging checklist: "Have I cleared build caches since my last major tooling change?"

**Tags.** nextjs,turbopack,tailwind,css,caching,dev-server,debugging,build-tools
