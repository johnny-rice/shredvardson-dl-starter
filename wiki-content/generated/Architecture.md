# Architecture Overview

## System Design

This starter implements a dual-lane AI development system:

- **Simple Lane**: For small changes, bug fixes, and routine tasks
- **Spec-Driven Lane**: For complex features requiring structured planning

## Key Components

### Command System

- Slash commands for structured workflows
- Risk-based routing and approval gates
- Machine-readable command index

### Quality Gates

- Constitutional compliance checking
- Automated testing and linting
- Security scanning and review

### GitHub Integration

- Issue templates for different workflow types
- Automated artifact cross-referencing
- Wiki synchronization for context sharing

## File Structure

```
.claude/commands/     # Slash command definitions
docs/constitution.md  # Governance and constraints
docs/commands/        # Machine-readable command metadata
specs/               # Requirements specifications
plans/               # Technical implementation plans
tasks/               # Actionable development tasks
```

---

_Generated automatically_
