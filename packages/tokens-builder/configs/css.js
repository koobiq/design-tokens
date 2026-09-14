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

/** Tokens authored under web/components — code-block syntax colours, scrollbar, skeleton. */
const isComponent = (token) => token.filePath.includes('/components/');

const paletteByColorsConfig = paletteColors.map((color) => ({
    destination: `palette/${color}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'plt' && token.attributes.type === color
}));

const semanticPaletteConfig = semanticPaletteColors.map((color) => ({
    destination: `semantic-palette/${color}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'semantic' && token.attributes.type === color,
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
        // scrollbar or skeleton need them, so they ship as opt-in component-tokens*.css.
        index: {
            dir: '',
            files: [
                'font.css',
                'size.css',
                'typography.css',
                'md-typography.css',
                'palette.css',
                'semantic-palette.css',
                'light/semantic-colors.css',
                'light/shadows.css',
                'dark/semantic-colors.css',
                'dark/shadows.css'
            ]
        },
        files: [
            ...semanticPaletteConfig,
            ...paletteByColorsConfig,
            {
                destination: 'font.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'font'
            },
            {
                destination: 'size.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'size'
            },
            {
                destination: 'typography.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'typography',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'md-typography.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'md-typography',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'plt'
            },
            {
                destination: 'semantic-palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'semantic',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'light/shadows.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.light && token.attributes.category === 'shadow',
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'light/semantic-colors.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.light && token.filePath.includes('colors.json5'),
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'dark/shadows.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark && token.attributes.category === 'shadow',
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: 'dark/semantic-colors.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark && token.filePath.includes('colors.json5'),
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
                filter: (token) => isComponent(token) && !token.attributes.light && !token.attributes.dark,
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'component-tokens-light.css',
                format: 'kbq-css/variables',
                filter: (token) => isComponent(token) && token.attributes.light,
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'component-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: (token) => isComponent(token) && token.attributes.dark,
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens.css',
                format: 'css/variables',
                filter: (token) =>
                    !isComponent(token) &&
                    !token.attributes.font &&
                    !token.attributes.light &&
                    !token.attributes.dark &&
                    token.type !== 'font',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens-light.css',
                format: 'kbq-css/variables',
                filter: (token) => !isComponent(token) && token.attributes.light,
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: (token) => !isComponent(token) && token.attributes.dark,
                options: {
                    selector: '.kbq-dark'
                }
            }
        ]
    }
};
