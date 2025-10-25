/**
 * Design System Viewer
 *
 * Interactive component gallery and documentation viewer
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/src/components/ui/card';
import Link from 'next/link';
import { getAllComponents, getCategories } from '@/design-system/registry';

export default function DesignSystemPage() {
  const components = getAllComponents();
  const categories = getCategories();

  // Calculate total variants across all components
  const totalVariants = components.reduce((total, component) => {
    return total + (component.variants ? Object.keys(component.variants).length : 0);
  }, 0);

  // Group components by category
  const componentsByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = components.filter((c) => c.category === category);
      return acc;
    },
    {} as Record<string, typeof components>
  );

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Design System</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Interactive component library and design token reference
        </p>

        {/* Quick Navigation */}
        <div className="flex gap-4">
          <Link
            href="/design/tokens"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            Browse Tokens
          </Link>
          <a
            href="https://github.com/Shredvardson/dl-starter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-accent transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View Source
          </a>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{components.length}</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{totalVariants}</div>
            <div className="text-sm text-muted-foreground">Total Variants</div>
          </CardContent>
        </Card>
      </div>

      {/* External Libraries */}
      <Card className="mb-12 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            External Component Libraries
          </CardTitle>
          <CardDescription>Tier 1 approved libraries for specialized use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/design/external/tremor" className="block">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <h3 className="font-semibold mb-1">Tremor</h3>
                <p className="text-xs text-muted-foreground mb-3">Charts & Data Visualization</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    LineChart
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    BarChart
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    AreaChart
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    +2 more
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-[10px] text-muted-foreground">/design import tremor</code>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400">
                    View examples →
                  </span>
                </div>
              </div>
            </Link>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 opacity-60">
              <h3 className="font-semibold mb-1">TanStack Table</h3>
              <p className="text-xs text-muted-foreground mb-3">Advanced Data Grids</p>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  basic-table
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  advanced-table
                </span>
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-500">
                Coming soon (#192)
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 opacity-60">
              <h3 className="font-semibold mb-1">dnd-kit</h3>
              <p className="text-xs text-muted-foreground mb-3">Drag & Drop</p>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  kanban-board
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  sortable-list
                </span>
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-500">
                Coming soon (#193)
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold mb-1">React Aria</h3>
              <p className="text-xs text-muted-foreground mb-3">Custom Components</p>
              <div className="text-xs mb-3">Headless hooks for accessible UI</div>
              <a
                href="https://react-spectrum.adobe.com/react-aria"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                View docs →
              </a>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Component Selection Priority:</strong> Check existing components → shadcn/ui →
              approved libraries → custom
            </p>
            <Link
              href="/docs/design/EXTERNAL_LIBRARIES.md"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              View complete external libraries guide →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Components by Category */}
      <div className="space-y-12">
        {categories.map((category) => {
          const categoryComponents = componentsByCategory[category];
          if (!categoryComponents || categoryComponents.length === 0) {
            return null;
          }

          return (
            <section key={category}>
              <h2 className="text-2xl font-bold mb-6 capitalize">
                {category.replaceAll('-', ' ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryComponents.map((component) => (
                  <Link
                    key={component.name}
                    href={`/design/components/${component.name}`}
                    className="group"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {component.displayName}
                        </CardTitle>
                        <CardDescription>{component.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <code className="text-xs">{component.filePath}</code>
                        </div>
                        {component.variants && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {Object.keys(component.variants).map((variant) => (
                              <span
                                key={variant}
                                className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                              >
                                {variant}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
