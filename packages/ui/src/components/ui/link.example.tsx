import { Link } from './Link';

/**
 * Interactive examples demonstrating all Link variants and states.
 * Use this as a visual reference or copy examples into your own code.
 */
export function LinkExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
        <p className="text-sm">
          This is a paragraph with an{' '}
          <Link variant="default" href="/docs">
            inline link
          </Link>{' '}
          that uses the default variant.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Primary Variant (Button-like)</h3>
        <Link variant="primary" href="/signup">
          Get Started
        </Link>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Secondary Variant</h3>
        <Link variant="secondary" href="/learn-more">
          Learn More
        </Link>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Ghost Variant</h3>
        <Link variant="ghost" href="/settings">
          Settings
        </Link>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Nav Variant</h3>
        <nav className="flex gap-2">
          <Link variant="nav" href="/dashboard">
            Dashboard
          </Link>
          <Link variant="nav" href="/projects">
            Projects
          </Link>
          <Link variant="nav" href="/team">
            Team
          </Link>
          <Link variant="nav" href="/settings">
            Settings
          </Link>
        </nav>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">External Links</h3>
        <div className="space-y-2">
          <div>
            <Link
              variant="default"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit GitHub (opens in new window)"
            >
              GitHub ↗
            </Link>
          </div>
          <div>
            <Link
              variant="default"
              href="https://docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Documentation (opens in new window)"
            >
              Documentation (external) ↗
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Disabled Link</h3>
        <Link
          variant="default"
          href="#"
          aria-disabled="true"
          tabIndex={-1}
          className="opacity-50 cursor-not-allowed"
          onClick={(e) => e.preventDefault()}
        >
          Disabled Link
        </Link>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Links in Navigation</h3>
        <nav className="flex flex-col gap-1 bg-muted/50 p-4 rounded-md w-48">
          <Link variant="nav" href="/home">
            Home
          </Link>
          <Link variant="nav" href="/about">
            About
          </Link>
          <Link variant="nav" href="/services">
            Services
          </Link>
          <Link variant="nav" href="/contact">
            Contact
          </Link>
        </nav>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Call-to-Action Links</h3>
        <div className="flex gap-4">
          <Link variant="primary" href="/start">
            Start Free Trial
          </Link>
          <Link variant="secondary" href="/pricing">
            View Pricing
          </Link>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Custom Styled Links</h3>
        <div className="space-y-2">
          <div>
            <Link
              variant="default"
              href="#"
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.preventDefault()}
            >
              Custom Blue Link
            </Link>
          </div>
          <div>
            <Link
              variant="primary"
              href="#"
              className="bg-green-600 hover:bg-green-700"
              onClick={(e) => e.preventDefault()}
            >
              Custom Green Button
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Links in Footer</h3>
        <footer className="bg-muted p-6 rounded-md">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Product</h4>
              <div className="flex flex-col space-y-1">
                <Link variant="ghost" href="/features" className="justify-start">
                  Features
                </Link>
                <Link variant="ghost" href="/pricing" className="justify-start">
                  Pricing
                </Link>
                <Link variant="ghost" href="/updates" className="justify-start">
                  Updates
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Company</h4>
              <div className="flex flex-col space-y-1">
                <Link variant="ghost" href="/about" className="justify-start">
                  About
                </Link>
                <Link variant="ghost" href="/blog" className="justify-start">
                  Blog
                </Link>
                <Link variant="ghost" href="/careers" className="justify-start">
                  Careers
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Support</h4>
              <div className="flex flex-col space-y-1">
                <Link variant="ghost" href="/help" className="justify-start">
                  Help Center
                </Link>
                <Link variant="ghost" href="/contact" className="justify-start">
                  Contact
                </Link>
                <Link variant="ghost" href="/status" className="justify-start">
                  Status
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Breadcrumb Links</h3>
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
          <Link variant="default" href="/">
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link variant="default" href="/products">
            Products
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Current Page</span>
        </nav>
      </section>
    </div>
  );
}
