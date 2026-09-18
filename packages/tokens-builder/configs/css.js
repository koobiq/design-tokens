import { hasValue } from '../filters/has-value.js';

const paletteColors = [
    'blue',
    'slate',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'purple',
    'darkBlue',
    'darkSlate',
    'darkRed',
    'darkOrange',
    'darkYellow',
    'darkGreen',
    'darkTeal',
    'darkPurple',
    'grey',
    'darkGrey',
    'greyA',
    'darkGreyA',
    'whiteA',
    'blackA',
    'blueA',
    'slateA',
    'redA',
    'orangeA',
    'yellowA',
    'greenA',
    'tealA',
    'purpleA',
    'darkBlueA',
    'darkSlateA',
    'darkRedA',
    'darkOrangeA',
    'darkYellowA',
    'darkGreenA',
    'darkTealA',
    'darkPurpleA',
    'yellowFixed',
    'orangeFixed',
    'darkYellowFixed',
    'darkOrangeFixed',
    'yellowFixedA',
    'orangeFixedA',
    'darkYellowFixedA',
    'darkOrangeFixedA',
    'white',
    'black'
];

const semanticPaletteColors = [
    'contrast',
    'contrastA',
    'theme',
    'themeA',
    'error',
    'errorA',
    'warning',
    'warningA',
    'warningFixed',
    'warningFixedA',
    'success',
    'successA',
    'visited',
    'visitedA',
    'darkContrast',
    'darkContrastA',
    'darkTheme',
    'darkThemeA',
    'darkError',
    'darkErrorA',
    'darkWarning',
    'darkWarningA',
    'darkWarningFixed',
    'darkWarningFixedA',
    'darkSuccess',
    'darkSuccessA',
    'darkVisited',
    'darkVisitedA'
];

/**
 * The component token sets that survived v4, named after their source file in web/components/.
 *
 * Each gets its own stylesheet under css/components/, because they are opt-in and wildly uneven
 * in size: code-block is 34 of the 68 emitted component variables, so a consumer who renders no
 * code blocks should not have to carry them to get a styled scrollbar.
 */
const components = [
    { file: 'code-block', root: 'code-block' },
    { file: 'scrollbars', root: 'scrollbar' },
    { file: 'skeleton', root: 'skeleton' }
];

const componentRoots = components.map(({ root }) => root);

/**
 * Tokens authored under web/components — code-block syntax colours, scrollbar, skeleton.
 *
 * Matched on the token's own path rather than its `filePath`: Style Dictionary leaves `filePath`
 * undefined on a token whose value is null, and those are exactly the deliberately-unstyled
 * component tokens, so a filePath test both throws and mis-sorts them into the global aggregates.
 */
const isComponent = (token) => componentRoots.includes(token.attributes.category);

/**
 * Everything sliced by category lives under css/, mirroring how the package was laid out before
 * v4. The aggregates that stitch those slices back together (css-tokens*.css,
 * component-tokens*.css) stay at the root of web/, so "a slice" and "the whole thing" are told
 * apart by location.
 */
const sliced = (destination) => `css/${destination}`;

const paletteByColorsConfig = paletteColors.map((color) => ({
    destination: sliced(`palette/${color}.css`),
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'plt' && token.attributes.type === color
}));

const semanticPaletteConfig = semanticPaletteColors.map((color) => ({
    destination: sliced(`semantic-palette/${color}.css`),
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'semantic' && token.attributes.type === color,
    options: {
        outputReferences: true
    }
}));

const componentsConfig = components.map(({ file, root }) => ({
    destination: sliced(`components/${file}.css`),
    format: 'kbq-css/component',
    filter: (token) => hasValue(token) && token.attributes.category === root,
    options: {
        outputReferences: true
    }
}));

export default {
    css: {
        transformGroup: 'kbq/css',
        actions: ['kbq/css-index'],
        prefix: 'kbq',
        // Token files are split across many outputs on purpose (palette.css,
        // semantic-palette.css, light/semantic-colors.css …) and reference each other across
        // those files — which is exactly what index.css stitches back together. Style
        // Dictionary warns for every reference whose target was filtered out of the file being
        // written, so that one warning is muted here. Transform errors still fail the build:
        // they are gated by the top-level `log` (see configs/index.js).
        log: { warnings: 'disabled' },
        // Per-color palette/semantic-palette splits are omitted from the index since their
        // variables are already covered by the aggregate palette.css / semantic-palette.css.
        //
        // Component tokens are omitted on purpose too: only consumers using code-block,
        // scrollbar or skeleton need them, so they ship opt-in — one file per component under
        // css/components/, plus component-tokens*.css at the root for all of them at once.
        index: {
            dir: 'css',
            files: [
                sliced('font.css'),
                sliced('size.css'),
                sliced('typography.css'),
                sliced('md-typography.css'),
                sliced('palette.css'),
                sliced('semantic-palette.css'),
                sliced('light/semantic-colors.css'),
                sliced('light/shadows.css'),
                sliced('dark/semantic-colors.css'),
                sliced('dark/shadows.css')
            ]
        },
        files: [
            ...semanticPaletteConfig,
            ...paletteByColorsConfig,
            ...componentsConfig,
            {
                destination: sliced('font.css'),
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'font'
            },
            {
                destination: sliced('size.css'),
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'size'
            },
            {
                destination: sliced('typography.css'),
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'typography',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: sliced('md-typography.css'),
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'md-typography',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: sliced('palette.css'),
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'plt'
            },
            {
                destination: sliced('semantic-palette.css'),
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'semantic',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: sliced('light/shadows.css'),
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.light && token.attributes.category === 'shadow',
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: sliced('light/semantic-colors.css'),
                format: 'kbq-css/variables',
                // `filePath?.` because Style Dictionary leaves it undefined on null-valued tokens;
                // a token with no known file is simply not one of colors.json5's.
                filter: (token) => token.attributes.light && token.filePath?.includes('colors.json5'),
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: sliced('dark/shadows.css'),
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark && token.attributes.category === 'shadow',
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: sliced('dark/semantic-colors.css'),
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark && token.filePath?.includes('colors.json5'),
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            // The three component token sets that survived v4 (code-block syntax colours,
            // scrollbar, skeleton). Only consumers of those components need them, so they are
            // opt-in: kept out of index.css and out of the css-tokens*.css aggregates, and
            // shipped as their own triple mirroring the css-tokens*.css naming.
            {
                destination: 'component-tokens.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    hasValue(token) && isComponent(token) && !token.attributes.light && !token.attributes.dark,
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'component-tokens-light.css',
                format: 'kbq-css/variables',
                filter: (token) => hasValue(token) && isComponent(token) && token.attributes.light,
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'component-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: (token) => hasValue(token) && isComponent(token) && token.attributes.dark,
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens.css',
                format: 'css/variables',
                filter: (token) =>
                    hasValue(token) &&
                    !isComponent(token) &&
                    !token.attributes.font &&
                    !token.attributes.light &&
                    !token.attributes.dark &&
                    token.type !== 'font',
                options: {
                    outputReferences: true
                }
            },
            // outputReferences matters here as much as it does in the index files: without it a
            // role token is written as a resolved literal, the plt → semantic → role chain is
            // gone from the output, and repointing the semantic layer (the supported way to
            // re-theme) silently stops working for anyone consuming this entry point.
            {
                destination: 'css-tokens-light.css',
                format: 'kbq-css/variables',
                filter: (token) => hasValue(token) && !isComponent(token) && token.attributes.light,
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: (token) => hasValue(token) && !isComponent(token) && token.attributes.dark,
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            }
        ]
    }
};
