# AI Assistance Disclosure Guide

## Summary

This guide helps contributors accurately disclose AI usage in pull requests to ensure transparency, enable appropriate code review, and track AI effectiveness across the team.

## When to Use

Use this guide when filling out the "AI Assistance Disclosure" section of the PR template. All PRs should include AI disclosure to maintain transparency about AI-generated code.

## What Counts as AI Assistance

AI assistance includes any code, architecture, or design decisions generated or significantly influenced by AI tools.

### ✅ Counts as AI Assistance

- **Code generation:** Code written by AI tools (Claude Code, GitHub Copilot, Cursor, ChatGPT, etc.)
- **Significant refactoring:** AI-suggested structural changes or rewrites
- **Architecture decisions:** Design patterns or technical approaches guided by AI
- **Test generation:** Test files, test cases, or mock data created by AI
- **Complex logic:** Algorithms, business logic, or data transformations AI-generated
- **Database queries:** SQL, ORM queries, or migrations written by AI
- **API implementations:** Endpoints, handlers, or integrations scaffolded by AI
- **Component structure:** React/Vue components with AI-generated JSX/template logic

### ❌ Does NOT Count as AI Assistance

- **Autocomplete/IntelliSense:** Standard IDE completions (VS Code, JetBrains, etc.)
- **Simple formatting:** Prettier, ESLint auto-fixes, or whitespace cleanup
- **Grammar/spell-check:** Corrections in comments, docs, or commit messages
- **Documentation typo fixes:** Fixing spelling errors in existing docs
- **Import statements:** Auto-added imports from IDE features
- **Syntax fixes:** Basic language syntax corrections (missing semicolons, brackets, etc.)
- **Renaming:** Simple variable/function renaming with IDE refactor tools

## Estimation Guidelines

Choose the category that best describes the overall AI contribution to your PR:

### None (0%)

**Definition:** All code written manually without AI code generation tools.

**Examples:**

- Typed out implementation from scratch
- Used only standard IDE autocomplete
- Reviewed AI suggestions but rejected them all
- Only used AI for non-code research (reading docs)

**When to select:** No AI tools generated code in this PR.

### Minimal (<25%)

**Definition:** AI helped with boilerplate, suggestions, or small sections.

**Examples:**

- AI generated import statements or type definitions
- Used AI for 1-2 simple helper functions
- AI suggested approach, human wrote the code
- AI generated test boilerplate, human wrote test cases
- AI provided code snippet, heavily modified by human

**When to select:** You wrote most code yourself, AI provided minor assistance.

### Moderate (25-75%)

**Definition:** AI generated structure/scaffolding, human refined and validated.

**Examples:**

- AI generated component structure, human added business logic
- AI wrote initial implementation, human refactored significantly
- AI generated tests, human added edge cases and assertions
- AI scaffolded API endpoints, human implemented handlers
- Mixed: some files AI-heavy, others human-written

**When to select:** Significant collaboration between AI and human, both contributed substantially.

### Significant (>75%)

**Definition:** Primarily AI-generated code with human review and minor adjustments.

**Examples:**

- AI generated entire feature, human tweaked configuration
- AI wrote implementation, human only fixed linting/type errors
- AI generated complete test suite, human verified correctness
- AI implemented multiple components, human reviewed and accepted
- Prompt-driven development with minimal manual coding

**When to select:** AI did the heavy lifting, you primarily reviewed and validated.

## Disclosure Best Practices

### Be Specific with AI-Generated Components

**❌ Vague:**

- "Some files used AI"
- "AI helped with implementation"

**✅ Specific:**

- `src/components/UserProfile.tsx` (lines 15-89)
- `lib/auth/session-manager.ts` (entire file)
- `calculateTotalWithTax()` function in `utils/pricing.ts`

### List All AI Tools Used

Include specific tools, not just "AI":

- Claude Code
- GitHub Copilot
- Cursor AI
- ChatGPT (GPT-4)
- Codeium
- Tabnine
- Amazon CodeWhisperer

### Document Your Review Process

Check all applicable boxes in "Human Review Applied":

- [ ] All AI-generated code reviewed line-by-line
- [ ] Edge cases manually tested
- [ ] Security implications considered
- [ ] Performance implications validated

**Important:** Don't check boxes you didn't do. Reviewers rely on this information.

### Share Learnings in Notes (Optional but Encouraged)

Use the Notes field to help the team learn:

**Good examples:**

- "Used Claude Code's /review command to catch edge case bugs before PR"
- "AI struggled with TypeScript generics, manually refactored for type safety"
- "Prompt: 'Generate CRUD handlers with RLS policies' worked well"
- "Had to rewrite AI's error handling to match project patterns"

## Common Scenarios

### Scenario 1: Full Feature with Claude Code

```markdown
**AI Assistance Used:** ☐ None / ☐ Minimal (<25%) / ☐ Moderate (25-75%) / ☒ Significant (>75%)

**AI-Generated Components:**
- src/features/notifications/NotificationCenter.tsx (entire file)
- src/features/notifications/hooks/useNotifications.ts (entire file)
- src/lib/adapters/notification-service.ts (entire file)
- src/features/notifications/__tests__/NotificationCenter.test.tsx (entire file)

**AI Tools Used:**
- Claude Code

**Human Review Applied:**
- [x] All AI-generated code reviewed line-by-line
- [x] Edge cases manually tested
- [x] Security implications considered
- [x] Performance implications validated

**Notes:**
Used Claude Code with /test command for TDD workflow. AI generated comprehensive tests first,
then implementation. Manually added rate limiting and error boundary after AI review flagged
potential issues.
```

### Scenario 2: Bug Fix with Copilot Assistance

```markdown
**AI Assistance Used:** ☐ None / ☒ Minimal (<25%) / ☐ Moderate (25-75%) / ☐ Significant (>75%)

**AI-Generated Components:**
- `validateEmailFormat()` helper in src/lib/validation.ts (lines 45-52)

**AI Tools Used:**
- GitHub Copilot

**Human Review Applied:**
- [x] All AI-generated code reviewed line-by-line
- [x] Edge cases manually tested
- [x] Security implications considered
- [ ] Performance implications validated (N/A for simple validation)

**Notes:**
Copilot suggested regex pattern for email validation. Manually added test cases for
international email formats that AI didn't initially cover.
```

### Scenario 3: Manual Implementation (No AI)

```markdown
**AI Assistance Used:** ☒ None / ☐ Minimal (<25%) / ☐ Moderate (25-75%) / ☐ Significant (>75%)

**AI-Generated Components:**
- N/A

**AI Tools Used:**
- None

**Human Review Applied:**
- [ ] All AI-generated code reviewed line-by-line (N/A)
- [x] Edge cases manually tested
- [x] Security implications considered
- [x] Performance implications validated

**Notes:**
Implemented manually following existing patterns in codebase. Used only standard IDE
autocomplete for imports.
```

## Why This Matters

### For Code Reviewers

- **Adjust review rigor:** More scrutiny on high-AI-percentage code
- **Focus areas:** Security, edge cases, and performance in AI sections
- **Context awareness:** Understanding AI involvement helps with feedback quality

### For Contributors

- **Transparency:** Builds trust with team and stakeholders
- **Learning:** Sharing AI workflows helps team improve
- **Quality:** Encourages thorough human review of AI output

### For the Team

- **Metrics:** Track AI effectiveness and ROI over time
- **Patterns:** Identify what works (and doesn't) with AI tools
- **Compliance:** Demonstrate responsible AI usage practices
- **Continuous improvement:** Learn from successful AI workflows

## Related Documentation

- [PR Template](.github/pull_request_template.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [AI Contributing Guidelines](docs/llm/CONTRIBUTING_LLMS.md)
- [Project Constitution](docs/constitution.md)

## Questions?

If you're unsure how to categorize your AI usage:

1. **Err on the side of disclosure:** When in doubt, select higher AI percentage
2. **Be specific:** List files even if you're not 100% sure of the percentage
3. **Ask in PR:** Tag maintainers with `@mention` to clarify expectations
4. **Update disclosure:** You can update AI disclosure in PR comments if estimates change

---

**Last updated:** 2025-11-07
**Status:** Active - Required for all PRs
