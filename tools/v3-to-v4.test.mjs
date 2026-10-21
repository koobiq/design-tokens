import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspect, parseArgs } from '../packages/design-tokens/codemod/v3-to-v4.mjs';

// The tokens v4 actually ships. Only the overlay replacement targets matter for these tests, but a
// handful of neighbours keeps the "known token" scan (pass 4) realistic.
const known = new Set([
    '--kbq-background-overlay',
    '--kbq-background-overlay-inverse',
    '--kbq-background-overlay-base-theme',
    '--kbq-background-overlay-base-error',
    '--kbq-opacity-overlay',
    '--kbq-background-theme',
    '--kbq-background-error',
    // v4 engineering-palette targets the palette pass rewrites to.
    '--kbq-plt-blue-16',
    '--kbq-plt-black',
    '--kbq-plt-white',
    '--kbq-plt-slate-15'
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

// ---------------------------------------------------------------------------------------------
// Palette: opaque steps get a nearest-colour suggestion (reported by default, applied behind
// --fix-palette when close enough); alpha steps stay report-only.

test('suggests the nearest v4 colour for an opaque palette step, without rewriting', () => {
    const input = 'color: var(--kbq-palette-blue-50);';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.equal(manual.length, 1);
    assert.equal(manual[0].what, '--kbq-palette-blue-50');
    assert.match(manual[0].hint, /--kbq-plt-blue-16/);
    assert.match(manual[0].hint, /ΔE 2\.65/);
});

test('maps the palette ramp ends to black/white', () => {
    const black = inspect('color: var(--kbq-palette-blue-0);', known, defined);
    const white = inspect('color: var(--kbq-palette-blue-100);', known, defined);

    assert.match(black.manual[0].hint, /--kbq-plt-black/);
    assert.match(white.manual[0].hint, /--kbq-plt-white/);
});

test('applies the suggestion with --fix-palette when below the threshold', () => {
    const input = 'color: var(--kbq-palette-blue-50);';
    const { next, manual } = inspect(input, known, defined, { fixPalette: true });

    assert.equal(next, 'color: var(--kbq-plt-blue-16);');
    assert.deepEqual(manual, []);
});

test('keeps the suggestion report-only when above the threshold', () => {
    // blue-50 (ΔE 2.65) is below the default threshold; lower it to 2 and it must stay manual.
    const input = 'color: var(--kbq-palette-blue-50);';
    const { next, manual } = inspect(input, known, defined, { fixPalette: true, paletteDeltaE: 2 });

    assert.equal(next, input);
    assert.equal(manual.length, 1);
    assert.match(manual[0].hint, /above the 2 auto-fix threshold/);
});

test('reports alpha palette steps without a suggestion', () => {
    const input = 'color: var(--kbq-palette-blue-a8);';
    const { next, manual } = inspect(input, known, defined, { fixPalette: true });

    assert.equal(next, input);
    assert.equal(manual.length, 1);
    assert.equal(manual[0].what, '--kbq-palette-blue-a8');
    assert.match(manual[0].hint, /no nearest v4 colour is mapped/);
});

test('does not touch the replacement palette target', () => {
    const input = 'color: var(--kbq-plt-blue-16);';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});

// ---------------------------------------------------------------------------------------------
// CLI argument parsing.

test('parseArgs reads the boolean flags and targets', () => {
    const parsed = parseArgs(['--write', '--fix-palette', 'src']);

    assert.equal(parsed.write, true);
    assert.equal(parsed.fixPalette, true);
    assert.equal(parsed.tokensDir, undefined);
    assert.equal(parsed.paletteDeltaArg, undefined);
    assert.deepEqual(parsed.targets, ['src']);
});

test('parseArgs reads flag values and excludes them from targets', () => {
    const parsed = parseArgs(['--palette-delta-e', '5', '--tokens', '/tokens', 'src']);

    assert.equal(parsed.paletteDeltaArg, '5');
    assert.equal(parsed.tokensDir, '/tokens');
    assert.deepEqual(parsed.targets, ['src']);
});

test('parseArgs tolerates a missing flag value', () => {
    const parsed = parseArgs(['src', '--palette-delta-e']);

    assert.equal(parsed.paletteDeltaArg, undefined);
    assert.deepEqual(parsed.targets, ['src']);
});

test('parseArgs does not take a following flag as a value', () => {
    const parsed = parseArgs(['--palette-delta-e', '--write', 'src']);

    assert.equal(parsed.paletteDeltaArg, undefined);
    assert.equal(parsed.write, true);
    assert.deepEqual(parsed.targets, ['src']);
});

test('parseArgs supports --flag=value', () => {
    const parsed = parseArgs(['--palette-delta-e=5', 'src']);

    assert.equal(parsed.paletteDeltaArg, '5');
    assert.deepEqual(parsed.targets, ['src']);
});

// ---------------------------------------------------------------------------------------------
// Comment / string / url awareness, whitespace, and declaration safety.

test('does not rewrite or report a var() that only lives in a comment', () => {
    const input = '/* before: var(--kbq-background-overlay-theme) */ .x { color: red; }';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});

test('does not treat a // inside url() as a comment', () => {
    const input = '.a { background: url(https://x/y.png), var(--kbq-background-overlay-theme, red); }';
    const { manual } = inspect(input, known, defined);

    assert.equal(manual.length, 1);
    assert.equal(manual[0].what, 'var(--kbq-background-overlay-theme, …)');
});

test('does not treat /* inside a string as a comment', () => {
    const input = "const g = 'icons/*.svg';\n.x { color: var(--kbq-background-overlay-theme); }";
    const { next } = inspect(input, known, defined);

    assert.ok(next.includes("'icons/*.svg'"));
    assert.ok(next.includes('color-mix(in srgb, var(--kbq-background-overlay-base-theme)'));
});

test('rewrites a var() with whitespace before the closing paren', () => {
    assert.match(inspect('.a { color: var(--kbq-background-overlay-theme ); }', known, defined).next, /color-mix/);
    assert.match(inspect('.a { color: var(--kbq-background-overlay-error\n); }', known, defined).next, /color-mix/);
});

test('does not rewrite or report a palette token that only lives in a comment', () => {
    const input = '/* was --kbq-palette-blue-50 */ .x { color: red; }';
    const { next, manual } = inspect(input, known, defined, { fixPalette: true });

    assert.equal(next, input);
    assert.deepEqual(manual, []);
});

test('does not rewrite a palette declaration with --fix-palette', () => {
    const input = ':root { --kbq-palette-blue-50: #fff; } .x { color: var(--kbq-palette-blue-50); }';
    const { next, manual } = inspect(input, known, defined, { fixPalette: true });

    assert.ok(next.includes('--kbq-palette-blue-50: #fff'));
    assert.ok(next.includes('var(--kbq-plt-blue-16)'));
    assert.equal(manual.length, 1);
    assert.match(manual[0].hint, /declared here/);
});

test('maps the -s69 opaque steps', () => {
    const input = 'color: var(--kbq-palette-red-51-s69);';
    const { next, manual } = inspect(input, known, defined);

    assert.equal(next, input);
    assert.equal(manual.length, 1);
    assert.match(manual[0].hint, /--kbq-plt-red-15/);
});
