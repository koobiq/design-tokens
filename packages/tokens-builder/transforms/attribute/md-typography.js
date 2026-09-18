export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/md-typography',
        type: 'attribute',
        filter: (token) => token.attributes.category === 'md-typography',
        transform: () => ({ 'md-typography': true })
    });
};
