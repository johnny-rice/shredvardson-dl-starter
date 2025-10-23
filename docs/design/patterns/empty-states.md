# Empty State Patterns

## Overview

Empty states appear when there's no content to display. They guide users toward their first action, provide context, and prevent confusion. A well-designed empty state turns a potentially frustrating moment into an opportunity.

## Core Principles

1. **Explain Why Empty**: "No items yet" vs "No items found"
2. **Show Next Action**: Clear path forward
3. **Add Personality**: Friendly, not sterile
4. **Stay On Brand**: Consistent tone and visuals
5. **Mobile First**: Work on small screens

## When to Use

- First-time user experience (no data created yet)
- Search with no results
- Filtered views with no matches
- Deleted/archived all items
- Error states where data can't load

## Pattern Types

### 1. First-Use Empty State

**Scenario**: User hasn't created any content yet

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
  <div className="text-6xl">📝</div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-foreground">
      No projects yet
    </h3>
    <p className="text-muted-foreground max-w-sm">
      Get started by creating your first project. You can add team members and tasks later.
    </p>
  </div>
  <Button size="lg">
    Create Project
  </Button>
</div>
```

### 2. Search No Results

**Scenario**: Search query returns no matches

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
  <div className="text-5xl">🔍</div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-foreground">
      No results for "{searchQuery}"
    </h3>
    <p className="text-muted-foreground max-w-sm">
      Try adjusting your search or filter to find what you're looking for.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" onClick={() => setSearchQuery("")}>
      Clear Search
    </Button>
    <Button onClick={handleCreateNew}>
      Create New
    </Button>
  </div>
</div>
```

### 3. Filter No Matches

**Scenario**: Applied filters exclude all items

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
  <div className="text-5xl">🎯</div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-foreground">
      No items match your filters
    </h3>
    <p className="text-muted-foreground max-w-sm">
      Try removing some filters to see more results.
    </p>
    <p className="text-sm text-muted-foreground">
      Active filters: {activeFilters.map(f => f.label).join(", ")}
    </p>
  </div>
  <Button variant="outline" onClick={clearFilters}>
    Clear All Filters
  </Button>
</div>
```

### 4. All Deleted

**Scenario**: User deleted or archived all items

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
  <div className="text-5xl">🗑️</div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-foreground">
      All items archived
    </h3>
    <p className="text-muted-foreground max-w-sm">
      You've archived all your items. Create new ones or restore from archive.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" onClick={() => navigate("/archive")}>
      View Archive
    </Button>
    <Button onClick={handleCreateNew}>
      Create New
    </Button>
  </div>
</div>
```

### 5. Permission Restricted

**Scenario**: User lacks permission to view content

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
  <div className="text-5xl">🔒</div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-foreground">
      Access restricted
    </h3>
    <p className="text-muted-foreground max-w-sm">
      You don't have permission to view this content. Contact your team admin for access.
    </p>
  </div>
  <Button variant="outline" asChild>
    <Link href="/settings/team">
      Manage Permissions
    </Link>
  </Button>
</div>
```

## Empty State Components

### Basic Empty State

```tsx
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="text-6xl">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex gap-2">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

### Usage

```tsx
<EmptyState
  icon="📝"
  title="No projects yet"
  description="Get started by creating your first project"
  action={{
    label: "Create Project",
    onClick: handleCreate
  }}
  secondaryAction={{
    label: "Import Projects",
    onClick: handleImport
  }}
/>
```

## Icon Guidelines

### Emoji Selection

**Good choices**:
- 📝 Documents, notes, content creation
- 🔍 Search results
- 📊 Charts, analytics, data
- 👥 Users, team members
- 🎯 Goals, targets, filters
- 📧 Messages, notifications
- 🗂️ Files, folders, organization
- ✅ Tasks, todos, completed items
- 🗑️ Deleted/archived items
- 🔒 Permissions, security

**Avoid**:
- Complex multi-emoji combinations
- Obscure emojis with unclear meaning
- Platform-specific emojis (look different across devices)

### SVG Icons

For brand consistency, use SVG icons instead of emojis:

```tsx
import { FileText } from 'lucide-react';

<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
  <FileText className="w-8 h-8 text-primary" />
</div>
```

## Copy Guidelines

### Title

**Structure**: `[State] + [Entity]`

✅ Good:
- "No projects yet"
- "No results found"
- "All tasks complete"

❌ Bad:
- "Empty" (too vague)
- "There are no items in this list" (too wordy)
- "404 Not Found" (for content, not pages)

### Description

**Structure**: `[Explanation] + [Action]`

✅ Good:
- "Get started by creating your first project. You can add team members later."
- "Try adjusting your search or filter to find what you're looking for."

❌ Bad:
- "No data" (not helpful)
- "The system has not found any matching records in the database" (too technical)

### Action Label

Be specific about what happens:

✅ "Create Project" (not "Get Started")
✅ "Import CSV" (not "Import")
✅ "Clear Filters" (not "Reset")

## Responsive Design

### Mobile Considerations

```tsx
<div className="flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-4">
  <div className="text-4xl md:text-6xl">{icon}</div>
  <div className="space-y-2">
    <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
    <p className="text-sm md:text-base text-muted-foreground max-w-sm">{description}</p>
  </div>
  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <Button className="w-full sm:w-auto">{primaryAction}</Button>
    <Button variant="outline" className="w-full sm:w-auto">{secondaryAction}</Button>
  </div>
</div>
```

## Accessibility

### WCAG AA Requirements

- ✅ **Contrast**: Text meets 4.5:1 ratio
- ✅ **Focus**: Buttons have visible focus states
- ✅ **Labels**: Buttons have descriptive text
- ✅ **Hierarchy**: Use semantic headings (`<h3>`)
- ✅ **Alternative text**: Icons have `aria-label` if needed

### Screen Readers

```tsx
<div
  role="status"
  aria-live="polite"
  className="flex flex-col items-center justify-center p-12"
>
  <div aria-hidden="true" className="text-6xl">📝</div>
  <h3 className="text-xl font-semibold">No projects yet</h3>
  <p className="text-muted-foreground">
    Get started by creating your first project
  </p>
  <Button onClick={handleCreate}>
    Create Project
  </Button>
</div>
```

## Loading vs Empty States

**Don't confuse loading with empty states:**

```tsx
{isLoading ? (
  <LoadingSpinner />
) : items.length === 0 ? (
  <EmptyState {...props} />
) : (
  <ItemList items={items} />
)}
```

## Error vs Empty States

**Use error state when data fails to load:**

```tsx
{error ? (
  <ErrorState
    title="Failed to load projects"
    description="Please try again or contact support"
    action={{ label: "Retry", onClick: handleRetry }}
  />
) : items.length === 0 ? (
  <EmptyState {...props} />
) : (
  <ItemList items={items} />
)}
```

## Examples by Context

### Dashboard Widget

```tsx
<Card className="p-6">
  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
  {activity.length === 0 ? (
    <div className="text-center py-8 space-y-2">
      <p className="text-sm text-muted-foreground">
        No recent activity
      </p>
      <Button variant="link" size="sm">
        View All Activity
      </Button>
    </div>
  ) : (
    <ActivityList items={activity} />
  )}
</Card>
```

### Table

```tsx
<table>
  <thead>{/* headers */}</thead>
  <tbody>
    {data.length === 0 ? (
      <tr>
        <td colSpan={columns.length} className="p-12">
          <EmptyState
            icon="📋"
            title="No data available"
            description="Data will appear here once added"
          />
        </td>
      </tr>
    ) : (
      data.map(row => <tr key={row.id}>{/* cells */}</tr>)
    )}
  </tbody>
</table>
```

## Related Patterns

- [Loading States](./loading-states.md) - Show while fetching data
- [Error Handling](./error-handling.md) - When data fails to load
- [Cards](./cards.md) - Empty state in card containers
- [Typography](./typography.md) - Text styling for empty states
