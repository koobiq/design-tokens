export const isMdTypography = (token) => token.attributes['md-typography'];

export default (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'md-typography',
        filter: isMdTypography
    });
};
