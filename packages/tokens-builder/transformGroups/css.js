module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransformGroup({
        name: 'kbq/css',
        transforms: [
            'attribute/cti',
            'kbq-attribute/size',
            'name/cti/kebab',
            'color/css',
            'kbq/prefix'
        ]
    });
};
