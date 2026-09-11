// DTCG sub-property → DTCG type, mirroring Style Dictionary's own DTCGTypesMap.typography.
// Anything not listed keeps its own name as the type (fontFamily, fontWeight are real DTCG
// types; textTransform / fontFeatureSettings are our documented extension).
const SUBTYPES = {
    fontSize: 'dimension',
    letterSpacing: 'dimension',
    lineHeight: 'number'
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isTypographyComposite = (node) =>
    isPlainObject(node) && node.$type === 'typography' && isPlainObject(node.$value);

/**
 * Expands `typography` composites into a group of one token per sub-property.
 *
 * Style Dictionary's built-in `expand` option does the same thing, but it first runs a
 * trial `resolveMap()` over the *unexpanded* tree. At that point `{typography.title.fontSize}`
 * does not exist yet — md-typography references a preset's individual sub-properties — so
 * every such reference is recorded as a broken-reference warning in a module-level message
 * store, and the first platform to export then throws on the accumulated count. The
 * references themselves resolve perfectly well once expansion has happened; only the
 * bookkeeping is wrong.
 *
 * Doing the expansion in a preprocessor sidesteps that: by the time Style Dictionary looks
 * at references, the sub-property tokens are already real tokens.
 *
 * Sub-properties stay camelCase (as the spec requires). `name/custom-kebab` turns them back
 * into `font-size` etc., so CSS variable names are unchanged.
 */
export default (StyleDictionary) => {
    StyleDictionary.registerPreprocessor({
        name: 'kbq/expand-typography',
        preprocessor: (tokens) => {
            const walk = (node) => {
                if (!isPlainObject(node)) return node;

                if (isTypographyComposite(node)) {
                    // $type is dropped here: each sub-property gets its own type below.
                    const { $value, $type: _compositeType, ...meta } = node;

                    return Object.fromEntries(
                        Object.entries($value).map(([prop, value]) => [
                            prop,
                            { ...meta, $value: value, $type: SUBTYPES[prop] ?? prop }
                        ])
                    );
                }

                return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, walk(value)]));
            };

            return walk(tokens);
        }
    });
};
