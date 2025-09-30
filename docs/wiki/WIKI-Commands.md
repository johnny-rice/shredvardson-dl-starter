# Commands Reference

## Table of Contents

- [Overview](#overview)
- [Spec-Driven Workflow Commands](#spec-driven-workflow-commands)
- [Simple Workflow Commands](#simple-workflow-commands)
- [GitHub Integration Commands](#github-integration-commands)
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

## Simple Workflow Commands

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

## Quality & Security Commands

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

_Commands provide structured workflows while maintaining human oversight and quality standards_
