const transform = require('style-dictionary/lib/common/transforms');

const unwrapObjectTransformer = (token) => {
    return Object.keys(token.value)
        .map((key) => {
            const subToken = token.value[key];
            const res = {
                ...subToken,
                filePath: token.filePath,
                path: [...token.path, key],
                name: `kbq-${[...token.path, key].join('-')}`,
                original: { value: subToken }
            }
            res.attributes = {...transform['attribute/cti'].transformer(res), font: true};
            return res;
        }, {})
}

const getMapFromObj = (object) => {
    const result = Object.keys(object)
        .map((key) => {
            if (key === 'contrast') {
                return `${key}: ${getMapFromObj(object[key])}`;
            }

            return `${key}: ${object[key].value},\n`;
        })
        .join('');

    return `(\n${result}\n)`;
}


module.exports = {
    unwrapObjectTransformer,
    getMapFromObj
};
