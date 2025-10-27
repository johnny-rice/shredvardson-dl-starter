---
UsedBy: 0
Severity: normal
---

# JSON Pointer Syntax for Config File References

**Context.** Used invalid reference `riskPolicyRef: 'docs/llm/risk-policy.json#readOnly'` in `.claude/commands/ops/learn-search.md` metadata. CodeRabbit flagged this because `readOnly` field doesn't exist in the policy JSON. The correct syntax is JSON Pointer format.

**Rule.** **Use JSON Pointer syntax (`#/path/to/field`) for references within JSON files, not shorthand field names (`#fieldName`).**

**Example.**

```yaml
# ❌ BAD: Invalid shorthand reference
riskPolicyRef: 'docs/llm/risk-policy.json#readOnly'
# → Field doesn't exist, reference is unverifiable

# ✅ GOOD: JSON Pointer syntax
riskPolicyRef: 'docs/llm/risk-policy.json#/riskFramework/riskLevels/LOW'
# → Valid path: file → riskFramework → riskLevels → LOW
```

**JSON Pointer Rules:**
- Start with `#/` for root-level paths
- Use `/` as path separator (not `.`)
- Each segment is a property name
- Array indices use numbers: `/items/0`
- Escape `/` in keys as `~1`, `~` as `~0`

**Real-World Reference:**

```json
// docs/llm/risk-policy.json
{
  "riskFramework": {
    "riskLevels": {
      "LOW": {
        "description": "Minimal risk, standard automation applies",
        "approvalRequired": false
      }
    }
  }
}

// ✅ Valid pointer: #/riskFramework/riskLevels/LOW
```

**Guardrails:**

- Always verify the JSON structure before writing references
- Use jq to test pointer validity: `jq '.riskFramework.riskLevels.LOW' file.json`
- Add schema validation to CI for machine-readable YAML metadata
- Document expected pointer format in template files

**Tags.** json-pointer,config,metadata,validation,yaml,documentation,code-quality,rfc6901
