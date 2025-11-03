# Contributing

Thank you for your interest in contributing! This document outlines the development workflow and quality standards.

## Before Opening a PR

**Required checks (must pass):**

- [ ] `pnpm doctor` - validates docs, scripts, and workspace integrity
- [ ] `pnpm lint` - code style and consistency
- [ ] `pnpm typecheck` - TypeScript compilation
- [ ] `pnpm build` - production build succeeds
- [ ] `pnpm test` - all tests pass

**Quick verification:**

```bash
pnpm doctor && pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

**💡 Pro tip:** If you're changing workflow files, scripts, or prompts, create the ADR first to avoid CI failures!

## Development Workflow

1. **Setup:** `pnpm install`
2. **Start dev server:** `pnpm dev`
3. **Make changes** following the architecture guardrails
4. **Run quality checks** (see above)
5. **Open PR** with filled-out template

## Learning Loop in 60s

When you discover a reusable pattern or fix a tricky issue:

1. **Write ≤90s note** using `docs/micro-lessons/template.md`
2. **Update index:** `pnpm learn:index`
3. **Tick PR checklist** and reference the lesson in "Used Micro-Lesson" field

**Top-10 Index:** [docs/micro-lessons/INDEX.md](docs/micro-lessons/INDEX.md) - always fresh, auto-rotates by recency.

**Promote only when repeated ≥2× or high blast radius.**
**Validate**: run `pnpm doctor` before pushing; CI will block only on guardrail failures.

**Micro-retro** (every other Friday, 10 min):

- Review learnings metrics from CI job summaries + `uses-micro-lesson` PRs
- **Decide**: promote (≥2 repeats or Severity=high), prune (90+ days unused), or keep in rotation
- Capture one concrete "next guardrail" if new failure patterns emerge

This keeps agent context lean and prevents repeat issues. The doctor tracks metrics automatically.

## Architecture Guardrails

- **Use adapters:** All vendor SDKs go in `/lib/adapters/*` - never import directly in UI
- **Tokenized design:** Use `hsl(var(--...))` tokens, no hex colors in components
- **Workspace boundaries:** Follow `docs/llm/context-map.json` allowed patterns
- **Environment:** Import from `@/lib/env`, never `process.env` directly

## Documentation Standards

- **Command docs:** All `.claude/commands/*.md` must be linked in `docs/ai/CLAUDE.md`
- **Script references:** All `pnpm`/`npm`/`turbo` commands in docs must exist
- **Path references:** All file/directory paths in docs must exist
- **Allowlist:** Use `.doctor-allowlist.json` sparingly for intentional exceptions

### ADR (Architecture Decision Record) Requirements

**ADR documentation is REQUIRED** for changes to:

- `prompts/**` - AI behavior and prompt engineering
- `scripts/**` - Build, deployment, and utility scripts
- `.github/workflows/**` - CI/CD and automation workflows

**Process:**

1. Create ADR file: `docs/decisions/ADR-XXX-descriptive-name.md`
2. Use template: `docs/decisions/0001-template.md`
3. Add ADR reference to PR description: `ADR: ADR-XXX`
4. **Emergency bypass:** Use `override:adr` label (document ADR within 24h post-merge)

**Quick ADR Creation:**

```bash
# Use the helper script (recommended)
pnpm adr:create "Your Decision Title"
# Edit the generated file
# Reference in PR: "ADR: ADR-XXX" (script shows the number)

# Manual approach
cp docs/decisions/0001-template.md docs/decisions/ADR-004-your-change.md
# Edit: fill Status, Date, Context, Decision, Consequences
# Reference in PR: "ADR: ADR-004"
```

## Quality Standards

### Definition of "Green"

All must be true:

- [ ] `doctor` passes (no FAIL; WARNs only if allowlisted)
- [ ] `lint`, `typecheck`, `build`, `test` pass
- [ ] Branch protection checks pass: `doctor`, `build`, `lint`, `typecheck`
- [ ] `.env.example` covers all env keys used by code
- [ ] `docs/ai/CLAUDE.md` indexes every command doc (no orphans)
- [ ] `turbo.json` pipeline tasks are exposed by at least one package script

### CI Requirements

Branch protection requires these checks:

- `doctor` - documentation and workspace validation
- `build` - production build succeeds
- `lint` - code style standards
- `typecheck` - TypeScript compilation
- Tests (unit/e2e) if they exist

**Workflow Security:** See [docs/workflow-security.md](docs/workflow-security.md) for GitHub Actions security practices.

## Workspace & Tasks

### New App from Template

**Monorepo (portfolio)** – new app inside this repo

1. `pnpm i`
2. `pnpm tsx scripts/new-app.ts`
3. Fill `docs/product/PRD.md` MVP scope (acceptance + anti-goals)
4. `pnpm tsx scripts/starter-doctor.ts`
5. `pnpm turbo run dev --filter=<APP_SLUG>`

**Export (new product repo)**

1. `pnpm i`
2. `pnpm tsx scripts/new-repo-from-template.ts`
3. `cd ../<APP_SLUG> && pnpm i`
4. Fill `docs/product/PRD.md` MVP scope
5. `pnpm tsx scripts/starter-doctor.ts`
6. `pnpm dev`

### Architecture Rules

- Use adapters in `apps/web/src/lib/adapters/*` for vendors (auth/db/ai/analytics/payments/storage/logger).
- Use shared packages: `@ui/components`, `@shared/types`, `@shared/ai`, `@shared/config`.
- Use tokenized Tailwind via `hsl(var(--...))` (no hex colors in components).
- Design tokens live in `packages/ui/styles/tokens.css` (centralized).
- Sentry is opt-in: only initializes if `SENTRY_DSN` is set (silent otherwise).
- Keep diffs small and reversible.

### Environment Rules

- Never read `process.env` directly. Always import from `@/lib/env`.
- Public values must start with `NEXT_PUBLIC_` and live under `client` in `apps/web/src/lib/env.ts`.
- Server secrets live under `server`. Do not import server-only envs in client components.
- If env validation fails, fix `.env.local` or Vercel Project Settings → Environment Variables.

## Troubleshooting

### Git & PR Troubleshooting

- Never ask for or store secrets (SSH keys, tokens) in files or .env.
- If `git push` fails with `Permission denied (publickey)`:
  1. Assume non-interactive shell. Ask the user to run one of:
     - `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`
     - or switch to HTTPS push: `git remote set-url --push origin https://github.com/<user>/<repo>.git && gh auth setup-git`
  2. After they confirm, retry `git push -u origin <branch>`.
- If push still fails, run `git remote -v` and `ssh -T git@github.com` and show the outputs.

### Doctor Failures

If `pnpm doctor` fails:

1. **Constitution checksum stale:** The checksum is automatically updated when you run `pnpm doctor`. Commit the updated `docs/llm/CONSTITUTION.CHECKSUM` file.
   - This happens when you modify binding source files like `docs/ai/CLAUDE.md`, `docs/constitution.md`, etc.
   - The checksum ensures governance docs remain in sync
2. **Script errors:** Add missing scripts to `package.json` or update docs
3. **Path errors:** Create missing directories/files or update references
4. **Anchor errors:** Add missing headings or fix links
5. **Intentional exceptions:** Add to `.doctor-allowlist.json` with comment explaining why

### Common Issues

- **Import errors:** Use adapters instead of direct vendor imports
- **Style errors:** Use design tokens instead of hardcoded colors
- **Build errors:** Check TypeScript and environment configuration
- **Test errors:** Ensure test setup and dependencies are correct

## Getting Help

- Check existing issues and discussions
- Review the architecture docs in `docs/llm/`
- Run `pnpm doctor` for detailed validation reports
- Follow the patterns established in existing code

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
