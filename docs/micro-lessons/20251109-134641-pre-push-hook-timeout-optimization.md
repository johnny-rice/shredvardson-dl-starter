# Pre-Push Hook Timeout Optimization

**Context.** Pre-push hooks in lefthook.yml were timing out during `git push` operations because the unit-tests hook had a 120-second artificial timeout buffer. Even though tests executed in 1.73s (cached), the timeout infrastructure added enough overhead to exceed the Bash tool's 2-minute default timeout, causing frequent git push failures.

**Rule.** **Remove artificial timeout buffers from pre-push hooks and rely on natural timeouts (Bash tool, Lefthook) when the actual operation is fast (<5s).**

**Example.**

```yaml
# ❌ WRONG: 120s timeout buffer for 1.73s tests
unit-tests:
  run: |
    TIMEOUT=120
    TEST_LOG=$(mktemp)

    # Complex background process + timeout loop + cleanup trap (60 lines)
    pnpm --silent test:unit > "$TEST_LOG" 2>&1 &
    TEST_PID=$!

    ELAPSED=0
    while [ $ELAPSED -lt $TIMEOUT ]; do
      if ! kill -0 "$TEST_PID" 2>/dev/null; then
        wait "$TEST_PID"
        break
      fi
      sleep 1
      ELAPSED=$((ELAPSED + 1))
    done
    # ... 50 more lines of timeout handling ...

# ✅ CORRECT: Direct execution with natural timeout
unit-tests:
  skip:
    - run: test "$SKIP_TESTS" = "1"
  run: |
    echo "🧪 Running unit tests..."
    START_TIME=$(date +%s)

    # Run tests directly (Bash tool's timeout applies)
    if ! pnpm --silent test:unit; then
      echo "❌ Unit tests failed!"
      echo "💡 To skip tests: SKIP_TESTS=1 git push"
      exit 1
    fi

    END_TIME=$(date +%s)
    TEST_DURATION=$((END_TIME - START_TIME))

    if [ $TEST_DURATION -lt 5 ]; then
      echo "✅ All tests passed! (${TEST_DURATION}s - cached)"
    else
      echo "✅ All tests passed! (${TEST_DURATION}s)"
    fi
```

**Performance Impact:**

- Before: 140s+ worst case (120s timeout buffer + overhead)
- After: 1-2s typical case (cached tests)
- Code reduction: 60 lines removed (100 → 40 lines)

**Guardrails.**

- Only remove timeout buffers when the actual operation is **consistently fast** (<5s in typical cases)
- Always provide an **opt-out mechanism** (environment variable like `SKIP_TESTS=1`)
- Rely on **natural timeouts** from the execution environment (Bash tool has 150s timeout, Lefthook has its own limits)
- Keep **timing feedback** to help developers understand performance
- For operations that **genuinely need long timeouts** (>30s regularly), keep custom timeout handling or move to CI

**When to Keep Artificial Timeouts:**

- Operations that occasionally hang (waiting for user input, network requests)
- Tests that genuinely run 15-30s+ regularly
- External service calls without their own timeouts
- Background processes that need explicit cleanup

**When to Remove Artificial Timeouts:**

- Fast operations (<5s) with reliable completion
- Turbo-cached builds/tests
- Linting and type checking (usually cached)
- Operations that already have timeouts at a lower level

**Research Foundation:**

- Lefthook best practices: Pre-push hooks should complete in <30s
- Industry consensus: Pre-push for fast validation, CI for comprehensive testing
- Actual performance measurement: Tests run in 1.73s, not 120s

**Severity.** high

**UsedBy.** 0

**Tags.** #lefthook #pre-push #timeout #performance #git-hooks #optimization #dx #developer-experience
