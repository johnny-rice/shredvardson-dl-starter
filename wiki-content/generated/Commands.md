# Commands Reference

## Available Commands

### Documentation

#### docs:generate

**Purpose**: Update documentation from code and tests when docs are outdated.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: documentation, automation

---

### General

#### accessibility:audit

**Purpose**: Run accessibility audit using axe-core to validate WCAG 2.1 AA compliance.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: accessibility, a11y, wcag, audit, compliance

---

#### code

**Purpose**: Coding standards via implementation-assistant Skill

**When to use**: Code quality and security improvements

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: security, implementation, requirements

---

#### db

**Purpose**: Database workflow via supabase-integration Skill

**When to use**: Code quality and security improvements

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: security, planning, implementation

---

#### db:migrate

**Purpose**: Streamline Supabase database migration workflow with validation and RLS policy checks.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: database, migration, supabase, schema, rls

---

#### design - Design System Management

**Purpose**: Proactive UI generation and automated design system enforcement

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: planning, requirements, quality

---

#### docs - Documentation Sync

**Purpose**: Documentation synchronization and validation

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: 

---

#### git - Unified Git Workflow

**Purpose**: Unified git workflow automation with intelligent routing

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: implementation

---

#### QUICK_REFERENCE

**Purpose**: Consolidated quick reference guide for 5 discovery commands and Skills catalog with progressive disclosure architecture

**When to use**: Fast command discovery and lookup without reading full documentation

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: testing, security, planning, implementation, requirements, quality

---

#### README

**Purpose**: Overview of slash command architecture, usage patterns, and command catalog

**When to use**: Understanding slash command system and available commands

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: testing, planning, implementation, requirements, quality

---

#### research:explore

**Purpose**: Deep codebase exploration to answer questions about architecture, patterns, or implementation details.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: research, exploration, codebase

---

#### review - Code Quality Review

**Purpose**: Automated code quality checks and review

**When to use**: Setting up tests and TDD workflows

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: testing, implementation, quality

---

#### security:scan

**Purpose**: Scan codebase for security vulnerabilities including RLS policies, auth issues, and OWASP Top 10.

**When to use**: Code quality and security improvements

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: security, scanning, vulnerabilities, rls

---

#### spec

**Purpose**: Spec analysis via prd-analyzer Skill

**When to use**: Code quality and security improvements

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: security, planning, implementation, requirements

---

#### test

**Purpose**: TDD workflow via test-scaffolder Skill

**When to use**: Setting up tests and TDD workflows

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: testing, security, implementation

---

### Git Workflow

#### _shared/branch-validation

**Purpose**: Reusable validation patterns for branch creation, name compliance, and git state checks

**When to use**: Validating branch names and git state in /git:branch and /git:fix-pr

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: git, testing, security, implementation

---

#### _shared/commit-formatting

**Purpose**: Shared commit message formatting standards and conventional commit patterns

**When to use**: Creating conventional commits in /git:commit, /git:branch, and /git:fix-pr

**Example**: Create conventional commit for completed feature

**Risk Level**: LOW

**Tags**: git, testing, security, planning, implementation

---

#### _shared/common-git-workflow

**Purpose**: Git workflow best practices including branch protection, commit hygiene, and push/pull patterns

**When to use**: Following git best practices across all git commands

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: git, testing, planning

---

#### _shared/error-handling

**Purpose**: Comprehensive error detection, messaging, and recovery patterns for common git failure modes

**When to use**: Handling git errors and recovery in /git:branch, /git:fix-pr, and other git commands

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: git, testing, security, planning

---

#### git:branch

**Purpose**: Create a new git branch following standardized naming conventions.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: git, branch-management, workflow

---

#### git:commit

**Purpose**: Generate a Conventional Commit message for staged changes.

**When to use**: General development tasks

**Example**: Create conventional commit for completed feature

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: git, conventional-commits

---

#### git:fix-pr

**Purpose**: Automatically address PR feedback from CI checks, CodeRabbit, and doctor failures.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: git, pr, ci, automation, feedback

---

#### git:prepare-pr

**Purpose**: Create conventional commit and PR body when ready to submit changes.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: git, pr, workflow

---

#### git:tag-release

**Purpose**: Create semantic version from conventional commits when ready to release.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: HIGH (Requires Human Approval)

**Tags**: git, release, semver

---

#### git:workflow

**Purpose**: Manage git branch lifecycle using consolidated workflow operations.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: git, workflow, branch-management

---

#### pr:assist

**Purpose**: Auto-fill PR template with traceability IDs and metadata before opening PR.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: pr, traceability, automation

---

### GitHub Integration

#### github:create-issue

**Purpose**: Create a GitHub issue from current planning discussion with proper template.

**When to use**: GitHub workflow and project management

**Example**: Create GitHub issue with proper templates

**Risk Level**: LOW

**Tags**: github, issues, planning

---

#### github:github-learning-capture

**Purpose**: Update an existing issue with implementation outcomes and learnings.

**When to use**: GitHub workflow and project management

**Example**: Create GitHub issue with proper templates

**Risk Level**: LOW

**Tags**: github, learning, documentation

---

#### github:update-wiki

**Purpose**: Generated wiki content updates

**When to use**: GitHub workflow and project management

**Example**: Create GitHub issue with proper templates

**Risk Level**: LOW (Requires Human Approval)

**Tags**: github, wiki, documentation

---

### Operations

#### learn

**Purpose**: Search micro-lessons by tags, keywords, or patterns to find relevant learnings.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: learning, search, knowledge-management, micro-lessons

---

#### ops:learning-capture

**Purpose**: Capture development insights, patterns, or decisions as micro-lessons with intelligent context detection and automatic indexing.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: learning, automation, micro-lessons, knowledge-management

---

#### ops:wiki-sync

**Purpose**: Verify docs/PRD.md and docs/wiki/WIKI-PRD.md are in sync, auto-fix if needed.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: wiki, sync, maintenance

---

#### skills-stats

**Purpose**: Display Skills usage statistics and analytics

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: ops, analytics, skills, observability

---

### Quality Assurance

#### quality:run-linter

**Purpose**: Execute linting and fix all quality issues before commits.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: quality, linting, formatting

---

### Review & Quality

#### review:self-critique

**Purpose**: Start fresh session and skeptically review recent changes for quality.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: review, quality, validation

---

### Simple Development

#### dev:init-new-app

**Purpose**: Initialize a new app from this starter with customized configuration.

**When to use**: Small changes and quick tasks

**Example**: Standard development workflow

**Risk Level**: HIGH (Requires Human Approval)

**Tags**: initialization, starter, scaffolding

---

#### dev:refactor-secure

**Purpose**: Improve code clarity and performance while checking OWASP Top 10 security risks.

**When to use**: Small changes and quick tasks

**Example**: Add security improvements to API endpoints

**Risk Level**: HIGH (Requires Human Approval)

**Tags**: security, refactoring, owasp

---

### Spec-Driven Development

#### adr:draft

**Purpose**: Draft ADR when governance triggers occur (prompts, workflows, security, compliance changes).

**When to use**: Complex features requiring structured approach

**Example**: Standard development workflow

**Risk Level**: LOW (Requires Human Approval)

**Tags**: adr, governance, documentation

---

#### plan

**Purpose**: Generate technical plan from spec file. Automatically triggers design discovery for spec-driven lane features.

**When to use**: Complex features requiring structured approach

**Example**: Create technical plan for auth implementation

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: planning, design, architecture

---

#### specify

**Purpose**: Create a new spec file with lane detection to begin the spec-driven development workflow.

**When to use**: Complex features requiring structured approach

**Example**: Define requirements for user authentication system

**Risk Level**: LOW (Requires Human Approval)

**Tags**: spec, planning, prd

---

#### tasks

**Purpose**: Generate implementation task breakdown from spec and plan files. Works for both spec-driven and simple lane features.

**When to use**: Complex features requiring structured approach

**Example**: Break down auth feature into TDD tasks

**Risk Level**: LOW

**Tags**: tasks, breakdown, implementation

---

## Decision Framework

{
  "spec_driven_triggers": [
    "Risk: authentication/payments/data",
    "Scope: 3+ files or 2+ hours",
    "Clarity: requirements unclear",
    "Dependencies: new packages/services"
  ],
  "simple_workflow_default": [
    "Single component changes",
    "UI tweaks and styling",
    "Bug fixes",
    "Documentation updates",
    "Anything completable in 1-2 hours"
  ]
}

---
*Generated from docs/commands/index.json*
