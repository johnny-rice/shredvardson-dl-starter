'use client';

/**
 * Token Swatch
 *
 * Visual representation of a design token with copy-to-clipboard
 */

import { useState } from 'react';

interface TokenSwatchProps {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'text';
  compact?: boolean;
}

export default function TokenSwatch({ name, value, type, compact = false }: TokenSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Silently fail - clipboard permissions can be restrictive
    }
  };

  if (type === 'color') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="group relative block w-full text-left transition-transform hover:scale-105"
      >
        {/* Color Swatch */}
        <div
          className="h-16 rounded-lg border-2 border-border mb-2 transition-shadow group-hover:shadow-lg"
          style={{ backgroundColor: value }}
        />

        {/* Token Info */}
        <div className="text-xs">
          <div className="font-mono text-primary truncate">{name}</div>
          <div className="font-mono text-muted-foreground truncate">{value}</div>
        </div>

        {/* Copy Indicator */}
        {copied && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Copied!
          </div>
        )}
      </button>
    );
  }

  if (type === 'spacing') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="group relative flex items-center gap-4 w-full hover:bg-muted/50 p-2 rounded transition-colors"
      >
        {/* Visual Bar */}
        <div className="flex items-center gap-2 flex-1">
          <div className="h-8 bg-primary rounded" style={{ width: value }} />
          <div className="flex-1 text-left">
            <div className="font-mono text-sm text-primary">{name}</div>
            <div className="font-mono text-xs text-muted-foreground">{value}</div>
          </div>
        </div>

        {/* Copy Indicator */}
        {copied && (
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Copied!
          </div>
        )}
      </button>
    );
  }

  // Text type (default)
  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="group relative px-3 py-1 rounded-md bg-muted hover:bg-muted/70 transition-colors"
      >
        <code className="text-xs font-mono">{value}</code>
        {copied && (
          <div className="absolute -top-8 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Copied!
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group relative w-full text-left p-3 rounded-md bg-muted hover:bg-muted/70 transition-colors"
    >
      <div className="font-mono text-sm text-primary mb-1">{name}</div>
      <code className="text-xs font-mono text-muted-foreground">{value}</code>
      {copied && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          Copied!
        </div>
      )}
    </button>
  );
}
