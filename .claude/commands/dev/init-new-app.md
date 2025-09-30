---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/dev:init-new-app'
version: '1.0.0'
lane: 'lightweight'
tags: ['initialization', 'starter', 'scaffolding']
when_to_use: >
  Initialize a new app from this starter with customized configuration.

arguments:
  - name: configPath
    type: string
    required: false
    example: 'docs/llm/NEW_APP_KICKOFF.md'

inputs:
  - name: appConfig
    type: 'json'
    description: 'App configuration as defined in NEW_APP_KICKOFF.md'

outputs:
  - type: 'code-change'
  - type: 'report'

riskLevel: 'HIGH'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#starterInitialization'

allowed-tools:
  - 'Read(*)'
  - 'Edit(*)'
  - 'MultiEdit(*)'
  - 'Bash(pnpm typecheck)'
  - 'Bash(pnpm build)'

preconditions:
  - 'Starter template is ready'
  - 'App configuration is provided'
postconditions:
  - 'New app initialized with custom configuration'
  - 'TypeScript compiles and builds successfully'

artifacts:
  produces:
    - { path: 'initialization-plan.json', purpose: 'Plan JSON with file changes' }
    - { path: 'initialization-diffs.md', purpose: 'Unified diffs for applied changes' }
    - { path: 'verification-checklist.md', purpose: 'Human verification checklist' }
  updates: []

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
costHints: 'High I/O; extensive file modifications'

references:
  - 'docs/llm/STARTER_MANIFEST.json'
  - 'docs/llm/NEW_APP_KICKOFF.md'
  - 'CLAUDE.md#initialization-process'
---

**Slash Command:** `/dev:init-new-app`

**Goal:**  
Initialize a new app from this starter with customized configuration.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Follow initialization steps:
   - Read `docs/llm/STARTER_MANIFEST.json` and `docs/llm/NEW_APP_KICKOFF.md`
   - Propose the Plan JSON (list of files + reasons) and wait for approval if required
   - Apply minimal diffs only to the listed files
   - Run `pnpm typecheck && pnpm build`; if failing, revert and propose revised plan
4. Produce initialization **artifacts**: Plan JSON, unified diffs, and verification checklist.
5. **Link** results in related Issue/PR.
6. Emit **Result**: initialization completed, verification needed, and next suggested command.

**Examples:**

- `/dev:init-new-app` → initializes app with default configuration
- `/dev:init-new-app --dry-run` → show planned initialization changes only.

**Failure & Recovery:**

- If typecheck/build fails → revert changes and propose revised plan.
- If configuration unclear → ask for specific app requirements and preferences.
