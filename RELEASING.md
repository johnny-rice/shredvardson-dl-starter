# RELEASING.md

## Release Flow (Automated with Changesets)

1. **Ensure `main` is green** (doctor, build, lint, tests).

2. **Create changeset** for your changes:

   ```bash
   pnpm changeset
   ```

   - Select packages to version (major/minor/patch)
   - Write summary of changes for changelog

3. **Commit and merge** to main:
   - Changesets are committed with your feature
   - No manual version bumping needed

4. **Automated release** (triggers on merge to main):
   - GitHub Actions runs `changeset version` to update versions
   - Creates/updates CHANGELOG.md files
   - Commits version changes back to main
   - Tags release with `vX.Y.Z` format

## Expected Tag Format

- `v1.0.0` for major releases
- `v0.1.0` for minor releases
- `v0.0.1` for patch releases

## Commit Types That Trigger Releases

- **Major**: Breaking changes (`BREAKING CHANGE:` in commit body)
- **Minor**: New features (`feat:` commits)
- **Patch**: Bug fixes (`fix:` commits), other changes

## Files Modified in Release

- `package.json` - version bump
- `CHANGELOG.md` - generated from changesets
- Git tags - `vX.Y.Z` format

## Manual Dry-Run (Local Testing)

```bash
# Create test changeset
pnpm changeset

# Preview version changes (don't commit)
pnpm changeset:version

# Inspect changed files
git status
cat CHANGELOG.md

# Revert dry-run
git reset --hard HEAD
```

## Troubleshooting

- **Doctor fails**: open artifacts/doctor-report.md and fix
- **Release workflow fails**: Check GitHub Actions logs
- **No release triggered**: Ensure changesets exist in `.changeset/` directory
- **Wrong version**: Review changeset files, re-run `pnpm changeset`
