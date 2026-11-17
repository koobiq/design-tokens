import { join } from 'node:path';
import scssConfig from './scss.js';
import jsConfig from './js.js';
import cssConfig from './css.js';
import { isPrivate } from '../filters/private.js';

const filterObj = {
    options: {
        showFileHeader: true,
        fileHeader: 'customHeader'
    }
};

/**
 * Composes privacy into a file's filter. Style Dictionary has no platform-level filter, so this runs
 * once for every file of every platform: a private token ships in no file, on any platform.
 *
 * A filter has to be a function here, because a filter given by name would have to be looked up in
 * the Style Dictionary instance, which this module does not have.
 */
const publicOnly = (filter) => {
    if (filter === undefined) return (token) => !isPrivate(token);
    if (typeof filter === 'function') return (token, options) => !isPrivate(token) && filter(token, options);

    throw new Error(`A file filter must be a function, so that privacy can be composed into it: ${filter}`);
};

function filterOptions(platforms) {
    const platformObj = {};

    platforms.map((p) => Object.assign(platformObj, p));

    Object.keys(platformObj).forEach((p) => {
        platformObj[p] = {
            ...platformObj[p],
            files: platformObj[p].files.map((f) => ({
                ...f,
                ...filterObj,
                filter: publicOnly(f.filter),
                options: {
                    ...(f.options ?? {}),
                    ...filterObj.options
                }
            }))
        };
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
        // Shadows stay composite — `shadow/css/shorthand` renders them as one box-shadow. Layers with
        // a transparent color are dropped first (kbq/drop-transparent-shadow-layers).
        // Typography is expanded first, so that the sub-properties of a private composite are private
        // tokens of their own. Then private references are replaced with public aliases or values
        // (kbq/private), before transparent layers are dropped and the standard transforms run.
        preprocessors: ['kbq/expand-typography', 'kbq/private', 'kbq/drop-transparent-shadow-layers'],
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
