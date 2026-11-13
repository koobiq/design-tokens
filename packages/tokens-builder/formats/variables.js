import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import { inlineShadowReferences, isCompositeShadow } from './shadow-references.js';
import { stripThemeFromNames } from './strip-theme.js';

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        format: async function ({ dictionary, options = {}, file }) {
            const { outputReferences, selector = ':root', usesDtcg } = options;

            stripThemeFromNames(dictionary.allTokens);

            if (outputReferences) inlineShadowReferences(dictionary);

            return (
                (await fileHeader({ file })) +
                `${selector} {\n` +
                formattedVariables({
                    format: 'css',
                    dictionary,
                    // Composite shadows already carry their own var() references, see shadow-references.js.
                    outputReferences: outputReferences && ((token) => !isCompositeShadow(token)),
                    usesDtcg
                }) +
                `\n}\n`
            );
        }
    });
};
