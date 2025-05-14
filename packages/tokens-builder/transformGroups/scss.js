module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/scss',
        transforms: [
            'attribute/cti',
            'kbq-attribute/palette',
            'kbq-attribute/typography',
            'kbq-attribute/md-typography',
            'name/cti/kebab',
            'kbq-scss/value',
            'kbq-attribute/comment'
        ]
    });
};
