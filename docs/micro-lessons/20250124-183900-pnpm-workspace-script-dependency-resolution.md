# Lesson: pnpm Workspace Script Dependency Resolution

**Date:** 2025-01-24
**Context:** Issue #151 - Phase 4 Component Generation Templates
**Severity:** high
**UsedBy:** 0

## Context

When running TypeScript scripts from the repository root via `pnpm tsx`, dependencies imported by those scripts must be resolvable from the root's `node_modules`. Scripts in `.claude/skills/design-system/scripts/` that import `handlebars` failed when it was only installed in `packages/ui/devDependencies`.

## Rule

**Scripts invoked from repo root must have their dependencies in root `devDependencies`, not nested package dependencies.**

## Why It Fails

pnpm's workspace hoisting doesn't guarantee that nested package devDependencies will be accessible to scripts run from the root context. When you run:

```bash
pnpm tsx .claude/skills/design-system/scripts/generate-component.ts
```

Node resolves modules from the current working directory's `node_modules`, NOT from `packages/ui/node_modules`.

## Example

### ❌ Before (Broken)

```json
// packages/ui/package.json
{
  "devDependencies": {
    "handlebars": "^4.7.8",
    "@types/handlebars": "^4.1.0"
  }
}
```

```typescript
// .claude/skills/design-system/scripts/generate-component.ts
import Handlebars from 'handlebars'; // ❌ Error: Cannot find module 'handlebars'
```

### ✅ After (Fixed)

```json
// package.json (root)
{
  "devDependencies": {
    "handlebars": "^4.7.8",
    "@types/handlebars": "^4.1.0"
  }
}
```

```typescript
// .claude/skills/design-system/scripts/generate-component.ts
import Handlebars from 'handlebars'; // ✅ Resolves from root node_modules
```

## Guardrails

- **Audit script locations:** If scripts live outside packages and are invoked from root, their deps go in root
- **Test clean installs:** `rm -rf node_modules && pnpm install` to verify resolution works
- **Check package manager docs:** Understand hoisting behavior for your package manager (pnpm, npm, yarn)
- **Use workspace protocol sparingly:** `workspace:*` for internal packages only, not for external deps used by scripts
- **Document in package.json:** Add comment explaining why certain deps are at root

## Related

- CodeRabbit PR #190 review (caught this during clean install simulation)
- pnpm workspace documentation on module resolution
- Similar issue can occur with CLI tools, build scripts, git hooks

**Tags.** #pnpm #workspace #monorepo #dependency-resolution #typescript #scripts #hoisting #phase-4
