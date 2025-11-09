# Constitution Checksum Regeneration Instability

**Context.** During PR #323 (Issue #322), we encountered a scenario where the constitution checksum became stale immediately after regeneration. Running `pnpm constitution:update` followed by `node scripts/generate-command-index.js` and committing both files still resulted in a stale checksum error on the next `pnpm doctor` run. The command index hash changed from `7b1a237aed8b30d5` to `9c24e9af90c3698a` between runs, requiring a second checksum update commit.

**Rule.** **The command index regeneration script produces non-deterministic output, requiring constitution checksum updates to run AFTER all index regenerations are complete.**

**Example.**

```bash
# ❌ WRONG: Update checksum before index stabilizes
pnpm constitution:update
node scripts/generate-command-index.js
git add docs/llm/CONSTITUTION.CHECKSUM docs/commands/index.json
git commit -m "fix: update checksum and index"
# → Checksum will be stale on next doctor run!

# ✅ CORRECT: Regenerate index, then update checksum
node scripts/generate-command-index.js
pnpm constitution:update  # Runs AFTER index is stable
git add docs/llm/CONSTITUTION.CHECKSUM docs/commands/index.json
git commit -m "fix: update checksum and index"
# → Checksum matches stable index
```

**Observed Behavior:**

1. Initial run: `pnpm constitution:update` generates hash `7b1a237aed8b30d5` for command index
2. Commit both checksum and index files
3. Next `pnpm doctor` run: Hash changed to `9c24e9af90c3698a` (index regenerated)
4. Required second commit with updated checksum

**Guardrails.**

- Always run `pnpm constitution:update` as the **final step** after any command index changes
- If you modify command files (add/delete/rename in `.claude/commands/`), use this order:
  1. Make command file changes
  2. Run `node scripts/generate-command-index.js`
  3. Run `pnpm constitution:update` (captures stable index hash)
  4. Commit all three together
- Never trust a checksum update that ran before index regeneration
- If doctor fails with "constitution checksum is stale" after you just updated it, re-run `pnpm constitution:update` and commit again

**Root Cause Hypothesis.**
The command index script may include timestamps, random ordering, or environment-specific data that changes between runs. The constitution checksum hashes the index file contents, so any index variation invalidates the checksum.

**Severity.** normal

**UsedBy.** 0

**Tags.** #constitution #checksum #ci #command-index #doctor #validation #issue-322 #non-deterministic #build-order
