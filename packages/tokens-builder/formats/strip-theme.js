const renamed = new WeakSet();

/**
 * Drops the theme segment from a token's variable name.
 *
 * Theme-scoped tokens are written under a `.kbq-light` / `.kbq-dark` selector, so repeating the
 * theme in the name would be redundant: `shadow.light.card` becomes `--kbq-shadow-card`. The
 * palette layers are global and keep their names untouched.
 *
 * Token objects are shared between the files of one platform — a light colour is written to both
 * `css/light/semantic-colors.css` and `css-tokens-light.css`, and a component colour to both
 * `css/components/code-block.css` and `component-tokens-light.css` — while formats run once per
 * file. The rename therefore has to be idempotent, or a second pass would eat another `light-`
 * further along the name.
 *
 * The theme has to be a whole name segment. Matching `light-` anywhere in the string also finds it
 * inside a word: `states.background.highlight-current` became
 * `--kbq-states-background-highcurrent`, which is what v3 shipped.
 */
export const stripThemeFromNames = (tokens) => {
    for (const token of tokens) {
        if (['plt', 'semantic'].includes(token.attributes.category)) continue;
        if (renamed.has(token)) continue;

        renamed.add(token);
        token.name = token.name.replace(/(^|-)(?:light|dark)-/, '$1');
    }
};
