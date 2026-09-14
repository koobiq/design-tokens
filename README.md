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

## ⚠️ Breaking changes in v4

v4 collapses the two parallel token tracks into one, drops the legacy HSL palette, and moves the
sources to the [W3C DTCG format](https://www.w3.org/community/design-tokens/).

### 1. Import paths

Everything now lives directly under `web/`.

| v3                                                | v4                                            |
| :------------------------------------------------ | :-------------------------------------------- |
| `@koobiq/design-tokens/web/new/index.bundled.css` | `@koobiq/design-tokens/web/index.bundled.css` |
| `@koobiq/design-tokens/web/new/index.css`         | `@koobiq/design-tokens/web/index.css`         |
| `@koobiq/design-tokens/web/new/css-tokens.css`    | `@koobiq/design-tokens/web/css-tokens.css`    |
| `@koobiq/design-tokens/web/css/**` (legacy HSL)   | **removed** — migrate to OKLch                |
| `@koobiq/design-tokens/web/_palette.scss`         | **removed** — see below                       |
| `@koobiq/design-tokens/web/css-tokens-font.css`   | **removed** — use `web/font.css`              |
| `@koobiq/design-tokens/web/deprecated/**`         | **removed**                                   |

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

- `--kbq-code-block-*-hljs-*` — syntax highlighting colours
- `--kbq-scrollbar-*`
- `--kbq-skeleton-*`

Their colours were remapped from the old HSL palette onto the semantic OKLch layer. The match is
perceptual, not exact (ΔE ≤ 0.07), so syntax highlighting and scrollbars shift very slightly.

They ship as their own opt-in triple, mirroring the `css-tokens*.css` naming, and are **not**
part of `index.css` / `index.bundled.css` — only consumers of those three components need them:

```css
@import '@koobiq/design-tokens/web/component-tokens.css'; /* sizes (:root) */
@import '@koobiq/design-tokens/web/component-tokens-light.css'; /* .kbq-light */
@import '@koobiq/design-tokens/web/component-tokens-dark.css'; /* .kbq-dark */
```

For the same reason `css-tokens*.css` now contains global tokens only.

### 4. Sources are DTCG now

`web/properties/*.json5` and `web/components/*.json5` use `$value` / `$type` / `$description` /
`$deprecated` instead of `value` / `description` / `deprecated`. If you read these files directly,
update your parser. Files were renamed: `colors.v2.json5` → `colors.json5`,
`shadows.v2.json5` → `shadows.json5`.

Typography presets and shadows are now composite tokens — one `typography` / `shadow` token
instead of a group of loose ones. **This does not change any CSS variable or SCSS name**; it only
changes the JSON shape. See [`TOKENS-WORKFLOW.md`](./TOKENS-WORKFLOW.md).

Token `$description`s now render as comments in the generated CSS.

### 5. `@koobiq/tokens-builder`

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
@import '@koobiq/design-tokens/web/index.bundled.css';
```

Or the manifest of individual imports:

```css
@import '@koobiq/design-tokens/web/index.css';
```

> **Only need some tokens?** Check `index.css` to see what's available and import just the files
> you need (e.g. `palette.css`, `light/semantic-colors.css`) instead of the full bundle.

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
  for adding tokens and re-theming, and a live playground for trying palettes out.

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
