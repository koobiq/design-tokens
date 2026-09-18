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
        // Fail the build on transform errors instead of printing them. Without this a transform
        // that throws on a value (say a dimension transform meeting `letter-spacing: normal`)
        // is caught by Style Dictionary, quietly falls back to the untransformed value and only
        // logs — so the output would be silently wrong.
        //
        // This switch is read from two places: transform errors use the top-level `log`, while
        // the per-file "filtered out token references" warning uses `platform.log`. The css
        // platform overrides it to `disabled` (see configs/css.js) because those cross-file
        // references are deliberate.
        log: { warnings: 'error' }
    };
};
