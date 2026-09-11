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
        // Typography presets are authored as DTCG `typography` composites, but every output
        // here is flat (--kbq-typography-headline-font-size, $typography-headline-font-size),
        // so they get expanded back into one token per sub-property. See the preprocessor for
        // why this isn't Style Dictionary's built-in `expand` option.
        // Shadows stay composite — `shadow/css/shorthand` renders them as one box-shadow.
        preprocessors: ['kbq/expand-typography'],
        // Token files are split across many outputs on purpose (palette.css, semantic-palette.css,
        // light/semantic-colors.css …) and they reference each other across those files. That is
        // exactly what `index.css` stitches back together, but Style Dictionary still warns about
        // every reference whose target was filtered out of the file being written.
        log: { warnings: 'disabled' }
    };
};
