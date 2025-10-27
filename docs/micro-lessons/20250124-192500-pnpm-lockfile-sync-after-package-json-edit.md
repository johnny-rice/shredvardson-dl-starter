---
UsedBy: 0
Severity: high
---

# ERR_PNPM_OUTDATED_LOCKFILE: Always Run `pnpm install` After Editing package.json

**Context.** When adding dependencies directly to `package.json` (especially in monorepo root for shared devDependencies like Handlebars), the lockfile becomes out of sync. CI fails with `ERR_PNPM_OUTDATED_LOCKFILE` because `--frozen-lockfile` flag prevents installation when lockfile doesn't match package.json.

**Rule.** **After editing any package.json file, immediately run `pnpm install` to update pnpm-lock.yaml. Commit both files together.**

**Example.**

```bash
# ❌ Wrong: Edit package.json and commit without updating lockfile
vim package.json  # Add "@types/handlebars": "^4.1.0"
git add package.json
git commit -m "Add handlebars types"
# → CI fails: ERR_PNPM_OUTDATED_LOCKFILE

# ✅ Correct: Update lockfile immediately after editing
vim package.json  # Add "@types/handlebars": "^4.1.0"
pnpm install      # Updates pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "Add handlebars types"
# → CI passes: lockfile matches package.json
```

**CI Error Details:**

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because
pnpm-lock.yaml is not up to date with package.json

Failure reason:
specifiers in the lockfile ({...}) don't match specs in package.json ({...})
```

**Rationale.**

- CI environments use `--frozen-lockfile` by default to ensure reproducible builds
- This flag prevents pnpm from modifying the lockfile, so any mismatch causes immediate failure
- The lockfile encodes the full dependency resolution tree; package.json only lists direct dependencies
- Forgetting to update the lockfile means CI can't install dependencies at all

**Guardrails:**

- **Pre-commit hook:** Consider adding a hook that verifies `pnpm install --frozen-lockfile` succeeds before allowing commits
- **Local verification:** After editing package.json, run `pnpm install --frozen-lockfile` to simulate CI behavior
- **Monorepo awareness:** Changes to workspace package.json files affect root lockfile too
- **Diff check:** Before pushing, verify both package.json and pnpm-lock.yaml are staged together

**Related Patterns:**

- [pnpm-lock-merge-conflicts.md](./pnpm-lock-merge-conflicts.md) - For handling lockfile conflicts during merges
- Different from merge conflicts: this is about sync, not conflict resolution

**Real-World Impact:**

- Blocked PR #190 with 3 failing CI checks (docs-link-check, doctor, setup/setup)
- Root cause: Added `handlebars` and `@types/handlebars` to root package.json without running `pnpm install`
- Fix: Simple `pnpm install` locally, commit lockfile, all checks passed

**Tags.** #pnpm #lockfile #ci #dependencies #frozen-lockfile #monorepo #phase-4 #pr-190
