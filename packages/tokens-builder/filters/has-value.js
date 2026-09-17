/**
 * True unless the token's value is `null`.
 *
 * A null value is not a missing value — it says the name is part of the system's vocabulary but
 * is deliberately unstyled. `koobiq/angular-components` says the same thing with `null` in
 * code-block-tokens.scss, where Sass simply omits the declaration.
 *
 * Which platforms can carry that meaning differs, so the filter is applied per platform rather
 * than globally:
 *
 * - **CSS** cannot express it. `--kbq-x: ;` parses, but a declared-empty property suppresses a
 *   consumer's `var(--kbq-x, fallback)` and then resolves to nothing — worse than not shipping
 *   the variable at all. Skipped.
 * - **JS** has no use for it, and `typescript/es6-declarations` throws outright, calling
 *   `Object.entries()` on the null. Skipped.
 * - **SCSS** keeps them: `null` is exactly what Sass means, and it drops the declaration itself.
 */
export const hasValue = (token) => {
    // Not `token.$value ?? token.value`: `??` treats null as absent and would fall through to
    // the undefined non-DTCG key, so every null token would look like it had a value.
    const value = '$value' in token ? token.$value : token.value;

    return value !== null && value !== undefined;
};
