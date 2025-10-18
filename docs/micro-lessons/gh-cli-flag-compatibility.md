---
UsedBy: 1
Severity: normal
---

# GitHub CLI Commands Don't All Support --json Flag

**Context.** Used `gh pr checks --json` in `/git:fix-pr` command documentation, but the flag is not supported by `gh pr checks`.

**Rule.** **Not all `gh` commands support `--json` flag - always verify with `gh <command> --help` before documenting or using flags.**

**Example.**

❌ **Wrong** (assumes flag exists):

```bash
gh pr checks $PR_NUMBER --json
# Error: unknown flag: --json
```

✅ **Correct** (verify first):

```bash
gh pr checks --help  # Check available flags
gh pr checks $PR_NUMBER  # Use without --json
```

✅ **JSON Alternative** (when --json is not supported):

```bash
# Structured checks for the latest commit on a PR
set -euo pipefail
PR_NUMBER=123

# Get the latest commit SHA (gh pr view supports --json)
SHA="$(gh pr view "$PR_NUMBER" --json commits -q '.commits[-1].oid')"

# Check runs (GitHub Apps)
gh api repos/:owner/:repo/commits/$SHA/check-runs \
  --jq '.check_runs[] | {name, status, conclusion}'

# Commit statuses (legacy/contexts)
gh api repos/:owner/:repo/commits/$SHA/status \
  --jq '.statuses[] | {context: .context, state: .state}'
```

**Guardrails.**

- Run `gh <command> --help` before using new flags in automation
- For JSON output, check whether the command supports it or use `gh api` with REST endpoints
- Test commands locally before documenting them in slash commands
- CodeRabbit will catch these issues in PR reviews if you miss them

**Why it matters:**

- Prevents documentation of broken commands
- Saves debugging time when commands fail in CI
- `gh api` is the fallback for structured data when `--json` is not available

**Tags:** gh-cli, GitHub, bash, automation, flags, documentation
