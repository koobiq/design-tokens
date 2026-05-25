#!/usr/bin/env node
'use strict';

import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import JSON5 from 'json5';

const TOKEN_PREFIX = 'kbq';

const ROOT = process.cwd();

const PROPS = path.join(ROOT, 'packages/design-tokens/web/properties');

function readJSON5(file) {
    return JSON5.parse(fs.readFileSync(path.join(PROPS, file), 'utf8'));
}

const colors = readJSON5('colors.v2.json5');
const globals = readJSON5('globals.json5');
const shadows = readJSON5('shadows.v2.json5');
const typography = readJSON5('typography.json5');
const plt = readJSON5('plt.json5');

const semanticMap = {
    blue: 'Theme (brand)',
    blueA: 'Theme (brand)',
    slate: 'Contrast (neutral)',
    slateA: 'Contrast (neutral)',
    red: 'Error',
    redA: 'Error',
    green: 'Success',
    greenA: 'Success',
    yellow: 'Warning (adaptive)',
    yellowA: 'Warning (adaptive)',
    yellowFixed: 'Warning (fixed hue)',
    yellowFixedA: 'Warning (fixed hue)',
    purple: 'Visited',
    purpleA: 'Visited',
    teal: 'Accent',
    tealA: 'Accent',
    orange: 'Accent',
    orangeA: 'Accent',
    grey: 'Neutral accent',
    greyA: 'Neutral accent',
    white: 'White (always bright)',
    whiteA: 'White (always bright)',
    black: 'Night (always dark)',
    blackA: 'Night (always dark)'
};

function row(...cells) {
    return `| ${cells.join(' | ')} |`;
}

function tokenRows(category, entries) {
    return Object.entries(entries)
        .filter(([, v]) => v?.value && !v.deprecated)
        .map(([key, v]) => row(`\`--${TOKEN_PREFIX}-${category}-${key}\``, v.description || ''))
        .join('\n');
}

function stateRows(states) {
    const rows = [];
    for (const element of ['background', 'foreground', 'icon']) {
        for (const [key, v] of Object.entries(states[element])) {
            if (!v?.value || v.deprecated) continue;
            rows.push(row(`\`--${TOKEN_PREFIX}-states-${element}-${key}\``, v.description || ''));
        }
    }
    rows.push(row('**Line states**', ''));
    for (const [key, v] of Object.entries(states.line)) {
        if (!v?.value || v.deprecated) continue;
        rows.push(row(`\`--${TOKEN_PREFIX}-states-line-${key}\``, v.description || ''));
    }
    return rows.join('\n');
}

function typographyRows(typo) {
    return Object.entries(typo.typography)
        .map(([name, p]) =>
            row(
                `\`${TOKEN_PREFIX}-${name}\``,
                p['font-size']?.value ?? '',
                p['line-height']?.value ?? '',
                p['font-weight']?.value ?? ''
            )
        )
        .join('\n');
}

function sizeRows(sizes) {
    return Object.entries(sizes)
        .map(([name, t]) => row(`\`--${TOKEN_PREFIX}-size-${name}\``, t.value, t.description || ''))
        .join('\n');
}

function shadowRows(baseShadows, extendedShadows) {
    const entries = [...Object.entries(baseShadows), ...Object.entries(extendedShadows)];
    return entries.map(([name, t]) => row(`\`--${TOKEN_PREFIX}-shadow-${name}\``, t.description || '')).join('\n');
}

function pltFamilyRows(families, semMap) {
    return Object.entries(families)
        .map(([family, scales]) => {
            const numericKeys = Object.keys(scales).filter((k) => !isNaN(Number(k)));
            const scaleRange = numericKeys.length
                ? `${numericKeys[0]}–${numericKeys[numericKeys.length - 1]}`
                : Object.keys(scales).join(', ');
            const role = family.startsWith('dark')
                ? `Dark-theme counterpart of \`${family.replace(/^dark/, '').replace(/^./, (c) => c.toLowerCase())}\``
                : semMap[family] || '—';
            return row(`\`${family}\``, scaleRange, role);
        })
        .join('\n');
}

const output = ejs.render(fs.readFileSync(path.join(ROOT, 'tools', 'styling.md.ejs'), 'utf8'), {
    light: colors.light,
    globals,
    shadows,
    typography,
    plt,
    semanticMap,
    tokenRows,
    stateRows,
    typographyRows,
    sizeRows,
    shadowRows,
    pltFamilyRows
});

fs.writeFileSync(path.join(ROOT, 'STYLING.md'), output);
console.log('Generated STYLING.md');
