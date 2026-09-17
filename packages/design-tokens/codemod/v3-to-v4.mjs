#!/usr/bin/env node
/**
 * Codemod: @koobiq/design-tokens v3 → v4.
 *
 * Rewrites what can be rewritten mechanically (import paths, tokens with a 1:1 replacement) and
 * reports what cannot. Nothing is written without --write.
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
import { fileURLToPath } from 'node:url';

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
    '--kbq-states-disabled-opacity': '--kbq-opacity-disabled'
};

/** Removed tokens whose replacement needs a second declaration, so a human has to place it. */
const SPLIT_TOKENS = {
    '--kbq-background-overlay-theme': 'use --kbq-background-overlay-base-theme together with --kbq-opacity-overlay',
    '--kbq-background-overlay-error': 'use --kbq-background-overlay-base-error together with --kbq-opacity-overlay'
};

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
 * The v3 semantic layer: `--kbq-theme-default`, `--kbq-contrast-palette-40` and friends.
 *
 * Every one carried a bare `deprecated: true` with no replacement named, so there is nothing to
 * map them onto — and the right v4 token depends on what the value is colouring. Reported with a
 * hint that says so rather than the generic component-token one, which would be misleading.
 */
const V1_SEMANTIC = /^--kbq-(theme|contrast|error|success|warning|purple|white|black)-(default|palette-)/;

/** Paths with nothing to move to. */
const DELETED_PATHS = [
    [`${PKG}/web/_palette`, 'the v3 palette is gone; use --kbq-plt-* or --kbq-semantic-*'],
    [`${PKG}/web/palette`, 'the v3 palette is gone; use --kbq-plt-* or --kbq-semantic-*'],
    [`${PKG}/web/new/_palette`, 'the v3 palette is gone; use --kbq-plt-* or --kbq-semantic-*'],
    [`${PKG}/web/new/palette.scss`, 'the v3 palette is gone; use --kbq-plt-* or --kbq-semantic-*'],
    [`${PKG}/web/css-tokens-font.css`, `use ${PKG}/web/css/font.css`],
    [`${PKG}/web/deprecated/`, 'removed entirely']
];

// ---------------------------------------------------------------------------------------------

const args = process.argv.slice(2);
const write = args.includes('--write');
const tokensFlag = args.indexOf('--tokens');
const tokensDir = tokensFlag === -1 ? undefined : args[tokensFlag + 1];
// `tokensFlag + 1` is only a value to skip when the flag is actually present.
const targets = args.filter((a, i) => !a.startsWith('--') && !(tokensFlag !== -1 && i === tokensFlag + 1));

if (targets.length === 0) {
    console.error('Usage: koobiq-tokens-codemod <file-or-dir>… [--write] [--tokens <dir>]');
    process.exit(1);
}

/** Every --kbq-* variable this version of the package defines. */
function knownTokens() {
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

function inspect(content, known, defined) {
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

    // Longest path first, so rewriting `.../web/new/light/shadows.css` cannot be pre-empted by a
    // shorter match that happens to be a prefix of it.
    const ordered = [...fixes.values()].sort((a, b) => b.from.length - a.from.length);

    let next = content;

    for (const { from, to, kind } of ordered) {
        next = kind === 'token' ? next.replace(tokenPattern(from), to) : next.replaceAll(from, to);
    }

    // 3. Things a human has to decide.
    for (const [token, hint] of Object.entries(SPLIT_TOKENS)) {
        if (tokenPattern(token).test(content)) manual.set(token, { what: token, hint });
    }

    for (const [path, hint] of DELETED_PATHS) {
        if (content.includes(path)) manual.set(path, { what: path, hint });
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
    //    Catches the old palette, the 47 removed component token sets, and anything else this
    //    codemod has no specific rule for.
    if (known) {
        for (const [, name] of content.matchAll(/(--kbq-[\w-]+)/g)) {
            if (known.has(name) || defined.has(name) || manual.has(name)) continue;
            if (name in RENAMED_TOKENS || name in SPLIT_TOKENS) continue;
            // A name ending in `-` is the static half of a template literal, e.g.
            // `--kbq-semantic-${family}-${step}`. There is no such variable to look up.
            if (name.endsWith('-')) continue;

            const hint = name.startsWith('--kbq-palette-')
                ? 'the v3 palette is gone — use --kbq-plt-* or --kbq-semantic-*; note the scale changed from 0–100 to 1–20'
                : V1_SEMANTIC.test(name)
                  ? 'the v3 semantic layer, deprecated without naming a replacement — pick the v4 role for whatever it colours, e.g. --kbq-background-theme for a fill or --kbq-states-line-focus-theme for a focus ring'
                  : 'not defined by v4 — if this is a component token, use the global token it was aliasing';

            manual.set(name, { what: name, hint });
        }
    }

    return { next, fixes: ordered, manual: [...manual.values()] };
}

// ---------------------------------------------------------------------------------------------

const { names: known, dir: knownDir } = knownTokens();

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
    const { next, fixes, manual } = inspect(content, known, defined);

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
