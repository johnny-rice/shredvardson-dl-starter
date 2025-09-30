# Specifications

This folder contains feature specifications created using the `/specify` command.

## File Naming Convention

- `feature-[number]-[name].md` - Sequential numbering for tracking
- Example: `feature-001-user-authentication.md`

## YAML Front-Matter Structure

Each specification must include YAML front-matter for traceability:

```yaml
---
id: SPEC-20250922-auth-magic-links
type: spec
issue: 123
parentId: ''
links: []
---
```

- `id`: Format `SPEC-YYYYMMDD-feature-name`
- `type`: Always "spec" (literal string)
- `issue`: GitHub issue number (numeric, required)
- `parentId`: Empty string "" for specs (they are root artifacts)
- `links`: Optional external references

## Purpose

- **Pure requirements**: What and why only, no technical details
- **User-focused**: Describes user needs and business value
- **Clarification tracking**: `[NEEDS_CLARIFICATION]` markers for ambiguities
- **Cross-reference**: Links to related features and GitHub issues

## Workflow Integration

1. Created via `/specify` command in Claude Code
2. Links to corresponding plan in `../plans/` folder
3. References GitHub issue for tracking and outcomes
4. Updated with learnings post-implementation

See `docs/constitution.md` for full spec-driven development guidelines.
