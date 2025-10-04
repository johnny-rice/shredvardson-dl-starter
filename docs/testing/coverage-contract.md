# Coverage Contract

**Version**: 1.0
**Updated**: 2025-10-03

## Coverage Thresholds

Minimum coverage requirements enforced by Vitest:

| Metric         | Threshold | Rationale                                              |
| -------------- | --------- | ------------------------------------------------------ |
| **Lines**      | 70%       | Industry standard for production systems               |
| **Functions**  | 70%       | Ensure business logic is validated                     |
| **Branches**   | 65%       | Cover major code paths (slightly lower for complexity) |
| **Statements** | 70%       | Core execution coverage                                |

## Excluded from Coverage

The following files/patterns are excluded from coverage requirements:

```
**/*.test.{ts,tsx}          # Test files themselves
**/*.spec.{ts,tsx}          # E2E test files
**/*.config.{ts,js}         # Configuration files
**/tests/**                 # Test utilities and fixtures
**/.next/**                 # Build output
**/node_modules/**          # Dependencies
**/dist/**                  # Distribution files
**/tailwind.config.ts       # Tailwind config
**/postcss.config.js        # PostCSS config
```

## Critical Paths (80% of Testing Effort)

Following risk-based testing strategy, focus on:

### 1. Authentication Flows

- User signup
- User login
- User logout
- Session management
- Password reset
- Email verification

### 2. Data Access & Security (RLS)

- User data isolation
- Role-based permissions
- Anonymous access denial
- Cross-user data protection

### 3. Core Workflows

- CRUD operations
- Form submissions
- Data mutations
- Error handling
- Loading states

## Coverage Goals by Component Type

| Component Type     | Target Coverage | Priority |
| ------------------ | --------------- | -------- |
| Auth components    | 90%+            | P0       |
| Data access layers | 85%+            | P0       |
| UI components      | 70%+            | P1       |
| Utility functions  | 80%+            | P1       |
| Page components    | 65%+            | P2       |
| Layout components  | 60%+            | P2       |

## Measurement & Enforcement

### Local Development

```bash
# Run tests with coverage
pnpm --filter=web test:unit --coverage

# Coverage report location
apps/web/coverage/index.html
```

### CI/CD

- Coverage measured on every PR
- Merge will be blocked if below 70% threshold (currently soft-fail during rollout phase)
- Coverage report uploaded to Codecov
- Trends tracked over time

**Note:** Coverage enforcement is currently set to `continue-on-error: true` in CI to allow gradual rollout. Once baseline coverage reaches 70%, this will be changed to hard-fail to enforce the threshold.

## Risk-Based Testing Philosophy

Rather than chasing 100% coverage:

1. **Identify high-risk areas** (auth, payments, data access)
2. **Test critical user journeys** end-to-end
3. **Validate security boundaries** (RLS policies)
4. **Focus on business logic** over UI implementation details

## Review & Updates

This contract should be reviewed:

- Quarterly (adjust thresholds if needed)
- When adding major new features
- When coverage consistently exceeds targets
- When team size or velocity changes

**Last Review**: 2025-10-03
**Next Review**: 2026-01-03
