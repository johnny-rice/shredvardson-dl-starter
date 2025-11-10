---
UsedBy: 0
Severity: normal
---

# String Replace Pitfalls: Preserve Structure in Multi-Match Scenarios

**Context.** CodeRabbit caught a major bug where `/Users/alice/backup/Users/bob/file.txt` was sanitized to `~/backup~/file.txt`, dropping the path separator and making the structure ambiguous.

**Rule.** **When replacing multiple matches in a structured string (paths, URLs, etc.), use replacement functions that preserve delimiters based on match position.**

**The Problem:**
Simple regex replacement consumes delimiters on each match:

```typescript
// ❌ BAD: Drops separators between matches
'/Users/alice/backup/Users/bob/file.txt'
  .replace(/\/Users\/[^/]+/g, '~')
// Result: '~/backup~/file.txt' - separator lost!
```

**Why It Breaks:**

1. First match: `/Users/alice` → `~` (leading `/` consumed)
2. String becomes: `~/backup/Users/bob/file.txt`
3. Second match: `/Users/bob` → `~` (leading `/` consumed again)
4. Final result: `~/backup~/file.txt` (path structure corrupted)

**The Solution:**

```typescript
// ✅ GOOD: Preserves separators using replacement function
'/Users/alice/backup/Users/bob/file.txt'
  .replace(/\/Users\/[^/]+/g, (_match, offset) => {
    // If not at start, preserve the leading separator
    return offset > 0 ? '/~' : '~';
  })
// Result: '~/backup/~/file.txt' - structure preserved!
```

**Example.**

```typescript
// ❌ BAD: Windows paths also break
'C:\\Users\\alice\\backup\\Users\\bob\\file.txt'
  .replace(/C:\\Users\\[^\\]+/g, '~')
// Result: '~\\backup~\\file.txt'

// ✅ GOOD: Check position for all platforms
filePath
  .replace(/\/Users\/[^/]+/g, (_match, offset) =>
    offset > 0 ? '/~' : '~'
  )
  .replace(/C:\\Users\\[^\\]+/g, (_match, offset) =>
    offset > 0 ? '\\~' : '~'
  )
```

**When This Matters:**

- Path sanitization (home directories, temp paths)
- URL credential redaction
- Multi-level token replacement
- Any structured string with repeated patterns

**Guardrails:**

- Always test replacement logic with nested/repeated patterns
- Use replacement functions (not strings) for position-aware replacements
- Add explicit test cases for multi-match scenarios
- Consider what delimiters separate your matches and preserve them

**Detection:**
If your replacement creates ambiguous output (like `~/backup~/file.txt`), you're likely dropping structure. Ask: "Can I reconstruct the original structure from the sanitized version?"

**Tags.** regex,string-replacement,sanitization,path-handling,security,testing,issue-357,coderabbit
