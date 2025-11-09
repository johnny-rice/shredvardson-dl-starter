import { SectionHeader } from './section-header';

/**
 * Interactive examples demonstrating all SectionHeader variants and states.
 * Use this as a visual reference or copy examples into your own code.
 */
export function SectionHeaderExamples() {
  return (
    <div className="space-y-12 p-8">
      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Small Size</h3>
        <SectionHeader as="h4" size="sm">
          Small Section Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Medium Size (Default)</h3>
        <SectionHeader as="h2" size="md">
          Medium Section Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Large Size</h3>
        <SectionHeader as="h1" size="lg">
          Large Section Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">With Description</h3>
        <SectionHeader
          as="h2"
          size="md"
          description="This section header includes a description to provide additional context"
        >
          Settings & Preferences
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Left Aligned (Default)</h3>
        <SectionHeader as="h2" size="md" align="left" description="Left-aligned header">
          Left Aligned Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Center Aligned</h3>
        <SectionHeader as="h2" size="md" align="center" description="Centered header with description">
          Center Aligned Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Right Aligned</h3>
        <SectionHeader as="h2" size="md" align="right" description="Right-aligned header">
          Right Aligned Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Page Title (h1, Large)</h3>
        <SectionHeader
          as="h1"
          size="lg"
          description="Welcome to your dashboard where you can manage everything"
        >
          Dashboard
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Major Section (h2, Medium)</h3>
        <SectionHeader
          as="h2"
          size="md"
          description="Manage your team members and their permissions"
        >
          Team Members
        </SectionHeader>
        <div className="mt-4 p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">Team member list would go here</p>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Subsection (h3, Small)</h3>
        <SectionHeader as="h3" size="sm" description="Recent activity from your team">
          Activity Log
        </SectionHeader>
        <div className="mt-4 p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">Activity items would go here</p>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">With ID for Skip Links</h3>
        <SectionHeader
          as="h2"
          size="md"
          headingProps={{
            id: 'main-content',
            'aria-label': 'Main content section',
          }}
        >
          Main Content
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Custom Heading Class</h3>
        <SectionHeader
          as="h2"
          size="md"
          headingProps={{ className: 'text-primary' }}
          description="Custom colored heading"
        >
          Custom Styled Header
        </SectionHeader>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Responsive Sizing</h3>
        <div className="space-y-8">
          <SectionHeader as="h1" size="lg" description="Scales from text-3xl to text-5xl">
            Large Responsive
          </SectionHeader>
          <SectionHeader as="h2" size="md" description="Scales from text-2xl to text-3xl">
            Medium Responsive
          </SectionHeader>
          <SectionHeader as="h3" size="sm" description="Scales from text-lg to text-xl">
            Small Responsive
          </SectionHeader>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">Marketing Page Example</h3>
        <div className="space-y-8">
          <SectionHeader
            as="h1"
            size="lg"
            align="center"
            description="Build better products with our comprehensive toolkit"
          >
            The Complete Solution
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div>
              <SectionHeader as="h3" size="sm" align="center" description="Fast and reliable">
                Performance
              </SectionHeader>
            </div>
            <div>
              <SectionHeader as="h3" size="sm" align="center" description="Enterprise-grade">
                Security
              </SectionHeader>
            </div>
            <div>
              <SectionHeader as="h3" size="sm" align="center" description="Always available">
                Support
              </SectionHeader>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-6 text-muted-foreground">
          Proper Heading Hierarchy
        </h3>
        <div className="space-y-6">
          <SectionHeader as="h1" size="lg">
            Page Title (h1)
          </SectionHeader>
          <div className="pl-4 space-y-4">
            <SectionHeader as="h2" size="md">
              Major Section (h2)
            </SectionHeader>
            <div className="pl-4 space-y-2">
              <SectionHeader as="h3" size="sm">
                Subsection (h3)
              </SectionHeader>
              <p className="text-sm text-muted-foreground pl-4">
                Note: Always maintain proper heading hierarchy (h1 → h2 → h3) for accessibility
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
