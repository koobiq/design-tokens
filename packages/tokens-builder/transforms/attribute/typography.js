export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/typography',
        type: 'attribute',
        filter: (token) => token.attributes.category === 'typography',
        transform: () => ({ typography: true })
    });
};
