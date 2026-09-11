#!/usr/bin/env node
/**
 * Guards the properties of the built CSS that the token architecture depends on (#DS-3002).
 *
 * The design system is three layers deep — a role points at the semantic palette, which
 * points at the engineering palette, which holds the literal OKLch value:
 *
 *   --kbq-background-bg-secondary → --kbq-semantic-contrast-1 → --kbq-plt-slate-1 → oklch(…)
 *
 * That chain only survives in the output because `outputReferences` is on and the semantic
 * palette duplicates the engineering palette 1:1. It is easy to break by accident — a filter
 * change, a colour transform waking up, a token going missing — and nothing else in the build
 * would fail. Hence these checks.
 *
 *   node tools/check-references.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist/design-tokens/web');
const BUNDLE = path.join(DIST, 'index.bundled.css');

const failures = [];
const fail = (check, detail) => failures.push({ check, detail });

if (!fs.existsSync(BUNDLE)) {
    console.error(`✖ ${path.relative(process.cwd(), BUNDLE)} not found — run \`yarn build\` first.`);
    process.exit(1);
}

// Comments are stripped first: the file header sits right before the opening `:root`, and a
// selector pattern would otherwise swallow it. Declaration comments aren't needed here either.
const css = fs.readFileSync(BUNDLE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Declarations grouped per selector, because `--kbq-background-card` legitimately has one
 * value under `.kbq-light` and another under `.kbq-dark`.
 * @type {Map<string, Map<string, string>>}
 */
const bySelector = new Map();
const blockRegex = /([^{}]+)\{([^}]*)\}/g;
let block;

while ((block = blockRegex.exec(css)) !== null) {
    const selector = block[1].trim();
    const declarations = bySelector.get(selector) ?? new Map();

    for (const line of block[2].split('\n')) {
        const match = line.trim().match(/^(--[\w-]+)\s*:\s*([^;]*);/);

        if (match) declarations.set(match[1], match[2].trim());
    }

    bySelector.set(selector, declarations);
}

const root = bySelector.get(':root') ?? new Map();
const scopes = {
    ':root': root,
    '.kbq-light': new Map([...root, ...(bySelector.get('.kbq-light') ?? new Map())]),
    '.kbq-dark': new Map([...root, ...(bySelector.get('.kbq-dark') ?? new Map())])
};

const allDeclarations = [...bySelector.values()].reduce((sum, decls) => sum + decls.size, 0);

console.log(`Checking ${path.relative(process.cwd(), BUNDLE)} — ${allDeclarations} declarations`);

// 1. Every var() resolves. A theme-scoped variable may reference a :root one, so each theme
//    scope is checked against :root plus its own declarations.
for (const [selector, declarations] of Object.entries(scopes)) {
    for (const [name, value] of declarations) {
        for (const [, referenced] of value.matchAll(/var\((--[\w-]+)/g)) {
            if (!declarations.has(referenced)) {
                fail('dangling var()', `${selector} { ${name} } references ${referenced}, which is not declared`);
            }
        }
    }
}

// 2. The three-layer chain is intact. If the semantic layer ever stops emitting references,
//    role tokens silently inline a literal and re-theming by repointing the semantic layer
//    (which is the whole point of duplicating the palette) stops working.
const chain = [
    ['.kbq-light', '--kbq-background-bg-secondary', 'var(--kbq-semantic-contrast-1)'],
    [':root', '--kbq-semantic-contrast-1', 'var(--kbq-plt-slate-1)'],
    ['.kbq-dark', '--kbq-background-bg-secondary', 'var(--kbq-semantic-dark-contrast-2)'],
    [':root', '--kbq-semantic-dark-contrast-2', 'var(--kbq-plt-dark-slate-2)']
];

for (const [selector, name, expected] of chain) {
    const actual = scopes[selector].get(name);

    if (actual !== expected) {
        fail('reference chain', `${selector} { ${name} } is "${actual}", expected "${expected}"`);
    }
}

if (!/^oklch\(/.test(root.get('--kbq-plt-slate-1') ?? '')) {
    fail('reference chain', `--kbq-plt-slate-1 is "${root.get('--kbq-plt-slate-1')}", expected a literal oklch()`);
}

// 3. The engineering palette stays in OKLch. `color/css` and `color/hex` match on $type in
//    Style Dictionary 4+, so re-adding either to a transform group would quietly flatten the
//    wide-gamut palette to hex/rgb.
for (const [name, value] of root) {
    if (name.startsWith('--kbq-plt-') && !value.startsWith('oklch(')) {
        fail('OKLch palette', `${name} is "${value}", expected oklch()`);
    }
}

// 4. Multi-layer shadows keep one reference per layer. Style Dictionary resolves references
//    inside object-valued tokens by substituting the first occurrence of the resolved literal,
//    and shadow-key and shadow-ambient resolve to the same colour — so a regression here
//    shows up as the same var() twice rather than as a build error.
for (const selector of ['.kbq-light', '.kbq-dark']) {
    const card = scopes[selector].get('--kbq-shadow-card') ?? '';
    const refs = [...card.matchAll(/var\((--[\w-]+)\)/g)].map(([, ref]) => ref);

    if (selector === '.kbq-light' && new Set(refs).size !== refs.length) {
        fail('shadow layers', `${selector} { --kbq-shadow-card } repeats a reference: ${refs.join(', ')}`);
    }
}

// 5. Nothing references the palette that v4 removed.
for (const [selector, declarations] of bySelector) {
    for (const [name, value] of declarations) {
        if (name.startsWith('--kbq-palette-') || value.includes('var(--kbq-palette-')) {
            fail('removed palette', `${selector} { ${name} } still refers to the v3 --kbq-palette-* layer`);
        }
    }
}

if (failures.length > 0) {
    console.error(`\n✖ ${failures.length} problem(s):\n`);
    for (const { check, detail } of failures) console.error(`  [${check}] ${detail}`);
    process.exit(1);
}

console.log('✔ var() references all resolve');
console.log('✔ role → semantic → plt → oklch chain intact (light and dark)');
console.log('✔ engineering palette is OKLch throughout');
console.log('✔ multi-layer shadows keep one reference per layer');
console.log('✔ no references to the removed v3 palette');
