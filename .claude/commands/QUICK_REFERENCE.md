---
name: QUICK_REFERENCE
when: Fast command discovery and lookup without reading full documentation
purpose: Consolidated quick reference guide for 5 discovery commands and Skills catalog with progressive disclosure architecture
riskLevel: LOW
---

# Skills & Discovery Commands Quick Reference

**NEW**: DL Starter uses Skills for token-efficient, reusable workflows.

## 🎯 Discovery Commands (5 Total)

Use these to invoke Skills quickly:

| Command | Invokes Skill              | Purpose                                 |
| ------- | -------------------------- | --------------------------------------- |
| `/db`   | `supabase-integration`     | Database operations, migrations, RLS    |
| `/test` | `test-scaffolder`          | Generate test scaffolding               |
| `/git`  | `git-workflow`             | Git operations (commit, branch, PR)     |
| `/spec` | `prd-analyzer`             | Create specifications, extract criteria |
| `/code` | `implementation-assistant` | Implement features with standards       |

## 📝 Spec-Driven Workflow Commands (New)

Three new commands that integrate with the `prd-analyzer` Skill for complete spec-driven development:

| Command    | Purpose                                                            | Lane Detection |
| ---------- | ------------------------------------------------------------------ | -------------- |
| `/specify` | Create spec file with YAML frontmatter and automatic lane detection | Interactive    |
| `/plan`    | Generate technical plan with design discovery for spec-driven lane | Auto-triggered |
| `/tasks`   | Generate task breakdown with dependencies and estimates            | Both lanes     |

**Key Feature**: `/plan` automatically triggers 3-phase Socratic design discovery for `lane: spec-driven` features (auth, payments, DB, multi-day work).

---

## 📚 Skills Catalog (Coming Soon)

Skills use progressive disclosure (load only what's needed). Invoke directly or via discovery commands.

### Database & Backend

**`supabase-integration`** (via `/db`)

- Create migrations with RLS validation
- Generate TypeScript types from schema
- Validate database security policies
- **Token Savings**: 90% (485 lines → 50)

**`dependency-manager`**

- Weekly security vulnerability scans
- Auto-update patch versions
- Flag breaking changes for review

### Development Workflow

**`test-scaffolder`** (via `/test`)

- Generate unit, integration, E2E tests
- Integrate with Test Generator sub-agent
- Apply 70% coverage standards
- **Token Savings**: 66% (121 lines → 40)

**`implementation-assistant`** (via `/code`)

- Implement features following coding standards
- Apply error handling patterns
- Ensure TypeScript strict mode compliance
- **Token Savings**: 57% (88 lines → 35)

**`code-reviewer`**

- Pre-commit quality gates
- Security scanning (secrets, SQL injection)
- Linting and complexity checks
- **NEW CAPABILITY** (not possible with old commands)

### Git & Documentation

**`git-workflow`** (via `/git`)

- Conventional commits
- PR creation with templates
- Branch management
- **Token Savings**: 80% (160 lines → 40)

**`documentation-sync`**

- Detect code-docs mismatches
- Auto-update API docs
- Keep wiki in sync
- **NEW CAPABILITY**

**`learning-capturer`**

- Auto-save bug fixes as micro-lessons
- Detect reusable patterns
- Update troubleshooting guides
- **NEW CAPABILITY**

### Advanced Capabilities

**`project-scaffolder`**

- Generate Next.js routes with layouts/loading/error
- Create React components with tests + Storybook
- Generate Supabase tables with RLS
- **NEW CAPABILITY**

**`skill-creator`** (meta-skill)

- Create new Skills from conversation
- Generate SKILL.md, scripts, docs
- Self-improving system
- **NEW CAPABILITY**

**`prd-analyzer`** (via `/spec`)

- Parse specification documents
- Extract acceptance criteria
- Auto-chain to test-scaffolder
- **Token Savings**: 71% (105 lines → 30)

---

## 🔗 Common Workflows

### Quick Feature (Simple Workflow)

```bash
/test           # Generate failing tests
/code           # Implement to pass tests
/git commit     # Create conventional commit
```

### Spec-Driven Feature (New Workflow)

```bash
/specify        # Create spec with lane detection
/plan           # Generate plan (triggers design discovery for spec-driven lane)
/tasks          # Generate task breakdown
/code           # Implement tasks
/git commit     # Commit
```

### Legacy Spec Workflow

```bash
/spec           # Create spec, extract criteria (auto-chains to /test)
/code           # Implement
/git commit     # Commit
```

### Database Migration

```bash
/db create add_user_preferences
# Skill:
# 1. Generates migration file
# 2. Validates RLS policies
# 3. Updates TypeScript types
# 4. Runs Supabase advisors
```

### Auto-Fix PR Feedback

```bash
/git fix-pr 135
# Skill analyzes CI, CodeRabbit, doctor feedback
# Categorizes auto-fixable vs manual
# Applies fixes iteratively
```

---

## 📖 Learning More

- **Skills Documentation**: `.claude/skills/README.md` (available after Phase 1 implementation)
- **Skills Architecture**: `docs/adr/002-skills-architecture.md`
- **Create Your Own Skill**: Use `skill-creator` Skill

---

## 🔄 Legacy Commands (Deprecated)

The following 27 legacy slash commands are being migrated to Skills architecture:

**Git Commands** (7 commands → consolidated into `git-workflow` Skill):

- `/git:branch`, `/git:commit`, `/git:fix-pr`, `/git:pr-assistant`, `/git:prepare-pr`, `/git:tag-release`, `/git:workflow`

**Development Commands** (4 commands → consolidated into Skills):

- `/dev:implement`, `/dev:init-new-app`, `/dev:plan-feature`, `/dev:refactor-secure`

**Specification Commands** (4 commands → consolidated into `prd-analyzer` Skill):

- `/spec:specify`, `/spec:plan`, `/spec:tasks`, `/spec:adr-draft`

**Documentation Commands** (1 command → consolidated into `documentation-sync` Skill):

- `/docs:generate`

**GitHub Commands** (3 commands → consolidated into Skills):

- `/github:create-issue`, `/github:capture-learning`, `/github:update-wiki`

**Operations Commands** (2 commands → consolidated into Skills):

- `/ops:learning-capture`, `/ops:wiki-sync`

**Quality Commands** (2 commands → consolidated into `code-reviewer` Skill):

- `/quality:run-linter`, `/review:self-critique`

**Testing Commands** (1 command → consolidated into `test-scaffolder` Skill):

- `/test:scaffold`

**Security Commands** (1 command → `security-scanner` Skill):

- `/security:scan`

**Accessibility Commands** (1 command → `accessibility-auditor` Skill):

- `/accessibility:audit`

**Database Commands** (1 command → `supabase-integration` Skill):

- `/db:migrate`

**Research Commands** (1 command → Research Agent):

- `/research:explore`

**Deprecation Timeline**: These commands will remain functional during the 12-week migration window but will redirect to Skills. See [Skills Migration Plan](../../docs/adr/002-skills-architecture.md) for details.

---

**Token Efficiency**: Skills save 51-90% tokens compared to old commands
**Self-Improving**: System creates new Skills from learned patterns
**Sub-Agent Integration**: Skills orchestrate, sub-agents execute

---

**Last updated:** 2025-10-21
**Total discovery commands:** 5
**Total Skills (planned):** 11
