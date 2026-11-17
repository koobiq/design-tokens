import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import JSON5 from 'json5';
import StyleDictionary from 'style-dictionary';
import '../packages/tokens-builder/build.js';
import getConfig from '../packages/tokens-builder/configs/index.js';

const checker = fileURLToPath(new URL('./check-references.mjs', import.meta.url));
const source = fileURLToPath(new URL('../packages/design-tokens/web', import.meta.url));
const privateMarker = { $extensions: { 'io.koobiq': { private: true } } };
const properties = (root) => path.join(root, 'packages/design-tokens/web/properties');
const bundle = (root) => path.join(root, 'dist/design-tokens/web/css/index.bundled.css');
const readShadows = (root) => JSON5.parse(fs.readFileSync(path.join(properties(root), 'shadows.json5'), 'utf8'));
const writeShadows = (root, tokens) =>
    fs.writeFileSync(path.join(properties(root), 'shadows.json5'), JSON.stringify(tokens));

const build = async (root) => {
    const web = path.join(root, 'packages/design-tokens/web');
    const config = getConfig({
        buildPath: [path.join(web, 'properties/**/*.json5'), path.join(web, 'components/**/*.json5')],
        outputPath: path.join(root, 'dist/design-tokens/web/')
    });

    config.log = { verbosity: 'silent', warnings: 'error' };
    const sd = new StyleDictionary(config);

    for (const platform of ['scss', 'js', 'css']) await sd.buildPlatform(platform);
};

const check = (root) => {
    const { status, stdout, stderr } = spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });

    return { status, output: stdout + stderr };
};

test('the complete reference checker accepts standard shadows and still detects broken contracts', async (t) => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'koobiq-reference-checks-'));

    t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));

    const baseline = path.join(temporary, 'baseline');

    fs.cpSync(source, path.join(baseline, 'packages/design-tokens/web'), { recursive: true });
    await build(baseline);
    await t.test('the unchanged token set passes the checker', () => {
        const result = check(baseline);

        assert.equal(result.status, 0, result.output);
    });

    const extended = path.join(temporary, 'extended');

    fs.cpSync(baseline, extended, { recursive: true });
    const tokens = readShadows(extended);

    tokens.internalParameters = { ...privateMarker, $type: 'dimension' };
    tokens.internalColors = { ...privateMarker, $type: 'color' };
    tokens.internalTypography = { ...privateMarker, $type: 'typography' };
    tokens.size = { shadowBlur: { $type: 'dimension', $value: '8px' } };
    for (let i = 0; i < 30; i++) {
        tokens.internalParameters[`p${i}`] = {
            $value: i === 29 ? '{size.shadowBlur}' : `{internalParameters.p${i + 1}}`
        };
        tokens.internalColors[`p${i}`] = { $value: i === 29 ? '#00000000' : `{internalColors.p${i + 1}}` };
        tokens.internalTypography[`p${i}`] = {
            $value: i === 29 ? { fontSize: '12px', fontFamily: 'Inter' } : `{internalTypography.p${i + 1}}`
        };
    }

    for (const theme of ['light', 'dark']) {
        const shadows = tokens.shadow[theme];

        shadows.$type = 'shadow';
        shadows['card-hover'] = {
            $value: {
                inset: true,
                offsetX: { value: 0, unit: 'px' },
                offsetY: { value: 2, unit: 'px' },
                blur: { value: 0.25, unit: 'rem' },
                spread: '0px',
                color: `{${theme}.shadow.outline}`
            }
        };
        shadows['layer-alias'] = { $value: [`{shadow.${theme}.popup}`, `{shadow.${theme}.card-hover}`] };
        shadows.overflow.normal.base.key.blur.$value = '{internalParameters.p0}';
        shadows.overflow.normal.base.ambient.color.$value = '{internalColors.p0}';
        for (const side of ['top', 'right', 'bottom', 'left']) shadows.overflow.compact[side].$value[0].inset = true;

        // Directional geometry checks also need to accept native dimension objects.
        for (const kind of ['compact', 'normal']) {
            for (const layer of ['outline', 'key', 'ambient']) {
                const cross = shadows.overflow[kind].base[layer].cross;

                cross.$value = { value: 0, unit: 'px' };
            }
        }
    }

    writeShadows(extended, tokens);
    await build(extended);
    await t.test('new names, inherited shadow types, inset, rem, layer aliases and long private chains pass', () => {
        const css = fs.readFileSync(bundle(extended), 'utf8');

        assert.match(css, /--kbq-shadow-card-hover: inset 0px 2px 0.25rem 0px var\(--kbq-shadow-outline\);/);
        assert.match(css, /--kbq-shadow-layer-alias: var\(--kbq-shadow-popup\), var\(--kbq-shadow-card-hover\);/);
        assert.match(css, /--kbq-shadow-overflow-normal-top: 0px -9px var\(--kbq-size-shadow-blur\) -12px/);
        assert.match(css, /--kbq-shadow-overflow-compact-top: inset 0px -1px 0px 0px/);
        assert.doesNotMatch(css, /--kbq-internal-parameters-/);

        const result = check(extended);

        assert.equal(result.status, 0, result.output);
    });

    const reject = async (name, mutate, expected) => {
        await t.test(name, () => {
            const root = path.join(temporary, name.replaceAll(' ', '-'));

            fs.cpSync(extended, root, { recursive: true });
            mutate(root);
            const result = check(root);

            assert.equal(result.status, 1, result.output);
            assert.match(result.output, expected);
        });
    };

    await reject(
        'unknown shadow declarations are rejected',
        (root) => fs.appendFileSync(bundle(root), '\n.kbq-light {\n  --kbq-shadow-unknown: 0 1px 2px #123456;\n}\n'),
        /\[shadow parameters\].*--kbq-shadow-unknown/
    );
    await reject(
        'missing newly added public shadows are detected',
        (root) => {
            const css = fs.readFileSync(bundle(root), 'utf8').replace(/^\s*--kbq-shadow-card-hover:.*\n/m, '');

            fs.writeFileSync(bundle(root), css);
        },
        /\[shadow type\].*--kbq-shadow-card-hover.*missing/
    );
    await reject(
        'unserialized dimension objects are detected',
        (root) => {
            const css = fs
                .readFileSync(bundle(root), 'utf8')
                .replace('inset 0px 2px 0.25rem', 'inset [object Object] 2px 0.25rem');

            fs.writeFileSync(bundle(root), css);
        },
        /\[shadow layers\].*unserialized shadow value/
    );
    await reject(
        'incorrect directional geometry is still rejected',
        (root) => {
            const css = fs
                .readFileSync(bundle(root), 'utf8')
                .replace('inset 0px -1px 0px 0px', 'inset 0px -2px 0px 0px');

            fs.writeFileSync(bundle(root), css);
        },
        /\[shadow sides\].*expected it to start/
    );
    await reject(
        'private output variables are still rejected',
        (root) => fs.appendFileSync(bundle(root), '\n:root {\n  --kbq-internal-parameters-p0: 8px;\n}\n'),
        /\[private tokens\].*internalParameters.p0/
    );
    await reject(
        'private alias cycles are rejected without a hop limit',
        (root) => {
            const tree = readShadows(root);

            tree.internalParameters.p29.$value = '{internalParameters.p0}';
            writeShadows(root, tree);
        },
        /\[private tokens\].*cycle of private aliases/
    );
    await reject(
        'expanded private typography leaks are detected through long alias chains',
        (root) => fs.appendFileSync(bundle(root), '\n:root {\n  --kbq-internal-typography-p0-font-size: 12px;\n}\n'),
        /\[private tokens\].*internalTypography.p0/
    );
    await reject(
        'long chains cannot hide private literals from a different theme',
        (root) => {
            const tree = readShadows(root);

            tree.internalParameters.p29.$value = '{shadow.dark.overflow.normal.base.outline.blur}';
            writeShadows(root, tree);
        },
        /\[private modes\].*private dark literal/
    );
});
