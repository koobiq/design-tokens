// @ts-check

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'feature', 'fix', 'refactor', 'docs', 'build', 'test', 'ci', 'chore', 'fonts', 'shadows']
        ]
    }
};

module.exports = config;
