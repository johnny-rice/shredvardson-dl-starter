---
UsedBy: 0
Severity: normal
---

# Handle Filenames with Spaces in AWK Field Processing
**Context.** CodeRabbit flagged path truncation issue where `awk '{print $4}'` drops filename parts after spaces, breaking allowlist checks.
**Rule.** **Use substr() and index() in AWK to capture complete filenames instead of relying on field splitting for space-containing paths.**
**Example.**
```bash
# ❌ Truncates paths with spaces (only prints first word after spaces)
awk '$1=="blob"{print $3 "\t" $4}'
# File "my document.pdf" becomes just "my"

# ✅ Captures complete path including spaces
awk '$1=="blob"{path=substr($0, index($0, $4)); print $3 "\t" path}'
# File "my document.pdf" preserved correctly
```
**Guardrails.**
- Test AWK scripts with filenames containing spaces
- Use `substr($0, index($0, $N))` to get "everything from field N onward"
- Add `LC_ALL=C` to sort for consistent byte-wise ordering
- Consider alternative: use `NUL` delimiters if supported

**Tags.** awk,shell,filenames,spaces,field-splitting,parsing,coderabbit