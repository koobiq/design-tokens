# Tokens Builder

## Overview

Tokens builder is a configuration script that utilizes Style Dictionary,
a design-token platform for creating and maintaining consistent design tokens across various platforms.

Overall, this script orchestrates the generation of design tokens by applying custom transformations,
filters, and formats to the specified theme configuration for multiple platforms,
facilitating a streamlined design token workflow compatible with
various output formats like SCSS, CSS, and TypeScript.

## Typography composite tokens

Tokens builder supports DTCG-style `typography` composites and serializes their values for CSS, SCSS, and TypeScript.
The `fontSize`, `lineHeight`, and `letterSpacing` values share the dimension object shape:

```json5
{
    typography: {
        headline: {
            $type: 'typography',
            $value: {
                fontSize: { value: 28, unit: 'px' },
                lineHeight: { value: 32, unit: 'px' },
                letterSpacing: { value: 0, unit: 'px' },
                fontWeight: 700,
                fontFamily: '{font.family.accent}',
                textTransform: 'initial',
                fontFeatureSettings: '"calt", "kern", "liga"'
            }
        }
    }
}
```

The `kbq/expand-typography` preprocessor expands the composite before Style Dictionary resolves references.
The `kbq-value/dimension` transform serializes `{ value, unit }` for every output platform:

```css
--kbq-typography-headline-font-size: 28px;
--kbq-typography-headline-line-height: 32px;
--kbq-typography-headline-letter-spacing: 0px;
```

A composite may be aliased whole (`"$value": "{typography.headline}"`) or may reference individual sub-properties.
The preprocessor preserves those references.

### Koobiq extensions

This is not a claim of strict DTCG conformance for the complete composite:

- `lineHeight` is an absolute dimension. DTCG `typography` instead defines it as a unitless `number` multiplier.
- `fontStyle`, `textTransform`, and `fontFeatureSettings` are Koobiq properties outside the DTCG `typography` property list.

The preprocessor accepts the five required properties `fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`, and `fontFamily`, plus the three extensions above.
Invalid dimensions and unknown properties fail the build with the token path instead of producing `[object Object]`.
Existing dimension strings remain supported outside the migrated composite values.
