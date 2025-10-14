# Quality Gates & Pipeline

## Table of Contents

- [Overview](#overview)
- [Exact Merge Gates](#exact-merge-gates)
- [Individual Gates](#individual-gates)
- [What "Green Lights" Mean](#what-green-lights-mean)
- [Red Zone (AI Must Not Touch)](#red-zone-ai-must-not-touch)
- [Failure Handling](#failure-handling)

## Overview

Our quality pipeline ensures code reliability, security, and maintainability through automated checks. All changes must pass these gates before merge.

## Exact Merge Gates

**Required for ALL merges:**

1. **`pnpm doctor`** - Project health and compliance (includes learnings index & metrics) ✅
2. **`pnpm typecheck`** - TypeScript compilation ✅
3. **`pnpm lint`** - Code style and standards ✅
4. **`pnpm test:unit`** - Unit test coverage ✅
5. **`pnpm test:e2e`** - End-to-end user flows ✅ (if applicable; infra/docs-only PRs may mark N/A)
6. **`pnpm build`** - Production build verification ✅
7. **Human review** - Manual approval required ✅ (always)

**CI Jobs that must pass:**

- **ci** – Main build pipeline (lint, typecheck, unit tests, build)
- **doctor** – Repository health validation
- **spec-gate** – Specification and governance checks
- **e2e** – End-to-end test pipeline (if applicable)

## Individual Gates

### Doctor (`pnpm doctor`)

**Purpose**: Comprehensive project health check  
**Checks**:

- All referenced scripts/paths exist
- No broken internal links
- Command inventory is up-to-date
- Constitution checksum validation
- Environment configuration validity
- Learnings index present and up-to-date
- LEARNINGS_STATS JSON emitted with:
  - micro_lessons_total
  - top10_updated_at (ISO‑8601 UTC)
  - display_guard_violations_last_7d
- Staleness policy: warn if `top10_updated_at` > 24h (non‑blocking)

**Green Light**: All references valid, no broken links, configs current; learnings index healthy; LEARNINGS_STATS JSON well‑formed (ISO‑8601), staleness ≤ 24h (or advisory warning acknowledged)

### TypeScript (`pnpm typecheck`)

**Purpose**: Type safety and compilation verification  
**Checks**:

- No TypeScript compilation errors
- Strict type checking compliance
- No `any` types in new code
- Import/export correctness

**Green Light**: Clean TypeScript compilation, full type safety

### Linting (`pnpm lint`)

**Purpose**: Code style, best practices, and consistency
**Checks**:

- ESLint rule compliance
- Import organization
- Unused variable detection
- Code formatting standards
- Security-related patterns

**Green Light**: No linting errors, consistent code style

#### ESLint Semantic Rules

The project enforces semantic coding standards through ESLint:

**Naming Conventions** (`@typescript-eslint/naming-convention`):

- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Type parameters: `T`, `K`, `V` (single uppercase letter)

**Code Quality Rules**:

- `@typescript-eslint/no-unused-vars` - Prevents dead code
- `@typescript-eslint/no-explicit-any` - Enforces type safety
- `prefer-const` - Immutability by default

**Why Semantic Rules Matter**:

- Improve code readability and maintainability
- Catch bugs before runtime (unused variables, unsafe `any` types)
- Enforce team conventions automatically
- Reduce cognitive load during code review

See [eslint-semantic-rules.md](../micro-lessons/eslint-semantic-rules.md) for implementation details.

### Unit Tests (`pnpm test:unit`)

**Purpose**: Component and function-level testing  
**Checks**:

- All unit tests pass
- Minimum coverage thresholds met
- Test isolation maintained
- Mock dependencies working

**Green Light**: 100% test pass rate, coverage targets met

### E2E Tests (`pnpm test:e2e`)

**Purpose**: User journey and integration testing  
**Checks**:

- Critical user flows work end-to-end
- Page rendering and navigation
- Form submissions and interactions
- Cross-browser compatibility

**Green Light**: All impacted user journeys complete successfully  
Note: Infra/docs-only PRs may mark this gate N/A.

### Build Verification (`pnpm build`)

**Purpose**: Production build success and optimization  
**Checks**:

- Clean production build
- Bundle size limits
- Asset optimization
- Environment configuration
- Runtime error prevention

**Green Light**: Successful production build, optimized assets

## What "Green Lights" Mean

### ✅ All Checks Passing

- Code is ready for production deployment
- Meets all quality and security standards
- Safe to merge to main branch
- No breaking changes introduced

### ⚠️ Advisory Warnings

- Non-blocking issues identified (from AI scans)
- Recommendations for improvement
- Style or performance suggestions
- Future maintenance considerations

### ❌ Blocking Failures

- **Must be fixed before merge**
- Breaks existing functionality
- Security vulnerabilities present
- Quality standards not met

## Red Zone (AI Must Not Touch)

**AI agents are PROHIBITED from modifying:**

- `.github/workflows/**` - CI/CD pipeline configurations
- `scripts/release/**` - Release and deployment scripts
- `.env*` files - Environment configurations
- `**/.env*` files - Any environment files
- Database migration files
- Production configuration files
- Security policy definitions

**Allowed AI modification paths:**

- `apps/` - Application code
- `packages/` - Shared packages
- `docs/**` - Documentation
- Test files and specifications

## Failure Handling

### Common Failure Patterns

**TypeScript Errors**:

```bash
pnpm typecheck
# Review and resolve all type errors
```

**Linting Issues**:

```bash
pnpm lint --fix  # Auto-fix where possible
# Manually resolve remaining issues
```

**Test Failures**:

```bash
pnpm test:unit --verbose
# Fix failing tests or update snapshots
```

**Build Failures**:

```bash
pnpm build
# Review bundle analysis and fix imports
```

### Recovery Strategies

1. **Incremental Fixes**: Address one gate at a time
2. **Rollback Changes**: Revert to last working state if needed
3. **Isolation Testing**: Test components in isolation
4. **Dependency Updates**: Ensure all packages are current

---

_Quality gates ensure reliable, secure, and maintainable code while supporting rapid development velocity. See Principles in [WIKI-Home](./WIKI-Home.md) for project philosophy._
