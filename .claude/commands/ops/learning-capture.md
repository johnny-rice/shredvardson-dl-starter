---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: "/ops:learning-capture"
version: "1.0.0"
lane: "operational"
tags: ["learning", "coderabbit", "micro-lessons"]
when_to_use: >
  Convert CodeRabbit feedback into micro-lessons or ADRs for pattern capture.

arguments:
  - name: feedbackType
    type: string
    required: true
    example: "pattern|process"

inputs:
  - type: "coderabbit-feedback"
    description: "Recurring CodeRabbit nitpicks or suggestions"
outputs:
  - type: "learning-artifact"
    description: "Micro-lesson or ADR capturing pattern"

riskLevel: "LOW"
requiresHITL: false
riskPolicyRef: "docs/llm/risk-policy.json#learningCapture"

allowed-tools:
  - "Read(*)"
  - "Write(*)"
  - "Glob(*)"

preconditions:
  - "CodeRabbit feedback identified"
  - "Pattern recurrence noted"
postconditions:
  - "Learning captured in appropriate format"
  - "Pattern indexed for future reference"

artifacts:
  produces:
    - { path: "docs/micro-lessons/[slug].md", purpose: "Micro-lesson for patterns" }
    - { path: "docs/decisions/ADR-YYYYMMDD-[slug].md", purpose: "ADR for process changes" }
  updates:
    - { path: "docs/micro-lessons/INDEX.md", purpose: "Updated learning index" }

permissions:
  tools:
    - name: "filesystem"
      ops: ["read", "write"]

timeouts:
  softSeconds: 120
  hardSeconds: 240

idempotent: true
dryRun: true
estimatedRuntimeSec: 90
costHints: "Low I/O; content analysis"

references:
  - "docs/micro-lessons/template.md"
  - "docs/decisions/0001-template.md"
---

**Slash Command:** `/ops:learning-capture`

**Goal:**  
Convert CodeRabbit feedback into micro-lessons or ADRs for pattern capture.

**Prompt:**  
1) Analyze feedback type:
   - **pattern**: Coding guideline → create micro-lesson
   - **process**: System/workflow change → create ADR
2) For patterns:
   - Create micro-lesson using `docs/micro-lessons/template.md`
   - Focus on specific, actionable guidance
   - Include before/after examples if applicable
   - Update `docs/micro-lessons/INDEX.md`
3) For processes:
   - Create ADR using `docs/decisions/0001-template.md`
   - Document decision rationale and implications
   - Reference CodeRabbit feedback as context
4) Emit **Result**: learning captured, pattern now indexed.

**Examples:**  
- `/ops:learning-capture pattern` → creates micro-lesson for coding pattern
- `/ops:learning-capture process` → creates ADR for process change
- `/ops:learning-capture --dry-run pattern` → shows planned micro-lesson structure.

**Failure & Recovery:**  
- If feedback unclear → ask for specific CodeRabbit comment to convert.
- If pattern already exists → suggest updating existing micro-lesson.