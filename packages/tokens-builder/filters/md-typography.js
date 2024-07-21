module.exports = (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'md-typography',
        matcher: (prop) => prop.attributes['md-typography']
    });
};
