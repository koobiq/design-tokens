module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/md-typography',
        type: 'attribute',
        matcher: (prop) => prop.attributes.category === 'md-typography',
        transformer: () => ({ 'md-typography': true })
    });
};
