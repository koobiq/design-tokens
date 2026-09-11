import { fileHeader, formattedVariables } from 'style-dictionary/utils';

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        format: async function ({ dictionary, options = {}, file }) {
            const { outputReferences, selector = ':root', usesDtcg } = options;

            // Theme-scoped tokens live under a `.kbq-light` / `.kbq-dark` selector, so the theme
            // segment is redundant in the variable name (shadow-light-card → shadow-card).
            // The palette layers are global and keep their names untouched.
            dictionary.allTokens.forEach((token) => {
                if (['plt', 'semantic'].includes(token.attributes.category)) return;
                token.name = token.name.replace(/(light|dark)-/, '');
            });

            return (
                (await fileHeader({ file })) +
                `${selector} {\n` +
                formattedVariables({ format: 'css', dictionary, outputReferences, usesDtcg }) +
                `\n}\n`
            );
        }
    });
};
