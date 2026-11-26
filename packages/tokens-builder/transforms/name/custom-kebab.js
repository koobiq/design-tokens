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

const THEMES = ['light', 'dark'];

// A theme is the category of a token (light.background.card) or, for the shadows, its type (shadow.light.card).
const isThemeScoped = ({ category, type }) =>
    THEMES.includes(category) || (category === 'shadow' && THEMES.includes(type));

export default (StyleDictionary) => {
    // Strips 'light'/'dark' from a theme-scoped token (e.g. shadow.light.card → shadow-card), so the
    // theme does not end up in its variable name — the theme lives in the `.kbq-light` / `.kbq-dark`
    // selector instead.
    StyleDictionary.registerTransform({
        name: 'name/custom-kebab',
        type: 'name',
        transform: (token, platform) => {
            const path = isThemeScoped(token.attributes)
                ? token.path.filter((part) => !THEMES.includes(part))
                : token.path;

            return toKebab(platform?.prefix ? [platform.prefix, ...path] : path);
        }
    });
};
