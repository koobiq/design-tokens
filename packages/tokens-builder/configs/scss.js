module.exports = {
    scss: {
        transformGroup: 'kbq/scss',
        files: [
            {
                destination: '_variables.scss',
                format: 'scss/variables',
                filter: 'color'
            },
            {
                destination: '_palette.scss',
                format: 'kbq-scss/palette',
                filter: 'palette'
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
