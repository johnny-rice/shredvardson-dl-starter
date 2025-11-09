# Secret Scanning with Gitleaks

This project uses [Gitleaks](https://github.com/gitleaks/gitleaks) to detect accidentally committed secrets (API keys, tokens, credentials) before they enter git history.

## Quick Start

### Installation

**macOS:**

```bash
brew install gitleaks
```

**Linux:**

```bash
GITLEAKS_VERSION="8.20.1"
wget "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
tar -xzf "gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
sudo mv gitleaks /usr/local/bin/
```

**Verify:**

```bash
gitleaks version
```

### How It Works

**Pre-commit hook** (via Lefthook):

- Scans staged files before commit (<2s)
- Blocks commit if secrets detected
- Gracefully skips if Gitleaks not installed

**GitHub Actions** (automatic):

- Runs on all PRs and main branch pushes
- Uses official [gitleaks-action](https://github.com/gitleaks/gitleaks-action)
- Posts findings as PR comments

## What's Detected

Gitleaks detects 100+ secret patterns by default:

- API Keys: AWS, GitHub, Stripe, OpenAI, etc.
- Database credentials: PostgreSQL, MySQL, MongoDB
- Tokens: JWT, OAuth, session tokens
- Custom patterns: Supabase service keys, Anthropic API keys

See [`.gitleaks.toml`](/.gitleaks.toml) for project-specific rules.

## Incident Response

### If You Accidentally Commit a Secret

**CRITICAL: Assume compromised. Act immediately.**

**1. If not pushed yet:**

```bash
# Reset commit
git reset HEAD~1

# Remove secret from code
# Use environment variable instead: process.env.API_KEY

# Commit safely
git add <files>
git commit -m "fix: use environment variable for credentials"
```

**2. If already pushed:**

```bash
# 1. Rotate credential immediately in provider dashboard
# 2. Update environment variables everywhere (dev/staging/prod)
# 3. Verify old credential is revoked
# 4. Check logs for unauthorized access
```

**3. Follow incident response:**

See [`docs/SECURE_PROMPTING.md`](/docs/SECURE_PROMPTING.md) Section 10 for complete procedures.

## Bypassing Checks

**Only bypass if:**

- Known false positive (add to `.gitleaks.toml` allowlist with comment)
- Documentation with clearly fake example keys

**Never bypass if:**

- Real credentials detected (even temporarily)
- Database connection strings with passwords
- "I'll fix it later"

**To bypass pre-commit:**

```bash
git commit --no-verify  # Use sparingly!
```

## Configuration

### Add to Allowlist

Edit `.gitleaks.toml`:

```toml
[allowlist]
paths = [
  '''tests/fixtures/mock-data\.ts$''',  # Safe: synthetic test data
]

regexes = [
  '''test_fake_key_12345''',  # Known safe pattern
]
```

### Add Custom Pattern

```toml
[[rules]]
id = "custom-api-key"
description = "Custom Service API Key"
regex = '''custom_[A-Za-z0-9]{32}'''
keywords = ["custom"]
```

## Resources

- [Official Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Gitleaks Configuration Reference](https://github.com/gitleaks/gitleaks#configuration)
- [Secure Prompting Guidelines](../SECURE_PROMPTING.md)
- [Multi-layer Security Architecture](../../packages/git-context/README.md)

## Performance

- **Pre-commit:** <2s (staged files only)
- **CI/CD:** ~10-15s (full repository scan)
- **Parallel execution** with other Lefthook hooks
