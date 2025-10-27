---
UsedBy: 1
Severity: high
---

# Constitution Checksum Invalidates After Merging Main

**Context.** After fixing CI failures (constitution checksum + wiki sync) and successfully merging main into a feature branch, the same `doctor` check failed again with identical errors. The merge from main brought in changes to constitution binding sources, invalidating the previously-updated checksum.

**Rule.** **After merging main into a feature branch, always regenerate constitution checksum and wiki artifacts, even if they were recently updated, because main may have changed the binding sources.**

**Example.**

```bash
# ❌ Wrong: Fix checksum, merge main, assume it's still valid
pnpm constitution:update
pnpm wiki:generate
git commit -m "fix: update checksum and wiki"
git merge origin/main  # ⚠️ main changed binding sources!
git push  # ❌ CI fails: checksum is stale again

# ✅ Correct: Regenerate after merge
pnpm constitution:update
pnpm wiki:generate
git commit -m "fix: update checksum and wiki"
git merge origin/main
# Merge changed binding sources, regenerate:
pnpm constitution:update
pnpm wiki:generate
git commit -m "fix: update checksum after merge"
git push  # ✅ CI passes
```

**Why This Happens.** The constitution checksum hashes binding source files (commands, agents, docs). When main is merged in, it may bring new commands, updated agent contracts, or modified documentation that changes those source files. Your pre-merge checksum is now stale.

**Guardrails.**

- Add to PR merge workflow: always run `pnpm constitution:update && pnpm wiki:generate` after merging main
- Run `pnpm doctor` locally after merge to catch this before pushing
- Consider adding a git post-merge hook to remind about regenerating artifacts
- In CI, treat constitution/wiki checks as post-merge validation, not pre-merge

**Tags.** constitution,checksum,merge,git,ci,doctor,wiki,generated-artifacts
