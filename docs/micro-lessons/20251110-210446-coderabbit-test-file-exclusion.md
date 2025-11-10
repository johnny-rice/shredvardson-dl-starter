---
UsedBy: 0
Severity: high
---

# CodeRabbit Path Filters: Don't Exclude Test Files

**Context.** PR #363 added 270 security-critical tests but CodeRabbit skipped review because `.coderabbit.yml` excluded `!**/*.test.*` files.

**Rule.** **Test files are production code—never exclude them from automated code review.**

**Why It Matters:**

- Security-critical tests validate prompt injection, shell injection, and other attack vectors
- Test quality directly impacts confidence in the entire codebase
- False positives can create false confidence; false negatives hide real bugs
- Test logic errors are as dangerous as production code bugs

**Example.**

```yaml
# ❌ BAD: Excludes ALL test files from review
path_filters:
  - '!**/*.test.*'
  - '!**/*.spec.*'
  - 'packages/**'

# ✅ GOOD: Tests are reviewed like any other code
path_filters:
  - 'packages/**'  # Includes packages/**/*.test.ts
  - 'apps/**'
```

**Impact:** The 269 tests in PR #363 covering sanitization, validation, and security boundaries would have been skipped, missing potential issues in:

- Prompt injection prevention logic
- Credential sanitization correctness
- Path traversal prevention
- Shell injection mitigations

**Guardrails:**

- Review `.coderabbit.yml` path filters during setup
- Ensure test files match the same path patterns as source files
- Only exclude truly low-risk content (planning docs, examples)
- Test your path filters by checking what CodeRabbit reviews in a test PR

**Tags.** coderabbit,code-review,testing,security,configuration,issue-357,pr-363
