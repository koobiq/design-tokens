# Design Tokens

<a aria-label="NPM version" href="https://www.npmjs.com/package/@koobiq/design-tokens">
  <img alt="" src="https://img.shields.io/npm/v/@koobiq/design-tokens?style=for-the-badge&labelColor=000000">
</a>

## How to build a distribution with tokens

- **Clone** this repository;
- **Install** the packages using: `yarn install`
- You can **build it** with this command: `yarn run build`
- Then **find your distribution** in the following folder: `/dist`

---

## Breaking changes in v4

v4 collapses the two parallel token tracks into one, drops the legacy HSL palette, and moves the
sources to the [W3C DTCG format](https://www.w3.org/community/design-tokens/).

> **Migrating?** Start with [`MIGRATION.md`](./MIGRATION.md) — a codemod ships in the package
> and does the mechanical half for you:
>
> ```bash
> npx koobiq-tokens-codemod src
> ```

### 1. Import paths

The `web/new/` track is gone. Individual token files now live under `web/css/`, and the
aggregates that stitch them back together sit at the root of `web/` — so you can tell a slice
from the whole thing by where it lives.

| v3                                                  | v4                                                  |
| :-------------------------------------------------- | :-------------------------------------------------- |
| `@koobiq/design-tokens/web/new/index.bundled.css`   | `@koobiq/design-tokens/web/css/index.bundled.css`   |
| `@koobiq/design-tokens/web/new/index.css`           | `@koobiq/design-tokens/web/css/index.css`           |
| `@koobiq/design-tokens/web/new/palette.css`         | `@koobiq/design-tokens/web/css/palette.css`         |
| `@koobiq/design-tokens/web/new/light/**`, `dark/**` | `@koobiq/design-tokens/web/css/light/**`, `dark/**` |
| `@koobiq/design-tokens/web/new/css-tokens.css`      | `@koobiq/design-tokens/web/css-tokens.css`          |
| `@koobiq/design-tokens/web/css/**` (legacy HSL)     | **removed** — migrate to OKLch                      |
| `@koobiq/design-tokens/web/_palette.scss`           | **removed** — see below                             |
| `@koobiq/design-tokens/web/css-tokens-font.css`     | **removed** — use `web/css/font.css`                |
| `@koobiq/design-tokens/web/deprecated/**`           | **removed**                                         |

Note that `web/css/**` existed in v3 as the legacy HSL track and now holds the OKLch one, so the
path is the same but the contents are not: the variables inside are `--kbq-plt-*` /
`--kbq-semantic-*`, never `--kbq-palette-*`.

SCSS (`web/_variables.scss` and friends) and JS (`web/js/`) are unchanged.

### 2. The old palette is gone

All 921 `--kbq-palette-*` variables were removed. Replace them with the engineering palette
(`--kbq-plt-*`, raw OKLch ramps) or — preferably — the semantic palette (`--kbq-semantic-*`),
which is what the rest of the system references.

| v3 family        | v4 engineering | v4 semantic         |
| :--------------- | :------------- | :------------------ |
| `palette.grey`   | `plt.slate`    | `semantic.contrast` |
| `palette.blue`   | `plt.blue`     | `semantic.theme`    |
| `palette.red`    | `plt.red`      | `semantic.error`    |
| `palette.green`  | `plt.green`    | `semantic.success`  |
| `palette.yellow` | `plt.yellow`   | `semantic.warning`  |
| `palette.purple` | `plt.purple`   | `semantic.visited`  |

> **The scale changed too.** v3 ran `0–100` (HSL lightness, so `grey.60` meant 60% lightness).
> v4 runs `1–20` perceptual steps, plus a parallel `*A` alpha ramp. There is no arithmetic that
> converts between them — pick the step that looks right, or read the mapping in
> [`STYLING.md`](./STYLING.md). Dark themes use the `dark*` families (`plt.darkSlate`,
> `semantic.darkContrast`).

Because SCSS `$palette` only ever held v3 tokens, `_palette.scss` is no longer built.

### 3. Component tokens are gone

Component-level tokens for 47 components (`--kbq-button-*`, `--kbq-alert-*`, `--kbq-tabs-*`, …)
were removed. They had all been marked deprecated and each maps onto a global token — use
`--kbq-size-*`, `--kbq-background-*`, `--kbq-foreground-*` directly.

Three survived, because they express something global tokens cannot:

- `--kbq-code-block-hljs-*` — syntax highlighting colours (highlight.js classes only)
- `--kbq-scrollbar-*`
- `--kbq-skeleton-*`

Their colours moved off the old HSL palette. Scrollbar and skeleton colours point at the semantic
layer, perceptually matched rather than exact (ΔE ≤ 0.07), so they shift very slightly.

The `code-block` syntax colours point straight at the engineering palette (`--kbq-plt-*`) instead,
matching how `koobiq/angular-components` renders them. That is deliberate: syntax highlighting is
hue-locked, so recolouring the brand through the semantic layer leaves code blocks alone.

`code-block` is now only the highlight.js classes. The four chrome gradients that used to sit
alongside them — `--kbq-code-block-{filled,outline}-actionbar-fade-gradient` and
`--kbq-code-block-{filled,outline}-collapse-collapsed-background` — are removed:
`koobiq/angular-components` defines its own and never read these, and the two had already drifted
apart.

They are opt-in and **not** part of `index.css` / `index.bundled.css` — only consumers of those
three components need them. Import them one component at a time:

```css
@import '@koobiq/design-tokens/web/css/components/code-block.css';
@import '@koobiq/design-tokens/web/css/components/scrollbars.css';
@import '@koobiq/design-tokens/web/css/components/skeleton.css';
```

Each of those is self-contained — it carries its own `:root`, `.kbq-light` and `.kbq-dark`
blocks, so one import is the whole component. `code-block` is 34 of the 68 component variables,
so a consumer who only wants a styled scrollbar takes 1.7 kB rather than the full 6.3 kB.

If you do want all of them, the aggregate triple is still there, mirroring the `css-tokens*.css`
naming:

```css
@import '@koobiq/design-tokens/web/component-tokens.css'; /* sizes (:root) */
@import '@koobiq/design-tokens/web/component-tokens-light.css'; /* .kbq-light */
@import '@koobiq/design-tokens/web/component-tokens-dark.css'; /* .kbq-dark */
```

For the same reason `css-tokens*.css` now contains global tokens only.

### 4. Deprecated tokens are gone

Everything that carried a deprecation notice in v3 has been removed. Each had a documented
replacement:

| removed                              | use instead                                                     |
| :----------------------------------- | :-------------------------------------------------------------- |
| `--kbq-background-overlay-theme`     | `--kbq-background-overlay-base-theme` + `--kbq-opacity-overlay` |
| `--kbq-background-overlay-error`     | `--kbq-background-overlay-base-error` + `--kbq-opacity-overlay` |
| `--kbq-foreground-error-less`        | `--kbq-foreground-error-tertiary`                               |
| `--kbq-foreground-success-less`      | `--kbq-foreground-success-tertiary`                             |
| `--kbq-states-background-error-less` | `--kbq-background-error-tertiary`                               |
| `--kbq-states-disabled-opacity`      | `--kbq-opacity-disabled`                                        |

The `-hover` / `-active` variants of `--kbq-states-background-error-less-*` were never
deprecated and are untouched.

Separately, the 183 `--kbq-code-block-*hljs-*` variables that v3 declared with an empty value are
no longer emitted as CSS. `--kbq-x: ;` is valid, but it is not the same as leaving the property
undeclared: `var(--kbq-x, teal)` uses the fallback only while `--kbq-x` is undeclared, so
shipping them empty silently swallowed the fallback and resolved to nothing.

The tokens themselves are still there. They carry `$value: null`, which is what
`koobiq/angular-components` already says about the same classes in `code-block-tokens.scss` — the
class is part of the vocabulary but deliberately unstyled. Null tokens reach `_variables.scss` as
`null`, exactly as Sass means it, and are skipped in CSS and JS, which have no way to say it.

### 5. One variable name was misspelled and is now fixed

| v3                                    | v4                                          |
| :------------------------------------ | :------------------------------------------ |
| `--kbq-states-background-highcurrent` | `--kbq-states-background-highlight-current` |

Theme-scoped tokens drop the theme from their variable name, and v3 did that by cutting `light-`
out of the name string — which also found it in the middle of `highlight-current`. The source
token has always been `highlight-current`, and `_variables.scss` has always spelled it in full as
`$light-states-background-highlight-current`; only the CSS custom property was affected.

The codemod rewrites this one.

### 6. Sources are DTCG now

`web/properties/*.json5` and `web/components/*.json5` use `$value` / `$type` / `$description` /
`$deprecated` instead of `value` / `description` / `deprecated`. If you read these files directly,
update your parser. Files were renamed: `colors.v2.json5` → `colors.json5`,
`shadows.v2.json5` → `shadows.json5`.

Typography presets and shadows are now composite tokens — one `typography` / `shadow` token
instead of a group of loose ones, with an object `$value` keyed by the spec's camelCase names
(`fontSize`, `lineHeight`, `offsetX`). **This does not change any CSS variable or SCSS name**; it
only changes the JSON shape. It does change references written against a sub-property —
`{typography.title.font-size}` is now `{typography.title.fontSize}` — which matters only if you
keep token sources of your own; see
[the migration guide](./MIGRATION.md#5-if-you-build-tokens-yourself-update-the-pipeline) and
[`TOKENS-WORKFLOW.md`](./TOKENS-WORKFLOW.md).

Token `$description`s now render as comments in the generated CSS.

### 7. `@koobiq/tokens-builder`

ESM-only, requires Style Dictionary 5 (a peer dependency now) and Node ≥ 22. Custom hooks moved
to the v4/v5 API (`matcher` → `filter`, `transformer` → `transform`, `formatter` → `format`).
Removed hooks: `kbq-scss/palette`, `kbq-css/palette`, the `palette` / `color` / `css-variables*`
filters, `kbq-attribute/palette` and `kbq/prefix`.

---

## 🎨 Using the tokens in your app

The package ships ready-made CSS entry points so you don't have to wire up individual token files.
Colors are [OKLch](https://oklch.com/) throughout.

Two entry points are available:

- **`index.bundled.css`** — every token flattened into a single stylesheet. **Use this in
  production** — it's one request, avoids the `@import` waterfall, and is deduplicated.
- **`index.css`** — a thin manifest that `@import`s the individual token files. Handy for
  development or when you want to cherry-pick/override specific files.

### Import

Production (single file, recommended):

```css
@import '@koobiq/design-tokens/web/css/index.bundled.css';
```

Or the manifest of individual imports:

```css
@import '@koobiq/design-tokens/web/css/index.css';
```

> **Only need some tokens?** Check `index.css` to see what's available and import just the files
> you need (e.g. `web/css/palette.css`, `web/css/light/semantic-colors.css`) instead of the full bundle.

### Apply a theme

Tokens expose light and dark values under `.kbq-light` / `.kbq-dark`. Add the class to a root
element:

```html
<body class="kbq-light">
    <!-- or class="kbq-dark" -->
</body>
```

Then reference the CSS variables in your styles — never hardcode values:

```css
.card {
    color: var(--kbq-foreground-contrast);
    background: var(--kbq-background-theme);
}
```

## 📖 Further reading

- [`STYLING.md`](./STYLING.md) — the full token reference: colors, typography, sizes, shadows.
- [`TOKENS-WORKFLOW.md`](./TOKENS-WORKFLOW.md) — how the three token layers fit together, recipes
  for adding tokens and re-theming.
- [`FIGMA-COLOR-COMPARISON.md`](./FIGMA-COLOR-COMPARISON.md) — comparing Figma colors with tokens.

## 🚀 Releasing Packages

**🔹 Only maintainers should perform releases.**  
All releases must be made from `release branches` or `main`.

### 🔄 Simple Release

1. **Switch to `main`:**
    ```sh
    git checkout main
    ```
2. **Run the release command:**

    ```sh
    yarn run stage:commit
    ```

    This command will:
    - Prompt you to choose the version bump (**needs validation**).
    - Ask for a **release name** (**needs validation**).
    - Generate a **changelog** (**needs validation**).
    - Create a commit with the changelog.
    - Tag the release in Git.
    - Push the release commit and tag (including the updated `package.json`).

3. **Wait for the pipeline to finish.**

---

### 🔥Major Version Release

1. **Create a new release branch from `main`**
    ```sh
    git checkout -b 1.0.x main
    ```
2. **Follow steps 2 and 3 from the Simple Release section.**

---

### ✨Minor Version Release

1. **Create a new branch from the existing release branch**
    - Example: If the current branch is `3.0.x`, create a new branch:
        ```sh
        git checkout -b 3.1.x 3.0.x
        ```
2. **Follow steps 2 and 3 from the Simple Release section.**

---

### 🛠️ Patch Version Release

1. **Use the existing release branch.** No need to create a new one.
2. **Follow steps 2 and 3 from the Simple Release section, but select a patch version bump.**

---
