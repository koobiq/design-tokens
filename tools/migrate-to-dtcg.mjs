#!/usr/bin/env node
/**
 * One-off migration of the token sources to the W3C DTCG format (#DS-3002).
 *
 * Style Dictionary ships `convertToDTCG`, but it only renames value/type/description —
 * it leaves our custom `deprecated` key alone and it can't invent `$type` for sources
 * that never had one. It also has no notion of the composite tokens we want. So this
 * script does the whole thing:
 *
 *   1. value → $value, description → $description, deprecated → $deprecated
 *   2. $type on group nodes (inherited by descendants, per spec)
 *   3. typography presets and shadows collapse into composite tokens
 *
 * Run once, then delete. Kept in the repo as the record of how the conversion was made.
 *
 *   node tools/migrate-to-dtcg.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import JSON5 from 'json5';

const ROOT = process.cwd();
const PROPS = path.join(ROOT, 'packages/design-tokens/web/properties');
const COMPONENTS = path.join(ROOT, 'packages/design-tokens/web/components');

const isToken = (node) => node && typeof node === 'object' && !Array.isArray(node) && 'value' in node;

/** Rename the v3 keys to their `$`-prefixed DTCG counterparts, depth-first. */
function toDollarKeys(node) {
    if (!node || typeof node !== 'object') return node;

    if (isToken(node)) {
        const out = {};

        if ('type' in node) out.$type = node.type;
        out.$value = node.value;
        if ('description' in node) out.$description = node.description;
        if ('deprecated' in node) out.$deprecated = node.deprecated;

        for (const [k, v] of Object.entries(node)) {
            if (!['type', 'value', 'description', 'deprecated'].includes(k)) out[k] = v;
        }

        return out;
    }

    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, toDollarKeys(v)]));
}

/** Insert `$type` at `dotted.path`, keeping it as the first key of the group. */
function setType(root, dotted, type) {
    const segments = dotted.split('.');
    let node = root;

    for (const segment of segments) {
        if (!node[segment]) throw new Error(`setType: no such path ${dotted}`);
        node = node[segment];
    }

    const rest = Object.entries(node).filter(([k]) => k !== '$type');

    for (const key of Object.keys(node)) delete node[key];
    node.$type = type;
    for (const [k, v] of rest) node[k] = v;
}

const KEBAB_TO_CAMEL = {
    'font-size': 'fontSize',
    'line-height': 'lineHeight',
    'letter-spacing': 'letterSpacing',
    'font-weight': 'fontWeight',
    'font-family': 'fontFamily',
    'text-transform': 'textTransform',
    'font-feature-settings': 'fontFeatureSettings'
};

/**
 * Collapse a flat typography preset into a DTCG `typography` composite.
 *
 * Sub-property names become camelCase because that is what the spec (and Style
 * Dictionary's `expand`) uses. The CSS variable names are unaffected — `name/custom-kebab`
 * turns `fontSize` back into `font-size`.
 */
function toTypographyComposite(preset) {
    const $value = {};

    for (const [prop, token] of Object.entries(preset)) {
        const key = KEBAB_TO_CAMEL[prop] ?? prop;
        let value = token.value;

        // References into another preset have to follow the same rename.
        value = value.replace(/\{([^}]+)\}/g, (match, refPath) => {
            const parts = refPath.split('.');
            const last = parts.at(-1);

            return KEBAB_TO_CAMEL[last] ? `{${parts.slice(0, -1).join('.')}.${KEBAB_TO_CAMEL[last]}}` : match;
        });

        $value[key] = key === 'fontWeight' && /^\d+$/.test(value) ? Number(value) : value;
    }

    return { $type: 'typography', $value };
}

/**
 * Split a CSS box-shadow string into DTCG shadow layers.
 *
 * Layers are separated by commas that are not inside a reference or a function call.
 * Each layer is `<offsetX> <offsetY> [blur] [spread] <color>`, where the colour is the
 * part that is a `{reference}` (every shadow here ends in one).
 */
function toShadowComposite(value) {
    const layers = value
        .split(/,(?![^{]*\})/)
        .map((layer) => layer.trim())
        .filter(Boolean)
        .map((layer) => {
            const parts = layer.split(/\s+/);
            const colorIndex = parts.findIndex((part) => part.startsWith('{'));

            if (colorIndex === -1) throw new Error(`shadow layer without a colour: ${layer}`);

            const lengths = parts.slice(0, colorIndex);
            const color = parts[colorIndex];
            const [offsetX, offsetY, blur, spread] = lengths;
            const shadow = { color, offsetX, offsetY };

            if (blur !== undefined) shadow.blur = blur;
            if (spread !== undefined) shadow.spread = spread;

            return shadow;
        });

    return { $type: 'shadow', $value: layers.length === 1 ? layers[0] : layers };
}

const write = (file, data) => {
    fs.writeFileSync(file, JSON5.stringify(data, null, 4) + '\n');
    console.log(`  ✔ ${path.relative(ROOT, file)}`);
};

const read = (file) => JSON5.parse(fs.readFileSync(file, 'utf8'));

console.log('Converting token sources to DTCG...');

// ---- plain colour / dimension / fontFamily sources -------------------------------------
for (const [file, types] of [
    ['plt.json5', { plt: 'color' }],
    ['semantic.json5', { semantic: 'color' }],
    ['globals.json5', { size: 'dimension' }],
    ['font.json5', { font: 'fontFamily' }]
]) {
    const target = path.join(PROPS, file);
    const data = toDollarKeys(read(target));

    for (const [dotted, type] of Object.entries(types)) setType(data, dotted, type);
    write(target, data);
}

// ---- colors: colour groups plus two numeric outliers -----------------------------------
{
    const source = path.join(PROPS, 'colors.v2.json5');
    const target = path.join(PROPS, 'colors.json5');
    const data = toDollarKeys(read(source));

    for (const theme of ['light', 'dark']) {
        for (const group of ['background', 'foreground', 'icon', 'line', 'states', 'shadow']) {
            setType(data, `${theme}.${group}`, 'color');
        }
        setType(data, `${theme}.opacity`, 'number');

        // Lives inside the (colour) states group, so it needs its own type.
        data[theme].states['disabled-opacity'].$type = 'number';

        for (const token of [
            data[theme].states['disabled-opacity'],
            data[theme].opacity.disabled,
            data[theme].opacity.overlay
        ]) {
            token.$value = Number(token.$value);
        }
    }

    write(target, data);
    fs.rmSync(source);
}

// ---- typography composites -------------------------------------------------------------
for (const [file, rootKey] of [
    ['typography.json5', 'typography'],
    ['md-typography.json5', 'md-typography']
]) {
    const target = path.join(PROPS, file);
    const data = read(target);

    data[rootKey] = Object.fromEntries(
        Object.entries(data[rootKey]).map(([name, preset]) => [name, toTypographyComposite(preset)])
    );

    write(target, data);
}

// ---- shadow composites -----------------------------------------------------------------
{
    const source = path.join(PROPS, 'shadows.v2.json5');
    const target = path.join(PROPS, 'shadows.json5');
    const data = read(source);

    for (const theme of ['light', 'dark']) {
        data.shadow[theme] = Object.fromEntries(
            Object.entries(data.shadow[theme]).map(([name, token]) => {
                const composite = toShadowComposite(token.value);

                if (token.description) composite.$description = token.description;

                return [name, composite];
            })
        );
    }

    write(target, data);
    fs.rmSync(source);
}

// ---- components ------------------------------------------------------------------------
for (const [file, types] of [
    ['code-block.json5', { 'code-block.light.hljs': 'color', 'code-block.dark.hljs': 'color' }],
    [
        'scrollbars.json5',
        {
            'scrollbar.size': 'dimension',
            'scrollbar.light': 'color',
            'scrollbar.dark': 'color'
        }
    ],
    ['skeleton.json5', { skeleton: 'color' }]
]) {
    const target = path.join(COMPONENTS, file);
    const data = toDollarKeys(read(target));

    for (const [dotted, type] of Object.entries(types)) setType(data, dotted, type);
    write(target, data);
}

console.log('Done. Run `yarn prettier:fix` next.');
