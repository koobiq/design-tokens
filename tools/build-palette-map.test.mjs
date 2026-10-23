import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import JSON5 from 'json5';
import { hslToRgb, srgbToLab, oklchToLab, deltaE2000, build } from './build-palette-map.mjs';

const close = (actual, expected, tol = 1e-3) =>
    assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} ± ${tol}, got ${actual}`);

test('hslToRgb converts the primaries', () => {
    const red = hslToRgb(0, 100, 50);
    const green = hslToRgb(120, 100, 50);
    const blue = hslToRgb(240, 100, 50);

    close(red.r, 1);
    close(red.g, 0);
    close(red.b, 0);

    close(green.g, 1);
    close(blue.b, 1);
});

test('srgbToLab matches the sRGB reference values', () => {
    const red = srgbToLab(1, 0, 0);
    const green = srgbToLab(0, 1, 0);
    const blue = srgbToLab(0, 0, 1);
    const white = srgbToLab(1, 1, 1);
    const black = srgbToLab(0, 0, 0);

    close(red.L, 53.2408);
    close(red.a, 80.0925);
    close(red.b, 67.2032);

    close(green.L, 87.7347);
    close(green.a, -86.1827);
    close(green.b, 83.1793);

    close(blue.L, 32.297);
    close(blue.a, 79.1875);
    close(blue.b, -107.8602);

    close(white.L, 100);
    close(white.a, 0);
    close(white.b, 0);

    close(black.L, 0);
    close(black.a, 0);
    close(black.b, 0);
});

test('oklchToLab round-trips through the reference primaries', () => {
    // oklch(62.8% 0.2577 29.23) ≈ sRGB red; sanity-check it lands near the red reference.
    const red = oklchToLab(62.8, 0.2577, 29.23);

    close(red.L, 53.24, 0.6);
    close(red.a, 80.09, 0.6);
    close(red.b, 67.2, 0.6);
});

test('deltaE2000 matches the Sharma 2005 reference pairs', () => {
    // From "The CIEDE2000 color-difference formula: Implementation notes...", Table 1.
    close(deltaE2000({ L: 50, a: 2.6772, b: -79.7751 }, { L: 50, a: 0, b: -82.7485 }), 2.0425);
    close(deltaE2000({ L: 50, a: -1.3802, b: -84.2814 }, { L: 50, a: 0, b: -82.7485 }), 1.0);
    close(deltaE2000({ L: 50, a: 0, b: 0 }, { L: 50, a: -1, b: 2 }), 2.3669);
});

test('the committed palette-map.json matches the generator output', () => {
    const pltPath = new URL('../packages/design-tokens/web/properties/plt.json5', import.meta.url);
    const mapPath = new URL('../packages/design-tokens/codemod/palette-map.json', import.meta.url);

    const plt = JSON5.parse(readFileSync(pltPath, 'utf8')).plt;
    const committed = JSON.parse(readFileSync(mapPath, 'utf8'));

    assert.deepEqual(build(plt), committed);
});
