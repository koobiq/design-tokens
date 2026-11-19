export const isTypography = (token) => token.attributes.typography;

export default (StyleDictionary) => {
    StyleDictionary.registerFilter({
        name: 'typography',
        filter: isTypography
    });
};
