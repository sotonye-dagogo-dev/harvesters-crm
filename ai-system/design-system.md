# Design System

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-12
> - staleness-policy: re-verify if UI components or styling dependencies change

> **Overview:** UI implementation has not started in this repository, so this file records baseline conventions to use once frontend work begins. These tokens are provisional and should be validated against product design decisions when the first UI module is created.

---

## Visual Language

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| primary | #0B5FFF | Primary actions and links |
| secondary | #0EA5E9 | Highlights and secondary actions |
| background | #F8FAFC | Page background |
| surface | #FFFFFF | Cards and surfaces |
| text-primary | #0F172A | Main text |
| text-muted | #64748B | Secondary text |
| danger | #DC2626 | Error and destructive actions |
| success | #16A34A | Success states |

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Heading 1 | Inter, sans-serif | 32px | 700 |
| Body | Inter, sans-serif | 16px | 400 |
| Code | JetBrains Mono, monospace | 14px | 400 |

### Spacing Scale

4px base scale: 4, 8, 12, 16, 24, 32, 48, 64

---

## Component Patterns

### Buttons
- Primary: filled primary background with white text
- Secondary: outlined style with neutral background
- Destructive: red background and confirm intent before execution
- Disabled state: reduced contrast and blocked interactions

### Forms
- Input fields: label above input, helper text below
- Error messages: inline below field with high-contrast red text

### Navigation
- Use a top-level app shell with sidebar navigation once UI is introduced

### Cards / Containers
- Rounded corners (8px), subtle border, 16px internal padding

### Modals / Dialogs
- Confirm destructive actions and form submission side effects

---

## UX Principles

1. Always show explicit loading states for async actions.
2. Destructive actions must require confirmation.
3. Error messages must state both cause and next action.

---

## Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Wide screens |

---

## Accessibility Requirements

- All interactive elements must have keyboard focus states
- Colour contrast must meet WCAG AA (4.5:1 for text)
- Images must have alt text
- Forms must have associated labels
