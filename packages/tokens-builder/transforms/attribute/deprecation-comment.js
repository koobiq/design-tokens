module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/comment',
        type: 'attribute',
        transformer: (token) => {
            if (token.deprecated && token.deprecated_comment) {
                const notice = `DEPRECATED: ${token.deprecated_comment}`;
                token.comment = token.comment ? `${notice} | ${token.comment}` : notice;
            }
        }
    });
};
