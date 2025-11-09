---
skill: git
version: 1.0.0
category: workflow
token_cost: 500
description: Unified git workflow automation with intelligent routing
---

# /git - Unified Git Workflow

> **Note:** The deprecated `/git:branch` and `/git:commit` commands have been removed. Use the unified `/git` workflow instead.

**Purpose:** Consolidated git operations replacing 5+ separate commands

**Usage:**

```bash
/git <action> [args]
```

**Available Actions:**

- **branch** `<issue>` - Create feature branch from issue
  - Example: `/git branch Issue #123: Add feature`
  - Creates branch: `feature/123-add-feature`

- **commit** `[message]` - Smart commit with conventions
  - Example: `/git commit "feat: add new component"`
  - Follows Conventional Commits format

- **pr** `<subaction>` - Pull request operations
  - `prepare` - Prepare and create PR
  - `fix <number>` - Fix PR issues
  - Example: `/git pr prepare`, `/git pr fix 141`

- **workflow** - Full git workflow automation
  - Branch → Commit → PR → Merge
  - Guided interactive workflow

- **tag** `<version>` - Create release tag
  - Example: `/git tag v1.2.0`
  - Creates annotated git tag

**Token Cost:** ~500 tokens (vs 5,000+ for separate commands = **90% savings**)

**Implementation:** Progressive disclosure via script routing

- Fast validation (no token cost)
- Minimal JSON on success
- Detailed errors only when needed

**Execution:**

```bash
bash scripts/skills/git.sh "$@"
```
