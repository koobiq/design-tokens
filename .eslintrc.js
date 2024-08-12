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
    extends: [
        'eslint:recommended',
        // should be last
        'plugin:prettier/recommended'
    ],
    rules: {
        'no-useless-escape': 0,
        'no-prototype-builtins': 0
    }
};

module.exports = config;
