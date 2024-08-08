// @ts-check

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    root: true,
    env: {
        es2022: true
    },
    ignorePatterns: ['dist', 'node_modules'],
    extends: [
        // should be last
        'plugin:prettier/recommended'
    ]
};

module.exports = config;
