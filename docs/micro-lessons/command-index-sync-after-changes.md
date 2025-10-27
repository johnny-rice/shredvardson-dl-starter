---
UsedBy: 1
Severity: normal
---

# Command Index Must Be Regenerated After Modifying Command Frontmatter

**Context.** PR #175 failed `routing-contract` check because `docs/commands/index.json` was out of sync with actual command files. The QUICK_REFERENCE.md purpose field was updated but the index wasn't regenerated.

**Rule.** **After modifying command frontmatter (YAML at top of .md files), regenerate the command index with `node scripts/generate-command-index.js` before committing.**

**Example.**

```markdown
# ❌ Wrong: Update QUICK_REFERENCE.md purpose, commit without regenerating

# .claude/commands/QUICK_REFERENCE.md

---

## purpose: "5 discovery commands + Skills catalog" # Changed from "27 commands"

# ... rest of file
```

```bash
git commit -m "docs: update QUICK_REFERENCE purpose"
git push  # ❌ CI fails: routing-contract detects index out of sync
```

```bash
# ✅ Correct: Regenerate index after frontmatter changes
# After editing .claude/commands/QUICK_REFERENCE.md
node scripts/generate-command-index.js
git add docs/commands/index.json
git commit -m "docs: update QUICK_REFERENCE purpose and regenerate index"
git push  # ✅ CI passes
```

**Why This Matters.** The command index (`docs/commands/index.json`) is used by:

- `routing-contract` CI check to validate structure
- LLM context routing to find relevant commands
- Documentation generation scripts

Changes to command metadata must be reflected in the index for accurate routing.

**Guardrails.**

- Run `node scripts/generate-command-index.js` after editing any `.claude/commands/**/*.md` frontmatter
- `routing-contract` CI check validates index is in sync (catches this pre-merge)
- Consider adding a pre-commit hook to auto-regenerate index if command files changed
- The index compares structure (ignoring `generated` timestamp), so only field changes trigger failures

**Tags.** commands,index,frontmatter,yaml,ci,routing-contract,generated-files
