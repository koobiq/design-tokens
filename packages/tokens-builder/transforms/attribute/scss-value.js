export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-scss/value',
        type: 'value',
        transform: (token, _platform, options) => {
            const value = options?.usesDtcg ? token.$value : token.value;

            return value === '' ? null : value;
        }
    });
};
