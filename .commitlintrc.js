// @ts-check

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                // Dependencies
                'deps',
                'deps-dev',

                // Token areas
                'colors',
                'typography',
                'shadows',
                'font',
                'palette',
                'plt',
                'scss',

                // Repository
                'docs',
                'build',
                'ci'
            ]
        ]
    }
};

module.exports = config;
