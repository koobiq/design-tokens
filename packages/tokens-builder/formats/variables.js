const { formatHelpers } = require('style-dictionary');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        formatter: function ({ dictionary, options = {}, file }) {
            const { outputReferences, selector = ':root' } = options;

            dictionary.allTokens.forEach((token) => {
                if (['plt', 'semantic'].includes(token.attributes.category)) return;
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
