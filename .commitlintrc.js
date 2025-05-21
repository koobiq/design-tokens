// @ts-check

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
    extends: ['@commitlint/config-conventional'],
    'scope-enum': [
        2,
        'always',
        [
            // Dependabot scopes
            'deps',
            'deps-dev',

            // Others
            'fonts',
            'shadows'
        ]
    ]
};

module.exports = config;
