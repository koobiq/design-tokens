module.exports = (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'css-variables',
        matcher: (prop) => {
            return (
                !prop.attributes.font &&
                !prop.attributes.palette &&
                !prop.attributes.light &&
                !prop.attributes.dark &&
                !prop.attributes.font &&
                prop.type !== 'font'
            );
        }
    });

    StyleDictionary.registerFilter({
        name: 'css-variables-light',
        matcher: (prop) => prop.attributes.light && !prop.attributes.palette
    });

    StyleDictionary.registerFilter({
        name: 'css-variables-dark',
        matcher: (prop) => prop.attributes.dark && !prop.attributes.palette
    });

    StyleDictionary.registerFilter({
        name: 'css-variables-font',
        matcher: (prop) => prop.attributes.font || prop.type === 'font'
    });
};
