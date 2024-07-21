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
    extends: ['plugin:prettier/recommended']
};

module.exports = config;
