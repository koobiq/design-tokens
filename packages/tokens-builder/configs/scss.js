import { isShadowParameter } from '../filters/shadow-parameter.js';
import { isTypography } from '../filters/typography.js';
import { isMdTypography } from '../filters/md-typography.js';

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
                filter: isTypography
            },
            {
                destination: '_md-typography.scss',
                format: 'kbq-scss/typography',
                mapName: 'md-typography',
                filter: isMdTypography
            },
            {
                destination: '_palette.scss',
                format: 'kbq-scss/palette',
                filter: (token) => token.path[0] === 'plt'
            }
        ]
    }
};
