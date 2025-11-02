---
name: code
description: Coding standards via implementation-assistant Skill
version: 2.0.0
skill: implementation-assistant
---

**Slash Command:** `/code`

**Goal:**
Invoke the implementation-assistant Skill for coding standards and patterns.

**Usage:**

```bash
/code standards [category]       # Show coding standards
/code patterns <category>        # Show implementation patterns
/code validate <file_path>       # Validate code against standards
/code implement <feature_type>   # Get implementation guide
```

**Prompt:**

This is a lightweight discovery command that delegates to the `implementation-assistant` Skill.

**Phase 0: Security Pre-Check** 🛡️

Before implementation, delegate security analysis to the Security Scanner:

```typescript
// Delegate to Security Scanner for pre-implementation checks
import { orchestrate } from '.claude/skills/agent-orchestrator/scripts/orchestrate.ts';

const securityResult = await orchestrate({
  agents: [{
    type: 'security',
    prompt: `Analyze security implications before implementing:
    1. Review proposed changes for security risks
    2. Check authentication/authorization requirements
    3. Identify data validation needs
    4. Flag sensitive operations (payments, auth, PII)
    5. Suggest security best practices for this implementation

    Context:
    - Feature type: ${featureType}
    - Files to modify: ${filePaths}
    - Implementation scope: ${scope}

    Focus on: CRITICAL and HIGH severity issues only`,
    timeout: 60000 // 60s for security pre-check
  }]
});

// Extract security findings
const securityFindings = securityResult.agents[0].response;
```

**Act on security findings**:

- **CRITICAL issues**: Block implementation until resolved
- **HIGH severity**: Show warnings and recommendations
- **MEDIUM/LOW**: Document in implementation notes

**Actions:**

1. **standards**: Invokes Skill script `show-standards.ts` with optional category
2. **patterns**: Invokes Skill script `show-patterns.ts` with category (component, api, database, error)
3. **validate**: Invokes Skill script `validate-code.ts` with file path
4. **implement**: Invokes Skill script `implementation-guide.ts` with feature type

**Skill Location:** `.claude/skills/implementation-assistant/`

**Token Efficiency:**

- **Old `/dev:implement`**: 88 tokens per invocation
- **New `/code` Skill**: 20-200 tokens (progressive disclosure)
- **Savings**: 60% average, 77% for simple lookups

**Examples:**

```bash
# Show TypeScript standards
/code standards typescript

# Show React component pattern
/code patterns component

# Validate file against standards
/code validate src/components/UserProfile.tsx

# Get feature implementation guide
/code implement feature
```

**Categories:**

**Standards**: typescript, react, naming, imports, error, all
**Patterns**: component, api, database, error
**Feature Types**: feature, bugfix, refactor

**Implementation:**

The Skill system handles:

1. Loading metadata (skill.json)
2. Progressive disclosure (SKILL.md only if needed)
3. Script execution (never in context)
4. Structured output parsing

This command routes the request to the appropriate Skill script.

**Related:**

- Skill: `.claude/skills/implementation-assistant/`
- ADR: [002-skills-architecture.md](../../docs/adr/002-skills-architecture.md)
