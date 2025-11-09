import { Input } from './input';

/**
 * Interactive examples demonstrating all Input variants and states.
 * Use this as a visual reference or copy examples into your own code.
 */
export function InputExamples() {
  return (
    <div className="space-y-8 p-8 max-w-md">
      <section>
        <h3 className="text-lg font-semibold mb-4">Default Size</h3>
        <div className="space-y-2">
          <label htmlFor="default-input" className="text-sm font-medium">
            Email
          </label>
          <Input id="default-input" type="email" placeholder="you@example.com" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <div className="space-y-2">
          <label htmlFor="small-input" className="text-sm font-medium">
            Username
          </label>
          <Input id="small-input" size="sm" placeholder="@username" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Large Size</h3>
        <div className="space-y-2">
          <label htmlFor="large-input" className="text-sm font-medium">
            Search
          </label>
          <Input id="large-input" size="lg" placeholder="Search..." />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Input Types</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="text-input" className="text-sm font-medium">
              Text
            </label>
            <Input id="text-input" type="text" placeholder="Enter text" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password-input" className="text-sm font-medium">
              Password
            </label>
            <Input id="password-input" type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email-input" className="text-sm font-medium">
              Email
            </label>
            <Input id="email-input" type="email" placeholder="email@example.com" />
          </div>

          <div className="space-y-2">
            <label htmlFor="number-input" className="text-sm font-medium">
              Number
            </label>
            <Input id="number-input" type="number" placeholder="0" />
          </div>

          <div className="space-y-2">
            <label htmlFor="tel-input" className="text-sm font-medium">
              Phone
            </label>
            <Input id="tel-input" type="tel" placeholder="+1 (555) 000-0000" />
          </div>

          <div className="space-y-2">
            <label htmlFor="url-input" className="text-sm font-medium">
              URL
            </label>
            <Input id="url-input" type="url" placeholder="https://example.com" />
          </div>

          <div className="space-y-2">
            <label htmlFor="date-input" className="text-sm font-medium">
              Date
            </label>
            <Input id="date-input" type="date" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Disabled State</h3>
        <div className="space-y-2">
          <label htmlFor="disabled-input" className="text-sm font-medium">
            Disabled Input
          </label>
          <Input id="disabled-input" placeholder="Cannot edit" disabled />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Default Value</h3>
        <div className="space-y-2">
          <label htmlFor="value-input" className="text-sm font-medium">
            Name
          </label>
          <Input id="value-input" defaultValue="John Doe" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Error State</h3>
        <div className="space-y-2">
          <label htmlFor="error-input" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="error-input"
            type="email"
            placeholder="you@example.com"
            aria-invalid="true"
            aria-describedby="error-message"
            className="border-destructive focus-visible:ring-destructive"
          />
          <p id="error-message" className="text-xs text-destructive">
            Please enter a valid email address
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">File Input</h3>
        <div className="space-y-2">
          <label htmlFor="file-input" className="text-sm font-medium">
            Upload File
          </label>
          <Input id="file-input" type="file" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Helper Text</h3>
        <div className="space-y-2">
          <label htmlFor="helper-input" className="text-sm font-medium">
            Bio
          </label>
          <Input
            id="helper-input"
            placeholder="Tell us about yourself"
            aria-describedby="helper-text"
          />
          <p id="helper-text" className="text-xs text-muted-foreground">
            Brief description for your profile (max 280 characters)
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Required Field</h3>
        <div className="space-y-2">
          <label htmlFor="required-input" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input id="required-input" placeholder="John Doe" required />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Read-only</h3>
        <div className="space-y-2">
          <label htmlFor="readonly-input" className="text-sm font-medium">
            User ID
          </label>
          <Input id="readonly-input" defaultValue="USER-12345" readOnly className="bg-muted" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Form Example</h3>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted');
          }}
        >
          <div className="space-y-2">
            <label htmlFor="form-name" className="text-sm font-medium">
              Name
            </label>
            <Input id="form-name" placeholder="Your name" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="form-email" className="text-sm font-medium">
              Email
            </label>
            <Input id="form-email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="form-message" className="text-sm font-medium">
              Message
            </label>
            <Input id="form-message" placeholder="Your message" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Submit
          </button>
        </form>
      </section>
    </div>
  );
}
