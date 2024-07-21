module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/palette',
        type: 'attribute',
        matcher: (prop) => prop.name === 'palette',
        transformer: () => ({ palette: true })
    });
};
