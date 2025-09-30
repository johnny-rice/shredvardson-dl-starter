---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/dev:refactor-secure'
version: '1.0.0'
lane: 'lightweight'
tags: ['security', 'refactoring', 'owasp']
when_to_use: >
  Improve code clarity and performance while checking OWASP Top 10 security risks.

arguments: []

inputs: []
outputs:
  - type: 'code-change'
  - type: 'report'

riskLevel: 'HIGH'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#securityRefactoring'

allowed-tools:
  - 'Read(*)'
  - 'Edit(*)'
  - 'MultiEdit(*)'
  - 'Bash(pnpm lint:*)'
  - 'Bash(pnpm test:*)'
  - 'Bash(pnpm typecheck:*)'
  - 'Grep(pattern:*)'

preconditions:
  - 'Code exists to be refactored'
  - 'Tests pass before refactoring'
postconditions:
  - 'Security vulnerabilities addressed'
  - 'Tests still pass after refactoring'
  - 'Code clarity improved'

artifacts:
  produces:
    - { path: 'security-review-report.md', purpose: 'Security analysis report' }
  updates:
    - { path: 'src/app/**', purpose: 'Secured route implementations' }
    - { path: 'src/api/**', purpose: 'Secured API endpoints' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 600
  hardSeconds: 1200

idempotent: false
dryRun: true
estimatedRuntimeSec: 480
costHints: 'High I/O; security analysis intensive'

references:
  - 'docs/constitution.md#security-constraints'
  - 'CLAUDE.md#security-guidelines'
  - 'SECURITY.md'
---

**Slash Command:** `/dev:refactor-secure`

**Goal:**  
Improve code clarity and performance while checking OWASP Top 10 security risks.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Analyze and improve code security focusing on:
   - Input validation and sanitization
   - Authentication/authorization checks
   - Data exposure prevention
   - XSS/CSRF protection
   - Dependency vulnerabilities
4. Focus on `src/app/` routes and API endpoints. Maintain test compatibility.
5. Produce security analysis **report** and **link** results in related Issue/PR.
6. Emit **Result**: security improvements made, test status, and next suggested command.

**Examples:**

- `/dev:refactor-secure` → performs security analysis and refactoring
- `/dev:refactor-secure --dry-run` → show planned security improvements only.

**Failure & Recovery:**

- If tests break after refactoring → revert changes and report issues.
- If no security issues found → document clean security status.
