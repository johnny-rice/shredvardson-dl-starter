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

#### README

**Purpose**: No description available

**When to use**: Setting up tests and TDD workflows

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: testing, planning, implementation, requirements, quality

---

### Git Workflow

#### git:commit

**Purpose**: Generate a Conventional Commit message for staged changes.

**When to use**: General development tasks

**Example**: Create conventional commit for completed feature

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: git, conventional-commits

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

**Purpose**: Sync current project state to wiki pages for GPT-5 context.

**When to use**: GitHub workflow and project management

**Example**: Create GitHub issue with proper templates

**Risk Level**: LOW (Requires Human Approval)

**Tags**: github, wiki, documentation

---

### Operations

#### ops:learning-capture

**Purpose**: Convert CodeRabbit feedback into micro-lessons or ADRs for pattern capture.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: learning, coderabbit, micro-lessons

---

#### ops:wiki-sync

**Purpose**: Verify docs/PRD.md and docs/wiki/WIKI-PRD.md are in sync, auto-fix if needed.

**When to use**: General development tasks

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: wiki, sync, maintenance

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

#### dev:implement

**Purpose**: Write minimal code to make failing tests pass during TDD implementation.

**When to use**: Small changes and quick tasks

**Example**: Build feature following established plan

**Risk Level**: HIGH (Requires Human Approval)

**Tags**: implementation, development, tdd

---

#### dev:init-new-app

**Purpose**: Initialize a new app from this starter with customized configuration.

**When to use**: Small changes and quick tasks

**Example**: Standard development workflow

**Risk Level**: HIGH (Requires Human Approval)

**Tags**: initialization, starter, scaffolding

---

#### dev:plan-feature

**Purpose**: Plan a small, safe feature with clear acceptance criteria.

**When to use**: Small changes and quick tasks

**Example**: Create technical plan for auth implementation

**Risk Level**: LOW

**Tags**: planning, features

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

**Purpose**: Create technical implementation plan within constitutional constraints.

**When to use**: Complex features requiring structured approach

**Example**: Create technical plan for auth implementation

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: spec-kit, planning, architecture

---

#### specify

**Purpose**: Define pure requirements - what and why only, no technical details.

**When to use**: Complex features requiring structured approach

**Example**: Define requirements for user authentication system

**Risk Level**: LOW

**Tags**: spec-kit, requirements, planning

---

#### tasks

**Purpose**: Break down technical plan into actionable implementation tasks with TDD focus.

**When to use**: Complex features requiring structured approach

**Example**: Break down auth feature into TDD tasks

**Risk Level**: MEDIUM (Requires Human Approval)

**Tags**: spec-kit, tasks, implementation

---

### Testing

#### test:scaffold

**Purpose**: Write failing tests from approved plan before implementation.

**When to use**: Setting up tests and TDD workflows

**Example**: Standard development workflow

**Risk Level**: LOW

**Tags**: testing, tdd, scaffolding

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
