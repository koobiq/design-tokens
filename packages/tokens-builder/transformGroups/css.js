module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/css',
        transforms: [
            'attribute/cti',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'name/custom-kebab',
            'kbq-attribute/comment'
        ]
    });
};
