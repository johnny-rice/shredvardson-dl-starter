'use client';

/**
 * Component Playground
 *
 * Interactive component viewer with live prop controls
 */

// Dynamic component imports
import * as UIComponents from '@ui/src/components/ui/button';
import { Button } from '@ui/src/components/ui/button';
import * as CardComponents from '@ui/src/components/ui/card';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/src/components/ui/card';
import * as DialogComponents from '@ui/src/components/ui/dialog';
import * as InputComponents from '@ui/src/components/ui/input';
import { Input } from '@ui/src/components/ui/input';
import * as LinkComponents from '@ui/src/components/ui/Link';
import * as LabelComponents from '@ui/src/components/ui/label';
import { Label } from '@ui/src/components/ui/label';
import * as SectionHeaderComponents from '@ui/src/components/ui/section-header';
import * as SelectComponents from '@ui/src/components/ui/select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/src/components/ui/select';
import { useMemo, useState } from 'react';
import type { ComponentMetadata } from '@/design-system/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, any> = {
  button: UIComponents.Button,
  card: CardComponents.Card,
  input: InputComponents.Input,
  label: LabelComponents.Label,
  select: SelectComponents.Select,
  dialog: DialogComponents.Dialog,
  link: LinkComponents.Link,
  'section-header': SectionHeaderComponents.SectionHeader,
};

interface ComponentPlaygroundProps {
  component: ComponentMetadata;
}

export default function ComponentPlayground({ component }: ComponentPlaygroundProps) {
  // Initialize props state with default values
  const initialProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: Record<string, any> = {};
    component.props.forEach((prop) => {
      if (prop.defaultValue) {
        props[prop.name] = prop.defaultValue;
      }
    });
    // Add default variant values
    if (component.defaultVariants) {
      Object.assign(props, component.defaultVariants);
    }
    return props;
  }, [component]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [props, setProps] = useState<Record<string, any>>(initialProps);
  const [showCode, setShowCode] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProp = (name: string, value: any) => {
    setProps((prev) => ({ ...prev, [name]: value }));
  };

  const resetProps = () => {
    setProps(initialProps);
  };

  // Get the component to render
  const Component = componentMap[component.name];

  // Generate code snippet
  const generateCode = () => {
    const propStrings = Object.entries(props)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : null;
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .filter(Boolean);

    const propsString = propStrings.length > 0 ? ` ${propStrings.join(' ')}` : '';

    // Handle different component types
    if (component.name === 'button') {
      return `<Button${propsString}>Click me</Button>`;
    }
    if (component.name === 'input') {
      return `<Input${propsString} />`;
    }
    if (component.name === 'label') {
      return `<Label${propsString}>Label Text</Label>`;
    }
    if (component.name === 'link') {
      return `<Link${propsString}>Link Text</Link>`;
    }
    if (component.name === 'section-header') {
      return `<SectionHeader title="Section Title"${propsString} />`;
    }

    return `<${component.displayName}${propsString} />`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Preview */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/30">
              {Component ? (
                // Void elements (input only) don't accept children
                component.name === 'input' ? (
                  <Component {...props} />
                ) : (
                  <Component {...props}>
                    {component.name === 'button' && 'Click me'}
                    {component.name === 'label' && 'Label Text'}
                    {component.name === 'link' && 'Link Text'}
                  </Component>
                )
              ) : (
                <p className="text-muted-foreground">Component preview not available</p>
              )}
            </div>

            {/* Code Snippet */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
                  {showCode ? 'Hide' : 'Show'} Code
                </Button>
                {showCode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateCode());
                    }}
                  >
                    Copy
                  </Button>
                )}
              </div>
              {showCode && (
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="text-sm font-mono">{generateCode()}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Controls</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetProps}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {component.props.map((prop) => (
                <div key={prop.name}>
                  <Label htmlFor={prop.name} className="text-sm font-medium mb-2 block">
                    {prop.name}
                    {prop.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {/* Text Input */}
                  {prop.control === 'text' && (
                    <Input
                      id={prop.name}
                      type="text"
                      value={props[prop.name] || ''}
                      onChange={(e) => updateProp(prop.name, e.target.value)}
                      placeholder={prop.defaultValue || `Enter ${prop.name}...`}
                    />
                  )}

                  {/* Number Input */}
                  {prop.control === 'number' && (
                    <Input
                      id={prop.name}
                      type="number"
                      value={props[prop.name] || ''}
                      onChange={(e) => updateProp(prop.name, Number(e.target.value))}
                      placeholder={prop.defaultValue || `Enter ${prop.name}...`}
                    />
                  )}

                  {/* Boolean Toggle */}
                  {prop.control === 'boolean' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateProp(prop.name, !props[prop.name])}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${props[prop.name] ? 'bg-primary' : 'bg-input'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${props[prop.name] ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                      <span className="text-sm text-muted-foreground">
                        {props[prop.name] ? 'On' : 'Off'}
                      </span>
                    </div>
                  )}

                  {/* Select Dropdown */}
                  {prop.control === 'select' && prop.options && (
                    <Select
                      value={props[prop.name] || prop.defaultValue}
                      onValueChange={(value) => updateProp(prop.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${prop.name}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {prop.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {prop.description && (
                    <p className="text-xs text-muted-foreground mt-1">{prop.description}</p>
                  )}
                </div>
              ))}

              {component.props.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No configurable props
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
