module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/ts',
        transforms: [
            'attribute/cti',
            'name/cti/pascal',
            'kbq-attribute/palette',
            'size/px',
            'color/hex',
            'kbq-attribute/comment'
        ]
    });
};
