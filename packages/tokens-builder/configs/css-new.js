const semanticPaletteColors = ['theme', 'success', 'warning', 'error', 'contrast', 'white', 'black', 'purple'];
const newPaletteColors = [
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
const newSemanticPaletteColors = [
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

const newPaletteByColorsConfig = newPaletteColors.map((color) => ({
    destination: `palette/${color}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'plt' && token.attributes.type === color,
    prefix: 'kbq'
}));

const newSemanticPaletteConfig = newSemanticPaletteColors.map((color) => ({
    destination: `semantic-palette/${color}.css`,
    format: 'kbq-css/palette',
    filter: (token) => token.attributes.category === 'semantic' && token.attributes.type === color,
    prefix: 'kbq',
    options: {
        outputReferences: true
    }
}));

module.exports = {
    css: {
        transformGroup: 'kbq/css-new',
        files: [
            ...newSemanticPaletteConfig,
            ...newPaletteByColorsConfig,
            {
                destination: 'palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'plt',
                prefix: 'kbq'
            },
            {
                destination: 'semantic-palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'semantic',
                prefix: 'kbq',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'light/shadows.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.light && token.attributes.category === 'shadow',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'light/semantic-colors.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.light &&
                    token.filePath.includes('colors.v2.json5') &&
                    !semanticPaletteColors.includes(token.attributes.type),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'dark/shadows.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark && token.attributes.category === 'shadow',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: 'dark/semantic-colors.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.dark &&
                    token.filePath.includes('colors.v2.json5') &&
                    !semanticPaletteColors.includes(token.attributes.type),
                prefix: 'kbq',
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
                    !token.attributes.palette &&
                    !token.attributes.light &&
                    !token.attributes.dark &&
                    token.type !== 'font' &&
                    token.attributes.category !== 'palette',
                prefix: 'kbq',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens-light.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.light &&
                    !token.attributes.palette &&
                    !semanticPaletteColors.includes(token.attributes.type),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.dark &&
                    !token.attributes.palette &&
                    !semanticPaletteColors.includes(token.attributes.type),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark'
                }
            }
        ]
    }
};
