const { getMapFromObj } = require('../formats/utils');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'kbq-scss/palette',
        formatter: function (dictionary) {
            return dictionary.allProperties.map((prop) => `\$${prop.name}: ${getMapFromObj(prop.value)};\n`).join('\n');
        }
    });
};
