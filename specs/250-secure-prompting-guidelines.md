---
id: SPEC-250
title: Create SECURE_PROMPTING.md guidelines
type: spec
priority: p1
status: draft
lane: simple
issue: 250
created: 2025-11-07
---

# Create SECURE_PROMPTING.md guidelines

## Summary

Create comprehensive documentation on safe AI tool usage, secure prompting practices, and guidelines for AI-assisted development to address gaps in the AI-Augmented SDLC process.

## Problem Statement

The team lacks centralized documentation on secure AI tool usage, creating risks of:
- Accidental exposure of secrets, PII, or sensitive data in AI prompts
- Insufficient review of AI-generated code leading to security vulnerabilities
- Inconsistent testing standards for AI-generated code
- Lack of awareness about prompt injection risks and secure prompt engineering

Currently, security practices are distributed across multiple documents (SECURITY.md, workflow-security.md, constitution.md) but no single guide addresses AI-specific security concerns comprehensively.

## Proposed Solution

Create `docs/SECURE_PROMPTING.md` as the canonical guide for secure AI tool usage, consolidating existing security patterns and adding AI-specific guidance.

**Structure:**
1. **Security Risks of AI Coding Assistants** - Document common vulnerabilities (OWASP LLM07:2025)
2. **What NOT to Include in Prompts** - Clear rules for secrets, PII, credentials
3. **Data Protection Techniques** - Masking, tokenization, sanitization before LLM input
4. **Code Review Requirements** - Standards for AI-generated code review
5. **Testing Standards** - Test coverage and validation requirements
6. **Prompt Engineering Best Practices** - Safe prompt patterns and techniques
7. **External Guardrails** - Validation systems outside of LLM (not relying on system prompts)
8. **Monitoring and Auditing** - Real-time monitoring, audit logs, compliance tracking
9. **Examples** - Side-by-side secure vs insecure prompt examples
10. **Incident Response** - Procedures if secrets are accidentally shared with AI

**Leverage Existing Patterns:**
- Reference existing security documentation (SECURITY.md, workflow-security.md)
- Apply multi-layer validation patterns from ADR-009
- Incorporate severity classification framework (CRITICAL/HIGH/MEDIUM/LOW)
- Use micro-lesson format for specific security patterns
- Link to OWASP standards and CWE classifications

## Acceptance Criteria

- [ ] `docs/SECURE_PROMPTING.md` created with all 10 sections
- [ ] Security risks section covers: prompt injection, data leakage, insufficient validation, over-reliance on AI (OWASP LLM07:2025 compliance)
- [ ] Forbidden content clearly lists: API keys, passwords, PII, credentials, internal IPs, proprietary algorithms
- [ ] Data protection section documents: PII sanitization, data masking, tokenization techniques
- [ ] Code review requirements specify: line-by-line review, security-focused testing, edge case validation
- [ ] Testing standards mandate: 80% coverage minimum, security test requirements, RLS validation for database code
- [ ] Prompt engineering section includes: safe prompt patterns, context minimization, output validation
- [ ] External guardrails section explains: validation systems independent of LLM, not relying on system prompts for security
- [ ] Monitoring section covers: real-time monitoring, audit logs for prompt interactions, compliance tracking
- [ ] Examples section provides 5+ side-by-side comparisons (insecure → secure)
- [ ] Incident response section documents: immediate actions, rotation procedures, disclosure requirements
- [ ] Document references existing security docs (SECURITY.md, workflow-security.md, ADR-009)
- [ ] Document follows project markdown standards (code blocks with language identifiers)
- [ ] Added to CONTRIBUTING.md as required reading for AI-assisted development
- [ ] Passes markdown linting (pnpm lint)
- [ ] Document includes 2025 statistics (8.5% of prompts contain sensitive data per research)

## Technical Constraints

- Must align with existing security architecture (ADR-009 multi-layer validation pattern)
- Must reference OWASP standards and CWE classifications where applicable
- Must integrate with existing quality pipeline and pre-commit hooks
- Should be concise enough for quick reference (<2000 words recommended)
- Must use project's documentation structure and formatting conventions

## Success Metrics

- All team members acknowledge reading the guide
- Zero incidents of secrets being shared in AI prompts post-implementation
- AI-generated code meets same quality/security standards as human code
- Code review time for AI-generated code is appropriate (not rubber-stamped)

## Out of Scope

- Automated enforcement of secure prompting rules (future tooling)
- AI tool vendor security assessments (e.g., Claude, Copilot data retention policies)
- Fine-tuning or customization of AI models for security
- Integration with DLP (Data Loss Prevention) tools
- Comprehensive AI ethics guidelines (separate concern)

## References

**Similar Implementations Found:**
- [SECURITY.md](SECURITY.md) - Primary security policy with vulnerability reporting and severity levels
- [docs/workflow-security.md](docs/workflow-security.md) - GitHub Actions security guidelines
- [docs/adr/009-git-context-security-architecture.md](docs/adr/009-git-context-security-architecture.md) - Multi-layer security boundary pattern
- [.claude/prompts/security-scanner.md](.claude/prompts/security-scanner.md) - AI security scanner with severity guidelines
- [docs/constitution.md](docs/constitution.md) - Security-first principles and development standards
- [docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md](docs/llm/TOKEN_OPTIMIZATION_GUIDELINES.md) - Token efficiency patterns
- [docs/micro-lessons/shell-injection-prevention-execfilesync.md](docs/micro-lessons/shell-injection-prevention-execfilesync.md) - Shell injection prevention
- [docs/micro-lessons/log-sanitization-pr-security.md](docs/micro-lessons/log-sanitization-pr-security.md) - Log sanitization patterns
- [docs/micro-lessons/postgres-function-security-patterns.md](docs/micro-lessons/postgres-function-security-patterns.md) - PostgreSQL security patterns

**Architecture Patterns:**
- Multi-layer input validation (Zod schemas → spawn with shell:false → sanitized errors)
- Severity classification framework (CRITICAL/HIGH/MEDIUM/LOW)
- Security-first architecture (secrets management, input validation, secure defaults)
- Progressive disclosure pattern (metadata → detailed docs → scripts on-demand)

**External Standards:**
- OWASP LLM07:2025 System Prompt Leakage - https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/
- OWASP Top 10 - https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheets - https://cheatsheetseries.owasp.org/cheatsheets/
- OWASP Secrets Management - https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- CWE-89 SQL Injection - https://cwe.mitre.org/data/definitions/89.html
- CWE-79 Cross-Site Scripting - https://cwe.mitre.org/data/definitions/79.html
- CISA AI Data Security Best Practices (May 2025) - https://media.defense.gov/2025/May/22/2003720601/-1/-1/0/CSI_AI_DATA_SECURITY.PDF
- Anthropic Claude Skills Documentation - https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview
- Research: 8.5% of employee prompts include sensitive data (46% customer info, 27% employee PII, 15% legal/financial)

**Related Issues:**
- Part of AI-Augmented SDLC gaps analysis
- Complements Issue #248 (secret scanning pre-commit hook)
- Supports security-first principles from constitution.md