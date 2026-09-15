export default (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'typography',
        filter: (token) => token.attributes.typography
    });
};
