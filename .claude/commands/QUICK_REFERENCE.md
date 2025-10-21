---
name: QUICK_REFERENCE
when: Fast command discovery and lookup without reading full documentation
purpose: Consolidated quick reference guide for all 27 available commands with descriptions and usage examples
riskLevel: LOW
---

# Claude Commands Quick Reference

Quick lookup guide for all available slash commands. Use this to find the right command without reading full documentation.

## 🔍 How to Use This Guide

1. **Find your task** in the categories below
2. **Run the command** with `/command-name`
3. **Get detailed help** by reading the full command file if needed

---

## Git Commands

### `/git:branch`
**Purpose:** Create new feature branch from issue
**Usage:** `/git:branch <type> <issue#> <slug>`
**Example:** `/git:branch feature 123 add-dark-mode`
**When:** Starting work on a new issue

### `/git:commit`
**Purpose:** Create conventional commit for staged changes
**Usage:** `/git:commit`
**When:** Committing changes with proper formatting

### `/git:fix-pr`
**Purpose:** Auto-fix PR feedback from CI/CodeRabbit
**Usage:** `/git:fix-pr [PR#]`
**Example:** `/git:fix-pr 135`
**When:** PR has failing checks or feedback to address

### `/git:pr-assistant`
**Purpose:** Complete PR workflow with template
**Usage:** `/git:pr-assistant`
**When:** Creating a PR with full traceability

### `/git:prepare-pr`
**Purpose:** Prepare branch and create PR
**Usage:** `/git:prepare-pr`
**When:** Ready to create a pull request

### `/git:tag-release`
**Purpose:** Create and push git release tag
**Usage:** `/git:tag-release`
**When:** Releasing a new version

### `/git:workflow`
**Purpose:** Git workflow guidance and best practices
**Usage:** `/git:workflow`
**When:** Need help with git workflow

---

## Development Commands

### `/dev:implement`
**Purpose:** Implement feature from specification
**Usage:** `/dev:implement`
**When:** Ready to code after planning

### `/dev:init-new-app`
**Purpose:** Initialize new application with config
**Usage:** `/dev:init-new-app`
**When:** Starting a new app in the monorepo

### `/dev:plan-feature`
**Purpose:** Plan feature implementation approach
**Usage:** `/dev:plan-feature <issue#>`
**Example:** `/dev:plan-feature 123`
**When:** Before implementing a feature

### `/dev:refactor-secure`
**Purpose:** Refactor code with security focus
**Usage:** `/dev:refactor-secure`
**When:** Improving code quality and security

---

## Specification Commands

### `/spec:specify`
**Purpose:** Create detailed specification from issue
**Usage:** `/spec:specify <issue#>`
**Example:** `/spec:specify 123`
**When:** Need detailed spec before implementation

### `/spec:plan`
**Purpose:** Create implementation plan
**Usage:** `/spec:plan <issue#>`
**Example:** `/spec:plan 123`
**When:** Planning implementation approach

### `/spec:tasks`
**Purpose:** Generate task breakdown from spec
**Usage:** `/spec:tasks <issue#>`
**Example:** `/spec:tasks 123`
**When:** Breaking down work into tasks

### `/spec:adr-draft`
**Purpose:** Draft Architecture Decision Record
**Usage:** `/spec:adr-draft`
**When:** Making architectural decisions

---

## Documentation Commands

### `/docs:generate`
**Purpose:** Generate documentation for codebase
**Usage:** `/docs:generate`
**When:** Creating or updating documentation

---

## GitHub Commands

### `/github:create-issue`
**Purpose:** Create GitHub issue with template
**Usage:** `/github:create-issue`
**When:** Creating a new issue

### `/github:capture-learning`
**Purpose:** Capture learning as micro-lesson
**Usage:** `/github:capture-learning`
**When:** Discovered reusable pattern

### `/github:update-wiki`
**Purpose:** Update GitHub wiki pages
**Usage:** `/github:update-wiki`
**When:** Syncing wiki with docs

---

## Operations Commands

### `/ops:learning-capture`
**Purpose:** Create micro-lesson from pattern
**Usage:** `/ops:learning-capture <topic>`
**Example:** `/ops:learning-capture "doctor checks debugging"`
**When:** Found reusable pattern or solution

### `/ops:wiki-sync`
**Purpose:** Verify and fix wiki synchronization
**Usage:** `/ops:wiki-sync`
**When:** Checking wiki is up to date

---

## Quality Commands

### `/quality:run-linter`
**Purpose:** Run linter and fix issues
**Usage:** `/quality:run-linter`
**When:** Checking code quality

### `/review:self-critique`
**Purpose:** Self-review code changes
**Usage:** `/review:self-critique`
**When:** Before submitting PR

---

## Testing Commands

### `/test:scaffold`
**Purpose:** Generate test scaffolding
**Usage:** `/test:scaffold`
**When:** Creating tests for new code

---

## Security Commands

### `/security:scan`
**Purpose:** Scan for security vulnerabilities
**Usage:** `/security:scan <scope> <severity>`
**Example:** `/security:scan rls high`
**When:** Checking for security issues

---

## Accessibility Commands

### `/accessibility:audit`
**Purpose:** Run accessibility audit
**Usage:** `/accessibility:audit`
**When:** Checking UI accessibility

---

## Database Commands

### `/db:migrate`
**Purpose:** Create and run database migration
**Usage:** `/db:migrate`
**When:** Making database schema changes

---

## Research Commands

### `/research:explore`
**Purpose:** Deep codebase exploration
**Usage:** `/research:explore <topic>`
**Example:** `/research:explore "authentication flow"`
**When:** Understanding existing codebase

---

## 🎯 Common Workflows

### Starting New Feature
```bash
/git:branch feature <issue#> <slug>
/dev:plan-feature <issue#>
/dev:implement
/git:commit
/git:prepare-pr
```

### Fixing PR Feedback
```bash
/git:fix-pr [PR#]
# Reviews and auto-fixes issues
```

### Creating Specification
```bash
/spec:specify <issue#>
/spec:plan <issue#>
/spec:tasks <issue#>
```

### Pre-PR Checklist
```bash
/quality:run-linter
/review:self-critique
/test:scaffold
/git:prepare-pr
```

---

## 💡 Tips

- **Dry-run mode:** Many commands support `--dry-run` flag to preview actions
- **Help:** Read full command files in [.claude/commands/](.)  for detailed documentation
- **Shared patterns:** Git commands use shared templates in [git/shared/](git/shared/)
- **Automation:** Use commands together in workflows for efficiency

---

## 📚 Additional Resources

- **Full command docs:** [.claude/commands/README.md](README.md)
- **Git shared patterns:** [git/shared/](git/shared/)
- **Constitution:** [docs/constitution.md](../../docs/constitution.md)
- **CLAUDE.md:** [CLAUDE.md](../../CLAUDE.md)
- **Micro-lessons:** [docs/micro-lessons/](../../docs/micro-lessons/)

---

**Last updated:** 2025-10-18
**Total commands:** 27