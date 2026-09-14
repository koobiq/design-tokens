# Working with Koobiq tokens

How the token layers fit together, and the recipes for the things you'll actually do:
add a color, re-theme the brand, add a new theme, deprecate something.

For the full list of tokens see [`STYLING.md`](./STYLING.md). For what changed in v4 see the
[breaking changes](./README.md#️-breaking-changes-in-v4).

> **Try it live.** `yarn build && yarn playground` opens a page where you can swap the brand,
> contrast and status families, change the radius, inspect the reference chain behind any
> element, and copy out a ready-made patch for `semantic.json5`.
>
> The same playground exists on the docs site under **Design tokens → Playground**, where the
> knobs drive the real Koobiq components. Use that one to judge a palette; use this one when you
> are working on the tokens themselves and don't want to rebuild the component library.

---

## The three layers

Every color in the system is three hops from a literal value:

```
  light.background.card          role         --kbq-background-card
        ↓ {semantic.contrast.2}
  semantic.contrast.2            alias        --kbq-semantic-contrast-2
        ↓ {plt.slate.2}
  plt.slate.2                    literal      --kbq-plt-slate-2: oklch(94.6% 0.0068 260.0)
```

And that survives all the way into the CSS, one `var()` per hop:

```css
.kbq-light {
    --kbq-background-card: var(--kbq-plt-white);
    --kbq-background-bg-secondary: var(--kbq-semantic-contrast-1);
}
:root {
    --kbq-semantic-contrast-1: var(--kbq-plt-slate-1);
    --kbq-plt-slate-1: oklch(96.9% 0.005 260);
}
```

| Layer                | File             | What it is                                                                   |
| :------------------- | :--------------- | :--------------------------------------------------------------------------- |
| `plt.*`              | `plt.json5`      | The engineering palette. The **only** place with literal OKLch values.       |
| `semantic.*`         | `semantic.json5` | A 1:1 alias of the engineering palette, named by meaning rather than by hue. |
| `light.*` / `dark.*` | `colors.json5`   | Roles — what a color is _for_. This is what product code uses.               |

### Why the middle layer isn't redundant

It looks like pointless duplication: `semantic.contrast.1` contains nothing but
`{plt.slate.1}`. It buys two things.

**Re-theming becomes a 40-line change.** To make the brand teal instead of blue you repoint
`semantic.theme.*` at `{plt.teal.*}`. Nothing in `colors.json5` changes, because no role ever
names a hue. Without the middle layer, every role referencing blue would have to be found and
edited by hand.

**The reference survives into the output.** Style Dictionary can only emit `var(--x)` when a
token's value is a reference _to another token_. The old v3 palette pointed at a whole group
(`"value": "{palette.grey}"`) and then indexed into the resolved object
(`{light.contrast.palette.value."6-A12"}`) — neither is a token, so those tokens flattened to
literal colors, and in Figma a designer saw a hardcoded hex instead of an alias. Style
Dictionary 5 rejects this outright. The 1:1 duplication is what keeps every hop a real token.

`tools/check-references.mjs` runs on every build and fails if the chain flattens.

---

## Naming

```
--kbq-[category]-[semantic]-[variant?]
```

- **category** — `background`, `foreground`, `line`, `icon`, `size`, `shadow`
- **semantic** — `theme` (brand), `contrast` (neutral), `error`, `success`, `warning`, `visited`
- **variant** — `secondary`, `tertiary`, `fade`, `less`, `hover`, `active`

Scales run `1–20` as perceptual steps, light to dark. Every family has a parallel `*A` alpha
ramp (`contrastA.8` is a translucent ink meant to composite over a light surface). Dark themes
use the `dark*` families: `plt.darkSlate`, `semantic.darkContrast`.

Rough guide to the ramp:

| Steps   | Use                                                      |
| :------ | :------------------------------------------------------- |
| `1–5`   | Very light tints — subtle backgrounds, `-less` / `-fade` |
| `8–10`  | Mid-range — overlays, faded states                       |
| `13–14` | Saturated — solid fills, links                           |
| `16–20` | Deep, high contrast — primary text, contrast backgrounds |

---

## Recipes

### Add a semantic color

Edit `colors.json5` only, and reference `{semantic.*}`:

```json5
{
    light: {
        background: {
            $type: 'color',
            'info-less': {
                $value: '{semantic.themeA.3}',
                $description: 'Container background for informational callouts.'
            }
        }
    },
    dark: {
        background: {
            $type: 'color',
            'info-less': { $value: '{semantic.darkThemeA.3}' }
        }
    }
}
```

Always add both themes. `$type` is inherited from the group, so you rarely write it per token.

Reaching straight into `{plt.*}` is reserved for tokens that are deliberately hue-locked —
`background-night`, `line-white` — where the whole point is that they don't follow the theme.

### Re-theme the brand

Only `semantic.json5` changes:

```json5
{
    semantic: {
        $type: 'color',
        theme: {
            1: { $value: '{plt.teal.1}' }, // was {plt.blue.1}
            2: { $value: '{plt.teal.2}' }
            // … 1–20, then themeA 1–20, then darkTheme and darkThemeA
        }
    }
}
```

Everything downstream follows automatically. Use the playground to pick the family, then copy
the generated patch.

### Add a theme

Themes are a `dark*` mirror of the semantic families plus a block in `colors.json5`. To add
e.g. a high-contrast theme:

1. Add `hcContrast`, `hcContrastA`, `hcTheme`, … to `semantic.json5`, pointing at whichever
   `plt.*` ramps you want.
2. Copy the `dark` block in `colors.json5` to `hc` and repoint its references.
3. Add a file entry in `packages/tokens-builder/configs/css.js` with
   `options: { selector: '.kbq-hc' }`, and add it to the `index.files` list.

### Deprecate a token

```json5
{
    'overlay-theme': {
        $value: '{semantic.themeA.8}',
        $deprecated: 'use --kbq-background-overlay-base-theme with --kbq-opacity-overlay'
    }
}
```

The notice becomes a comment in the generated CSS and the token drops out of `STYLING.md`.
`$deprecated: true` works too, but a replacement hint is much more useful.

### Add a typography preset

Typography presets are DTCG `typography` composites:

```json5
{
    typography: {
        'caption-mono': {
            $type: 'typography',
            $value: {
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: 'normal',
                fontWeight: 400,
                fontFamily: '{font.family.mono}',
                textTransform: 'initial',
                fontFeatureSettings: '"calt", "kern", "liga"'
            }
        }
    }
}
```

Sub-properties are camelCase because the spec says so. The build expands the composite back
into one token per sub-property, so you still get
`--kbq-typography-caption-mono-font-size` and `$typography-caption-mono-font-size`.

To reuse part of another preset, reference the sub-property directly:
`'{typography.text-normal.fontFamily}'`. That reference is preserved as a `var()` in the output.

### Add a shadow

Shadows are DTCG `shadow` composites — one layer object, or an array for multi-layer:

```json5
{
    shadow: {
        light: {
            'card-hover': {
                $type: 'shadow',
                $value: [
                    { color: '{light.shadow.outline}', offsetX: '0', offsetY: '0', blur: '0', spread: '1px' },
                    { color: '{light.shadow.key}', offsetX: '0', offsetY: '2px', blur: '8px', spread: '0' }
                ]
            }
        }
    }
}
```

They're rendered into a single `box-shadow` string, with each layer's color kept as a `var()`.

---

## DTCG and design tools

`web/properties/*.json5` and `web/components/*.json5` ship inside the npm package in
[W3C DTCG](https://www.w3.org/community/design-tokens/) form, so they can be fed straight into
Figma Variables import/export plugins, Tokens Studio, or anything else that speaks DTCG.

The three layers map onto three Figma variable collections, and because every hop is a real
token reference, `{semantic.contrast.1}` becomes a Figma **alias** rather than a pasted color —
so the "change the brand" move works the same way in Figma as it does here. Typography
composites map onto Figma text styles.

### Known deviations from the spec

Worth knowing if you point a strict validator at these files:

- **Scalar values are strings.** `$value: "oklch(96.9% 0.0050 260.0)"` and `$value: "8px"`,
  not the object forms (`{colorSpace, components}` / `{value, unit}`) of the 2025.10 draft.
  This is what Style Dictionary fully supports today and what current Figma plugins read.
- **Two extra typography sub-properties.** `textTransform` and `fontFeatureSettings` aren't part
  of the DTCG `typography` type. They back real CSS variables that are in use, so they stay.
  (Style Dictionary's own shorthand transform takes a similar liberty with `fontStyle` and
  `fontVariant`.)
- **Empty placeholder values.** The `hljs` tokens in `code-block.json5` with `$value: ''` are
  deliberate: they declare the variable so consumers can restyle that highlight.js class per
  theme without it being undefined.
