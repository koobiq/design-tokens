const { formatHelpers } = require('style-dictionary');
const transform = require('style-dictionary/lib/common/transforms');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        formatter: function ({ dictionary, options = {}, file }) {
            const selector = options.selector ? options.selector : `:root`;
            const { outputReferences } = options;

            dictionary.allTokens = dictionary.allTokens.flatMap((token) => {
                // only for typography
                const shouldUnwrap = typeof token.value === 'object' && typeof token.original.value === 'string';
                if (shouldUnwrap) {
                    return Object.keys(token.value).map((key) => {
                        const subToken = token.value[key];
                        const res = {
                            ...subToken,
                            filePath: token.filePath,
                            path: [...token.path, key],
                            name: `kbq-${ [...token.path, key].join('-')}`,
                        }
                        res.attributes = { ...transform['attribute/cti'].transformer(res), font: true };
                        return res;
                    });
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
