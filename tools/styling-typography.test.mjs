import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typographyRows } from './generate-styling-md.mjs';

test('serializes typography dimensions in the styling table', () => {
    const rows = typographyRows({
        typography: {
            headline: {
                $value: {
                    fontSize: { value: 28, unit: 'px' },
                    lineHeight: { value: 32, unit: 'px' },
                    fontWeight: 700
                }
            },
            partial: { $value: { fontSize: '12px', fontFamily: 'Inter' } }
        }
    });

    assert.equal(rows, ['| `kbq-headline` | 28px | 32px | 700 |', '| `kbq-partial` | 12px |  |  |'].join('\n'));
});
