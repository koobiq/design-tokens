# Koobiq Design Tokens — Styling Reference

> Auto-generated from token source files. Run `yarn generate:styling` to refresh.
> See [AGENTS.md](./AGENTS.md) for project overview and setup.

## Color System

Colors are context-aware and switch automatically based on the theme (Light/Dark).
Descriptions shown only where usage is non-obvious; names follow the pattern from AGENTS.md.

### Backgrounds (`--kbq-background-...`)

| Variable | Usage context |
| :--- | :--- |
| `--kbq-background-bg` | Main page background. |
| `--kbq-background-bg-secondary` | Sidebar, panel backgrounds. |
| `--kbq-background-bg-tertiary` |  |
| `--kbq-background-night` | Dim surface in both themes. |
| `--kbq-background-card` | Elevated surfaces; matches bg in light, differs in dark. |
| `--kbq-background-theme` | Checkboxes, radio buttons, toggle switches. |
| `--kbq-background-theme-fade` |  |
| `--kbq-background-theme-less` | Selected list/tree items, table rows. |
| `--kbq-background-contrast` | Primary button. Highest contrast in both themes. |
| `--kbq-background-contrast-fade` | Default (ghost) button. |
| `--kbq-background-contrast-less` | Multi-select checked rows; alert containers. |
| `--kbq-background-error` |  |
| `--kbq-background-error-fade` |  |
| `--kbq-background-error-less` | Alert container. |
| `--kbq-background-success` |  |
| `--kbq-background-success-fade` |  |
| `--kbq-background-success-less` | Alert container. |
| `--kbq-background-warning` |  |
| `--kbq-background-warning-fade` |  |
| `--kbq-background-warning-less` | Alert container. |
| `--kbq-background-transparent` |  |
| `--kbq-background-overlay` | Modal backdrop. |
| `--kbq-background-overlay-theme` | Allowed dropzone on dragover. |
| `--kbq-background-overlay-error` | Invalid dropzone on dragover. |
| `--kbq-background-overlay-inverse` | Loading overlay. |
| `--kbq-background-highlight` |  |

### Foregrounds (`--kbq-foreground-...`)

Text color.

| Variable | Usage context |
| :--- | :--- |
| `--kbq-foreground-contrast` | Primary text. |
| `--kbq-foreground-contrast-secondary` | Captions, hints. |
| `--kbq-foreground-contrast-tertiary` | Disabled / subtle text. |
| `--kbq-foreground-theme` | Links. |
| `--kbq-foreground-theme-secondary` |  |
| `--kbq-foreground-error` |  |
| `--kbq-foreground-error-secondary` |  |
| `--kbq-foreground-error-tertiary` |  |
| `--kbq-foreground-success` |  |
| `--kbq-foreground-success-secondary` |  |
| `--kbq-foreground-success-tertiary` |  |
| `--kbq-foreground-warning` |  |
| `--kbq-foreground-warning-secondary` |  |
| `--kbq-foreground-visited` |  |
| `--kbq-foreground-on-contrast` | Text on --kbq-background-contrast. |
| `--kbq-foreground-on-contrast-secondary` |  |
| `--kbq-foreground-white` | Text on colored backgrounds (theme, error, success…). |
| `--kbq-foreground-white-secondary` |  |
| `--kbq-foreground-white-tertiary` |  |
| `--kbq-foreground-night` |  |
| `--kbq-foreground-night-secondary` |  |
| `--kbq-foreground-night-tertiary` |  |

### Icons (`--kbq-icon-...`)

| Variable | Usage context |
| :--- | :--- |
| `--kbq-icon-contrast` |  |
| `--kbq-icon-contrast-fade` |  |
| `--kbq-icon-theme` | Brand icons, icons beside links. |
| `--kbq-icon-theme-fade` |  |
| `--kbq-icon-error` |  |
| `--kbq-icon-error-fade` |  |
| `--kbq-icon-success` |  |
| `--kbq-icon-success-fade` |  |
| `--kbq-icon-warning` |  |
| `--kbq-icon-warning-fade` |  |
| `--kbq-icon-visited` |  |
| `--kbq-icon-on-contrast` | Icons on --kbq-background-contrast. |
| `--kbq-icon-on-contrast-fade` |  |
| `--kbq-icon-white` | Icons on colored backgrounds. |
| `--kbq-icon-white-fade` |  |
| `--kbq-icon-night` |  |
| `--kbq-icon-night-fade` |  |

### Lines / Borders (`--kbq-line-...`)

| Variable | Usage context |
| :--- | :--- |
| `--kbq-line-contrast` |  |
| `--kbq-line-contrast-fade` | Input box borders. |
| `--kbq-line-contrast-less` | Table / list / tree separators. |
| `--kbq-line-theme` |  |
| `--kbq-line-theme-fade` | Link underline. |
| `--kbq-line-theme-less` |  |
| `--kbq-line-error` |  |
| `--kbq-line-error-fade` |  |
| `--kbq-line-success` |  |
| `--kbq-line-success-fade` |  |
| `--kbq-line-warning` |  |
| `--kbq-line-warning-fade` |  |
| `--kbq-line-visited` | Visited link underline. |
| `--kbq-line-visited-fade` |  |
| `--kbq-line-on-contrast` |  |
| `--kbq-line-on-contrast-fade` |  |
| `--kbq-line-on-contrast-less` |  |
| `--kbq-line-white` |  |
| `--kbq-line-white-fade` |  |
| `--kbq-line-white-less` |  |
| `--kbq-line-night` |  |
| `--kbq-line-night-fade` |  |
| `--kbq-line-night-less` |  |

### Interaction States (`--kbq-states-...`)

States follow the pattern `--kbq-states-[element]-[semantic]-[intensity?]-[state]`:

- **element** ∈ `background`, `foreground`, `icon`
- **semantic** ∈ `theme`, `contrast`, `error`, `success`, `warning`, `visited`, `transparent`, `disabled`
- **intensity** ∈ `-fade`, `-less` (optional; mirrors base color variants)
- **state** ∈ `-hover`, `-active`

Disabled variants use no state suffix: `--kbq-states-[element]-disabled`.
Not all semantic × intensity combinations exist (e.g. `warning` has `-fade` and `-less` but no base hover/active).

`--kbq-states-line-focus` — Focus ring color.
`--kbq-states-line-focus-theme` — Focused theme line.
`--kbq-states-line-focus-error` — Focused error line.
`--kbq-states-line-disabled` — Disabled border color.
`--kbq-opacity-disabled` — Opacity value for disabled elements.

## Typography

Use CSS classes or SCSS `@extend` — do not use individual variables.
Pattern: `kbq-[style]` (e.g. `kbq-title`, `kbq-text-normal-strong`).

```scss
.card-title { @extend .kbq-title; }
```

| Group | Classes |
| :--- | :--- |
| Headings | `kbq-headline`, `kbq-title`, `kbq-subheading`, `kbq-navbar-title` |
| Display | `kbq-display-big[-strong]`, `kbq-display-normal[-strong]`, `kbq-display-compact[-strong]` |
| Text | `kbq-text-big[-medium|-strong]`, `kbq-text-normal[-medium|-strong]`, `kbq-text-compact[-medium|-strong]` |
| Caps | `kbq-caps-big[-strong]`, `kbq-caps-normal[-strong]`, `kbq-caps-compact[-strong]` |
| Mono | `kbq-mono-big[-strong]`, `kbq-mono-normal[-medium|-strong]`, `kbq-mono-compact[-strong]`, `kbq-mono-codeblock` |
| Tabular | `kbq-tabular-big[-strong]`, `kbq-tabular-normal[-strong]`, `kbq-tabular-compact[-strong]` |
| Italic | `kbq-italic-big[-strong]`, `kbq-italic-normal[-strong]`, `kbq-italic-compact[-strong]` |

Low-level variables (avoid): `--kbq-typography-[style]-[font-size|line-height|font-weight|letter-spacing|font-family]`

## Sizes & Spacing

Pattern: `--kbq-size-[name]`

| Size | Value | Usage |
| :--- | :--- | :--- |
| `3xs`, `xxs`, `xs` | 2px, 4px, 6px | Tiny spacing, fine adjustments. |
| `s` | 8px | Small padding, standard border radius. |
| `m` | 12px | Medium padding. |
| `l` | 16px | Large padding. |
| `xl`, `xxl` | 20px, 24px | Component height, layout spacing. |
| `3xl`…`7xl` | 32px…64px | Large layout sections. |

- `--kbq-size-border-width` — 1px. Input box borders.
- `--kbq-size-border-radius` — 8px. Buttons, inputs. Use 12px for cards, alerts, popovers.

## Shadows

Pattern: `--kbq-shadow-[type]`

| Variable | Usage |
| :--- | :--- |
| `--kbq-shadow-outline` | Minimal elevation, 1px outer border. |
| `--kbq-shadow-card` | Elevated card. |
| `--kbq-shadow-popup` | Dropdowns, popovers, tooltips. |
| `--kbq-shadow-overlay` | Modals, dialogs. |
| `--kbq-shadow-overflow-compact-[top|right|bottom|left]` | Subtle overflow shadow for low-elevation elements. |
| `--kbq-shadow-overflow-normal-[top|right|bottom|left]` | Modal/sidepanel header overflow shadow. |

> `--kbq-shadow-key` and `--kbq-shadow-ambient` are internal — do not use directly.

## Palette System (Contributors)

For agents defining new tokens in `colors.v2.json5`. Consumer styling should use `--kbq-*` variables only.

### Token Resolution Chain

```
plt.json5  →  semantic.json5  →  colors.v2.json5  →  CSS variables
(raw OKLch)   (semantic roles)   (design tokens)      (--kbq-*)
```

File paths relative to `packages/design-tokens/web/properties/`:

- `plt.json5` — perceptually-uniform OKLch color scales. **Preferred** for new token values.
- `semantic.json5` — maps semantic role names (`themeA`, `contrastA`, …) to plt families.
- `colors.v2.json5` — final token definitions producing `--kbq-*` CSS variables.
- `palette.json5` — legacy HSL colors. **Do not use for new tokens.**

### plt Color Families

Scale: `1` (lightest) → `20` (darkest). Alpha variants (`*A`) control opacity on the same scale.

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
| `white` / `whiteA` | White (always bright) | |
| `black` / `blackA` | Night (always dark) | |
| `dark*` variants | Dark-theme-specific | Each family has a `dark*` counterpart |

### Semantic Family Mappings

| Semantic | plt family |
| :--- | :--- |
| `themeA` | `blueA` |
| `contrastA` | `slateA` |
| `errorA` | `redA` |
| `successA` | `greenA` |
| `warningA` | `yellowA` |
| `warningFixedA` | `yellowFixedA` |
| `visitedA` | `purpleA` |

### Scale Guidance

- `1–5`: Very light tints — subtle backgrounds, fades (`-less`, `-fade` variants).
- `8–10`: Mid-range — overlays, faded states.
- `13–14`: Saturated — solid fills, links.
- `16–20`: Deep, high-contrast — primary text, high-contrast backgrounds.

For alpha variants (`*A`), scale = opacity level (1 = near-transparent, 20 = near-opaque).

### Reference Syntax

```json5
// Preferred — via semantic layer:
"background-theme": { "value": "{semantic.themeA.14}", "description": "..." }

// Direct plt reference (utility tokens):
"background-night": { "value": "{plt.slate.18}" }
```
