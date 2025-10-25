/**
 * Component Playground Page
 *
 * Interactive playground for individual components
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getComponent } from '@/design-system/registry';
import ComponentPlayground from '../../ComponentPlayground';

interface ComponentPageProps {
  params: Promise<{
    component: string;
  }>;
}

export default async function ComponentPage({ params }: ComponentPageProps) {
  const { component: componentName } = await params;
  const component = getComponent(componentName);

  if (!component) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/design" className="hover:text-primary transition-colors">
            Design System
          </Link>
          <span>/</span>
          <span className="capitalize">{component.category}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{component.displayName}</h1>
        <p className="text-lg text-muted-foreground mb-4">{component.description}</p>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="w-4 h-4"
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
          {process.env.NODE_ENV === 'development' && (
            <a
              href={`vscode://file${process.cwd()}/${component.filePath}`}
              className="text-xs text-primary hover:underline"
            >
              Open in VSCode (Dev) →
            </a>
          )}
        </div>
      </div>

      {/* Interactive Playground */}
      <ComponentPlayground component={component} />

      {/* Props Documentation */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Props</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Default
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {component.props.map((prop) => (
                <tr key={prop.name} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <code className="text-sm font-mono text-primary">{prop.name}</code>
                    {prop.required && (
                      <span className="ml-2 text-xs text-destructive">required</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-muted-foreground">{prop.type}</code>
                  </td>
                  <td className="px-4 py-3">
                    {prop.defaultValue ? (
                      <code className="text-xs font-mono">{prop.defaultValue}</code>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {prop.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Examples */}
      {component.examples && component.examples.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Examples</h2>
          <div className="space-y-6">
            {component.examples.map((example) => (
              <div key={example.name} className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">{example.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{example.description}</p>
                <div className="bg-muted p-4 rounded-md">
                  <code className="text-sm font-mono">{example.code}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate static params for all components
 */
export async function generateStaticParams() {
  const { getAllComponents } = await import('@/design-system/registry');
  const components = getAllComponents();

  return components.map((component) => ({
    component: component.name,
  }));
}
