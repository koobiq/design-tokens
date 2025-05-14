const { formatHelpers } = require('style-dictionary');
const { unwrapObjectTransformer } = require('../formats/utils');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        formatter: function ({ dictionary, options = {}, file }) {
            const { outputReferences, selector = ':root' } = options;

            // apply custom transformations for tokens
            dictionary.allProperties = dictionary.allTokens = dictionary.allTokens.flatMap((token) => {
                if (typeof token.value === 'object' && token.type === 'font') {
                    return unwrapObjectTransformer(token);
                }
                return token;
            });

            dictionary.allTokens.forEach((token) => {
                token.name = token.name.replace(/(light|dark)-/, '');
            });

            return (
                formatHelpers.fileHeader({ file }) +
                `${selector} {\n` +
                formatHelpers.formattedVariables({ format: 'css', dictionary, outputReferences }) +
                `\n}\n`
            );
        }
    });
};
