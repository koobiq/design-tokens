import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import { stripThemeFromNames } from './strip-theme.js';

/**
 * The selector each slice of a component's tokens belongs under, in write order.
 *
 * `:root` holds whatever is theme-independent (scrollbar sizes, for instance); the other two
 * hold the light and dark colours.
 */
const THEMES = [
    { selector: ':root', belongs: (token) => !token.attributes.light && !token.attributes.dark },
    { selector: '.kbq-light', belongs: (token) => token.attributes.light },
    { selector: '.kbq-dark', belongs: (token) => token.attributes.dark }
];

/**
 * One self-contained stylesheet per component.
 *
 * Unlike `kbq-css/variables`, which writes a single selector per file, this writes every selector
 * a component needs into one file — so importing a component's tokens is one import rather than
 * three. That matters because these files are opt-in: code-block alone accounts for 214 of the
 * 248 component variables, and a consumer who does not render code blocks should not have to
 * carry them.
 *
 * Selectors with nothing in them are skipped, so a component that has no theme-independent
 * tokens does not ship an empty `:root {}`.
 */
export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-css/component',
        format: async function ({ dictionary, options = {}, file }) {
            const { outputReferences, usesDtcg } = options;

            stripThemeFromNames(dictionary.allTokens);

            const blocks = THEMES.map(({ selector, belongs }) => {
                const allTokens = dictionary.allTokens.filter(belongs);

                if (allTokens.length === 0) return null;

                // References are resolved against the full dictionary, so a component token
                // pointing at `{semantic.*}` still emits a var() even though that token is not
                // part of this file.
                const body = formattedVariables({
                    format: 'css',
                    dictionary: { ...dictionary, allTokens },
                    outputReferences,
                    usesDtcg
                });

                return `${selector} {\n${body}\n}\n`;
            }).filter(Boolean);

            return (await fileHeader({ file })) + blocks.join('\n');
        }
    });
};
