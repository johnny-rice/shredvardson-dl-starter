# Operational Runbook

## Routing Failures

**If routing contract fails:**

1. Run `pnpm run commands:generate` to sync command index
2. Fix any broken paths in `docs/llm/context-map.json`
3. Ensure required directories exist: `specs/`, `plans/`, `tasks/`
4. Re-run CI to validate fixes

**Common issues:**

- Command index out of sync → Regenerate with `scripts/generate-command-index.js`
- Missing artifact directories → Create with `mkdir -p specs plans tasks`
- Dead paths in context map → Update or remove broken file references

## Wiki Issues

**If wiki is empty or broken:**

1. Check GitHub PAT permissions for wiki repository access
2. Verify `.wiki.git` remote is properly configured
3. Re-run wiki publish workflow manually
4. Check for secret scrubbing issues in generated content

**Wiki troubleshooting:**

```bash
# Test wiki generation locally
node scripts/generate-wiki.js --scrub-secrets

# Check generated content
ls -la wiki-content/generated/
```

## Spec Guard Failures

**If Spec Guard trips:**

- **Lightweight PR with artifacts**: Remove `specs/`, `plans/`, `tasks/` files OR relabel as `spec-driven`
- **Spec-driven PR missing artifacts**: Run `npm run new-spec <feature-name> --lane=spec`
- **Mismatched labels**: Ensure PR has correct lane label (`lightweight` or `spec-driven`)

## Environment Failures

**If env check fails:**

1. Check `.env.example` for required vs optional variables
2. Look for `@requiresEnv` decorations in failed tests
3. Add missing environment variables or mark tests as conditional
4. Update environmental policy in `scripts/pretest-env-check.ts`

**Environment policy structure:**

```typescript
const policy = {
  required: ['DATABASE_URL', 'AUTH_SECRET'],
  optional: ['SENTRY_DSN', 'STRIPE_SECRET_KEY'],
};
```

## Constitution Integrity

**If constitution checksum fails:**

1. Review changes to governance files
2. Run `npm run constitution:update` to regenerate checksums
3. Commit the updated `docs/llm/CONSTITUTION.CHECKSUM`
4. Ensure all binding sources are properly tracked

**Tracked files:**

- `CLAUDE.md`
- `docs/constitution.md`
- `docs/commands/index.json`
- `docs/llm/risk-policy.json`

## Branch Protection Setup

**Required status checks:**

- `routing-contract`
- `spec-guard`
- `doctor`
- `setup / setup`

**GitHub Settings:**

1. Go to Settings → Branches → main → Edit
2. Enable "Require status checks to pass"
3. Add required checks above
4. Enable "Require branches to be up to date"

## Telemetry Monitoring

**Weekly telemetry PR should include:**

- Lane usage percentages (simple vs spec-driven)
- Time-to-PR metrics by workflow type
- Documentation LoC changes by lane
- Failed gates and friction points

**If telemetry fails:**

1. Check GitHub Actions environment variables
2. Verify telemetry collection permissions
3. Review `scripts/telemetry-report.ts` for data sources
4. Manual run: `npm run telemetry:report`

## Emergency Procedures

**To bypass CI temporarily:**

1. Use admin merge with `--admin` flag (last resort)
2. Create emergency hotfix branch
3. Address CI failures in follow-up PR

**To disable AI workflows:**

1. Set repository variables: `CLAUDE_ENABLED=false`
2. Remove from branch protection requirements
3. Document reason and timeline for re-enable

## Health Checks

**Daily:**

- Monitor telemetry for unusual patterns
- Check failed CI runs for systemic issues
- Review wiki publication status

**Weekly:**

- Verify command index accuracy with `npm run commands:check`
- Audit constitution checksum stability
- Review CODEOWNERS effectiveness

**Monthly:**

- Update risk policy based on operational learnings
- Refine routing rules from usage data
- Optimize CI contract performance
