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

module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'name/custom-kebab',
        type: 'name',
        transformer: (token) => toKebab(token.path)
    });

    // Same as custom-kebab but strips 'light'/'dark' when used as the type
    // segment (e.g. shadow.light.card → shadow-card).
    // Used for the new palette output so theme-scoped shadows don't carry
    // the theme prefix in their variable name.
    StyleDictionary.registerTransform({
        name: 'name/custom-kebab-strip-theme',
        type: 'name',
        transformer: (token) => {
            const path =
                token.attributes.category === 'light' || token.attributes.category === 'dark'
                    ? token.path.filter((part) => part !== 'light' && part !== 'dark')
                    : token.path;

            return toKebab(path);
        }
    });
};
