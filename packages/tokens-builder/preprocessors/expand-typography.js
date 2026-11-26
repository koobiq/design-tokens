import { assertDimension } from '../transforms/value/dimension.js';

// DTCG sub-property → output type. `lineHeight` deliberately stays an absolute dimension instead
// of the DTCG unitless multiplier. Other unlisted properties keep their own name as the type
// (fontFamily, fontWeight are real DTCG types; fontStyle / textTransform / fontFeatureSettings are
// our documented extensions).
const SUBTYPES = {
    fontSize: 'dimension',
    lineHeight: 'dimension',
    letterSpacing: 'dimension'
};

const REQUIRED = ['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight', 'fontFamily'];
const EXTENSIONS = ['fontStyle', 'textTransform', 'fontFeatureSettings'];
const ALLOWED = new Set([...REQUIRED, ...EXTENSIONS]);

/** A `$value` that is nothing but a reference, e.g. `{typography.title}`. */
const ALIAS = /^\{([^{}]+)\}$/;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** A node is a token once it carries a `$value`; anything else is a group. */
const isToken = (node) => isPlainObject(node) && '$value' in node;

const aliasTarget = (node) => (typeof node.$value === 'string' ? ALIAS.exec(node.$value)?.[1] : undefined);

const at = (root, path) => path.split('.').reduce((node, key) => (isPlainObject(node) ? node[key] : undefined), root);

/**
 * Sub-property names of the composite `path` points at, following alias hops.
 *
 * Only the *names* come from the end of the chain — the references we emit stay pointed at the
 * direct target, so an A → B → C alias chain survives into the CSS as one `var()` per hop.
 */
const subProperties = (root, path) => {
    const seen = new Set();

    for (let target = path; target && !seen.has(target);) {
        seen.add(target);

        const node = at(root, target);

        if (!isToken(node)) return undefined;
        if (isPlainObject(node.$value)) return Object.keys(node.$value);

        target = aliasTarget(node);
    }

    return undefined;
};

const validateComposite = (node, path) => {
    if (!isPlainObject(node.$value)) return;

    const tokenPath = path.join('.');

    for (const property of REQUIRED) {
        if (!Object.hasOwn(node.$value, property)) {
            throw new Error(`${tokenPath}.$value.${property}: required property is missing.`);
        }
    }

    for (const property of Object.keys(node.$value)) {
        if (!ALLOWED.has(property)) {
            throw new Error(`${tokenPath}.$value.${property}: unknown typography property.`);
        }
    }

    for (const property of ['fontSize', 'lineHeight', 'letterSpacing']) {
        assertDimension(node.$value[property], `${tokenPath}.$value.${property}`, { allowReference: true });
    }

    for (const property of EXTENSIONS) {
        if (Object.hasOwn(node.$value, property) && typeof node.$value[property] !== 'string') {
            throw new Error(`${tokenPath}.$value.${property}: expected a string or token reference.`);
        }
    }
};

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
 * A composite may also be aliased whole — `$value: '{typography.display-compact}'` — which is
 * what the spec means by a composite being a single token. Those expand into one reference per
 * sub-property of the target, so `md-h1` says "it is display-compact" once instead of repeating
 * the same preset name seven times. The expansion is mechanical, so the emitted CSS is identical
 * to spelling every sub-property out by hand.
 *
 * Sub-properties stay camelCase (as the spec requires). `name/custom-kebab` turns them back
 * into `font-size` etc., so CSS variable names are unchanged.
 */
export default (StyleDictionary) => {
    StyleDictionary.registerPreprocessor({
        name: 'kbq/expand-typography',
        preprocessor: (tokens) => {
            const expand = (node, entries) => {
                // $type is dropped here: each sub-property gets its own type below.
                const { $value: _value, $type: _type, ...meta } = node;

                return Object.fromEntries(
                    entries.map(([prop, value]) => [prop, { ...meta, $value: value, $type: SUBTYPES[prop] ?? prop }])
                );
            };

            // `inherited` carries the nearest ancestor group's $type, which DTCG lets a token
            // omit. Style Dictionary applies that inheritance itself, but only after
            // preprocessors have run, so it has to be tracked here too.
            const walk = (node, inherited, path = []) => {
                if (!isPlainObject(node)) return node;

                const type = node.$type ?? inherited;

                if (type === 'typography' && isToken(node)) {
                    validateComposite(node, path);

                    if (isPlainObject(node.$value)) return expand(node, Object.entries(node.$value));

                    const target = aliasTarget(node);
                    const props = target && subProperties(tokens, target);

                    if (!props) {
                        throw new Error(
                            `Typography token has $value "${node.$value}", which is neither an object ` +
                                `nor a reference to another typography composite.`
                        );
                    }

                    return expand(
                        node,
                        props.map((prop) => [prop, `{${target}.${prop}}`])
                    );
                }

                return Object.fromEntries(
                    Object.entries(node).map(([key, value]) => [key, walk(value, type, [...path, key])])
                );
            };

            return walk(tokens, undefined);
        }
    });
};
