module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-scss/value',
        type: 'value',
        transformer: (token) => {
            if (typeof token.value === 'string' && !token.value) {
                return null;
            }
            return token.value;
        }
    });
};
