# Getting Started (External LLM)

## Table of Contents
- [Quick Context](#quick-context)
- [Repository Overview](#repository-overview)
- [Key Commands](#key-commands)
- [Development Flow](#development-flow)

## Quick Context

This is a lightweight getting started guide for **external LLMs** helping with development tasks. For complete setup instructions with secrets and environment details, see the main repository README.

## Repository Overview

**Purpose**: AI-assisted development starter with dual-lane workflows
**Tech Stack**: Next.js 15, TypeScript, Turborepo, shadcn/ui, Tailwind CSS
**Quality**: Strict TypeScript, comprehensive testing, automated quality gates

### Key Directories
- `apps/web/` - Main Next.js application
- `packages/` - Shared libraries and types  
- `docs/wiki/` - External LLM documentation (this wiki)
- `.claude/commands/` - Slash command definitions
- `specs/`, `plans/`, `tasks/` - Planning artifacts

## Key Commands

**For planning and development:**
- `pnpm lint` - Code quality checks
- `pnpm typecheck` - TypeScript validation
- `pnpm test:unit` - Unit test execution  
- `pnpm test:e2e` - End-to-end testing
- `pnpm build` - Production build verification
- `pnpm dev` - Local development server

**For git operations:**
- `pnpm git:start <branch-name>` - Create feature branch
- `pnpm git:status` - Enhanced project status
- `pnpm git:cleanup` - Clean up merged branches

See [Git Workflow](./WIKI-Git-Workflow.md) for complete git processes.

## Development Flow

### Choose Your Lane
1. **Simple changes** → Use [Planning Templates](./WIKI-Planning-Templates.md) Simple Lane
2. **Complex features** → Use [Planning Templates](./WIKI-Planning-Templates.md) Spec Lane

### Quality Requirements
All code must pass [Quality Gates](./WIKI-Quality-Gates.md):
- TypeScript compilation
- ESLint rules  
- Unit and E2E tests
- Security scanning
- Build verification

### AI Collaboration
Follow [AI Collaboration](./WIKI-AI-Collaboration.md) guidelines for:
- Human-AI role boundaries
- Safety rails and restricted areas
- Escalation procedures
- Quality standards

---
*This guide provides essential context without environment-specific details or secrets*