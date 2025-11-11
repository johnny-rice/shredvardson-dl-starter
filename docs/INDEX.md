# Documentation Index

**Start here** for comprehensive dl-starter documentation.

## Quick Start Guides

New to the project? Start with these essential guides:

- **[Testing Guide](guides/TESTING.md)** - Comprehensive testing guide (unit, E2E, database, Skills)
- **[Database Guide](guides/DATABASE.md)** - Supabase setup, migrations, RLS, and optimization
- **[Skills System](guides/SKILLS.md)** - Progressive disclosure architecture for AI workflows
- **[Architecture Guide](guides/ARCHITECTURE.md)** - Monorepo structure, packages, and design patterns

## Core Documentation

- **[Pattern Guides](patterns/README.md)** - 39 battle-tested patterns from 123 micro-lessons
- **[Micro-Lessons](micro-lessons/INDEX.md)** - Individual learning entries
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to Vercel with Supabase
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[PRD](PRD.md)** - Product requirements document

## Specialized Topics

### Patterns & Best Practices
- **[Pattern Guides](patterns/README.md)** - Security, bash, testing, git, CI/CD, React, TypeScript, database patterns
- **[Security Patterns](patterns/security-patterns.md)** - Input validation, injection prevention, secrets protection
- **[Testing Patterns](patterns/testing-patterns.md)** - Test isolation, RLS testing, CI optimization
- **[Bash Safety Patterns](patterns/bash-safety-patterns.md)** - Command injection prevention, file path handling

### Database
- **[RLS Implementation](database/rls-implementation.md)** - Complete Row-Level Security guide
- **[RLS Optimization](database/RLS_OPTIMIZATION.md)** - Performance optimization (6 techniques)
- **[Database Standards](database/standards.md)** - Schema conventions and best practices

### Testing
- **[Testing Guide (Main)](testing/TESTING_GUIDE.md)** - Complete testing documentation
- **[Playwright MCP Guide](testing/PLAYWRIGHT_MCP_GUIDE.md)** - Interactive browser testing
- **[UI Automation Guide](testing/UI_AUTOMATION_GUIDE.md)** - UI test patterns
- **[Coverage Contract](testing/coverage-contract.md)** - Coverage requirements
- **[Failure Handling](testing/failure-handling-best-practices.md)** - Error handling patterns

### Workflow & Automation
- **[Skills Architecture](skills-architecture.md)** - Skills system design (progressive disclosure)
- **[Automation Commands](automation-commands.md)** - Slash command reference
- **[Runbook](runbook.md)** - Operational procedures

### AI & Collaboration
- **[AI Ops](ai/INDEX.md)** - AI operations and patterns
- **[Secure Prompting](SECURE_PROMPTING.md)** - Prompt injection prevention
- **[MCP Integration](MCP_INTEGRATION.md)** - Model Context Protocol integration

### Git & Specs
- **[Spec System](wiki/WIKI-Spec-System.md)** - Specification-driven development
- **[Git Workflow](wiki/WIKI-Git-Workflow.md)** - Git conventions and workflows
- **[Quality Gates](wiki/WIKI-Quality-Gates.md)** - Automated quality checks
- **[Planning Templates](wiki/WIKI-Planning-Templates.md)** - Task planning templates
- **[Commands](wiki/WIKI-Commands.md)** - Command reference

### Architecture & Design
- **[Constitution](constitution.md)** - Architectural principles
- **[Epic System](EPIC_SYSTEM.md)** - Epic/story management
- **[Component Workflow](COMPONENT_WORKFLOW.md)** - Component development workflow
- **[Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)** - Feature roadmap

### Architecture Decision Records
- **[ADRs](adr/)** - All architectural decisions
- **[Decisions README](decisions/README.md)** - ADR index

### Evaluations & Learning
- **[Evaluations](evaluations/INDEX.md)** - System evaluations
- **[Learning Loop Maintenance](LEARNING_LOOP_MAINTENANCE.md)** - Micro-lesson maintenance

### Security
- **[Workflow Security](workflow-security.md)** - Security workflows and patterns

## Package Documentation

- **[git-context Package](../packages/git-context/README.md)** - Secure git context extraction for AI agents

## Quick Reference

### For New Developers
1. [ARCHITECTURE.md](guides/ARCHITECTURE.md) - Understand the monorepo structure
2. [TESTING.md](guides/TESTING.md) - Set up testing environment
3. [DATABASE.md](guides/DATABASE.md) - Configure Supabase locally
4. [CONTRIBUTING.md](CONTRIBUTING.md) - Start contributing

### For AI Agents
1. [Pattern Guides](patterns/README.md) - Essential patterns for code generation
2. [SKILLS.md](guides/SKILLS.md) - Understand the Skills system
3. [skills-architecture.md](skills-architecture.md) - Progressive disclosure architecture
4. [../packages/git-context/README.md](../packages/git-context/README.md) - Git context API
5. [SECURE_PROMPTING.md](SECURE_PROMPTING.md) - Security considerations

### For Database Work
1. [DATABASE.md](guides/DATABASE.md) - Complete database guide
2. [Database Patterns](patterns/database-patterns.md) - RLS testing, policy patterns
3. [database/rls-implementation.md](database/rls-implementation.md) - RLS patterns
4. [database/RLS_OPTIMIZATION.md](database/RLS_OPTIMIZATION.md) - Performance optimization
5. [database/standards.md](database/standards.md) - Standards and conventions

### For Testing
1. [TESTING.md](guides/TESTING.md) - Comprehensive testing guide
2. [Testing Patterns](patterns/testing-patterns.md) - Test isolation, RLS testing, CI optimization
3. [testing/TESTING_GUIDE.md](testing/TESTING_GUIDE.md) - Detailed testing documentation
4. [testing/coverage-contract.md](testing/coverage-contract.md) - Coverage requirements

### For Security & Code Quality
1. [Security Patterns](patterns/security-patterns.md) - Input validation, injection prevention
2. [Bash Safety Patterns](patterns/bash-safety-patterns.md) - Command injection, file handling
3. [CI/CD Patterns](patterns/ci-cd-patterns.md) - Quality gates, GitHub Actions
4. [SECURE_PROMPTING.md](SECURE_PROMPTING.md) - Prompt injection prevention

---

> **Convention:** Each doc begins with an H1 + 3–5 line abstract + "When to use".
