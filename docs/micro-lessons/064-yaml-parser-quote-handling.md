---
UsedBy: 0
Severity: high
# Prevents data corruption when parsing YAML frontmatter with single-quoted values
---

# YAML Parser Must Handle Both Single and Double Quotes

**Context.** CodeRabbit flagged critical metadata corruption in `docs/commands/index.json` where `riskLevel: 'LOW'` was being stored as `"'LOW'"` (quotes embedded in the string value). The YAML parser in `scripts/generate-command-index.js` only handled double-quoted strings, not single-quoted strings.

**Rule.** **When parsing YAML values, strip both single quotes (`'`) and double quotes (`"`) from string values to ensure consistent data structure.**

**Example.**

```javascript
// ❌ Before: Only handles double quotes
if (value.startsWith('"') && value.endsWith('"')) {
  value = value.slice(1, -1);
}

// ✅ After: Handles both quote types
if (value.startsWith('"') && value.endsWith('"')) {
  // Double-quoted string
  value = value.slice(1, -1);
} else if (value.startsWith("'") && value.endsWith("'")) {
  // Single-quoted string
  value = value.slice(1, -1);
}
```

**Impact:**
- **Before:** `riskLevel: 'LOW'` → JSON output: `"riskLevel": "'LOW'"` (corrupt)
- **After:** `riskLevel: 'LOW'` → JSON output: `"riskLevel": "LOW"` (correct)

**Guardrails.**
- Always test YAML parsers with both `'value'` and `"value"` formats
- Validate generated JSON output matches expected schema (no embedded quotes)
- Add integration tests that parse YAML with mixed quote styles
- Consider using a proper YAML library (like `js-yaml`) for complex parsing instead of custom regex

**Tags.** yaml,parsing,metadata,data-integrity,code-quality
