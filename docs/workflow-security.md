# Workflow Security & Review Commands

This document explains workflow security practices and review commands.

## Review Commands

### /review:ai-powered (GitHub Action - Mention Only)

**Trigger**: `@claude /review` in PR comments  
**Purpose**: AI-powered code review with inline feedback  
**Scope**: Advisory comments only, human review remains authoritative  
**Output**: Appended to doctor report artifacts as "AI Review (Advisory)" section

**Usage Rules**:

- Mention-only trigger (never automatic)
- **Human-only**: Bots cannot trigger other bots
- **Feature flag**: Requires `CLAUDE_ENABLED=true` repo variable
- Pushes to `bots/claude/*` branches only
- **Non-editable zones**: `.github/workflows/**`, `scripts/release/**`, `.env*`, `**/.env*`
- **Allowed paths**: `apps/`, `packages/`, `docs/**`
- **Quality gates**: All bot PRs must pass doctor, tsc, e2e, and human review
- **Timeout**: 10 minutes max per review to control costs
- **Case handling**: Accepts `@claude` or `@Claude` with `/review` or `/Review`

### /security:scan (GitHub Action - Advisory)

**Trigger**: Automatic on `pull_request` events  
**Purpose**: AI-powered vulnerability detection with semantic analysis  
**Scope**: Advisory-first (`fail_on_findings: false`), CodeQL remains blocker  
**Output**: Inline comments + aggregated in doctor report
**Feature flag**: Requires `CLAUDE_SECURITY_ENABLED=true` repo variable
**Timeout**: 10 minutes max per scan
**Permissions**: Read-only, comment-only (cannot push code)

**Security Focus Areas**:

- Input validation vulnerabilities
- Authentication/authorization issues
- Crypto and secrets management
- Injection and code execution risks
- Data exposure concerns

### /review:self-critique (Manual GPT-5 Lane)

**Trigger**: Manual command during planning phase  
**Purpose**: Self-assessment during spec development  
**Scope**: Planning contract validation, not PR automation  
**Integration**: Works with Spec Kernel during design phase

### Command Boundaries

- **AI-Powered PR Review** (`/review:ai-powered`): GitHub automation, advisory feedback
- **Self-Critique** (`/review:self-critique`): Manual planning validation
- **Security Scan** (`/security:scan`): Automated vulnerability detection
- **Refactor-Secure** (`/dev:refactor-secure`): Manual security refactoring

### Operational Controls

**Feature Flags** (Repository Variables):

- `CLAUDE_ENABLED=true` - Enable AI-powered PR reviews
- `CLAUDE_SECURITY_ENABLED=true` - Enable security scanning

**Safety Mechanisms**:

- Human-only triggers (bots cannot activate bots)
- Branch isolation (`bots/claude/*` only)
- Path restrictions (no access to workflows, env files)
- Timeout limits (10 minutes per job)
- Concurrency controls (cancel duplicate runs)

**Governance Controls**:

- **Author Association**: Only OWNER/MEMBER/COLLABORATOR can trigger `@claude` commands
- **Promote Labels**: Bot PRs require maintainer-added `promote` label before merge
- **Label Hygiene**: AI workflows apply `ai-review:advisory` / `ai-security:advisory` labels
- **Doctor Enforcement**: Starter doctor warns if AI labels missing when artifacts present

**Quality Integration**:

- All AI outputs aggregate into single doctor report
- Existing quality gates remain authoritative
- Advisory-first approach with measurable false-positive tracking

## GitHub Actions Security & Reliability Guide

This section explains how we write GitHub Actions safely. The rules below are **enforced in our current workflows** and should be followed for any new jobs.

## 🔒 Security Rules (Implemented & Enforced)

### 1. Safe Output Handling

**Rule:** Avoid multi-line writes to `$GITHUB_OUTPUT` using generic heredocs; they can break if content matches the delimiter.

**Tip:** If you must, generate a unique delimiter (e.g., a UUID) and use quoted heredocs or encode via `printf`/base64 to append safely.

✅ **Implemented:** PR Autofill workflow uses `actions/github-script@v7`

```yaml
- name: Load template
  id: tpl
  uses: actions/github-script@v7
  with:
    result-encoding: string
    script: |
      const fs = require('fs');
      return fs.readFileSync('.github/pull_request_template.md', 'utf8');
```

### 2. pull_request_target Security

**Rule:** Always checkout trusted base ref, never execute fork code.

⚠️ **Partial:** Only `.github/workflows/pr-autofill.yml` properly implements this

```yaml
- uses: actions/checkout@v4
  with:
    ref: ${{ github.event.pull_request.base.sha }}
    fetch-depth: 1
    persist-credentials: false # Security hardening
```

### 3. Event Guards for PR Logic

**Rule:** Don't run PR-specific checks on push events.

⚠️ **Partial:** `.github/workflows/pr-autofill.yml` has guards, `.github/workflows/ci.yml` lacks some guards

```yaml
if: ${{ github.event_name == 'pull_request' || github.event_name == 'pull_request_target' }}
```

**Job-level variant:**

```yaml
jobs:
  ci:
    if: ${{ contains(fromJSON('["pull_request","pull_request_target"]'), github.event_name) }}
    steps:
      # …
```

### 4. Literal Heredocs for File Writes

**Rule:** Use quoted heredocs to prevent variable expansion when writing files.

❌ **Missing:** No literal heredocs in `.github/workflows/ci.yml`

```yaml
- name: Build doctor report
  run: |
    mkdir -p artifacts
    cat <<'EOF' > artifacts/doctor-report.md
    # CI Doctor Report  
    EOF
```

### 5. Minimal Permissions

**Rule:** Grant only necessary permissions to workflows.

❌ **Missing:** No workflows currently match `permissions: contents: read` exactly

```yaml
permissions:
  contents: read
  pull-requests: write
```

Set minimal permissions at the workflow top-level; only elevate at the job that needs it.

## 📋 Policy Guidelines (Optional)

### Fork Restrictions

For sensitive jobs, optionally restrict to same repository:

```yaml
if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}
```

### Workflow Protection

Consider adding CODEOWNERS protection for workflow files:

```
.github/workflows/* @maintainers-team
```

### AI Bot PR Restrictions

AI-authored PRs must not modify files under `.github/workflows/**`; limit AI PRs to `docs/**` and other allowed paths.

## ✅ Implementation Status

| Security Rule       | Status         | Location                                                |
| ------------------- | -------------- | ------------------------------------------------------- |
| Safe outputs        | ✅ Implemented | `.github/workflows/pr-autofill.yml`                     |
| Base ref checkout   | ⚠️ Partial     | `.github/workflows/pr-autofill.yml` only                |
| Event guards        | ⚠️ Partial     | `.github/workflows/pr-autofill.yml` (lacks in `ci.yml`) |
| Literal heredocs    | ❌ Missing     | No literal heredocs in `.github/workflows/ci.yml`       |
| Minimal permissions | ❌ Missing     | No workflows currently match exact pattern              |

**Action Required:** Maintainers should either add the missing controls to `ci.yml`/other workflows or adjust the documented statuses accordingly.

## 🚀 For New Workflows

When creating new GitHub Actions:

1. **Copy permission structure** from existing workflows
2. **Use `actions/github-script@v7`** for complex outputs
3. **Add event guards** for PR-specific logic
4. **Checkout base SHA only** for `pull_request_target`
5. **Test locally** with act or similar tools

---

> **Note:** These practices were established based on security recommendations and are actively enforced in the current CI/CD pipeline.
