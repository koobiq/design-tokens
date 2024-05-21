module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/font',
        type: 'attribute',
        matcher: ({ attributes }) => {
            return (attributes.category === 'markdown' && attributes.item === 'font') || attributes.type === 'font';
        },
        transformer: () => ({ font: true })
    });
};
