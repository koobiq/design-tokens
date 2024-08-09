module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/light',
        type: 'attribute',
        matcher: ({ attributes }) => {
            return (attributes.category === 'markdown' && attributes.item === 'light') || attributes.type === 'light';
        },
        transformer: () => ({ light: true })
    });

    StyleDictionary.registerTransform({
        name: 'kbq-attribute/dark',
        type: 'attribute',
        matcher: ({ attributes }) => {
            return (attributes.category === 'markdown' && attributes.item === 'dark') || attributes.type === 'dark';
        },
        transformer: () => ({ dark: true })
    });
};
