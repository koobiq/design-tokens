module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-scss/value',
        type: 'value',
        transformer: (token) => {
            if (token.value === '') {
                return null;
            }
            return token.value;
        }
    });
};
