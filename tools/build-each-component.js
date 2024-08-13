const fs = require('fs/promises');
const path = require('path');
const StyleDictionary = require('style-dictionary');
const { formatHelpers } = require('style-dictionary');
require('../packages/tokens-builder/build');

const TOKEN_FILE_EXT = 'json5';
const BASE_PATH = 'packages/design-tokens/web';

// Original console.log function
const originalLog = console.log;

console.log = (message, ...params) => {
    /*
    Light/dark token names are in the same file but under different selectors
    But Style-Dictionary expects 1 unique token per file, or it will throw warn
    So, console output is overwritten to prevent unnecessary errors message
    */
    if (!message.includes('token collisions')) {
        originalLog(message);
    }
};

const sdConfig = {
    source: [`${BASE_PATH}/properties/**/*.json5`, `${BASE_PATH}/components/**/*.json5`],
    platforms: {
        css: {
            buildPath: `dist/design-tokens/web/components/styles/`,
            transformGroup: 'kbq/css',
            filter: (token) =>
                !['light', 'dark', 'font', 'size', 'typography', 'md-typography', 'palette'].includes(
                       token.attributes.category
                )
        }
    },
};

const dictionaryMapper = (dictionary, outputReferences) => {
    const formatProperty = formatHelpers.createPropertyFormatter({ outputReferences, dictionary, format: 'css' });
    return dictionary.allTokens.map(formatProperty).join('\n');
};

StyleDictionary.registerFormat({
    name: 'kbq-css/component',
    formatter: function ({ dictionary, options = {} }) {
        const { outputReferences, selector = ':root', darkThemeSelector = '.kbq-dark' } = options;

        dictionary.allTokens.forEach((token) => {
            token.name = token.name.replace(/(light|dark)-/, '');
        });

        // formatting function expects dictionary as input, so here initialize a copy to work with different tokens
        const baseDictionary = { ...dictionary };
        const darkDictionary = { ...dictionary };

        baseDictionary.allTokens = baseDictionary.allProperties = baseDictionary.allTokens.filter(
            (token) => token.attributes.light || token.attributes.type === 'size' || token.attributes.font
        );
        darkDictionary.allTokens = darkDictionary.allProperties = darkDictionary.allTokens.filter(
            (token) => token.attributes.dark
        );

        return Object.entries({
            [selector]: baseDictionary,
            [darkThemeSelector]: darkDictionary
        })
            .map(([key, currentDictionary]) => {
                return `${key} {\n` + dictionaryMapper(currentDictionary, outputReferences) + `\n}\n`;
            })
            .join('\n');
    }
});

const main = async () => {
    const files = await fs.readdir(path.join(process.cwd(), 'packages', 'design-tokens', 'web', 'components'), {
        encoding: 'utf8'
    });

    sdConfig.platforms.css.files = files
        .filter((file) => path.extname(file).includes(TOKEN_FILE_EXT))
        .map((currentValue) => ({
            destination: `${path.basename(currentValue, `.${TOKEN_FILE_EXT}`)}.css`,
            filter: (token) => token.name.includes(path.basename(currentValue, `.${TOKEN_FILE_EXT}`)),
            format: 'kbq-css/component',
            prefix: 'kbq'
        }));

    StyleDictionary.extend(sdConfig).buildAllPlatforms();
};
main();
