module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransformGroup({
        name: 'kbq/ts',
        transforms: ['attribute/cti', 'name/cti/pascal', 'size/px', 'color/hex', 'kbq-attribute/comment']
    });
};
