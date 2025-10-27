---
skill: docs
version: 1.0.0
category: workflow
token_cost: 400
description: Documentation synchronization and validation
---

# /docs - Documentation Sync

**Purpose:** Sync documentation between repo and GitHub wiki

**Usage:**

```bash
/docs sync [--dry-run]
/docs validate
```

**Actions:**

**sync** - Synchronize documentation

- Detect changed documentation files
- Sync to GitHub wiki (if configured)
- Update cross-references
- Generate table of contents

**validate** - Validate documentation

- Check internal links
- Verify cross-references
- Validate markdown syntax
- Check for broken links

**Flags:**

- `--dry-run` - Preview changes without syncing

**Output:** JSON report with sync/validation results

**Token Cost:** ~400 tokens (progressive disclosure)

**When to Use:**

- After updating documentation
- Before creating PR with doc changes
- Manual documentation validation

**Examples:**

```bash
/docs sync              # Sync documentation changes
/docs sync --dry-run    # Preview sync operations
/docs validate          # Validate documentation
```

**Execution:**

```bash
bash scripts/skills/documentation-sync.sh "$@"
```
