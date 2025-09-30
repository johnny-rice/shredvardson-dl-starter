# Technical Plans

This folder contains technical implementation plans created using the `/plan` command.

## File Naming Convention

- `feature-[number]-[name].md` - Matches corresponding specification
- Example: `feature-001-user-authentication.md`

## YAML Front-Matter Structure

Each plan must include YAML front-matter for traceability:

```yaml
---
id: PLAN-20250922-auth-magic-links
type: plan
issue: 123
parentId: SPEC-20250922-auth-magic-links
links: []
---
```

- `id`: Format `PLAN-YYYYMMDD-feature-name`
- `type`: Always "plan"
- `issue`: GitHub issue number (inherited from spec)
- `parentId`: Must reference the corresponding spec ID
- `links`: Optional external references

## Purpose

- **Technical architecture**: How to implement within constitutional constraints
- **Implementation strategy**: Component design, state management, API design
- **Testing approach**: TDD strategy following constitution order
- **Security considerations**: Input validation, auth, data protection
- **Risk assessment**: Technical risks and mitigation strategies

## Constitutional Constraints

All plans must align with:

- Next.js 15 + TypeScript + Tailwind CSS stack
- Security-first development patterns
- Minimal dependencies philosophy
- TDD approach: tests before implementation

## Workflow Integration

1. Created via `/plan` command referencing existing specification
2. Links to task breakdown in `../tasks/` folder
3. Updates GitHub issue with technical context
4. Guides implementation phase execution

See `docs/constitution.md` for architectural decisions and constraints.
