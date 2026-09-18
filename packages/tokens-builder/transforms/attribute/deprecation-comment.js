export default (StyleDictionary) => {
    StyleDictionary.registerTransform({
        name: 'kbq-attribute/comment',
        type: 'attribute',
        transform: (token, _platform, options) => {
            const deprecated = token.$deprecated ?? token.deprecated;

            if (!deprecated) return;

            const notice = `DEPRECATED: ${deprecated}`;

            // v5 renders `token.$description ?? token.comment` as the declaration comment, so in
            // DTCG mode the notice has to land on $description or it would be shadowed.
            if (options?.usesDtcg) {
                token.$description = token.$description ? `${notice} | ${token.$description}` : notice;
            } else {
                token.comment = token.comment ? `${notice} | ${token.comment}` : notice;
            }
        }
    });
};
