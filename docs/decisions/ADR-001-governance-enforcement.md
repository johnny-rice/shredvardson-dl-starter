---
status: accepted
date: 2025-09-23
decision-makers: [repository-owner]
consulted: []
informed: [development-team]
---

# ADR-001: Implement Blocking ADR Enforcement for Governance Changes

## Status

Accepted

## Context

The repository has grown to include critical infrastructure files (scripts, workflows, prompts) that significantly impact developer experience and system behavior. Previously, ADR compliance was advisory only, leading to governance changes without proper documentation.

Phase-6 operational validation revealed the need for enforceable governance to prevent:

- Undocumented changes to critical infrastructure
- Breaking changes to developer workflows
- Security or operational changes without review trail
- Loss of institutional knowledge around architectural decisions

## Decision

Implement **blocking ADR enforcement** in CI with the following specifications:

### Enforcement Scope

ADR documentation is **REQUIRED** for changes to:

- `prompts/**` - AI behavior and prompt engineering
- `scripts/**` - Build, deployment, and utility scripts
- `.github/workflows/**` - CI/CD and automation workflows
- `docs/wiki/**` - Public documentation and processes

### Implementation Details

1. **Blocking Validation**: CI fails if ADR reference missing from PR body
2. **Pattern Matching**: PR body must contain `ADR-XXX` where XXX is the ADR number
3. **Emergency Override**: `override:adr` label allows bypass with warning
4. **Clear Error Messages**: Developers get actionable feedback on failure

### Enforcement Timeline

- **Immediate**: New ADR enforcement is active on merge
- **Grace Period**: None - enforcement begins immediately to establish precedent
- **Override Usage**: Reserved for genuine emergencies only

## Consequences

### Positive

- **Documented Architecture**: All governance changes have decision records
- **Knowledge Preservation**: Rationale captured for future reference
- **Review Quality**: Forces consideration of impact before changes
- **Consistency**: Prevents ad-hoc changes to critical infrastructure

### Negative

- **Additional Overhead**: Small time cost for ADR creation
- **Potential Friction**: Emergency fixes require override label
- **Learning Curve**: Developers must understand ADR process

### Mitigation

- **Operational Runbook**: Clear guidance on when ADRs are needed
- **Override Mechanism**: Emergency bypass available
- **Template Standardization**: ADR creation streamlined with templates

## Implementation Notes

- ADR enforcement implemented in `scripts/starter-doctor.ts`
- PR template updated to highlight REQUIRED enforcement
- Override label `override:adr` provides escape hatch
- GitHub CLI integration checks PR body and labels automatically

## Alternatives Considered

1. **Advisory Only**: Rejected - insufficient compliance observed
2. **Manual Review Gate**: Rejected - doesn't scale, easy to bypass
3. **Different File Scope**: Rejected - current scope covers critical paths
4. **Longer Grace Period**: Rejected - immediate enforcement establishes precedent

## References

- Phase-6 Governance Specification
- Operational Commands Runbook: `docs/ai/runbooks/operational-commands.md`
- PR Template: `.github/pull_request_template.md`
