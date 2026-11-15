import { normalizeLength, shadowGeometry } from '../../formats/shadow-references.js';

const lengthToCss = (length) => (typeof length === 'object' ? `${length.value}${length.unit}` : String(length));

/**
 * The shadow composite as one `box-shadow` string for the JS and Sass outputs. Style Dictionary's
 * `shadow/css/shorthand` writes a unit on every zero and a zero spread whenever the spread is a
 * token; this applies the rules of formats/shadow-references.js instead, so the outputs match the
 * CSS: unitless zeros, and trailing zero blur and spread left out.
 */
export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-shadow/shorthand',
        type: 'value',
        transitive: true,
        filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'shadow',
        transform: (token, _platform, options) => {
            const value = options.usesDtcg ? token.$value : token.value;

            if (typeof value !== 'object') return value;

            return []
                .concat(value)
                .map((layer) => {
                    const geometry = shadowGeometry(
                        [layer.offsetX, layer.offsetY, layer.blur, layer.spread].map((length) =>
                            length === undefined ? undefined : normalizeLength(lengthToCss(length))
                        )
                    );

                    return [...geometry, layer.color ?? '#000000'].join(' ');
                })
                .join(', ');
        }
    });
};
