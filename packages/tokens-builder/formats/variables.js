const { formatHelpers } = require('style-dictionary');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        formatter: function({dictionary, options={}, file}) {
            const selector = options.selector ? options.selector : `:root`;
            const { outputReferences } = options;

            dictionary.allTokens.forEach((token) => {
                token.name = token.name.replace(/(light|dark)-/, '');
            });

            return formatHelpers.fileHeader({file}) +
                `${selector} {\n` +
                formatHelpers.formattedVariables({ format: 'css', dictionary, outputReferences }) +
                `\n}\n`;
        }    })
};
