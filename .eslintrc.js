// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    root: true,
    env: {
        es2022: true,
        commonjs: true,
        node: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'script'
    },
    extends: [
        'eslint:recommended',
        // should be last
        'plugin:prettier/recommended'
    ],
    rules: {
        'no-useless-escape': 0,
        'no-prototype-builtins': 0
    },
    overrides: [
        {
            // @koobiq/tokens-builder is an ESM package (Style Dictionary 5 is ESM-only),
            // and tools/*.mjs are ESM entry points. The repo root itself stays CommonJS
            // so the dot-file configs keep working.
            files: ['packages/tokens-builder/**/*.js', 'tools/**/*.mjs'],
            parserOptions: {
                sourceType: 'module'
            }
        }
    ]
};

module.exports = config;
