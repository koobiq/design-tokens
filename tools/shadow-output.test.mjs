import { test } from 'node:test';
import assert from 'node:assert/strict';
import StyleDictionary from 'style-dictionary';
import '../packages/tokens-builder/build.js';
import getConfig from '../packages/tokens-builder/configs/index.js';

const marker = { $extensions: { 'io.koobiq': { private: true } } };
const layer = (color, extra = {}) => ({
    offsetX: '0px',
    offsetY: '2px',
    blur: '6px',
    spread: '0px',
    color,
    ...extra
});

// formatPlatform exercises the real preprocessors, filters, transforms and formats without writing files.
const format = async (
    tokens,
    { platform = 'css', destination = 'css-tokens-light.css', outputReferences = true } = {}
) => {
    const config = getConfig({ buildPath: [], outputPath: 'test-output/' });
    const selected = config.platforms[platform];
    const file = selected.files.find((entry) => entry.destination === destination);

    assert.ok(file, destination);
    config.tokens = tokens;
    config.log = { verbosity: 'silent', warnings: 'error' };
    config.platforms = {
        [platform]: {
            ...selected,
            actions: [],
            files: [{ ...file, options: { ...file.options, outputReferences } }]
        }
    };

    const [{ output }] = await new StyleDictionary(config).formatPlatform(platform);

    return output;
};

test('standard shadow shorthand keeps inset and normalizes literal and private DTCG dimensions', async () => {
    const tokens = {
        params: { ...marker, y: { $type: 'dimension', $value: { value: 2, unit: 'px' } } },
        light: { shadow: { outline: { $type: 'color', $value: '#123456' } } },
        shadow: {
            light: {
                card: {
                    $type: 'shadow',
                    $value: layer('{light.shadow.outline}', {
                        inset: true,
                        offsetX: { value: 0, unit: 'px' },
                        offsetY: '{params.y}',
                        blur: { value: 6, unit: 'px' },
                        spread: { value: 0, unit: 'px' }
                    })
                }
            }
        }
    };
    const output = await format(tokens);

    assert.match(output, /--kbq-shadow-card: inset 0px 2px 6px 0px var\(--kbq-shadow-outline\);/);
    assert.doesNotMatch(output, /params|\[object Object\]/);
});

test('shadow arrays preserve public layer aliases and inline private layer composites', async () => {
    const tokens = {
        params: { ...marker, layer: { $type: 'shadow', $value: layer('#abcdef', { inset: true }) } },
        shadow: {
            light: {
                base: { $type: 'shadow', $value: layer('#123456') },
                card: { $type: 'shadow', $value: ['{shadow.light.base}', '{params.layer}'] }
            }
        }
    };
    const output = await format(tokens);

    assert.match(output, /--kbq-shadow-card: var\(--kbq-shadow-base\), inset 0px 2px 6px 0px #abcdef;/);
    assert.doesNotMatch(output, /params/);
});

test('private geometry becomes values while colors stop at the first public alias or a literal', async () => {
    const tokens = {
        params: {
            ...marker,
            y: { $type: 'dimension', $value: '2px' },
            color: { $type: 'color', $value: '{params.alias}' },
            alias: { $type: 'color', $value: '{light.shadow.outline}' },
            literal: { $type: 'color', $value: '#abcdef' }
        },
        semantic: { outline: { $type: 'color', $value: '#123456' } },
        light: { shadow: { outline: { $type: 'color', $value: '{semantic.outline}' } } },
        shadow: {
            light: {
                card: {
                    $type: 'shadow',
                    $value: [layer('{params.color}', { offsetY: '{params.y}' }), layer('{params.literal}')]
                }
            }
        }
    };
    const output = await format(tokens);

    assert.match(output, /--kbq-shadow-outline: var\(--kbq-semantic-outline\);/);
    assert.match(output, /--kbq-shadow-card: 0px 2px 6px 0px var\(--kbq-shadow-outline\), 0px 2px 6px 0px #abcdef;/);
    assert.doesNotMatch(output, /params/);

    const resolved = await format(tokens, { outputReferences: false });

    assert.match(resolved, /--kbq-shadow-card: 0px 2px 6px 0px #123456, 0px 2px 6px 0px #abcdef;/);
    assert.doesNotMatch(resolved, /var\(/);
});

test('component CSS keeps public references alongside private values in shadows and expressions', async () => {
    const tokens = {
        params: {
            ...marker,
            y: { $type: 'dimension', $value: '2px' },
            color: { $type: 'color', $value: '{light.shadow.outline}' }
        },
        size: { unit: { $type: 'dimension', $value: '3px' } },
        light: { shadow: { outline: { $type: 'color', $value: '#123456' } } },
        skeleton: {
            light: {
                shadow: { $type: 'shadow', $value: layer('{params.color}', { offsetY: '{params.y}' }) },
                width: { $type: 'dimension', $value: 'calc({params.y} + {size.unit})' }
            }
        }
    };
    const output = await format(tokens, { destination: 'css/components/skeleton.css' });

    assert.match(output, /\.kbq-light \{/);
    assert.match(output, /--kbq-skeleton-shadow: 0px 2px 6px 0px var\(--kbq-shadow-outline\);/);
    assert.match(output, /--kbq-skeleton-width: calc\(2px \+ var\(--kbq-size-unit\)\);/);
    assert.doesNotMatch(output, /params/);
});

test('transparent private layers are still removed after private references are expanded', async () => {
    const tokens = {
        params: { ...marker, color: { $type: 'color', $value: '#00000000' } },
        shadow: { light: { card: { $type: 'shadow', $value: [layer('{params.color}'), layer('#123456')] } } }
    };
    const output = await format(tokens);

    assert.match(output, /--kbq-shadow-card: 0px 2px 6px 0px #123456;/);
    assert.doesNotMatch(output, /00000000|params/);
});

test('private tokens are absent from CSS aggregates, Sass and JS exports in both themes', async () => {
    const tokens = {
        params: { ...marker, y: { $type: 'dimension', $value: '2px' } },
        shadow: {
            light: { card: { $type: 'shadow', $value: layer('#123456', { offsetY: '{params.y}' }) } },
            dark: { card: { $type: 'shadow', $value: layer('#abcdef', { offsetY: '{params.y}' }) } }
        },
        typography: {
            internal: { ...marker, $type: 'typography', $value: { fontSize: '12px', fontFamily: 'Inter' } },
            visible: { $type: 'typography', $value: '{typography.internal}' }
        }
    };

    for (const [platform, destination, expected] of [
        ['css', 'css-tokens-light.css', '--kbq-shadow-card: 0px 2px 6px 0px #123456;'],
        ['css', 'css-tokens-dark.css', '--kbq-shadow-card: 0px 2px 6px 0px #abcdef;'],
        ['css', 'css/typography.css', '--kbq-typography-visible-font-size: 12px;'],
        ['scss', '_variables.scss', '$shadow-light-card: 0px 2px 6px 0px #123456;'],
        ['scss', '_typography.scss', '$typography-visible-font-size: 12px;'],
        ['js', 'js/index.mjs', 'export const ShadowDarkCard = "0px 2px 6px 0px #abcdef";'],
        ['js', 'js/index.js', 'ShadowLightCard: "0px 2px 6px 0px #123456"'],
        ['js', 'js/index.d.ts', 'export const ShadowLightCard: string;']
    ]) {
        const output = await format(tokens, { platform, destination });

        assert.ok(output.includes(expected), `${destination}: ${expected}`);
        assert.doesNotMatch(output, /params|internal/i, destination);
    }
});
