import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

/**
 * Interactive examples demonstrating all Card variants and states.
 * Use this as a visual reference or copy examples into your own code.
 */
export function CardExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
        <Card variant="default" className="w-[350px]">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>Subtle shadow for standard content containers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">This is the default card variant with a subtle shadow effect.</p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Action
            </button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Elevated Variant</h3>
        <Card variant="elevated" className="w-[350px]">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>Prominent shadow with hover effect for emphasis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Hover over this card to see the shadow elevation increase.</p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Emphasized Action
            </button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Outlined Variant</h3>
        <Card variant="outlined" className="w-[350px]">
          <CardHeader>
            <CardTitle>Outlined Card</CardTitle>
            <CardDescription>No shadow with prominent border for nested content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This variant uses a 2px border instead of shadows for lower hierarchy content.
            </p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
              Secondary Action
            </button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Minimal Card (No Footer)</h3>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="dark-mode" className="text-sm">
                  Dark Mode
                </label>
                <input id="dark-mode" type="checkbox" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notifications" className="text-sm">
                  Notifications
                </label>
                <input id="notifications" type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Card with Custom Styling</h3>
        <Card className="w-[350px] bg-accent">
          <CardHeader>
            <CardTitle className="text-accent-foreground">Custom Styled Card</CardTitle>
            <CardDescription>Background color override with className</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You can override the default styles by passing className props.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Card Grid Layout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
              <CardDescription>First card in grid</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Content for card 1</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
              <CardDescription>Second card in grid</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Content for card 2</p>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Card 3</CardTitle>
              <CardDescription>Third card in grid</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Content for card 3</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Card with Form</h3>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Account created');
            }}
          >
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Create
              </button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </div>
  );
}
