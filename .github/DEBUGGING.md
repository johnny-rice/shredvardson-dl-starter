# CI Debugging Guide

Quick reference for debugging CI failures locally.

**Purpose:** Enable developers to debug and fix CI failures without reading workflow YAML files.

**Usage:** When CI fails, run the referenced local command to reproduce the issue.

---

## Table of Contents

- [Spec Validation](#spec-validation)
- [Spec Lane Check](#spec-lane-check)
- [TypeScript Errors](#typescript-errors)
- [Linting Errors](#linting-errors)
- [Test Failures](#test-failures)
- [Build Failures](#build-failures)
- [AI Review Scraping](#ai-review-scraping)
- [General Debugging Tips](#general-debugging-tips)

---

## Spec Validation

### Error: "Spec directory does not follow naming convention"

**Local Test:**

```bash
pnpm run specs:validate
```

**Common Causes:**

- Spec directory not named with `###-name` format
- Missing leading zeros (e.g., `1-test` instead of `001-test`)
- Invalid characters in directory name

**Fix:**

```bash
# Rename spec directory to follow convention
mv specs/bad-name specs/001-good-name

# Or create new spec with correct naming
mkdir specs/002-new-feature
```

---

### Error: "Missing required file"

**Local Test:**

```bash
pnpm run specs:validate
```

**Common Causes:**

- Missing `README.md` in spec directory
- Missing `DESIGN.md` in spec directory
- Files in wrong location

**Fix:**

```bash
# Create missing files
cd specs/001-feature
touch README.md DESIGN.md

# Or use spec template
pnpm run new-spec
```

---

### Error: "Spec README.md missing proper header"

**Local Test:**

```bash
pnpm run specs:validate
```

**Common Causes:**

- README doesn't start with `# Spec`
- Missing YAML frontmatter
- Incorrect heading format

**Fix:**

```markdown
---
id: SPEC-YYYYMMDD-feature-name
type: spec
---

# Spec: Feature Name

Status: Draft
```

---

### Error: "Spec README.md missing status field"

**Local Test:**

```bash
pnpm run specs:validate
```

**Common Causes:**

- No `Status:` field in README
- Status field misspelled
- Status field in wrong location

**Fix:**

```markdown
# Spec: Feature Name

Status: Draft

## Overview

...
```

**Valid Status Values:** Draft, In Progress, Implemented, Archived

---

## Spec Lane Check

### Error: "Unable to detect spec lane"

**Local Test:**

```bash
pnpm run specs:check-lane
```

**Common Causes:**

- Spec file doesn't exist
- No spec content changes in current PR
- File path incorrect

**Fix:**

```bash
# Check if spec file exists
ls -la specs/SPEC-*.md

# Run with explicit file path
pnpm run specs:check-lane specs/SPEC-20251015-feature.md

# Or check git changes
git diff --name-only HEAD | grep specs/
```

---

## TypeScript Errors

### Error: "Type check failed"

**Local Test:**

```bash
pnpm run typecheck
```

**Common Causes:**

- Type mismatches
- Missing type imports
- Incorrect generic types
- Using `any` type

**Fix:**

```bash
# Run typecheck and review errors
pnpm run typecheck

# Check specific package
pnpm --filter=web typecheck
pnpm --filter=@shared/db typecheck

# Fix reported errors
# Re-run to verify
pnpm run typecheck
```

**Tips:**

- Read error message carefully (shows file:line:column)
- Check import statements
- Verify type definitions exist
- Use TypeScript's quick fixes in IDE

---

## Linting Errors

### Error: "Lint check failed"

**Local Test:**

```bash
pnpm run lint
```

**Common Causes:**

- Code style violations
- Unused imports
- Console.log statements
- Missing semicolons/trailing commas

**Fix:**

```bash
# Auto-fix most issues
pnpm run format

# Check remaining issues
pnpm run lint

# Fix specific package
pnpm --filter=web lint
```

**Tips:**

- Most issues can be auto-fixed with `pnpm run format`
- Some errors require manual fixes
- Check `.eslintrc` for project rules

---

## Test Failures

### Error: "Test suite failed"

**Local Test:**

```bash
pnpm run test
```

**Common Causes:**

- Broken test assertions
- Missing test fixtures
- Environment variable issues
- Database not running (for integration tests)

**Fix:**

```bash
# Run tests with verbose output
pnpm run test -- --reporter=verbose

# Run specific test file
pnpm run test -- path/to/test.test.ts

# Run specific test by name
pnpm run test -- -t "test name"

# For database tests, ensure Supabase is running
pnpm run db:start
pnpm run test
```

**Tips:**

- Read test failure message carefully
- Check test fixtures and mocks
- Verify environment variables
- Run tests in isolation to identify issues

---

## Build Failures

### Error: "Build failed"

**Local Test:**

```bash
pnpm run build
```

**Common Causes:**

- Missing dependencies
- Import path errors
- Configuration issues
- TypeScript errors (build includes typecheck)

**Fix:**

```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build

# Build specific package
pnpm --filter=web build
pnpm --filter=@shared/db build

# Check for missing dependencies
pnpm install --frozen-lockfile
```

**Tips:**

- Build errors often indicate TypeScript or import issues
- Check that all dependencies are installed
- Verify import paths are correct
- Look for circular dependencies

---

## AI Review Scraping

### Error: "Failed to scrape AI reviews"

**Local Test:**

```bash
# Requires GitHub CLI authentication
gh auth status

# Run scraper
pnpm run ai:scrape-reviews
```

**Common Causes:**

- Not authenticated with GitHub CLI
- Missing PR context
- Insufficient permissions
- PR doesn't exist

**Fix:**

```bash
# Authenticate with GitHub CLI
gh auth login

# Verify authentication
gh auth status

# Try again
pnpm run ai:scrape-reviews

# Or specify PR number
pnpm run ai:scrape-reviews 123
```

**Tips:**

- Requires `gh` CLI tool installed
- Must be authenticated to GitHub
- Works in PR context or with explicit PR number

---

## General Debugging Tips

### 1. Always Test Locally First

All CI checks can be run locally. Test before pushing:

```bash
# Run all validations
pnpm run ci:validate     # Specs + lane check
pnpm run typecheck       # TypeScript
pnpm run lint            # Linting
pnpm run test            # Tests
pnpm run build           # Build
```

### 2. Check Environment

Ensure all required tools are installed:

```bash
# Check Node version
node --version  # Should be 20+

# Check pnpm
pnpm --version  # Should be 9.12.0

# Check GitHub CLI (for review scraping)
gh --version

# Check Supabase CLI (for database tests)
supabase --version
```

### 3. Review Recent Changes

Did your changes affect related files?

```bash
# See what you changed
git status
git diff

# See which files are staged
git diff --cached
```

### 4. Check Dependencies

If package.json changed, reinstall:

```bash
# Clean install
pnpm install --frozen-lockfile

# Or clean everything
pnpm run clean:install
```

### 5. Clear Caches

If seeing weird issues:

```bash
# Clear build caches
pnpm run clean:cache

# Reinstall
pnpm install

# Rebuild
pnpm run build
```

### 6. Check CI Logs

If local tests pass but CI fails:

1. Check GitHub Actions logs
2. Look for environment differences
3. Check if CI has required secrets/permissions

### 7. Read Error Messages Carefully

- Error messages include file:line:column information
- Follow stack traces from bottom to top
- Look for the actual error, not just symptoms

---

## Getting Help

If the above doesn't help:

1. **Check recent CI runs** for similar failures
2. **Review PR comments** for automated feedback
3. **Search docs** at `docs/` for relevant information
4. **Ask in team chat** with CI failure details

---

## Related Documentation

- [Token Optimization Guidelines](../docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md)
- [Testing Guide](../docs/testing/TESTING_GUIDE.md)
- [Constitution](../docs/constitution.md)

---

**Last Updated:** 2025-10-15
**Version:** 1.0.0
