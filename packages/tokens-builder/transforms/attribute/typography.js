module.exports = (StyleDictionary) => {

    StyleDictionary.registerTransform({
        name: 'kbq-attribute/typography',
        type: 'attribute',
        matcher: (prop) => prop.attributes.category === 'typography',
        transformer: () => ({ typography: true })
    });
};
