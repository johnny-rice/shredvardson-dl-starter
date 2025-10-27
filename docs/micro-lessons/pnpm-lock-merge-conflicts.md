---
UsedBy: 1
Severity: normal
---

# pnpm-lock.yaml Merge Conflicts: Always Accept Main Branch Version

**Context.** When merging main into a feature branch, `pnpm-lock.yaml` frequently has conflicts due to dependency updates on both sides. Manually resolving these conflicts is error-prone and time-consuming.

**Rule.** **For pnpm-lock.yaml merge conflicts, always accept the main branch version (`git checkout --theirs`) and verify with `pnpm install --frozen-lockfile`.**

**Example.**

```bash
# ❌ Don't manually edit pnpm-lock.yaml conflict markers
# It's too complex and error-prone

# ✅ Accept main's version and verify
git checkout --theirs pnpm-lock.yaml
git add pnpm-lock.yaml
pnpm install --frozen-lockfile  # Verify integrity
```

**Rationale.** The lockfile from main represents the latest validated dependency resolution. Your feature branch's package.json changes will be re-resolved automatically during install. If there are genuine incompatibilities, `pnpm install` will catch them.

**Guardrails.**

- After accepting main's lockfile, run `pnpm install --frozen-lockfile` to verify no integrity issues
- If the install succeeds, your package.json changes are compatible with main's lockfile
- If it fails, you have a genuine dependency conflict that needs package.json changes, not lockfile edits
- Always run full test suite after resolving to catch any runtime incompatibilities

**Tags.** git,merge,pnpm,lockfile,dependencies,conflict-resolution
