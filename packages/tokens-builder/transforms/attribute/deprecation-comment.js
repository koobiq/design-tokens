module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/comment',
        type: 'attribute',
        transformer: (token) => {
            if (!token.deprecated) return;

            const notice = `DEPRECATED: ${token.deprecated}`;
            token.comment = token.comment ? `${notice} | ${token.comment}` : notice;
        }
    });
};
