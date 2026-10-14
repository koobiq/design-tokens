/**
 * One Sass variable per top-level `plt.*` family — a map of its steps for a numbered ramp
 * (`$plt-blue: (1: oklch(…), 2: oklch(…), …)`), or a plain variable for a single-value family
 * (`$plt-white: oklch(…)`). Mirrors the shape v3's `_palette.scss` had for the HSL palette, so
 * code written against `@each $step, $color in $plt-blue` keeps working across the v4 upgrade —
 * only the values (and the step range, 1–20 instead of 0–100) changed.
 */
const toKebab = (key) => key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-scss/palette',
        format: function ({ dictionary, options = {} }) {
            const { usesDtcg } = options;
            const valueKey = usesDtcg ? '$value' : 'value';
            const families = dictionary.tokens.plt ?? {};

            return Object.keys(families)
                .map((family) => {
                    const node = families[family];
                    const name = `plt-${toKebab(family)}`;

                    if (Object.hasOwn(node, valueKey)) {
                        return `$${name}: ${node[valueKey]};\n`;
                    }

                    const steps = Object.keys(node)
                        .map((step) => `  ${step}: ${node[step][valueKey]},\n`)
                        .join('');

                    return `$${name}: (\n${steps});\n`;
                })
                .join('\n');
        }
    });
};
