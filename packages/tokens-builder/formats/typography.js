function processJsonNode(obj, depth, usesDtcg) {
    let output = '';
    const valueKey = usesDtcg ? '$value' : 'value';

    if (Object.hasOwn(obj, valueKey)) {
        output += `$${obj.name}`;
    } else {
        output += '(\n';
        output += Object.keys(obj)
            .map((newKey) => {
                const newProp = obj[newKey];
                const indent = '  '.repeat(depth + 1);

                return `${indent}'${newKey}': ${processJsonNode(newProp, depth + 1, usesDtcg)}`;
            })
            .join(',\n');

        output += '\n' + '  '.repeat(depth) + ')';
    }

    return output;
}

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-scss/typography',
        format: function ({ dictionary, file, options = {} }) {
            const { usesDtcg } = options;

            const string = dictionary.allTokens
                .map((token) => {
                    const raw = usesDtcg ? token.$value : token.value;
                    const value = token.attributes.category === 'asset' ? `"${raw}"` : raw;
                    const comment = usesDtcg ? (token.$description ?? token.comment) : token.comment;

                    return `$${token.name}: ${value};${comment ? ` // ${comment}` : ''}\n`;
                })
                .join('');

            return string + `\n$${file.mapName || 'tokens'}: ${processJsonNode(dictionary.tokens, 0, usesDtcg)};\n`;
        }
    });
};
