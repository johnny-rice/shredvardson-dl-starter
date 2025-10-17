# CI Script Tests Integration Summary

**Date:** 2025-10-15
**Purpose:** Integrate CI script tests into existing workflows to ensure scripts are validated before PR creation

---

## What Was Integrated

### 1. Pre-Push Hook
**File:** [scripts/git-hooks/pre-push](../scripts/git-hooks/pre-push)

**Added:** CI script tests run before unit tests

**Flow:**
```bash
git push origin feature-branch
  ↓
🔧 Running CI script tests... (fast: <2s)
  ↓
✅ CI scripts validated
  ↓
🧪 Running unit tests... (target: <20s)
  ↓
✅ All tests passed!
  ↓
Push succeeds
```

**Benefits:**
- Catches broken CI scripts before push
- Fast validation (~2s)
- Blocks push if scripts are broken
- Can bypass with `--no-verify` if needed

---

### 2. Slash Command Update
**File:** [.claude/commands/git/prepare-pr.md](../.claude/commands/git/prepare-pr.md)

**Updated:** Verification commands now include CI script tests

**Before:**
```
Run verification commands:
- pnpm doctor
- pnpm typecheck
- pnpm lint
- pnpm build
```

**After:**
```
Run verification commands:
- pnpm test:ci-scripts  ← NEW
- pnpm doctor
- pnpm typecheck
- pnpm lint
- pnpm build
```

**Result:** LLM will automatically validate CI scripts when creating PRs via `/git:prepare-pr`

---

## How It Works

### Developer Workflow

**1. Making changes:**
```bash
# Edit CI scripts
vim scripts/ci/validate-specs.sh

# Edit tests
vim tests/ci/validate-specs.test.sh
```

**2. Testing locally:**
```bash
# Run tests directly
pnpm test:ci-scripts

# Or test specific script
bash tests/ci/validate-specs.test.sh
```

**3. Pre-push validation:**
```bash
# Try to push
git push origin feature-branch

# Hook runs automatically:
# 1. CI script tests (2s)
# 2. Unit tests (variable)
# 3. Push succeeds or fails
```

**4. LLM workflow:**
```bash
# Developer requests PR
/git:prepare-pr #142

# LLM automatically runs:
# 1. test:ci-scripts ← validates scripts
# 2. doctor
# 3. typecheck
# 4. lint
# 5. build
# 6. Creates PR if all pass
```

---

## Benefits

### 1. Early Detection
- Broken scripts caught before push
- No CI failures due to script syntax errors
- Faster feedback loop

### 2. Consistent Validation
- Pre-push hook ensures scripts work
- LLM validates before PR creation
- Same tests run locally and in CI

### 3. Improved DX
- Fast tests (~2s)
- Clear error messages
- Can bypass if needed (`--no-verify`)
- Tests run automatically

### 4. Token Optimization Alignment
- Ensures token optimization scripts work
- Validates governance enforcement
- Prevents pushing broken scripts

---

## Test Coverage

### Current Tests
**File:** [tests/ci/validate-specs.test.sh](../tests/ci/validate-specs.test.sh)

**Coverage:**
1. ✅ Valid spec passes validation
2. ✅ Invalid naming fails validation
3. ✅ Missing status fails validation
4. ✅ Missing required files fail validation
5. ✅ Missing proper header fails validation
6. ✅ No specs directory handled gracefully

**Total:** 6/6 tests passing

### Future Tests (from TASK-20251015)
- Spec lane check tests
- AI review scraper tests
- Additional CI script tests as implemented

---

## Commands Available

### Run Tests
```bash
# All CI script tests
pnpm test:ci-scripts

# Specific test file
bash tests/ci/validate-specs.test.sh

# Specific validation
pnpm run specs:validate
```

### Bypass Hook (when needed)
```bash
# Skip all hooks
git push --no-verify

# Or set environment variable
SKIP_HOOKS=true git push
```

### Reinstall Hook
```bash
# If hook gets out of sync
pnpm run hooks:install

# Or manually
cp scripts/git-hooks/pre-push .git/hooks/pre-push
```

---

## Error Handling

### If CI Script Tests Fail

**Pre-push:**
```
🔧 Running CI script tests...
❌ CI script tests failed! Fix the scripts before pushing.

💡 To bypass this check (not recommended):
   git push --no-verify
```

**What to do:**
1. Run `pnpm test:ci-scripts` locally
2. Review test output
3. Fix the failing script
4. Verify tests pass
5. Try push again

### If LLM Hits Failed Tests

**During `/git:prepare-pr`:**
```
Running verification commands...
❌ pnpm test:ci-scripts failed

Cannot proceed with PR creation until tests pass.
```

**What to do:**
1. LLM should automatically fix the issue
2. Or ask human for guidance
3. Or skip if using `--no-verify` pattern

---

## Integration Points

### 1. Git Hooks
- Pre-push hook validates scripts
- Runs before unit tests
- Fast fail prevents unnecessary test runs

### 2. Slash Commands
- `/git:prepare-pr` includes CI script tests
- `/git:fix-pr` inherits from prepare-pr
- Future commands can reference same pattern

### 3. Package Scripts
- `test:ci-scripts` - Run all CI script tests
- `specs:validate` - Run spec validation
- `ci:validate` - Run CI validations

### 4. CI/CD (Future)
- Will add CI workflow validation
- Token optimization guard
- Script regression prevention

---

## Maintenance

### Adding New CI Script Tests

**1. Create test file:**
```bash
touch tests/ci/new-script.test.sh
chmod +x tests/ci/new-script.test.sh
```

**2. Update test runner:**
```bash
# Edit package.json
"test:ci-scripts": "bash tests/ci/validate-specs.test.sh && bash tests/ci/new-script.test.sh"

# Or create master test runner
bash tests/ci/run-all.sh
```

**3. Hook picks up automatically:**
- Pre-push runs `pnpm test:ci-scripts`
- New test included automatically
- No hook changes needed

### Updating Existing Tests

**1. Edit test file:**
```bash
vim tests/ci/validate-specs.test.sh
```

**2. Verify changes:**
```bash
pnpm test:ci-scripts
```

**3. Tests run automatically:**
- On next push
- On next `/git:prepare-pr`
- In CI (when configured)

---

## Configuration

### Pre-Push Hook Settings
**File:** [scripts/git-hooks/pre-push](../scripts/git-hooks/pre-push)

**Timing:**
- CI script tests: <2s (fast)
- Unit tests: <20s (target)
- Total: <22s (acceptable)

**Bypass Options:**
```bash
# Environment variable
SKIP_HOOKS=true git push

# Git flag
git push --no-verify
```

### Slash Command Settings
**File:** [.claude/commands/git/prepare-pr.md](../.claude/commands/git/prepare-pr.md)

**Verification Order:**
1. `test:ci-scripts` (new, fast)
2. `doctor` (health checks)
3. `typecheck` (TypeScript)
4. `lint` (code style)
5. `build` (compilation)

**Timing:**
- CI script tests: ~2s
- All verifications: ~90s estimated
- Total within 120s soft timeout

---

## Related Documentation

- [TASK-20251015-llm-context-optimization.md](../tasks/TASK-20251015-llm-context-optimization.md) - Full implementation plan
- [tests/ci/contracts.md](../tests/ci/contracts.md) - CI script contracts
- [.github/DEBUGGING.md](../.github/DEBUGGING.md) - CI debugging guide
- [docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md](../docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md) - Token optimization guidelines

---

## Status

✅ **Pre-push hook:** Updated and active
✅ **Slash commands:** Updated with CI script tests
✅ **Tests:** 6/6 passing
✅ **Documentation:** Complete
✅ **Ready for:** Daily use and future expansion

---

**Last Updated:** 2025-10-15
**Next Steps:** Continue implementing remaining tasks from TASK-20251015