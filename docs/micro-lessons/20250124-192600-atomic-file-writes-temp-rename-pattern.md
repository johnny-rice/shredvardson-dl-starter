---
UsedBy: 0
Severity: normal
---

# Atomic File Writes: Use Temp + Rename to Prevent Partial Writes

**Context.** When updating critical files like component registries or configuration, a crash or interruption during `writeFileSync` can leave the file in a partially written state, corrupting data. This is especially problematic for JSON files that must be valid or scripts fail.

**Rule.** **For critical file updates, write to a temporary file first, then atomically rename it to the target. The rename operation is atomic at the filesystem level.**

**Example.**

```typescript
// ❌ Wrong: Direct write vulnerable to partial writes
function updateRegistry(registry: Registry) {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  // If process crashes here, registry may be partially written
}

// ✅ Correct: Atomic write via temp + rename
function updateRegistry(registry: Registry) {
  const tmp = registryPath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(registry, null, 2));
  fs.renameSync(tmp, registryPath); // Atomic operation
  // If process crashes before rename, original file is intact
  // If process crashes during rename, either old or new file exists (never partial)
}
```

**Why This Works:**

1. **Filesystem atomicity:** `rename()` is an atomic operation at the OS level
2. **All-or-nothing:** File is either fully old or fully new, never partial (during normal operation)
3. **Operational atomicity:** Other processes see either old or new file, never both
4. **Reader safety:** Other processes reading the file never see partial writes (if source was flushed)
5. **Pre-requisite:** Temp file must be flushed to disk (via fsync/writeFileSync) before rename for crash safety

**Rationale.**

- Direct `writeFileSync` writes data incrementally (not atomic)
- If interrupted (crash, SIGKILL, power loss), file contains partial data
- For JSON files, partial writes → invalid JSON → script crashes
- Temp + rename ensures readers always see valid, complete data

**Guardrails:**

- **Cleanup:** If temp file creation fails, ensure cleanup doesn't remove original
- **Permissions:** Ensure temp file has same permissions as target
- **Same filesystem:** Rename is only atomic within the same filesystem; temp file must be in same directory
- **Error handling:** Wrap in try/catch; if rename fails, temp file remains for inspection

**Pattern Variations:**

```typescript
// With error handling and cleanup
function atomicWriteJSON(path: string, data: any) {
  const tmp = path + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, path);
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tmp)) {
      fs.unlinkSync(tmp);
    }
    throw error;
  }
}

// With initialization for missing files
function updateOrCreateRegistry(data: any) {
  const registryPath = 'component-registry.json';

  // Initialize if missing
  let registry = { components: {}, aliases: {} };
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  }

  // Update
  Object.assign(registry, data);

  // Atomic write
  const tmp = registryPath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(registry, null, 2));
  fs.renameSync(tmp, registryPath);
}
```

**Related Patterns:**

- [safe-file-writing-patterns.md](./safe-file-writing-patterns.md) - Using `{flag: 'wx'}` to prevent overwrites
- Different focus: `wx` prevents accidental overwrites; temp+rename prevents partial writes

**Real-World Impact:**

- Applied to `updateComponentRegistry()` in generate-component.ts (PR #190)
- Prevents registry corruption if script is interrupted during component generation
- Critical for CI environments where processes can be killed abruptly

**When to Use:**

- ✅ Configuration files (JSON, YAML, TOML)
- ✅ Registry/index files updated frequently
- ✅ Database-like files (SQLite, etc.)
- ✅ Any file where corruption would break the system
- ❌ Large files (consider streaming with fsync instead)
- ❌ Append-only logs (different pattern)

**Tags.** #filesystem #atomic-writes #file-safety #error-handling #corruption-prevention #json #registry #phase-4 #coderabbit
