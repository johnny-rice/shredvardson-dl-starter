---
UsedBy: 0
Severity: normal
---

# Avoid Hardcoded Paths in Scripts
**Context.** CodeRabbit flagged hardcoded paths like `'docs/ai/CLAUDE.md'` in scripts that will break if files move.
**Rule.** **Use dynamic path resolution or candidate lists instead of hardcoded file paths.**
**Example.**
```javascript
// ❌ Hardcoded - breaks if CLAUDE.md moves
const claudeContent = fs.readFileSync('docs/ai/CLAUDE.md', 'utf8');

// ✅ Prefer resolver, then explicit fallback with clear error
const candidates = ['docs/ai/CLAUDE.md', 'CLAUDE.md'];
const resolved = resolveDoc?.('CLAUDE.md'); // maps when available
const claudePath = resolved ?? candidates.find(p => fs.existsSync(p));
if (!claudePath) throw new Error('CLAUDE.md not found in known locations');
const claudeContent = fs.readFileSync(claudePath, 'utf8');
```
**Guardrails.**
- Use `resolveDoc()` utility for known documentation files
- Provide fallback candidate arrays for critical files
- Test scripts with files in different locations
- Mock fs.existsSync in unit tests to simulate moved files

**Tags.** scripts,paths,resilience,coderabbit