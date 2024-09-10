# Tokens Builder

## Overview

Tokens builder is a configuration script that utilizes Style Dictionary,
a design-token platform for creating and maintaining consistent design tokens across various platforms.

Overall, this script orchestrates the generation of design tokens by applying custom transformations,
filters, and formats to the specified theme configuration for multiple platforms,
facilitating a streamlined design token workflow compatible with
various output formats like SCSS, CSS, and TypeScript.

## Typography composite tokens

Tokens builder supports usage of [composite tokens](https://design-tokens.github.io/community-group/format/#composite-design-token) for CSS platform.
For now, typography token sets are supported.

### Example of usage

```json
{
    "<component-name>": {
        "font": {
            "type": "font",
            "<token-with-composite-token-reference>": "{typography.<typography-set>}"
        }
    }
}
```

where `<typography-set>` is a set from `@koobiq/design-tokens/web/properties/typography.json5`

"type": "font" property is **required.**

output:

```
  --kbq-<component-name>-font-<token-with-composite-token-reference>-font-size: <value>;
  --kbq-<component-name>-font-<token-with-composite-token-reference>-font-weight: <value>;
  --kbq-<component-name>-font-<token-with-composite-token-reference>-line-height: <value>;
  --kbq-<component-name>-font-<token-with-composite-token-reference>-font-family: <value>;
  // ...etc
```
