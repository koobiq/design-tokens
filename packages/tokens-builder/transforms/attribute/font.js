export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/font',
        type: 'attribute',
        filter: ({ attributes }) => {
            return (attributes.category === 'markdown' && attributes.item === 'font') || attributes.type === 'font';
        },
        transform: () => ({ font: true })
    });
};
