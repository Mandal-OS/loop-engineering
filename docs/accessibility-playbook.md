# Accessibility Playbook

Accessibility is part of production quality, not a polish task.

## Baseline Requirements

- Pages have one clear H1.
- Interactive elements are keyboard reachable.
- Focus states are visible.
- Buttons are buttons and links are links.
- Form inputs have labels.
- Error messages are connected to fields.
- Images have meaningful alt text or empty alt text when decorative.
- Color contrast passes WCAG AA for normal text and controls.
- Touch targets are at least 44 by 44 CSS pixels where practical.
- Motion respects reduced-motion preferences.

## Review Checklist

- Navigate the page using only keyboard.
- Test mobile viewport and zoomed text.
- Check headings in document order.
- Check accessible names for icons and controls.
- Check contrast for text, buttons, disabled states, and links.
- Confirm no layout breaks at 200 percent zoom.
- Confirm modals trap focus and restore focus when closed.

## Common Fixes

Use native controls where possible:

```html
<button type="button">Save</button>
```

Label inputs:

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required>
```

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```
