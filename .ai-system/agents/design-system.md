# Design System

> **Overview:** The CAS design language is specified in the product roadmap even though no frontend code exists yet. The target aesthetic is a church-first “glassy bento” interface: dark navy gradients, frosted glass surfaces, amber primary actions, and quick-to-scan cards that work well on mobile browsers. The system should feel modern and reliable without becoming visually noisy or overly technical. All UI work should follow these tokens and interaction rules so interns and AI tools converge on the same look.

---

## Visual Language

> **Section summary:** The palette and typography are intentionally specific because the app is meant to feel premium while remaining legible on small screens. These values should be encoded as CSS custom properties once the UI code is scaffolded.

### Colour Palette

| Token            | Value                     | Usage                                      |
| ---------------- | ------------------------- | ------------------------------------------ |
| primary          | #E8A020                   | CTAs, active states, key highlights        |
| primary-dark     | #C88612                   | Hover and pressed CTA states               |
| background-start | #1A3C5E                   | Top of page gradient                       |
| background-end   | #0F2439                   | Bottom of page gradient                    |
| surface          | rgba(255, 255, 255, 0.10) | Frosted glass cards                        |
| surface-strong   | rgba(255, 255, 255, 0.14) | Sheets and modal surfaces                  |
| border           | rgba(255, 255, 255, 0.18) | Glass card borders                         |
| text-primary     | #F8FAFC                   | Main text on dark surfaces                 |
| text-muted       | #CBD5E1                   | Supporting labels and metadata             |
| success          | #22C55E                   | Present, success, positive confirmation    |
| info             | #3B82F6                   | Late, neutral info, secondary actions      |
| neutral          | #94A3B8                   | Absent, disabled, secondary status         |
| danger           | #EF4444                   | Errors, destructive actions, removal flows |

### Typography

| Style     | Font           | Size    | Weight  |
| --------- | -------------- | ------- | ------- |
| Heading 1 | Inter          | 32-40px | 700     |
| Heading 2 | Inter          | 24-28px | 600     |
| Body      | Inter          | 14-16px | 400-500 |
| Caption   | Inter          | 12px    | 500     |
| Code      | JetBrains Mono | 12-14px | 400     |

### Spacing Scale

The spacing scale should be based on an 8px rhythm with tighter inner card spacing for mobile interactions: 4, 8, 12, 16, 20, 24, 32, 40, 48.

---

## Component Patterns

> **Section summary:** The UI is built around repeatable glass cards, bento grids, and fast one-thumb interactions. New components should fit those patterns before anything more decorative is introduced.

### Buttons

- Primary: amber filled button with high contrast text, used for submit and start-session actions.
- Secondary: glass outline button with subtle border and hover blur.
- Destructive: red filled or red outline button, always paired with confirmation.
- Disabled state: muted fill, reduced opacity, no shadow, no hover elevation.

### Forms

- Input fields: large touch targets, floating or compact labels, strong focus rings, and clear helper text.
- Error messages: inline below the field, concise, and action-oriented.
- Submit buttons: sticky where needed on mobile, with loading and disabled states during async submission.

### Navigation

- Mobile-first bottom navigation or simple top bar depending on role.
- Zonal and admin views can use a sidebar on wider screens, but mobile remains primary.

### Cards / Containers

- Glass cards with 20px radius, subtle blur, white border, and layered gradient backgrounds.
- Bento grids should define the main dashboard layout and allow cards to span multiple columns.

### Modals / Dialogs

- Use bottom sheets for mobile capture flows and centered dialogs for confirmations on desktop.
- Keep actions close to the thumb zone on mobile and avoid excessive nesting.

---

## UX Principles

> **Section summary:** The experience must stay fast in poor network conditions and forgiving for users who are not power users. Every screen should make the next action obvious.

1. Always show loading, syncing, and submission states.
2. Optimise for mobile first, then enhance for tablet and desktop.
3. Keep attendance and first-timer capture to as few taps as possible.
4. Surface sync status clearly so users know when data is local, pending, or submitted.
5. Never hide destructive actions or important changes without confirmation.

---

## Responsive Breakpoints

| Breakpoint | Value  | Target                           |
| ---------- | ------ | -------------------------------- |
| sm         | 640px  | Mobile landscape / small tablets |
| md         | 768px  | Tablet                           |
| lg         | 1024px | Desktop                          |
| xl         | 1280px | Wide screens                     |

---

## Accessibility Requirements

> **Section summary:** Accessibility is a functional requirement, not a nice-to-have. The app should remain usable for a broad age range and device mix.

- All interactive elements must have visible keyboard focus states.
- Colour contrast must meet WCAG AA for text and controls.
- Form labels, helper text, and errors must be programmatically associated.
- Icons must not be the only cue for meaning.
- Bottom sheets and dialogs must trap focus and support escape-to-close.
