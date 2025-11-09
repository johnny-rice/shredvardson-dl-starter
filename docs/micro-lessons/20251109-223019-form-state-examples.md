---
UsedBy: 0
Severity: normal
---

# Form Examples Should Demonstrate Complete State Handling

**Context.** Initial Select component form example had `onSubmit` handler with `preventDefault()` but didn't capture or use the form values. This missed the educational opportunity to show developers how to work with select values in real applications.

**Rule.** **Form examples should demonstrate complete state management patterns with `useState`, `onValueChange` handlers, and visible output (console.log + alert) so developers understand the full data flow, not just the visual structure.**

**Example.**

```tsx
// Bad: Form structure only, no value capture
<form onSubmit={(e) => { e.preventDefault(); }}>
  <Select defaultValue="developer">
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="developer">Developer</SelectItem>
    </SelectContent>
  </Select>
  <button type="submit">Submit</button>
</form>

// Good: Complete pattern with state and feedback
const [formData, setFormData] = useState({ role: 'developer', level: '' });

<form onSubmit={(e) => {
  e.preventDefault();
  console.log('Form submitted:', formData);
  alert(`Submitted: ${formData.role}, ${formData.level}`);
}}>
  <Select
    defaultValue="developer"
    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
  >
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="developer">Developer</SelectItem>
    </SelectContent>
  </Select>
  <button type="submit">Submit</button>
</form>
```

**Guardrails.**

- Forms should show state capture via `useState` and `onValueChange`/`onChange` handlers
- Submit handlers should log values to console and/or show alert for immediate feedback
- Examples should model real-world patterns developers will copy into production
- Include both controlled (with state) and uncontrolled (defaultValue) patterns where appropriate
- Don't leave developers guessing how to extract form values

**Tags.** #forms #react #state-management #examples #education #select #best-practices
