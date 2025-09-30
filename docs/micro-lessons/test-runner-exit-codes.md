---
UsedBy: 0
Severity: high
---

# Ensure Test Runners Exit Non-Zero on Failures

**Context.** CodeRabbit flagged test runner catching errors but not failing CI, leading to false positive builds.
**Rule.** **Always call process.exit(1) or rethrow errors in test runners to signal failures to CI systems.**
**Example.**

```javascript
// ❌ CI never sees test failures
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    // Missing exit code - CI thinks everything passed!
  }
}

// ✅ CI properly detects failures
function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    process.exit(1); // Fail fast with non-zero exit
  }
}
```

**Guardrails.**

- Test failure behavior: run a deliberately failing test
- Use `echo $?` to verify exit codes in bash
- Consider stopping on first failure vs. collecting all failures

**Tags.** testing,ci,exit-codes,test-runners,failure-detection,coderabbit
