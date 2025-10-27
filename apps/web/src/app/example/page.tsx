'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/components';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ExamplePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Design System Showcase</h1>
        <ThemeToggle />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>All button variants in different states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Buttons</Label>
              <div className="flex gap-2 flex-wrap">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Button Sizes</Label>
              <div className="flex gap-2 items-center flex-wrap">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🎉</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disabled State</Label>
              <div className="flex gap-2 flex-wrap">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="example-input">Text Input</Label>
              <Input id="example-input" placeholder="Type something..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input id="disabled-input" placeholder="Can't type here" disabled />
            </div>

            <div className="space-y-2">
              <Label>Select Dropdown</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                  <SelectItem value="option4" disabled>
                    Disabled Option
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Component */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog Component</CardTitle>
            <CardDescription>Modal dialog with keyboard navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Example Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog supports keyboard navigation. Press ESC to close or use the close
                    button.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-input">Name</Label>
                    <Input id="dialog-input" placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferences</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light theme</SelectItem>
                        <SelectItem value="dark">Dark theme</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Theme Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Testing</CardTitle>
            <CardDescription>Components in current theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-foreground">Primary text using foreground token</p>
              <p className="text-muted-foreground">Muted text using muted-foreground token</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Text on muted background</p>
            </div>

            <div className="p-4 bg-primary rounded-lg">
              <p className="text-primary-foreground">Text on primary background</p>
            </div>

            <div className="flex gap-2">
              <div className="w-4 h-4 bg-primary rounded" title="Primary color" />
              <div className="w-4 h-4 bg-secondary rounded" title="Secondary color" />
              <div className="w-4 h-4 bg-muted rounded" title="Muted color" />
              <div className="w-4 h-4 bg-destructive rounded" title="Destructive color" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All components use design tokens and support both light and dark themes.</p>
        <p>Try switching themes using the toggle above to see the changes.</p>
      </div>
    </div>
  );
}
