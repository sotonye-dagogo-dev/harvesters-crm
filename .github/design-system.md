# Harvesters CRM â€” Design System

> **Status:** Design Specification Locked â€” Ready for Implementation.
> Last reviewed: February 2026

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Identified Issues & Inconsistencies](#2-identified-issues--inconsistencies)
3. [Design Philosophy](#3-design-philosophy)
4. [Proposed Design System Architecture](#4-proposed-design-system-architecture)
5. [Token Reference](#5-token-reference)
6. [Typography System](#6-typography-system)
7. [Layout System](#7-layout-system)
8. [Component Guidelines](#8-component-guidelines)
9. [Glassmorphism Rules](#9-glassmorphism-rules)
10. [Glow Border Strategy](#10-glow-border-strategy)
11. [Motion System](#11-motion-system)
12. [Data Visualization Aesthetic](#12-data-visualization-aesthetic)
13. [Visual Hierarchy Pattern](#13-visual-hierarchy-pattern)
14. [Responsiveness Strategy](#14-responsiveness-strategy)
15. [Implementation Strategy](#15-implementation-strategy)
16. [Design Anti-Patterns](#16-design-anti-patterns)

---

## 1. Current State Audit

### 1.1 Token / Variable Layers

The project currently has **three parallel, partially overlapping token systems** that are not in sync:

| Layer | File | Tokens Defined |
|---|---|---|
| CSS Custom Properties | `app/globals.css` | `--background`, `--foreground`, `--primary`, `--secondary`, `--accent` |
| Tailwind v4 `@theme inline` | `app/globals.css` | `--color-background`, `--color-foreground`, `--color-primary`, `--color-secondary`, `--color-accent`, `--color-church-green`, `--color-warm-brown`, `--color-golden-accent` |
| Ant Design `ConfigProvider` | `providers/AntdProvider.tsx` | `colorPrimary`, `colorSuccess`, `colorWarning`, `colorError`, `colorInfo`, `colorBgBase`, `colorTextBase`, `borderRadius`, `fontFamily` |

**Key observation:** The `@theme inline` block duplicates the CSS property names AND adds new semantic aliases (`church-green`, `warm-brown`, `golden-accent`) for the same hex values. This duplication means any future color change requires edits in multiple places.

### 1.2 Current Color Palette (Light Mode)

| Alias | Hex | Usage |
|---|---|---|
| `--primary` / `church-green` | `#1B4B3E` | Primary brand color; focus rings, CTA backgrounds |
| `--secondary` / `warm-brown` | `#8B7355` | Secondary brand color; rarely used |
| `--accent` / `golden-accent` | `#D4A373` | Subtle warm accent |
| `--background` | `#FFFFFF` | Page background |
| `--foreground` | `#141414` | Body text |

### 1.3 Current Color Palette (Dark Mode)

| Alias | Hex | Tailwind equivalent | Notes |
|---|---|---|---|
| `--primary` | `#22C55E` | `green-500` | **Completely different hue** from light mode primary |
| `--secondary` | `#94A3B8` | `slate-400` | Unrelated to light mode secondary |
| `--accent` | `#FBBF24` | `amber-400` | Different from light mode accent |
| `--background` | `#0F172A` | `slate-900` | â€” |
| `--foreground` | `#F1F5F9` | `slate-100` | â€” |

### 1.4 Raw Tailwind Colors Used Directly in Components

Beyond the custom tokens, raw Tailwind semantic scale values are scattered throughout pages and components. This is the largest source of inconsistency:

| Category | Classes Spotted | Files |
|---|---|---|
| Sidebar / navigation | `bg-indigo-600/700/800/950` | `DashboardLayout.tsx` |
| Card surfaces | `bg-white dark:bg-slate-800`, `dark:bg-gray-800` | Dashboard pages, Card.tsx |
| Page backgrounds | `from-slate-50`, `from-gray-900`, `from-green-50` | Multiple page files |
| Stat card accent colors | `text-blue-600`, `text-green-600`, `text-purple-600`, `text-orange-600` | Dashboard pages |
| Borders | `border-gray-100`, `border-gray-200`, `border-slate-700`, `dark:border-slate-600` | Card.tsx, SearchInput.tsx, LoadingSkeleton.tsx |
| Muted text | `text-gray-600`, `text-gray-500`, `text-gray-400` | PageLayout, Card, multiple pages |

### 1.5 Typography

| Property | Current Value |
|---|---|
| Font Family | Inter (via `next/font/google`) |
| CSS variable | `--font-inter` (declared but only used in `body` class; not forwarded to Ant Design `fontFamily` dynamically) |
| Ant Design `fontFamily` | Hardcoded string `"Inter", -apple-system...` (not referencing CSS var) |
| Font sizes | Uses Ant Design's default typographic scale + Tailwind defaults. No custom scale is defined. |
| Font weights | `font-medium`, `font-semibold`, `font-bold` used directly. No semantic weight token. |

### 1.6 Spacing & Layout

- No custom spacing tokens; relies entirely on Tailwind's default spacing scale.
- Content max-width: `max-w-7xl` used in `AppContent`. Other pages use ad-hoc max-widths (`max-w-4xl`, `max-w-md`).
- Content padding: `p-6` in the main content area â€” consistently applied via `DashboardLayout`.
- Grid patterns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4` found on stat grids. No semantic grid token.

### 1.7 Border Radius

| Tailwind Class | Usage |
|---|---|
| `rounded-xl` | Cards (Card.tsx default) |
| `rounded-2xl` | Some page cards, stat blocks |
| `rounded-3xl` | Landing page content card |
| `rounded-full` | Avatars, toggle buttons |
| `rounded-lg` | Buttons (Ant Design default), some utility divs |
| Ant Design `borderRadius: 6` | Base token applied to all Ant Design components |

The mismatch between Ant Design's `borderRadius: 6` and Tailwind's `rounded-xl` (12px) creates visible inconsistency between custom and Ant Design elements.

### 1.8 Shadow Scale

- `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` applied without a semantic system.
- No naming convention linking shadows to elevation levels.

### 1.9 Animation & Transition

- `.transition-base` utility defined in `globals.css` (`transition: all 200ms ease-in-out`) â€” underused; most components write `transition-all duration-200/300` inline.
- `hover:-translate-y-0.5`, `hover:scale-110`, `hover:scale-[1.02]` used sporadically.
- `prefers-reduced-motion` correctly handled globally in `globals.css`.

### 1.10 Dark Mode Infrastructure

- Uses `next-themes` with `ThemeProvider`.
- `ThemeToggle` manually adds/removes the `dark` class on `document.body` and sets `colorScheme` style.
- `globals.css` uses `@custom-variant dark (&:where(.dark, .dark *))` â€” class-based dark mode strategy.
- Ant Design respects `theme.darkAlgorithm` when `isDark` is true via `AntdProvider`.

---

## 2. Identified Issues & Inconsistencies

### ðŸ”´ Critical â€” Brand Integrity

1. **Sidebar uses `indigo` palette, not brand green.** `DashboardLayout.tsx` sets `bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800` on the sidebar. This has no relationship to the church's brand color (`#1B4B3E`). Every user session is dominated by this sidebar, making `indigo` the de facto brand color despite it being nowhere in the token definitions.

2. **Dark mode primary is a totally different color.** Light mode primary is `#1B4B3E` (deep forest green). Dark mode primary is `#22C55E` (bright lime green). These are not tints/shades of the same hue â€” they are different colors. A proper dark mode should remain on-brand while adjusting for contrast, not swap the brand color entirely.

### ðŸŸ  Major â€” Maintainability

3. **No single source of truth for tokens.** A color change requires edits in at minimum three files: `globals.css` (CSS vars + `@theme inline`), `AntdProvider.tsx` (Ant Design tokens), and potentially any component using a hardcoded hex or raw Tailwind color.

4. **`--color-church-green` / `church-green` Tailwind alias points to `#1B4B3E`**, the same as `--primary`. Two names for the same value adds confusion. Similarly `--color-warm-brown` duplicates `--secondary`. These aliases should be the source, not duplicates.

5. **Ad-hoc raw Tailwind colors for semantic purposes.** `text-blue-600` marks "members," `text-green-600` marks "groups," `text-purple-600` marks "meetings" â€” but these are raw palette values with no semantic name. Changing the "meetings" color in the future would require a grep across all files.

6. **Font family declared in three places** (`globals.css` body rule, Ant Design `fontFamily` token string, and `inter.variable` in layout), none of which reference a shared CSS variable.

### ðŸŸ¡ Minor â€” Polish & Consistency

7. **Border radius mismatch** between Ant Design components (6px) and Tailwind-styled wrappers (12px `rounded-xl`, 8px `rounded-lg`).

8. **Dark mode surface colors are split** between `slate-*` and `gray-*` Tailwind families, resulting in subtly different dark backgrounds on different pages (e.g., `dark:bg-gray-800` in the sidebar header vs. `dark:bg-slate-800` in content cards).

9. **`LoadingSkeleton` and `CardSkeleton`** use `bg-white rounded-lg shadow` (not dark mode aware, not using the card component).

10. **`AppFooter` still says "Church Fellowship CRM"** â€” stale brand copy not reflecting "Harvesters CRM."

---

## 3. Design Philosophy

### Core Direction

The Harvesters CRM UI is built around **data-first minimalism** anchored on the organisation's true brand identity: **sharp black**. The deep forest green (`#1B4B3E`) is repositioned from a dominant primary to a **single controlled accent** â€” used for CTAs, interactive states, and focused highlights. This creates a high-contrast, premium feel appropriate both for church leadership tools and for a system that must scale to complex CRM workflows.

**Design keywords:** Precision Â· Contrast Â· Structure Â· Depth Â· Air Â· Grid Â· Subtle Glow Â· Systematic

### Principles

1. **Brand-black anchor.** Black is not merely a dark mode background â€” it is the foundational brand tone from which all surfaces are built outward. Light mode is clean and minimal; dark mode is deeply black with selective depth.
2. **Single accent.** Only one active accent color at a time â€” Harvesters Emerald. This maintains brand coherence and ensures glow/interactive states carry real visual weight.
3. **Single source of truth.** All design values are defined once in `app/globals.css`. The Ant Design layer and all component classes are derived references â€” never independent definitions.
4. **Semantic over palette.** Components reference `ds-surface-elevated`, not `gray-800`. A full brand refresh requires changing a handful of lines in `globals.css`.
5. **Glassmorphism with restraint.** Glass surfaces appear only on KPI cards and analytics overview blocks. All CRM data screens (tables, forms, dense data) use clear, opaque surfaces for readability.
6. **Glow with intention.** Glow borders are reserved for interaction emphasis: active sidebar items, selected cards, focused inputs, hover states. They are never decorative at rest.
7. **Dark mode as a first-class variant.** Every token has a light and dark value. The accent color remains identical across both themes; only surfaces and text adapt.

---

## 4. Proposed Design System Architecture

### 4.1 Guiding Principles

- **Single source of truth:** All design values (colors, spacing, radii, shadows) are defined **once** in `app/globals.css` using Tailwind v4's `@theme` block. All other layers (Ant Design tokens, component classes) **reference** these variables â€” never hardcode values.
- **Semantic over palette:** Components reference semantic tokens (`ds-surface-elevated`, `ds-brand-accent`) rather than raw palette values (`slate-800`, `indigo-600`). This makes global restyling a single-file operation.
- **Dark mode as a first-class variant:** Every token has a light and dark value. The dark mode should be a legible, on-brand variant of light mode â€” not a separate palette.
- **Ant Design as a rendering layer:** Ant Design tokens are derived from the CSS variables, not defined independently.

### 3.2 Token Architecture

### 4.2 Token Architecture

Tokens are organized into three tiers:

```
Tier 1: Palette Tokens (raw hex values  never used directly in components)
   e.g., --palette-black-soft: #111214

Tier 2: Semantic Design Tokens (reference palette tokens  describe purpose)
   e.g., --ds-surface-elevated: var(--palette-black-soft)
       --ds-brand-accent: var(--palette-emerald-500)

Tier 3: Component Tokens (optional  scoped overrides per component)
   e.g., --ds-sidebar-bg: var(--ds-surface-base)
```

All Tier 2 tokens are exposed as Tailwind color/spacing utilities via the `@theme inline` block, using the `ds-*` prefix: `bg-ds-surface-elevated`, `text-ds-text-subtle`, `border-ds-border-base`, etc.

### 4.3 Semantic Token Categories

#### Brand / Accent
| Token | Purpose |
|---|---|
| `--ds-brand-accent` | Single active accent  Harvesters Emerald; primary CTAs, interactive states |
| `--ds-brand-accent-hover` | Hover state of accent |
| `--ds-brand-accent-subtle` | Low-opacity accent tint for backgrounds |
| `--ds-brand-black` | Foundational brand black  darkest tone |
| `--ds-brand-black-soft` | Slightly lifted brand black  card surfaces in dark mode |
| `--ds-brand-black-elevated` | Most elevated brand black  header, overlay surfaces |

#### Status / Functional
| Token | Purpose |
|---|---|
| `--ds-status-success` | Success states, positive trends |
| `--ds-status-warning` | Warning states |
| `--ds-status-error` | Error, danger states |
| `--ds-status-info` | Informational / neutral states |

#### Surfaces
| Token | Purpose |
|---|---|
| `--ds-surface-base` | Page / app background |
| `--ds-surface-elevated` | Card / panel background |
| `--ds-surface-sunken` | Input / inset background |
| `--ds-surface-overlay` | Modal / drawer background |
| `--ds-surface-sidebar` | Sidebar background |
| `--ds-surface-header` | Topbar background |
| `--ds-surface-glass` | Glassmorphism surface (KPI cards, analytics blocks only) |

#### Text
| Token | Purpose |
|---|---|
| `--ds-text-primary` | Headings and primary body text |
| `--ds-text-secondary` | Supporting text, labels, metadata |
| `--ds-text-subtle` | Placeholder, disabled, muted |
| `--ds-text-inverse` | Text on dark/brand surfaces |
| `--ds-text-link` | Hyperlink color |

#### Borders
| Token | Purpose |
|---|---|
| `--ds-border-base` | Default component borders |
| `--ds-border-strong` | Emphasized / selected borders |
| `--ds-border-subtle` | Dividers, very light separators |
| `--ds-border-glass` | Glassmorphism border |

#### Glow / Depth
| Token | Purpose |
|---|---|
| `--ds-glow-accent-soft` | Hover glow box-shadow |
| `--ds-glow-accent-strong` | Active / selected glow box-shadow |

#### Chart / Categorical
| Token | Purpose |
|---|---|
| `--ds-chart-1` through `--ds-chart-6` | Semantic chart colors  replaces raw `blue-600`, `green-600`, etc. |

#### Shape
| Token | Value | Usage |
|---|---|---|
| `--ds-radius-sm` | `4px` | Tags, badges, chips |
| `--ds-radius-md` | `8px` | Inputs, small buttons |
| `--ds-radius-lg` | `12px` | Buttons, standard components |
| `--ds-radius-xl` | `20px` | Cards, bento blocks |
| `--ds-radius-2xl` | `24px` | Modals, large containers |
| `--ds-radius-full` | `9999px` | Pills, avatars |

> **Ant Design `borderRadius`** will be set to `8` (matching `--ds-radius-md`) for base Ant Design components, while card wrappers and modals will explicitly apply larger custom radii.

#### Elevation / Shadows
| Token | Purpose |
|---|---|
| `--ds-shadow-sm` | Subtle depth (inputs, small elements) |
| `--ds-shadow-md` | Cards, dropdowns |
| `--ds-shadow-lg` | Elevated cards, modals |
| `--ds-shadow-xl` | Floating panels, drawers |

#### Typography
| Token | Purpose |
|---|---|
| `--ds-font-sans` | Primary font stack (Inter) |
| `--ds-font-mono` | Monospace stack (JetBrains Mono  data tables) |

---

## 5. Token Reference

### Light Mode  `:root`

```css
:root {
  /*  Palette  */
  /* Brand Black Scale */
  --palette-black-base:        #0A0A0B;
  --palette-black-soft:        #111214;
  --palette-black-elevated:    #16171A;

  /* Emerald Accent Scale (Harvesters green as single accent) */
  --palette-emerald-900:       #064e3b;
  --palette-emerald-700:       #047857;
  --palette-emerald-600:       #059669;
  --palette-emerald-500:       #10b981;
  --palette-emerald-400:       #34d399;
  --palette-emerald-200:       #a7f3d0;
  --palette-emerald-50:        #ecfdf5;

  /* Neutral Scale */
  --palette-neutral-950:       #0a0a0a;
  --palette-neutral-900:       #0f172a;
  --palette-neutral-800:       #1e293b;
  --palette-neutral-700:       #374151;
  --palette-neutral-600:       #4b5563;
  --palette-neutral-500:       #64748b;
  --palette-neutral-400:       #94a3b8;
  --palette-neutral-300:       #cbd5e1;
  --palette-neutral-200:       #e5e7eb;
  --palette-neutral-100:       #f1f5f9;
  --palette-neutral-50:        #f8f9fb;
  --palette-neutral-0:         #ffffff;

  /*  Brand / Accent  */
  --ds-brand-accent:           var(--palette-emerald-500);
  --ds-brand-accent-hover:     var(--palette-emerald-600);
  --ds-brand-accent-subtle:    var(--palette-emerald-50);
  --ds-brand-black:            var(--palette-black-base);
  --ds-brand-black-soft:       var(--palette-black-soft);
  --ds-brand-black-elevated:   var(--palette-black-elevated);

  /*  Status  */
  --ds-status-success:         #15803d;
  --ds-status-warning:         #b45309;
  --ds-status-error:           #dc2626;
  --ds-status-info:            var(--palette-emerald-700);

  /*  Surfaces  */
  --ds-surface-base:           var(--palette-neutral-50);
  --ds-surface-elevated:       var(--palette-neutral-0);
  --ds-surface-sunken:         var(--palette-neutral-100);
  --ds-surface-overlay:        var(--palette-neutral-0);
  --ds-surface-sidebar:        var(--palette-neutral-0);
  --ds-surface-header:         var(--palette-neutral-0);
  --ds-surface-glass:          rgba(255, 255, 255, 0.70);

  /*  Text  */
  --ds-text-primary:           var(--palette-neutral-900);
  --ds-text-secondary:         var(--palette-neutral-500);
  --ds-text-subtle:            var(--palette-neutral-400);
  --ds-text-inverse:           var(--palette-neutral-0);
  --ds-text-link:              var(--palette-emerald-600);

  /*  Borders  */
  --ds-border-base:            var(--palette-neutral-200);
  --ds-border-strong:          var(--palette-neutral-300);
  --ds-border-subtle:          var(--palette-neutral-100);
  --ds-border-glass:           rgba(255, 255, 255, 0.60);

  /*  Glow  */
  --ds-glow-accent-soft:       0 0 0 1px rgba(16, 185, 129, 0.20);
  --ds-glow-accent-strong:     0 0 20px rgba(16, 185, 129, 0.25);

  /*  Chart / Categorical  */
  --ds-chart-1:                #2563eb;
  --ds-chart-2:                #10b981;
  --ds-chart-3:                #7c3aed;
  --ds-chart-4:                #ea580c;
  --ds-chart-5:                #0891b2;
  --ds-chart-6:                #be185d;

  /*  Shape  */
  --ds-radius-sm:              4px;
  --ds-radius-md:              8px;
  --ds-radius-lg:              12px;
  --ds-radius-xl:              20px;
  --ds-radius-2xl:             24px;
  --ds-radius-full:            9999px;

  /*  Shadows  */
  --ds-shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --ds-shadow-md:  0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --ds-shadow-lg:  0 12px 20px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06);
  --ds-shadow-xl:  0 24px 32px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.07);

  /*  Typography  */
  --ds-font-sans:  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ds-font-mono:  "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
}
```

### Dark Mode  `.dark` (overrides only)

```css
.dark {
  /*  Surfaces  */
  --ds-surface-base:           var(--palette-black-base);
  --ds-surface-elevated:       var(--palette-black-soft);
  --ds-surface-sunken:         var(--palette-black-base);
  --ds-surface-overlay:        var(--palette-black-soft);
  --ds-surface-sidebar:        var(--palette-black-base);
  --ds-surface-header:         var(--palette-black-soft);
  --ds-surface-glass:          rgba(255, 255, 255, 0.04);

  /*  Brand accent stays #10b981  theme-invariant  */
  --ds-brand-accent-subtle:    rgba(16, 185, 129, 0.12);

  /*  Status  */
  --ds-status-success:         #4ade80;
  --ds-status-warning:         #fbbf24;
  --ds-status-error:           #f87171;
  --ds-status-info:            var(--palette-emerald-400);

  /*  Text  */
  --ds-text-primary:           #F8FAFC;
  --ds-text-secondary:         var(--palette-neutral-400);
  --ds-text-subtle:            #475569;
  --ds-text-inverse:           var(--palette-neutral-900);
  --ds-text-link:              var(--palette-emerald-400);

  /*  Borders  */
  --ds-border-base:            rgba(255, 255, 255, 0.08);
  --ds-border-strong:          rgba(255, 255, 255, 0.14);
  --ds-border-subtle:          rgba(255, 255, 255, 0.04);
  --ds-border-glass:           rgba(255, 255, 255, 0.08);

  /*  Glow  */
  --ds-glow-accent-soft:       0 0 0 1px rgba(16, 185, 129, 0.25);
  --ds-glow-accent-strong:     0 0 20px rgba(16, 185, 129, 0.30);

  /*  Chart  brighter for dark backgrounds  */
  --ds-chart-1:                #60a5fa;
  --ds-chart-2:                #34d399;
  --ds-chart-3:                #a78bfa;
  --ds-chart-4:                #fb923c;
  --ds-chart-5:                #22d3ee;
  --ds-chart-6:                #f472b6;

  /*  Shadows  */
  --ds-shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.30);
  --ds-shadow-md:  0 4px 8px -2px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.35);
  --ds-shadow-lg:  0 12px 20px -4px rgb(0 0 0 / 0.60), 0 4px 8px -4px rgb(0 0 0 / 0.40);
  --ds-shadow-xl:  0 24px 32px -8px rgb(0 0 0 / 0.70), 0 8px 16px -6px rgb(0 0 0 / 0.50);
}
```

### Tailwind Utility Exposure  `@theme inline`

```css
@theme inline {
  /* Brand */
  --color-ds-brand-accent:          var(--ds-brand-accent);
  --color-ds-brand-accent-hover:    var(--ds-brand-accent-hover);
  --color-ds-brand-accent-subtle:   var(--ds-brand-accent-subtle);
  --color-ds-brand-black:           var(--ds-brand-black);
  --color-ds-brand-black-soft:      var(--ds-brand-black-soft);
  --color-ds-brand-black-elevated:  var(--ds-brand-black-elevated);

  /* Status */
  --color-ds-status-success:        var(--ds-status-success);
  --color-ds-status-warning:        var(--ds-status-warning);
  --color-ds-status-error:          var(--ds-status-error);
  --color-ds-status-info:           var(--ds-status-info);

  /* Surfaces */
  --color-ds-surface-base:          var(--ds-surface-base);
  --color-ds-surface-elevated:      var(--ds-surface-elevated);
  --color-ds-surface-sunken:        var(--ds-surface-sunken);
  --color-ds-surface-overlay:       var(--ds-surface-overlay);
  --color-ds-surface-sidebar:       var(--ds-surface-sidebar);
  --color-ds-surface-header:        var(--ds-surface-header);
  --color-ds-surface-glass:         var(--ds-surface-glass);

  /* Text */
  --color-ds-text-primary:          var(--ds-text-primary);
  --color-ds-text-secondary:        var(--ds-text-secondary);
  --color-ds-text-subtle:           var(--ds-text-subtle);
  --color-ds-text-inverse:          var(--ds-text-inverse);
  --color-ds-text-link:             var(--ds-text-link);

  /* Borders */
  --color-ds-border-base:           var(--ds-border-base);
  --color-ds-border-strong:         var(--ds-border-strong);
  --color-ds-border-subtle:         var(--ds-border-subtle);
  --color-ds-border-glass:          var(--ds-border-glass);

  /* Charts */
  --color-ds-chart-1:               var(--ds-chart-1);
  --color-ds-chart-2:               var(--ds-chart-2);
  --color-ds-chart-3:               var(--ds-chart-3);
  --color-ds-chart-4:               var(--ds-chart-4);
  --color-ds-chart-5:               var(--ds-chart-5);
  --color-ds-chart-6:               var(--ds-chart-6);

  /* Radii */
  --radius-ds-sm:     var(--ds-radius-sm);
  --radius-ds-md:     var(--ds-radius-md);
  --radius-ds-lg:     var(--ds-radius-lg);
  --radius-ds-xl:     var(--ds-radius-xl);
  --radius-ds-2xl:    var(--ds-radius-2xl);
  --radius-ds-full:   var(--ds-radius-full);

  /* Shadows */
  --shadow-ds-sm:     var(--ds-shadow-sm);
  --shadow-ds-md:     var(--ds-shadow-md);
  --shadow-ds-lg:     var(--ds-shadow-lg);
  --shadow-ds-xl:     var(--ds-shadow-xl);

  /* Typography */
  --font-ds-sans:     var(--ds-font-sans);
  --font-ds-mono:     var(--ds-font-mono);
}
```

---

## 6. Typography System

### Fonts

| Role | Stack | Usage |
|---|---|---|
| Sans (primary) | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | All UI text, headings, labels |
| Mono | `"JetBrains Mono", "Fira Code", monospace` | Data tables, numeric values  loaded via `next/font/google` |

### Scale

| Level | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| Display | 3642px | 700 | `-0.03em` | Hero numbers, large stat values |
| H1 | 30px / `text-3xl` | 700 | `-0.025em` | Page titles |
| H2 | 24px / `text-2xl` | 600 | `-0.02em` | Section headers |
| H3 | 20px / `text-xl` | 600 | `-0.01em` | Card headers, sub-sections |
| Body | 15px / `text-[15px]` | 400 | `0` | Standard prose |
| Small | 13px / `text-[13px]` | 400 | `0` | Labels, form hints |
| Meta | 12px / `text-xs` | 400500 | `0.01em` | Timestamps, secondary metadata |

### Rules

- Tight letter-spacing on all headings (`-0.01em` to `-0.03em`)
- **Never use pure white (`#FFFFFF`) for body text in dark mode**  use `--ds-text-primary` (`#F8FAFC`)
- Semi-bold (`font-semibold`) for section headers, not bold
- Mono font (`font-ds-mono`) for all numerical data cells in tables
- Line height: `1.5` body  `1.2` headings  `1.8` dense tables

---

## 7. Layout System

### App Shell

```
+--------------------------------------------------+
|  Sidebar (240px / collapsed 80px) |  Main Area  |
|                                   +-------------|
|  - Brand mark + logo              |  Top Header |
|  - Navigation items               +-------------|
|  - Role badge                     |  Content    |
|  - Collapse toggle                |  (scrolls)  |
+-----------------------------------+-------------+
```

| Property | Desktop | Tablet | Mobile |
|---|---|---|---|
| Sidebar width | 240px | Hidden  Drawer | Hidden  Drawer |
| Sidebar collapsed | 80px |  |  |
| Outer padding | 24px | 16px | 12px |
| Content max-width | none (full) |  |  |

### Bento Grid (Analytics / Dashboard KPI Sections)

The KPI and analytics sections use a **12-column bento grid** for visual hierarchy. Tables, forms and dense CRM data screens do **not** use bento  they use standard full-width layouts.

```
Desktop (12-col):
+------------------+------------------+---------+---------+
|  Large Block     |  Large Block     |   SM    |   SM    |
|   (span-6)       |   (span-6)       | (span3) | (span3) |
+-------+----------+------------------+---------+---------+
|  SM   |  Wide Analytics Block (span-9)                  |
|(span3)|                                                  |
+-------+--------------------------------------------------+
```

**Bento rules:**
- Corner radius: `--ds-radius-xl` (20px) on all bento cells
- Mixed heights create visual rhythm  KPI blocks min-height `120px`, analytics blocks min-height `240px`
- Consistent `gap-4` (16px) spacing
- Tablet: 6-col grid  Mobile: single column stack

### Page Anatomy

Every authenticated page follows this vertical order  no mixing or reordering:

```
1. Page Header      Title (H1) + context actions (filter, export, CTA)
2. KPI Bento Row    3-5 stat cards (glass surface variant)
3. Primary Data     Main table / list / form (opaque, no glass)
4. Analytics Row    Charts, trends (may use glass card)
5. Secondary        Activity feed, quick actions, related info
```

---

## 8. Component Guidelines

### Ant Design Token Bridge

The `ConfigProvider` reads CSS variables at runtime via `getComputedStyle`. No hardcoded values:

```tsx
// In providers/AntdProvider.tsx
const getCSSVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// In ConfigProvider theme.token:
{
  colorPrimary:  getCSSVar('--ds-brand-accent'),
  colorBgBase:   getCSSVar('--ds-surface-base'),
  colorTextBase: getCSSVar('--ds-text-primary'),
  borderRadius:  8,
  fontFamily:    getCSSVar('--ds-font-sans'),
  colorSuccess:  getCSSVar('--ds-status-success'),
  colorWarning:  getCSSVar('--ds-status-warning'),
  colorError:    getCSSVar('--ds-status-error'),
}
```

Because `ConfigProvider` is client-side, CSS vars are always accessible. Theme switching is automatic  no `isDark` branch needed for token derivation.

---

### Sidebar

| Property | Value |
|---|---|
| Background | `bg-ds-surface-sidebar` (white light / `#0A0A0B` dark) |
| Border-right | `1px solid var(--ds-border-base)` |
| Active nav item | `bg-ds-brand-accent-subtle` + `text-ds-brand-accent` + `box-shadow: var(--ds-glow-accent-soft)` |
| Hover nav item | `bg-ds-surface-sunken` |
| Text | `text-ds-text-primary` (both modes  sidebar is theme-aware) |

> The sidebar is **no longer dark-forced**. It respects the active theme. In dark mode the black background naturally creates a premium sidebar. In light mode it is a clean white panel. This removes the brand-breaking `indigo` sidebar.

---

### Cards

Four variants  all with `--ds-radius-xl` (20px) corners:

| Variant | When to Use | Style |
|---|---|---|
| **Standard** | Tables, CRM data, forms | `bg-ds-surface-elevated`, `border-ds-border-base`, `shadow-ds-md` |
| **Glass** | KPI stats, analytics overview | `bg-ds-surface-glass`, `backdrop-filter: blur(12px)`, `border-ds-border-glass` |
| **Elevated** | Featured content | `bg-ds-surface-elevated`, `shadow-ds-lg` |
| **Glow-active** | Selected / expanded | Standard + `box-shadow: var(--ds-glow-accent-strong)` |

**StatCard color migration:**

| Stat type | Old class | New class |
|---|---|---|
| Members / Users | `text-blue-600 dark:text-blue-400` | `text-ds-chart-1` |
| Groups | `text-green-600 dark:text-green-400` | `text-ds-chart-2` |
| Meetings | `text-purple-600 dark:text-purple-400` | `text-ds-chart-3` |
| Interactions | `text-orange-600 dark:text-orange-400` | `text-ds-chart-4` |
| Reports |  | `text-ds-chart-5` |

---

### Buttons

| Variant | Style |
|---|---|
| **Primary** | `bg-ds-brand-accent`  white text  `rounded-ds-lg` (12px)  subtle inner shadow |
| **Secondary** | Transparent  `border-ds-border-base`  hover: `box-shadow: var(--ds-glow-accent-soft)` |
| **Ghost** | Text only  `text-ds-text-secondary`  hover: `text-ds-brand-accent` |
| **Danger** | `bg-ds-status-error`  white text |

---

### Tables

Tables are CRM-critical. Clarity above all. Never apply glass.

```
Light mode:  bg-ds-surface-elevated  border-ds-border-base
Dark mode:   background #111214  border rgba(255,255,255,0.06)
```

- Wrapper: `rounded-ds-lg` (12px), `border-ds-border-base`, `overflow-hidden`
- Zebra rows: alternating `surface-base` / `surface-elevated` (very subtle)
- Row hover: `bg-ds-brand-accent-subtle`
- Sticky column headers
- Mono font for all numeric columns (`font-ds-mono`)
- Horizontal scroll on mobile/tablet

---

### Forms / Inputs

```css
input, select, textarea {
  height: 44px;                         /* WCAG minimum touch target */
  border-radius: var(--ds-radius-lg);   /* 12px */
  border: 1px solid var(--ds-border-base);
  background: var(--ds-surface-sunken);
  font-size: 15px;
}

input:focus {
  border-color: var(--ds-brand-accent);
  box-shadow: var(--ds-glow-accent-soft);
  outline: none;
}
```

Labels are always **above inputs**, never inline-only or placeholder-only.

---

### Modals

```css
.ds-modal {
  border-radius: var(--ds-radius-2xl);
}
.ds-modal-header {
  background: var(--ds-surface-glass);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ds-border-glass);
}
```

Motion: `opacity(01)` + `scale(0.971.00)`, 200ms ease-in-out.

---

### Theme Toggle

- Rounded pill 40×40px
- `bg-ds-surface-elevated`  `border-ds-border-base`
- Hover: `box-shadow: var(--ds-glow-accent-soft)`

---

## 9. Glassmorphism Rules

### Apply only to

- KPI / stat cards (in bento section)
- Analytics overview blocks
- Modal headers

### Never apply to

- Data tables
- Form fields and inputs
- Dense CRM list screens
- Sidebar navigation items

### Implementation

**Dark mode:**
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

**Light mode:**
```css
background: rgba(255, 255, 255, 0.70);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.60);
```

A `@layer utilities` class `.glass-surface` will be defined in `globals.css` for one-word application.

Glass surfaces require a non-flat parent background to produce the blur effect meaningfully. Ensure parent containers have a gradient or color contrast.

---

## 10. Glow Border Strategy

### Apply to

| Context | Token |
|---|---|
| Active sidebar nav item | `--ds-glow-accent-soft` |
| Selected / active card | `--ds-glow-accent-strong` |
| Hovered interactive card | `--ds-glow-accent-soft` |
| Focused input | `--ds-glow-accent-soft` |
| Active filter button | `--ds-glow-accent-soft` |

### Never apply to

- Decorative elements at rest
- All cards simultaneously
- Table rows
- Static text or headings

### CSS Classes (defined in `globals.css`)

```css
@layer utilities {
  .ds-hover-glow:hover {
    box-shadow: var(--ds-glow-accent-soft);
    border-color: var(--ds-brand-accent);
    transition: box-shadow 200ms ease-in-out, border-color 200ms ease-in-out;
  }

  .ds-glow-active {
    box-shadow: var(--ds-glow-accent-strong);
    border-color: var(--ds-brand-accent);
  }
}
```

---

## 11. Motion System

### Principles

- Motion is **purposeful**  it reinforces interaction, not decoration
- Duration: 150250ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- Never use bounce, overshoot, or looping decorative animations

### Standard Transitions

| Context | Effect | Duration |
|---|---|---|
| Card hover | `translateY(-2px)` + soft glow | 200ms |
| Sidebar collapse | width transition | 250ms |
| Modal open | `scale(0.971.0)` + `opacity(01)` | 200ms |
| Button press | `scale(0.98)` | 100ms |
| Loading shimmer | animated gradient | 1500ms loop |

### Skeleton Loading Shimmer

```css
@keyframes ds-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.ds-skeleton {
  background: linear-gradient(
    90deg,
    var(--ds-surface-sunken) 25%,
    rgba(16, 185, 129, 0.06) 50%,
    var(--ds-surface-sunken) 75%
  );
  background-size: 200% 100%;
  animation: ds-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--ds-radius-md);
}
```

`prefers-reduced-motion` suppression is already handled globally in `globals.css` and must be preserved.

---

## 12. Data Visualization Aesthetic

- Use `--ds-chart-1` through `--ds-chart-6` for all chart series
- Area fills: gradient from accent color at `1.0` opacity (top) down to `0.0` (baseline)
- Bars: rounded top corners `border-radius: 4px`
- Lines: smooth curves, `strokeWidth: 2`
- Grid lines: `--ds-border-subtle`  faint horizontal lines only, no vertical
- Axis labels: `--ds-text-secondary`, `font-ds-mono` for numerical values

**Dark mode chart rules:**
- Reduce grid opacity further: `rgba(255,255,255,0.04)`
- Use the brighter dark-mode chart token variants (auto via CSS var)
- No heavy chart borders  let data visually lead

---

## 13. Visual Hierarchy Pattern

Every page follows this top-to-bottom structure  non-negotiable:

```
1. Page Header          H1 title + context/date + primary CTA button
                        <- Section divider: 2px accent-colored underline

2. KPI Bento Section    3-5 stat cards  glass surface  bento grid
                        <- Mixed card sizes for visual weight

3. Primary Data         Main table, list, or form
                        <- Standard card  no glass  full width

4. Analytics Row        Charts, trends, sparklines
                        <- Standard or glass card  scrollable on mobile

5. Secondary Tools      Activity logs, quick actions, related info
                        <- Standard card  no glass
```

**Reusable section header pattern:**

```tsx
<div className="flex items-center gap-3 mb-4">
  <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">
    Section Title
  </h2>
  <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
</div>
```

---

## 14. Responsiveness Strategy

### Breakpoints

| Name | Range | Tailwind prefix |
|---|---|---|
| Mobile | `< 768px` | (default) |
| Tablet | `7681024px` | `md:` |
| Desktop | `> 1024px` | `lg:` |

### Rules

- **Sidebar:** Always hidden on mobile/tablet  rendered as Ant Design `<Drawer>`. On desktop, collapsible 240px  80px.
- **Bento grids:** 12-col desktop  6-col tablet  single-col mobile
- **Charts:** Horizontally scrollable wrapper on mobile (`overflow-x: auto`)
- **Tables:** Horizontal scroll container on mobile/tablet
- **Outer padding:** `p-6` desktop  `p-4` tablet  `p-3` mobile

---

## 15. Implementation Strategy

### 15.1 File Structure After Implementation

```
app/
  globals.css                  <- ALL tokens (palette + semantic + @theme inline)
                                  Glass, glow, and skeleton utility classes
                                  Base styles and accessibility

providers/
  AntdProvider.tsx             <- CSS var bridge  zero hardcoded values

lib/
  design-system/
    tokens.ts                  <- TS constants mirroring CSS token names (for dynamic styles)
    antd-theme.ts              <- Ant Design token builder helper
```

### 15.2 `globals.css` Section Order

```
1. Imports
2. Palette tokens (:root)
3. Semantic tokens  light (:root)
4. Semantic tokens  dark override (.dark)
5. @theme inline (Tailwind utility exposure)
6. Base styles (body, html, box-sizing)
7. Utilities: .glass-surface .ds-hover-glow .ds-skeleton
8. Component-scope overrides (Ant switch, scrollbar)
9. Accessibility and motion
```

### 15.3 Rollout Order

1. **`globals.css`**  Full palette + semantic tokens + @theme inline + utility classes
2. **`lib/design-system/tokens.ts`** + **`antd-theme.ts`**  TS / Ant Design bridges
3. **`providers/AntdProvider.tsx`**  CSS var bridge, remove all hardcoded tokens
4. **`DashboardLayout.tsx`**  Fix sidebar (remove indigo), apply `ds-*` tokens, remove forced dark theme
5. **`components/ui/*`**  All shared primitives (Card variants, Button, PageLayout, LoadingSkeleton, ThemeToggle)
6. **Auth pages**  Login, register, forgot-password, reset-password
7. **Dashboard pages**  Apply bento grid to KPI sections on all role dashboards
8. **All remaining pages**  Replace ad-hoc Tailwind colors with `ds-*` tokens
9. **Feature components**  Last, as they inherit from updated shared UI layer

### 15.4 Token Migration Map

| Current Pattern | Replaced With |
|---|---|
| `bg-indigo-600/700/800` (sidebar) | `bg-ds-surface-sidebar` |
| `bg-white dark:bg-slate-800` / `dark:bg-gray-800` | `bg-ds-surface-elevated` |
| `from-slate-50 dark:from-gray-900` (page bg) | `bg-ds-surface-base` |
| `text-gray-900 dark:text-white` | `text-ds-text-primary` |
| `text-gray-600 dark:text-gray-400` | `text-ds-text-secondary` |
| `text-gray-500 dark:text-gray-400` | `text-ds-text-subtle` |
| `border-gray-100 dark:border-slate-700` | `border-ds-border-base` |
| `text-blue-600 dark:text-blue-400` (stat) | `text-ds-chart-1` |
| `text-green-600 dark:text-green-400` (stat) | `text-ds-chart-2` |
| `text-purple-600 dark:text-purple-400` (stat) | `text-ds-chart-3` |
| `text-orange-600 dark:text-orange-400` (stat) | `text-ds-chart-4` |
| `bg-church-primary` / `text-church-primary` | `bg-ds-brand-accent` / `text-ds-brand-accent` |
| `rounded-xl` (cards) | `rounded-[var(--ds-radius-xl)]` |
| `rounded-lg` (buttons, inputs) | `rounded-[var(--ds-radius-lg)]` |
| `shadow-lg hover:shadow-xl` | `shadow-ds-md hover:shadow-ds-lg` |
| `outline: 2px solid var(--primary)` | `outline: 2px solid var(--ds-brand-accent)` |

---

## 16. Design Anti-Patterns

Explicitly prohibited in this codebase:

| Anti-pattern | Why |
|---|---|
| Glow on every card at rest | Glow loses emphasis value  reserved for interaction states only |
| Glass on tables or forms | Glass impairs readability in dense data contexts |
| Multiple concurrent accent colors | Single accent rule  Harvesters Emerald only |
| Inconsistent radius values across components | Use `--ds-radius-*` tokens exclusively |
| Raw Tailwind color classes in component logic | Use `ds-*` semantic token classes only |
| Pure white `#FFFFFF` for body text in dark mode | Use `--ds-text-primary` (`#F8FAFC`) |
| Heavy drop shadows in dark mode | Use glow for depth; heavy shadows are invisible on dark surfaces |
| Low-contrast text (e.g. `gray-400` on pure black) | Verify 4.5:1 WCAG AA ratio at all times |
| Crowded KPI rows (6+ stats, all identical size) | Max 5 KPIs per bento row with varied sizing |
| Forcing sidebar to dark regardless of active theme | Sidebar must be theme-aware  remove `theme="dark"` from Ant Design `<Sider>` |
| `dark:` inline overrides for color in component classes | Color adaptation is handled entirely by semantic token layer |

---

> **Implementation begins** with `globals.css` (token foundation)  `AntdProvider.tsx`  `DashboardLayout.tsx`.
