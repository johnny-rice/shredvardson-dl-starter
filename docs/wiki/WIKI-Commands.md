# Commands Reference

## Table of Contents

- [Overview](#overview)
- [Spec-Driven Workflow Commands](#spec-driven-workflow-commands)
- [Simple Workflow Commands](#simple-workflow-commands)
- [GitHub Integration Commands](#github-integration-commands)
- [Operations & Maintenance Commands](#operations--maintenance-commands)
- [Quality & Security Commands](#quality--security-commands)
- [Risk Levels](#risk-levels)
- [Usage Examples](#usage-examples)

## Overview

Slash commands encapsulate multi-step workflows, ensuring consistency and quality across development processes. Each command has defined risk levels and approval requirements.

Commands work with [Planning Templates](./WIKI-Planning-Templates.md) to ensure consistent inputs and outputs. Follow [Git Workflow](./WIKI-Git-Workflow.md) conventions for branches and commits.

## Spec-Driven Workflow Commands

### `/specify`

**Purpose**: Create detailed specification (Full or Micro Kernel) for complex features  
**When to use**: New features, complex business logic, architectural decisions  
**Risk Level**: LOW  
**Inputs Required**: Issue description, PRD context, architecture constraints  
**Artifacts Produced**: Specification document in `specs/` directory with structured kernel template

### `/plan`

**Purpose**: Convert specification into technical implementation plan  
**When to use**: After `/specify` - translate requirements into actionable steps  
**Risk Level**: LOW  
**Inputs Required**: Completed specification, architecture constraints  
**Artifacts Produced**: Implementation plan in `plans/` directory with step-by-step approach

### `/tasks`

**Purpose**: Break implementation plan into discrete development tasks
**When to use**: After `/plan` - create actionable task breakdown
**Risk Level**: LOW
**Inputs Required**: Completed implementation plan
**Artifacts Produced**: Task list in `tasks/` directory with priority and dependencies

### `/spec:adr-draft`

**Purpose**: Draft Architecture Decision Record (ADR) when governance triggers occur
**When to use**: Prompt changes, workflow updates, security guardrails, compliance requirements
**Risk Level**: LOW (requires HITL)
**Inputs Required**: Governance trigger type (prompt-change, workflow-update, security-guardrail, compliance-requirement, repo-structure)
**Artifacts Produced**: ADR document in `docs/decisions/ADR-YYYYMMDD-[slug].md`

## Simple Workflow Commands

### `/dev:init-new-app`

**Purpose**: Initialize a new application within the monorepo or export as standalone repo
**When to use**: Creating new app from template with PRD-driven configuration
**Risk Level**: MEDIUM
**Inputs Required**: App slug, PRD scope, feature toggles
**Artifacts Produced**: Configured app structure with [docs/product/PRD.md](../../README.md#new-app-from-template-choose-mode)

### `/dev:plan-feature`

**Purpose**: Plan and scaffold small features or bug fixes in one step
**When to use**: Single-component changes, small improvements, bug fixes
**Risk Level**: MEDIUM
**Inputs Required**: Clear issue description, relevant code paths, constraints
**Artifacts Produced**: Branch creation, basic scaffolding, checklist implementation plan

### `/test:scaffold`

**Purpose**: Generate test structure and basic test cases  
**When to use**: After planning phase, before implementation  
**Risk Level**: LOW  
**Inputs Required**: Implementation plan or specification  
**Artifacts Produced**: Test files with scaffolded test cases for unit and E2E testing

### `/dev:implement`

**Purpose**: Execute planned implementation with TDD approach  
**When to use**: After planning and test scaffolding  
**Risk Level**: HIGH (code changes)  
**Inputs Required**: Completed plan, scaffolded tests  
**Artifacts Produced**: Feature implementation with passing tests

### `/dev:refactor-secure`

**Purpose**: Security-focused refactoring and hardening  
**When to use**: After implementation, during security review  
**Risk Level**: MEDIUM  
**Inputs Required**: Existing implementation, security requirements  
**Artifacts Produced**: Hardened code with security improvements and documentation

## GitHub Integration Commands

### `/github:create-issue`

**Purpose**: Create structured GitHub issue with proper labeling
**When to use**: Documenting bugs, feature requests, or tasks
**Risk Level**: LOW
**Inputs Required**: Issue description, labels, priority
**Artifacts Produced**: GitHub issue with project templates and proper categorization

### `/github:update-wiki`

**Purpose**: Push updated Wiki documentation to GitHub Wiki
**When to use**: After updating docs/wiki/ files, to sync with GitHub Wiki
**Risk Level**: LOW
**Inputs Required**: Updated wiki markdown files in docs/wiki/
**Artifacts Produced**: Synced GitHub Wiki pages

### `/github:capture-learning`

**Purpose**: Capture learning from PR or issue into micro-lesson
**When to use**: After resolving issue with useful patterns or gotchas
**Risk Level**: LOW
**Inputs Required**: Issue/PR number, learning context, pattern description
**Artifacts Produced**: Micro-lesson in docs/micro-lessons/ with heat ranking

### `/git:branch`

**Purpose**: Create new git branch following standardized naming conventions
**When to use**: Starting new feature, fix, chore, or documentation work
**Risk Level**: LOW
**Inputs Required**: Branch type (feature/fix/chore/docs), issue number, slug
**Artifacts Produced**: New branch with standardized name `<type>/<issue#>-<slug>`

### `/git:commit`

**Purpose**: Create conventional commit with quality checks  
**When to use**: Committing completed work  
**Risk Level**: MEDIUM  
**Inputs Required**: Staged changes, commit message intent  
**Artifacts Produced**: Properly formatted conventional commit with quality verification

### `/git:prepare-pr`

**Purpose**: Full PR preparation workflow with quality gates
**When to use**: When ready to create pull request
**Risk Level**: MEDIUM
**Inputs Required**: Completed feature implementation, tests passing
**Artifacts Produced**: PR with filled template, passing [Quality Gates](./WIKI-Quality-Gates.md)

### `/git:fix-pr`

**Purpose**: Automatically address PR feedback from CI checks, CodeRabbit, and doctor failures
**When to use**: When PR has failing checks or review feedback to address
**Risk Level**: MEDIUM
**Inputs Required**: PR number (optional, defaults to current branch), CI feedback, CodeRabbit comments
**Artifacts Produced**: Commits with fixes, micro-lessons for reusable patterns, fix report

**Key Features**:

- Categorizes issues as auto-fixable, pre-existing, or manual
- Fixes issues iteratively with separate commits
- Captures micro-lessons for reusable patterns
- Waits for CI checks to complete (up to 5 minutes)

### `/git:pr-assistant`

**Purpose**: Complete PR template with traceability and governance compliance
**When to use**: Creating comprehensive PR with full context and cross-references
**Risk Level**: LOW (requires HITL)
**Inputs Required**: Completed feature, specification/plan references, test results
**Artifacts Produced**: PR with filled template including ADR references and traceability

### `/git:finish`

**Purpose**: Complete feature workflow - switch to main, pull latest, clean up current branch
**When to use**: After PR is merged, to clean up and prepare for next feature
**Risk Level**: MEDIUM
**Inputs Required**: Merged PR, local feature branch
**Artifacts Produced**: Updated main branch, deleted feature branch (local and remote)

**Key Feature**: Intelligent squash-merge detection - automatically identifies branches that were squash-merged on GitHub (even though they appear "unmerged" locally) and safely prompts for deletion. See [Git Workflow](./WIKI-Git-Workflow.md#squash-merge-detection) for details.

### `/git:tag-release`

**Purpose**: Create semantic version tag for release management
**When to use**: After merging to main, before deployment
**Risk Level**: MEDIUM
**Inputs Required**: Version bump type (major/minor/patch), changelog updates
**Artifacts Produced**: Git tag with version, updated changelog

### `/git:workflow`

**Purpose**: Display git workflow guidance and current project state
**When to use**: Need reminder of git workflow conventions or branch status
**Risk Level**: LOW
**Inputs Required**: None
**Artifacts Produced**: Workflow guide display and current branch context

## Operations & Maintenance Commands

### `/ops:learning-capture`

**Purpose**: Convert CodeRabbit feedback or recurring patterns into micro-lessons or ADRs
**When to use**: Pattern identified from code review feedback, process improvements needed
**Risk Level**: LOW
**Inputs Required**: Feedback type (pattern for micro-lesson, process for ADR), CodeRabbit comment
**Artifacts Produced**: Micro-lesson in docs/micro-lessons/ or ADR in docs/decisions/

### `/ops:wiki-sync`

**Purpose**: Verify and sync docs/PRD.md with docs/wiki/WIKI-PRD.md
**When to use**: After updating PRD, to ensure wiki is in sync
**Risk Level**: LOW
**Inputs Required**: Updated PRD file
**Artifacts Produced**: Synced wiki files, sync status report

### `/docs:generate`

**Purpose**: Generate or update project documentation from code and templates
**When to use**: After adding new components, API routes, or configuration
**Risk Level**: LOW
**Inputs Required**: Source code, documentation templates
**Artifacts Produced**: Generated/updated documentation files

## Quality & Security Commands

### `/review:self-critique`

**Purpose**: Perform self-review of code changes before creating PR
**When to use**: After implementation, before `/git:prepare-pr`
**Risk Level**: LOW
**Inputs Required**: Staged or committed changes on feature branch
**Artifacts Produced**: Self-review report with suggestions and potential issues

### `/review:ai-powered` (GitHub Action - Mention Only)

**Purpose**: AI-powered code review with inline feedback
**When to use**: Mention `@claude /review` in PR comments
**Risk Level**: ADVISORY
**Inputs Required**: Open PR with code changes
**Artifacts Produced**: Inline PR comments with suggestions and improvement recommendations

### `/security:scan` (GitHub Action - Automatic)

**Purpose**: AI-powered vulnerability detection  
**When to use**: Automatic on pull requests  
**Risk Level**: ADVISORY  
**Inputs Required**: PR with code changes  
**Artifacts Produced**: Security findings and recommendations, aggregated in doctor report

### `/quality:run-linter`

**Purpose**: Execute linting and formatting checks  
**When to use**: Before commits or PR creation  
**Risk Level**: LOW  
**Inputs Required**: Source code files  
**Artifacts Produced**: Code quality report with fixes and suggestions

## Risk Levels

### LOW Risk

- Documentation generation
- Planning and specification
- Test scaffolding
- Read-only operations

### MEDIUM Risk

- Code refactoring
- Branch operations
- PR creation
- Configuration changes

### HIGH Risk

- Code implementation
- Database changes
- Security modifications
- Production deployments

## Usage Examples

### Complex Feature Development

```bash
# 1. Create specification
/specify
# AI creates detailed kernel for user authentication

# 2. Create implementation plan
/plan
# AI converts kernel to technical plan

# 3. Break into tasks
/tasks
# AI creates actionable task breakdown

# 4. Execute tasks (repeat for each task)
/dev:plan-feature
/test:scaffold
/dev:implement
```

### Simple Bug Fix

```bash
# Single command handles planning and setup
/dev:plan-feature
# AI creates branch, plans fix, scaffolds tests

# Continue with implementation
/dev:implement
/git:prepare-pr
```

### Quality Assurance

```bash
# Before committing
/quality:run-linter
/dev:refactor-secure

# Preparing PR
/git:commit
/git:prepare-pr
```

For detailed command inputs/outputs, see [Planning Templates](./WIKI-Planning-Templates.md).  
For branch and commit conventions, see [Git Workflow](./WIKI-Git-Workflow.md).

---

**Note:** Commands provide structured workflows while maintaining human oversight and quality standards.
