# Shadows: Figma variables and design tokens

How the `Shadow` variable collection in Figma maps to the shadow tokens in
[`shadows.json5`](./packages/design-tokens/web/properties/shadows.json5). Figma is the reference,
the tokens in code mirror it 1:1. The one allowed difference is that code uses composite
(`$type: 'shadow'`) tokens where Figma uses effect styles.

## What a shadow is made of

Every shadow has exactly three layers, always in this order:

| Layer     | Role                                         |
| :-------- | :------------------------------------------- |
| `outline` | 1px outer border (spread), minimal elevation |
| `key`     | the main, directional shadow                 |
| `ambient` | the soft, wide shadow                        |

The set of layers never changes. A shadow that does not use a layer keeps it, and **the values of
its variables are zeroed** (offsets, blur and spread `0px`, color transparent). Nobody removes a
layer or a variable to express "unused".

Every layer has five parameters, in the same order as CSS `box-shadow`:
`x`, `y`, `blur`, `spread`, `color` (tokens: `offsetX`, `offsetY`, `blur`, `spread`, `color`).
Keep this order everywhere: variables in the collection, token attributes, bound fields of styles.

## Two kinds of shadows

|                       | Flat: `card`, `popup`, `overlay`    | Directional: `overflow-compact`, `overflow-normal`           |
| :-------------------- | :---------------------------------- | :----------------------------------------------------------- |
| Falls                 | down                                | to one of four sides                                         |
| Sides                 | none                                | `top`, `right`, `bottom`, `left`                             |
| Layer parameters      | `x`, `y`, `blur`, `spread`, `color` | `offset`, `offset-neg`, `cross`, `blur`, `spread`, `color`   |
| Final per-side values | —                                   | `x`, `y`, `blur`, `spread`, `color` for every side and layer |

Only the `overflow` group has sides. Do not add them to the flat shadows.

## Figma variables → tokens

Collection `Shadow`, modes `Light` and `Dark`. Names are paths; `/` in Figma is `.` in tokens.

### Flat shadows

| Figma                                  | Token                                        |
| :------------------------------------- | :------------------------------------------- |
| `Shadow/card/<layer>/x`                | `shadow.light\|dark.card[i].offsetX`         |
| `Shadow/card/<layer>/y`                | `shadow.light\|dark.card[i].offsetY`         |
| `Shadow/card/<layer>/blur`, `…/spread` | `shadow.light\|dark.card[i].blur`, `.spread` |
| `Shadow/card/<layer>/color`            | `shadow.light\|dark.card[i].color`           |

`i` is the layer index: `outline` 0, `key` 1, `ambient` 2. Same for `popup` and `overlay`.

There are **no parameter tokens** for flat shadows. The values are written directly in the
composite, one object per layer. Colors are the public roles `{light.shadow.outline|key|ambient}` /
`{dark.shadow.…}`, which point at the semantic palette (in Figma the color variables alias the
library's Semantic variables directly, e.g. `semantic/contrastA/…`).

### Directional shadows

Two levels of variables, both exist in Figma:

1. **Layer variables** (`base`), the source of truth:

    | Figma                                             | Token                                                     |
    | :------------------------------------------------ | :-------------------------------------------------------- |
    | `Shadow/<overflow>/base/<layer>/offset`           | `shadow.<overflow>.base.<layer>.offset`                   |
    | `Shadow/<overflow>/base/<layer>/offset-neg`       | `shadow.<overflow>.base.<layer>.offset-neg`               |
    | `Shadow/<overflow>/base/<layer>/cross`            | `shadow.<overflow>.base.<layer>.cross`                    |
    | `Shadow/<overflow>/base/<layer>/blur`, `…/spread` | `shadow.<overflow>.base.<layer>.blur`, `.spread`          |
    | `Shadow/<overflow>/base/<layer>/color`            | `light.shadow.<overflow>.base.<layer>.color` and `dark.…` |

2. **Per-side variables**, aliases of the layer variables:

    | Figma                                                          | Token                                                                          |
    | :------------------------------------------------------------- | :----------------------------------------------------------------------------- |
    | `Shadow/<overflow>/<side>/<layer>/<x\|y\|blur\|spread\|color>` | attributes of the layer object `[i]` in `shadow.light\|dark.<overflow>-<side>` |

    The per-side values are not separate tokens in code. They are the layer objects inside the
    `$value` array of the composite `shadow.light|dark.<overflow>-<side>`, and each attribute
    points at a layer variable (`{shadow.<overflow>.base.<layer>.offset}` and so on).

## Offsets: `offset`, `offset-neg`, `cross`

The main axis is **vertical**; positive values go **down** and **right**.

| Name         | Meaning                                                                       |
| :----------- | :---------------------------------------------------------------------------- |
| `offset`     | Distance along the main axis, in the positive direction (down or right)       |
| `offset-neg` | The same distance the other way (up or left). Its value is `-offset`          |
| `cross`      | The additional axis, perpendicular to the one the side uses. `0px` by default |

Each side picks `x` and `y` from those three:

| Side     | `x`          | `y`          |
| :------- | :----------- | :----------- |
| `top`    | `cross`      | `offset-neg` |
| `right`  | `offset`     | `cross`      |
| `bottom` | `cross`      | `offset`     |
| `left`   | `offset-neg` | `cross`      |

So `overflow-normal` / `key` with `offset = 9px`, `offset-neg = -9px`, `cross = 0px` gives
`0 -9px` for `top`, `9px 0` for `right`, `0 9px` for `bottom` and `-9px 0` for `left`.

### Why there is an `offset-neg` and no `-offset`

**Figma variables cannot be negated, scaled or computed**, and there are no modifiers. A shadow
that falls up or left needs a negative number, so the negative is a variable of its own with its
own value. The code follows Figma, so `offset-neg` is a plain value there too, not `calc(-1 * …)`.

The price is that the pair can drift apart. Change both together. `tools/check-references.mjs`
fails the build when `offset` and `offset-neg` of any layer are not exact opposites.

## How shadows are applied: effect styles

Variables only hold numbers and colors. A shadow is applied through an **effect style**, which has
the three `DROP_SHADOW` effects (outline, key, ambient) with every field bound to a variable.

- Styles: `Shadow/card`, `Shadow/popup`, `Shadow/overlay`, and
  `Shadow/overflow-<compact|normal>/<top|right|bottom|left>` (11 in total).
- **Every parameter of every effect is bound to a variable, zero ones included.** An unbound zero
  can never be changed through tokens.
- Flat styles bind to `Shadow/<shadow>/<layer>/…`; directional styles bind to the per-side
  variables `Shadow/<overflow>/<side>/<layer>/…`.
- A layer that is transparent in **both** modes is not written to the style (for example
  `overflow-compact` has only the outline). A layer that is visible in one mode stays, even if it
  is transparent in the other: a style cannot differ between Light and Dark.
- The description of a style holds the CSS variable that ships in code
  (`--kbq-shadow-overflow-normal-top`).
- The description of a final variable holds the JS path of the matching attribute in the composite
  (for example `shadow.light.overflow-normal-top[1].offsetX`).

Figma note: on a frame with **Clip content** off the spread of a shadow is ignored, so previews
look heavier than on the web. Turn Clip content on for the element that carries the style.

## What ships in code

- The CSS variables are only the finals, `--kbq-shadow-card`, `--kbq-shadow-overflow-normal-top`,
  and the color roles `--kbq-shadow-outline|key|ambient`. Parameter tokens (`offset`, `base.*`,
  and so on) are **sources only**: no CSS, Sass or JS variable of their own.
- The value of a composite is assembled from its original value, with parameters replaced by their
  literals and colors kept as `var()` of the shipped role, so re-theming keeps working.
- A layer with a transparent color is dropped per theme before rendering, so the output of a theme
  that uses only the outline is a one-layer `box-shadow`.
- Every shadow token is `$type: 'shadow'`: the build tells a composite from a parameter by it.

## Changing a shadow

1. Change the value in `shadows.json5` (or the Figma variable first, since Figma is the reference).
2. Keep both sides in sync: the Figma variable and the token have the same name and value.
3. For directional shadows keep `offset` and `offset-neg` equal in magnitude.
4. New parameters keep the `x y blur spread color` order and get bound in the effect style.
5. `yarn build` runs `check-references`, which guards the shape of the shadows, the mirrors and
   the side sources.
