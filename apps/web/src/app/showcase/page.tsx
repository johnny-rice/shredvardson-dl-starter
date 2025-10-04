'use client';

import {
  Button,
  Card,
  Input,
  Label,
  fadeIn,
  slideUp,
  scale,
  slideInRight,
  useReducedMotion,
  getReducedMotionVariants,
} from '@ui/components';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function ShowcasePage() {
  const prefersReducedMotion = useReducedMotion();
  const [showAnimations, setShowAnimations] = useState(true);
  const replayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleAnimations = () => {
    setShowAnimations(false);
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
    }
    replayTimeoutRef.current = setTimeout(() => {
      setShowAnimations(true);
      replayTimeoutRef.current = null;
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-8 space-y-16">
      {/* Typography Section */}
      <section>
        <h1 className="text-fluid-3xl font-bold mb-8">Design System Showcase</h1>
        <p className="text-muted-foreground mb-4">
          This page demonstrates all design tokens, components, and animations.
        </p>

        <div className="space-y-4">
          <h2 className="text-fluid-2xl font-semibold">Typography Scale</h2>
          <div className="space-y-2 border-l-4 border-primary pl-4">
            <p className="text-fluid-xs">Extra Small - Fluid XS</p>
            <p className="text-fluid-sm">Small - Fluid SM</p>
            <p className="text-fluid-base">Base - Fluid Base (body text)</p>
            <p className="text-fluid-lg">Large - Fluid LG</p>
            <p className="text-fluid-xl">Extra Large - Fluid XL</p>
            <p className="text-fluid-2xl">2XL - Fluid 2XL</p>
            <p className="text-fluid-3xl">3XL - Fluid 3XL</p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Resize browser from 320px → 2560px to see fluid scaling
          </p>
        </div>
      </section>

      {/* Colors Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Color Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 bg-primary rounded-lg" />
            <p className="text-sm font-mono">--primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-secondary rounded-lg" />
            <p className="text-sm font-mono">--secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-destructive rounded-lg" />
            <p className="text-sm font-mono">--destructive</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-muted rounded-lg" />
            <p className="text-sm font-mono">--muted</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-accent rounded-lg" />
            <p className="text-sm font-mono">--accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-card border border-border rounded-lg" />
            <p className="text-sm font-mono">--card</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-background border border-border rounded-lg" />
            <p className="text-sm font-mono">--background</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-popover border border-border rounded-lg" />
            <p className="text-sm font-mono">--popover</p>
          </div>
        </div>
      </section>

      {/* Button Variants Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>

        <h3 className="text-fluid-lg font-semibold mt-8 mb-4">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Search">
            🔍
          </Button>
        </div>

        <h3 className="text-fluid-lg font-semibold mt-8 mb-4">Button States</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Form Components Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Form Components</h2>
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>

          <Button>Submit Form</Button>
        </Card>
      </section>

      {/* Spacing Scale Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Spacing Scale (8pt Grid)</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-2</div>
            <div className="p-2 bg-accent">8px</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-4</div>
            <div className="p-4 bg-accent">16px</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-6</div>
            <div className="p-6 bg-accent">24px</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-8</div>
            <div className="p-8 bg-accent">32px</div>
          </div>
        </div>
      </section>

      {/* Border Radius Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Border Radius</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-primary rounded-sm flex items-center justify-center text-primary-foreground text-xs">
            rounded-sm
          </div>
          <div className="w-24 h-24 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">
            rounded-md
          </div>
          <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">
            rounded-lg
          </div>
        </div>
      </section>

      {/* Animation Variants Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-fluid-2xl font-semibold">Animation Variants</h2>
          <Button onClick={toggleAnimations} variant="outline" size="sm">
            Replay Animations
          </Button>
        </div>

        {prefersReducedMotion && (
          <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-md">
            ℹ️ You have &quot;Reduce Motion&quot; enabled. Animations are minimized for
            accessibility.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showAnimations && (
            <>
              <motion.div
                variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Fade In</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Smooth opacity transition for content appearance
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">variants={'{fadeIn}'}</code>
                </Card>
              </motion.div>

              <motion.div
                variants={prefersReducedMotion ? getReducedMotionVariants(slideUp) : slideUp}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Slide Up</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Content enters from bottom with vertical motion
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">variants={'{slideUp}'}</code>
                </Card>
              </motion.div>

              <motion.div
                variants={prefersReducedMotion ? getReducedMotionVariants(scale) : scale}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Scale</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Zoom effect for modals and emphasized content
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">variants={'{scale}'}</code>
                </Card>
              </motion.div>

              <motion.div
                variants={
                  prefersReducedMotion ? getReducedMotionVariants(slideInRight) : slideInRight
                }
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Slide In Right</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Horizontal entry from right edge
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    variants={'{slideInRight}'}
                  </code>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Accessibility Features</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              ✅ Respects{' '}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                prefers-reduced-motion
              </code>{' '}
              system setting
            </li>
            <li>
              ✅ Uses{' '}
              <code className="text-xs bg-background px-1 py-0.5 rounded">useReducedMotion</code>{' '}
              hook for dynamic detection
            </li>
            <li>✅ WCAG 2.1 Level AAA compliant (Success Criterion 2.3.3)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
