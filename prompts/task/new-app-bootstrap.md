# New App Bootstrap Task
**Intent:** Bootstrap a new app using the dl-starter template system
**Inputs:** App name, domain, company name, bootstrap mode (monorepo/export)  
**Expected Output:** Fully configured app ready for development
**Risks/Guardrails:** Validate all placeholders replaced; ensure doctor passes before proceeding

**Objective:** Bootstrap a new app using the dl-starter template system.

## Context Files

Read these first to understand the system:

- `docs/llm/context-map.json` - Monorepo area definitions
- `docs/llm/NEW_APP_KICKOFF.md` - Bootstrap process details
- `docs/llm/DESIGN_CONSTITUTION.md` - Architecture rules

## 6-Step Plan

### 1. Choose Mode

Ask user to choose bootstrap mode:

- **Monorepo (portfolio):** Create `apps/{APP_SLUG}` inside this repo
- **Export (new repo):** Copy template to `../{APP_SLUG}` as standalone project

### 2. Gather Requirements

Prompt for configuration:

- App Name (display name)
- Primary Domain (for production)
- Company Name (for branding)
- Default Locale (i18n, default: en-US)

### 3. Run Bootstrap Script

Execute the appropriate script:

- Portfolio: `pnpm tsx scripts/new-app.ts`
- Export: `pnpm tsx scripts/new-repo-from-template.ts`

### 4. Validate Setup

Run validation checks:

- `pnpm tsx scripts/starter-doctor.ts`
- Fix any failures before proceeding

### 5. Create PRD Stub

Ensure `docs/product/PRD.md` exists with:

- MVP scope definition
- Acceptance criteria
- Anti-goals (what we won't build)

### 6. Draft PR (Portfolio Mode Only)

Open draft PR with checklist:

- [ ] Placeholders replaced
- [ ] Constitution checksum updated
- [ ] Starter doctor passes
- [ ] PRD stub created
- [ ] Dev server runs: `pnpm turbo run dev --filter={APP_SLUG}`

## Success Criteria

- App boots successfully
- No placeholder violations
- Doctor validation passes
- Clear next steps provided

## Next Steps Reference

After bootstrap completion, direct user to:

1. Fill PRD with detailed MVP scope
2. Plan → Scaffold Tests → Implement → Prepare PR
3. See `docs/ai/CLAUDE.md` for development workflows