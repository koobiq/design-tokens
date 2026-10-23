# Contributing to Design Tokens

## Found a bug?

If you find a bug/issue in the source code or a mistake in the documentation,
you can help us by
[creating an issue](https://github.com/koobiq/design-tokens/issues/new)
here on GitHub.

Please provide an issue reproduction. Screenshots are also
helpful.

## Submitting a pull request

Before you submit your pull request (PR) consider the following guidelines:

- Fork Design Tokens into your namespace by using the fork button on GitHub.
- Make your changes in a new git branch: `git checkout -b my-fix-branch main`
- Build the tokens and check the generated output: `yarn build`
- Push your branch to GitHub.
- Create a new pull request from your branch against the `main` branch.

## Commit message guidelines

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: deps|deps-dev|colors|typography|shadows|font|palette|plt|scss|docs|build|ci
  │
  └─⫸ Commit Type: build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test
```

Each commit message consists of a `type`, `scope` and `subject` (message).  
The `type` and `subject` are mandatory, the `scope` is optional in some specific
cases. Format: `<type>(<scope>): <subject>`

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to the CI configuration
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope is optional and names the part of the repository the change affects:

- `colors`, `typography`, `shadows`, `font`, `palette`, `plt` — token areas
- `scss` — generated Sass output
- `docs`, `build`, `ci` — repository tooling
- `deps`, `deps-dev` — dependency updates (Dependabot) and dependency management

### Message

**Subject**  
The commit message should describe the problem it solves or the feature it
introduces. Not the changes you have done. Furthermore the commit message has to
start with a lowercase letter and must not end with a period.

**Body**  
The body should include the motivation for the change and contrast this with
previous behavior.

**Footer**  
The footer should contain any information about Breaking Changes and is also the
place to reference GitHub issues that this commit closes.

Breaking Changes should start with the word BREAKING CHANGE: with a space or two
newlines. The rest of the commit message is then used for this.

### Examples

```
feat(colors): add new brand color
```

```
fix(shadows): fixes an issue with the card shadow

Closes #33
```

```
refactor(palette): remove the deprecated palette

BREAKING CHANGE: The palette has been removed.
Describe reasons.
```

## Code reviews and PRs

### Open PR

A developer opens a PR in one of two ways:

1. The PR is already finished and can directly be reviewed.
2. The PR is still wip and is opened for others to be tracked. In this case the
   PR has to have the `pr: wip` and/or has to be opened as a
   [Draft](https://github.blog/2019-02-14-introducing-draft-pull-requests/).

### Draft/WIP

After the work on this draft/wip PR has been finished, remove the label
`pr: wip` and click the button `Ready for review` if it was opened as a Draft to
flag it for the codeowners/admins to review.

### Review

Now the review process kicks in. Depending on the scope of the PR one or more
maintainers must review and approve this PR before the process can be continued.
