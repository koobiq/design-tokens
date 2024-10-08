module.exports = {
    js: {
        transformGroup: 'kbq/ts',
        files: [
            {
                destination: 'js/index.mjs',
                format: 'javascript/es6'
            },
            {
                destination: 'js/index.cjs',
                format: 'javascript/module-flat'
            },
            {
                destination: 'index.d.ts',
                format: 'typescript/es6-declarations'
            }
        ]
    }
};
