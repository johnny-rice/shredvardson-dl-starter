'use client';

import * as React from 'react';
import { Button } from '@ui/src/components/ui/button';
import { Input } from '@ui/src/components/ui/input';
import { Label } from '@ui/src/components/ui/label';
import { Card } from '@ui/src/components/ui/card';
import { Link } from '@/components/Link';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/src/components/ui/dialog';

/**
 * Design System Component Viewer
 *
 * A comprehensive visual reference for all design system components.
 * Shows all variants side-by-side with light/dark theme support.
 *
 * Features:
 * - All components with all variants
 * - Light/dark theme toggle
 * - Copy code button for each example
 * - Links to pattern documentation
 * - Responsive preview
 * - Lives in actual app (real styling, no Storybook overhead)
 *
 * @see docs/design/patterns/ for pattern documentation
 */
export default function DesignSystemViewer() {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Design System</h1>
          <p className="text-xl text-muted-foreground">
            Component library with all variants and patterns
          </p>
        </header>

        {/* Buttons Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Buttons</h2>
            <p className="text-muted-foreground">
              Primary actions, secondary options, and destructive operations
            </p>
            <Link
              href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/patterns/buttons.md"
              variant="ghost"
              className="text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pattern Documentation →
            </Link>
          </div>

          <div className="space-y-8">
            {/* Button Variants */}
            <ComponentExample
              title="Button Variants"
              code={`<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </ComponentExample>

            {/* Button Sizes */}
            <ComponentExample
              title="Button Sizes"
              code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Search" title="Search">🔍</Button>
              </div>
            </ComponentExample>

            {/* Button States */}
            <ComponentExample
              title="Button States"
              code={`<Button>Default</Button>
<Button disabled>Disabled</Button>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
              </div>
            </ComponentExample>
          </div>
        </section>

        {/* Forms Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Form Controls</h2>
            <p className="text-muted-foreground">
              Inputs, labels, and form validation patterns
            </p>
            <Link
              href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/patterns/forms.md"
              variant="ghost"
              className="text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pattern Documentation →
            </Link>
          </div>

          <div className="space-y-8">
            {/* Input Examples */}
            <ComponentExample
              title="Text Input"
              code={`<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="max-w-sm space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
            </ComponentExample>

            {/* Disabled Input */}
            <ComponentExample
              title="Disabled Input"
              code={`<div className="space-y-2">
  <Label htmlFor="disabled">Disabled</Label>
  <Input id="disabled" disabled placeholder="Cannot edit" />
</div>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="max-w-sm space-y-2">
                <Label htmlFor="disabled">Disabled</Label>
                <Input id="disabled" disabled placeholder="Cannot edit" />
              </div>
            </ComponentExample>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Cards</h2>
            <p className="text-muted-foreground">
              Content containers with headers, bodies, and footers
            </p>
            <Link
              href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/patterns/cards.md"
              variant="ghost"
              className="text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pattern Documentation →
            </Link>
          </div>

          <div className="space-y-8">
            <ComponentExample
              title="Basic Card"
              code={`<Card className="p-6 space-y-4">
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-muted-foreground">
    Card content goes here with proper spacing and typography.
  </p>
  <Button>Action</Button>
</Card>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Card Title</h3>
                  <p className="text-muted-foreground">
                    Card content goes here with proper spacing and typography.
                  </p>
                  <Button>Action</Button>
                </Card>
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Another Card</h3>
                  <p className="text-muted-foreground">
                    Cards maintain consistent spacing and visual hierarchy.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Primary</Button>
                    <Button size="sm" variant="outline">Secondary</Button>
                  </div>
                </Card>
              </div>
            </ComponentExample>
          </div>
        </section>

        {/* Links Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Links</h2>
            <p className="text-muted-foreground">
              Navigation elements with proper semantics
            </p>
            <Link
              href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/patterns/buttons.md"
              variant="ghost"
              className="text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pattern Documentation →
            </Link>
          </div>

          <div className="space-y-8">
            <ComponentExample
              title="Link Variants"
              code={`<Link href="/docs">Default Link</Link>
<Link href="/docs" variant="ghost">Ghost Link</Link>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="flex flex-wrap gap-4">
                <Link href="/docs">Default Link</Link>
                <Link href="/docs" variant="ghost">Ghost Link</Link>
              </div>
            </ComponentExample>
          </div>
        </section>

        {/* Dialogs Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Dialogs</h2>
            <p className="text-muted-foreground">
              Modal overlays for focused interactions
            </p>
            <Link
              href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/patterns/accessibility.md"
              variant="ghost"
              className="text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pattern Documentation →
            </Link>
          </div>

          <div className="space-y-8">
            <ComponentExample
              title="Dialog Example"
              code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog content goes here.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      This is an example dialog with proper focus management and accessibility.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Confirm</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </ComponentExample>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Typography</h2>
            <p className="text-muted-foreground">
              Text styles and semantic hierarchy
            </p>
            <Link
              href="https://github.com/Shredvardson/dl-starter/blob/main/docs/design/patterns/typography.md"
              variant="ghost"
              className="text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pattern Documentation →
            </Link>
          </div>

          <div className="space-y-8">
            <ComponentExample
              title="Headings"
              code={`<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<h3 className="text-2xl font-semibold">Heading 3</h3>
<h4 className="text-xl font-semibold">Heading 4</h4>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
                <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
                <h3 className="text-2xl font-semibold text-foreground">Heading 3</h3>
                <h4 className="text-xl font-semibold text-foreground">Heading 4</h4>
              </div>
            </ComponentExample>

            <ComponentExample
              title="Body Text"
              code={`<p className="text-foreground">Default body text</p>
<p className="text-muted-foreground">Muted secondary text</p>
<p className="text-sm text-muted-foreground">Small helper text</p>`}
              onCopy={copyCode}
              copied={copiedCode}
            >
              <div className="space-y-2">
                <p className="text-foreground">Default body text with standard styling</p>
                <p className="text-muted-foreground">Muted secondary text for less emphasis</p>
                <p className="text-sm text-muted-foreground">Small helper text for hints and captions</p>
              </div>
            </ComponentExample>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * Component Example Wrapper
 *
 * Displays a component example with code and copy functionality
 */
interface ComponentExampleProps {
  title: string;
  code: string;
  children: React.ReactNode;
  onCopy: (code: string) => void;
  copied: string | null;
}

function ComponentExample({ title, code, children, onCopy, copied }: ComponentExampleProps) {
  const isCopied = copied === code;

  return (
    <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCopy(code)}
          className="text-xs"
        >
          {isCopied ? '✓ Copied' : 'Copy Code'}
        </Button>
      </div>
      <div className="p-6 bg-background rounded border border-border">
        {children}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View Code
        </summary>
        <pre className="mt-2 p-4 bg-muted rounded overflow-x-auto">
          <code className="text-xs">{code}</code>
        </pre>
      </details>
    </div>
  );
}