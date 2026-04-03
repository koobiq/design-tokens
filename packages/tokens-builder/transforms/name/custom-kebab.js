module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'name/custom-kebab',
        type: 'name',
        transformer: (token) => {
            const standardKebab = token.path
                .map((part) => part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
                .join('-');

            // for alpha colors, remove the dash between 'a' and the index
            return standardKebab.replace(/-a-(\d+)$/, '-a$1');
        }
    });
};
