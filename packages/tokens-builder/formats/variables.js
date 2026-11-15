import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import { inlineShadowReferences, isCompositeShadow } from './shadow-references.js';
import { referencesPrivate } from './private-references.js';
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
                    // A private token has no variable, so a reference to one is written as its value.
                    outputReferences:
                        outputReferences &&
                        ((token, refOptions) => !isCompositeShadow(token) && !referencesPrivate(token, refOptions)),
                    usesDtcg
                }) +
                `\n}\n`
            );
        }
    });
};
