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
      properties/      # source token files (plt.json5, semantic.json5, colors.json5, …)
      components/      # the three component tokens that survived v4
    codemod/           # v3 → v4 migration script, shipped as `koobiq-tokens-codemod`
  tokens-builder/      # style-dictionary config, hooks and preprocessors
tools/                 # build, checks, docs generation
dist/                  # build output (gitignored)
```

- Token source: `packages/design-tokens/web/properties/` — [W3C DTCG](https://www.w3.org/community/design-tokens/) format
- Build output: `dist/design-tokens/web/`

```
dist/design-tokens/web/
  css/                 # every token file sliced by category
    index.css          #   manifest of @imports; index.bundled.css is the flattened one
    palette/ semantic-palette/ light/ dark/
    components/        #   one self-contained file per component (all selectors inside)
  css-tokens*.css      # aggregates — the slices stitched back together
  component-tokens*.css
  _variables.scss  js/ # unchanged from v3
```

Slices live under `css/`, aggregates at the root of `web/`. When adding an output file, put it
on the side of that line it belongs to, and add it to `index.files` only if it is a slice.

## Key Commands

| Command                 | Description                                     |
| :---------------------- | :---------------------------------------------- |
| `yarn build`            | Clean and rebuild all token files into `dist/`  |
| `yarn generate:styling` | Regenerate `STYLING.md` from token source files |
| `yarn prettier:fix`     | Auto-format all files                           |
| `yarn eslint:fix`       | Auto-fix JS lint issues                         |

## Build System

- **Package manager**: yarn 4
- **Token processor**: [Style Dictionary](https://styledictionary.com/) v5 (ESM-only, Node >= 22)
- Token source format: JSON5 in DTCG syntax — `$value`, `$type`, `$description`, `$deprecated`
- Output formats: CSS custom properties, SCSS variables, JS/TS exports
- Colors are OKLch throughout

## Token Layers

Three layers, each referencing the one below. Keep it that way — the chain is what makes
re-theming possible, and `tools/check-references.mjs` fails the build if it breaks.

```
light.* / dark.*   roles      --kbq-background-card
      ↓
semantic.*         1:1 alias  --kbq-semantic-contrast-1
      ↓
plt.*              literals   --kbq-plt-slate-1: oklch(96.9% 0.0050 260.0)
```

Write new role tokens against `{semantic.*}`, not `{plt.*}`. See
[`TOKENS-WORKFLOW.md`](./TOKENS-WORKFLOW.md).

For Figma-to-token color comparisons, use
[`FIGMA-COLOR-COMPARISON.md`](./FIGMA-COLOR-COMPARISON.md).

## Styling Rules

- **CSS variables are the API** — use `--kbq-*`; do not hardcode colors or sizes.
- **Global over component** — component-specific tokens were removed in v4; use global tokens (e.g. `--kbq-size-xl`). Only `code-block` syntax colors, `scrollbar` and `skeleton` remain.
- **Semantic naming** — tokens are named by function (`error`, `contrast`, `theme`), not value (`red`, `blue`).
- **Sources are DTCG** — write `$value`, not `value`. Group-level `$type` is inherited.

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
