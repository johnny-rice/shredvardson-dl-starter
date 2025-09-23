# Recursive File Search in Node.js

**Pattern:** File search utilities that only check top-level directories, missing nested or date-partitioned files.

**Context:** Reports, logs, or artifacts may be organized in subdirectories for better organization.

## Problem
```typescript
// Shallow search - misses nested files
const files = fs.readdirSync(artifactsDir);
for (const file of files) {
  if (file.includes('doctor-report')) {
    reportFiles.push(path.join(artifactsDir, file));
  }
}
```

## Solution
```typescript
// Recursive search with directory walking
const walkDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      walkDirectory(fullPath); // Recurse into subdirs
    } else if (entry.isFile() && /pattern.*\.ext$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
};
```

## Benefits
- **Complete coverage**: Finds files regardless of directory structure
- **Future-proof**: Handles organizational changes like date partitioning
- **Flexible**: Works with complex nested hierarchies

## When to Apply
- File discovery utilities and analyzers
- Log processing and report aggregation
- Asset or artifact collection scripts

**Estimated reading time:** 50 seconds