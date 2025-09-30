# AI Collaboration Best Practices

## Table of Contents

- [Overview](#overview)
- [Human ↔ AI Roles](#human--ai-roles)
- [Effective Prompting](#effective-prompting)
- [Workflow Integration](#workflow-integration)
- [Safety Rails](#safety-rails)
- [Escalation Rules](#escalation-rules)

## Overview

This guide covers best practices for collaborating with external LLM agents in structured development workflows while maintaining human authority and safety.

## Human ↔ AI Roles

### Human Responsibilities

- **Final decisions** on architecture and feature requirements
- **Quality oversight** and code review approval
- **Security validation** and risk assessment
- **Product direction** and priority setting
- **Escalation handling** when AI capabilities are exceeded

### AI Responsibilities

- **Code implementation** following specifications and patterns
- **Test generation** and quality assurance automation
- **Documentation** creation and maintenance
- **Pattern consistency** across the codebase
- **Advisory feedback** on potential improvements

### Collaboration Boundaries

- AI **cannot** make architectural decisions without human approval
- AI **cannot** modify security-sensitive areas (see [Quality Gates](./WIKI-Quality-Gates.md))
- AI **must** follow [Spec System](./WIKI-Spec-System.md) planning requirements
- AI **should** suggest alternatives when requirements are unclear

## Effective Prompting

### Be Specific and Contextual

```bash
# ✅ Good: Specific with context
"Add analytics tracking to the header Help link. Use the existing useTrackClick hook and follow the pattern from the Analytics link."

# ❌ Poor: Vague and generic
"Add tracking to header"
```

### Reference Existing Patterns

```bash
# ✅ Good: References existing code
"Implement user authentication following the same pattern as the analytics system - with feature flags, TypeScript types, and E2E tests."

# ❌ Poor: No guidance provided
"Add user authentication"
```

### Specify Constraints

```bash
# ✅ Good: Clear constraints
"Create a modal component using shadcn/ui Dialog, no custom CSS, must be accessible, and include proper TypeScript types."

# ❌ Poor: No constraints
"Create a modal"
```

## Workflow Integration

### Starting New Work

#### Simple Changes:

```bash
/dev:plan-feature
# Provide specific requirements using Simple Lane template
# AI generates checklist plan (≤15 steps)
# Review plan before proceeding to implementation
```

#### Complex Features:

```bash
/specify
# Provide detailed problem statement and constraints
# AI creates structured specification using Full Kernel template

/plan
# AI converts specification to implementation plan
# Review technical approach and dependencies

/tasks
# AI breaks plan into actionable development tasks
# Prioritize and sequence task execution
```

### During Implementation

Always reference [Planning Templates](./WIKI-Planning-Templates.md) for required inputs and expected outputs.

#### Code Generation Requirements:

- **TypeScript**: Strict typing, no `any` types
- **Testing**: Unit tests and E2E coverage required
- **Security**: Input validation and secure patterns
- **Styling**: shadcn/ui components with design tokens only
- **Documentation**: Code comments and updates to relevant docs

## Safety Rails

### Quality Gates Integration

All AI-generated code must pass [Quality Gates](./WIKI-Quality-Gates.md):

- TypeScript compilation
- ESLint rules
- Unit test coverage
- E2E test verification
- Security scanning

### Restricted Areas (Red Zone)

AI **must not** modify:

- `.github/workflows/**` - CI/CD configurations
- Environment files (`.env*`)
- Security policies and configurations
- Database migration files
- Release and deployment scripts
- Any credentials, API keys, tokens, or PII (never store or paste secrets in the repo or prompts)

### Allowed Modification Areas

AI **can** modify:

- `apps/` - Application source code
- `packages/` - Shared packages and utilities
- `docs/**` - Documentation
- Test files and specifications
- Component implementations

## Escalation Rules

### When AI Should Escalate to Human

1. **Ambiguous requirements** - Multiple valid interpretations exist
2. **Architecture decisions** - Cross-cutting concerns or new patterns
3. **Security implications** - Potential security risks identified
4. **Performance constraints** - Complex optimization requirements
5. **External dependencies** - New packages or services needed
6. **Breaking changes** - Modifications that affect existing functionality

### Escalation Process

1. **Stop current work** and document the blocker
2. **Provide context** - What was attempted and why it's blocked
3. **Suggest alternatives** - Possible approaches with trade-offs
4. **Request specific guidance** - What decision or clarification is needed
5. **Wait for human input** before proceeding

### Decision Documentation

When humans provide escalation guidance:

- Document decision rationale in commit messages
- Update relevant specifications if architectural
- Note any new patterns for future consistency
- Ensure decision is traceable in planning artifacts

---

_Effective AI collaboration combines clear communication with rigorous quality standards and human oversight_
