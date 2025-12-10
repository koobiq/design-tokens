const fs = require('fs');
const path = require('node:path');

const componentTokens = fs
    .readdirSync(path.join('packages', 'design-tokens', 'web', 'components'))
    .filter((fileName) => fileName.endsWith('.json5'))
    .map((fileName) => fileName.replace('.json5', ''));

const componentTokensBase = componentTokens.map((fileName) => ({
    destination: `css/components/${fileName}/${fileName}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.filePath.includes(fileName) && !token.attributes.light && !token.attributes.dark,
    prefix: 'kbq',
    options: {
        outputReferences: true
    }
}));

const componentTokensLight = componentTokens.map((fileName) => ({
    destination: `css/components/${fileName}/${fileName}-light.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.filePath.includes(fileName) && token.attributes.light,
    prefix: 'kbq',
    options: {
        selector: '.kbq-light'
    }
}));

const componentTokensDark = componentTokens.map((fileName) => ({
    destination: `css/components/${fileName}/${fileName}-dark.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.filePath.includes(fileName) && token.attributes.dark,
    prefix: 'kbq',
    options: {
        selector: '.kbq-dark'
    }
}));

const colorPalettesConfig = [
    'black',
    'blue',
    'cyan',
    'green',
    'grey',
    'orange',
    'purple',
    'red',
    'white',
    'yellow'
].map((color) => ({
    destination: `css/palette/${color}.css`,
    format: 'kbq-css/variables',
    filter: (token) => token.attributes.category === 'palette' && token.attributes.type === color,
    prefix: 'kbq'
}));

const semanticPalettesConfig = ['theme', 'success', 'warning', 'error', 'contrast', 'white', 'black', 'purple'].map(
    (color) => ({
        destination: `css/semantic-palette/${color}.css`,
        format: 'kbq-css/palette',
        filter: (token) =>
            token.filePath.includes('colors.json5') &&
            token.attributes.light &&
            token.attributes.type === color &&
            (token.attributes.palette || token.name.includes('default')),
        prefix: 'kbq'
    })
);

module.exports = {
    css: {
        transformGroup: 'kbq/css',
        files: [
            ...semanticPalettesConfig,
            {
                destination: 'css/semantic-palette-light.css',
                format: 'kbq-css/palette',
                filter: (token) => token.attributes.light && token.filePath.includes('colors.json5'),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css/semantic-palette-dark.css',
                format: 'kbq-css/palette',
                filter: (token) => token.attributes.dark && token.filePath.includes('colors.json5'),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark'
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
            ...colorPalettesConfig,
            {
                destination: 'css/palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'palette',
                prefix: 'kbq'
            },
            {
                destination: 'css/shadows.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'shadow',
                prefix: 'kbq'
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
                destination: 'css/components-light.css',
                format: 'kbq-css/variables',
                filter: (token) =>
                    token.attributes.light && !token.attributes.palette && token.filePath.includes('components'),
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light'
                }
            },
            {
                destination: 'css/components-dark.css',
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
