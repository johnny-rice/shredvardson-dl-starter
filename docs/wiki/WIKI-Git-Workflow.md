# Git Workflow & Scripts (LLM-Facing)

## Branch Strategy

- Feature branches: `feat/<short-kebab>`
- Fix branches: `fix/<short-kebab>`
- Chore/tooling: `chore/<short-kebab>`

## Commits

- **Conventional Commits** (feat, fix, chore, docs, refactor, test, perf, ci)
- Keep scope small; prefer multiple atomic commits over one giant commit.

## PRs

- Title: Conventional summary (e.g., `feat: add X to Y`)
- Description should include:
  - What changed (1–3 bullets)
  - Why (link to issue/spec)
  - Screenshots/GIF if UI
  - Test plan (what you ran)
- If review uncovers a reusable pattern, add a Micro‑Lesson (≤90s) via [template](../micro-lessons/template.md), run `pnpm learn:index`, and tick the PR checklist
- Prefer using the automation in [Commands](./WIKI-Commands.md) to generate PRs.

## Required Scripts / Jobs (document the happy path)

- `pnpm lint` - ESLint code quality checks
- `pnpm typecheck` - TypeScript compilation verification
- `pnpm test:unit` - Unit test execution with Vitest
- `pnpm test:e2e` - End-to-end tests with Playwright
- `pnpm build` - Production build verification
- `pnpm dev` - Local development server
- `pnpm doctor` - Repository health and integrity checks

## CI Jobs

- **ci** – build, typecheck, tests, lint (main quality pipeline)
- **doctor** – repo sanity checks, link validation, configuration integrity
- **spec-gate** – spec/quality contracts and governance checks

## Git Helper Scripts

- `pnpm git:start <branch-name>` - Create new feature branch from latest main
- `pnpm git:status` - Enhanced git status with project-wide information
- `pnpm git:cleanup` - Clean up merged branches (dry run first)
- `pnpm git:finish` - Switch to main, pull latest, clean up current branch

## Definition of Done

- All Quality Gates pass (see [Quality Gates](./WIKI-Quality-Gates.md))
- PR reviewed (human/AI), risks noted, docs updated
- If user-facing, changelog/release notes prepared
- Conventional commit format used
- Tests added or updated for new functionality
