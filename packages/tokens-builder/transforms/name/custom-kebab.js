const toKebab = (path) => {
    const standardKebab = path
        .map((part) =>
            part
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .replace(/"/g, '')
                .replace(/[\s.]+/g, '-')
                .toLowerCase()
        )
        .join('-');

    // for alpha colors, remove the dash between 'a' and the index
    return standardKebab.replace(/-a-(\d+)$/, '-a$1');
};

export default (StyleDictionary) => {
    // Strips 'light'/'dark' when used as the category segment (e.g. shadow.light.card →
    // shadow-card), so theme-scoped tokens don't carry the theme in their variable name —
    // the theme lives in the `.kbq-light` / `.kbq-dark` selector instead.
    StyleDictionary.registerTransform({
        name: 'name/custom-kebab',
        type: 'name',
        transform: (token, platform) => {
            const path =
                token.attributes.category === 'light' || token.attributes.category === 'dark'
                    ? token.path.filter((part) => part !== 'light' && part !== 'dark')
                    : token.path;

            return toKebab(platform?.prefix ? [platform.prefix, ...path] : path);
        }
    });
};
