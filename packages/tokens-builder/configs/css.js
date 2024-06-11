module.exports = {
    css: {
        transformGroup: 'kbq/css',
        files: [
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
            }
        ]
    }
};
