import { isShadowParameter } from '../filters/shadow-parameter.js';
import { stripThemeFromNames } from './strip-theme.js';

const REFERENCE = /^\{([^{}]+)\}$/;
const MAX_HOPS = 20;

/**
 * Composite shadows are built from parameter tokens field by field: offsets, blur, spread and
 * color each point at their own token (shadows.json5, mirroring the Figma Shadow variables).
 *
 * The parameters are sources only and have no output of their own (isShadowParameter), so a
 * reference to one is followed down to what it stands for:
 *
 * - a literal (`9px`, `#00000000`), written straight into the `box-shadow`;
 * - the first token on the way that does ship — a color role or a semantic color — written as its
 *   `var()`, so the plt → semantic → role chain survives and re-theming keeps working;
 *
 * Style Dictionary's `outputReferences` cannot do this. It rewrites a transformed value by finding
 * the resolved literal of every reference in the string and putting a `var()` there, and a shadow
 * is mostly repeated literals: `0px`, `1px` and `6px` occur in several fields and layers, so the
 * `var()`s land on the wrong fields. The output still parses and every variable resolves, which is
 * why nothing downstream notices. So the `box-shadow` is assembled from the token's original value
 * instead, and those tokens are excluded from Style Dictionary's reference pass.
 */
export const isCompositeShadow = (token) =>
    token.$type === 'shadow' && token.original.$value !== null && typeof token.original.$value === 'object';

const fieldToCss = (value, byPath) => {
    let current = value;

    for (let hops = 0; hops < MAX_HOPS; hops++) {
        const match = REFERENCE.exec(current);

        if (!match) return current;

        const target = byPath.get(match[1]);

        if (!target) throw new Error(`Shadow references an unknown token: {${match[1]}}`);

        // A shipped token is referenced by its variable; a parameter is followed down to its value.
        if (!isShadowParameter(target)) return `var(--${target.name})`;

        current = target.original.$value;
    }

    throw new Error(`Shadow reference does not resolve, too many hops from ${value}`);
};

const layerToCss = (layer, byPath) => {
    return [layer.offsetX, layer.offsetY, layer.blur, layer.spread, layer.color]
        .filter((value) => value !== undefined)
        .map((value) => fieldToCss(value, byPath))
        .join(' ');
};

export const inlineShadowReferences = (dictionary) => {
    const tokens = dictionary.unfilteredAllTokens ?? dictionary.allTokens;

    stripThemeFromNames(tokens);

    const byPath = new Map(tokens.map((token) => [token.path.join('.'), token]));

    for (const token of dictionary.allTokens) {
        if (!isCompositeShadow(token)) continue;

        const layers = [].concat(token.original.$value);

        token.$value = layers.map((layer) => layerToCss(layer, byPath)).join(', ');
    }
};
