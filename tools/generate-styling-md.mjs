#!/usr/bin/env node
'use strict';

import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import JSON5 from 'json5';

import { markPrivate } from '../packages/tokens-builder/preprocessors/private.js';

const TOKEN_PREFIX = 'kbq';

const ROOT = process.cwd();

const PROPS = path.join(ROOT, 'packages/design-tokens/web/properties');

// Read with the build's marking, so a token made private in a group is private here too. Private
// tokens are internal and have no variable, so they have no row (see preprocessors/private.js).
function readTokens(file) {
    return markPrivate(JSON5.parse(fs.readFileSync(path.join(PROPS, file), 'utf8'))).marked;
}

const colors = readTokens('colors.json5');
const globals = readTokens('globals.json5');
const shadows = readTokens('shadows.json5');
const typography = readTokens('typography.json5');
const plt = readTokens('plt.json5');

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
        .filter(([key, v]) => !key.startsWith('$') && v?.$value !== undefined && !v.$deprecated && !v.private)
        .map(([key, v]) => row(`\`--${TOKEN_PREFIX}-${category}-${key}\``, v.$description || ''))
        .join('\n');
}

function stateRows(states) {
    const rows = [];
    for (const element of ['background', 'foreground', 'icon']) {
        for (const [key, v] of Object.entries(states[element])) {
            if (key.startsWith('$') || v?.$value === undefined || v.$deprecated || v.private) continue;
            rows.push(row(`\`--${TOKEN_PREFIX}-states-${element}-${key}\``, v.$description || ''));
        }
    }
    rows.push(row('**Line states**', ''));
    for (const [key, v] of Object.entries(states.line)) {
        if (key.startsWith('$') || v?.$value === undefined || v.$deprecated || v.private) continue;
        rows.push(row(`\`--${TOKEN_PREFIX}-states-line-${key}\``, v.$description || ''));
    }
    return rows.join('\n');
}

function typographyRows(typo) {
    return Object.entries(typo.typography)
        .filter(([name, preset]) => !name.startsWith('$') && !preset?.private)
        .map(([name, preset]) =>
            row(
                `\`${TOKEN_PREFIX}-${name}\``,
                preset.$value?.fontSize ?? '',
                preset.$value?.lineHeight ?? '',
                preset.$value?.fontWeight ?? ''
            )
        )
        .join('\n');
}

function sizeRows(sizes) {
    return Object.entries(sizes)
        .filter(([name, t]) => !name.startsWith('$') && !t?.private)
        .map(([name, t]) => row(`\`--${TOKEN_PREFIX}-size-${name}\``, t.$value, t.$description || ''))
        .join('\n');
}

// The tokens of a shadow theme that ship, by their CSS name: the color roles (from colors.json5) and the
// composites, which sit under overflow.<kind>. The base parameters of the directional shadows are in `base` groups and ship nothing.
function shadowTokens(node, path = []) {
    return Object.entries(node).flatMap(([name, t]) => {
        if (name.startsWith('$') || t === null || typeof t !== 'object' || t.private) return [];
        if (t.$value !== undefined) return [[[...path, name].join('-'), t]];

        return shadowTokens(t, [...path, name]);
    });
}

function shadowRows(theme) {
    return shadowTokens(theme)
        .map(([name, t]) => row(`\`--${TOKEN_PREFIX}-shadow-${name}\``, t.$description || ''))
        .join('\n');
}

function pltFamilyRows(families, semMap) {
    return Object.entries(families)
        .filter(([family]) => !family.startsWith('$'))
        .map(([family, scales]) => {
            const numericKeys = Object.keys(scales).filter((k) => !isNaN(Number(k)));
            // `white` / `black` are single tokens rather than a ramp, so they have no scale.
            const scaleRange = numericKeys.length
                ? `${numericKeys[0]}–${numericKeys[numericKeys.length - 1]}`
                : 'single';
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
