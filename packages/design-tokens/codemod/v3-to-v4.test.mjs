import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from './v3-to-v4.mjs';

// The tokens v4 actually ships. Only the overlay replacement targets matter for these tests, but a
// handful of neighbours keeps the "known token" scan (pass 4) realistic.
const known = new Set([
    '--kbq-background-overlay',
    '--kbq-background-overlay-inverse',
    '--kbq-background-overlay-base-theme',
    '--kbq-background-overlay-base-error',
    '--kbq-opacity-overlay',
    '--kbq-background-theme',
    '--kbq-background-error'
]);
const defined = new Set();

const THEME = 'var(--kbq-background-overlay-theme)';
const ERROR = 'var(--kbq-background-overlay-error)';

const THEME_MIX =
    'color-mix(in srgb, var(--kbq-background-overlay-base-theme) calc(var(--kbq-opacity-overlay) * 100%), transparent)';
const ERROR_MIX =
    'color-mix(in srgb, var(--kbq-background-overlay-base-error) calc(var(--kbq-opacity-overlay) * 100%), transparent)';

test('rewrites the plain theme token', () => {
    const { next, manual } = inspect(`background: ${THEME};`, known, defined);

    assert.equal(next, `background: ${THEME_MIX};`);
    assert.deepEqual(manual, []);
});

test('rewrites the plain error token', () => {
    const { next, manual } = inspect(`background: ${ERROR};`, known, defined);

    assert.equal(next, `background: ${ERROR_MIX};`);
    assert.deepEqual(manual, []);
});

test('rewrites in any color context, not just background', () => {
    for (const property of ['color', 'border-color']) {
        const input = `${property}: ${THEME};`;

        assert.equal(inspect(input, known, defined).next, `${property}: ${THEME_MIX};`);
    }

    const shadow = `box-shadow: 0 0 0 1px ${THEME};`;

    assert.equal(inspect(shadow, known, defined).next, `box-shadow: 0 0 0 1px ${THEME_MIX};`);
});

test('rewrites multiple occurrences in one rule', () => {
    const input = `.x { background: ${THEME}; outline-color: ${ERROR}; }`;
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, `.x { background: ${THEME_MIX}; outline-color: ${ERROR_MIX}; }`);
    assert.deepEqual(manual, []);
});

test('reports a var() with an explicit fallback and leaves it unchanged', () => {
    const input = 'background: var(--kbq-background-overlay-theme, rgba(0,0,0,.5));';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.equal(manual.length, 1);
    assert.equal(manual[0].what, 'var(--kbq-background-overlay-theme, …)');
    assert.match(manual[0].hint, /color-mix/);
});

test('reports a bare token without var() and leaves it unchanged', () => {
    const input = '--my-overlay: --kbq-background-overlay-theme;';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.equal(manual.length, 1);
    assert.equal(manual[0].what, '--kbq-background-overlay-theme');
    assert.match(manual[0].hint, /color-mix/);
});

test('does not report a mention that only lives in a comment', () => {
    const input = '/* was --kbq-background-overlay-theme */';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});

test('leaves the replacement targets alone', () => {
    const input =
        '--kbq-background-overlay-base-theme: x; --kbq-background-overlay-base-error: y; --kbq-opacity-overlay: 0.9;';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});

test('does not rewrite near-miss names', () => {
    // The closing `)` anchors the match, so neither the longer `-theme-extra` name nor the
    // replacement target `-base-theme` is rewritten. (`-theme-extra` is still reported as an
    // unknown token — that is pass 4 doing its job, not the overlay rewrite misfiring.)
    const input = 'var(--kbq-background-overlay-theme-extra); var(--kbq-background-overlay-base-theme);';
    const { next } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.ok(!next.includes('color-mix'));
});

test('does not report the replacement target inside var()', () => {
    const input = 'var(--kbq-background-overlay-base-theme);';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});

test('is idempotent on an already-rewritten expression', () => {
    const input = `background: ${THEME_MIX};`;
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});
