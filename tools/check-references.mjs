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

import { normalizeLength, shadowGeometry } from '../packages/tokens-builder/formats/shadow-references.js';
import { isTransparentLayer } from '../packages/tokens-builder/preprocessors/drop-transparent-shadow-layers.js';
import { markPrivate } from '../packages/tokens-builder/preprocessors/private.js';

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
//       --kbq-shadow-outline|key|ambient            color roles (shadow.light|dark in shadows.json5)
//       --kbq-shadow-<flat>                         1–3 layers, each `x y [blur [spread]] color`
//       --kbq-shadow-<overflow>-<side>              1–3 layers, each `x y [blur [spread]] color`
//     Zero lengths are unitless (`0`, not `0px`), and trailing zero blur and spread are left out.
//     The sources always have three layers; a fully transparent one is left out of the output.
//     Style Dictionary's own reference pass would put a var() wherever a resolved literal first
//     occurs, and a shadow is mostly repeated literals (0px, 1px, 6px), hence the custom assembly.
const SHADOW_LAYERS = ['outline', 'key', 'ambient'];
const SHADOW_ROLE = /^--kbq-shadow-(outline|key|ambient)$/;
const SHADOW_FINAL = /^--kbq-shadow-(card|popup|overlay|overflow-(?:compact|normal))(?:-(top|right|bottom|left))?$/;
// A length is `0` or a non-zero value with a unit; `0px` is refused.
const SHADOW_LENGTH = String.raw`(?:0|-?(?!0(?:\.0+)?px\b)\d+(?:\.\d+)?px)`;
const SHADOW_LAYER_VALUE = new RegExp(
    `^${SHADOW_LENGTH} ${SHADOW_LENGTH}(?: ${SHADOW_LENGTH}(?: ${SHADOW_LENGTH})?)? (?:var\\(--[\\w-]+\\)|#[0-9a-fA-F]{6,8})$`
);

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
// Every source token by its path. Tokens are read with the marking of the build (preprocessors/private.js),
// so these checks and the build agree on which tokens are private.
const flatten = (node, prefix, into, inheritedType) => {
    const type = node.$type ?? inheritedType;

    for (const [key, child] of Object.entries(node)) {
        if (key.startsWith('$') || child === null || typeof child !== 'object') continue;

        const next = [...prefix, key];

        // $type is inherited from the groups, as Style Dictionary and the typography preprocessor read it.
        if ('$value' in child) into.set(next.join('.'), { ...child, $type: child.$type ?? type });
        else flatten(child, next, into, type);
    }

    return into;
};
const sourceTokens = new Map();

for (const dir of ['properties', 'components']) {
    const sourceDir = path.join(process.cwd(), 'packages/design-tokens/web', dir);

    for (const file of fs.readdirSync(sourceDir)) {
        if (file.endsWith('.json5')) {
            const { marked } = markPrivate(JSON5.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8')));

            flatten(marked, [], sourceTokens);
        }
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

for (const theme of ['light', 'dark']) {
    for (const path of ['overflow.compact', 'overflow.normal']) {
        for (const layer of SHADOW_LAYERS) {
            mirrored(
                `{shadow.${theme}.${path}.base.${layer}.offset}`,
                `{shadow.${theme}.${path}.base.${layer}.offset-neg}`,
                `shadow.${theme}.${path}.base.${layer}.offset-neg`
            );
        }
    }
}

for (const shadow of ['overflow-compact', 'overflow-normal']) {
    // The source of a directional shadow: overflow.compact, overflow.normal. Its CSS name is unchanged.
    const path = shadow.replace('overflow-', 'overflow.');

    for (const [side, axes] of Object.entries(SIDE_SOURCE)) {
        for (const [index, layer] of SHADOW_LAYERS.entries()) {
            for (const [theme, selector] of [
                ['light', '.kbq-light'],
                ['dark', '.kbq-dark']
            ]) {
                const key = `shadow.${theme}.${path}.${side}[${index}]`;
                const value = shadowToken(`shadow.${theme}.${path}.${side}`)?.$value?.[index];
                const expected = {
                    color: `{shadow.${theme}.${path}.base.${layer}.color}`,
                    offsetX: `{shadow.${theme}.${path}.base.${layer}.${axes.x}}`,
                    offsetY: `{shadow.${theme}.${path}.base.${layer}.${axes.y}}`,
                    blur: `{shadow.${theme}.${path}.base.${layer}.blur}`,
                    spread: `{shadow.${theme}.${path}.base.${layer}.spread}`
                };

                for (const [field, ref] of Object.entries(expected)) {
                    if (value?.[field] !== ref) {
                        fail('shadow sides', `${key}.${field} is ${value?.[field]}, expected ${ref}`);
                    }
                }

                // A fully transparent layer is not in the CSS; the others keep their order.
                const sourceLayers = shadowToken(`shadow.${theme}.${path}.${side}`)?.$value ?? [];
                const shipped = sourceLayers.filter(
                    (item) => !isTransparentLayer(item, (ref) => sourceTokens.get(ref)?.$value)
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

                if (isTransparentLayer(value ?? {}, (ref) => sourceTokens.get(ref)?.$value)) continue;

                const css = cssLayers[shipped.indexOf(value)] ?? '';
                const geometry = shadowGeometry(
                    [expected.offsetX, expected.offsetY, expected.blur, expected.spread].map((value) =>
                        normalizeLength(shadowPx(value))
                    )
                ).join(' ');

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
    ...['compact', 'normal'].flatMap((kind) =>
        ['top', 'right', 'bottom', 'left'].map((side) => `overflow.${kind}.${side}`)
    )
];

// Every token under a node, by its dotted path, as the source spells it.
const leavesOf = (node, prefix = []) =>
    Object.entries(node).flatMap(([key, child]) => {
        if (key.startsWith('$') || child === null || typeof child !== 'object') return [];
        if ('$value' in child) return [[[...prefix, key].join('.'), child]];

        return leavesOf(child, [...prefix, key]);
    });

for (const [theme, selector] of [
    ['light', '.kbq-light'],
    ['dark', '.kbq-dark']
]) {
    const group = shadowSource.shadow?.[theme] ?? {};

    // Apart from the colour roles (outline, key, ambient) and the base parameters, a token of the theme is a composite.
    for (const [path, token] of leavesOf(group)) {
        if (SHADOW_LAYERS.includes(path) || path.split('.').includes('base')) continue;

        if (token.$type !== 'shadow') {
            fail('shadow type', `shadow.${theme}.${path} has no $type: 'shadow', so the build would drop it`);
        }
    }

    for (const name of SHADOW_NAMES) {
        if (shadowToken(`shadow.${theme}.${name}`)?.$type !== 'shadow') {
            fail('shadow type', `shadow.${theme}.${name} is missing or is not a $type: 'shadow' token`);
        }

        // A composite's CSS name is its path joined with dashes: overflow.normal.top is --kbq-shadow-overflow-normal-top.
        const cssName = name.replace(/\./g, '-');

        if (!bySelector.get(selector)?.has(`--kbq-shadow-${cssName}`)) {
            fail('shadow type', `${selector} { --kbq-shadow-${cssName} } is missing from the built CSS`);
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

// 7. Private tokens ship no variable. A private token (`$extensions['io.koobiq.tokens'].private`) is an
//    intermediate value: references resolve through it and it has no variable, constant or Sass
//    variable on any platform. So its name appears in no output, neither declared nor referenced: a
//    var() to it would not resolve. Names are derived the way each platform derives them
//    (transforms/name/custom-kebab.js, formats/strip-theme.js, name/kebab, name/pascal).
//    A typography composite is expanded into one token per sub-property (preprocessors/expand-typography.js),
//    so the variables it ships are named `<name>-<sub>`. Those are the names checked for it, exactly as
//    the expansion emits them, not every name that merely starts with the composite's.
const kebabPart = (part) =>
    part
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s.]+/g, '-')
        .toLowerCase();
const capitalize = (part) => part.charAt(0).toUpperCase() + part.slice(1);

// The sub-properties a typography composite expands into: its own object value, or the object value of
// the composite it aliases. Any other token, a shadow included, is not expanded, so it has none.
const COMPOSITE_ALIAS = /^\{([^{}]+)\}$/;
const MAX_ALIAS_HOPS = 20;
const expandedSubProperties = (tokenPath) => {
    let node = sourceTokens.get(tokenPath);

    for (let hops = 0; hops < MAX_ALIAS_HOPS; hops++) {
        if (node?.$type !== 'typography') return [];
        if (node.$value !== null && typeof node.$value === 'object' && !Array.isArray(node.$value)) {
            return Object.keys(node.$value);
        }

        const alias = typeof node.$value === 'string' ? COMPOSITE_ALIAS.exec(node.$value) : null;

        if (!alias) return [];

        node = sourceTokens.get(alias[1]);
    }

    return [];
};

const outputNames = (tokenPath, subProperties) => {
    const parts = tokenPath.split('.');
    const cssBase = parts
        .filter((part) => part !== 'light' && part !== 'dark')
        .map(kebabPart)
        .join('-')
        .replace(/-a-(\d+)$/, '-a$1');
    // Sass and JS names keep the theme first for the shadows (transforms/name/theme-first.js).
    const themed =
        parts[0] === 'shadow' && ['light', 'dark'].includes(parts[1]) ? [parts[1], parts[0], ...parts.slice(2)] : parts;
    const sassBase = themed.map(kebabPart).join('-');
    const pascalBase = themed
        .flatMap((part) => part.split('-'))
        .map(capitalize)
        .join('');
    const names = [
        { css: cssBase, sass: sassBase, pascal: pascalBase },
        ...subProperties.map((sub) => ({
            css: `${cssBase}-${kebabPart(sub)}`,
            sass: `${sassBase}-${kebabPart(sub)}`,
            pascal: pascalBase + capitalize(sub)
        }))
    ];

    return names.flatMap(({ css, sass, pascal }) => [
        ['CSS', new RegExp(`(?<![\\w-])--kbq-${css}(?![\\w-])`)],
        ['Sass', new RegExp(`(?<![\\w-])\\$${sass}(?![\\w-])`)],
        ['JS', new RegExp(`(?<![\\w])${pascal}(?![\\w])`)]
    ]);
};

const outputFiles = [];
const collectOutputs = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);

        if (entry.isDirectory()) collectOutputs(file);
        else if (/\.(css|scss|mjs|js|ts)$/.test(entry.name)) outputFiles.push(file);
    }
};

collectOutputs(DIST);

const outputs = outputFiles.map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }));

for (const [tokenPath, token] of sourceTokens) {
    if (token.private !== true) continue;

    for (const [platform, pattern] of outputNames(tokenPath, expandedSubProperties(tokenPath))) {
        for (const { file, text } of outputs) {
            const found = pattern.exec(text);

            if (found) {
                const reason = token.privateReason ? ` (${token.privateReason})` : '';

                fail(
                    'private tokens',
                    `${tokenPath} is private${reason}, but its ${platform} name ${found[0]} is in ${path.relative(process.cwd(), file)}`
                );
            }
        }
    }
}

// 8. A private token with a literal value is inlined into each of its consumers, so the consumer
//    takes that literal as its own value. A literal that differs by theme would then be frozen into
//    the other theme: a consumer in :root keeps one value for both, and the CSS stays valid, so nothing
//    else would notice. Every consumer of such a token must therefore be in the same theme.
const REFERENCE_IN_VALUE = /\{([^{}]+)\}/g;
const isAlias = (token) => typeof token.$value === 'string' && /^\{[^{}]+\}$/.test(token.$value);
const referencedPaths = (value) => {
    if (typeof value === 'string') return [...value.matchAll(REFERENCE_IN_VALUE)].map(([, ref]) => ref);
    if (value !== null && typeof value === 'object') return Object.values(value).flatMap(referencedPaths);

    return [];
};
// The theme of a token: its first or second path segment, as attribute/cti reads it (light.* and shadow.light.*).
const themeOf = (tokenPath) => {
    const [first, second] = tokenPath.split('.');

    return ['light', 'dark'].find((theme) => first === theme || second === theme);
};
// A reference to a private alias is followed to its target, the way the build collapses it.
const effectivePath = (tokenPath) => {
    let current = tokenPath;

    for (let hops = 0; hops < 20; hops++) {
        const token = sourceTokens.get(current);

        if (!token?.private || !isAlias(token)) return current;

        current = token.$value.slice(1, -1);
    }

    fail('private tokens', `${tokenPath} is an alias chain of private tokens that does not resolve`);

    return current;
};

for (const [tokenPath, token] of sourceTokens) {
    if (token.private && isAlias(token)) continue;

    for (const ref of referencedPaths(token.$value)) {
        const target = effectivePath(ref);
        const dependency = sourceTokens.get(target);
        const theme = themeOf(target);

        if (!dependency?.private || isAlias(dependency) || !theme) continue;

        if (themeOf(tokenPath) !== theme) {
            fail(
                'private modes',
                `${tokenPath} (${themeOf(tokenPath) ?? 'not theme-scoped'}) uses ${target}, a private ${theme} ` +
                    `literal, which would freeze the ${theme} value into a scope of another theme`
            );
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
console.log('✔ shadow offset-neg tokens mirror their offsets');
console.log('✔ every shadow is a $type: shadow composite and ships in both themes');
console.log('✔ shadow parameters ship no variables of their own');
console.log('✔ layers of the sided shadows take the right layer values');
console.log('✔ no references to the removed v3 palette');
console.log('✔ css-tokens*.css keeps the semantic references too');
console.log('✔ private tokens are in no output, on any platform');
console.log('✔ private literals are only used by consumers of their own theme');
