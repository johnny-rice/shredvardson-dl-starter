import { Input } from './input';
import { Label } from './label';

/**
 * Static examples demonstrating all Label usage patterns.
 * Use this as a visual reference or copy examples into your own code.
 */
export function LabelExamples() {
  return (
    <div className="space-y-8 p-8 max-w-md">
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Label</h3>
        <div className="space-y-2">
          <Label htmlFor="basic-input">Email address</Label>
          <Input id="basic-input" type="email" placeholder="you@example.com" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Required Field Label</h3>
        <div className="space-y-2">
          <Label htmlFor="required-input">
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input id="required-input" placeholder="John Doe" required />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Label with Helper Text</h3>
        <div className="space-y-2">
          <Label htmlFor="helper-input">Username</Label>
          <Input id="helper-input" placeholder="@username" aria-describedby="helper-text" />
          <p id="helper-text" className="text-xs text-muted-foreground">
            Choose a unique username for your profile
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Disabled Input with Label</h3>
        <div className="space-y-2">
          <Label htmlFor="disabled-input">Account status</Label>
          <Input id="disabled-input" value="Active" disabled />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Label with Checkbox</h3>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="terms" className="h-4 w-4 rounded border-input" />
          <Label htmlFor="terms" className="cursor-pointer">
            I agree to the terms and conditions
          </Label>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Label with Radio Buttons</h3>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select your plan
          </legend>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="radio" id="plan-free" name="plan" value="free" className="h-4 w-4" />
              <Label htmlFor="plan-free" className="cursor-pointer font-normal">
                Free
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" id="plan-pro" name="plan" value="pro" className="h-4 w-4" />
              <Label htmlFor="plan-pro" className="cursor-pointer font-normal">
                Pro
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="plan-enterprise"
                name="plan"
                value="enterprise"
                className="h-4 w-4"
              />
              <Label htmlFor="plan-enterprise" className="cursor-pointer font-normal">
                Enterprise
              </Label>
            </div>
          </div>
        </fieldset>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Horizontal Layout</h3>
        <div className="flex items-center space-x-4">
          <Label htmlFor="inline-input" className="w-24">
            API Key
          </Label>
          <Input id="inline-input" className="flex-1" placeholder="Enter API key" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Form with Multiple Labels</h3>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-first-name">First name</Label>
            <Input id="form-first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-last-name">Last name</Label>
            <Input id="form-last-name" placeholder="Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-email">Email</Label>
            <Input id="form-email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-phone">Phone number</Label>
            <Input id="form-phone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>
        </form>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Label with Error Message</h3>
        <div className="space-y-2">
          <Label htmlFor="error-input" className="text-destructive">
            Password
          </Label>
          <Input
            id="error-input"
            type="password"
            placeholder="••••••••"
            aria-invalid="true"
            aria-describedby="error-message"
            className="border-destructive"
          />
          <p id="error-message" className="text-xs text-destructive">
            Password must be at least 8 characters
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Label with Textarea</h3>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          {/* Note: Consider creating a Textarea component to avoid style duplication */}
          <textarea
            id="message"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type your message here"
          />
        </div>
      </section>
    </div>
  );
}
