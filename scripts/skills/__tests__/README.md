# Skills Test Suite

Comprehensive test coverage for all bash Skills in `scripts/skills/`.

## Test Framework

- **BATS (Bash Automated Testing System)** - v1.13.0
- **bats-support** - Test helper library
- **bats-assert** - Assertion library

## Running Tests

```bash
# Run all Skills tests
pnpm test:skills

# Run with verbose output
pnpm test:skills:verbose

# Run specific test file
./node_modules/.bin/bats scripts/skills/__tests__/git-branch.bats
```

## Test Coverage

Current test coverage for Skills:

| Skill | Test File | Tests | Status |
|-------|-----------|-------|--------|
| git.sh | git.bats | 15 | ✅ All passing |
| git/branch.sh | git-branch.bats | 20 | ✅ 90% passing |
| git/commit.sh | git-commit.bats | 22 | ✅ 90% passing |
| git/workflow.sh | git-workflow.bats | 17 | ⚠️ 53% passing (git state detection issues) |
| git/pr.sh | git-pr.bats | 15 | ✅ 93% passing |
| git/pr-fix.sh | git-pr-fix.bats | 24 | ✅ All passing |
| code-reviewer.sh | code-reviewer.bats | 22 | ✅ 86% passing |
| documentation-sync.sh | documentation-sync.bats | 21 | ✅ 95% passing |
| design-system.sh | design-system.bats | 29 | ✅ All passing |

**Overall: 158/185 tests passing (85.4%)**

## Test Structure

Each test file follows this structure:

```bash
#!/usr/bin/env bats

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir  # For tests requiring git repos
}

teardown() {
  teardown_test_dir  # Cleanup
}

@test "skill: success case" {
  run bash "$SKILL_PATH" args

  assert_success
  assert_output --partial "expected output"
}

@test "skill: error case" {
  run bash "$SKILL_PATH" invalid

  assert_failure
  assert_output --partial "error"
}
```

## Test Helpers

Common test helpers in `test_helper/common.bash`:

- `setup_test_dir()` - Creates isolated git repo for testing
- `teardown_test_dir()` - Cleans up test directory
- `disable_skill_logging()` - Disables CSV logging during tests
- `mock_git()` - Mocks git commands
- `mock_gh()` - Mocks GitHub CLI
- `mock_pnpm()` - Mocks pnpm commands

## Known Issues

Some tests have known limitations:

1. **git/workflow.sh tests** - Git state detection doesn't work perfectly in test environment
   - Commits created in tests aren't detected by `git rev-list`
   - Uncommitted files aren't detected by `git diff-index`
   - **Impact**: Workflow stage detection tests fail
   - **Workaround**: These scenarios are tested manually

2. **JSON validation tests** - Some tests expect JSON but receive stdout messages
   - **Impact**: 3 tests fail for code-reviewer.sh
   - **Workaround**: Validate JSON manually or capture stderr

3. **git/branch.sh** - JQ syntax error in one test
   - **Impact**: Branch already exists test fails
   - **Root cause**: String concatenation in jq

## Adding New Tests

To add tests for a new Skill:

1. Create test file: `scripts/skills/__tests__/skill-name.bats`
2. Follow existing test structure
3. Test success cases, error cases, and edge cases
4. Validate JSON output format
5. Mock external commands (git, gh, pnpm)
6. Run tests: `pnpm test:skills`

## CI Integration

Skills tests run automatically in GitHub Actions:

- On push to `main` branch
- On pull requests
- When Skills files change

See `.github/workflows/skills-validation.yml` for CI configuration.

## Testing Best Practices

1. **Isolate tests** - Use temp directories for git operations
2. **Mock external commands** - Don't rely on real git/gh APIs
3. **Test error cases** - Validate error messages and exit codes
4. **Validate JSON** - Use `jq` to verify output format
5. **Disable logging** - Prevent CSV log pollution during tests
6. **Clean up** - Always use `teardown()` to remove temp files

## Debugging Tests

To debug failing tests:

```bash
# Run single test with verbose output
./node_modules/.bin/bats -t scripts/skills/__tests__/git-branch.bats

# Run specific test by line number
./node_modules/.bin/bats scripts/skills/__tests__/git-branch.bats:75

# Show test output without assertions
run bash scripts/skills/git/branch.sh "Issue #123: Test"
echo "$output"
```

## Future Improvements

- [ ] Fix git/workflow.sh state detection in tests
- [ ] Improve JSON parsing in test assertions
- [ ] Add integration tests with real git operations
- [ ] Increase coverage to 95%+
- [ ] Add performance benchmarks
- [ ] Test Skills interaction with LLM workflows
