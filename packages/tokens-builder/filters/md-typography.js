export default (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'md-typography',
        filter: (token) => token.attributes['md-typography']
    });
};
