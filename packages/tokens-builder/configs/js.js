module.exports = {
    js: {
        transformGroup: 'kbq/ts',
        files: [
            {
                destination: 'js/index.js',
                format: 'javascript/es6'
            },
            {
                destination: 'index.d.ts',
                format: 'typescript/es6-declarations'
            }
        ]
    }
};

