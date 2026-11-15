/** The vendor namespace of the marker, in `$extensions` (DTCG §5.2.3). */
const NS = 'io.koobiq.tokens';
const REFERENCE = /^\{([^{}]+)\}$/;
const MAX_HOPS = 20;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const at = (root, path) => path.split('.').reduce((node, key) => (isPlainObject(node) ? node[key] : undefined), root);

/**
 * The privacy a node sets for itself: true, false, a string explaining why it is internal, or
 * undefined when it sets none. This mirrors `$deprecated` (DTCG §5.2.4), where `true` marks the token,
 * a string marks it and explains the reason, and `false` opts out of a group's default.
 *
 * Anything else is refused. `'true'` and `'false'` are refused too, even though they are strings: a
 * quoted boolean is a typo, and reading it as a reason would make `private: 'false'` private — the one
 * trap worth keeping closed, since the filter requires `=== true`.
 */
const ownPrivacy = (node, path) => {
    const value = node.$extensions?.[NS]?.private;

    if (value === undefined || typeof value === 'boolean') return value;

    const reason = typeof value === 'string' ? value.trim() : '';

    if (reason !== '' && !['true', 'false'].includes(reason.toLowerCase())) return reason;

    throw new Error(
        `${NS} \`private\` must be true, false, or a string explaining why, not ${JSON.stringify(value)}, at ${path.join('.')}`
    );
};

/**
 * Marks every private token of a raw token tree, and returns the marked tree with the paths of the
 * private tokens.
 *
 * A token is private when it, or the group it sits in, sets `$extensions['io.koobiq.tokens'].private`
 * to true or to a string explaining why; a token can opt out with `false`. Style Dictionary delegates
 * only `$type` down the tree, so the flag is inherited here, a group's explanation along with it.
 *
 * The flag is normalised to a plain top-level `private: true`, which is what the rest of the build
 * reads, and the explanation, when there is one, to `privateReason` beside it. Neither reaches an
 * output: a private token ships no variable, so the reason only ever surfaces in diagnostics.
 *
 * @param {Object} tree a raw token tree, as read from the source files
 * @returns {{ marked: Object, privates: Set<string> }}
 */
export const markPrivate = (tree) => {
    const privates = new Set();

    const mark = (node, inherited, path) => {
        if (!isPlainObject(node)) return node;

        const privateHere = ownPrivacy(node, path) ?? inherited;

        if ('$value' in node) {
            if (!privateHere) return node;

            privates.add(path.join('.'));

            return typeof privateHere === 'string'
                ? { ...node, private: true, privateReason: privateHere }
                : { ...node, private: true };
        }

        return Object.fromEntries(
            Object.entries(node).map(([key, child]) => [
                key,
                key.startsWith('$') ? child : mark(child, privateHere, [...path, key])
            ])
        );
    };

    return { marked: mark(tree, false, []), privates };
};

/**
 * A reference to a private token that is itself a pure alias is rewritten to that alias's target, so
 * the chain skips the private hop: `{a}`, where `a` is private and `{c}`, becomes `{c}`. The resolved
 * value does not change, so the theme does not either.
 *
 * A private token with a literal value keeps its reference. The formats inline it instead, see
 * formats/private-references.js.
 */
const skipPrivate = (value, root, privates) => {
    let current = value;

    for (let hops = 0; hops < MAX_HOPS; hops++) {
        const match = REFERENCE.exec(current);

        if (!match || !privates.has(match[1])) return current;

        const next = at(root, match[1])?.$value;

        if (typeof next !== 'string' || !REFERENCE.test(next)) return current;

        current = next;
    }

    throw new Error(`Private alias does not resolve, too many hops from ${value}`);
};

// Rewrites every string leaf of a $value, so composite shadows (arrays of layer objects) and
// typography presets are covered as well as plain string values.
const rewrite = (value, root, privates) => {
    if (typeof value === 'string') return skipPrivate(value, root, privates);
    if (Array.isArray(value)) return value.map((item) => rewrite(item, root, privates));
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item, root, privates)]));
    }

    return value;
};

const collapse = (node, root, privates) => {
    if (!isPlainObject(node)) return node;

    if ('$value' in node) return { ...node, $value: rewrite(node.$value, root, privates) };

    return Object.fromEntries(
        Object.entries(node).map(([key, child]) => [key, key.startsWith('$') ? child : collapse(child, root, privates)])
    );
};

/**
 * Makes private tokens internal, before any reference is resolved.
 *
 * Nothing is deleted here. Deleting a token before references resolve fails the build with
 * `Reference Errors`, because every alias to it is then dangling. Privacy is applied afterwards, per
 * file, by the filter composed in configs/index.js.
 */
export default (StyleDictionary) => {
    StyleDictionary.registerPreprocessor({
        name: 'kbq/private',
        preprocessor: (tokens) => {
            const { marked, privates } = markPrivate(tokens);

            return privates.size > 0 ? collapse(marked, marked, privates) : marked;
        }
    });
};
