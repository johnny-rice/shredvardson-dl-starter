# Pattern Guides Index

**Last Updated:** 2025-11-11
**Total Patterns:** 39 patterns across 8 guides
**Source:** 123 micro-lessons synthesized

## Overview

This directory contains comprehensive pattern guides that consolidate knowledge from 123 micro-lessons accumulated during development. Each guide promotes recurring patterns (2+ occurrences) and high-impact patterns into actionable, searchable documentation.

## Purpose

- **For Developers:** Quick reference for common patterns and best practices
- **For LLMs:** Structured knowledge for code generation and review
- **For Onboarding:** Comprehensive guide to project conventions
- **For Maintenance:** Consolidated wisdom to prevent recurring issues

## Pattern Guides

### 🔴 Critical Impact Guides

These patterns prevent security vulnerabilities, data loss, and critical failures.

#### 1. [Security Patterns](./security-patterns.md)

**Impact:** Critical - Prevents injection attacks, credential leaks, unauthorized access
**Lessons Synthesized:** 12
**Patterns:** 6

- Input Validation Before Processing
- Command Injection Prevention
- Secrets and Credential Protection
- SQL Injection Prevention
- RLS Policy Security
- Path Traversal Prevention

**Use When:** Handling user input, executing commands, database operations, logging

---

#### 2. [Bash Safety Patterns](./bash-safety-patterns.md)

**Impact:** Critical - Prevents CI/CD failures, security vulnerabilities, data corruption
**Lessons Synthesized:** 15
**Patterns:** 8

- File Paths with Spaces Handling
- JSON Output in Bash Scripts
- Command Injection Prevention
- ShellCheck Compliance
- Error Handling & Logging
- Configurable Timeouts
- Path Resolution & Verification
- Atomic File Operations

**Use When:** Writing bash scripts, CI/CD automation, file operations

---

#### 3. [Testing Patterns](./testing-patterns.md)

**Impact:** Critical - Prevents false positives/negatives, ensures test reliability
**Lessons Synthesized:** 8
**Patterns:** 7

- Test Isolation with Proper Cleanup
- Test Runner Exit Codes
- Supabase RLS Testing with Real JWT
- Mocking Best Practices
- CI Test Optimization
- Database Testing Patterns
- E2E Testing Best Practices

**Use When:** Writing tests, setting up CI, testing RLS policies

---

### 🟡 High Impact Guides

These patterns prevent common failures and improve developer experience.

#### 4. [Git Workflow Patterns](./git-workflow-patterns.md)

**Impact:** High - Prevents CI failures, merge conflicts, data loss
**Lessons Synthesized:** 10
**Patterns:** 7

- pnpm Lockfile Management
- Safe Git Operations with User Input
- Squash Merge Detection
- Handling Untracked Files in Diffs
- Phase-Based PR Strategy
- GitHub Actions PR Context
- Constitution/Artifact Regeneration

**Use When:** Working with git, managing PRs, handling lockfiles

---

#### 5. [CI/CD Patterns](./ci-cd-patterns.md)

**Impact:** High - Improves CI reliability, developer experience
**Lessons Synthesized:** 9
**Patterns:** 6

- Lefthook + Biome Quality Gates
- GitHub Actions Reliability
- Configurable Timeouts
- Comprehensive Pre-Push Validation
- Dependency Availability Guards
- pnpm Lockfile Management

**Use When:** Setting up CI/CD, configuring pre-commit hooks, optimizing workflows

---

#### 6. [React Patterns](./react-patterns.md)

**Impact:** High - Prevents build failures, ensures accessibility
**Lessons Synthesized:** 10
**Patterns:** 6

- Next.js App Router 'use client' Directive
- Accessibility-First Component Design
- Component Type Safety
- Framer Motion Accessibility
- Form State Management
- Component Quality Patterns

**Use When:** Building React components, Next.js applications, accessible UIs

---

### 🟢 Medium Impact Guides

These patterns improve code quality and maintainability.

#### 7. [TypeScript Patterns](./typescript-patterns.md)

**Impact:** Medium - Improves type safety, prevents runtime errors
**Lessons Synthesized:** 7
**Patterns:** 7

- Proper execSync Error Typing
- Precise Event Handler Types
- Interface Method Type Precision
- JavaScript typeof null Quirk
- Iterator Consumption
- ESM Module Compatibility
- Type Guards and Runtime Validation

**Use When:** Writing TypeScript, handling errors, working with events

---

#### 8. [Database Patterns](./database-patterns.md)

**Impact:** High - Ensures database security, correct RLS testing
**Lessons Synthesized:** 6
**Patterns:** 6

- RLS Testing with Real JWT Sessions
- RLS Policy SQL Syntax
- Anonymous User RLS Policies
- Postgres Function Security
- PostgREST Health Checks
- Extension Installation & Schema Management

**Use When:** Working with Supabase, writing RLS policies, testing database code

---

## Quick Navigation

### By Category

| Category | Guide | Patterns | Impact |
|----------|-------|----------|--------|
| **Security** | [Security Patterns](./security-patterns.md) | 6 | Critical |
| **Infrastructure** | [Bash Safety Patterns](./bash-safety-patterns.md) | 8 | Critical |
| **Quality Assurance** | [Testing Patterns](./testing-patterns.md) | 7 | Critical |
| **Workflow** | [Git Workflow Patterns](./git-workflow-patterns.md) | 7 | High |
| **Automation** | [CI/CD Patterns](./ci-cd-patterns.md) | 6 | High |
| **Frontend** | [React Patterns](./react-patterns.md) | 6 | High |
| **Language** | [TypeScript Patterns](./typescript-patterns.md) | 7 | Medium |
| **Database** | [Database Patterns](./database-patterns.md) | 6 | High |

### By Use Case

#### 🔒 Security & Validation

- [Security Patterns](./security-patterns.md) - Input validation, injection prevention
- [Bash Safety Patterns](./bash-safety-patterns.md#pattern-3-command-injection-prevention) - Command injection
- [Database Patterns](./database-patterns.md#pattern-1-rls-testing-with-real-jwt-sessions) - RLS testing

#### 🧪 Testing & Quality

- [Testing Patterns](./testing-patterns.md) - Test isolation, mocking, CI optimization
- [CI/CD Patterns](./ci-cd-patterns.md) - Quality gates, pre-push validation
- [Database Patterns](./database-patterns.md#pattern-1-rls-testing-with-real-jwt-sessions) - RLS testing

#### 🚀 Development Workflow

- [Git Workflow Patterns](./git-workflow-patterns.md) - Lockfile management, PR strategy
- [CI/CD Patterns](./ci-cd-patterns.md) - GitHub Actions, pnpm setup
- [Bash Safety Patterns](./bash-safety-patterns.md) - Script safety, automation

#### ⚛️ Frontend Development

- [React Patterns](./react-patterns.md) - Components, accessibility, Next.js
- [TypeScript Patterns](./typescript-patterns.md) - Type safety, error handling
- [Testing Patterns](./testing-patterns.md#pattern-7-e2e-testing-best-practices) - E2E testing

#### 🗄️ Database & Backend

- [Database Patterns](./database-patterns.md) - RLS, Postgres, Supabase
- [Security Patterns](./security-patterns.md#pattern-4-sql-injection-prevention) - SQL injection prevention
- [Testing Patterns](./testing-patterns.md#pattern-6-database-testing-patterns) - Database testing

---

## Pattern Statistics

### Distribution by Impact

| Impact Level | Patterns | Guides | Percentage |
|--------------|----------|--------|------------|
| Critical | 21 | 3 | 54% |
| High | 13 | 3 | 33% |
| Medium | 5 | 2 | 13% |

### Recurring Patterns (2+ Occurrences)

These patterns appear in multiple micro-lessons, indicating their importance:

1. **Input Validation** (5 lessons) - [Security Patterns](./security-patterns.md#pattern-1-input-validation-before-processing)
2. **File Paths with Spaces** (3 lessons) - [Bash Safety Patterns](./bash-safety-patterns.md#pattern-1-file-paths-with-spaces-handling)
3. **pnpm Lockfile Management** (3 lessons) - [Git Workflow Patterns](./git-workflow-patterns.md#pattern-1-pnpm-lockfile-management)
4. **RLS Policy Security** (3 lessons) - [Security Patterns](./security-patterns.md#pattern-5-rls-policy-security)
5. **Accessibility Patterns** (5 lessons) - [React Patterns](./react-patterns.md#pattern-2-accessibility-first-component-design)

---

## Cross-Cutting Concerns

These themes appear across multiple pattern guides:

### 1. Defense in Depth

- **Security:** Multiple validation layers
- **Testing:** Multiple test types (unit, integration, E2E)
- **CI/CD:** Multiple quality gates (pre-commit, pre-push, CI)

### 2. Fast Feedback Loops

- **CI/CD:** Pre-commit hooks, parallel execution
- **Testing:** Test isolation, fail fast
- **Git:** Phase-based PRs

### 3. Type Safety

- **TypeScript:** Precise types, no `any`
- **React:** Component type safety
- **Database:** Type generation from schema

### 4. Accessibility First

- **React:** ARIA patterns, semantic HTML
- **Testing:** Accessibility testing
- **Security:** Inclusive design

### 5. Configuration Over Hardcoding

- **Bash:** Environment-driven timeouts
- **CI/CD:** Configurable workflows
- **Testing:** Environment-based test config

---

## Using These Patterns

### For Development

1. **Before Writing Code:** Review relevant pattern guide
2. **During Code Review:** Reference patterns for feedback
3. **Pre-Commit:** Use checklist from relevant guide
4. **Debugging:** Check if anti-pattern is cause

### For LLMs

These patterns are optimized for LLM consumption with:

- Clear headings and structure
- Code examples with language tags
- Consistent formatting
- Internal links for navigation
- Explicit anti-patterns

### For Onboarding

New team members should:

1. Read [Security Patterns](./security-patterns.md) first (critical)
2. Review [Testing Patterns](./testing-patterns.md) for QA workflow
3. Study [Git Workflow Patterns](./git-workflow-patterns.md) for PR process
4. Reference others as needed for specific tasks

---

## Contributing to Patterns

### When to Create New Pattern

Create a new pattern when:

- Issue appears 2+ times across different contexts
- Pattern has "high blast radius" (affects many areas)
- Current documentation doesn't cover the case
- Pattern prevents critical vulnerability or failure

### How to Add Pattern

1. Document in micro-lesson: `docs/micro-lessons/YYYYMMDD-HHMMSS-pattern-name.md`
2. Wait for 2+ occurrences or high-impact confirmation
3. Add to relevant pattern guide
4. Update this index
5. Cross-reference in related guides

### Pattern Template

```markdown
## Pattern N: [Pattern Name]

**Problem:** [What goes wrong without this pattern]

**Impact:** [Critical/High/Medium] (X/10) - [Consequences]

**Source Lessons:**
- `lesson-1.md`
- `lesson-2.md`

### ✅ Correct Pattern

[Code example showing right way]

### ❌ Anti-Pattern

[Code example showing wrong way]

### Key Points

- Bullet list of key takeaways
- Why this matters
- When to use
```

---

## Maintenance

### Review Schedule

- **Quarterly:** Review all patterns for relevance
- **After Major Release:** Update patterns based on new learnings
- **When Adding Micro-Lesson:** Consider if pattern should be promoted

### Deprecation

When deprecating a pattern:

1. Add "⚠️ DEPRECATED" badge
2. Link to replacement pattern
3. Keep archived for 2 releases
4. Remove completely after 2 releases

---

## Related Documentation

- [Micro-Lessons Index](../micro-lessons/INDEX.md) - Individual learning entries
- [Micro-Lessons Analysis](micro-lessons-analysis.md) - Full analysis report (776 lines)
- [Pattern Documentation Review](REVIEW.md) - Quality review and assessment (9.5/10)
- [Gaps & Analytics](gaps-and-analytics.md) - Coverage analysis and automation opportunities
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [ADRs](../adr/) - Architectural decisions

---

## Gaps Identified

Areas with no or limited pattern documentation:

1. **Performance Optimization** - React performance, bundle size, caching
2. **Monitoring & Observability** - Logging strategies, metrics, alerts
3. **API Design** - REST patterns, GraphQL, error responses
4. **State Management** - Zustand patterns, React Context
5. **Build & Bundling** - Vite configuration, optimization strategies
6. **Mobile Responsiveness** - Responsive design, mobile-first patterns
7. **Internationalization** - i18n patterns, locale management

These gaps suggest areas for future learning and pattern development.

---

## Analytics

### Pattern Usage by Category

| Category | Patterns | Source Lessons | Avg. Lessons per Pattern |
|----------|----------|----------------|--------------------------|
| Security | 6 | 12 | 2.0 |
| Bash Scripting | 8 | 15 | 1.9 |
| Testing | 7 | 8 | 1.1 |
| Git Workflow | 7 | 10 | 1.4 |
| CI/CD | 6 | 9 | 1.5 |
| React | 6 | 10 | 1.7 |
| TypeScript | 7 | 7 | 1.0 |
| Database | 6 | 6 | 1.0 |

### Most Recent Patterns

Based on micro-lesson dates:

1. **Pre-Push Hook Timeout Optimization** (2025-11-09) - CI/CD
2. **Accessibility-First Examples** (2025-11-09) - React
3. **PR Review Iteration Pattern** (2025-11-09) - Git Workflow
4. **Form State Examples** (2025-11-09) - React
5. **Bash File Paths with Spaces** (2025-11-09) - Bash Safety

### Highest Impact Patterns

Based on impact scores from analysis:

1. **Input Validation & Command Injection Prevention** (10/10) - Security
2. **Supabase RLS Testing with Real JWT** (10/10) - Testing/Database
3. **JSON Output in Bash Scripts** (10/10) - Bash Safety
4. **SQL Injection Prevention** (10/10) - Security
5. **RLS Policy Security** (10/10) - Security/Database

---

## Feedback

Have suggestions for improving these patterns? Found a bug or anti-pattern?

1. **Create Issue:** [GitHub Issues](https://github.com/Shredvardson/dl-starter/issues)
2. **Add Micro-Lesson:** Document new learning in `docs/micro-lessons/`
3. **Update Pattern:** Submit PR with improvements

---

**Generated from:** 123 micro-lessons accumulated 2024-01-24 to 2025-11-10
**Synthesis Date:** 2025-11-11
**Next Review:** 2026-02-11 (Quarterly)
