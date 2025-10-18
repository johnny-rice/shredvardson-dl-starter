---
id: SPEC-20251015-llm-context-optimization
type: spec
issue: 142
source: https://github.com/Shredvardson/dl-starter/issues/142
---

# Feature Specification: LLM Context Optimization

## User Need

**Who:** Development team and AI assistants (Claude, external LLMs) working with this codebase

**Problem:**

- AI assistants consume excessive tokens when debugging CI failures (20% failure rate × ~50KB context per debug session)
- Development velocity is slowed by opaque CI error messages requiring full workflow file reading
- External documentation consumers (via Wiki) receive unnecessary repository internals
- Debugging CI failures is slow (~15 minutes) and requires reading complex YAML files

**Impact:**

- High operational costs (~12.4M tokens/year wasted)
- Slow feedback loops for developers
- Poor developer experience when CI fails
- Context pollution making it harder for AI assistants to focus on relevant code

**Value:**
Reduce token consumption by ~60%, improve CI debugging speed by ~67% (15min → 5min), and reduce CI failure rate from 20% to <10% through clearer error messages and local debugging capabilities.

---

## Functional Requirements

### FR1: Selective Context Loading

The system MUST exclude non-essential files from AI assistant context while preserving them for external documentation consumers.

**Acceptance Criteria:**

- Documentation intended for external LLMs (Wiki, micro-lessons) is excluded from development AI sessions
- Heavy workflow configurations are excluded unless specifically being debugged
- Generated files and build artifacts are excluded
- Essential development files remain accessible
- **Target:** 15K token reduction per AI session

### FR2: Local CI Validation

Developers MUST be able to validate all CI checks locally without triggering CI/CD.

**Acceptance Criteria:**

- All CI validation steps can be executed via local commands
- Local validation produces identical results to CI validation
- Error messages are clear and actionable
- No need to read workflow YAML to understand failures
- **Target:** Enable debugging without CI for 100% of validation failures

### FR3: Actionable Error Messages

When CI fails, developers MUST receive clear guidance on how to fix the issue without reading workflow files.

**Acceptance Criteria:**

- Error messages include specific next steps
- Debugging guide exists with common failure patterns
- Errors reference relevant documentation sections
- No need to interpret YAML syntax or bash scripts to understand failures
- **Target:** Reduce average debug time from 15min to 5min

### FR4: On-Demand Heavy Workflows

Heavy workflows that aren't part of regular development MUST only run when explicitly triggered.

**Acceptance Criteria:**

- Telemetry collection runs only on manual trigger
- Wiki publishing runs only on manual trigger
- Documentation explains how to trigger these workflows
- Regular CI runs are unaffected
- **Target:** Remove 34KB from regular CI context

### FR5: Simplified CI Configuration

CI workflow files MUST be understandable without needing to trace complex inline scripts.

**Acceptance Criteria:**

- Workflow files focus on orchestration, not implementation
- Complex logic lives in executable scripts
- Scripts can be run independently for testing
- Workflow file size is reduced by ~50%
- **Target:** 106KB YAML → 50KB YAML

### FR6: Reduced Setup Overhead

CI jobs MUST minimize redundant setup steps and consolidate common operations.

**Acceptance Criteria:**

- Common setup steps (checkout, install, etc.) are defined once
- CI jobs don't repeat identical setup code
- Setup failures provide clear context about which step failed
- **Target:** Fewer job boundaries, clearer failure context

---

## User Experience

### UX1: CI Failure Debugging Flow

**Current Experience:**

1. CI fails with cryptic YAML error
2. Developer opens workflow file (50KB+)
3. Developer traces inline bash scripts
4. Developer guesses at local reproduction
5. Developer pushes fixes, waits for CI (~15 minutes total)

**Required Experience:**

1. CI fails with clear error message: "Spec validation failed. Run `pnpm run specs:validate` locally. See .github/DEBUGGING.md#spec-validation"
2. Developer runs local command immediately
3. Developer sees identical error with actionable next steps
4. Developer fixes and validates locally
5. Developer pushes with confidence (~5 minutes total)

### UX2: AI Assistant Development Session

**Current Experience:**

1. Developer asks AI assistant to help debug CI
2. AI reads 50KB+ of workflow YAML
3. AI reads 324KB of Wiki/micro-lesson documentation (not relevant)
4. AI provides answer based on diluted context

**Required Experience:**

1. Developer asks AI assistant to help debug CI
2. AI reads only relevant workflow scripts and debugging guide
3. AI provides focused answer based on essential context
4. AI still has plenty of token budget for actual code work

### UX3: External LLM Documentation Access

**Current Experience:**

- External LLMs access Wiki documentation
- No change needed (this is working correctly)

**Required Experience:**

- External LLMs access Wiki documentation
- Internal development artifacts don't clutter external documentation
- Clear separation between "for developers" and "for external consumers"

---

## Success Criteria

### Quantitative Metrics

1. **Token savings:** ~12.4M tokens/year reduction (7.2M from context exclusion + 3.4M from workflow simplification + 1.2M from better errors + 600K from command optimization)
2. **CI failure rate:** Reduce from 20% to <10%
3. **Debug time:** Reduce average CI debug time from 15min to 5min (67% improvement)
4. **Workflow size:** Reduce YAML from 106KB to ~50KB (50% reduction)
5. **Local validation:** 100% of CI checks can be run locally

### Qualitative Metrics

1. **Developer confidence:** Developers can fix CI failures without reading workflow files
2. **AI effectiveness:** AI assistants provide better answers with reduced context pollution
3. **Onboarding:** New developers can understand CI failures without YAML expertise
4. **Maintenance:** Changes to validation logic don't require YAML modifications

### Success Indicators

- Zero questions in PRs about "what does this CI error mean?"
- Developers run validation locally before pushing (measurable via git hooks)
- CI failures are fixed in first retry (no multiple debug cycles)
- AI assistants reference debugging guide instead of workflow files

---

## Clarifications Needed

### [NEEDS_CLARIFICATION] Scope Boundaries

**Question:** Should this optimization also cover:

- Pre-commit hooks (currently mentioned but not detailed)?
- Test execution workflows (e2e, unit tests)?
- Deployment workflows (if they exist)?

**Why it matters:** Affects token savings calculation and implementation phases.

### [NEEDS_CLARIFICATION] External LLM Usage Patterns

**Question:** How are external LLMs currently accessing documentation?

- Via GitHub API?
- Via cloned repository?
- Via published Wiki?

**Why it matters:** Ensures `.claudeignore` doesn't break external documentation access.

### [NEEDS_CLARIFICATION] Command Consolidation Priority

**Question:** Which commands are most frequently used and causing highest token consumption?

- `/git:branch` (245 lines)
- `/git:fix-pr` (230 lines)
- Others?

**Why it matters:** Prioritizes Phase 3 implementation order.

### [NEEDS_CLARIFICATION] Generated File Management

**Question:** Which files in typical PRs are generated vs. manual?

- Are the 10-21 files per PR mostly generated?
- Should generated files be in git at all?

**Why it matters:** Affects Phase 5 approach to reducing files per PR.

### [NEEDS_CLARIFICATION] Workflow Trigger Frequency

**Question:** How often do developers actually need to:

- Trigger telemetry collection manually?
- Publish Wiki updates manually?
- Run these workflows in parallel with regular CI?

**Why it matters:** Validates the assumption that making them manual-only is acceptable.

---

## Out of Scope

The following are explicitly NOT part of this specification:

1. **Caching strategies:** Optimizing CI runtime through better caching (separate concern)
2. **Monorepo structure changes:** Modifying package organization or dependencies
3. **Test coverage improvements:** Expanding test suites (covered in Issue #108)
4. **Documentation content quality:** Editing or improving documentation content itself
5. **Build optimization:** Making builds faster (separate from CI orchestration)
6. **Deployment automation:** Changes to deployment workflows
7. **External LLM integration:** How external systems consume documentation

---

## Dependencies & Relationships

**Depends on:**

- None (this is foundational infrastructure work)

**Enables:**

- Faster AI-assisted development (reduced token costs)
- Better developer experience for all future CI work
- Foundation for additional workflow improvements

**Related to:**

- Issue #108 (Testing Infrastructure) - both improve CI/CD quality
- Issue #137 (Documentation Audit) - both address documentation organization

---

## Phasing Recommendation

While implementation will occur in phases (as detailed in Issue #142), the **functional requirements above should all be delivered** to achieve the full user value. Partial implementation leaves developers with inconsistent experience.

**Suggested delivery order** (based on ROI):

1. FR1 (Context exclusion) - Immediate 7.2M token/year savings ✅ COMPLETED
2. FR2 & FR5 (Local validation + simplified workflows) - 3.4M token/year savings
3. FR3 (Better error messages) - 1.2M token/year savings + developer experience
4. FR4 (On-demand workflows) - 34KB context reduction
5. FR6 (Setup consolidation) - Code quality + maintainability

---

## Notes

- `.claudeignore` already created (FR1 partially complete) ✅
- Full implementation phases detailed in Issue #142
- All temporary implementation artifacts go in `scratch/` folder
- Success metrics should be measured before/after each phase
