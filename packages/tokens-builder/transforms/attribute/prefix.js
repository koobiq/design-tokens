module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq/prefix',
        type: 'attribute',
        transformer: (prop, options) => {
            const prefix = options.files[0].prefix ? `${options.files[0].prefix}-` : '';

            prop.name = `${prefix}${prop.name}`;
        }
    });
};
