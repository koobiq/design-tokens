#!/usr/bin/env node
/**
 * Codemod: @koobiq/design-tokens v3 → v4.
 *
 * Rewrites what can be rewritten mechanically (import paths, tokens with a 1:1 replacement, the
 * overlay tokens that compose back to `color-mix()`), suggests the nearest v4 colour for the old
 * palette (applied only with `--fix-palette`, and only when close enough), and reports the rest.
 * Nothing is written without --write.
 *
 *   npx koobiq-tokens-codemod src            # dry run, prints a report
 *   npx koobiq-tokens-codemod src --write    # apply the fixable changes
 *
 * The list of tokens v4 actually ships is read from the installed package rather than hardcoded,
 * so "this variable no longer exists" stays true for whichever v4 you are on. Point --tokens at a
 * different build if you need to.
 *
 * Zero dependencies: this has to run inside a consumer's project without installing anything.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const EXTENSIONS = new Set([
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.styl',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.vue',
    '.svelte',
    '.html'
]);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', '.angular', 'out']);

const PKG = '@koobiq/design-tokens';

/** SCSS partials keep living at the root of web/; everything else sliced moved under web/css/. */
const SCSS_ENTRIES = ['variables', 'typography', 'md-typography'];

/**
 * Tokens removed in v4 that have a drop-in replacement.
 *
 * Every one of these is taken from the replacement the v3 source itself named in its
 * `deprecated` notice — nothing here is a guess. The v3 semantic layer (`--kbq-success-default`
 * and friends) is in the same boat: four of the eight said what to use instead, so those four
 * are rewritten and the rest are only reported.
 */
const RENAMED_TOKENS = {
    '--kbq-success-default': '--kbq-background-success',
    '--kbq-warning-default': '--kbq-background-warning',
    '--kbq-error-default': '--kbq-background-error',
    '--kbq-contrast-default': '--kbq-background-contrast',
    // v3 said nothing about this one; --kbq-plt-white is the team's call, and reaching into
    // the engineering palette is the documented exception for a fixed-brightness colour.
    '--kbq-white-default': '--kbq-plt-white',
    '--kbq-black-default': '--kbq-plt-black',
    '--kbq-foreground-error-less': '--kbq-foreground-error-tertiary',
    '--kbq-foreground-success-less': '--kbq-foreground-success-tertiary',
    '--kbq-states-background-error-less': '--kbq-background-error-tertiary',
    '--kbq-states-disabled-opacity': '--kbq-opacity-disabled',
    // Not a redesign: v3 built this name by cutting `light-` out of the string, which also found
    // it inside `highlight-current`. The source token was always `highlight-current`, and the SCSS
    // variable always spelled it in full.
    '--kbq-states-background-highcurrent': '--kbq-states-background-highlight-current'
};

/**
 * Overlay tokens removed in v4 that one `var()` rewrites to a `color-mix()` composition. The v4
 * base is an opaque colour and `--kbq-opacity-overlay` is a unitless 0–1 fraction, so the mix
 * needs the `calc()` to turn it into the percentage `color-mix()` accepts. `in srgb` is the
 * colour space @koobiq/components already uses for this composition.
 */
const COLOR_MIX_TOKENS = {
    '--kbq-background-overlay-theme': '--kbq-background-overlay-base-theme',
    '--kbq-background-overlay-error': '--kbq-background-overlay-base-error'
};

const OVERLAY_OPACITY = '--kbq-opacity-overlay';

const colorMix = (base) => `color-mix(in srgb, var(${base}) calc(var(${OVERLAY_OPACITY}) * 100%), transparent)`;

/**
 * The only shape the overlay rewrite handles: `var(--kbq-background-overlay-…)` with no fallback.
 * The closing `)` is part of the match, so near-miss names (`…-theme-extra`, `…-base-theme`) never
 * match and running the codemod twice cannot double-wrap the result.
 */
const overlayVar = /var\(--kbq-background-overlay-(theme|error)\)/g;

/**
 * The shapes a human has to decide about: a `var()` that carries an explicit fallback, or a bare
 * token outside `var()`. Comments are matched first and skipped, so a mention that only lives in
 * prose is not reported; quoted strings are deliberately still scanned, because a CSS-in-JS
 * template literal is code the codemod is meant to migrate.
 */
const overlayAmbiguous =
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|var\((--kbq-background-overlay-(?:theme|error))\s*,|(?<!var\()(--kbq-background-overlay-(?:theme|error))(?![\w-])/g;

/**
 * Old palette → new engineering palette. Every opaque `--kbq-palette-<family>-<step>` (an HSL ramp
 * over 0–100) maps to the nearest opaque `--kbq-plt-<family>-<step>` (an OKLch ramp over 1–20),
 * precomputed by `tools/build-palette-map.mjs` and loaded from `palette-map.json`. `deltaE` is the
 * CIEDE2000 distance between the two.
 *
 * The mapping is a "closest colour", not a "same colour", so it is only applied behind
 * `--fix-palette`, and only when `deltaE <= PALETTE_DELTA_E_MAX`. Everything above the threshold —
 * and every alpha step, which has no systematic replacement — stays report-only.
 *
 * PALETTE_DELTA_E_MAX is the one knob to tune: 1 is a just-noticeable difference, 2–3 is clearly
 * visible, and higher values trade colour fidelity for more automatic fixes.
 */
const PALETTE_DELTA_E_MAX = 3;
const PALETTE_MAP = loadPaletteMap();
const paletteToken = /--kbq-palette-[\w-]+/g;

function loadPaletteMap() {
    try {
        return JSON.parse(readFileSync(join(HERE, 'palette-map.json'), 'utf8'));
    } catch {
        console.warn('! Could not read palette-map.json — palette suggestions are skipped.');

        return {};
    }
}

/**
 * Paths that exist in both versions but no longer mean the same thing: in v3 they were the legacy
 * HSL track, in v4 they hold the OKLch one. The import is spelled correctly either way — it is the
 * values behind it that changed — so these are reported, never rewritten.
 *
 * They also fire on a project that has already been migrated, where the path is simply right. That
 * is the cost of the path being ambiguous; the message says what to check.
 */
const REPOINTED_HINT =
    'path is valid in v4, but if you came from the legacy HSL track the values behind it are now OKLch — re-check anything that depended on the old colours';

const REPOINTED = [
    `${PKG}/web/css/`,
    `${PKG}/web/css-tokens.css`,
    `${PKG}/web/css-tokens-light.css`,
    `${PKG}/web/css-tokens-dark.css`,
    `${PKG}/web/variables`,
    `${PKG}/web/_variables`
].map((path) => [path, REPOINTED_HINT]);

/**
 * `_palette.scss` is back in v4 (see README), but unlike REPOINTED its Sass API is not just
 * "same name, new colour" — the old 0–100 theme/hue maps are gone outright, replaced by
 * `$plt-<family>` maps on a 1–20 scale. That is worth flagging on its own, not only when the file
 * also shows another legacy sign, so it is checked unconditionally rather than gated behind
 * `looksLegacy` the way REPOINTED is — and kept out of DELETED_PATHS, since the path itself is
 * valid again and `looksLegacy` reads straight off that list.
 */
const PALETTE_HINT =
    'path is valid in v4, but the Sass API changed completely: the old 0–100 theme/hue maps ($light-theme-palette, $light-black-palette, …) are gone — use the new $plt-<family> maps instead (1–20 scale, e.g. $plt-blue)';

const PALETTE_PATHS = [`${PKG}/web/_palette`, `${PKG}/web/palette`];

/**
 * The v3 semantic layer: `--kbq-theme-default`, `--kbq-contrast-palette-40` and friends.
 *
 * Every one carried a bare `deprecated: true` with no replacement named, so there is nothing to
 * map them onto — and the right v4 token depends on what the value is colouring. Reported with a
 * hint that says so rather than the generic component-token one, which would be misleading.
 */
const V1_SEMANTIC = /^--kbq-(theme|contrast|error|success|warning|purple|white|black)-(default|palette-)/;

/** Paths with nothing to move to. */
const DELETED_PATHS = [
    // `web/_palette` and `web/palette` (no `/new/`) are not here: v4 rebuilt that file for the
    // OKLch palette, so the path itself is valid again — see PALETTE_PATHS instead.
    [`${PKG}/web/new/_palette`, 'the v3 palette is gone; use --kbq-plt-* or --kbq-semantic-*'],
    [`${PKG}/web/new/palette.scss`, 'the v3 palette is gone; use --kbq-plt-* or --kbq-semantic-*'],
    [`${PKG}/web/css-tokens-font.css`, `use ${PKG}/web/css/font.css`],
    [`${PKG}/web/deprecated/`, 'removed entirely']
];

// ---------------------------------------------------------------------------------------------

/** Every --kbq-* variable this version of the package defines. */
function knownTokens(tokensDir) {
    const candidates = tokensDir
        ? [tokensDir]
        : [
              join(HERE, '../web'),
              join(HERE, '../../../dist/design-tokens/web'),
              join(HERE, '../../../../dist/design-tokens/web')
          ];

    for (const dir of candidates) {
        if (!existsSync(join(dir, 'css-tokens.css'))) continue;

        const names = new Set();

        for (const file of walk(dir, new Set(['.css']))) {
            for (const [, name] of readFileSync(file, 'utf8').matchAll(/^\s*(--kbq-[\w-]+)\s*:/gm)) {
                names.add(name);
            }
        }

        if (names.size > 0) return { names, dir };
    }

    return { names: null, dir: null };
}

function* walk(dir, extensions) {
    for (const entry of readdirSync(dir)) {
        if (SKIP_DIRS.has(entry)) continue;

        const full = join(dir, entry);

        if (statSync(full).isDirectory()) {
            yield* walk(full, extensions);
        } else if (extensions.has(extname(entry))) {
            yield full;
        }
    }
}

function* files(target) {
    if (statSync(target).isDirectory()) {
        yield* walk(target, EXTENSIONS);
    } else {
        yield target;
    }
}

/** v3 path → v4 path, or null when it did not move. */
function movedPath(path) {
    const rest = path.slice(`${PKG}/web/new/`.length);

    if (rest.startsWith('css-tokens')) return `${PKG}/web/${rest}`;
    if (rest.startsWith('js/')) return `${PKG}/web/${rest}`;

    const partial = rest.replace(/^_/, '').replace(/\.scss$/, '');

    if (SCSS_ENTRIES.includes(partial)) return `${PKG}/web/${partial}`;

    return `${PKG}/web/css/${rest}`;
}

/** A --kbq-* name, not followed by more name characters. */
const tokenPattern = (name) => new RegExp(`${name}(?![\\w-])`, 'g');

function inspect(content, known, defined, { fixPalette = false, paletteDeltaE = PALETTE_DELTA_E_MAX } = {}) {
    const fixes = new Map();
    const manual = new Map();

    // 1. Import paths that moved.
    for (const [path] of content.matchAll(new RegExp(`${PKG}/web/new/[\\w./-]*`, 'g'))) {
        const to = movedPath(path);

        if (to && to !== path) fixes.set(path, { from: path, to, kind: 'path' });
    }

    // 2. Tokens with a drop-in replacement.
    for (const [from, to] of Object.entries(RENAMED_TOKENS)) {
        if (tokenPattern(from).test(content)) fixes.set(from, { from, to, kind: 'token' });
    }

    // 2b. Overlay tokens that compose back to color-mix().
    for (const [full, variant] of content.matchAll(overlayVar)) {
        const token = `--kbq-background-overlay-${variant}`;

        fixes.set(full, { from: full, to: colorMix(COLOR_MIX_TOKENS[token]), kind: 'overlay' });
    }

    // 2c. Old palette → nearest v4 colour. Opaque steps have a precomputed suggestion; alpha steps
    //     (and anything the map does not cover) have none and stay report-only.
    for (const [name] of content.matchAll(paletteToken)) {
        // The static half of a template literal (`--kbq-palette-${family}-${step}`) has no token.
        if (name.endsWith('-')) continue;

        const suggestion = PALETTE_MAP[name];

        if (!suggestion) {
            manual.set(name, {
                what: name,
                hint: 'the v3 palette is gone — use --kbq-plt-* or --kbq-semantic-*; alpha steps have no mechanical replacement'
            });
            continue;
        }

        if (fixPalette && suggestion.deltaE <= paletteDeltaE) {
            fixes.set(name, { from: name, to: suggestion.to, kind: 'token' });
        } else {
            const above = fixPalette ? ` — above the ${paletteDeltaE} auto-fix threshold` : '';

            manual.set(name, {
                what: name,
                hint: `the v3 palette is gone — nearest v4 colour is ${suggestion.to} (ΔE ${suggestion.deltaE}${above})`
            });
        }
    }

    // Longest path first, so rewriting `.../web/new/light/shadows.css` cannot be pre-empted by a
    // shorter match that happens to be a prefix of it.
    const ordered = [...fixes.values()].sort((a, b) => b.from.length - a.from.length);

    let next = content;

    for (const { from, to, kind } of ordered) {
        next = kind === 'token' ? next.replace(tokenPattern(from), to) : next.replaceAll(from, to);
    }

    // 3. Things a human has to decide.
    for (const match of content.matchAll(overlayAmbiguous)) {
        if (!match[1] && !match[2]) continue; // a comment — leave prose alone

        const token = match[1] ?? match[2];
        const fallback = Boolean(match[1]);
        const what = fallback ? `var(${token}, …)` : token;

        manual.set(what, {
            what,
            hint: fallback
                ? `removed in v4 — rewrite to ${colorMix(COLOR_MIX_TOKENS[token])} and fold the explicit fallback into the mix yourself`
                : `removed in v4 — rewrite to ${colorMix(COLOR_MIX_TOKENS[token])}`
        });
    }

    for (const [path, hint] of DELETED_PATHS) {
        if (content.includes(path)) manual.set(path, { what: path, hint });
    }

    for (const path of PALETTE_PATHS) {
        if (content.includes(path)) manual.set(path, { what: path, hint: PALETTE_HINT });
    }

    // The repointed paths are spelled the same in v3 and v4, so warning on every one of them
    // would also shout at a project that is already migrated and correct. Only raise them where
    // the file still shows signs of the legacy track — a v3 palette variable, or an import of
    // something v4 deleted. Those are the files whose colours actually changed underneath.
    const looksLegacy = content.includes('--kbq-palette-') || DELETED_PATHS.some(([p]) => content.includes(p));

    if (looksLegacy) {
        for (const [path, hint] of REPOINTED) {
            if (content.includes(path)) manual.set(path, { what: path, hint });
        }
    }

    // 4. Any --kbq-* that nothing defines: not the installed v4, and not the project itself.
    //    Catches the 47 removed component token sets and anything else this codemod has no
    //    specific rule for.
    if (known) {
        for (const [, name] of content.matchAll(/(--kbq-[\w-]+)/g)) {
            if (known.has(name) || defined.has(name) || manual.has(name)) continue;
            if (name in RENAMED_TOKENS || name in COLOR_MIX_TOKENS) continue;
            if (name.startsWith('--kbq-palette-')) continue; // handled by the palette pass
            // A name ending in `-` is the static half of a template literal, e.g.
            // `--kbq-semantic-${family}-${step}`. There is no such variable to look up.
            if (name.endsWith('-')) continue;

            const hint = V1_SEMANTIC.test(name)
                ? 'the v3 semantic layer, deprecated without naming a replacement — pick the v4 role for whatever it colours, e.g. --kbq-background-theme for a fill or --kbq-states-line-focus-theme for a focus ring'
                : 'not defined by v4 — if this is a component token, use the global token it was aliasing';

            manual.set(name, { what: name, hint });
        }
    }

    return { next, fixes: ordered, manual: [...manual.values()] };
}

// ---------------------------------------------------------------------------------------------
// CLI. Runs only when this file is executed directly, so importing it (the tests) has no side
// effects.

function main() {
    const args = process.argv.slice(2);
    const write = args.includes('--write');
    const fixPalette = args.includes('--fix-palette');
    const tokensFlag = args.indexOf('--tokens');
    const tokensDir = tokensFlag === -1 ? undefined : args[tokensFlag + 1];
    // `tokensFlag + 1` is only a value to skip when the flag is actually present.
    const targets = args.filter((a, i) => !a.startsWith('--') && !(tokensFlag !== -1 && i === tokensFlag + 1));

    if (targets.length === 0) {
        console.error('Usage: koobiq-tokens-codemod <file-or-dir>… [--write] [--fix-palette] [--tokens <dir>]');
        process.exit(1);
    }

    const { names: known, dir: knownDir } = knownTokens(tokensDir);

    if (!known) {
        console.warn('! Could not find the installed token CSS, so removed variables will not be reported.');
        console.warn('  Pass --tokens <path-to-@koobiq/design-tokens/web>.\n');
    } else {
        console.log(`Checking against ${known.size} tokens from ${knownDir}\n`);
    }

    // First pass: every --kbq-* the project declares itself. A component library defines plenty of
    // its own custom properties, and those are not tokens this package ever shipped — without this
    // they would all be reported as "removed in v4", which in koobiq/angular-components was 96% of
    // the output.
    const sources = new Map();
    const defined = new Set();

    for (const target of targets) {
        for (const file of files(target)) {
            const content = readFileSync(file, 'utf8');

            if (!content.includes('--kbq-') && !content.includes(PKG)) continue;

            sources.set(file, content);

            // A declaration in a stylesheet…
            for (const [, name] of content.matchAll(/^\s*(--kbq-[\w-]+)\s*:/gm)) defined.add(name);
            // …or set from code. Deliberately narrow: a bare quoted name elsewhere may well be a
            // list of token names to migrate, which is exactly what should still be reported.
            for (const [, name] of content.matchAll(/setProperty\(\s*['"`](--kbq-[\w-]+)/g)) defined.add(name);
        }
    }

    let changedFiles = 0;
    let fixCount = 0;
    let manualCount = 0;

    for (const [file, content] of sources) {
        const { next, fixes, manual } = inspect(content, known, defined, { fixPalette });

        if (fixes.length === 0 && manual.length === 0) continue;

        console.log(relative(process.cwd(), file));

        for (const { from, to } of fixes) {
            console.log(`  ${write ? '✔' : '·'} ${from}  →  ${to}`);
        }

        for (const { what, hint } of manual) {
            console.log(`  ⚠ ${what}\n      ${hint}`);
        }

        console.log('');

        fixCount += fixes.length;
        manualCount += manual.length;

        if (fixes.length > 0) {
            changedFiles++;
            if (write) writeFileSync(file, next);
        }
    }

    console.log('─'.repeat(72));
    console.log(
        write
            ? `Applied ${fixCount} change(s) across ${changedFiles} file(s).`
            : `${fixCount} change(s) in ${changedFiles} file(s) can be applied — rerun with --write.`
    );

    if (manualCount > 0) {
        console.log(`${manualCount} item(s) need a decision; see README "Breaking changes in v4".`);
    }

    process.exit(0);
}

export { inspect };

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
