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
        // Per-color palette/semantic-palette splits are omitted from the index since their
        // variables are already covered by the aggregate palette.css / semantic-palette.css.
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
            {
                destination: 'css-tokens.css',
                format: 'css/variables',
                filter: (token) =>
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
                filter: (token) => token.attributes.light,
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark,
                options: {
                    selector: '.kbq-dark'
                }
            }
        ]
    }
};
