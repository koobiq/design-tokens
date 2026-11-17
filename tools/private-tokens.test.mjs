import { test } from 'node:test';
import assert from 'node:assert/strict';
import registerPrivateTokens, { markPrivate } from '../packages/tokens-builder/preprocessors/private.js';

// The marker, as the sources write it: on a token or on a group.
const marker = (value) => ({ $extensions: { 'io.koobiq': { private: value } } });

// Runs the registered preprocessor over a tree, the way Style Dictionary does.
const preprocess = (tree) => {
    let registered;

    registerPrivateTokens({
        registerPreprocessor: (preprocessor) => {
            registered = preprocessor;
        }
    });

    return registered.preprocessor(tree);
};

const deepFreeze = (value) => {
    if (value !== null && typeof value === 'object') Object.values(value).forEach(deepFreeze);

    return Object.freeze(value);
};

test('the preprocessor registers itself as kbq/private', () => {
    let registered;

    registerPrivateTokens({
        registerPreprocessor: (preprocessor) => {
            registered = preprocessor;
        }
    });

    assert.equal(registered.name, 'kbq/private');
});

test('a token is private by its own marker, and the marked token carries a plain private key', () => {
    const { marked, privates } = markPrivate({
        a: { $value: '#fff', ...marker(true) },
        b: { $value: '#000' }
    });

    assert.equal(marked.a.private, true);
    assert.deepEqual(marked.a.$extensions, { 'io.koobiq': { private: true } });
    assert.equal(marked.b.private, undefined);
    assert.deepEqual([...privates], ['a']);
});

test('a group marker is inherited by every token under it, at any depth', () => {
    const { privates } = markPrivate({
        g: {
            ...marker(true),
            a: { $value: '1px' },
            deep: { d: { $value: '2px' } }
        },
        pub: { $value: '3px' }
    });

    assert.deepEqual([...privates].sort(), ['g.a', 'g.deep.d']);
});

test('private: false on a token overrides the inherited marker', () => {
    const { marked, privates } = markPrivate({
        g: {
            ...marker(true),
            a: { $value: '1px' },
            b: { $value: '2px', ...marker(false) }
        }
    });

    assert.deepEqual([...privates], ['g.a']);
    assert.equal(marked.g.b.private, undefined);
});

test('nested overrides: a subgroup can opt out, and a group inside a public group can opt in', () => {
    const { privates } = markPrivate({
        g: {
            ...marker(true),
            sub: { ...marker(false), a: { $value: '1px' } },
            sub2: { x: { $value: '2px' } }
        },
        pub: {
            ...marker(false),
            inner: { ...marker(true), k: { $value: '3px' } }
        }
    });

    assert.deepEqual([...privates].sort(), ['g.sub2.x', 'pub.inner.k']);
});

test('a chain of private aliases ends at the public token, and the reference skips every private hop', () => {
    const tree = {
        c: { $value: '#abc' },
        b: { $value: '{c}', ...marker(true) },
        a: { $value: '{b}', ...marker(true) },
        x: { $value: '{a}' }
    };

    const marked = preprocess(tree);

    assert.equal(marked.x.$value, '{c}');
    assert.equal(marked.a.$value, '{c}');
});

test('a private alias to a private literal is replaced by the literal', () => {
    const tree = {
        lit: { $value: '#fff', ...marker(true) },
        alias: { $value: '{lit}', ...marker(true) },
        x: { $value: '{alias}' },
        y: { $value: '{lit}' }
    };

    const marked = preprocess(tree);

    assert.equal(marked.x.$value, '#fff');
    assert.equal(marked.y.$value, '#fff');
});

test('a private alias to a public composite collapses onto the composite', () => {
    const tree = {
        pub: { $type: 'typography', $value: { fontSize: '12px', fontFamily: 'Inter' } },
        alias: { $type: 'typography', $value: '{pub}', ...marker(true) },
        x: { $type: 'typography', $value: '{alias}' }
    };

    assert.equal(preprocess(tree).x.$value, '{pub}');
});

test('a private composite is inlined with its nested private references rewritten', () => {
    const tree = {
        size: { $value: '12px', ...marker(true) },
        font: { $value: 'Inter' },
        family: { $value: '{font}', ...marker(true) },
        obj: { $type: 'typography', $value: { fontSize: '{size}', fontFamily: '{family}' }, ...marker(true) },
        x: { $type: 'typography', $value: '{obj}' }
    };

    assert.deepEqual(preprocess(tree).x.$value, { fontSize: '12px', fontFamily: '{font}' });
});

test('private values keep their types, including objects and arrays', () => {
    for (const value of [0, false, null, { value: 6, unit: 'px' }, ['Inter', 'sans-serif']]) {
        const tree = deepFreeze({
            internal: { $value: value, ...marker(true) },
            consumer: { $value: '{internal}' }
        });

        assert.deepEqual(preprocess(tree).consumer.$value, value);
    }
});

test('the first public alias is preserved instead of following it to its value', () => {
    const tree = {
        literal: { $value: '#abc' },
        publicAlias: { $value: '{literal}' },
        internal: { $value: '{publicAlias}', ...marker(true) },
        consumer: { $value: '{internal}' }
    };

    assert.equal(preprocess(tree).consumer.$value, '{publicAlias}');
});

test('public descendants of private groups remain references', () => {
    const tree = {
        g: {
            ...marker(true),
            internal: { $value: '6px' },
            public: { $value: '{g.internal}', ...marker(false) }
        },
        consumer: { $value: '{g.public}' }
    };
    const marked = preprocess(tree);

    assert.equal(marked.g.public.$value, '6px');
    assert.equal(marked.consumer.$value, '{g.public}');
});

test('composite shadows and typography objects are rewritten field by field', () => {
    const tree = {
        c: { $value: '#abc' },
        a: { $value: '{c}', ...marker(true) },
        shadow: {
            $type: 'shadow',
            $value: [
                { color: '{a}', offsetX: '0px', offsetY: '1px', blur: '6px', spread: '0px' },
                { color: '{a}', offsetX: '0px', offsetY: '2px', blur: '8px', spread: '0px' }
            ]
        },
        typo: { $type: 'typography', $value: { fontFamily: '{a}', fontSize: '12px' } }
    };

    const marked = preprocess(tree);

    assert.deepEqual(
        marked.shadow.$value.map((layer) => layer.color),
        ['{c}', '{c}']
    );
    assert.equal(marked.shadow.$value[0].blur, '6px');
    assert.deepEqual(marked.typo.$value, { fontFamily: '{c}', fontSize: '12px' });
});

test('expressions keep public references and inline private scalar values', () => {
    const tree = {
        c: { $value: '2px' },
        a: { $value: '{c}', ...marker(true) },
        literal: { $value: 0, ...marker(true) },
        expression: { $value: 'calc({a} + {literal}px)', ...marker(true) },
        y: { $value: 'calc({a} * 2)' },
        z: { $value: 'max({expression}, {literal}px)' }
    };

    const marked = preprocess(tree);

    assert.equal(marked.y.$value, 'calc({c} * 2)');
    assert.equal(marked.z.$value, 'max(calc({c} + 0px), 0px)');
});

test('an object or array cannot be interpolated into a string', () => {
    for (const value of [{ value: 6, unit: 'px' }, [1, 2]]) {
        const tree = {
            internal: { $value: value, ...marker(true) },
            consumer: { $value: 'calc({internal} * 2)' }
        };

        assert.throws(() => preprocess(tree), /Cannot interpolate private composite \{internal\}/);
    }
});

test('a reference cycle through private aliases fails the build', () => {
    const tree = {
        a: { $value: '{b}', ...marker(true) },
        b: { $value: '{a}', ...marker(true) }
    };

    assert.throws(() => preprocess(tree), /does not resolve/);
});

test('cycles inside private composites and expressions fail the build', () => {
    for (const value of [{ color: '{a}' }, ['{a}'], 'calc({a} * 2)']) {
        assert.throws(() => preprocess({ a: { $value: value, ...marker(true) } }), /Private reference cycle/);
    }
});

test('a long private chain is not mistaken for a cycle', () => {
    const tree = { literal: { $value: '6px' }, consumer: { $value: '{p0}' } };

    for (let i = 0; i < 30; i++) {
        tree[`p${i}`] = { $value: i === 29 ? '{literal}' : `{p${i + 1}}`, ...marker(true) };
    }

    assert.equal(preprocess(tree).consumer.$value, '{literal}');
});

test('a private alias to a missing token leaves the dangling reference for the build to report', () => {
    const tree = {
        a: { $value: '{nope}', ...marker(true) },
        x: { $value: '{a}' }
    };

    assert.equal(preprocess(tree).x.$value, '{nope}');
});

test('a string marker marks the token private and keeps the reason, as $deprecated does', () => {
    const { marked, privates } = markPrivate({
        a: { $value: '#fff', ...marker('shadow layer, compose it into a shadow instead') }
    });

    assert.deepEqual([...privates], ['a']);
    assert.equal(marked.a.private, true);
    assert.equal(marked.a.privateReason, 'shadow layer, compose it into a shadow instead');
});

test("a group's reason is inherited, and a descendant still opts out with false", () => {
    const { marked, privates } = markPrivate({
        g: {
            ...marker('internal scale, use the semantic sizes'),
            a: { $value: '4px' },
            b: { $value: '8px', ...marker(false) }
        }
    });

    assert.deepEqual([...privates], ['g.a']);
    assert.equal(marked.g.a.privateReason, 'internal scale, use the semantic sizes');
    assert.equal(marked.g.b.private, undefined);
    assert.equal(marked.g.b.privateReason, undefined);
});

test('true carries no reason', () => {
    const { marked } = markPrivate({ a: { $value: '#fff', ...marker(true) } });

    assert.equal(marked.a.private, true);
    assert.equal(marked.a.privateReason, undefined);
});

test('a quoted boolean, an empty string and a non-string are refused', () => {
    // A quoted boolean is a typo, and reading it as a reason would make `private: 'false'` private.
    assert.throws(() => markPrivate({ a: { $value: '#fff', ...marker('false') } }), /must be true, false, or a string/);
    assert.throws(() => markPrivate({ a: { $value: '#fff', ...marker('True') } }), /must be true, false, or a string/);
    assert.throws(() => markPrivate({ a: { $value: '#fff', ...marker('   ') } }), /must be true, false, or a string/);
    assert.throws(() => markPrivate({ a: { $value: '#fff', ...marker(1) } }), /must be true, false, or a string/);
    assert.throws(
        () => markPrivate({ g: { ...marker(null), a: { $value: '#fff' } } }),
        /must be true, false, or a string/
    );
});

test('the input tree is not mutated', () => {
    const tree = deepFreeze({
        c: { $value: '#abc' },
        a: { $value: '{c}', ...marker(true) },
        g: { ...marker(true), b: { $value: '{a}' } },
        composite: { $value: [{ color: '{a}', offset: '{g.b}' }], ...marker(true) },
        consumer: { $value: '{composite}' }
    });
    const before = JSON.stringify(tree);

    assert.doesNotThrow(() => markPrivate(tree));
    assert.doesNotThrow(() => preprocess(tree));
    assert.equal(JSON.stringify(tree), before);
});
