// @ts-check

/**
 * @type {import('prettier').Options}
 */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    overrides: [
        {
            files: ['*.yml'],
            options: {
                tabWidth: 2
            }
        }
    ]
};

module.exports = config;
