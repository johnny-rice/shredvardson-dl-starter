'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

/**
 * Interactive examples demonstrating all Select variants and states.
 * Use this as a visual reference or copy examples into your own code.
 *
 * Note: Select is a Radix UI compound component, not a native <select>.
 * Labels cannot use htmlFor/id for programmatic association like native inputs.
 * The label-select relationship is established through visual proximity and
 * ARIA attributes built into the SelectTrigger component.
 */
export function SelectExamples() {
  const [formData, setFormData] = useState({ role: 'developer', level: '' });

  return (
    <div className="space-y-8 p-8 max-w-md">
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Select</h3>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Small Size</h3>
        <Select>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="Small select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Large Size</h3>
        <Select>
          <SelectTrigger size="lg" className="w-full">
            <SelectValue placeholder="Large select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Default Value</h3>
        <Select defaultValue="banana">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Label</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Grouped Options</h3>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>North America</SelectLabel>
              <SelectItem value="est">Eastern Standard Time</SelectItem>
              <SelectItem value="cst">Central Standard Time</SelectItem>
              <SelectItem value="mst">Mountain Standard Time</SelectItem>
              <SelectItem value="pst">Pacific Standard Time</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Europe</SelectLabel>
              <SelectItem value="gmt">Greenwich Mean Time</SelectItem>
              <SelectItem value="cet">Central European Time</SelectItem>
              <SelectItem value="eet">Eastern European Time</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Asia</SelectLabel>
              <SelectItem value="ist">India Standard Time</SelectItem>
              <SelectItem value="cst-china">China Standard Time</SelectItem>
              <SelectItem value="jst">Japan Standard Time</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Disabled Option</h3>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise" disabled>
              Enterprise (Coming soon)
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Disabled Select</h3>
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Disabled select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">With Helper Text</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose your preferred language for the interface
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Required Field</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Department <span className="text-destructive">*</span>
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Long List</h3>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="af">Afghanistan</SelectItem>
            <SelectItem value="al">Albania</SelectItem>
            <SelectItem value="dz">Algeria</SelectItem>
            <SelectItem value="ar">Argentina</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="at">Austria</SelectItem>
            <SelectItem value="bd">Bangladesh</SelectItem>
            <SelectItem value="be">Belgium</SelectItem>
            <SelectItem value="br">Brazil</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="cl">Chile</SelectItem>
            <SelectItem value="cn">China</SelectItem>
            <SelectItem value="co">Colombia</SelectItem>
            <SelectItem value="dk">Denmark</SelectItem>
            <SelectItem value="eg">Egypt</SelectItem>
            <SelectItem value="fi">Finland</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="gr">Greece</SelectItem>
            <SelectItem value="in">India</SelectItem>
            <SelectItem value="id">Indonesia</SelectItem>
            <SelectItem value="ie">Ireland</SelectItem>
            <SelectItem value="il">Israel</SelectItem>
            <SelectItem value="it">Italy</SelectItem>
            <SelectItem value="jp">Japan</SelectItem>
            <SelectItem value="kr">South Korea</SelectItem>
            <SelectItem value="mx">Mexico</SelectItem>
            <SelectItem value="nl">Netherlands</SelectItem>
            <SelectItem value="nz">New Zealand</SelectItem>
            <SelectItem value="no">Norway</SelectItem>
            <SelectItem value="pk">Pakistan</SelectItem>
            <SelectItem value="pl">Poland</SelectItem>
            <SelectItem value="pt">Portugal</SelectItem>
            <SelectItem value="ru">Russia</SelectItem>
            <SelectItem value="sa">Saudi Arabia</SelectItem>
            <SelectItem value="sg">Singapore</SelectItem>
            <SelectItem value="za">South Africa</SelectItem>
            <SelectItem value="es">Spain</SelectItem>
            <SelectItem value="se">Sweden</SelectItem>
            <SelectItem value="ch">Switzerland</SelectItem>
            <SelectItem value="th">Thailand</SelectItem>
            <SelectItem value="tr">Turkey</SelectItem>
            <SelectItem value="ae">United Arab Emirates</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="us">United States</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Form Example</h3>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted:', formData);
            alert(`Submitted: ${formData.role}, ${formData.level}`);
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              defaultValue="developer"
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level</label>
            <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior (6+ years)</SelectItem>
                <SelectItem value="lead">Lead/Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Submit
          </button>
        </form>
      </section>
    </div>
  );
}
