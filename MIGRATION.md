# Migrating from v3 to v4

The steps, in order. For what changed and why, see
[breaking changes](./README.md#breaking-changes-in-v4) — this page does not repeat it.

## 1. Install v4

The codemod checks your variables against the token set of the version you actually have, so
install before running it.

## 2. Run the codemod

It ships inside the package, so there is nothing extra to install:

```bash
npx koobiq-tokens-codemod src        # dry run, prints a report
npx koobiq-tokens-codemod src --write # apply the safe half
```

Point it at as many files or folders as you like. It reads the usual style and template
extensions and skips `node_modules`, `dist` and friends. In a monorepo where it cannot find the
package, pass `--tokens node_modules/@koobiq/design-tokens/web`.

**It rewrites** the moved import paths (`web/new/**` → `web/css/**`, aggregates to the root of
`web/`) and the ten tokens that have a one-for-one replacement.

**It reports, with a ⚠, what it will not guess at:**

| reported                                                   | what to do                                                                                                       |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `--kbq-palette-*`                                          | pick a step from `--kbq-semantic-*` by eye — the scale changed, see [§2](./README.md#2-the-old-palette-is-gone)  |
| `--kbq-background-overlay-theme` / `-error`                | became a pair: the `-base-` colour plus `--kbq-opacity-overlay` — [details below](#the-overlay-tokens-in-detail) |
| `--kbq-theme-default`, `--kbq-purple-default`              | v3 named no replacement; pick the v4 role for whatever the value colours                                         |
| component tokens (`--kbq-button-*`, `--kbq-alert-*`, …)    | use the global token each one aliased, see [§3](./README.md#3-component-tokens-are-gone)                         |
| `web/css/**`, `web/css-tokens*.css`, `web/_variables.scss` | the path is right, but on the legacy track the values behind it are now OKLch — re-check                         |

### The overlay tokens in detail

`--kbq-background-overlay-theme` and `--kbq-background-overlay-error` were a single translucent
colour — `{semantic.themeA.8}` and `{semantic.errorA.8}`. v4 splits that into an opaque base and
a separate opacity, so you compose the two yourself:

```diff
- background-color: var(--kbq-background-overlay-theme);
+ background-color: var(--kbq-background-overlay-base-theme);
+ opacity: var(--kbq-opacity-overlay);
```

Two things to watch, which is why the codemod reports these rather than rewriting them.

**`opacity` fades the element's children too.** If the overlay has content — a label, an icon,
a dashed border — that content fades with it. Put the colour on a `::before` or a dedicated
layer instead, or keep it in one value with `color-mix(in oklch, var(--kbq-background-overlay-base-theme) 90%, transparent)`.

**`opacity` may already be taken.** In `koobiq/angular-components` the dropzone overlay animates
its own appearance with `opacity: 0 → 1`, so a second `opacity` declaration would fight the
transition. That element needs the `color-mix()` form or a pseudo-element.

The result is not pixel-identical to v3 either: `themeA.8` and `theme.5` at 90% are different
colours. Look at the overlay after the swap.

## 3. Import the component tokens you use

They are opt-in in v4 and are **not** part of `index.css` / `index.bundled.css`:

```css
@import '@koobiq/design-tokens/web/css/components/code-block.css';
@import '@koobiq/design-tokens/web/css/components/scrollbars.css';
@import '@koobiq/design-tokens/web/css/components/skeleton.css';
```

Each carries its own `:root`, `.kbq-light` and `.kbq-dark`, so one import is the whole
component. `component-tokens{,-light,-dark}.css` at the root of `web/` still gives you all three
at once.

## 4. Check the two places that need eyes

- **Code blocks and scrollbars.** The only place v4 changes pixels without being asked —
  see [§3](./README.md#3-component-tokens-are-gone).
- **Anything that parsed the JSON sources.** They are DTCG now and two files were renamed; no
  CSS or SCSS name changed because of it — see [§5](./README.md#5-sources-are-dtcg-now).

Building your own tokens on `@koobiq/tokens-builder` needs more — see [§5](#5-if-you-build-tokens-yourself-update-the-pipeline).

## 5. If you build tokens yourself, update the pipeline

Only if you run Style Dictionary over `web/properties/*.json5`. Skip it if you consume the
generated CSS, SCSS or JS — which is nearly everyone.

The symptom is a hard failure, not a warning:

```
Reference doesn't exist: md-typography.md-h2.$value.fontFamily
tries to reference typography.display-compact.fontFamily
```

Style Dictionary 3 predates DTCG. It reads `$value` as an ordinary group key, so it indexes the
token as `typography.title.$value.lineHeight` while the reference says `typography.title.lineHeight`,
and nothing resolves. It throws before writing anything, so a pipeline that used to produce files
now produces none — and whatever it generated last stays in place, stale, until someone notices.

What it takes:

- **Style Dictionary ≥ 5** and **`@koobiq/tokens-builder` ≥ 4**. The builder is ESM-only and
  declares the Style Dictionary peer, so installing it pins the pair together.
- Custom hooks move to the v4/v5 API, and some are gone — see
  [§6](./README.md#6-koobiqtokens-builder) for the renames and the removed list.
- If you write your own platform config rather than taking the builder's, add its typography
  preprocessor: `preprocessors: ['kbq/expand-typography']`. Composite typography and shadow tokens
  do not resolve without it, and that is what the error above is really telling you.

## 6. Confirm

```bash
npx koobiq-tokens-codemod src
```

A clean run prints nothing. Anything left is something the codemod deliberately refuses to guess
at.
