# Verification Protocol

**Source:** Adapted from [obra/superpowers:verification-before-completion](https://github.com/obra/superpowers)

## Core Principle

```text
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Claiming work is complete without verification is dishonesty, not efficiency.

## The Iron Law

Evidence before claims, always.

If you haven't run the verification command **in this current context**, you cannot claim it passes.

## The Gate Function

**BEFORE claiming any status or completion:**

1. **IDENTIFY**: What command proves this claim?
2. **RUN**: Execute the FULL command (fresh, complete)
3. **READ**: Full output, check exit code, count failures
4. **VERIFY**: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. **ONLY THEN**: Make the claim

### Skip any step = invalid claim

## Automatic Integration

This protocol is automatically enforced in:

- `/git:prepare-pr` - Before creating PR
- `/test` - Before claiming tests pass
- `/db` - Before claiming migration applied
- `/review` - Before claiming lint/type clean

## Verification Commands by Context

| Context              | Verification Command                    | Success Indicator       |
| -------------------- | --------------------------------------- | ----------------------- |
| Tests                | `pnpm test`                             | "X/X tests pass"        |
| TypeScript           | `pnpm typecheck`                        | "No errors found"       |
| Linting              | `pnpm lint`                             | "0 errors, 0 warnings"  |
| Build                | `pnpm build`                            | "Build succeeded"       |
| Migration            | `pnpm db:migrate`                       | "Migration X applied"   |
| Coverage             | `pnpm test:coverage`                    | "Coverage: X%"          |
| E2E Tests            | `pnpm test:e2e`                         | "X specs passed"        |
| RLS Tests            | `pnpm test:rls`                         | "X RLS tests passed"    |
| Regression Test (TDD)| Write → Run (should fail) → Implement → Run (should pass) | Red-Green cycle verified |

## Red Flags - STOP

If you catch yourself:

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Relying on partial verification
- Thinking "just this once"
- **ANY wording implying success without having run verification**

**STOP. Run verification first.**

## Common Failures

| Claim                  | Requires                               | Not Sufficient                     |
| ---------------------- | -------------------------------------- | ---------------------------------- |
| "Tests pass"           | `pnpm test` output: 0 failures         | Previous run, "should pass"        |
| "Linter clean"         | `pnpm lint` output: 0 errors/warnings  | Partial check, extrapolation       |
| "Build succeeds"       | `pnpm build` exit code 0               | Linter passing, logs look good     |
| "Bug fixed"            | Test original symptom: passes          | Code changed, assumed fixed        |
| "Regression test works"| Red-green cycle verified               | Test passes once                   |
| "Requirements met"     | Line-by-line checklist                 | Tests passing                      |

## Rationalization Prevention

| Excuse                         | Reality                                   |
| ------------------------------ | ----------------------------------------- |
| "Should work now"              | RUN the verification                      |
| "I'm confident"                | Confidence ≠ evidence                     |
| "Just this once"               | No exceptions                             |
| "Linter passed"                | Linter ≠ compiler ≠ tests                 |
| "I'm tired"                    | Exhaustion ≠ excuse                       |
| "Partial check is enough"      | Partial proves nothing                    |
| "Different words so rule doesn't apply" | Spirit over letter                        |

## Key Patterns

### Pattern: Tests

```text
✅ CORRECT:
[Runs: pnpm test]
[Sees output: "34/34 tests passed"]
"All tests pass. Output shows 34/34 tests passed with no failures."

❌ INCORRECT:
"Tests should pass now"
"Looks correct"
"I've fixed the issue, tests will pass"
```

### Pattern: Regression Tests (TDD Red-Green)

```text
✅ CORRECT:
1. Write test
2. Run test → MUST FAIL
3. Implement fix
4. Run test → MUST PASS
5. Revert fix temporarily
6. Run test → MUST FAIL AGAIN (proves test catches the bug)
7. Restore fix
8. Run test → PASSES
"Regression test verified with red-green-red-green cycle"

❌ INCORRECT:
"I've written a regression test" (without verifying failure-success cycle)
```

### Pattern: Build

```text
✅ CORRECT:
[Runs: pnpm build]
[Sees: "Build completed successfully", exit code 0]
"Build passes. Successfully compiled all packages."

❌ INCORRECT:
"Linter passed, so build should work"
```

### Pattern: Requirements

```text
✅ CORRECT:
[Re-reads plan]
[Creates checklist of acceptance criteria]
[Verifies each item]
[Reports gaps OR completion with evidence]

❌ INCORRECT:
"Tests pass, phase complete"
```

## Integration with Other Skills

**This Skill is automatically invoked by:**

- `git-workflow` - Before commits and PRs
- `test-scaffolder` - Before claiming tests complete
- `supabase-integration` - Before claiming migrations applied
- `code-reviewer` - Before claiming code quality checks pass

**No manual trigger needed** - verification happens automatically at completion checkpoints.

## Why This Matters

From observed failure patterns:

- Trust broken when claims don't match reality
- Undefined functions shipped (would crash in production)
- Missing requirements shipped (incomplete features)
- Time wasted: false completion → redirect → rework cycle
- Violates core value: "Honesty is fundamental"

## When To Apply

**ALWAYS before:**

- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task

**Rule applies to:**

- Exact phrases ("tests pass")
- Paraphrases and synonyms ("all checks green")
- Implications of success ("ready to ship")
- ANY communication suggesting completion/correctness

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.

---

**Token Cost:** ~180 tokens (loaded on-demand)
**Enforcement:** Automatic integration with all Skills
**Source:** [obra/superpowers](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
