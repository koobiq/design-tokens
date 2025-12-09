const fs = require('fs');
const path = require('node:path');

const componentTokensBase = fs
    .readdirSync(path.join('packages', 'design-tokens', 'web', 'components'))
    .filter((fileName) => fileName.endsWith('.json5'))
    .map((fileName) => {
        const componentName = fileName.replace('.json5', '');

        return {
            destination: `css/components/${componentName}/${componentName}.css`,
            format: 'kbq-css/variables',
            filter: (token) => token.filePath.includes(fileName) && !token.attributes.light && !token.attributes.dark,
            prefix: 'kbq'
        };
    });

const componentTokensLight = fs
    .readdirSync(path.join('packages', 'design-tokens', 'web', 'components'))
    .filter((fileName) => fileName.endsWith('.json5'))
    .map((fileName) => {
        const componentName = fileName.replace('.json5', '');

        return {
            destination: `css/components/${componentName}/${componentName}-light.css`,
            format: 'kbq-css/variables',
            filter: (token) => token.filePath.includes(fileName) && token.attributes.light,
            prefix: 'kbq',
            options: {
                selector: '.kbq-light'
            }
        };
    });

const componentTokensDark = fs
    .readdirSync(path.join('packages', 'design-tokens', 'web', 'components'))
    .filter((fileName) => fileName.endsWith('.json5'))
    .map((fileName) => {
        const componentName = fileName.replace('.json5', '');

        return {
            destination: `css/components/${componentName}/${componentName}-dark.css`,
            format: 'kbq-css/variables',
            filter: (token) => token.filePath.includes(fileName) && token.attributes.dark,
            prefix: 'kbq',
            options: {
                selector: '.kbq-dark'
            }
        };
    });

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

module.exports = {
    css: {
        transformGroup: 'kbq/css',
        files: [
            {
                destination: 'css/typography.css',
                format: 'css/variables',
                filter: (token) => token.attributes.category === 'typography',
                prefix: 'kbq'
            },

            ...colorPalettesConfig,
            {
                destination: 'css/palette.css',
                format: 'kbq-css/variables',
                filter: (token) => token.attributes.category === 'palette',
                prefix: 'kbq'
            },
            // {
            //     destination: 'css/semantic-palette.css',
            //     format: 'kbq-css/variables',
            //     filter: 'palette',
            //     prefix: 'kbq'
            // },
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
