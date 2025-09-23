---
pattern: external-service-misconfiguration
category: operational
impact: medium
frequency: occasional
confidence: high
---

# External Service Misconfiguration

## Problem
External code quality services (CodeClimate, SonarQube, DeepSource, etc.) may run inappropriate checks for the project's technology stack, causing false positive failures.

## Example
```
❌ Docstring Coverage: 0.00% which is insufficient. Required threshold is 80.00%.
```
This error on a TypeScript/React project indicates Python docstring checks are misconfigured.

## Detection
- External service errors don't appear in GitHub Actions
- Checks reference technology not used in the project (e.g., Python checks on TypeScript)
- All repository CI passes but external service reports failures

## Solution
1. **Identify the Service**: Check repository integrations and webhooks
2. **Review Configuration**: Ensure language detection is correct
3. **Exclude Inappropriate Checks**: Disable checks not relevant to tech stack
4. **Update Project Metadata**: Ensure proper language classification

## Prevention
- Document external service configurations in CLAUDE.md
- Include service configuration review in Simple lane checklist
- Add language/framework metadata to repository

## When to Apply
- External service reports errors inconsistent with project technology
- CI passes but merge blocked by external checks
- Code quality tools report language-specific issues for wrong language