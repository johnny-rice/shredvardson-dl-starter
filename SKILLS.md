# Skills Architecture

**Version:** 3.0.0 | **Token Savings:** 65% average (77% for pure automation)

Progressive disclosure architecture that reduces LLM token usage by 60-80% while maintaining zero context pollution. Skills delegate computation to bash scripts, invoking the LLM only when semantic understanding is needed.

## Core Concepts

- **Progressive Disclosure**: Three-tier context loading (metadata → overview → full docs)
- **Script Execution**: Bash scripts execute logic with zero token cost
- **Conditional LLM**: Only invoke LLM when truly needed
- **Structured Output**: JSON responses enable parent/child skill routing

## Available Skills

| Command   | Purpose                          | Token Savings |
| --------- | -------------------------------- | ------------- |
| `/git`    | Unified git workflow automation  | 65% avg       |
| `/review` | Automated code quality checks    | 73% avg       |
| `/docs`   | Documentation synchronization    | 67% avg       |
| `/spec`   | PRD/spec analysis and validation | 71% avg       |
| `/test`   | TDD workflow automation          | 66% avg       |
| `/db`     | Database migration workflow      | 79% avg       |

## Quick Start

```bash
# Create feature branch
/git branch Issue #123: Add feature

# Run code review
/review --fix

# Sync documentation
/docs sync --dry-run

# Validate spec
/spec validate specs/my-spec.md

# View usage analytics (Phase 4A)
/skills stats
```

## Architecture Phases

- **Phase 1**: Foundation (metadata, discovery, structure) ✅
- **Phase 2**: Core workflows (git, review, docs, spec, test, db) ✅
- **Phase 3**: Git consolidation with intelligent routing ✅
- **Phase 4A**: Skills observability and analytics ✅
- **Phase 4B-D**: Learning capture, high-confidence Skills (planned)

## Documentation

**📚 Full Documentation**: [docs/skills-architecture.md](docs/skills-architecture.md)

**ADR**: [ADR-002](docs/adr/002-skills-architecture.md) | **Last Updated**: 2025-10-21
