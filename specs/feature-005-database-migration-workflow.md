---
id: SPEC-20251004-database-migration-workflow
type: spec
issue: 124
source: https://github.com/Shredvardson/dl-starter/issues/124
---

# Feature Specification: Database Migration Workflow

## User Need

As a solo developer building a SaaS product, I need a safe and predictable way to evolve my database schema over time without risking data loss or production downtime. The system should protect me from dangerous operations while still allowing AI tools to assist with schema changes.

### Why This Matters

- Database schema changes are high-risk operations that can cause data loss
- Solo developers don't have dedicated DBAs to review changes
- AI-assisted development can accidentally apply destructive migrations
- No clear process leads to anxiety and delayed schema improvements
- Production incidents from bad migrations are costly and time-consuming

## Functional Requirements

### 1. Migration Lifecycle Management

The system must support a clear progression of database changes through environments:

1. **Local Development**: Developer creates and tests schema changes locally
2. **Validation**: System checks migration for dangerous operations
3. **Version Control**: Migration is committed and reviewed
4. **Staging/Preview**: Auto-deployed on merge to `develop` branch
5. **Production**: Manual approval required, applied via GitHub Actions

### 2. Migration Safety Checks

The system must prevent or warn about:

- **Destructive Operations**: DROP TABLE, DROP COLUMN, TRUNCATE
- **Data Loss Risks**: ALTER COLUMN that changes type without conversion
- **Performance Impacts**: Missing indexes on foreign keys, full table scans
- **Security Gaps**: Missing RLS policies on new tables

Each check should provide:
- Clear explanation of the risk
- Suggested fix or alternative approach
- Option to override with explicit confirmation

### 3. Development Data Management

Developers must be able to:

- **Reset Local Database**: Quickly restore to clean state
- **Seed Realistic Data**: Synthetic data (Faker/Neosync) for development
- **Separate Test Data**: Different seeds for automated tests vs manual testing
- **Preserve User Data**: Option to keep local development data across resets
- **Optional Anonymized Data**: Staging can use anonymized production subset for critical testing

### 4. AI Collaboration Guardrails

When AI tools suggest database changes, the system must:

- **Require Human Review**: Never auto-apply migrations to any environment
- **Provide Context**: Show what tables/columns will be affected
- **Enable Dry Run**: Preview migration results without applying
- **Document Intent**: Capture why the migration is needed
- **Version Safely**: Ensure migrations are timestamped and ordered correctly

### 5. Common Schema Patterns

The system should provide guidance for:

- **Row-Level Security**: Templates for common RLS policies (user isolation, admin access)
- **Foreign Keys**: Best practices for referential integrity
- **Indexes**: When and how to add indexes for performance
- **Timestamps**: Standard created_at/updated_at patterns
- **Soft Deletes**: archived_at patterns vs hard deletes

These patterns should be:
- Copy-pasteable templates
- Explained with use cases
- Tested and verified to work

## User Experience

### Creating a Migration

1. Developer describes schema change needed (via AI or manual)
2. System generates migration file with timestamp and descriptive name
3. Developer reviews migration SQL
4. System runs safety checks and flags any issues
5. Developer tests migration locally
6. System confirms migration succeeded and shows affected rows
7. Developer commits migration to version control

**Success feels like**: Confidence that the migration won't break anything

### Applying to Production

1. Developer triggers production migration (via CLI or CI/CD)
2. System shows what will change (tables, columns, policies)
3. Developer confirms after review
4. System applies migration with transaction safety
5. System reports success or rolls back on failure
6. Developer verifies application still works

**Success feels like**: Peace of mind that production won't go down

### Fix-Forward Recovery

1. Migration causes unexpected issue
2. Developer writes compensating migration to fix forward
3. System validates fix migration
4. Developer applies fix migration
5. System reports success
6. Developer investigates root cause

**Success feels like**: Quick recovery through forward fixes, not risky rollbacks

**Note**: Point-in-time recovery available for catastrophic failures, but fix-forward is preferred modern practice.

## Success Criteria

### Developer Confidence
- Developer can create migrations without fear of breaking production
- Developer can test migrations thoroughly before deployment
- Developer understands what each migration will do

### Safety Net
- System prevents accidental data loss
- System catches common migration mistakes
- System provides rollback capability

### Collaboration
- AI tools can suggest migrations but not apply them unsafely
- Migration intent is documented for future reference
- Changes are reviewable by others (or future self)

### Productivity
- Common schema patterns are quick to implement
- Local development database is easy to reset
- Migration process doesn't slow down development

## Edge Cases & Constraints

### Edge Cases to Handle

1. **Migration Conflicts**: Timestamp ordering prevents conflicts; document dependencies in headers
2. **Long-Running Migrations**: Break into smaller atomic migrations; use online schema change tools for large tables
3. **Data Migrations**: Separate from schema migrations; two-step process (schema first, then data backfill)
4. **Multi-Step Changes**: Break into sequential migrations with clear dependencies documented
5. **Failed Partial Migrations**: Use transactions where possible; fix-forward pattern for recovery

### Constraints

- Must work with existing Supabase migration system
- Must integrate with existing environment management
- Must not require additional infrastructure (no separate migration service)
- Must work offline for local development
- Must be automatable for CI/CD

## Decisions Made (Based on 2024 Industry Research)

Research conducted October 2024. Full report: [docs/research/migration-workflow-research-20251004.md](../docs/research/migration-workflow-research-20251004.md)

### 1. Staging Environment Strategy
**Decision**: Semi-automated with approval gates
- **Staging**: Auto-deploy on merge to `develop` branch
- **Production**: Manual approval required via GitHub Actions workflow
- **Rationale**: Follows Supabase 2024 best practices, balances velocity with safety

### 2. Seed Data Strategy
**Decision**: Synthetic data primary, anonymized optional
- **Development**: Synthetic data using Faker or Neosync
- **Staging** (optional): Anonymized production subset for critical testing
- **Rationale**: Privacy-safe, GDPR compliant, unlimited generation. Synthetic data achieves 99% statistical similarity to production (2024 research)

### 3. Rollback Strategy
**Decision**: Fix-forward primary, point-in-time backup available
- **Default**: Forward migration (write compensating script to undo changes)
- **Fallback**: Point-in-time recovery for catastrophic failures only
- **Never**: Automatic rollback (requires human decision)
- **Rationale**: Modern best practice (2024) is "never rollback databases, always roll forward". Atomic migrations make forward fixes safer.

### 4. Data Migrations
**Decision**: Separate data migrations from schema migrations
- **Schema migrations**: Structural changes only (tables, columns, indexes, RLS policies)
- **Data migrations**: Separate scripts for data transformation/backfill
- **Pattern**: Two-step process (1. Schema change, 2. Data backfill if needed)
- **Rationale**: Keeps migrations atomic and focused, easier to test and rollback

### 5. Migration Order & Dependencies
**Decision**: Timestamp-based with dependency documentation
- **Ordering**: Use Supabase's existing timestamp format (yyyymmddhhmmss)
- **Dependencies**: Document in migration file header comments
- **Complex scenarios**: Break into multiple sequential migrations
- **Rationale**: Supabase already uses timestamps, comments provide context for future developers

### 6. Approval Process
**Decision**: GitHub Actions approval workflow for production
- **Development → Staging**: Auto-deploy on PR merge to `develop`
- **Staging → Production**: Manual approval required via GitHub Actions approval gate
- **Emergency**: Override flag available with audit logging
- **Rationale**: Balances velocity with safety. 27% of AI-generated code contains vulnerabilities (2024 research), human-in-the-loop prevents accidental production changes

## Related Features

- **Feature #3 (Environment Management)**: Migration workflow depends on environment configuration
- **Feature #2 (Testing Infrastructure)**: Migrations should be tested automatically
- **AI Slash Commands**: Migration-related commands need safety guardrails

## User Personas

### Primary: Solo Developer
- Needs safety without bureaucracy
- Values clear documentation over complex tooling
- Wants AI assistance but with guardrails
- Fears production incidents

### Secondary: Future Team Members
- Need to understand migration history
- Must be able to reproduce schema state
- Should have consistent patterns to follow

## Out of Scope

- Database performance monitoring (future feature)
- Schema visualization tools (nice-to-have)
- Automated schema diffing between environments (future enhancement)
- Multi-database support (PostgreSQL only via Supabase)
- Complex data transformation pipelines (use separate ETL tools)

## Success Metrics

How we'll know this feature is working:

1. **Zero Production Incidents**: No data loss or downtime from migrations
2. **Migration Velocity**: Developers apply schema changes confidently and frequently
3. **Safety Net Usage**: Warning system catches mistakes before they reach production
4. **Documentation Reference**: Developers regularly use pattern documentation
5. **Rollback Frequency**: Rollbacks are rare, indicating good validation

## Next Steps

After specification approval:

1. Create implementation plan (`/plan`)
2. Design migration safety check system
3. Document common RLS and schema patterns
4. Build validation scripts
5. Update AI command guardrails
6. Write comprehensive documentation