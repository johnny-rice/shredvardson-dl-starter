/**
 * dnd-kit Component Examples
 *
 * Demonstrates dnd-kit drag and drop components available via /design import dnd-kit <ComponentName>
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/src/components/ui/card';
import Link from 'next/link';

export default function DndKitExamplesPage() {
  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/design"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Design System
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-2">dnd-kit Components</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Modern drag and drop toolkit for React - sortable lists, Kanban boards, and more
        </p>
        <div className="flex gap-4 text-sm">
          <a
            href="https://docs.dndkit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View dnd-kit Docs →
          </a>
          <Link
            href="/docs/design/EXTERNAL_LIBRARIES.md"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Integration Guide →
          </Link>
        </div>
      </div>

      {/* Import Instructions */}
      <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">How to Import dnd-kit Components</CardTitle>
          <CardDescription>
            Use the /design import command to add dnd-kit components to your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <code className="text-sm bg-white dark:bg-gray-900 px-3 py-1.5 rounded border">
                /design import dnd-kit SortableList
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Installs dependencies and creates component wrapper
              </p>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>
                <strong>Available components:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>SortableList - Vertical/horizontal reorderable lists</li>
                <li>KanbanBoard - Multi-column drag and drop board</li>
                <li>SortableGrid - Reorderable grid layout</li>
                <li>DraggableCard - Standalone draggable card component</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>Why dnd-kit is the modern choice for drag and drop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">🎯 Lightweight & Modular</h3>
              <p className="text-sm text-muted-foreground">
                Zero dependencies, ~10kb minified. Only load what you need.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">♿ Accessible by Design</h3>
              <p className="text-sm text-muted-foreground">
                Built-in keyboard support, screen reader friendly, ARIA attributes included.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">🚀 Performant</h3>
              <p className="text-sm text-muted-foreground">
                Minimal DOM mutations, optimized for smooth animations on all devices.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">📱 Touch Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Works seamlessly with mouse, touch, and keyboard inputs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <div className="space-y-8">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Sortable List Example</CardTitle>
            <CardDescription>
              Drag and drop to reorder items in a vertical or horizontal list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Not yet imported</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  /design import dnd-kit SortableList
                </code>
                <p className="text-xs text-muted-foreground mt-3">
                  Perfect for: Task lists, navigation menus, priority queues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Kanban Board Example</CardTitle>
            <CardDescription>Multi-column board with drag and drop between columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Not yet imported</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  /design import dnd-kit KanbanBoard
                </code>
                <p className="text-xs text-muted-foreground mt-3">
                  Perfect for: Project boards, workflow management, task organization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Sortable Grid Example</CardTitle>
            <CardDescription>Reorderable grid layout for images, cards, or tiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Not yet imported</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  /design import dnd-kit SortableGrid
                </code>
                <p className="text-xs text-muted-foreground mt-3">
                  Perfect for: Photo galleries, dashboard widgets, card layouts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Draggable Card Example</CardTitle>
            <CardDescription>
              Standalone draggable component for custom implementations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Not yet imported</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  /design import dnd-kit DraggableCard
                </code>
                <p className="text-xs text-muted-foreground mt-3">
                  Perfect for: Custom drag interactions, modals, floating elements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <Card className="mt-8 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Core Packages</h3>
            <p className="text-muted-foreground">
              dnd-kit is modular. Components use <code className="text-xs">@dnd-kit/core</code> for
              basic functionality and <code className="text-xs">@dnd-kit/sortable</code> for
              sortable presets.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Accessibility</h3>
            <p className="text-muted-foreground">
              All components include keyboard navigation (Space to pick up, Arrow keys to move, Esc
              to cancel). Screen reader announcements are built-in.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Design Token Integration</h3>
            <p className="text-muted-foreground">
              Components use our design system via Tailwind classes. Drag overlays, drop indicators,
              and animations respect light/dark mode automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
