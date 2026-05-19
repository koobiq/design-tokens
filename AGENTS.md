# Styling in Koobiq Design System. Guide for AI Agents

This document provides guidelines for LLMs and AI agents on how to work with design tokens provided by the Koobiq Design System.
It focuses on styling, theming, and the correct usage of design tokens.

## 1. Core

*   **CSS Variables are the API**: Styling should be done almost exclusively using CSS variables (custom properties) provided by the system.
*   **Global over Component**: Component-specific tokens (e.g., `--kbq-button-height`) are **deprecated**. Always use global semantic tokens (e.g., `--kbq-size-xl`).
*   **Semantic Naming**: Tokens are named based on their semantic function (e.g., `error`, `success`, `contrast`, `theme`) rather than raw values (e.g., `red`, `blue`).

## 2. Variable naming convention

The general pattern for CSS variables is:

```
--kbq-[category]-[semantic-name]-[state/variant]
```

*   **Prefix**: `--kbq-`
*   **Category**: `background`, `foreground`, `line`, `icon`, `size`, `typography`, `shadow`.
*   **Semantic Name**: `theme` (brand), `contrast` (neutral), `error`, `success`, `warning`.
*   **Variant** (Optional): `secondary`, `tertiary`, `fade`, `hover`.

### Semantic roles definition

*   **Theme**: Represents the primary brand identity. Used for active states (toggles, checkboxes), links, selected options and key interactive elements.
*   **Contrast**: The foundation of the UI. Neutral colors (grays, black, white) used for text, borders, backgrounds, and secondary actions. Used for primary actions (buttons).
*   **Error**: Critical issues, destructive actions, or validation failures.
*   **Success**: Successful completion of tasks or valid states.
*   **Warning**: Caution, non-critical alerts, or attention requirements.
*   **On contrast**: Colors intended to be used on top --kbq-background-contrast for text, icons and lines. Adapts to ensure readability on both light and dark themes.
*   **White**: Bright in both themes. Used on colored backgrounds (e.g., --kbq-background-theme, --kbq-background-success).
*   **Night**: Dark in both themes.

## 3. Color system

Colors are context-aware and switch automatically based on the theme (Light/Dark).
Only non-obvious usage context is shown; names follow the pattern from Section 2.

### Backgrounds (`--kbq-background-...`)

| Variable | Usage context |
| :--- | :--- |
| `--kbq-background-bg` | Main page background. |
| `--kbq-background-bg-secondary` | Sidebar, panel backgrounds. |
| `--kbq-background-bg-tertiary` | |
| `--kbq-background-night` | Dim surface in both themes. |
| `--kbq-background-card` | Elevated surfaces; matches bg in light, differs in dark. |
| `--kbq-background-transparent` | |
| `--kbq-background-theme` | Checkboxes, radio buttons, toggle switches. |
| `--kbq-background-theme-fade` | |
| `--kbq-background-theme-less` | Selected list/tree items, table rows. |
| `--kbq-background-contrast` | Primary button. Highest contrast in both themes. |
| `--kbq-background-contrast-fade` | Default (ghost) button. |
| `--kbq-background-contrast-less` | Multi-select checked rows; alert containers. |
| `--kbq-background-error` | |
| `--kbq-background-error-fade` | |
| `--kbq-background-error-less` | Alert container. |
| `--kbq-background-success` | |
| `--kbq-background-success-fade` | |
| `--kbq-background-success-less` | Alert container. |
| `--kbq-background-warning` | |
| `--kbq-background-warning-fade` | |
| `--kbq-background-warning-less` | Alert container. |
| `--kbq-background-overlay` | Modal backdrop. |
| `--kbq-background-overlay-inverse` | Loading overlay. |
| `--kbq-background-overlay-error` | Invalid dropzone on dragover. |
| `--kbq-background-overlay-theme` | Allowed dropzone on dragover. |

### Foregrounds (`--kbq-foreground-...`)

Text color.

| Variable | Usage context |
| :--- | :--- |
| `--kbq-foreground-white` | Text on colored backgrounds (theme, error, success…). |
| `--kbq-foreground-white-secondary` | |
| `--kbq-foreground-theme` | Links. |
| `--kbq-foreground-theme-secondary` | |
| `--kbq-foreground-contrast` | Primary text. |
| `--kbq-foreground-on-contrast` | Text on `--kbq-background-contrast`. |
| `--kbq-foreground-contrast-secondary` | Captions, hints. |
| `--kbq-foreground-contrast-tertiary` | Disabled / subtle text. |
| `--kbq-foreground-error` | |
| `--kbq-foreground-error-secondary` | |
| `--kbq-foreground-error-tertiary` | |
| `--kbq-foreground-success` | |
| `--kbq-foreground-success-secondary` | |
| `--kbq-foreground-warning` | |
| `--kbq-foreground-warning-secondary` | |
| `--kbq-foreground-visited` | Visited links. |

### Icons (`--kbq-icon-...`)

| Variable | Usage context |
| :--- | :--- |
| `--kbq-icon-white` | Icons on colored backgrounds. |
| `--kbq-icon-theme` | Brand icons, icons beside links. |
| `--kbq-icon-theme-fade` | |
| `--kbq-icon-contrast` | |
| `--kbq-icon-contrast-fade` | |
| `--kbq-icon-on-contrast` | Icons on `--kbq-background-contrast`. |
| `--kbq-icon-error` | |
| `--kbq-icon-success` | |
| `--kbq-icon-warning` | |
| `--kbq-icon-visited` | |

### Lines / Borders (`--kbq-line-...`)

| Variable | Usage context |
| :--- | :--- |
| `--kbq-line-theme` | |
| `--kbq-line-theme-fade` | Link underline. |
| `--kbq-line-theme-less` | |
| `--kbq-line-contrast` | |
| `--kbq-line-contrast-fade` | Input box borders. |
| `--kbq-line-contrast-less` | Table / list / tree separators. |
| `--kbq-line-error` | |
| `--kbq-line-error-fade` | |
| `--kbq-line-success` | |
| `--kbq-line-success-fade` | |
| `--kbq-line-warning` | |
| `--kbq-line-warning-fade` | |
| `--kbq-line-visited` | Visited link underline. |
| `--kbq-line-focus` | Focus ring. |
| `--kbq-line-focus-theme` | |
| `--kbq-line-focus-error` | |
| `--kbq-line-disabled` | |

### Interaction States (`--kbq-states-...`)

States follow the pattern `--kbq-states-[element]-[semantic]-[intensity?]-[state]`:
*   **element** ∈ `background`, `foreground`, `icon`
*   **semantic** ∈ `theme`, `contrast`, `error`, `success`, `warning`, `visited`, `transparent`, `disabled`
*   **intensity** ∈ `-fade`, `-less` (optional; mirrors base color variants)
*   **state** ∈ `-hover`, `-active`

Disabled variants use no state suffix: `--kbq-states-[element]-disabled`.
Not all semantic × intensity combinations exist (e.g. `warning` has `-fade` and `-less` but no base hover/active).

`--kbq-opacity-disabled` — opacity value for disabled elements.

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


## 7. Palette system 2.0

This section describes new palette system.

### Token resolution chain

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
