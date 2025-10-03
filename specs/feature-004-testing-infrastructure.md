---
id: SPEC-20251003-testing-infrastructure
type: spec
issue: 108
source: https://github.com/Shredvardson/dl-starter/issues/108
---

# Feature Specification: Testing Infrastructure

**Feature ID**: 004
**Status**: Final - Research Complete
**Created**: 2025-10-03
**Updated**: 2025-10-03
**Lane**: spec (requirements only - no technical implementation)

## User Need

### Primary Users
- **Solo Entrepreneur/Developer**: Building a SaaS product with AI assistance who needs confidence that code changes don't break existing functionality
- **Future Contributors**: Anyone who joins the project needs to understand what works and verify their changes don't introduce regressions
- **End Users**: Indirectly benefit from fewer bugs and more reliable features reaching production

### Problem Statement
Currently, the codebase has zero automated testing despite emphasis on quality engineering. This creates several critical problems:

1. **False Confidence**: No way to verify that features actually work as intended
2. **Regression Risk**: Changes can silently break existing functionality without detection
3. **AI Assistance Risk**: AI-generated code cannot be validated automatically, increasing the chance of shipping broken code
4. **Security Gaps**: Row Level Security (RLS) policies protecting user data have no automated validation
5. **Slow Feedback**: Manual testing is time-consuming and inconsistent
6. **Fear of Change**: Developers hesitate to refactor or improve code without safety net

### Business Impact
- **Quality Risk**: High likelihood of shipping bugs to production
- **Time Waste**: Manual testing and debugging takes significantly longer than automated validation
- **Security Risk**: Unvalidated RLS policies could leak user data between accounts
- **Confidence Loss**: Users experience bugs and lose trust in the product
- **Development Speed**: Fear of breaking things slows down feature velocity

---

## Functional Requirements

### Core Capabilities

#### 1. Component & Logic Validation
The system must verify that:
- UI components render correctly with various inputs and states
- User interactions (clicks, form inputs, navigation) produce expected results
- Data transformations and business logic produce correct outputs
- Error states are handled gracefully
- Edge cases (empty data, null values, extreme inputs) work correctly

**User Value**: Developers can make changes with confidence that basic functionality still works

#### 2. User Flow Validation
The system must verify critical user journeys work end-to-end:
- User can sign up for an account successfully
- User can log in with valid credentials
- User can log out and session ends properly
- User cannot access protected features when logged out
- User can perform core workflows (create/read/update/delete operations)
- User receives appropriate feedback for errors and success states

**User Value**: End users experience reliable, working features in production

#### 3. Security Policy Validation
The system must verify data access controls work correctly:
- Users can only access their own data
- Users cannot view or modify data belonging to other users
- Different user roles have appropriate permissions (when roles exist)
- Anonymous/unauthenticated users have no unauthorized access
- Admin or elevated roles can access appropriate data

**User Value**: User data remains private and secure, building trust

#### 4. Quality Gates
The system must prevent broken code from reaching users:
- Code changes are automatically validated before deployment
- Team members cannot merge code that fails validation
- Clear feedback shows what failed and why
- Developers can run validations locally before submitting changes
- **Coverage threshold: 70% minimum** with risk-based focus on critical paths
- Tests focus on **scenario coverage** (which flows are tested) not just percentages
- 80% of test effort focuses on critical paths: auth, checkout, payment, data access

**User Value**: Significantly reduced bugs in production, better user experience

**Research Insight**: Modern 2025 best practices emphasize risk-based testing over raw coverage percentages. Vitest supports both percentage thresholds and negative thresholds (-10 uncovered lines) to ensure new code considers testing.

#### 5. Test Creation Guidance
The system must help developers write effective tests:
- Clear examples show how to validate common scenarios
- Documentation explains what to test and why
- Patterns are established for consistent test writing
- Special cases (mocking external services, authenticated users) have reusable helpers

**User Value**: Faster feature development with built-in quality

#### 6. AI-Powered Visual Validation (NEW)
The system must enable AI to verify visual correctness:
- AI can control and inspect a live browser during testing
- AI can take screenshots and compare visual states
- AI can inspect DOM/CSS to catch layout issues
- AI can analyze network requests and performance
- AI can verify user flows work visually as expected

**User Value**: AI assistance becomes safer - can verify fixes work visually before deployment

**Research Insight**: Chrome DevTools MCP enables AI coding assistants to "see" what happens in the browser, providing automated visual debugging, performance analysis, and layout validation.

---

## User Experience Requirements

### For Developers

#### Local Development
- Developer makes code changes
- Developer runs validation command to check their work
- Results appear **within 30 seconds** showing pass/fail status
- Failed tests show clear error messages explaining what broke
- Developer fixes issues and re-runs until passing
- Developer submits code with confidence

**Research Insight**: Pre-commit hooks need instant feedback (<30s) to avoid disrupting developer flow.

#### Code Review Process
- Developer submits code changes (triggers pre-push validation)
- Automated system runs all validations in CI
- Results appear in the pull request within **3 minutes** showing:
  - Which tests passed/failed
  - What percentage of code is covered by tests
  - Any security or quality warnings
  - Visual validation results from AI
- Team can see validation status before reviewing code
- Merge is blocked if validations fail
- Developer can bypass pre-push with `--no-verify` for emergencies (CI still validates)

**Research Insight**: Pre-push hooks (not pre-commit) allow multiple commits before validation while maintaining safety. Emergency bypass prevents developer frustration.

#### Writing New Tests
- Developer needs to test a new feature
- Developer references documentation for patterns
- Developer finds example test similar to their needs
- Developer copies pattern and adapts for their feature
- Developer runs test to verify it works
- Test becomes part of the validation suite

#### AI-Assisted Visual Testing
- Developer makes UI changes
- AI agent connects to live browser via Chrome DevTools MCP
- AI inspects DOM, takes screenshots, analyzes layout
- AI provides concrete suggestions for fixing visual issues
- Developer verifies AI's assessment matches intent
- Visual validation becomes part of test suite

### For Project Maintainers

#### Quality Monitoring
- View overall test coverage metrics (70% minimum)
- Identify areas of code lacking validation
- Track test execution time and performance
- Review failed test history to spot patterns
- Monitor scenario coverage (which critical flows are tested)

#### Security Validation
- Verify all database access is properly secured
- Validate that RLS policies prevent data leaks
- Test user role permissions work correctly
- Ensure anonymous users cannot access protected data

---

## Success Criteria

### Minimum Viable Testing (Phase 1)
The feature is successful when:
1. **Critical paths are validated**: Auth flows and core user journeys have automated checks
2. **Security is verified**: RLS policies have automated validation preventing data leaks
3. **Quality gates exist**: Broken code cannot reach production without manual override
4. **Documentation exists**: Developers can write new tests following clear examples
5. **Local validation works**: Developers can verify changes on their machine in **<30 seconds**
6. **Pre-push hooks configured**: Tests run before push with emergency bypass option
7. **Test data isolated**: Database resets before each test for reproducibility

### Complete Testing Coverage (Phase 2)
Additional success when:
8. **Coverage threshold met**: 70% of code is validated with risk-based focus
9. **All UI components validated**: Every reusable component has basic checks
10. **All user flows validated**: Every feature has end-to-end verification
11. **Performance validated**: Tests run fast enough to not slow down development
12. **CI/CD integrated**: Every code change triggers automatic validation within **<3 minutes**
13. **Visual AI validation**: Chrome DevTools MCP enables AI visual testing
14. **Scenario coverage tracked**: Critical user journeys are comprehensively tested

---

## Scope & Boundaries

### In Scope
- Validation for UI components and user interactions
- Validation for critical user workflows (auth, core features)
- Validation for data access security (RLS policies)
- Quality gates preventing broken code from reaching production
- Documentation and examples for writing tests
- Local development workflow for running validations
- **AI-powered visual validation via Chrome DevTools MCP** (NEW)
- Database reset and test data management patterns
- Pre-push hook configuration with bypass option

### Out of Scope
- Performance/load testing (how the system handles high traffic)
- Browser compatibility testing across all browsers
- Mobile device testing across all devices
- Accessibility compliance testing (separate feature)
- Third-party service testing (external APIs)

### Enhanced Visual Testing (vs Feature 003)
- **Feature 003**: Visual regression for design system tokens (pixel-perfect comparisons)
- **Feature 004**: AI-powered visual validation (DOM inspection, layout analysis, performance)
- These complement each other - Feature 003 catches token changes, Feature 004 enables AI debugging

### Dependencies
- **Feature 001 (Auth)**: Auth flows must exist to validate them
- **Feature 003 (Design System)**: UI components should be stable before extensive testing
- **Environment Management**: Test database/environment must be separate from production

---

## Decisions Made (Research-Based)

### 1. Coverage Threshold: 70% with Risk-Based Focus ✅
**Decision**: 70% minimum coverage for unit/integration tests, with emphasis on scenario coverage over percentages.

**Rationale**:
- Industry standard for production systems
- Vitest supports percentage thresholds and negative thresholds
- Modern best practices prioritize testing critical paths (80% of effort on auth, payments, data access)
- Focus on "what flows are tested" not just "how many lines are covered"

**Configuration Approach**:
```yaml
coverage:
  lines: 70
  functions: 70
  branches: 65
  statements: 70
```

### 2. Test Data Management: Ephemeral Reset Pattern ✅
**Decision**: Reset database before each test, create test data via API calls during test setup.

**Rationale**:
- 2025 trend toward ephemeral preview environments
- Database reset prevents data pollution between tests
- API-based data creation keeps tests independent
- Separate test database mirrors production schema

**Implementation Pattern**:
```
beforeEach test:
  1. Reset database to clean state (truncate or fixture load)
  2. Create minimal required test data via API/SQL
  3. Run test with isolated data
  4. Automatic cleanup on next reset
```

### 3. Execution Time Targets ✅
**Decision**:
- **Local (pre-push)**: <30 seconds for unit + integration tests
- **CI (pull request)**: <3 minutes for full suite including E2E
- **Nightly**: Extended tests, visual regression, performance

**Rationale**:
- Pre-push hooks need instant feedback to avoid disrupting flow
- CI needs to complete quickly for rapid iteration
- Split fast tests (local) from slower comprehensive tests (CI)

### 4. Pre-commit Enforcement: Pre-Push with Bypass ✅
**Decision**: Run tests on pre-push (not pre-commit) with `--no-verify` bypass option.

**Rationale**:
- Pre-commit hooks can slow frequent commits
- Pre-push allows multiple commits before validation
- Emergency bypass prevents developer frustration
- CI still validates if bypassed

### 5. Visual Testing: Chrome DevTools MCP Integration ✅
**Decision**: Integrate Chrome DevTools MCP for AI-powered visual validation.

**Why This is Transformative**:
- AI agents can control Chrome and inspect actual browser state
- Automated visual debugging with screenshots, DOM/CSS inspection
- Performance analysis via trace recording
- Complements Feature 003's pixel-perfect token regression testing

**Use Cases**:
- AI verifies fixes work visually before deployment
- AI detects layout issues (overflows, alignment)
- AI analyzes performance bottlenecks
- AI validates accessibility in live browser

**Integration**:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

---

## User Stories

### Story 1: Developer Makes Code Change
**As a** developer
**I want to** verify my code changes don't break existing functionality
**So that** I can submit code confidently without fear of breaking production

**Acceptance Criteria**:
- Developer can run validation command locally
- Results show within 30 seconds (updated from 60s)
- Clear pass/fail status with error details
- Failed tests show what broke and why

### Story 2: Security-Conscious Developer
**As a** developer working with user data
**I want to** verify that data access controls work correctly
**So that** users' private data remains secure and isolated

**Acceptance Criteria**:
- Developer can validate RLS policies automatically
- Tests verify users cannot access others' data (database reset ensures isolation)
- Tests verify role-based permissions work
- Clear feedback shows any security gaps

### Story 3: AI-Assisted Development
**As a** developer using AI code generation
**I want to** automatically verify AI-generated code works correctly
**So that** I can leverage AI assistance without introducing bugs

**Acceptance Criteria**:
- AI-generated code is automatically validated
- Validation runs on every code change (pre-push)
- Failed validations block deployment
- Developer gets clear feedback on what to fix

### Story 4: New Team Member
**As a** new contributor to the project
**I want to** understand what functionality exists and how it should work
**So that** I can add features without breaking existing code

**Acceptance Criteria**:
- Tests document expected behavior
- Examples show common testing patterns (data management, mocking)
- Documentation explains how to write new tests
- New contributor can run all tests locally in <30s

### Story 5: Project Maintainer
**As a** project maintainer
**I want to** ensure all code changes are validated before merging
**So that** broken code never reaches production users

**Acceptance Criteria**:
- All pull requests automatically run validations (CI <3min)
- Merge is blocked if validations fail
- Coverage reports show 70% threshold met
- Security validations prevent data leaks

### Story 6: AI-Powered Visual Validation (NEW)
**As a** developer using AI assistance
**I want** AI to visually verify that my UI changes work correctly
**So that** I can trust AI-generated fixes actually solve the problem

**Acceptance Criteria**:
- AI can connect to live browser via Chrome DevTools MCP
- AI takes screenshots and inspects DOM/CSS
- AI provides concrete suggestions for layout issues
- AI verifies user flows work visually as expected
- Visual validation results appear in PR

---

## Metrics & Measurement

### Quality Metrics
- **Test Coverage**: 70% minimum (lines, functions, branches, statements)
- **Scenario Coverage**: Percentage of critical user flows tested
- **Test Reliability**: Percentage of test runs that complete successfully
- **Defect Detection Rate**: Percentage of bugs caught by tests before production

### Performance Metrics
- **Local Execution Time**: <30 seconds for unit + integration tests
- **CI Execution Time**: <3 minutes for full validation suite
- **Feedback Speed**: Time from code change to validation results

### Business Metrics
- **Production Bug Rate**: Number of bugs reaching production (should decrease)
- **Deployment Confidence**: Developer confidence in deploying changes (survey)
- **Mean Time to Recovery**: Time to fix production issues (should decrease with better tests)

---

## Related Features

- **Feature 001 (Auth)**: Provides auth flows that need validation
- **Feature 003 (Design System)**: UI components need functional validation; provides visual regression for tokens
- **Future Multi-tenancy**: Will need RLS validation for organization isolation
- **Future Billing**: Payment flows will need end-to-end validation

---

## Notes

### Why This Feature Matters
Testing infrastructure is not a "nice to have" - it's foundational for quality. Without it:
- AI assistance becomes dangerous (cannot verify generated code)
- Refactoring becomes risky (no safety net)
- Security issues go undetected (RLS policies not validated)
- Developer productivity suffers (manual testing is slow)

This feature is a **force multiplier** for development velocity while reducing risk.

### Implementation Priority
This is marked **P0 (BLOCKER)** in the roadmap because:
1. Subsequent features need tests to be validated
2. RLS policies (critical for security) need validation
3. AI-assisted development requires automated verification
4. False confidence without tests is worse than knowing the gaps

### Research Sources (2025 Best Practices)
- Vitest coverage configuration and thresholds
- Playwright test coverage strategies (risk-based approach)
- Test data management for E2E testing (ephemeral pattern)
- Pre-commit hooks developer experience (pre-push preference)
- Chrome DevTools MCP for AI visual validation

### Chrome DevTools MCP Innovation
This specification incorporates bleeding-edge 2025 technology: Chrome DevTools MCP allows AI coding assistants to "see" what happens in the browser. This transforms testing from blind code generation to visual verification, enabling:
- AI to debug layout issues by inspecting live DOM
- AI to verify performance by recording traces
- AI to validate user flows by controlling the browser
- AI to catch visual regressions automatically

### References
- Implementation Roadmap: Issue #2
- Related: Feature 003 (visual regression for design tokens)
- Chrome DevTools MCP: https://developer.chrome.com/blog/chrome-devtools-mcp
- GitHub Issue: #108
