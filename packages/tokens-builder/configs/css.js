const fs = require('fs');
const path = require('node:path');

const paletteColors = ['black', 'blue', 'cyan', 'green', 'grey', 'orange', 'purple', 'red', 'white', 'yellow'];
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
const semanticPaletteColors = ['theme', 'success', 'warning', 'error', 'contrast', 'white', 'black', 'purple'];
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

// resolve components path if script used externally
const componentsPath = fs.existsSync(path.join('node_modules', '@koobiq/design-tokens', 'web', 'components'))
    ? path.join('node_modules', '@koobiq/design-tokens', 'web', 'components')
    : path.join('packages', 'design-tokens', 'web', 'components');

const componentTokens = fs
    .readdirSync(componentsPath)
    .filter((fileName) => fileName.endsWith('.json5'))
    .map((fileName) => fileName.replace('.json5', ''));

const componentTokensBase = componentTokens.map((fileName) => ({
    destination: `deprecated/css/components/${fileName}/${fileName}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.filePath.includes(fileName) && !token.attributes.light && !token.attributes.dark,
    prefix: 'kbq',
    options: {
        outputReferences: true
    }
}));

const componentTokensLight = componentTokens.map((fileName) => ({
    destination: `deprecated/css/components/${fileName}/${fileName}-light.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.filePath.includes(fileName) && token.attributes.light,
    prefix: 'kbq',
    options: {
        selector: '.kbq-light'
    }
}));

const componentTokensDark = componentTokens.map((fileName) => ({
    destination: `deprecated/css/components/${fileName}/${fileName}-dark.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.filePath.includes(fileName) && token.attributes.dark,
    prefix: 'kbq',
    options: {
        selector: '.kbq-dark'
    }
}));

const paletteByColorsConfig = paletteColors.map((color) => ({
    destination: `css/palette/${color}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'palette' && token.attributes.type === color,
    prefix: 'kbq'
}));

const newPaletteByColorsConfig = newPaletteColors.map((color) => ({
    destination: `css/new/palette/${color}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'plt' && token.attributes.type === color,
    prefix: 'kbq'
}));

const semanticPaletteConfig = semanticPaletteColors.map((color) => ({
    destination: `css/semantic-palette/${color}.css`,
    format: 'kbq-css/palette',
    filter: (token) =>
        token.filePath.includes('colors.json5') &&
        token.attributes.light &&
        token.attributes.type === color &&
        (token.attributes.palette || token.name.includes('default')),
    prefix: 'kbq',
    options: {
        outputReferences: true
    }
}));

const newSemanticPaletteConfig = newSemanticPaletteColors.map((color) => ({
    destination: `css/new/semantic-palette/${color}.css`,
    format: 'kbq-css/palette',
    filter: (token) => token.attributes.category === 'semantic' && token.attributes.type === color,
    prefix: 'kbq',
    options: {
        outputReferences: true
    }
}));

module.exports = {
    css: {
        transformGroup: 'kbq/css',
        files: [
            ...semanticPaletteConfig,
            ...newSemanticPaletteConfig,
            {
                destination: 'css/light/semantic-palette.css',
                format: 'kbq-css/palette',
                filter: (token) =>
                    token.attributes.light &&
                    token.filePath.includes('colors.json5') &&
                    (token.attributes.palette || token.name.includes('default')),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            // deprecated
            {
                destination: 'css/dark/semantic-palette.css',
                format: 'kbq-css/palette',
                filter: (token) =>
                    token.attributes.dark &&
                    token.filePath.includes('colors.json5') &&
                    (token.attributes.palette || token.name.includes('default')),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark'
                }
            },
            {
                destination: 'css/light/semantic-colors.css',
                format: 'kbq-css/palette',
                filter: (token) =>
                    token.attributes.light &&
                    token.filePath.includes('colors.json5') &&
                    !semanticPaletteColors.includes(token.attributes.type),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'css/dark/semantic-colors.css',
                format: 'kbq-css/palette',
                filter: (token) =>
                    token.attributes.dark &&
                    token.filePath.includes('colors.json5') &&
                    !semanticPaletteColors.includes(token.attributes.type),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: 'css/font.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'font',
                prefix: 'kbq'
            },
            {
                destination: 'css/size.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'size',
                prefix: 'kbq'
            },
            {
                destination: 'css/md-typography.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'md-typography',
                prefix: 'kbq',
                options: {
                    outputReferences: true
                }
            },
            ...paletteByColorsConfig,
            ...newPaletteByColorsConfig,
            {
                destination: 'css/palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'palette',
                prefix: 'kbq'
            },
            {
                destination: 'css/new/palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'plt',
                prefix: 'kbq'
            },
            {
                destination: 'css/new/semantic-palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'semantic',
                prefix: 'kbq',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'css/light/shadows.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.light && token.attributes.category === 'shadow',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css/dark/shadows.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.dark && token.attributes.category === 'shadow',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark'
                }
            },
            {
                destination: 'css/typography.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'typography',
                prefix: 'kbq',
                options: {
                    outputReferences: true
                }
            },
            ...componentTokensBase,
            ...componentTokensLight,
            ...componentTokensDark,
            {
                destination: 'deprecated/css/components-light.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.light && !token.attributes.palette && token.filePath.includes('components'),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'deprecated/css/components-dark.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.dark && !token.attributes.palette && token.filePath.includes('components'),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark'
                }
            },
            {
                destination: 'css-tokens.css',
                format: 'css/variables',
                filter: 'css-variables',
                prefix: 'kbq'
            },
            {
                destination: 'css-tokens-light.css',
                format: 'kbq-css/variables',
                filter: 'css-variables-light',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: 'css-variables-dark',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark'
                }
            },
            {
                destination: 'css-tokens-font.css',
                format: 'kbq-css/variables',
                filter: 'css-variables-font',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-font'
                }
            }
        ]
    }
};
