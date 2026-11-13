import { isShadowParameter } from '../filters/shadow-parameter.js';

export default {
    scss: {
        transformGroup: 'kbq/scss',
        files: [
            {
                destination: '_variables.scss',
                format: 'scss/variables',
                filter: (token) =>
                    !token.attributes.typography && !token.attributes['md-typography'] && !isShadowParameter(token)
            },
            {
                destination: '_typography.scss',
                format: 'kbq-scss/typography',
                mapName: 'koobiq',
                filter: 'typography'
            },
            {
                destination: '_md-typography.scss',
                format: 'kbq-scss/typography',
                mapName: 'md-typography',
                filter: 'md-typography'
            },
            {
                destination: '_palette.scss',
                format: 'kbq-scss/palette',
                filter: (token) => token.path[0] === 'plt'
            }
        ]
    }
};
