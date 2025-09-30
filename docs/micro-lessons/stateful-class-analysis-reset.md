# Reset Stateful Class Analysis to Prevent Double-Counting

**Pattern:** Analysis classes with persistent state that accumulate data across multiple runs, causing incorrect results.

**Context:** Classes used for data analysis or aggregation that maintain instance state between method calls.

## Problem

```typescript
class DataAnalyzer {
  private results: Map<string, number> = new Map();

  analyze(data: string[]): Analysis {
    // BUG: results persist across calls
    for (const item of data) {
      this.results.set(item, (this.results.get(item) || 0) + 1);
    }
    return { results: Array.from(this.results.entries()) };
  }
}

// Second call includes data from first call
const analyzer = new DataAnalyzer();
analyzer.analyze(['a', 'b']); // Results: a:1, b:1
analyzer.analyze(['b', 'c']); // Results: a:1, b:2, c:1 (WRONG!)
```

## Solution

```typescript
class DataAnalyzer {
  private results: Map<string, number> = new Map();

  analyze(data: string[]): Analysis {
    // Reset state at start of each analysis
    this.results.clear();

    for (const item of data) {
      this.results.set(item, (this.results.get(item) || 0) + 1);
    }
    return { results: Array.from(this.results.entries()) };
  }
}
```

## Benefits

- **Correct results**: Each analysis starts with clean state
- **Predictable behavior**: Multiple calls don't interfere with each other
- **Reusable instances**: Same instance can be used multiple times safely

## When to Apply

- Analysis classes that accumulate data
- Aggregation utilities with persistent state
- Any class method that should produce independent results per call

**Estimated reading time:** 70 seconds
