import { test } from 'node:test';
import assert from 'node:assert/strict';
import registerDimension from '../packages/tokens-builder/transforms/value/dimension.js';
import registerExpandTypography from '../packages/tokens-builder/preprocessors/expand-typography.js';

const registrations = [];
registerDimension({ registerTransform: (transform) => registrations.push(transform) });
const dimension = registrations[0];

const dtcgToken = (value) => ({
    $type: 'dimension',
    $value: value,
    path: ['typography', 'headline', 'fontSize']
});

test('serializes DTCG dimensions in px and rem', () => {
    assert.equal(dimension.filter(dtcgToken({ value: 28, unit: 'px' })), true);
    assert.equal(dimension.transform(dtcgToken({ value: 28, unit: 'px' }), {}, { usesDtcg: true }), '28px');
    assert.equal(dimension.transform(dtcgToken({ value: 1.25, unit: 'rem' }), {}, { usesDtcg: true }), '1.25rem');
});

test('serializes legacy dimensions and keeps legacy strings', () => {
    const token = { type: 'dimension', value: { value: 32, unit: 'px' }, path: ['lineHeight'] };

    assert.equal(dimension.transform(token, {}, { usesDtcg: false }), '32px');
    assert.equal(dimension.transform(dtcgToken('32px'), {}, { usesDtcg: true }), '32px');
});

test('rejects malformed dimensions with the token path', () => {
    const invalid = [
        { value: '28', unit: 'px' },
        { value: 28, unit: 'em' },
        { value: Number.NaN, unit: 'px' },
        { value: 28 },
        { unit: 'px' },
        { value: 28, unit: 'px', extra: true },
        null,
        []
    ];

    for (const value of invalid) {
        assert.throws(
            () => dimension.transform(dtcgToken(value), {}, { usesDtcg: true }),
            /typography\.headline\.fontSize: expected dimension/
        );
    }
});

const preprocessorRegistrations = [];
registerExpandTypography({ registerPreprocessor: (preprocessor) => preprocessorRegistrations.push(preprocessor) });
const expand = (tokens) => preprocessorRegistrations[0].preprocessor(structuredClone(tokens), {});

const composite = () => ({
    fontSize: { value: 28, unit: 'px' },
    lineHeight: { value: 32, unit: 'px' },
    letterSpacing: { value: 0, unit: 'px' },
    fontWeight: 700,
    fontFamily: '{font.family.accent}',
    textTransform: 'initial',
    fontFeatureSettings: '"calt", "kern", "liga"'
});

const typography = (value) => ({ typography: { headline: { $type: 'typography', $value: value } } });

test('expands lineHeight as an absolute dimension without arithmetic', () => {
    const result = expand(typography(composite()));

    assert.deepEqual(result.typography.headline.lineHeight, {
        $value: { value: 32, unit: 'px' },
        $type: 'dimension'
    });
});

test('preserves whole-composite aliases', () => {
    const result = expand({
        typography: {
            title: { $type: 'typography', $value: composite() },
            navbar: { $type: 'typography', $value: '{typography.title}' }
        }
    });

    assert.equal(result.typography.navbar.lineHeight.$value, '{typography.title.lineHeight}');
    assert.equal(result.typography.navbar.lineHeight.$type, 'dimension');
    assert.equal(result.typography.navbar.letterSpacing.$value, '{typography.title.letterSpacing}');
});

test('preserves direct sub-property references', () => {
    const value = composite();
    value.lineHeight = '{typography.title.lineHeight}';
    value.letterSpacing = '{typography.title.letterSpacing}';

    const result = expand(typography(value));

    assert.equal(result.typography.headline.lineHeight.$value, '{typography.title.lineHeight}');
    assert.equal(result.typography.headline.lineHeight.$type, 'dimension');
    assert.equal(result.typography.headline.letterSpacing.$value, '{typography.title.letterSpacing}');
});

test('requires the five standard typography properties', () => {
    const value = composite();
    delete value.letterSpacing;

    assert.throws(
        () => expand(typography(value)),
        /typography\.headline\.\$value\.letterSpacing: required property is missing/
    );
});

test('rejects unknown composite properties', () => {
    const value = { ...composite(), textOverflow: 'ellipsis' };

    assert.throws(
        () => expand(typography(value)),
        /typography\.headline\.\$value\.textOverflow: unknown typography property/
    );
});

test('rejects a legacy lineHeight string with the property path', () => {
    const value = { ...composite(), lineHeight: '32px' };

    assert.throws(() => expand(typography(value)), /typography\.headline\.\$value\.lineHeight: expected dimension/);
});

test('rejects non-string extension values', () => {
    const value = { ...composite(), fontStyle: { value: 'italic' } };

    assert.throws(
        () => expand(typography(value)),
        /typography\.headline\.\$value\.fontStyle: expected a string or token reference/
    );
});
