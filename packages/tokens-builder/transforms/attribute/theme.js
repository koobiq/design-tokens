export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/light',
        type: 'attribute',
        filter: ({ attributes }) => {
            return (
                (attributes.category === 'markdown' && attributes.item === 'light') ||
                attributes.type === 'light' ||
                attributes.category === 'light'
            );
        },
        transform: () => ({ light: true })
    });

    StyleDictionary.registerTransform({
        name: 'kbq-attribute/dark',
        type: 'attribute',
        filter: ({ attributes }) => {
            return (
                (attributes.category === 'markdown' && attributes.item === 'dark') ||
                attributes.type === 'dark' ||
                attributes.category === 'dark'
            );
        },
        transform: () => ({ dark: true })
    });
};
