/**
 * Builds the v3 → v4 palette mapping: every opaque `--kbq-palette-<family>-<step>` (HSL, 0–100)
 * to its nearest opaque `--kbq-plt-<family>-<step>` (OKLch, 1–20), measured in CIEDE2000 (ΔE).
 *
 * The old palette was a pure HSL ramp — `hsla(<hue>, <sat>, <step>%, 100%)` with a constant hue
 * and saturation per family — so the old colour is derived from the variable name alone; the old
 * JSON does not need to be shipped. The new palette is read from `plt.json5` at build time.
 *
 * The result is committed as `packages/design-tokens/codemod/palette-map.json`, which the codemod
 * loads and looks up. Regenerate with:
 *
 *   node tools/build-palette-map.mjs
 *
 * Zero-runtime-dependency: only this build-time tool imports `json5`; the codemod itself does not.
 */
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSON5 from 'json5';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

// ---------------------------------------------------------------------------------------------
// Colour math: HSL → sRGB → XYZ → CIELAB, OKLch → CIELAB, and CIEDE2000.

/** h in degrees, s/l in 0–100. Returns sRGB components in 0–1. */
export function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let [r, g, b] = [0, 0, 0];

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return { r: r + m, g: g + m, b: b + m };
}

/** sRGB components in 0–1 → CIELAB (D65). */
export function srgbToLab(r, g, b) {
    const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));

    const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];

    // D65, X/Y/Z in 0–1.
    const x = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
    const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
    const z = 0.0193339 * R + 0.119192 * G + 0.9503041 * B;

    return xyzToLab(x * 100, y * 100, z * 100);
}

/** OKLch (L in 0–100, C in 0–0.4-ish, H in degrees) → CIELAB (D65). */
export function oklchToLab(L, C, H) {
    const rad = (H * Math.PI) / 180;
    const a = C * Math.cos(rad);
    const b = C * Math.sin(rad);

    // OKLab → LMS' (linear) → LMS → XYZ (D65), X/Y/Z in 0–1. Canonical OKLab matrices,
    // rounded to 12 significant digits — far more than ΔE needs.
    const l_ = L / 100 + 0.3963377922 * a + 0.2158037581 * b;
    const m_ = L / 100 - 0.1055613423 * a - 0.0638541748 * b;
    const s_ = L / 100 - 0.0894841821 * a - 1.2914855379 * b;

    const l3 = l_ ** 3;
    const m3 = m_ ** 3;
    const s3 = s_ ** 3;

    const x = 1.2270138511 * l3 - 0.5577999807 * m3 + 0.281256049 * s3;
    const y = -0.0405801784 * l3 + 1.1122568696 * m3 - 0.0716766787 * s3;
    const z = -0.0763812845 * l3 - 0.4214819784 * m3 + 1.5861632204 * s3;

    return xyzToLab(x * 100, y * 100, z * 100);
}

/** XYZ (0–100, D65) → CIELAB. */
function xyzToLab(x, y, z) {
    // D65 white point.
    const xn = 95.047;
    const yn = 100.0;
    const zn = 108.883;

    const d = 6 / 29;
    const f = (t) => (t > d ** 3 ? Math.cbrt(t) : t / (3 * d * d) + 4 / 29);

    const fx = f(x / xn);
    const fy = f(y / yn);
    const fz = f(z / zn);

    return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIEDE2000 colour difference. See Sharma, Wu & Dalal (2005). */
export function deltaE2000(lab1, lab2) {
    const { L: L1, a: a1, b: b1 } = lab1;
    const { L: L2, a: a2, b: b2 } = lab2;
    const rad = Math.PI / 180;

    const C1 = Math.hypot(a1, b1);
    const C2 = Math.hypot(a2, b2);
    const Cbar = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));

    const a1p = (1 + G) * a1;
    const a2p = (1 + G) * a2;

    const C1p = Math.hypot(a1p, b1);
    const C2p = Math.hypot(a2p, b2);

    const h1p = C1p === 0 ? 0 : (Math.atan2(b1, a1p) / rad + 360) % 360;
    const h2p = C2p === 0 ? 0 : (Math.atan2(b2, a2p) / rad + 360) % 360;

    const dLp = L2 - L1;
    const dCp = C2p - C1p;

    let dhp;

    if (C1p * C2p === 0) dhp = 0;
    else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
    else dhp = h2p - h1p + 360;

    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2);

    const Lbarp = (L1 + L2) / 2;
    const Cbarp = (C1p + C2p) / 2;

    let hbarp;

    if (C1p * C2p === 0) hbarp = h1p + h2p;
    else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
    else hbarp = (h1p + h2p - 360) / 2;

    const T =
        1 -
        0.17 * Math.cos((hbarp - 30) * rad) +
        0.24 * Math.cos(2 * hbarp * rad) +
        0.32 * Math.cos((3 * hbarp + 6) * rad) -
        0.2 * Math.cos((4 * hbarp - 63) * rad);

    const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
    const Rc = 2 * Math.sqrt(Cbarp ** 7 / (Cbarp ** 7 + 25 ** 7));

    const Sl = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2);
    const Sc = 1 + 0.045 * Cbarp;
    const Sh = 1 + 0.015 * Cbarp * T;
    const Rt = -Math.sin(2 * dTheta * rad) * Rc;

    const termL = dLp / Sl;
    const termC = dCp / Sc;
    const termH = dHp / Sh;

    return Math.sqrt(termL ** 2 + termC ** 2 + termH ** 2 + Rt * termC * termH);
}

// ---------------------------------------------------------------------------------------------
// The v3 palette, decoded from its variable naming: a constant-hue/saturation HSL ramp.

const OLD_FAMILIES = {
    blue: { hue: 216, sat: 100, to: 'blue' },
    cyan: { hue: 180, sat: 55, to: 'teal' },
    green: { hue: 104, sat: 64, to: 'green' },
    grey: { hue: 229, sat: 15, to: 'slate' },
    orange: { hue: 26, sat: 97, to: 'orange' },
    purple: { hue: 277, sat: 72, to: 'purple' },
    red: { hue: 7, sat: 97, to: 'red' },
    yellow: { hue: 38, sat: 100, to: 'yellow' }
};

// black/white had a single opaque `default` step, not a ramp.
const FIXED = {
    '--kbq-palette-black-default': '--kbq-plt-black',
    '--kbq-palette-white-default': '--kbq-plt-white'
};

// Opaque one-offs: orange/red also shipped a single step with a different saturation than their
// main ramp (`--kbq-palette-{orange,red}-51-s69` = hsla(<hue>, 69%, 51%)).
const SPECIAL_STEPS = [
    { family: 'orange', hue: 26, sat: 69, step: 51, to: 'orange' },
    { family: 'red', hue: 7, sat: 69, step: 51, to: 'red' }
];

/** Parse the opaque 1–20 ramp of a `plt` family into `[{ step, lab }]`. */
function rampOf(plt, family) {
    const group = plt[family];

    if (typeof group !== 'object' || group === null) return null;

    const ramp = [];

    for (const [step, token] of Object.entries(group)) {
        const m = /^oklch\(([\d.-]+)%\s+([\d.-]+)\s+([\d.-]+)\)$/.exec(token.$value);

        if (!m) continue;

        ramp.push({ step: Number(step), lab: oklchToLab(Number(m[1]), Number(m[2]), Number(m[3])) });
    }

    return ramp;
}

function build(plt) {
    const map = {};
    const blackLab = oklchToLab(0, 0, 0);
    const whiteLab = oklchToLab(100, 0, 0);

    for (const [family, { hue, sat, to }] of Object.entries(OLD_FAMILIES)) {
        const ramp = rampOf(plt, to).map(({ step, lab }) => ({ to: `--kbq-plt-${to}-${step}`, lab }));

        // The v3 ramp bottoms out at black and tops out at white for every family, while the v4
        // coloured ramps stop at a dark/light step — so the neutral ends are candidates too.
        ramp.push({ to: '--kbq-plt-black', lab: blackLab }, { to: '--kbq-plt-white', lab: whiteLab });

        for (let step = 0; step <= 100; step++) {
            const lab = srgbToLab(...Object.values(hslToRgb(hue, sat, step)));

            let best = null;

            for (const candidate of ramp) {
                const deltaE = deltaE2000(lab, candidate.lab);

                if (best === null || deltaE < best.deltaE) best = { to: candidate.to, deltaE };
            }

            map[`--kbq-palette-${family}-${step}`] = {
                to: best.to,
                deltaE: Math.round(best.deltaE * 100) / 100
            };
        }
    }

    // Opaque one-offs with a custom saturation (`-s<sat>`).
    for (const { family, hue, sat, step, to } of SPECIAL_STEPS) {
        const ramp = rampOf(plt, to).map(({ step: s, lab }) => ({ to: `--kbq-plt-${to}-${s}`, lab }));

        ramp.push({ to: '--kbq-plt-black', lab: blackLab }, { to: '--kbq-plt-white', lab: whiteLab });

        const lab = srgbToLab(...Object.values(hslToRgb(hue, sat, step)));

        let best = null;

        for (const candidate of ramp) {
            const deltaE = deltaE2000(lab, candidate.lab);

            if (best === null || deltaE < best.deltaE) best = { to: candidate.to, deltaE };
        }

        map[`--kbq-palette-${family}-${step}-s${sat}`] = {
            to: best.to,
            deltaE: Math.round(best.deltaE * 100) / 100
        };
    }

    for (const [from, to] of Object.entries(FIXED)) {
        map[from] = { to, deltaE: 0 };
    }

    return map;
}

function summarize(map) {
    const byFamily = {};

    for (const [from, { deltaE }] of Object.entries(map)) {
        const family = from.replace(/^--kbq-palette-([a-z]+).*$/, '$1');

        (byFamily[family] ??= []).push(deltaE);
    }

    const stats = (values) => ({
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length
    });

    return Object.fromEntries(Object.entries(byFamily).map(([family, values]) => [family, stats(values)]));
}

function main() {
    const pltPath = join(ROOT, 'packages/design-tokens/web/properties/plt.json5');
    const outPath = join(ROOT, 'packages/design-tokens/codemod/palette-map.json');

    const plt = JSON5.parse(readFileSync(pltPath, 'utf8')).plt;
    const map = build(plt);

    const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));

    writeFileSync(outPath, `${JSON.stringify(sorted, null, 4)}\n`);

    console.log(`Wrote ${Object.keys(map).length} mappings to ${outPath}\n`);

    for (const [family, s] of Object.entries(summarize(map))) {
        console.log(
            `  ${family.padEnd(8)} ${s.count} steps — ΔE min ${s.min.toFixed(2)}, mean ${s.mean.toFixed(2)}, max ${s.max.toFixed(2)}`
        );
    }
}

function isMainEntry() {
    if (process.argv[1] === undefined) return false;

    try {
        return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
    } catch {
        return false;
    }
}

export { build };

if (isMainEntry()) {
    main();
}
