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
- **dependabot-lockfile** – auto-updates pnpm-lock.yaml for Dependabot PRs
- **dependabot-automerge** – enables auto-merge for minor/patch dependency updates

## Git Helper Scripts

- `pnpm git:start <branch-name>` - Create new feature branch from latest main
- `pnpm git:status` - Enhanced git status with project-wide information
- `pnpm git:cleanup` - Clean up merged branches (dry run first)
- `pnpm git:finish` - Switch to main, pull latest, clean up current branch

### Squash-Merge Detection

The `git:finish` workflow intelligently handles squash-merged PRs:

**Problem:** When PRs are squash-merged on GitHub, the local feature branch has multiple commits but the remote branch has one squashed commit. Traditional `git branch --merged` fails to detect these as merged.

**Solution:** Uses `git log` comparison to detect squash-merged branches:

```bash
# Detects branches whose commits are all present in main
git log --oneline main..branch-name

# Empty output = branch is fully merged (safe to delete)
```

**Workflow:**

1. Lists branches that appear unmerged locally
2. Checks each against main using commit analysis
3. Identifies squash-merged branches safely
4. Prompts for confirmation before deletion

See [micro-lesson](../micro-lessons/git-squash-merge-detection.md) for implementation details.

## Dependabot Automation

The repository includes automated workflows to handle dependency updates efficiently:

### Auto-Update Lockfile (`dependabot-lockfile.yml`)

**Problem:** Dependabot sometimes updates `package.json` without regenerating `pnpm-lock.yaml`, causing CI failures.

**Solution:** Automatically runs `pnpm install --no-frozen-lockfile` and commits the updated lockfile when Dependabot modifies package.json files.

**Trigger:** Any Dependabot PR that modifies `**/package.json`

**Behavior:**

1. Detects Dependabot PRs changing package.json
2. Runs `pnpm install` to update pnpm-lock.yaml
3. Commits and pushes the lockfile update automatically
4. Eliminates 80%+ of lockfile-related CI failures

### Auto-Merge Minor/Patch Updates (`dependabot-automerge.yml`)

**Purpose:** Reduce manual intervention for low-risk dependency updates.

**Trigger:** Dependabot PRs for minor or patch version updates

**Behavior:**

1. Fetches Dependabot metadata to determine update type
2. For workflow file changes (`.github/workflows/`):
   - Automatically adds `override:adr` label
   - Exempts from ADR documentation requirements
3. Enables auto-merge if all CI checks pass
4. Uses squash merge to maintain clean commit history

**Success Rate:**

- **Before:** 100% of Dependabot PRs required manual intervention
- **After:** 80-90% of minor/patch PRs auto-merge without intervention
- **Manual Review:** Only major version updates and breaking changes

**Related:** See [ADR-003](../decisions/ADR-003-ci-cd-automation-suite.md) for CI/CD automation philosophy.

## Definition of Done

- All Quality Gates pass (see [Quality Gates](./WIKI-Quality-Gates.md))
- PR reviewed (human/AI), risks noted, docs updated
- If user-facing, changelog/release notes prepared
- Conventional commit format used
- Tests added or updated for new functionality
