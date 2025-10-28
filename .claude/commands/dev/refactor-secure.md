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
riskPolicyRef: 'docs/llm/risk-policy.json#/securityRefactoring'

allowed-tools:
  - 'Task(Security Scanner)'
  - 'Task(Refactor Analyzer)'
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

3. **Delegate to Security Scanner sub-agent:**

   Invoke the Task tool to scan for security vulnerabilities:

   ```json
   Task(
     subagent_type="Security Scanner",
     description="Scanning codebase for security vulnerabilities",
     prompt='''
     {
       "scope": "full",
       "focus_areas": ["auth", "rls", "api", "secrets"],
       "severity_threshold": "medium"
     }
     '''
   )
   ```

   **Note:** This command always uses `"scope": "full"` to ensure comprehensive security + refactoring analysis. Unlike `/security:scan`, which supports targeted scans via the `scope` argument, this command prioritizes thoroughness since refactoring decisions require understanding cross-cutting concerns across the entire codebase.

   Wait for security scan results.

4. **Parse security findings:** Extract `vulnerabilities`, `summary`, `recommendations`, `confidence` from JSON response.

5. **Delegate to Refactor Analyzer sub-agent:**

   Invoke the Task tool to analyze code quality:

   ```json
   Task(
     subagent_type="Refactor Analyzer",
     description="Analyzing code quality and refactoring opportunities",
     prompt='''
     {
       "target": {
         "type": "codebase"
       },
       "focus_areas": ["readability", "performance", "maintainability"],
       "severity_threshold": "moderate"
     }
     '''
   )
   ```

   Wait for refactoring analysis results.

6. **Parse refactoring analysis:** Extract `issues`, `summary`, `architecture_insights`, `recommendations`, `confidence` from JSON response.

7. **Combine findings** from both sub-agents and prioritize by severity and impact.

8. **Apply fixes** for critical/high severity issues first, then moderate issues.

9. **Run tests** after each refactoring to ensure no regression.

10. **Generate security analysis report** combining findings from both sub-agents.

11. **Produce security analysis report** and link results in related Issue/PR.

12. **Emit Result:** security improvements made, refactorings applied, test status, and next suggested command.

**Examples:**

- `/dev:refactor-secure` → performs security analysis and refactoring
- `/dev:refactor-secure --dry-run` → show planned security improvements only.

**Failure & Recovery:**

- If tests break after refactoring → revert changes and report issues.
- If no security issues found → document clean security status.
