---
UsedBy: 0
Severity: normal
---

# React Void Elements Cannot Have Children

**Context.** Building a component playground that renders all UI components dynamically. When clicking the Input component card, React threw: "input is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`".

**Rule.** **HTML void elements (`<input>`, `<img>`, `<br>`, `<hr>`, `<link>`, `<meta>`, `<area>`, `<base>`, `<col>`, `<embed>`, `<source>`, `<track>`, `<wbr>`) must be rendered without children in React - use conditional rendering to handle them separately. Note: `<select>` and `<textarea>` are NOT void elements and accept children.**

**Example.**

```tsx
// ❌ BAD: All components rendered with children
<Component {...props}>
  {component.name === 'button' && 'Click me'}
  {component.name === 'input' && 'Placeholder'}  // Error! input is void
</Component>

// ✅ GOOD: Only void elements rendered without children
{component.name === 'input' || component.name === 'img' ? (
  <Component {...props} />
) : (
  <Component {...props}>
    {component.name === 'button' && 'Click me'}
    {component.name === 'select' && <option>Choose</option>}
    {component.name === 'label' && 'Label Text'}
  </Component>
)}
```

**Guardrails.**
- Create a constant for void element names: `const VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']`
- Check `VOID_ELEMENTS.includes(componentName)` before rendering children
- In component galleries/playgrounds, handle void elements as a special case
- Remember: `<select>` and `<textarea>` accept children and should NOT be in this list

**Tags.** react,void-elements,html,component-playground,dynamic-rendering
