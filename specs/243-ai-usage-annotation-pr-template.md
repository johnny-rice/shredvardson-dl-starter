---
id: SPEC-243
title: Add AI usage annotation to PR template
type: spec
priority: p1
status: draft
lane: simple
issue: 243
created: 2025-11-07
---

# Add AI usage annotation to PR template

## Summary

Add explicit AI usage disclosure field to the PR template to provide transparency about AI-generated code, enabling reviewers to apply appropriate scrutiny and track AI effectiveness across the team.

## Problem Statement

The current PR template lacks transparency about AI-generated code, making it difficult for reviewers to:
- Know which code requires extra scrutiny
- Understand the extent of AI assistance used
- Apply appropriate review rigor based on AI involvement
- Track AI usage patterns across the team

While we have an "AI Review Status" section, it's advisory only and doesn't capture:
- Percentage of AI-generated code
- Which specific components used AI assistance
- What constitutes "AI assistance" (unclear definition)

**Impact:** P1 (High) - Critical for AI-assisted development transparency and responsible AI usage practices.

## Proposed Solution

Add a new "AI Assistance Disclosure" section to `.github/pull_request_template.md` with structured fields for:
1. **AI contribution percentage** (None/Minimal/Moderate/Significant)
2. **AI-generated components** (specific files/functions)
3. **AI tools used** (Claude Code, Copilot, etc.)
4. **Human review checklist** (line-by-line review, testing, security validation)
5. **Optional notes** (workflow lessons, prompt strategies)

**Two proposed formats:**

### Full Version (Recommended):
```markdown
## AI Assistance Disclosure

**AI Assistance Used:** ☐ None / ☐ Minimal (<25%) / ☐ Moderate (25-75%) / ☐ Significant (>75%)

**AI-Generated Components:** _(List specific files/functions that were primarily AI-generated)_
-

**AI Tools Used:** _(e.g., Claude Code, GitHub Copilot, Cursor, etc.)_
-

**Human Review Applied:**
- [ ] All AI-generated code reviewed line-by-line
- [ ] Edge cases manually tested
- [ ] Security implications considered
- [ ] Performance implications validated

**Notes:** _(Optional: Describe AI workflow, prompt strategies, or lessons learned)_
```

### Minimal Version:
```markdown
## AI Assistance

**Estimated AI contribution:** ____%

_List components with significant AI generation:_
-

_All AI-generated code has been reviewed and tested manually: ☐ Yes_
```

**Decision:** Full version recommended for comprehensive tracking and learning.

## Acceptance Criteria

- [ ] `.github/pull_request_template.md` updated with AI Assistance Disclosure section
- [ ] Section placed after "AI Review Status" section (logical grouping)
- [ ] Guidance document created: `docs/ai/AI_DISCLOSURE_GUIDE.md` defining:
  - What counts as "AI assistance" vs what doesn't
  - Estimation guidelines (None/Minimal/Moderate/Significant)
  - Examples of proper disclosure
- [ ] `CONTRIBUTING.md` updated to reference AI disclosure as required step
- [ ] Example PR created demonstrating proper disclosure
- [ ] Team notified of new requirement via GitHub discussion or Slack
- [ ] PR template passes markdown linting (pnpm lint)
- [ ] Documentation follows project markdown standards (code blocks with language identifiers)

## Technical Constraints

- Must integrate with existing PR template structure and checklist format
- Must align with existing AI disclosure footer pattern: "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
- Should not significantly increase PR creation time (keep concise)
- Must be compatible with PR autofill GitHub Action (`.github/workflows/pr-autofill.yml`)
- Should support future automation (e.g., metrics collection from AI disclosure data)

## Success Metrics

- 100% of PRs include AI disclosure section (measured via PR template compliance)
- Reviewers report increased confidence in review approach based on AI disclosure
- Zero incidents of AI-generated code being rubber-stamped without proper review
- Team shares AI workflow learnings through optional notes field
- Metrics available for tracking AI effectiveness over time

## Out of Scope

- Automated detection of AI-generated code (future tooling)
- AI usage analytics dashboard (separate feature)
- Integration with AI tool APIs for automatic disclosure (vendor-specific)
- Enforcement mechanisms beyond manual checklist (future automation)
- Comprehensive AI ethics guidelines (separate documentation)

## References

**Similar Implementations Found:**
- [.github/pull_request_template.md](.github/pull_request_template.md) - Current PR template with checkbox structure
- [.claude/agents/pr-template-agent.md](.claude/agents/pr-template-agent.md) - PR automation agent with structured JSON output
- [.claude/prompts/pr-template-agent.md](.claude/prompts/pr-template-agent.md) - PR template filling automation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines with quality standards
- [docs/llm/CONTRIBUTING_LLMS.md](docs/llm/CONTRIBUTING_LLMS.md) - AI-specific contributing guidelines
- [docs/constitution.md](docs/constitution.md) - Governance and architectural principles

**AI Disclosure Pattern (20+ files):**
- Footer format: "🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
- Used in prompts, agents, documentation, ADRs, and commit messages
- Part of git workflow command standards

**Architecture Patterns:**
- YAML frontmatter for structured metadata
- Checkbox-based checklists for verification
- Traceability linking (Issue → Spec → Plan → Task → PR)
- Progressive disclosure (minimal primary, detailed subdirectories)
- Machine-readable + human-readable dual documentation

**Related Issues:**
- Issue #250 (SECURE_PROMPTING.md) - Defines secure AI usage practices
- AI-Augmented SDLC research recommendations
- Part of responsible AI development transparency initiative

**External Standards:**
- AI-Augmented SDLC: PR Template Recommendations
- Anthropic Responsible AI Development Practices
- GPT-5 prompt review recommendations

## AI Disclosure Guidance (Draft)

**Counts as AI Assistance:**
- Code generated by AI tools (Claude, Copilot, etc.)
- Significant refactoring suggested by AI
- Architecture/design decisions guided by AI
- Test generation via AI tools

**Does NOT count:**
- Autocomplete/IntelliSense
- Simple code formatting
- Grammar/spell-check in comments
- Documentation typo fixes

**Estimation Guidelines:**
- **None (0%)**: Wrote everything manually
- **Minimal (<25%)**: AI helped with boilerplate or suggestions
- **Moderate (25-75%)**: AI generated structure, human refined
- **Significant (>75%)**: Primarily AI-generated, human reviewed
