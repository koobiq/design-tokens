module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/size',
        type: 'attribute',
        matcher: (prop) => prop.attributes.type === 'size',
        transformer: () => ({ size: true })
    });
};
