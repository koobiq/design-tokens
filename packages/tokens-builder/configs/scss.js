module.exports = {
    scss: {
        transformGroup: 'kbq/scss',
        files: [
            {
                destination: '_variables.scss',
                format: 'scss/variables',
                filter: (token) => !token.attributes.typography && !token.attributes['md-typography']
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
            }
        ]
    }
};
