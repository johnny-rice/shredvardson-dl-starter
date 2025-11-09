---
id: 'SPEC-248'
title: Add secret scanning pre-commit hook (Gitleaks)
type: spec
priority: p0
status: draft
lane: simple
issue: 248
created: 2025-11-09
---

# Add secret scanning pre-commit hook (Gitleaks)

## Summary

Implement Gitleaks secret scanning with Lefthook pre-commit/pre-push hooks to detect accidentally committed secrets (API keys, tokens, credentials) before they enter git history.

## Problem Statement

Currently, there is no automated detection of accidentally committed secrets, creating risk of:
- Exposed credentials in git history
- Security incidents requiring emergency key rotation
- Compliance violations (PII, API keys in public repos)
- Supply chain attacks via leaked credentials

While the codebase has comprehensive sanitization patterns (`packages/git-context/src/sanitize.ts`) and secure prompting guidelines (`docs/SECURE_PROMPTING.md`), there's no pre-commit hook to catch secrets before they're committed.

## Proposed Solution

Integrate Gitleaks as a pre-commit hook using existing Lefthook infrastructure:

1. **Install Gitleaks**
   - Add Gitleaks binary (standalone tool, no npm package needed)
   - Create `.gitleaks.toml` configuration file
   - Define secret patterns and baseline for existing false positives

2. **Add Lefthook hook**
   - Add `secret-scan` command to pre-commit section in `lefthook.yml`
   - Run `gitleaks protect --staged --verbose --redact` on staged files
   - Fast execution (<2s) to avoid developer friction

3. **Create GitHub Action**
   - Add `.github/workflows/gitleaks.yml` for CI/CD backup validation
   - Scan all files on PR creation/update
   - Post findings as PR comments (advisory approach)

4. **Documentation**
   - Create `docs/security/SECRET_SCANNING.md` with usage guide
   - Document bypass process for false positives
   - Add to onboarding checklist

5. **Leverage existing patterns**
   - Follow advisory-first approach from `security-review.yml`
   - Integrate with Security Scanner agent for unified reporting
   - Use structured output format matching existing security patterns
   - Follow escape hatch pattern (LEFTHOOK=0, --no-verify)

## Acceptance Criteria

- [ ] Gitleaks binary installed and accessible in PATH
- [ ] `.gitleaks.toml` configuration created with:
  - [ ] Standard secret patterns enabled
  - [ ] Custom patterns for project-specific secrets (Supabase keys, Stripe keys)
  - [ ] Baseline file for existing false positives (if any)
  - [ ] Allowlist for safe test fixtures
- [ ] Pre-commit hook added to `lefthook.yml`:
  - [ ] Runs `gitleaks protect --staged` on git commit
  - [ ] Blocks commit if secrets detected
  - [ ] Shows clear error message with file/line location
  - [ ] Executes in <2s for typical commits
- [ ] GitHub Action created (`.github/workflows/gitleaks.yml`):
  - [ ] Runs on pull_request events
  - [ ] Scans entire PR diff
  - [ ] Posts findings as PR comment
  - [ ] Uses advisory labels (non-blocking)
- [ ] Documentation created (`docs/security/SECRET_SCANNING.md`):
  - [ ] What secrets are detected
  - [ ] How to bypass false positives (--no-verify)
  - [ ] How to add allowlist entries
  - [ ] Incident response if secret leaked
- [ ] Integration with existing patterns:
  - [ ] Follows Lefthook pattern from existing hooks
  - [ ] Uses advisory approach from security-review.yml
  - [ ] References incident response from SECURE_PROMPTING.md
  - [ ] Fast validation (<2s) like other pre-commit checks

## Technical Constraints

**Existing Infrastructure:**
- Lefthook 2.0.1 configured with pre-commit/pre-push hooks
- Comprehensive sanitization patterns in `packages/git-context/src/sanitize.ts`
- Security scanner agent in `.claude/agents/security-scanner.md`
- Security documentation in `docs/SECURE_PROMPTING.md` and `SECURITY.md`
- `.gitignore` already protects `.env*` files

**Integration Points:**
- Must work alongside existing pre-commit hooks (Biome, markdownlint, config validation)
- Must work alongside pre-push hooks (branch protection, tests, lint)
- Should integrate with Security Scanner agent for unified security reporting
- Must support LEFTHOOK=0 and --no-verify escape hatches

**Performance Requirements:**
- Pre-commit scan must complete in <2s for typical commits
- Should only scan staged files, not entire repository
- Must not significantly increase commit overhead
- Should support baseline file to cache known false positives

**Gitleaks Configuration:**
- Use `.gitleaks.toml` for custom patterns and allowlists
- Baseline file (`.gitleaks-baseline.json`) for existing false positives
- Detect common patterns: AWS keys, GitHub tokens, Stripe keys, JWT tokens, database URLs
- Project-specific patterns: Supabase anon/service keys, Anthropic API keys

**Security Considerations:**
- Secret detection runs locally before push (defense in depth)
- GitHub Action provides backup validation in CI
- Findings should be redacted in logs (use `--redact` flag)
- Advisory approach: non-blocking initially to measure false positive rate
- Incident response: if secret leaked, follow SECURE_PROMPTING.md Section 10 procedures

## Success Metrics

- **Detection rate**: >95% of common secret patterns caught pre-commit
- **False positive rate**: <10% of pre-commit blocks are false positives
- **Developer friction**: <5% of commits use --no-verify bypass
- **Validation speed**: <2s average pre-commit hook execution time
- **CI coverage**: 100% of PRs scanned by GitHub Action
- **Zero leaked secrets**: No credentials committed to main branch after implementation

## Out of Scope

- **Scanning existing git history** - Only scan new commits going forward
- **Automated secret rotation** - Requires manual rotation following incident response
- **Secret management solution** - No vault/secrets manager (future enhancement)
- **Real-time secret monitoring** - Pre-commit only, no runtime monitoring
- **Custom secret pattern training** - Use standard Gitleaks patterns only
- **Integration with 1Password/Vault** - No external secrets manager integration

## References

### Similar Implementations Found

- [lefthook.yml](../lefthook.yml) - Existing git hook infrastructure with pre-commit/pre-push
- [packages/git-context/src/sanitize.ts](../packages/git-context/src/sanitize.ts) - Comprehensive credential sanitization patterns
- [packages/git-context/src/validators.ts](../packages/git-context/src/validators.ts) - Zod-based input validation for security
- [.claude/agents/security-scanner.md](../.claude/agents/security-scanner.md) - AI-powered security scanner with structured output
- [.github/workflows/security-review.yml](../.github/workflows/security-review.yml) - Advisory security review workflow pattern
- [docs/SECURE_PROMPTING.md:Section 10](../docs/SECURE_PROMPTING.md) - Incident response procedures for leaked secrets
- [docs/adr/009-git-context-security-architecture.md](../docs/adr/009-git-context-security-architecture.md) - Multi-layer security boundary pattern

### Architecture Patterns

- **Multi-Layer Security Boundary**: 4 layers of defense (validation, scanning, sanitization, monitoring)
- **Input Validation Boundary**: All inputs validated at system boundaries using Zod
- **Safe-by-Default Execution**: Command execution without shell interpretation
- **Advisory-First Security**: Non-blocking initially to measure false positives
- **Defense in Depth**: Multiple independent validation layers
- **Hook-Based Quality Gates**: Pre-commit (fast <3s) and pre-push (comprehensive 8-15s)

### External Tools

- **Gitleaks** - Standalone secret scanning tool (no npm package)
- **Lefthook** - Git hook manager with parallel execution
- **StepSecurity Harden Runner** - GitHub Actions security hardening (optional)

### External Standards

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks) - Official tool docs
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) - Industry best practices
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html) - Security standard

### Related Issues

- Issue #248 - This specification
- Related: SECURE_PROMPTING.md Section 10 - Incident response for leaked secrets