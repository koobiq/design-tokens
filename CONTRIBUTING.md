# Contributing to Koobiq Design Tokens

Thank you for helping improve the Koobiq design tokens. This guide explains how to propose a change, set up the repository and get a pull request merged.

Contributions are accepted under the [MIT License](LICENSE).

## Questions, bugs and ideas

- Ask questions in [GitHub Discussions](https://github.com/koobiq/design-tokens/discussions), not in issues.
- Report a bug in an [issue](https://github.com/koobiq/design-tokens/issues/new): the token, the theme, the package version, the expected and the actual value, and a screenshot. Search the existing issues first.
- Designers: propose a new or changed token in an issue. Say what the token is for and where it is used, give its value in the light and the dark theme (an existing palette step or a Figma variable), and link the Figma frame or attach screenshots. Tokens are named by function, not by hue, as [the naming rules](TOKENS-WORKFLOW.md#naming) describe.
- Send a small change straight as a pull request: a wrong value or reference in an existing token, a fix in the build tools or the codemod, or a correction in the docs.
- Discuss a large change in an issue before writing code: a new token or palette family, a change to the engineering palette or the visual language, or a breaking change such as renaming or removing a token or an output file.

## Setup

- Use the Node.js version from [`.nvmrc`](.nvmrc). Yarn 4 is checked into the repository (`yarnPath` in [`.yarnrc.yml`](.yarnrc.yml)), so any `yarn` runs that version. If Yarn is not installed, run `corepack enable`.
- Install the dependencies: `yarn install`.
- Enable the git hooks once: `yarn husky`. Before each commit they format the staged files with Prettier, lint the staged `.js` files and validate the commit message.

The package layout and the token layers are described in [AGENTS.md](AGENTS.md); using the tokens in an app is described in the [README](README.md).

## Making a change

1. Fork the repository, or push a branch to it if you have write access. Create the branch from `main`.
2. Edit the token sources in `packages/design-tokens/web/properties/` (`web/components/` holds the three remaining component token sets). [TOKENS-WORKFLOW.md](TOKENS-WORKFLOW.md) has the recipes: reference `{semantic.*}` from role tokens, add both themes, deprecate a token instead of removing it.
3. Do not edit generated files by hand:
    - `STYLING.md` is built from the sources and `tools/styling.md.ejs` by `yarn generate:styling`. Commit the result: CI fails if it is out of date.
    - `packages/design-tokens/codemod/palette-map.json` is rebuilt from `plt.json5` by `yarn build`. Commit it when it changes.
    - `CHANGELOG.md` and the version in `package.json` are written by the release command.
    - `dist/` is the build output and is not committed.
4. Run the checks CI runs:

    ```bash
    yarn build                                         # Build into dist/ and check the role → semantic → plt chain
    yarn test                                          # Tests of the build tools and the codemod
    yarn generate:styling                              # Regenerate STYLING.md
    yarn prettier && yarn eslint && yarn lint:all:dist # Lint the sources and the built CSS, SCSS and JS
    ```

    To check a color against Figma, follow [FIGMA-COLOR-COMPARISON.md](FIGMA-COLOR-COMPARISON.md) (in Russian).

5. Open a pull request against `main`. If a fix is also needed in v3, say so in the pull request: v3 is released from the `3.20.x` branch.

## Commit messages and pull request titles

commitlint checks the commit message in the `commit-msg` hook and the pull request title in CI. The rules are in the [commitlint config](.commitlintrc.js).

```
<type>(<scope>): <subject>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` or `revert`. Use `feat` for a new token or capability and `fix` for a corrected value or reference.
- **scope** (optional, leave it out when none fits): one of `colors`, `typography`, `shadows`, `font`, `palette`, `plt`, `scss`, `docs`, `build`, `ci`, `deps` or `deps-dev`. Separate several scopes with commas: `fix(colors,shadows): ...`.
- **subject**: in the imperative mood, starting with a lowercase letter, with no period at the end.
- The header is at most 100 characters. Lines of the body and footer are at most 100 characters.
- If the change has a task in the Koobiq tracker, put its reference at the end of the subject: `(#DS-1234)`. Link a GitHub issue in the pull request description with `Closes #123`.
- Mark a breaking change with a `BREAKING CHANGE:` footer that says what consumers have to do. Do not put `!` after the type: commitlint accepts it, but the changelog generator skips such a commit.
- The changelog does not show the footer, so describe the migration in the pull request as well: breaking changes are documented in the [README](README.md#breaking-changes-in-v4) and [MIGRATION.md](MIGRATION.md), as the v4 ones are.

Examples:

```
fix(colors): make background theme and status tokens opaque (#DS-5665)
fix(scss): rebuild _palette.scss for the v4 OKLch palette
docs: add Figma color comparison guide
```

```
feat(colors): remove the deprecated background-warning-less

BREAKING CHANGE: use --kbq-background-warning-fade instead.
```

Pull requests are squash-merged. The commit in `main` takes the pull request title, or the commit message if the pull request has a single commit, so keep both in this format. `CHANGELOG.md` is generated from these commits: `feat` and `fix` go into it, `build`, `chore` and `docs` do not.

CI checks the title when the pull request is opened and on every push, so a renamed title is checked on the next push.

## Pull requests

- Say what changed and why, and list the tokens whose values changed. For a visual change, attach before and after screenshots in the light and the dark theme.
- Say if a page on [koobiq.io](https://koobiq.io/en/main/design-tokens/overview) needs an update.
- Keep one change per pull request: it becomes one commit in `main`.
- Open unfinished work as a [draft](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests) and mark it **Ready for review** when it is done.
- Keep the branch up to date with `main`: a pull request with conflicts gets no CI runs at all.

## Ready to merge

A maintainer squash-merges the pull request when:

- CI is green, including the commitlint check of the title;
- a maintainer has approved it and the review threads are resolved;
- it has no conflicts with `main`.

A branch of this repository is deleted automatically after the merge; a branch in a fork is not.
