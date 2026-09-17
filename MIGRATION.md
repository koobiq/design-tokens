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

| reported                                                   | what to do                                                                                                      |
| :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `--kbq-palette-*`                                          | pick a step from `--kbq-semantic-*` by eye — the scale changed, see [§2](./README.md#2-the-old-palette-is-gone) |
| `--kbq-background-overlay-theme` / `-error`                | became a pair: the `-base-` colour plus `--kbq-opacity-overlay`                                                 |
| `--kbq-theme-default`, `--kbq-purple-default`              | v3 named no replacement; pick the v4 role for whatever the value colours                                        |
| component tokens (`--kbq-button-*`, `--kbq-alert-*`, …)    | use the global token each one aliased, see [§3](./README.md#3-component-tokens-are-gone)                        |
| `web/css/**`, `web/css-tokens*.css`, `web/_variables.scss` | the path is right, but on the legacy track the values behind it are now OKLch — re-check                        |

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

Building your own tokens on `@koobiq/tokens-builder` needs more —
see [§6](./README.md#6-koobiqtokens-builder).

## 5. Confirm

```bash
npx koobiq-tokens-codemod src
```

A clean run prints nothing. Anything left is something the codemod deliberately refuses to guess
at.
