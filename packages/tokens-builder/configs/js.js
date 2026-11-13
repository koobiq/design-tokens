import { hasValue } from '../filters/has-value.js';
import { isShadowParameter } from '../filters/shadow-parameter.js';

const shipped = (token) => hasValue(token) && !isShadowParameter(token);

export default {
    js: {
        transformGroup: 'kbq/ts',
        // Tokens with a null value are deliberately unstyled; the TypeScript declaration
        // format throws on them, and they would be noise in the other two.
        files: [
            {
                destination: 'js/index.mjs',
                format: 'javascript/es6',
                filter: shipped
            },
            {
                destination: 'js/index.js',
                format: 'javascript/module-flat',
                filter: shipped
            },
            {
                destination: 'js/index.d.ts',
                format: 'typescript/es6-declarations',
                filter: shipped
            }
        ]
    }
};
