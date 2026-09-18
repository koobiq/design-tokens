import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import { stripThemeFromNames } from './strip-theme.js';

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/variables',
        format: async function ({ dictionary, options = {}, file }) {
            const { outputReferences, selector = ':root', usesDtcg } = options;

            stripThemeFromNames(dictionary.allTokens);

            return (
                (await fileHeader({ file })) +
                `${selector} {\n` +
                formattedVariables({ format: 'css', dictionary, outputReferences, usesDtcg }) +
                `\n}\n`
            );
        }
    });
};
