# Implementation Tasks

This folder contains actionable task breakdowns created using the `/tasks` command.

## File Naming Convention
- `feature-[number]-[name].md` - Matches specification and plan
- Example: `feature-001-user-authentication.md`

## YAML Front-Matter Structure
Each task breakdown must include YAML front-matter for traceability:

```yaml
---
id: TASK-20250922-auth-magic-links
type: task
issue: 123
parentId: PLAN-20250922-auth-magic-links
links: []
---
```

- `id`: Format `TASK-YYYYMMDD-feature-name`
- `type`: Always "task"
- `issue`: GitHub issue number (inherited from spec)
- `parentId`: Must reference the corresponding plan ID
- `links`: Optional external references

## Purpose
- **Actionable breakdown**: Converts technical plan into specific implementation steps
- **TDD enforcement**: Tasks ordered by constitutional requirements
- **Progress tracking**: Checkboxes for completion status
- **Command integration**: Specific Claude Code commands for each task
- **Branch strategy**: Git workflow and commit organization

## Constitutional Task Order (Enforced)
1. **Contracts & Interfaces**: TypeScript types and API contracts
2. **Test Foundation**: Integration → E2E → Unit test setup
3. **Implementation**: Components, business logic, API integration
4. **Integration & Polish**: UI integration, error handling
5. **Documentation & Release**: Docs, security review, deployment

## Workflow Integration
1. Created via `/tasks` command referencing plan and specification
2. Updates GitHub issue with task checklist
3. Guides step-by-step implementation using existing commands
4. Tracks progress and completion status
5. Links back to outcomes for learning capture

## Implementation Commands
- `/test:scaffold` - Create test files
- `/dev:implement` - Build features
- `/dev:refactor-secure` - Security improvements
- `/quality:run-linter` - Code quality checks
- `/git:commit` - Conventional commits

See `docs/constitution.md` for complete development workflow guidelines.