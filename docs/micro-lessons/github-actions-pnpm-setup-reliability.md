---
UsedBy: 1
Severity: medium
---

# Reliable pnpm Setup in GitHub Actions

**Context.** GitHub Actions workflows were failing with "Unable to locate executable file: pnpm" despite using pnpm/action-setup, indicating race conditions in package manager initialization.

**Rule.** **Use proper setup sequence and configuration for pnpm in GitHub Actions to prevent executable not found errors.**

**Example.**

```yaml
# ❌ Incomplete pnpm setup
- name: Setup Node.js
  uses: actions/setup-node@v5
  with:
    node-version: '20'

- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9.12.0

# ✅ Reliable pnpm setup
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9.12.0
    run_install: false

- name: Setup Node.js
  uses: actions/setup-node@v5
  with:
    node-version: '20'
    cache: 'pnpm'
```

**Best Practices.**

- Specify exact pnpm version matching `packageManager` in package.json
- Use `run_install: false` to prevent automatic installation conflicts
- Add `cache: 'pnpm'` to Node.js setup for performance
- Update to latest action versions (setup-node@v5)
- Add `NODE_OPTIONS: "--no-deprecation"` to suppress dependency warnings

**Guardrails.**

- Always specify pnpm version explicitly
- Use consistent action versions across workflows
- Test pnpm availability before running package commands
- Include fallback logic for critical workflows

**Why This Works.**

- **Deterministic**: Explicit versions prevent version drift
- **Race-free**: `run_install: false` prevents installation conflicts
- **Cached**: Node setup with pnpm cache improves performance
- **Clean**: Deprecation suppression reduces noise in logs

**Tags.** github-actions,pnpm,ci-cd,package-manager,reliability,setup
