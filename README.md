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
