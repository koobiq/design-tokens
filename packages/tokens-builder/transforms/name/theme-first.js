const THEMES = ['light', 'dark'];

/**
 * The shadows keep the theme first in their Sass and JS names: `shadow.light.overflow.normal.top` is
 * `light-shadow-overflow-normal-top` and `LightShadowOverflowNormalTop`, as they were before the shadows
 * were grouped by theme. The CSS name drops the theme instead (name/custom-kebab).
 *
 * Runs after the platform's own name transform, and returns the name it was given for every other token.
 */
const themeFirst = (token) => {
    const { category, type } = token.attributes;

    if (category !== 'shadow' || !THEMES.includes(type)) return undefined;

    return [type, category, ...token.path.slice(2)];
};

const toPascal = (path) =>
    path
        .flatMap((part) => part.split('-'))
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq/name/theme-first-kebab',
        type: 'name',
        transform: (token) => {
            const path = themeFirst(token);

            return path ? path.join('-') : token.name;
        }
    });

    StyleDictionary.registerTransform({
        name: 'kbq/name/theme-first-pascal',
        type: 'name',
        transform: (token) => {
            const path = themeFirst(token);

            return path ? toPascal(path) : token.name;
        }
    });
};
