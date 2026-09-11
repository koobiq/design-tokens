import { join } from 'node:path';
import scssConfig from './scss.js';
import jsConfig from './js.js';
import cssConfig from './css.js';

const filterObj = {
    options: {
        showFileHeader: true,
        fileHeader: 'customHeader'
    }
};

function filterOptions(platforms) {
    const platformObj = {};

    platforms.map((p) => Object.assign(platformObj, p));

    Object.keys(platformObj).forEach((p) => {
        platformObj[p].files = platformObj[p].files.map((f) => ({
            ...f,
            ...filterObj,
            options: {
                ...(f.options ?? {}),
                ...filterObj.options
            }
        }));
    });

    return platformObj;
}

function getSources(theme) {
    return theme.buildPath.map((pathName) => {
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

export default (theme) => {
    return {
        source: [...getSources(theme)],
        platforms: getConfigs(theme),
        // Token files are split across many outputs on purpose (palette.css, semantic-palette.css,
        // light/semantic-colors.css …) and they reference each other across those files. That is
        // exactly what `index.css` stitches back together, but Style Dictionary still warns about
        // every reference whose target was filtered out of the file being written.
        log: { warnings: 'disabled' }
    };
};
