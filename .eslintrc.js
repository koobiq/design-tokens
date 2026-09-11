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
        'no-prototype-builtins': 0,
        // allow `const { drop, ...rest } = obj` to name what it is discarding
        'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    },
    overrides: [
        {
            // @koobiq/tokens-builder is an ESM package (Style Dictionary 5 is ESM-only),
            // and tools/*.mjs are ESM entry points. The repo root itself stays CommonJS
            // so the dot-file configs keep working.
            files: ['packages/tokens-builder/**/*.js', 'tools/**/*.mjs'],
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module'
            }
        },
        {
            // The playground is a browser ES module, not a Node script.
            files: ['tools/playground/*.js'],
            env: {
                browser: true,
                node: false
            },
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module'
            }
        }
    ]
};

module.exports = config;
