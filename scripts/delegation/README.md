# Delegation Scripts

Scripts for delegating work to Claude Code web.

## create-package.sh

Creates a ready-to-paste delegation package for Claude Code web.

### Usage

```bash
./scripts/delegation/create-package.sh <issue-number>
```

### Example

```bash
# Create delegation package for issue #258
./scripts/delegation/create-package.sh 258
```

This will:
1. ✅ Fetch issue details from GitHub
2. ✅ Find and include the spec file (if exists)
3. ✅ Add implementation requirements
4. ✅ Include PR template
5. ✅ Copy to clipboard (macOS/Linux)

### What Gets Packaged

- **Issue details** (title, body, labels)
- **Spec file** (from `specs/XXX-*.md` if exists)
- **Implementation requirements** (branch name, commit format, tests)
- **PR template** (proper format with traceability)

### Workflow

1. **Create spec first** (on desktop):

   ```bash
   /specify Issue #258
   ```

2. **Generate package**:

   ```bash
   ./scripts/delegation/create-package.sh 258
   ```

3. **Paste into Claude web** at <https://claude.ai/code>

4. **Review PR** (after Claude creates it):

   ```bash
   gh pr checkout <PR-NUMBER>
   # Fix metadata if needed
   git push
   ```

### Tips

- Always create the spec FIRST for better results
- Package is copied to clipboard automatically (macOS/Linux)
- If no clipboard, package is saved to `/tmp/delegation-XXX.txt`
- Works best with simple lane issues (1-2 files)

## See Also

- [docs/workflows/claude-web-delegation.md](../../docs/workflows/claude-web-delegation.md) - Full delegation guide
- [docs/ai/CLAUDE.md](../../docs/ai/CLAUDE.md) - Workflow overview
