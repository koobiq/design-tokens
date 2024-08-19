module.exports = {
    css: {
        transformGroup: 'kbq/css',
        files: [
            {
                destination: 'css-tokens.css',
                format: 'css/variables',
                filter: 'css-variables',
                prefix: 'kbq',
                options: {
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens-light.css',
                format: 'kbq-css/variables',
                filter: 'css-variables-light',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-light',
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens-dark.css',
                format: 'kbq-css/variables',
                filter: 'css-variables-dark',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-dark',
                    outputReferences: true
                }
            },
            {
                destination: 'css-tokens-font.css',
                format: 'kbq-css/variables',
                filter: 'css-variables-font',
                prefix: 'kbq',
                options: {
                    selector: '.kbq-font',
                    // warnings expected, since global fonts are defined in css-tokens.css
                    outputReferences: true
                }
            }
        ]
    }
};
