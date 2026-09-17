# Migrating from v3 to v4

v4 collapses the two parallel token tracks into one, removes the legacy HSL palette, and moves
the sources to the [W3C DTCG format](https://www.w3.org/community/design-tokens/).

For the full list of what changed and why, see
[breaking changes](./README.md#️-breaking-changes-in-v4). This page is the how-to.

---

## Run the codemod first

It ships inside the package, so there is nothing extra to install:

```bash
npx koobiq-tokens-codemod src
```

That is a dry run — it prints what it would change and what it cannot. Apply the safe half with:

```bash
npx koobiq-tokens-codemod src --write
```

Point it at as many files or folders as you like (`src`, `libs/ui`, `styles/app.scss`).
`node_modules`, `dist` and friends are skipped.

It reads `.css`, `.scss`, `.sass`, `.less`, `.styl`, `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`,
`.cjs`, `.vue`, `.svelte` and `.html`.

> The codemod checks your variables against the token set of the v4 you actually have installed,
> not a hardcoded list — so install v4 before running it. If it cannot find the package (a
> monorepo with an unusual layout, say), pass `--tokens node_modules/@koobiq/design-tokens/web`.

### What it fixes for you

**Import paths.** `web/new/` is gone. Sliced files moved under `web/css/`; the aggregates stayed
at the root of `web/`:

```diff
- @import '@koobiq/design-tokens/web/new/index.bundled.css';
+ @import '@koobiq/design-tokens/web/css/index.bundled.css';

- @import '@koobiq/design-tokens/web/new/css-tokens-light.css';
+ @import '@koobiq/design-tokens/web/css-tokens-light.css';

- @use '@koobiq/design-tokens/web/new/variables';
+ @use '@koobiq/design-tokens/web/variables';
```

**Tokens with a drop-in replacement:**

| removed                              | replaced with                       |
| :----------------------------------- | :---------------------------------- |
| `--kbq-foreground-error-less`        | `--kbq-foreground-error-tertiary`   |
| `--kbq-foreground-success-less`      | `--kbq-foreground-success-tertiary` |
| `--kbq-states-background-error-less` | `--kbq-background-error-tertiary`   |
| `--kbq-states-disabled-opacity`      | `--kbq-opacity-disabled`            |

The `-hover` / `-active` variants of `--kbq-states-background-error-less-*` were never deprecated
and are left alone.

### What it only reports

These need a decision, so the codemod points at them and stops.

**Overlays now take an opacity.** Two tokens became a pair, and only you know where the second
declaration belongs:

```diff
- background: var(--kbq-background-overlay-theme);
+ background: var(--kbq-background-overlay-base-theme);
+ opacity: var(--kbq-opacity-overlay);
```

Same shape for `--kbq-background-overlay-error`.

**The old palette.** All 921 `--kbq-palette-*` variables are gone. Use `--kbq-plt-*` (the
engineering ramps) or, preferably, `--kbq-semantic-*`:

| v3 family        | v4 engineering | v4 semantic         |
| :--------------- | :------------- | :------------------ |
| `palette.grey`   | `plt.slate`    | `semantic.contrast` |
| `palette.blue`   | `plt.blue`     | `semantic.theme`    |
| `palette.red`    | `plt.red`      | `semantic.error`    |
| `palette.green`  | `plt.green`    | `semantic.success`  |
| `palette.yellow` | `plt.yellow`   | `semantic.warning`  |
| `palette.purple` | `plt.purple`   | `semantic.visited`  |

There is no arithmetic that converts the steps: v3 ran `0–100` as HSL lightness, v4 runs `1–20`
as perceptual steps. `--kbq-palette-grey-60` is not `--kbq-semantic-contrast-12`. Pick the step
that looks right against [`STYLING.md`](./STYLING.md), or use the playground on the docs site to
compare them side by side.

**Component tokens.** 47 components' tokens were removed — `--kbq-button-*`, `--kbq-alert-*`,
`--kbq-tabs-*` and the rest. Each was already deprecated and each aliased a global token, so
reach for `--kbq-size-*`, `--kbq-background-*`, `--kbq-foreground-*` directly. Only `code-block`,
`scrollbar` and `skeleton` survive.

**Paths whose meaning changed.** `web/css/**`, `web/css-tokens*.css` and `web/_variables.scss`
exist in both versions, but in v3 they were the legacy HSL track and in v4 they hold the OKLch
one. The import stays as it is; the colours behind it do not. The codemod flags these only in
files that still look like legacy-track code, so a migrated project stays quiet.

---

## Then do the parts a tool cannot

### 1. Opt in to the component tokens you use

They are no longer part of `index.css` / `index.bundled.css`. Import one file per component:

```css
@import '@koobiq/design-tokens/web/css/components/code-block.css';
@import '@koobiq/design-tokens/web/css/components/scrollbars.css';
@import '@koobiq/design-tokens/web/css/components/skeleton.css';
```

Each is self-contained — `:root`, `.kbq-light` and `.kbq-dark` all live in the one file. If you
would rather have all three at once, `component-tokens{,-light,-dark}.css` at the root of `web/`
still does that.

### 2. Re-check anything that read the JSON sources

`web/properties/*.json5` and `web/components/*.json5` are DTCG now: `$value`, `$type`,
`$description`, `$deprecated` rather than `value` / `description` / `deprecated`. Two files were
renamed — `colors.v2.json5` → `colors.json5`, `shadows.v2.json5` → `shadows.json5` — and
typography and shadows became composite tokens. **No CSS variable or SCSS name changed because of
this**; only the JSON shape did.

### 3. Look at code blocks and scrollbars

Scrollbar and skeleton colours moved from the old HSL palette onto the semantic OKLch layer,
perceptually matched rather than exact (ΔE ≤ 0.07), so they shift very slightly. The `code-block`
syntax colours point straight at the engineering palette (`--kbq-plt-*`) to match how
`koobiq/angular-components` renders them — so they are hue-locked, and recolouring the brand
through the semantic layer no longer touches them. This is the only place in v4 where pixels
change without you asking.

85 `--kbq-code-block-hljs-*` variables that used to be emitted with an empty value are no longer
emitted at all. This is a fix, not a loss: `--kbq-x: ;` is valid CSS but is _not_ the same as an
absent property — it suppresses `var(--kbq-x, fallback)` and resolves to nothing, which made those
highlight.js classes harder to restyle than if the token had never existed. If you were working
around that, you can stop.

### 4. If you build your own tokens

`@koobiq/tokens-builder` is ESM-only and needs Style Dictionary 5 (a peer dependency now) and
Node ≥ 22. Custom hooks move to the v4/v5 API — `matcher` → `filter`, `transformer` → `transform`,
`formatter` → `format`. Style Dictionary publishes
[its own codemods](https://styledictionary.com/version-4/migration/) for that half.

Removed hooks: `kbq-scss/palette`, `kbq-css/palette`, the `palette` / `color` / `css-variables*`
filters, `kbq-attribute/palette` and `kbq/prefix`.

---

## Checking you are done

```bash
npx koobiq-tokens-codemod src
```

A clean run prints no findings. Anything left is something the codemod deliberately refuses to
guess at.
