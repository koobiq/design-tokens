# Tokens Builder

## Overview

Tokens builder is a configuration script that utilizes Style Dictionary,
a design-token platform for creating and maintaining consistent design tokens across various platforms.

Overall, this script orchestrates the generation of design tokens by applying custom transformations,
filters, and formats to the specified theme configuration for multiple platforms,
facilitating a streamlined design token workflow compatible with
various output formats like SCSS, CSS, and TypeScript.

## Typography composite tokens

Tokens builder supports [composite tokens](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/#composite-design-token) for the CSS platform.
Currently, the `typography` composite type is supported.

Typography presets are authored as DTCG `typography` composites — one token whose `$value` is an object of sub-properties:

```json
{
    "typography": {
        "text-normal": {
            "$type": "typography",
            "$value": {
                "fontSize": "16px",
                "lineHeight": "24px",
                "fontWeight": 400,
                "fontFamily": "{font.family.mono}",
                "letterSpacing": "normal"
            }
        }
    }
}
```

Sub-properties are camelCase, as the [`typography` type](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/#typography) requires.
The `kbq/expand-typography` preprocessor expands each composite back into one token per sub-property before Style Dictionary resolves references:

```
  --kbq-typography-text-normal-font-size: 16px;
  --kbq-typography-text-normal-line-height: 24px;
  --kbq-typography-text-normal-font-weight: 400;
  --kbq-typography-text-normal-font-family: var(--kbq-font-family-mono);
  // ...etc
```

A composite can also be aliased whole — `"$value": "{typography.text-normal}"` — which the preprocessor expands into one reference per sub-property.
