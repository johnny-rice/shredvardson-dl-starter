'use client';

import { Button } from '@ui/src/components/ui/button';
import { Card } from '@ui/src/components/ui/card';
import { tokens } from '@ui/src/tokens';
import * as React from 'react';
import { Link } from '@/components/Link';

/**
 * Design Tokens Viewer
 *
 * Visual reference for all design system tokens
 */
export default function DesignTokensViewer() {
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const copyToken = async (token: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = token;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <Link href="/design" variant="ghost">
              ← Back to Components
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Design Tokens</h1>
          <p className="text-xl text-muted-foreground">
            Foundation values that power the design system
          </p>
        </header>

        {/* Colors Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Colors</h2>
            <p className="text-muted-foreground">
              Semantic color tokens that adapt to light and dark themes
            </p>
          </div>

          {/* Neutral Colors */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Neutral</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(tokens.colors.neutral).map(([shade, value]) => (
                <ColorSwatch
                  key={shade}
                  name={`neutral.${shade}`}
                  value={value}
                  onCopy={copyToken}
                  isCopied={copiedToken === `neutral.${shade}`}
                />
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Brand</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(tokens.colors.brand).map(([shade, value]) => (
                <ColorSwatch
                  key={shade}
                  name={`brand.${shade}`}
                  value={value}
                  onCopy={copyToken}
                  isCopied={copiedToken === `brand.${shade}`}
                />
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Semantic</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['success', 'warning', 'error', 'info'].map((category) => (
                <React.Fragment key={category}>
                  {Object.entries(tokens.colors[category as keyof typeof tokens.colors]).map(
                    ([shade, value]) => (
                      <ColorSwatch
                        key={`${category}.${shade}`}
                        name={`${category}.${shade}`}
                        value={value}
                        onCopy={copyToken}
                        isCopied={copiedToken === `${category}.${shade}`}
                      />
                    )
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Spacing</h2>
            <p className="text-muted-foreground">8px base grid system for consistent spacing</p>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="space-y-3">
                {Object.entries(tokens.spacing)
                  .slice(0, 20) // Show first 20 spacing values
                  .map(([size, value]) => (
                    <div key={size} className="flex items-center gap-4">
                      <code className="text-sm font-mono w-24">spacing.{size}</code>
                      <div className="bg-primary h-4" style={{ width: value }} />
                      <span className="text-sm text-muted-foreground">{value}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          copyToken(`spacing.${size}`);
                        }}
                        className="ml-auto text-xs"
                      >
                        {copiedToken === `spacing.${size}` ? '✓' : 'Copy'}
                      </Button>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Typography</h2>
            <p className="text-muted-foreground">Font sizes, weights, and line heights</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Font Sizes */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Font Sizes</h3>
              <div className="space-y-3">
                {Object.entries(tokens.typography.fontSize).map(([size, value]) => (
                  <div key={size} className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-sm font-medium">fontSize.{size}</span>
                        <code className="ml-2 text-xs text-muted-foreground">{value}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToken(`fontSize.${size}`)}
                        className="text-xs"
                      >
                        {copiedToken === `fontSize.${size}` ? '✓' : 'Copy'}
                      </Button>
                    </div>
                    <div style={{ fontSize: value }} className="text-foreground">
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Font Weights */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Font Weights</h3>
              <div className="space-y-3">
                {Object.entries(tokens.typography.fontWeight).map(([weight, value]) => (
                  <div key={weight} className="flex items-center justify-between">
                    <div>
                      <span style={{ fontWeight: Number(value) }} className="text-foreground">
                        {weight}
                      </span>
                      <code className="ml-2 text-xs text-muted-foreground">{value}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToken(`fontWeight.${weight}`)}
                      className="text-xs"
                    >
                      {copiedToken === `fontWeight.${weight}` ? '✓' : 'Copy'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Border Radius Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Border Radius</h2>
            <p className="text-muted-foreground">Corner radius values for consistent rounding</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tokens.borderRadius).map(([size, value]) => (
              <Card key={size} className="p-4">
                <div className="w-full h-20 bg-primary mb-2" style={{ borderRadius: value }} />
                <div className="space-y-1">
                  <div className="font-medium">{size}</div>
                  <code className="text-xs text-muted-foreground">{value}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToken(`borderRadius.${size}`)}
                  className="mt-2 w-full text-xs"
                >
                  {copiedToken === `borderRadius.${size}` ? '✓ Copied' : 'Copy'}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Shadows Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Shadows</h2>
            <p className="text-muted-foreground">Elevation system for depth and hierarchy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(tokens.shadows).map(([size, value]) => (
              <Card
                key={size}
                className="p-6"
                style={{ boxShadow: value === 'none' ? undefined : value }}
              >
                <div className="space-y-2">
                  <div className="font-medium">shadows.{size}</div>
                  <code className="text-xs text-muted-foreground block break-all">{value}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToken(`shadows.${size}`)}
                  className="mt-4 w-full text-xs"
                >
                  {copiedToken === `shadows.${size}` ? '✓ Copied' : 'Copy'}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Animation Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Animation</h2>
            <p className="text-muted-foreground">
              Duration and easing values for consistent motion
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Durations */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Durations</h3>
              <div className="space-y-3">
                {Object.entries(tokens.animation.duration).map(([speed, value]) => (
                  <div key={speed} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{speed}</span>
                      <code className="ml-2 text-xs text-muted-foreground">{value}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToken(`duration.${speed}`)}
                      className="text-xs"
                    >
                      {copiedToken === `duration.${speed}` ? '✓' : 'Copy'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Easings */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Easings</h3>
              <div className="space-y-3">
                {Object.entries(tokens.animation.easing).map(([easing, value]) => (
                  <div key={easing} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{easing}</div>
                      <code className="text-xs text-muted-foreground break-all">{value}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToken(`easing.${easing}`)}
                      className="text-xs ml-2"
                    >
                      {copiedToken === `easing.${easing}` ? '✓' : 'Copy'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * Color Swatch Component
 */
interface ColorSwatchProps {
  name: string;
  value: string;
  onCopy: (token: string) => void;
  isCopied: boolean;
}

function ColorSwatch({ name, value, onCopy, isCopied }: ColorSwatchProps) {
  return (
    <Card className="p-3 space-y-2">
      <div
        className="w-full h-16 rounded border border-border"
        style={{ backgroundColor: value }}
      />
      <div className="space-y-1">
        <div className="text-sm font-medium">{name}</div>
        <code className="text-xs text-muted-foreground block truncate">{value}</code>
      </div>
      <Button size="sm" variant="ghost" onClick={() => onCopy(name)} className="w-full text-xs">
        {isCopied ? '✓ Copied' : 'Copy'}
      </Button>
    </Card>
  );
}
