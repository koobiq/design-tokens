# Koobiq Design Tokens — Agent Guide

> Context for AI agents working with Koobiq Design System styling.

## Project

- **Package**: `@koobiq/design-tokens`
- **Docs**: https://koobiq.io/en/main/design-tokens/overview
- **Theming docs**: https://koobiq.io/en/main/theming/overview

## Repository Structure

```
packages/
  design-tokens/       # published package (@koobiq/design-tokens)
    web/
      properties/      # source token files (colors.v2.json5, plt.json5, globals.json5, …)
      components/      # component-level tokens (deprecated)
  tokens-builder/      # style-dictionary config and transforms
tools/                 # build and generation scripts
dist/                  # build output (gitignored)
```

- Token source: `packages/design-tokens/web/properties/`
- Build output: `dist/design-tokens/web/new/` (OKLch, preferred) and `dist/design-tokens/web/` (legacy HSL)

## Key Commands

| Command                 | Description                                     |
| :---------------------- | :---------------------------------------------- |
| `yarn build`            | Clean and rebuild all token files into `dist/`  |
| `yarn generate:styling` | Regenerate `STYLING.md` from token source files |
| `yarn prettier:fix`     | Auto-format all files                           |
| `yarn eslint:fix`       | Auto-fix JS lint issues                         |

## Build System

- **Package manager**: yarn 4
- **Token processor**: [Style Dictionary](https://amzn.github.io/style-dictionary/) v3
- Token source format: JSON5
- Output formats: CSS custom properties, SCSS variables, JS/TS exports
- Two output tracks: `new/` (OKLch, use this) and legacy HSL (backward compat)

## Setup

```css
@import '@koobiq/design-tokens/web/new/css-tokens.css'; /* base / component tokens (:root) */
@import '@koobiq/design-tokens/web/new/css-tokens-light.css'; /* light theme (.kbq-light) */
@import '@koobiq/design-tokens/web/new/css-tokens-dark.css'; /* dark theme (.kbq-dark) */
```

```html
<body class="kbq-light">
    <!-- or kbq-dark -->
</body>
```

## Styling Rules

- **CSS variables are the API** — use `--kbq-*`; do not hardcode colors or sizes.
- **Global over component** — component-specific tokens (e.g. `--kbq-button-height`) are deprecated; use global tokens (e.g. `--kbq-size-xl`).
- **Semantic naming** — tokens are named by function (`error`, `contrast`, `theme`), not value (`red`, `blue`).

## Variable Pattern

```
--kbq-[category]-[semantic]-[variant?]
```

- **category**: `background`, `foreground`, `line`, `icon`, `size`, `shadow`
- **semantic**: `theme` (brand), `contrast` (neutral), `error`, `success`, `warning`
- **variant**: `secondary`, `tertiary`, `fade`, `less`, `hover`, `active`

### Semantic Roles

- **theme** — Brand identity. Active states (toggles, checkboxes), links, key interactive elements.
- **contrast** — Neutral foundation. Text, borders, backgrounds, primary buttons.
- **error** / **success** / **warning** — Status states.
- **on-contrast** — Colors for use on top of `--kbq-background-contrast`.
- **white** / **night** — Fixed brightness: bright or dark in both themes.

## Token Reference

See [`STYLING.md`](./STYLING.md) for the full token reference: colors, typography, sizes, shadows, and palette internals.
