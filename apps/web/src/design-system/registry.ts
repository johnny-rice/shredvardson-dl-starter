/**
 * Component Registry for Design System Viewer
 *
 * Auto-discovers and registers all UI components with metadata
 * for interactive playground and documentation.
 */

/**
 * Component metadata extracted from source files
 */
export interface ComponentMetadata {
  /** Component name */
  name: string;
  /** Display name for UI */
  displayName: string;
  /** Category for grouping */
  category: 'core' | 'forms' | 'layout' | 'feedback' | 'data-display';
  /** Component description */
  description: string;
  /** File path relative to project root */
  filePath: string;
  /** Available props with types */
  props: PropDefinition[];
  /** Available variants (from CVA) */
  variants?: Record<string, string[]>;
  /** Default variant values */
  defaultVariants?: Record<string, string>;
  /** Usage examples */
  examples?: ComponentExample[];
}

/**
 * Prop definition with type information
 */
export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  /** Control type for playground */
  control?: 'text' | 'number' | 'boolean' | 'select' | 'color';
  /** Options for select control */
  options?: string[];
}

/**
 * Component usage example
 */
export interface ComponentExample {
  name: string;
  description: string;
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
}

/**
 * Registry of all available components
 */
export const componentRegistry: Record<string, ComponentMetadata> = {
  button: {
    name: 'button',
    displayName: 'Button',
    category: 'core',
    description: 'A flexible button component that supports multiple visual styles and sizes.',
    filePath: 'packages/ui/src/components/ui/button.tsx',
    props: [
      {
        name: 'variant',
        type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
        required: false,
        defaultValue: 'default',
        description: 'Visual style variant',
        control: 'select',
        options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      },
      {
        name: 'size',
        type: '"default" | "sm" | "lg" | "icon"',
        required: false,
        defaultValue: 'default',
        description: 'Size variant',
        control: 'select',
        options: ['default', 'sm', 'lg', 'icon'],
      },
      {
        name: 'asChild',
        type: 'boolean',
        required: false,
        description: 'Render as a child component instead of button',
        control: 'boolean',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        description: 'Disable button interaction',
        control: 'boolean',
      },
    ],
    variants: {
      variant: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      size: ['default', 'sm', 'lg', 'icon'],
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
    examples: [
      {
        name: 'Primary Button',
        description: 'Default button style for primary actions',
        code: '<Button>Click me</Button>',
        props: {},
      },
      {
        name: 'Destructive Button',
        description: 'Use for dangerous or irreversible actions',
        code: '<Button variant="destructive">Delete</Button>',
        props: { variant: 'destructive' },
      },
      {
        name: 'Outline Button',
        description: 'Secondary actions with outline style',
        code: '<Button variant="outline">Cancel</Button>',
        props: { variant: 'outline' },
      },
    ],
  },
  card: {
    name: 'card',
    displayName: 'Card',
    category: 'layout',
    description: 'Container component for grouping related content.',
    filePath: 'packages/ui/src/components/ui/card.tsx',
    props: [
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
        control: 'text',
      },
    ],
    examples: [
      {
        name: 'Basic Card',
        description: 'Simple card with header and content',
        code: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>',
        props: {},
      },
    ],
  },
  input: {
    name: 'input',
    displayName: 'Input',
    category: 'forms',
    description: 'Text input component with consistent styling.',
    filePath: 'packages/ui/src/components/ui/input.tsx',
    props: [
      {
        name: 'type',
        type: 'string',
        required: false,
        defaultValue: 'text',
        description: 'Input type',
        control: 'select',
        options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      },
      {
        name: 'placeholder',
        type: 'string',
        required: false,
        description: 'Placeholder text',
        control: 'text',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        description: 'Disable input',
        control: 'boolean',
      },
    ],
    examples: [
      {
        name: 'Text Input',
        description: 'Basic text input',
        code: '<Input placeholder="Enter text..." />',
        props: { placeholder: 'Enter text...' },
      },
    ],
  },
  label: {
    name: 'label',
    displayName: 'Label',
    category: 'forms',
    description: 'Form label component with accessibility support.',
    filePath: 'packages/ui/src/components/ui/label.tsx',
    props: [
      {
        name: 'htmlFor',
        type: 'string',
        required: false,
        description: 'Associates label with form control',
        control: 'text',
      },
    ],
    examples: [
      {
        name: 'Basic Label',
        description: 'Label for form field',
        code: '<Label htmlFor="email">Email</Label>',
        props: { htmlFor: 'email' },
      },
    ],
  },
  select: {
    name: 'select',
    displayName: 'Select',
    category: 'forms',
    description: 'Dropdown select component built on Radix UI.',
    filePath: 'packages/ui/src/components/ui/select.tsx',
    props: [
      {
        name: 'placeholder',
        type: 'string',
        required: false,
        description: 'Placeholder text when nothing selected',
        control: 'text',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        description: 'Disable select',
        control: 'boolean',
      },
    ],
    examples: [
      {
        name: 'Basic Select',
        description: 'Simple dropdown selection',
        code: '<Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="1">Option 1</SelectItem></SelectContent></Select>',
        props: {},
      },
    ],
  },
  dialog: {
    name: 'dialog',
    displayName: 'Dialog',
    category: 'feedback',
    description: 'Modal dialog component for focused interactions.',
    filePath: 'packages/ui/src/components/ui/dialog.tsx',
    props: [
      {
        name: 'open',
        type: 'boolean',
        required: false,
        description: 'Control dialog open state',
        control: 'boolean',
      },
    ],
    examples: [
      {
        name: 'Basic Dialog',
        description: 'Modal with title and content',
        code: '<Dialog><DialogTrigger><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader></DialogContent></Dialog>',
        props: {},
      },
    ],
  },
  link: {
    name: 'link',
    displayName: 'Link',
    category: 'core',
    description: 'Navigation link component with Next.js routing.',
    filePath: 'packages/ui/src/components/ui/Link.tsx',
    props: [
      {
        name: 'href',
        type: 'string',
        required: true,
        description: 'Link destination',
        control: 'text',
      },
      {
        name: 'variant',
        type: '"default" | "subtle" | "button"',
        required: false,
        defaultValue: 'default',
        description: 'Visual style variant',
        control: 'select',
        options: ['default', 'subtle', 'button'],
      },
    ],
    examples: [
      {
        name: 'Basic Link',
        description: 'Standard navigation link',
        code: '<Link href="/about">About</Link>',
        props: { href: '/about' },
      },
    ],
  },
  'section-header': {
    name: 'section-header',
    displayName: 'Section Header',
    category: 'layout',
    description: 'Header component for page sections.',
    filePath: 'packages/ui/src/components/ui/section-header.tsx',
    props: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Section title',
        control: 'text',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Section description',
        control: 'text',
      },
    ],
    examples: [
      {
        name: 'Basic Section Header',
        description: 'Header with title and description',
        code: '<SectionHeader title="Features" description="Explore our key features" />',
        props: { title: 'Features', description: 'Explore our key features' },
      },
    ],
  },
};

/**
 * Get all component metadata
 */
export function getAllComponents(): ComponentMetadata[] {
  return Object.values(componentRegistry);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(
  category: ComponentMetadata['category']
): ComponentMetadata[] {
  return getAllComponents().filter((c) => c.category === category);
}

/**
 * Get component metadata by name
 */
export function getComponent(name: string): ComponentMetadata | undefined {
  return componentRegistry[name];
}

/**
 * Get all available categories
 */
export function getCategories(): ComponentMetadata['category'][] {
  return ['core', 'forms', 'layout', 'feedback', 'data-display'];
}
