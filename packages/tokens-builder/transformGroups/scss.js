export default (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/scss',
        transforms: [
            'attribute/cti',
            'kbq-attribute/typography',
            'kbq-attribute/md-typography',
            'name/kebab',
            'shadow/css/shorthand',
            'kbq-scss/value',
            'kbq-attribute/comment'
        ]
    });
};
