---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:tag-release'
version: '1.0.0'
lane: 'dev'
tags: ['git', 'release', 'semver']
deprecated: true
deprecation_notice: >
  DEPRECATED: This command is being migrated to the `git-workflow` Skill (Phase 3).
  Use `/git tag` instead. This command will remain functional during the
  12-week transition period. See docs/adr/002-skills-architecture.md for details.
when_to_use: >
  Create semantic version from conventional commits when ready to release.

arguments:
  - name: versionType
    type: string
    required: false
    example: 'minor'

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'HIGH'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#/releaseOperations'

allowed-tools:
  - 'Bash(git log --pretty=*:*)'
  - 'Bash(git tag -a v*:*)'
  - 'Read(package.json)'
  - 'Edit(package.json)'
  - 'Edit(CHANGELOG.md)'

preconditions:
  - 'All changes are committed and pushed'
  - 'Release is ready for tagging'
postconditions:
  - 'Version tag created'
  - 'package.json version updated'
  - 'Changelog generated'

artifacts:
  produces:
    - { path: 'CHANGELOG.md', purpose: 'Generated release changelog' }
  updates:
    - { path: 'package.json', purpose: 'Updated version number' }

permissions:
  tools:
    - name: 'git'
      ops: ['log', 'tag_annotated', 'push_tags']
    - name: 'filesystem'
      ops: ['read', 'write']

timeouts:
  softSeconds: 180
  hardSeconds: 360

idempotent: false
dryRun: true
estimatedRuntimeSec: 120
costHints: 'Low I/O; git history analysis'

references:
  - 'docs/constitution.md#release-process'
  - 'CLAUDE.md#versioning'
  - 'RELEASING.md'
---

**Slash Command:** `/git:tag-release`

**Goal:**  
Create semantic version from conventional commits when ready to release.

**Prompt:**

1. Confirm lane (**dev**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Create semantic version following these steps:
   - Analyze commit history since last tag
   - Determine version bump (patch/minor/major)
   - Update `package.json` version
   - Create git tag: `git tag v1.2.3`
   - Generate changelog from commit messages
4. Follow semver: breaking = major, feat = minor, fix = patch.
5. Produce release **artifacts** and **link** results in related Issue/PR.
6. Emit **Result**: version created, tag status, and next suggested command.

**Examples:**

- `/git:tag-release minor` → creates minor version release
- `/git:tag-release --dry-run` → show planned version bump only.

**Failure & Recovery:**

- If uncommitted changes exist → suggest committing first.
- If version conflicts → ask for manual version specification.
