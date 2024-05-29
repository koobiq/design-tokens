module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransformGroup({
        name: 'kbq/css',
        transforms: [
            'attribute/cti',
            'kbq-attribute/palette',
            'kbq-attribute/font',
            'name/cti/kebab',
            'color/css',
            'kbq/prefix'
        ]
    });
};
