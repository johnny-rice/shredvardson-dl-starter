# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records that document significant architectural decisions made for this project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## When to Create an ADR

Create an ADR when you make a decision that:
- Affects the structure, behavior, or quality attributes of the system
- Is difficult to reverse (high cost of change)
- Impacts multiple teams or components
- Involves trade-offs between multiple alternatives
- Sets precedent for future decisions
- **Changes AI prompt structure, risk policies, or constitutional rules**
- **Modifies development workflow automation or tooling**
- **Affects security, data handling, or compliance approach**

### ADR Checklist

Write an ADR if you answer "YES" to any:
- [ ] Decision affects system structure/behavior/quality attributes
- [ ] Change is difficult/expensive to reverse  
- [ ] Impacts multiple teams/components
- [ ] Involves trade-offs between alternatives
- [ ] Sets precedent for future decisions
- [ ] Changes AI prompt structure, risk policies, or constitutional rules
- [ ] Modifies development workflow automation or tooling
- [ ] Affects security, data handling, or compliance approach

## ADR Format

Use this lightweight format:

```markdown
# ADR-001: [Decision Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX  
**Deciders:** [Names or roles of decision makers]

## Context

What is the issue motivating this decision or change?

## Decision

What is the change that we're proposing or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive
- [List benefits]

### Negative  
- [List drawbacks or risks]

### Neutral
- [List other impacts]
```

## ADR Lifecycle

1. **Proposed** - Decision is being considered
2. **Accepted** - Decision is approved and should be implemented
3. **Deprecated** - Decision is no longer recommended but existing implementations remain
4. **Superseded** - Decision has been replaced by a newer ADR

## Numbering

ADRs are numbered sequentially (ADR-001, ADR-002, etc.) in the order they are created, not in the order they are accepted.

## Storage and Discovery

- Store ADRs as Markdown files in this directory
- Name files as `ADR-XXX-title-in-kebab-case.md`
- Link related ADRs to show decision evolution
- Reference ADRs in relevant documentation and code comments

## Examples of ADR-worthy Decisions

- Choice of database technology
- Authentication/authorization approach  
- API design patterns
- Frontend state management strategy
- Testing strategy and frameworks
- Deployment and CI/CD approaches
- Security architecture decisions
- Performance optimization strategies

## Quick Start

To create a new ADR:

1. Copy the template format above
2. Assign the next sequential number
3. Fill in the decision details
4. Start with "Proposed" status
5. Socialize with team for feedback
6. Update status to "Accepted" when approved