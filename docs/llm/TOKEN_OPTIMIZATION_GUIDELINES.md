# Token Optimization Guidelines

**Purpose:** Ensure all future development maintains token efficiency for AI-assisted workflows.

**Scope:** Applies to all contributors - human and AI.

**Authority:** Enforced by CI checks and constitutional principles.

---

## Core Principles

### 1. Extract, Don't Embed

**Rule:** Inline scripts in workflows MUST be extracted to standalone files.

**Why:** Reduces context size when debugging CI, enables local testing, improves maintainability.

**Example:**

```yaml
# ❌ BAD: Inline bash script
- name: Validate something
  run: |
    if [ ! -d "specs" ]; then
      echo "Error: specs directory missing"
      exit 1
    fi
    for spec in specs/*/; do
      # ... 50 more lines of bash ...
    done

# ✅ GOOD: Extracted script
- name: Validate something
  run: ./scripts/ci/validate-something.sh
```

**Enforcement:** CI check fails if workflow file exceeds line threshold with inline scripts.

---

### 2. Reference, Don't Duplicate

**Rule:** Documentation MUST be written once and referenced elsewhere.

**Why:** Reduces redundancy in context, ensures consistency, easier maintenance.

**Example:**

```markdown
# ❌ BAD: Duplicated content

## Component Guidelines (in README.md)

Components should use TypeScript...
[200 lines of guidelines]

## Component Guidelines (in CONTRIBUTING.md)

Components should use TypeScript...
[200 lines of same guidelines]

# ✅ GOOD: Reference pattern

## Component Guidelines (in README.md)

See [docs/architecture/components.md](docs/architecture/components.md) for detailed guidelines.

## Component Guidelines (in CONTRIBUTING.md)

See [docs/architecture/components.md](docs/architecture/components.md) for detailed guidelines.
```

**Enforcement:** Automated check detects duplicated content >100 lines.

---

### 3. Exclude External Docs

**Rule:** Documentation for external consumption MUST be excluded from AI context.

**Why:** External docs (Wiki, public guides) aren't relevant for internal development.

**Pattern:**

```
docs/
├── wiki/              # External (excluded via .claudeignore)
├── micro-lessons/     # External (excluded via .claudeignore)
├── architecture/      # Internal (included in context)
└── recipes/           # Internal (included in context)
```

**Enforcement:** `.claudeignore` must exclude `docs/wiki/` and `docs/micro-lessons/`.

---

### 4. Archive Stale Content

**Rule:** Documentation older than 90 days with no references MUST be archived.

**Why:** Old content clutters context without providing value.

**Pattern:**

```
docs/
├── active/            # Current docs (included)
└── archive/           # Historical docs (excluded via .claudeignore)
```

**Enforcement:** Automated quarterly audit suggests archival candidates.

---

### 5. Consolidate Workflows

**Rule:** GitHub Actions jobs MUST use composite actions for shared setup.

**Why:** Reduces duplication, clearer failure context, easier updates.

**Example:**

```yaml
# ❌ BAD: Duplicated setup
jobs:
  job1:
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
      - run: pnpm install

  job2:
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
      - run: pnpm install

# ✅ GOOD: Composite action
jobs:
  job1:
    steps:
      - uses: ./.github/actions/setup

  job2:
    steps:
      - uses: ./.github/actions/setup
```

**Enforcement:** CI check warns if setup steps are duplicated.

---

### 6. Error Messages with Context

**Rule:** CI error messages MUST reference debugging guide.

**Why:** Reduces need to read full workflow files, enables self-service debugging.

**Example:**

```yaml
# ❌ BAD: Opaque error
- name: Validate
  run: ./scripts/validate.sh || exit 1

# ✅ GOOD: Contextual error
- name: Validate
  run: |
    if ! ./scripts/validate.sh; then
      echo "::error::Validation failed. See .github/DEBUGGING.md#validation"
      exit 1
    fi
```

**Enforcement:** Linter checks for error annotations without debugging references.

---

### 7. Local-First Testing

**Rule:** All CI checks MUST be runnable locally via package.json scripts.

**Why:** Enables debugging without CI, faster feedback loops, consistent environments.

**Pattern:**

```json
{
  "scripts": {
    "ci:validate": "bash scripts/ci/validate.sh",
    "ci:test": "pnpm run test && pnpm run typecheck && pnpm run lint"
  }
}
```

**Enforcement:** CI check fails if any workflow step doesn't have corresponding package.json script.

---

### 8. Command Consolidation

**Rule:** Slash commands with >50% overlap MUST extract shared patterns.

**Why:** Reduces command file size, ensures consistency, easier maintenance.

**Pattern:**

```
.claude/commands/
├── git/
│   ├── branch.md
│   ├── fix-pr.md
│   └── shared/
│       ├── common-workflow.md    # Shared patterns
│       └── error-handling.md     # Shared error handling
```

**Enforcement:** Automated quarterly audit detects command overlap >50%.

---

## Enforcement Mechanisms

### Automated CI Checks

**File:** `.github/workflows/token-optimization-guard.yml`

**Checks:**

1. **Workflow line count:** Fails if any workflow >200 lines
2. **Inline script length:** Warns if inline script >20 lines
3. **Setup duplication:** Warns if setup steps duplicated across jobs
4. **Error annotations:** Fails if error message missing debugging reference
5. **Local script availability:** Fails if workflow step missing package.json script
6. **Documentation size:** Warns if any doc file >500 lines
7. **Exclusion patterns:** Fails if `.claudeignore` missing required patterns

**Trigger:** On all PR changes to workflows, scripts, or documentation.

---

### Pre-commit Hooks

**File:** `scripts/git-hooks/token-optimization.sh`

**Checks:**

1. **Workflow modifications:** Prompt developer to extract inline scripts
2. **New documentation:** Suggest archival location if appropriate
3. **Command changes:** Check for overlap with existing commands

**Trigger:** On commit to `feature/*` or `bots/claude/*` branches.

---

### Constitutional Article

**Location:** `docs/constitution.md` - New Article IX

**Title:** Token Efficiency

**Sections:**

- Section 9.1: Context Minimization (principles 1-4)
- Section 9.2: Workflow Efficiency (principles 5-7)
- Section 9.3: Command Optimization (principle 8)
- Section 9.4: Enforcement (automated checks)

---

## Review Process

### Quarterly Audit

**What:** Review adherence to token optimization guidelines

**When:** Every 3 months

**Who:** Maintainers + AI agents

**Actions:**

1. Run `pnpm run token:audit` to generate report
2. Identify violations and candidates for improvement
3. Create issues for high-impact optimizations
4. Update guidelines based on learnings

### PR Review Checklist

Add to PR template:

```markdown
## Token Optimization

- [ ] Inline scripts extracted to standalone files
- [ ] No duplicated documentation
- [ ] External docs excluded from context
- [ ] Workflow uses composite actions
- [ ] Error messages reference debugging guide
- [ ] All CI checks runnable locally
```

---

## Migration Path for Existing Code

### Phase 1: Create Baseline (Week 1)

```bash
pnpm run token:audit --baseline
# Generates: scratch/token-baseline.md
```

### Phase 2: Fix High-Impact Issues (Weeks 2-4)

1. Extract inline scripts from workflows
2. Create composite actions
3. Archive stale documentation

### Phase 3: Enable Enforcement (Week 5)

```bash
# Enable CI checks
git add .github/workflows/token-optimization-guard.yml
git commit -m "chore(ci): enable token optimization enforcement"
```

### Phase 4: Monitor and Improve (Ongoing)

```bash
# Monthly check
pnpm run token:audit --compare scratch/token-baseline.md
```

---

## Examples by Use Case

### Adding New Design System Guidelines

**Scenario:** Adding comprehensive design system documentation.

**Token-Optimized Approach:**

1. **Single Source of Truth:**

   ```
   docs/design-system/
   ├── README.md              # Index + quick reference
   ├── colors.md              # 50 lines
   ├── typography.md          # 50 lines
   ├── components.md          # 100 lines
   └── patterns.md            # 75 lines
   Total: ~300 lines (acceptable)
   ```

2. **Reference Pattern:**

   ```markdown
   # README.md

   For detailed guidelines:

   - [Colors](./colors.md)
   - [Typography](./typography.md)
   - [Components](./components.md)
   ```

3. **External vs Internal:**

   ```
   docs/design-system/        # Internal (for developers)
   docs/wiki/design-system/   # External (for public, excluded)
   ```

4. **Slash Command:**

   ```markdown
   # .claude/commands/design/apply-system.md

   See [docs/design-system/README.md](../../../docs/design-system/README.md)
   for guidelines.

   # Short command that references, doesn't duplicate
   ```

**What NOT to do:**

- ❌ Put 500 lines of design guidelines in README
- ❌ Duplicate guidelines in multiple places
- ❌ Create 50-line slash command with all guidelines
- ❌ Put internal guidelines in Wiki (will be excluded)

---

### Adding New CI Workflow

**Scenario:** Adding new CI workflow for design system validation.

**Token-Optimized Approach:**

1. **Extract to Script:**

   ```bash
   # scripts/ci/validate-design-system.sh
   #!/bin/bash
   # Validates design system compliance
   # [Implementation here]
   ```

2. **Thin Workflow:**

   ```yaml
   # .github/workflows/design-system-check.yml
   jobs:
     validate:
       steps:
         - uses: ./.github/actions/setup
         - name: Validate design system
           run: pnpm run design:validate
   ```

3. **Local Command:**

   ```json
   {
     "scripts": {
       "design:validate": "bash scripts/ci/validate-design-system.sh"
     }
   }
   ```

4. **Error Handling:**

   ```bash
   # In script
   if ! validate_colors; then
     report_ci_error "Color validation failed" "design-system-validation"
     exit 1
   fi
   ```

5. **Debugging Guide:**
   ```markdown
   # .github/DEBUGGING.md

   ## Design System Validation

   **Error:** "Color validation failed"
   **Local test:** `pnpm run design:validate`
   **Fix:** Review [docs/design-system/colors.md](../docs/design-system/colors.md)
   ```

**What NOT to do:**

- ❌ 100 lines of inline bash in workflow
- ❌ Duplicate setup steps (use composite action)
- ❌ Error without debugging reference
- ❌ No local testing option

---

## Metrics and Targets

### Target Metrics

| Metric              | Target           | Current | Trend |
| ------------------- | ---------------- | ------- | ----- |
| Workflow YAML size  | <50KB            | [TBD]   | [TBD] |
| Inline script lines | <20 per workflow | [TBD]   | [TBD] |
| Doc duplication     | <5%              | [TBD]   | [TBD] |
| Local validation    | 100%             | [TBD]   | [TBD] |
| Command overlap     | <30%             | [TBD]   | [TBD] |

### Measurement Commands

```bash
# Measure workflow size
du -sh .github/workflows/*.yml | sort -hr

# Detect inline scripts >20 lines
grep -n "run: |" .github/workflows/*.yml

# Find doc duplication
fdupes -r docs/

# Check local validation coverage
grep "run:" .github/workflows/*.yml | grep -v "pnpm run"

# Measure command overlap
diff .claude/commands/git/branch.md .claude/commands/git/fix-pr.md
```

---

## Getting Help

**Questions about token optimization?**

1. Review this guide
2. Check `.github/DEBUGGING.md` for CI-specific help
3. Run `pnpm run token:audit` for automated suggestions
4. Ask in team chat with context

**Proposing changes to guidelines?**

1. Create RFC in `docs/decisions/`
2. Include token impact analysis
3. Follow constitutional amendment process (Article VII)

---

## Appendix: Token Optimization Audit Script

**File:** `scripts/token-audit.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Token Optimization Audit
 *
 * Scans repository for token optimization violations and opportunities.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface AuditResult {
  violations: Violation[];
  warnings: Warning[];
  opportunities: Opportunity[];
  metrics: Metrics;
}

interface Violation {
  type: string;
  file: string;
  line?: number;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

interface Warning {
  type: string;
  file: string;
  message: string;
}

interface Opportunity {
  type: string;
  description: string;
  estimatedSavings: string;
}

interface Metrics {
  workflowSize: number;
  inlineScriptLines: number;
  docDuplication: number;
  commandOverlap: number;
}

// Implementation would go here...
// [Detailed implementation in actual file]

export { auditTokenOptimization };
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-15
**Next Review:** 2026-01-15 (Quarterly)
