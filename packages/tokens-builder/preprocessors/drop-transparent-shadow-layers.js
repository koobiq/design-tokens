const REFERENCE = /^\{([^{}]+)\}$/;
const TRANSPARENT = /^(?:transparent|#[0-9a-f]{3}0|#[0-9a-f]{6}00)$/i;
const MAX_HOPS = 20;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const at = (root, path) => path.split('.').reduce((node, key) => (isPlainObject(node) ? node[key] : undefined), root);

/**
 * True when the color of a shadow layer is fully transparent, so the layer paints nothing.
 * The color is followed through references down to its literal; `lookup` returns the `$value`
 * of the token at a path.
 */
export const isTransparentLayer = (layer, lookup) => {
    let current = layer?.color;

    for (let hops = 0; hops < MAX_HOPS; hops++) {
        const match = REFERENCE.exec(current);

        if (!match) return TRANSPARENT.test(current);

        current = lookup(match[1]);
    }

    return false;
};

/**
 * Every shadow is written with three layers (outline, key, ambient), as in Figma. A layer a theme
 * does not use has a transparent color, and it is dropped from the shadow here, so that no output
 * (CSS, Sass, JS) carries invisible layers: a theme that uses only the outline gets a one-layer
 * `box-shadow`.
 *
 * It is a preprocessor because it has to apply to every platform before values are transformed.
 */
export default (StyleDictionary) => {
    StyleDictionary.registerPreprocessor({
        name: 'kbq/drop-transparent-shadow-layers',
        preprocessor: (tokens) => {
            const lookup = (path) => at(tokens, path)?.$value;

            const walk = (node, inherited) => {
                if (!isPlainObject(node)) return node;

                const type = node.$type ?? inherited;

                if (type === 'shadow' && '$value' in node) {
                    if (!Array.isArray(node.$value)) return node;

                    const layers = node.$value.filter((layer) => !isTransparentLayer(layer, lookup));

                    return layers.length > 0 ? { ...node, $value: layers } : node;
                }

                return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, walk(value, type)]));
            };

            return walk(tokens, undefined);
        }
    });
};
