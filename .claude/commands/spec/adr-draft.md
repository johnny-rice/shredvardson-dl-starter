---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: "/adr:draft"
version: "1.0.0"
lane: "governance"
tags: ["adr", "governance", "documentation"]
when_to_use: >
  Draft ADR when governance triggers occur (prompts, workflows, security, compliance changes).

arguments:
  - name: trigger
    type: string
    required: true
    example: "prompt-change"

inputs:
  - type: "governance-trigger"
    description: "Change that requires architectural decision"
outputs:
  - type: "artifact-links"

riskLevel: "LOW"
requiresHITL: true
riskPolicyRef: "docs/llm/risk-policy.json#governanceChanges"

allowed-tools:
  - "Read(*)"
  - "Write(*)"
  - "Glob(*)"

preconditions:
  - "Governance trigger identified"
  - "Change impacts architecture/process"
postconditions:
  - "ADR draft created in docs/decisions/"
  - "ADR ID ready for PR template"

artifacts:
  produces:
    - { path: "docs/decisions/ADR-YYYYMMDD-[slug].md", purpose: "Architecture decision record" }
  updates: []

permissions:
  tools:
    - name: "filesystem"
      ops: ["read", "write"]

timeouts:
  softSeconds: 180
  hardSeconds: 360

idempotent: true
dryRun: true
estimatedRuntimeSec: 120
costHints: "Low I/O; documentation"

references:
  - "docs/decisions/0001-template.md"
  - "docs/constitution.md#governance"
---

**Slash Command:** `/adr:draft`

**Goal:**  
Draft ADR when governance triggers occur (prompts, workflows, security, compliance changes).

**Prompt:**  
1) Identify governance trigger type from: prompt-change, workflow-update, security-guardrail, compliance-requirement, repo-structure.  
2) Auto-generate ADR number using YYYYMMDD format + descriptive slug.
3) Draft ADR using template from `docs/decisions/0001-template.md`:
   - **Context**: What change triggered this ADR and why it's needed
   - **Decision**: Specific architectural decision being made
   - **Consequences**: Benefits, tradeoffs, monitoring requirements
   - **References**: Link to related issue/PR/spec
4) Save to `docs/decisions/ADR-YYYYMMDD-[slug].md`.
5) Emit **Result**: ADR ID for PR template reference.

**Examples:**  
- `/adr:draft prompt-change` → drafts ADR for prompt modifications
- `/adr:draft security-guardrail` → drafts ADR for security policy changes
- `/adr:draft --dry-run workflow-update` → shows planned ADR structure only.

**Failure & Recovery:**  
- If trigger type unclear → ask for clarification on change type.
- If similar ADR exists → suggest updating existing rather than creating new.