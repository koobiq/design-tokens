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

import JSON5 from 'json5';

import { isTransparentLayer } from '../packages/tokens-builder/preprocessors/drop-transparent-shadow-layers.js';

const DIST = path.join(process.cwd(), 'dist/design-tokens/web');
// Sliced files live under css/; the css-tokens*.css aggregates sit at the root of web/.
const BUNDLE = path.join(DIST, 'css/index.bundled.css');

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

// 4b. Shape of the shadows in the built CSS. A composite shadow is written with its parameters
//     already substituted (formats/shadow-references.js) — the offsets, blur, spread and colors are
//     sources only and must not leak out as variables of their own. What ships:
//       --kbq-shadow-outline|key|ambient            color roles (colors.json5)
//       --kbq-shadow-<flat>                         1–3 layers, each `x y blur spread color`
//       --kbq-shadow-<overflow>-<side>              1–3 layers, each `x y blur spread color`
//     The sources always have three layers; a fully transparent one is left out of the output.
//     Style Dictionary's own reference pass would put a var() wherever a resolved literal first
//     occurs, and a shadow is mostly repeated literals (0px, 1px, 6px), hence the custom assembly.
const SHADOW_LAYERS = ['outline', 'key', 'ambient'];
const SHADOW_ROLE = /^--kbq-shadow-(outline|key|ambient)$/;
const SHADOW_FINAL = /^--kbq-shadow-(card|popup|overlay|overflow-(?:compact|normal))(?:-(top|right|bottom|left))?$/;
const SHADOW_LAYER_VALUE = /^-?[\d.]+px -?[\d.]+px [\d.]+px -?[\d.]+px (?:var\(--[\w-]+\)|#[0-9a-fA-F]{6,8})$/;

for (const [selector, declarations] of bySelector) {
    for (const [name, value] of declarations) {
        if (!name.startsWith('--kbq-shadow-') || SHADOW_ROLE.test(name)) continue;

        const final = name.match(SHADOW_FINAL);

        if (!final) {
            fail(
                'shadow parameters',
                `${selector} { ${name} } is a CSS variable of a shadow parameter; parameters are sources only`
            );
            continue;
        }

        const layers = value.split(/,\s*(?![^(]*\))/).map((layer) => layer.trim());

        if (layers.length < 1 || layers.length > SHADOW_LAYERS.length) {
            fail('shadow layers', `${selector} { ${name} } has ${layers.length} layers, expected 1 to 3`);
            continue;
        }

        layers.forEach((layer, index) => {
            if (!SHADOW_LAYER_VALUE.test(layer)) {
                fail(
                    'shadow layers',
                    `${selector} { ${name} } layer ${index + 1} is "${layer}", expected "x y blur spread color"`
                );
            }
        });
    }
}

// 4c. The shadow parameters mirror Figma, where variables cannot negate, so every offset-neg is a value
//     of its own rather than a calc() of the offset, and nothing in the build ties the pair together.
//     The layers of a sided shadow pick x and y from the layer variable their side needs (as in
//     Figma). All of that lives in the sources, so it is checked there, and then against the CSS.
const shadowSource = JSON5.parse(
    fs.readFileSync(path.join(process.cwd(), 'packages/design-tokens/web/properties/shadows.json5'), 'utf8')
);
const flatten = (node, prefix, into) => {
    for (const [key, child] of Object.entries(node)) {
        if (key.startsWith('$') || child === null || typeof child !== 'object') continue;

        const next = [...prefix, key];

        if ('$value' in child) into.set(next.join('.'), child.$value);
        else flatten(child, next, into);
    }

    return into;
};
const sourceValues = new Map();

for (const file of fs.readdirSync(path.join(process.cwd(), 'packages/design-tokens/web/properties'))) {
    if (file.endsWith('.json5')) {
        flatten(
            JSON5.parse(
                fs.readFileSync(path.join(process.cwd(), 'packages/design-tokens/web/properties', file), 'utf8')
            ),
            [],
            sourceValues
        );
    }
}

const shadowToken = (tokenPath) => tokenPath.split('.').reduce((node, key) => node?.[key], shadowSource);
const shadowPx = (value) => {
    let current = value;

    for (let hops = 0; hops < 10; hops++) {
        const next = String(current).match(/^\{(.+)\}$/);

        if (!next) return current;
        current = shadowToken(next[1])?.$value;
    }

    return undefined;
};
const SIDE_SOURCE = {
    top: { x: 'cross', y: 'offset-neg' },
    right: { x: 'offset', y: 'cross' },
    bottom: { x: 'cross', y: 'offset' },
    left: { x: 'offset-neg', y: 'cross' }
};
const mirrored = (positive, negative, label) => {
    if (parseFloat(shadowPx(positive)) + parseFloat(shadowPx(negative)) !== 0) {
        fail('offset-neg', `${label}: ${shadowPx(negative)} does not mirror ${shadowPx(positive)}`);
    }
};

for (const shadow of ['overflow-compact', 'overflow-normal']) {
    for (const layer of SHADOW_LAYERS) {
        mirrored(
            `{shadow.${shadow}.base.${layer}.offset}`,
            `{shadow.${shadow}.base.${layer}.offset-neg}`,
            `shadow.${shadow}.base.${layer}.offset-neg`
        );
    }

    for (const [side, axes] of Object.entries(SIDE_SOURCE)) {
        for (const [index, layer] of SHADOW_LAYERS.entries()) {
            for (const [theme, selector] of [
                ['light', '.kbq-light'],
                ['dark', '.kbq-dark']
            ]) {
                const key = `shadow.${theme}.${shadow}-${side}[${index}]`;
                const value = shadowToken(`shadow.${theme}.${shadow}-${side}`)?.$value?.[index];
                const expected = {
                    color: `{${theme}.shadow.${shadow}.base.${layer}.color}`,
                    offsetX: `{shadow.${shadow}.base.${layer}.${axes.x}}`,
                    offsetY: `{shadow.${shadow}.base.${layer}.${axes.y}}`,
                    blur: `{shadow.${shadow}.base.${layer}.blur}`,
                    spread: `{shadow.${shadow}.base.${layer}.spread}`
                };

                for (const [field, ref] of Object.entries(expected)) {
                    if (value?.[field] !== ref) {
                        fail('shadow sides', `${key}.${field} is ${value?.[field]}, expected ${ref}`);
                    }
                }

                // A fully transparent layer is not in the CSS; the others keep their order.
                const sourceLayers = shadowToken(`shadow.${theme}.${shadow}-${side}`)?.$value ?? [];
                const shipped = sourceLayers.filter(
                    (item) => !isTransparentLayer(item, (ref) => sourceValues.get(ref))
                );
                const cssLayers = (bySelector.get(selector)?.get(`--kbq-shadow-${shadow}-${side}`) ?? '')
                    .split(/,\s*(?![^(]*\))/)
                    .map((item) => item.trim());

                if (cssLayers.length !== shipped.length) {
                    fail(
                        'shadow sides',
                        `${selector} { --kbq-shadow-${shadow}-${side} } has ${cssLayers.length} layers, expected ${shipped.length} (the transparent ones are left out)`
                    );
                }

                if (isTransparentLayer(value ?? {}, (ref) => sourceValues.get(ref))) continue;

                const css = cssLayers[shipped.indexOf(value)] ?? '';
                const geometry = [expected.offsetX, expected.offsetY, expected.blur, expected.spread]
                    .map(shadowPx)
                    .join(' ');

                if (!css.startsWith(`${geometry} `)) {
                    fail(
                        'shadow sides',
                        `${selector} { --kbq-shadow-${shadow}-${side} } layer ${index + 1} is "${css}", expected it to start with "${geometry}"`
                    );
                }
            }
        }
    }
}

// 4d. Every shadow is a composite with `$type: 'shadow'`. The build tells a composite from a shadow
//     parameter by that type (isShadowParameter): a shadow that loses it is taken for a parameter and
//     disappears from the CSS, Sass and JS output without an error. So the source is checked, and so
//     is that every shadow made it into the CSS of both themes.
const SHADOW_NAMES = [
    'card',
    'popup',
    'overlay',
    ...['overflow-compact', 'overflow-normal'].flatMap((shadow) =>
        ['top', 'right', 'bottom', 'left'].map((side) => `${shadow}-${side}`)
    )
];

for (const [theme, selector] of [
    ['light', '.kbq-light'],
    ['dark', '.kbq-dark']
]) {
    const group = shadowSource.shadow?.[theme] ?? {};

    for (const [name, token] of Object.entries(group)) {
        if (!name.startsWith('$') && token.$type !== 'shadow') {
            fail('shadow type', `shadow.${theme}.${name} has no $type: 'shadow', so the build would drop it`);
        }
    }

    for (const name of SHADOW_NAMES) {
        if (group[name]?.$type !== 'shadow') {
            fail('shadow type', `shadow.${theme}.${name} is missing or is not a $type: 'shadow' token`);
        }

        if (!bySelector.get(selector)?.has(`--kbq-shadow-${name}`)) {
            fail('shadow type', `${selector} { --kbq-shadow-${name} } is missing from the built CSS`);
        }
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

// 6. The css-tokens*.css entry point keeps its references too. It is a separate set of files
//    from the index, and `outputReferences` has to be switched on per file — forget it there and
//    role tokens become resolved literals, so repointing the semantic layer silently stops
//    working for everyone consuming that entry point (which is most of them).
for (const [file, selector] of [
    ['css-tokens-light.css', '.kbq-light'],
    ['css-tokens-dark.css', '.kbq-dark']
]) {
    const path_ = path.join(DIST, file);

    if (!fs.existsSync(path_)) {
        fail('css-tokens entry point', `${file} is missing`);
        continue;
    }

    const contents = fs.readFileSync(path_, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const declaration = contents.match(/--kbq-background-theme\s*:\s*([^;]*);/);

    if (!declaration) {
        fail('css-tokens entry point', `${file} does not declare --kbq-background-theme`);
    } else if (!declaration[1].trim().startsWith('var(--kbq-semantic-')) {
        fail(
            'css-tokens entry point',
            `${selector} { --kbq-background-theme } in ${file} is "${declaration[1].trim()}" — ` +
                'the reference was flattened, so outputReferences is off for that file'
        );
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
console.log('✔ shadow offset-neg tokens mirror their offsets');
console.log('✔ every shadow is a $type: shadow composite and ships in both themes');
console.log('✔ shadow parameters ship no variables of their own');
console.log('✔ layers of the sided shadows take the right layer values');
console.log('✔ no references to the removed v3 palette');
console.log('✔ css-tokens*.css keeps the semantic references too');
