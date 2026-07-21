# Design Tokens

<a aria-label="NPM version" href="https://www.npmjs.com/package/@koobiq/design-tokens">
  <img alt="" src="https://img.shields.io/npm/v/@koobiq/design-tokens?style=for-the-badge&labelColor=000000">
</a>

## How to build a distribution with tokens

- **Clone** this repository;
- **Install** the packages using: `yarn install`
- You can **build it** with this command: `yarn run build`
- Then **find your distribution** in the following folder: `/dist`

Here’s a clearer and more structured version for both developers and designers:

---

## 🎨 Using the tokens in your app

The package ships ready-made CSS entry points so you don't have to wire up individual token files. Two output tracks are available:

- `web/new/` — **OKLch** colors (recommended)
- `web/css/` — legacy **HSL** colors (backward compatibility)

Each track provides two entry points:

- **`index.bundled.css`** — every token flattened into a single stylesheet. **Use this in production** — it's one request, avoids the `@import` waterfall, and is deduplicated.
- **`index.css`** — a thin manifest that `@import`s the individual token files. Handy for development or when you want to cherry-pick/override specific files.

### Import

Production (single file, recommended):

```css
@import '@koobiq/design-tokens/web/new/index.bundled.css';
```

Or the manifest of individual imports:

```css
@import '@koobiq/design-tokens/web/new/index.css';
```

Legacy HSL track works the same way:

```css
@import '@koobiq/design-tokens/web/css/index.bundled.css';
```

> **Only need some tokens?** Check `index.css` to see what's available and import just the files you need (e.g. `palette.css`, `light/semantic-colors.css`) instead of the full bundle.

### Apply a theme

Tokens expose light and dark values under `.kbq-light` / `.kbq-dark`. Add the class to a root element:

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

> The OKLch entry point pulls the color-agnostic tokens (font, size, typography) from the sibling `web/css` track, so both directories ship together in the package.

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
