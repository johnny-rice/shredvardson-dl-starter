# Constitution Checksum Timestamp Normalization

**Problem.** Constitution integrity checks were failing in CI with "Constitution checksum is stale" even though no actual content changed in binding source files.

**Root Cause.** The `docs/commands/index.json` file includes a `"generated"` timestamp field that changes every time the command index is regenerated. When the doctor script regenerates checksums during CI runs, it produces different hashes for this file purely due to timestamp differences, causing false positive integrity check failures.

**Rule.** **When tracking files with timestamp or metadata fields in integrity checksums, normalize by removing volatile fields before hashing to prevent false positives.**

**Example.**

Before (naive hashing):

```typescript
function hashFile(filePath: string): string | null {
  const content = readFileSync(filePath, 'utf8');
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}
```

After (timestamp normalization):

```typescript
function hashFile(filePath: string): string | null {
  let content = readFileSync(filePath, 'utf8');

  // Normalize timestamp-sensitive files before hashing
  if (filePath.includes('docs/commands/index.json')) {
    try {
      const json = JSON.parse(content);
      delete json.generated; // Remove timestamp field
      content = JSON.stringify(json, null, 2) + '\n';
    } catch {
      // If parsing fails, hash as-is
    }
  }

  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}
```

**Impact:**

- ✅ CI constitution integrity checks now pass consistently
- ✅ Command index can be regenerated without invalidating checksums
- ✅ Timestamp-based churn eliminated from constitution tracking
- ✅ Only actual content changes affect checksum validation

**Guardrails:**

- Identify all timestamp or volatile metadata fields in tracked files
- Normalize before hashing, not after
- Use try-catch for JSON parsing to handle malformed files gracefully
- Document which fields are normalized and why in code comments
- Test that checksums remain stable across regenerations
- Consider making normalization configurable per file type

**Related Files:**

- `scripts/update-constitution-checksum.ts` - Checksum generation with normalization
- `scripts/starter-doctor.ts` - Constitution integrity validation
- `docs/llm/CONSTITUTION.CHECKSUM` - Tracked file checksums
- `docs/commands/index.json` - Command index with timestamp

**Tags.** #constitution #checksum #timestamp #normalization #json #ci #doctor #data-integrity

**Severity.** high (was blocking all CI runs on legitimate changes)

**UsedBy.** 0

**Context.** Issue #302 - Batch delegation workflow implementation. During CI runs, the doctor script was consistently failing constitution integrity checks even though the only changes were to delegation workflow scripts. Investigation revealed that `docs/commands/index.json` regeneration was changing the `generated` timestamp field, causing false positive checksum mismatches.
