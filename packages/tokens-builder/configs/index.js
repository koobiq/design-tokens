const { join } = require('path');
const scssConfig = require('./scss');
const jsConfig = require('./js');
const cssConfig = require('./css');

const filterObj = {
    options: {
        showFileHeader: true,
        fileHeader: 'customHeader'
    }
};

function filterOptions(platforms) {
    const platformObj = {};

    platforms.map(p => Object.assign(platformObj, p));

    Object.keys(platformObj).forEach((p) => {
        platformObj[p].files = platformObj[p].files.map(f => ({
            ...f,
            ...filterObj,
            options: {
                ...f.options ?? {},
                ...filterObj.options
            }
        }));
    });

    return platformObj;
}

function getSources(theme) {
    return theme.buildPath.map(pathName => {
        if (pathName.startsWith('@')) {
            return join('node_modules', pathName);
        }

        return pathName;
    });
}

function getConfigs(theme) {
    scssConfig.scss.buildPath = theme.outputPath;
    jsConfig.js.buildPath = theme.outputPath;
    cssConfig.css.buildPath = theme.outputPath;

    return filterOptions([scssConfig, jsConfig, cssConfig]);
}

module.exports = (theme) => {

    return {
        source: [...getSources(theme)],
        platforms: getConfigs(theme)
    };
};
