const transform = require('style-dictionary/lib/common/transforms');
const getPathFromName = require('style-dictionary/lib/utils/references/getPathFromName');
const createReferenceRegex = require('style-dictionary/lib/utils/references/createReferenceRegex');

const unwrapObjectTransformer = (token) => {
    return Object.keys(token.value).map((key) => {
        const subToken = token.value[key];
        const res = {
            ...subToken,
            filePath: token.filePath,
            path: [...token.path, key],
            name: `kbq-${[...token.path, key].join('-')}`,
            original: { value: subToken }
        };
        res.attributes = { ...transform['attribute/cti'].transformer(res), font: true };
        return res;
    }, {});
};

const resolvePaletteRef = (token, dictionary) => {
    const regex = createReferenceRegex({});

    const findPalette = (match, variable) => {
        const [category, item, ...pathName] = getPathFromName(variable);
        const pathToSemanticPalette = dictionary.tokens[category][item].palette.original.value.replace(/[{}]/g, '');
        return `{${pathToSemanticPalette}.${pathName[pathName.length - 1]}}`;
    };
    token.original.value = token.original.value.replace(regex, findPalette);
    return token;
};

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
};

const applyCustomTransformations = (dictionary) => {
    dictionary.allProperties = dictionary.allTokens = dictionary.allTokens
        .flatMap((token) => {
            if (typeof token.value === 'object' && token.type === 'font') {
                return unwrapObjectTransformer(token);
            }
            if (typeof token.original.value === 'string' && token.original.value.includes('palette.value')) {
                return resolvePaletteRef(token, dictionary);
            }
            return token;
        })
        .filter((token) => !token.attributes.palette);

    return dictionary.allTokens;
};

module.exports = {
    unwrapObjectTransformer,
    getMapFromObj,
    resolvePaletteRef,
    applyCustomTransformations
};
