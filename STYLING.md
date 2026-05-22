# Koobiq Design Tokens — Styling Reference

> Auto-generated from token source files. Run `yarn generate:styling` to refresh.
> See [AGENTS.md](./AGENTS.md) for project overview and setup.

## Color System

Colors are context-aware and switch automatically based on the theme (Light/Dark).
Descriptions shown only where usage is non-obvious; names follow the pattern from AGENTS.md.

### Backgrounds (`--kbq-background-...`)

| Variable                           | Usage context                                            |
| :--------------------------------- | :------------------------------------------------------- |
| `--kbq-background-bg`              | Main page background.                                    |
| `--kbq-background-bg-secondary`    | Sidebar, panel backgrounds.                              |
| `--kbq-background-bg-tertiary`     |                                                          |
| `--kbq-background-night`           | Dim surface in both themes.                              |
| `--kbq-background-card`            | Elevated surfaces; matches bg in light, differs in dark. |
| `--kbq-background-theme`           | Checkboxes, radio buttons, toggle switches.              |
| `--kbq-background-theme-fade`      |                                                          |
| `--kbq-background-theme-less`      | Selected list/tree items, table rows.                    |
| `--kbq-background-contrast`        | Primary button. Highest contrast in both themes.         |
| `--kbq-background-contrast-fade`   | Default (ghost) button.                                  |
| `--kbq-background-contrast-less`   | Multi-select checked rows; alert containers.             |
| `--kbq-background-error`           |                                                          |
| `--kbq-background-error-fade`      |                                                          |
| `--kbq-background-error-less`      | Alert container.                                         |
| `--kbq-background-success`         |                                                          |
| `--kbq-background-success-fade`    |                                                          |
| `--kbq-background-success-less`    | Alert container.                                         |
| `--kbq-background-warning`         |                                                          |
| `--kbq-background-warning-fade`    |                                                          |
| `--kbq-background-warning-less`    | Alert container.                                         |
| `--kbq-background-transparent`     |                                                          |
| `--kbq-background-overlay`         | Modal backdrop.                                          |
| `--kbq-background-overlay-theme`   | Allowed dropzone on dragover.                            |
| `--kbq-background-overlay-error`   | Invalid dropzone on dragover.                            |
| `--kbq-background-overlay-inverse` | Loading overlay.                                         |
| `--kbq-background-highlight`       |                                                          |

### Foregrounds (`--kbq-foreground-...`)

Text color.

| Variable                                 | Usage context                                         |
| :--------------------------------------- | :---------------------------------------------------- |
| `--kbq-foreground-contrast`              | Primary text.                                         |
| `--kbq-foreground-contrast-secondary`    | Captions, hints.                                      |
| `--kbq-foreground-contrast-tertiary`     | Disabled / subtle text.                               |
| `--kbq-foreground-theme`                 | Links.                                                |
| `--kbq-foreground-theme-secondary`       |                                                       |
| `--kbq-foreground-error`                 |                                                       |
| `--kbq-foreground-error-secondary`       |                                                       |
| `--kbq-foreground-error-tertiary`        |                                                       |
| `--kbq-foreground-success`               |                                                       |
| `--kbq-foreground-success-secondary`     |                                                       |
| `--kbq-foreground-success-tertiary`      |                                                       |
| `--kbq-foreground-warning`               |                                                       |
| `--kbq-foreground-warning-secondary`     |                                                       |
| `--kbq-foreground-visited`               |                                                       |
| `--kbq-foreground-on-contrast`           | Text on --kbq-background-contrast.                    |
| `--kbq-foreground-on-contrast-secondary` |                                                       |
| `--kbq-foreground-white`                 | Text on colored backgrounds (theme, error, success…). |
| `--kbq-foreground-white-secondary`       |                                                       |
| `--kbq-foreground-white-tertiary`        |                                                       |
| `--kbq-foreground-night`                 |                                                       |
| `--kbq-foreground-night-secondary`       |                                                       |
| `--kbq-foreground-night-tertiary`        |                                                       |

### Icons (`--kbq-icon-...`)

| Variable                      | Usage context                       |
| :---------------------------- | :---------------------------------- |
| `--kbq-icon-contrast`         |                                     |
| `--kbq-icon-contrast-fade`    |                                     |
| `--kbq-icon-theme`            | Brand icons, icons beside links.    |
| `--kbq-icon-theme-fade`       |                                     |
| `--kbq-icon-error`            |                                     |
| `--kbq-icon-error-fade`       |                                     |
| `--kbq-icon-success`          |                                     |
| `--kbq-icon-success-fade`     |                                     |
| `--kbq-icon-warning`          |                                     |
| `--kbq-icon-warning-fade`     |                                     |
| `--kbq-icon-visited`          |                                     |
| `--kbq-icon-on-contrast`      | Icons on --kbq-background-contrast. |
| `--kbq-icon-on-contrast-fade` |                                     |
| `--kbq-icon-white`            | Icons on colored backgrounds.       |
| `--kbq-icon-white-fade`       |                                     |
| `--kbq-icon-night`            |                                     |
| `--kbq-icon-night-fade`       |                                     |

### Lines / Borders (`--kbq-line-...`)

| Variable                      | Usage context                   |
| :---------------------------- | :------------------------------ |
| `--kbq-line-contrast`         |                                 |
| `--kbq-line-contrast-fade`    | Input box borders.              |
| `--kbq-line-contrast-less`    | Table / list / tree separators. |
| `--kbq-line-theme`            |                                 |
| `--kbq-line-theme-fade`       | Link underline.                 |
| `--kbq-line-theme-less`       |                                 |
| `--kbq-line-error`            |                                 |
| `--kbq-line-error-fade`       |                                 |
| `--kbq-line-success`          |                                 |
| `--kbq-line-success-fade`     |                                 |
| `--kbq-line-warning`          |                                 |
| `--kbq-line-warning-fade`     |                                 |
| `--kbq-line-visited`          | Visited link underline.         |
| `--kbq-line-visited-fade`     |                                 |
| `--kbq-line-on-contrast`      |                                 |
| `--kbq-line-on-contrast-fade` |                                 |
| `--kbq-line-on-contrast-less` |                                 |
| `--kbq-line-white`            |                                 |
| `--kbq-line-white-fade`       |                                 |
| `--kbq-line-white-less`       |                                 |
| `--kbq-line-night`            |                                 |
| `--kbq-line-night-fade`       |                                 |
| `--kbq-line-night-less`       |                                 |

### Interaction States (`--kbq-states-...`)

Pattern: `--kbq-states-[element]-[semantic]-[intensity?]-[state]`

- **element** ∈ `background`, `foreground`, `icon`
- **intensity** ∈ `-fade`, `-less` (optional)
- **state** ∈ `-hover`, `-active`
- Disabled: `--kbq-states-[element]-disabled` (no state suffix)

| Variable                                       | Usage context                  |
| :--------------------------------------------- | :----------------------------- |
| `--kbq-states-background-disabled`             |                                |
| `--kbq-states-background-contrast-hover`       |                                |
| `--kbq-states-background-contrast-active`      |                                |
| `--kbq-states-background-contrast-fade-hover`  |                                |
| `--kbq-states-background-contrast-fade-active` |                                |
| `--kbq-states-background-contrast-less-hover`  |                                |
| `--kbq-states-background-contrast-less-active` |                                |
| `--kbq-states-background-transparent-hover`    |                                |
| `--kbq-states-background-transparent-active`   |                                |
| `--kbq-states-background-theme-hover`          |                                |
| `--kbq-states-background-theme-active`         |                                |
| `--kbq-states-background-theme-fade-hover`     |                                |
| `--kbq-states-background-theme-fade-active`    |                                |
| `--kbq-states-background-theme-less-hover`     |                                |
| `--kbq-states-background-theme-less-active`    |                                |
| `--kbq-states-background-error-hover`          |                                |
| `--kbq-states-background-error-active`         |                                |
| `--kbq-states-background-error-fade-hover`     |                                |
| `--kbq-states-background-error-fade-active`    |                                |
| `--kbq-states-background-error-less-hover`     |                                |
| `--kbq-states-background-error-less-active`    |                                |
| `--kbq-states-background-warning-hover`        |                                |
| `--kbq-states-background-warning-active`       |                                |
| `--kbq-states-background-warning-fade-hover`   |                                |
| `--kbq-states-background-warning-fade-active`  |                                |
| `--kbq-states-background-warning-less-hover`   |                                |
| `--kbq-states-background-warning-less-active`  |                                |
| `--kbq-states-background-success-hover`        |                                |
| `--kbq-states-background-success-active`       |                                |
| `--kbq-states-background-success-fade-hover`   |                                |
| `--kbq-states-background-success-fade-active`  |                                |
| `--kbq-states-background-success-less-hover`   |                                |
| `--kbq-states-background-success-less-active`  |                                |
| `--kbq-states-background-highlight-current`    |                                |
| `--kbq-states-foreground-disabled`             |                                |
| `--kbq-states-foreground-theme-hover`          |                                |
| `--kbq-states-foreground-theme-active`         |                                |
| `--kbq-states-foreground-visited-hover`        |                                |
| `--kbq-states-foreground-visited-active`       |                                |
| `--kbq-states-icon-disabled`                   |                                |
| `--kbq-states-icon-contrast-hover`             |                                |
| `--kbq-states-icon-contrast-active`            |                                |
| `--kbq-states-icon-contrast-fade-hover`        |                                |
| `--kbq-states-icon-contrast-fade-active`       |                                |
| `--kbq-states-icon-theme-hover`                |                                |
| `--kbq-states-icon-theme-active`               |                                |
| `--kbq-states-icon-error-hover`                |                                |
| `--kbq-states-icon-error-active`               |                                |
| `--kbq-states-icon-success-hover`              |                                |
| `--kbq-states-icon-success-active`             |                                |
| `--kbq-states-icon-warning-hover`              |                                |
| `--kbq-states-icon-warning-active`             |                                |
| `--kbq-states-icon-visited-hover`              |                                |
| `--kbq-states-icon-visited-active`             |                                |
| **Line states**                                |                                |
| `--kbq-states-line-disabled`                   |                                |
| `--kbq-states-line-focus`                      | Focus ring.                    |
| `--kbq-states-line-focus-theme`                |                                |
| `--kbq-states-line-focus-error`                |                                |
| `--kbq-opacity-disabled`                       | Opacity for disabled elements. |

## Typography

Use CSS classes or SCSS `@extend`. Pattern: `kbq-[style]`

```scss
.card-title {
    @extend .kbq-title;
}
```

| Class                        | Font size | Line height                    | Weight                         |
| :--------------------------- | :-------- | :----------------------------- | :----------------------------- |
| `kbq-headline`               | 28px      | 32px                           | 700                            |
| `kbq-title`                  | 20px      | 28px                           | 700                            |
| `kbq-subheading`             | 18px      | 26px                           | 600                            |
| `kbq-display-big`            | 57px      | 64px                           | 400                            |
| `kbq-display-normal`         | 45px      | 52px                           | 400                            |
| `kbq-display-compact`        | 36px      | 44px                           | 400                            |
| `kbq-display-big-strong`     | 57px      | 64px                           | 700                            |
| `kbq-display-normal-strong`  | 45px      | 52px                           | 700                            |
| `kbq-display-compact-strong` | 36px      | 44px                           | 700                            |
| `kbq-text-big`               | 16px      | 24px                           | normal                         |
| `kbq-text-big-medium`        | 16px      | 24px                           | 500                            |
| `kbq-text-big-strong`        | 16px      | 24px                           | 600                            |
| `kbq-text-normal`            | 14px      | 20px                           | normal                         |
| `kbq-text-normal-medium`     | 14px      | 20px                           | 500                            |
| `kbq-text-normal-strong`     | 14px      | 20px                           | 600                            |
| `kbq-text-compact`           | 12px      | 16px                           | normal                         |
| `kbq-text-compact-medium`    | 12px      | 16px                           | 500                            |
| `kbq-text-compact-strong`    | 12px      | 16px                           | 600                            |
| `kbq-caps-big`               | 16px      | 24px                           | 400                            |
| `kbq-caps-big-strong`        | 16px      | 24px                           | 500                            |
| `kbq-caps-normal`            | 14px      | 20px                           | normal                         |
| `kbq-caps-normal-strong`     | 14px      | 20px                           | 500                            |
| `kbq-caps-compact`           | 12px      | 16px                           | normal                         |
| `kbq-caps-compact-strong`    | 12px      | 16px                           | 500                            |
| `kbq-mono-big`               | 16px      | 24px                           | normal                         |
| `kbq-mono-big-strong`        | 16px      | 24px                           | 700                            |
| `kbq-mono-normal`            | 14px      | 20px                           | normal                         |
| `kbq-mono-normal-medium`     | 14px      | 20px                           | 600                            |
| `kbq-mono-normal-strong`     | 14px      | 20px                           | 700                            |
| `kbq-mono-compact`           | 12px      | 16px                           | normal                         |
| `kbq-mono-compact-strong`    | 12px      | 16px                           | 700                            |
| `kbq-mono-codeblock`         | 14px      | 20px                           | normal                         |
| `kbq-tabular-big`            | 16px      | 24px                           | normal                         |
| `kbq-tabular-big-strong`     | 16px      | 24px                           | 600                            |
| `kbq-tabular-normal`         | 14px      | 20px                           | normal                         |
| `kbq-tabular-normal-strong`  | 14px      | 20px                           | 600                            |
| `kbq-tabular-compact`        | 12px      | 16px                           | normal                         |
| `kbq-tabular-compact-strong` | 12px      | 16px                           | 600                            |
| `kbq-italic-big`             | 16px      | 24px                           | normal                         |
| `kbq-italic-big-strong`      | 16px      | 24px                           | 600                            |
| `kbq-italic-normal`          | 14px      | 20px                           | normal                         |
| `kbq-italic-normal-strong`   | 14px      | 20px                           | 600                            |
| `kbq-italic-compact`         | 12px      | 16px                           | normal                         |
| `kbq-italic-compact-strong`  | 12px      | 16px                           | 600                            |
| `kbq-navbar-title`           | 18px      | {typography.title.line-height} | {typography.title.font-weight} |

## Sizes & Spacing

Pattern: `--kbq-size-[name]`

| Variable                   | Value | Usage                                                  |
| :------------------------- | :---- | :----------------------------------------------------- |
| `--kbq-size-3xs`           | 2px   | Tiny spacing, fine adjustments.                        |
| `--kbq-size-xxs`           | 4px   | Tiny spacing, fine adjustments.                        |
| `--kbq-size-xs`            | 6px   | Tiny spacing, fine adjustments.                        |
| `--kbq-size-s`             | 8px   | Small padding, standard border radius.                 |
| `--kbq-size-m`             | 12px  | Medium padding.                                        |
| `--kbq-size-l`             | 16px  | Large padding.                                         |
| `--kbq-size-xl`            | 20px  | Component height, layout spacing.                      |
| `--kbq-size-xxl`           | 24px  | Component height, layout spacing.                      |
| `--kbq-size-3xl`           | 32px  | Large layout sections.                                 |
| `--kbq-size-4xl`           | 40px  | Large layout sections.                                 |
| `--kbq-size-5xl`           | 48px  | Large layout sections.                                 |
| `--kbq-size-6xl`           | 56px  | Large layout sections.                                 |
| `--kbq-size-7xl`           | 64px  | Large layout sections.                                 |
| `--kbq-size-border-width`  | 1px   | Input box borders.                                     |
| `--kbq-size-border-radius` | 8px   | Buttons, inputs. Use 12px for cards, alerts, popovers. |

## Shadows

Pattern: `--kbq-shadow-[type]`

| Variable                               | Usage                                              |
| :------------------------------------- | :------------------------------------------------- |
| `--kbq-shadow-outline`                 | Minimal elevation, 1px outer border.               |
| `--kbq-shadow-key`                     | Internal component — do not use directly.          |
| `--kbq-shadow-ambient`                 | Internal component — do not use directly.          |
| `--kbq-shadow-overflow-compact-top`    | Subtle overflow shadow for low-elevation elements. |
| `--kbq-shadow-overflow-compact-right`  |                                                    |
| `--kbq-shadow-overflow-compact-bottom` |                                                    |
| `--kbq-shadow-overflow-compact-left`   |                                                    |
| `--kbq-shadow-overflow-normal-top`     | Modal / sidepanel header overflow shadow.          |
| `--kbq-shadow-overflow-normal-right`   |                                                    |
| `--kbq-shadow-overflow-normal-left`    |                                                    |
| `--kbq-shadow-overflow-normal-bottom`  |                                                    |
| `--kbq-shadow-card`                    | Elevated card.                                     |
| `--kbq-shadow-popup`                   | Dropdowns, popovers, tooltips.                     |
| `--kbq-shadow-overlay`                 | Modals, dialogs.                                   |

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

| Family             | Scale | Semantic role                            |
| :----------------- | :---- | :--------------------------------------- |
| `blue`             | 1–20  | Theme (brand)                            |
| `slate`            | 1–20  | Contrast (neutral)                       |
| `red`              | 1–20  | Error                                    |
| `orange`           | 1–20  | Accent                                   |
| `yellow`           | 1–20  | Warning (adaptive)                       |
| `green`            | 1–20  | Success                                  |
| `teal`             | 1–20  | Accent                                   |
| `purple`           | 1–20  | Visited                                  |
| `darkBlue`         | 1–20  | Dark-theme counterpart of `blue`         |
| `darkSlate`        | 1–20  | Dark-theme counterpart of `slate`        |
| `darkRed`          | 1–20  | Dark-theme counterpart of `red`          |
| `darkOrange`       | 1–20  | Dark-theme counterpart of `orange`       |
| `darkYellow`       | 1–20  | Dark-theme counterpart of `yellow`       |
| `darkGreen`        | 1–20  | Dark-theme counterpart of `green`        |
| `darkTeal`         | 1–20  | Dark-theme counterpart of `teal`         |
| `darkPurple`       | 1–20  | Dark-theme counterpart of `purple`       |
| `grey`             | 1–20  | Neutral accent                           |
| `darkGrey`         | 1–20  | Dark-theme counterpart of `grey`         |
| `greyA`            | 1–20  | Neutral accent                           |
| `darkGreyA`        | 1–20  | Dark-theme counterpart of `greyA`        |
| `whiteA`           | 1–20  | White (always bright)                    |
| `blackA`           | 1–20  | Night (always dark)                      |
| `blueA`            | 1–20  | Theme (brand)                            |
| `slateA`           | 1–20  | Contrast (neutral)                       |
| `redA`             | 1–20  | Error                                    |
| `orangeA`          | 1–20  | Accent                                   |
| `yellowA`          | 1–20  | Warning (adaptive)                       |
| `greenA`           | 1–20  | Success                                  |
| `tealA`            | 1–20  | Accent                                   |
| `purpleA`          | 1–20  | Visited                                  |
| `darkBlueA`        | 1–20  | Dark-theme counterpart of `blueA`        |
| `darkSlateA`       | 1–20  | Dark-theme counterpart of `slateA`       |
| `darkRedA`         | 1–20  | Dark-theme counterpart of `redA`         |
| `darkOrangeA`      | 1–20  | Dark-theme counterpart of `orangeA`      |
| `darkYellowA`      | 1–20  | Dark-theme counterpart of `yellowA`      |
| `darkGreenA`       | 1–20  | Dark-theme counterpart of `greenA`       |
| `darkTealA`        | 1–20  | Dark-theme counterpart of `tealA`        |
| `darkPurpleA`      | 1–20  | Dark-theme counterpart of `purpleA`      |
| `yellowFixed`      | 1–20  | Warning (fixed hue)                      |
| `orangeFixed`      | 1–20  | —                                        |
| `darkYellowFixed`  | 1–20  | Dark-theme counterpart of `yellowFixed`  |
| `darkOrangeFixed`  | 1–20  | Dark-theme counterpart of `orangeFixed`  |
| `yellowFixedA`     | 1–20  | Warning (fixed hue)                      |
| `orangeFixedA`     | 1–20  | —                                        |
| `darkYellowFixedA` | 1–20  | Dark-theme counterpart of `yellowFixedA` |
| `darkOrangeFixedA` | 1–20  | Dark-theme counterpart of `orangeFixedA` |
| `white`            | value | White (always bright)                    |
| `black`            | value | Night (always dark)                      |

### Semantic Family Mappings

| Semantic        | plt family     |
| :-------------- | :------------- |
| `themeA`        | `blueA`        |
| `contrastA`     | `slateA`       |
| `errorA`        | `redA`         |
| `successA`      | `greenA`       |
| `warningA`      | `yellowA`      |
| `warningFixedA` | `yellowFixedA` |
| `visitedA`      | `purpleA`      |

`dark*` counterparts exist for every family and are used by dark-theme token values.

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
