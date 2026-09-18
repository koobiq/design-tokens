import { hasValue } from '../filters/has-value.js';

export default {
    js: {
        transformGroup: 'kbq/ts',
        // Tokens with a null value are deliberately unstyled; the TypeScript declaration
        // format throws on them, and they would be noise in the other two.
        files: [
            {
                destination: 'js/index.mjs',
                format: 'javascript/es6',
                filter: hasValue
            },
            {
                destination: 'js/index.js',
                format: 'javascript/module-flat',
                filter: hasValue
            },
            {
                destination: 'js/index.d.ts',
                format: 'typescript/es6-declarations',
                filter: hasValue
            }
        ]
    }
};
