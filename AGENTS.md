# Styling in Koobiq Design System. Guide for AI Agents

This document provides guidelines for LLMs and AI agents on how to work with design tokens provided by the Koobiq Design System.
It focuses on styling, theming, and the correct usage of design tokens.

## 1. Core Philosophy

*   **CSS Variables are the API**: Styling should be done almost exclusively using CSS variables (custom properties) provided by the system.
*   **Global over Component**: Component-specific tokens (e.g., `--kbq-button-height`) are **deprecated**. Always use global semantic tokens (e.g., `--kbq-size-xl`).
*   **Semantic Naming**: Tokens are named based on their semantic function (e.g., `error`, `success`, `contrast`, `theme`) rather than raw values (e.g., `red`, `blue`).

## 2. Variable Naming Convention

The general pattern for CSS variables is:

```
--kbq-[category]-[semantic-name]-[state/variant]
```

*   **Prefix**: `--kbq-`
*   **Category**: `background`, `foreground`, `line`, `icon`, `size`, `typography`, `shadow`.
*   **Semantic Name**: `theme` (brand), `contrast` (neutral), `error`, `success`, `warning`.
*   **Variant** (Optional): `secondary`, `tertiary`, `fade`, `hover`.

### Semantic Roles Definition

*   **Theme**: Represents the primary brand identity. Used for active states (toggles, checkboxes), links, selected options and key interactive elements.
*   **Contrast**: The foundation of the UI. Neutral colors (grays, black, white) used for text, borders, backgrounds, and secondary actions. Used for primary actions (buttons).
*   **Error**: Critical issues, destructive actions, or validation failures.
*   **Success**: Successful completion of tasks or valid states.
*   **Warning**: Caution, non-critical alerts, or attention requirements.
*   **On contrast**: Colors intended to be used on top --kbq-background-contrast for text, icons and lines. Adapts to ensure readability on both light and dark themes.
*   **White**: Bright in both themes. Used on colored backgrounds (e.g., --kbq-background-theme, --kbq-background-success).
*   **Night**: Dark in both themes.

## 3. Color System

Colors are context-aware and switch automatically based on the theme (Light/Dark). 

### Backgrounds (`--kbq-background-...`)
Background color for element containers, cards, and surfaces.

| Variable | Description |
| :--- | :--- |
| **Base** | |
| `--kbq-background-bg` | Main page background (Default: White). |
| `--kbq-background-bg-secondary` | Secondary background (e.g., sidebar, light gray areas). |
| `--kbq-background-bg-tertiary` | Tertiary background. |
| `--kbq-background-night` | Dark background for specific "night" mode elements. Dim background both in light and dark themes. |
| `--kbq-background-card` | Background for cards and elevated surfaces (Pure white). Same as bg in light theme, subtle contrast in dark theme. |
| `--kbq-background-transparent` | Transparent background. |
| **Theme (Brand)** | |
| `--kbq-background-theme` | Primary brand color background (Solid). Used in checkboxes, radio buttons, toggle switches. |
| `--kbq-background-theme-fade` | Faded brand background (lighter). |
| `--kbq-background-theme-less` | Very subtle brand background. Selected state background for list, tree items or table rows. |
| **Contrast (Neutral)** | |
| `--kbq-background-contrast` | Primary button background. Highest contrast in light and dark themes |
| `--kbq-background-contrast-fade` | Faded neutral background. Default button background |
| `--kbq-background-contrast-less` | Very subtle neutral background. In multi-select mode: checked rows, checked list or tree items. Alert container. |
| **Error** | |
| `--kbq-background-error` | Error state background (Solid). |
| `--kbq-background-error-fade` | Faded error background. |
| `--kbq-background-error-less` | Very subtle error background. Alert container.|
| **Success** | |
| `--kbq-background-success` | Success state background (Solid). |
| `--kbq-background-success-fade` | Faded success background. |
| `--kbq-background-success-less` | Very subtle success background. Alert container. |
| **Warning** | |
| `--kbq-background-warning` | Warning state background (Solid). |
| `--kbq-background-warning-fade` | Faded warning background. |
| `--kbq-background-warning-less` | Very subtle warning background. Alert container. |
| **Overlays** | |
| `--kbq-background-overlay` | Dafault backdrop for modals. |
| `--kbq-background-overlay-inverse` | Loading overlay. |
| `--kbq-background-overlay-error` | Error-tinted backdrop. Invalid dropzone on dragover. |
| `--kbq-background-overlay-theme` | Theme-tinted backdrop. Allowed state of dropzone on dragover. |

### Foregrounds (`--kbq-foreground-...`)
Used for text color.

| Variable | Description |
| :--- | :--- |
| **White** | |
| `--kbq-foreground-white` | White text (used on colored backgrounds, e.g., on background-theme, on background-error). |
| `--kbq-foreground-white-secondary` | Secondary white text (lower opacity). |
| **Theme (Brand)** | |
| `--kbq-foreground-theme` | Links colored text. |
| `--kbq-foreground-theme-secondary` | Secondary brand colored text. |
| **Contrast (Neutral)** | |
| `--kbq-foreground-contrast` | Primary text color (High contrast). |
| `--kbq-foreground-on-contrast` | Text color on top of contrast background. |
| `--kbq-foreground-contrast-secondary` | Secondary text, captions, hints. |
| `--kbq-foreground-contrast-tertiary` | Tertiary text (disabled/subtle). |
| **Error** | |
| `--kbq-foreground-error` | Error text color. |
| `--kbq-foreground-error-secondary` | Secondary error text. |
| `--kbq-foreground-error-tertiary` | Tertiary error text. |
| `--kbq-foreground-error-less` | Subtle error text. |
| **Success** | |
| `--kbq-foreground-success` | Success text color. |
| `--kbq-foreground-success-secondary` | Secondary success text. |
| `--kbq-foreground-success-less` | Subtle success text. |
| **Warning** | |
| `--kbq-foreground-warning` | Warning text color. |
| `--kbq-foreground-warning-secondary` | Secondary warning text. |
| **Visited** | |
| `--kbq-foreground-visited` | Visited link color. |

### Icons (`--kbq-icon-...`)
Icon fill.

| Variable | Description |
| :--- | :--- |
| **White** | |
| `--kbq-icon-white` | Icons on colored backgrounds (e.g., on background-theme, background-error). |
| **Theme (Brand)** | |
| `--kbq-icon-theme` | Brand colored icon, icons with links. |
| `--kbq-icon-theme-fade` | Faded brand icon. |
| **Contrast (Neutral)** | |
| `--kbq-icon-contrast` | High contrast icons. |
| `--kbq-icon-contrast-fade` | Faded neutral icon |
| `--kbq-icon-on-contrast` | Icon color on background-contrast |
| **States** | |
| `--kbq-icon-error` | Error icon. |
| `--kbq-icon-success` | Success icon. |
| `--kbq-icon-warning` | Warning icon. |
| `--kbq-icon-visited` | Visited state icon. |

### Lines / Borders (`--kbq-line-...`)
Used for borders and dividers.

| Variable | Description |
| :--- | :--- |
| **Theme (Brand)** | |
| `--kbq-line-theme` | Brand colored line. |
| `--kbq-line-theme-fade` | Faded brand line, also links underline color |
| `--kbq-line-theme-less` | Subtle brand line. |
| **Contrast (Neutral)** | |
| `--kbq-line-contrast` | High contrast borders. |
| `--kbq-line-contrast-fade` | Faded border color, used for input box borders. |
| `--kbq-line-contrast-less` | Very subtle border color, used for table, list, tree item, section separators. |
| **Error** | |
| `--kbq-line-error` | Error border. |
| `--kbq-line-error-fade` | Faded error border. |
| **Success** | |
| `--kbq-line-success` | Success border. |
| `--kbq-line-success-fade` | Faded success border. |
| **Warning** | |
| `--kbq-line-warning` | Warning border. |
| `--kbq-line-warning-fade` | Faded warning border. |
| **Visited** | |
| `--kbq-line-visited` | Visited state line. Used in visited links. |
| **Focus** | |
| `--kbq-line-focus` | Focus ring color. |
| `--kbq-line-focus-theme` | Focused theme line. |
| `--kbq-line-focus-error` | Focused error line. |
| **Disabled** | |
| `--kbq-line-disabled` | Disabled border color. |

### Interaction States (`--kbq-states-...`)
Used for hover, active, and disabled states.

| Variable | Description |
| :--- | :--- |
| **Background States** | |
| `--kbq-states-background-theme-hover` | Hover on theme background. |
| `--kbq-states-background-theme-active` | Active on theme background. |
| `--kbq-states-background-theme-fade-hover` | Hover on faded theme background. |
| `--kbq-states-background-theme-fade-active` | Active on faded theme background. |
| `--kbq-states-background-theme-less-hover` | Hover on subtle theme background. |
| `--kbq-states-background-theme-less-active` | Active on subtle theme background. |
| `--kbq-states-background-contrast-hover` | Hover on contrast background. |
| `--kbq-states-background-contrast-active` | Active on contrast background. |
| `--kbq-states-background-contrast-fade-hover` | Hover on faded contrast background. |
| `--kbq-states-background-contrast-fade-active` | Active on faded contrast background. |
| `--kbq-states-background-contrast-less-hover` | Hover on subtle contrast background. |
| `--kbq-states-background-contrast-less-active` | Active on subtle contrast background. |
| `--kbq-states-background-error-hover` | Hover on error background. |
| `--kbq-states-background-error-active` | Active on error background. |
| `--kbq-states-background-error-fade-hover` | Hover on faded error background. |
| `--kbq-states-background-error-fade-active` | Active on faded error background. |
| `--kbq-states-background-error-less-hover` | Hover on subtle error background. |
| `--kbq-states-background-error-less-active` | Active on subtle error background. |
| `--kbq-states-background-success-hover` | Hover on success background. |
| `--kbq-states-background-success-active` | Active on success background. |
| `--kbq-states-background-success-fade-hover` | Hover on faded success background. |
| `--kbq-states-background-success-fade-active` | Active on faded success background. |
| `--kbq-states-background-success-less-hover` | Hover on subtle success background. |
| `--kbq-states-background-success-less-active` | Active on subtle success background. |
| `--kbq-states-background-warning-fade-hover` | Hover on faded warning background. |
| `--kbq-states-background-warning-fade-active` | Active on faded warning background. |
| `--kbq-states-background-warning-less-hover` | Hover on subtle warning background. |
| `--kbq-states-background-warning-less-active` | Active on subtle warning background. |
| `--kbq-states-background-disabled` | Disabled state background. |
| `--kbq-states-background-transparent-hover` | Hover on transparent. |
| `--kbq-states-background-transparent-active` | Active on transparent. |
| **Foreground States** | |
| `--kbq-states-foreground-theme-hover` | Hover on theme text. |
| `--kbq-states-foreground-theme-active` | Active on theme text. |
| `--kbq-states-foreground-visited-hover` | Hover on visited link. |
| `--kbq-states-foreground-visited-active` | Active on visited link. |
| `--kbq-states-foreground-disabled` | Disabled text color. |
| **Icon States** | |
| `--kbq-states-icon-theme-hover` | Hover on theme icon. |
| `--kbq-states-icon-theme-active` | Active on theme icon. |
| `--kbq-states-icon-contrast-hover` | Hover on contrast icon. |
| `--kbq-states-icon-contrast-active` | Active on contrast icon. |
| `--kbq-states-icon-contrast-fade-hover` | Hover on faded contrast icon. |
| `--kbq-states-icon-contrast-fade-active` | Active on faded contrast icon. |
| `--kbq-states-icon-error-hover` | Hover on error icon. |
| `--kbq-states-icon-error-active` | Active on error icon. |
| `--kbq-states-icon-success-hover` | Hover on success icon. |
| `--kbq-states-icon-success-active` | Active on success icon. |
| `--kbq-states-icon-warning-hover` | Hover on warning icon. |
| `--kbq-states-icon-warning-active` | Active on warning icon. |
| `--kbq-states-icon-visited-hover` | Hover on visited icon. |
| `--kbq-states-icon-visited-active` | Active on visited icon. |
| `--kbq-states-icon-disabled` | Disabled icon color. |
| **Opacity** | |
| `--kbq-opacity-disabled` | Opacity for disabled elements. |

## 4. Typography

**Recommended Approach**: Use ready-made CSS classes or SCSS extends instead of individual variables to avoid redundant code.
Pattern for classes: `kbq-[style]` (e.g., `kbq-title`, `kbq-display-big-strong`).
Pattern for SCSS extend: `@extend .kbq-[style]`.

**Full List of Typography Classes**:
*   **Headings**: `kbq-headline`, `kbq-title`, `kbq-subheading`, `kbq-navbar-title`. UI headings.
*   **Display**: `kbq-display-big`, `kbq-display-big-strong`, `kbq-display-normal`, `kbq-display-normal-strong`, `kbq-display-compact`, `kbq-display-compact-strong`. Huge landing page headings, hero titles. 
*   **Text**: `kbq-text-big`, `kbq-text-big-medium`, `kbq-text-big-strong`, `kbq-text-normal`, `kbq-text-normal-medium`, `kbq-text-normal-strong`, `kbq-text-compact`, `kbq-text-compact-medium`, `kbq-text-compact-strong`. Standard text styles. 'normal' variant is the default. 'compact' variant is for small text, like captions.
*   **Caps**: `kbq-caps-big`, `kbq-caps-big-strong`, `kbq-caps-normal`, `kbq-caps-normal-strong`, `kbq-caps-compact`, `kbq-caps-compact-strong`. Uppercase text for abbreviations, acronyms or high emphasis.
*   **Mono**: `kbq-mono-big`, `kbq-mono-big-strong`, `kbq-mono-normal`, `kbq-mono-normal-medium`, `kbq-mono-normal-strong`, `kbq-mono-compact`, `kbq-mono-compact-strong`, `kbq-mono-codeblock`. Monospaced text for code, hashes.
*   **Tabular**: `kbq-tabular-big`, `kbq-tabular-big-strong`, `kbq-tabular-normal`, `kbq-tabular-normal-strong`, `kbq-tabular-compact`, `kbq-tabular-compact-strong`. Tabular numbers in tables.
*   **Italic**: `kbq-italic-big`, `kbq-italic-big-strong`, `kbq-italic-normal`, `kbq-italic-normal-strong`, `kbq-italic-compact`, `kbq-italic-compact-strong`. Italic versions of 'text' group styles.

**SCSS Example**:
```scss
.card {
  @extend .kbq-text-normal;
  margin-bottom: var(--kbq-size-s);
}
```

**Low-level Variables (Secondary)**:
If you absolutely must use variables manually (not recommended), the pattern is `--kbq-typography-[style]-[property]`.
Properties: `font-size`, `line-height`, `font-weight`, `letter-spacing`, `font-family`.

Typography docs: https://koobiq.io/en/main/design-tokens/typography  

## 5. Sizes & Spacing

Used for `padding`, `margin`, `width`, `height`, `border-radius`.
Pattern: `--kbq-size-[name]`

| Size | Value (approx) | Usage |
| :--- | :--- | :--- |
| `3xs`, `xxs`, `xs` | 2px, 4px, 6px | Tiny spacing, fine adjustments. |
| `s` | 8px | Small padding, standard border radius. |
| `m` | 12px | Medium padding. |
| `l` | 16px | Large padding. |
| `xl`, `xxl` | 20px, 24px | Component height, layout spacing. |
| `3xl`...`7xl` | 32px...64px | Large layout sections. |

**Border Width**:
*   `--kbq-size-border-width` (Default: 1px). Used for input box borders.

**Border Radius**:
*   `--kbq-size-border-radius` (Default, usually 8px). Used for buttons, input boxes. 
* Use 12px radius for medium-sized containers: alerts, cards, popovers.

## 6. Shadows

Pattern: `--kbq-shadow-[type]`

| Variable | Description |
| :--- | :--- |
| `--kbq-shadow-outline` | Subtle outline shadow, default card shadow, 1px outer border. Minimal elevation. |
| `--kbq-shadow-key` | Key light shadow component. Don't use directly. |
| `--kbq-shadow-ambient` | Ambient light shadow component. Don't use directly. |
| `--kbq-shadow-card` | Elevavted card shadow. |
| `--kbq-shadow-popup` | Dropdowns, popovers, tooltips. |
| `--kbq-shadow-overlay` | Modals, dialogs. |
| **Overflow (Compact)** | |
| `--kbq-shadow-overflow-compact-top` | Top overflow shadow. Subtle single line shadow for low elevated elements. |
| `--kbq-shadow-overflow-compact-right` | Right overflow shadow. |
| `--kbq-shadow-overflow-compact-bottom` | Bottom overflow shadow. |
| `--kbq-shadow-overflow-compact-left` | Left overflow shadow. |
| **Overflow (Normal)** | |
| `--kbq-shadow-overflow-normal-top` | Top normal overflow shadow. Modal, sidepanel header overflow shadow. |
| `--kbq-shadow-overflow-normal-right` | Right normal overflow shadow. |
| `--kbq-shadow-overflow-normal-bottom` | Bottom normal overflow shadow. |
| `--kbq-shadow-overflow-normal-left` | Left normal overflow shadow. |


## 7. Palette System 2.0

This section describes new palette system.

### Token Resolution Chain

```
plt.json5  →  semantic.json5  →  colors.v2.json5  →  CSS variables
(raw OKLch)   (semantic roles)   (design tokens)      (--kbq-*)
```

**File paths** (relative to `packages/design-tokens/web/properties/`):
*   `plt.json5` — perceptually-uniform raw color scales (OKLch). **Preferred** for new token values.
*   `semantic.json5` — maps semantic role names (`themeA`, `contrastA`, …) to plt families.
*   `colors.v2.json5` — final token definitions that produce the `--kbq-*` CSS variables.
*   `palette.json5` — legacy HSL-based colors. **Do not use for new tokens.**

### plt Color Families

Scale: `1` (lightest) → `20` (darkest). Alpha variants (`*A`) add opacity steps on the same scale.

| Family | Semantic role | Notes |
| :--- | :--- | :--- |
| `blue` / `blueA` | Theme (brand) | |
| `slate` / `slateA` | Contrast (neutral) | Grays / neutrals |
| `red` / `redA` | Error | |
| `green` / `greenA` | Success | |
| `yellow` / `yellowA` | Warning | Theme-adaptive hue |
| `yellowFixed` / `yellowFixedA` | Warning | Fixed hue across themes |
| `purple` / `purpleA` | Visited | |
| `teal` / `tealA` | — | Accent |
| `orange` / `orangeA` | — | Accent |
| `grey` / `greyA` | — | Neutral accent |
| `white` / `whiteA` | White (always bright) | |
| `black` / `blackA` | Night (always dark) | |
| `dark*` variants | Dark-theme-specific | Each family has a `dark*` counterpart |

### Semantic Families

Used in `semantic.json5` to decouple design intent from raw hues:

| Semantic family | Maps to plt |
| :--- | :--- |
| `themeA` | `blueA` |
| `contrastA` | `slateA` |
| `errorA` | `redA` |
| `successA` | `greenA` |
| `warningA` | `yellowA` |
| `warningFixedA` | `yellowFixedA` |
| `visitedA` | `purpleA` |

`dark*` counterparts exist for every family (e.g. `darkThemeA`, `darkContrastA`) and are referenced by dark-theme token values.

### Reference Syntax

```json5
// In colors.v2.json5 — preferred, via semantic layer:
"background-theme": { "value": "{semantic.themeA.14}" }

// Direct plt reference (acceptable for utility tokens):
"background-night": { "value": "{plt.slate.18}" }

// Legacy (do not use for new tokens):
"background-theme": { "value": "{palette.blue.50}" }
```

### Choosing the right scale value

The scale (1–20) maps to lightness in OKLch:
*   `1–5`: Very light tints — subtle backgrounds, fades (`-less`, `-fade` variants).
*   `8–10`: Mid-range — overlays, faded states.
*   `13–14`: Saturated interactive colors — solid fills, links.
*   `16–20`: Deep, high-contrast — primary text, high-contrast backgrounds.

For alpha variants (`*A`), the scale controls opacity rather than lightness — use low scales (1–5) for faint overlays, high scales (16–20) for near-opaque fills.

### Theming Implementation

To enable theming, the application must load the CSS token files and apply a theme class to the `body` or root element.

[Theming: Koobiq Docs](https://koobiq.io/en/main/theming/overview)

**Required imports** (use the `new/` path for OKLch-based tokens):

```css
@import '@koobiq/design-tokens/web/new/css-tokens.css';        /* base / component tokens (:root) */
@import '@koobiq/design-tokens/web/new/css-tokens-light.css';  /* light theme (.kbq-light) */
@import '@koobiq/design-tokens/web/new/css-tokens-dark.css';   /* dark theme (.kbq-dark) */
```

Apply a theme class to the root element:

```html
<body class="kbq-light"> <!-- or kbq-dark -->
```


## 8. Example Component

Here is how to style a "Card" component using Koobiq tokens:
**CSS property reference:**

```css
.my-component {
    background-color: var(--kbq-background-card);
    color:            var(--kbq-foreground-contrast);
    border:           var(--kbq-size-border-width) solid var(--kbq-line-contrast-fade);
    border-radius:    var(--kbq-size-border-radius);
    box-shadow:       var(--kbq-shadow-card);
    padding:          var(--kbq-size-l) var(--kbq-size-m);
}

.my-component:hover {
    background-color: var(--kbq-states-background-contrast-fade-hover);
    opacity: var(--kbq-opacity-overlay);
}

.my-component--error {
    border-color: var(--kbq-line-error);
    color:        var(--kbq-foreground-error);
}
```

**Legacy import path** (HSL-based, still supported but prefer `new/`):

```css
@import '@koobiq/design-tokens/web/css-tokens.css';
@import '@koobiq/design-tokens/web/css-tokens-light.css';
@import '@koobiq/design-tokens/web/css-tokens-dark.css';
```
