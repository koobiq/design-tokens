import StyleDictionary from 'style-dictionary';
import getPlatformConfig from './configs/index.js';

// ==== Include custom transforms ====
import registerMdTypographyAttribute from './transforms/attribute/md-typography.js';
import registerTypographyAttribute from './transforms/attribute/typography.js';
import registerFontAttribute from './transforms/attribute/font.js';
import registerThemeAttributes from './transforms/attribute/theme.js';
import registerScssValue from './transforms/attribute/scss-value.js';
import registerDeprecationComment from './transforms/attribute/deprecation-comment.js';
import registerCustomKebab from './transforms/name/custom-kebab.js';

// ==== Include custom preprocessors ====
import registerExpandTypography from './preprocessors/expand-typography.js';

// ==== Include custom filters ====
import registerTypographyFilter from './filters/typography.js';
import registerMdTypographyFilter from './filters/md-typography.js';

// ==== Include custom transform groups ====
import registerScssGroup from './transformGroups/scss.js';
import registerCssGroup from './transformGroups/css.js';
import registerTsGroup from './transformGroups/ts.js';

// ==== Include custom formats ====
import registerTypographyFormat from './formats/typography.js';
import registerVariablesFormat from './formats/variables.js';

// ==== Include custom actions ====
import registerCssIndex from './actions/css-index.js';

registerMdTypographyAttribute(StyleDictionary);
registerTypographyAttribute(StyleDictionary);
registerFontAttribute(StyleDictionary);
registerThemeAttributes(StyleDictionary);
registerScssValue(StyleDictionary);
registerDeprecationComment(StyleDictionary);
registerCustomKebab(StyleDictionary);

registerExpandTypography(StyleDictionary);

registerTypographyFilter(StyleDictionary);
registerMdTypographyFilter(StyleDictionary);

registerScssGroup(StyleDictionary);
registerCssGroup(StyleDictionary);
registerTsGroup(StyleDictionary);

registerTypographyFormat(StyleDictionary);
registerVariablesFormat(StyleDictionary);

registerCssIndex(StyleDictionary);

StyleDictionary.registerFileHeader({
    name: 'customHeader',
    fileHeader: () => [`Do not edit directly`]
});

export default async (themeConfig) => {
    console.log('Build started...');
    console.log('==============================================');

    if (!themeConfig || themeConfig.length === 0) {
        console.error('Build Failed. Please set ThemeConfig, for example: ', {
            name: 'default-theme',
            // prettier-ignore
            buildPath: [
                `design-tokens/tokens/properties/**/*.json5`,
                `design-tokens/tokens/components/**/*.json5`
            ],
            outputPath: 'design-tokens/'
        });
        process.exit(1);
    }

    for (const theme of themeConfig) {
        console.log('themeConfig: ', theme);

        const config = getPlatformConfig(theme);
        const sd = new StyleDictionary(config);

        // One platform at a time, rather than sd.buildAllPlatforms().
        //
        // That helper runs every platform through a single Promise.all, while the "filtered out
        // token references" warning is counted in a module-level store that is not scoped to a
        // platform. The css platform switches that warning off on purpose — its files reference
        // each other across file boundaries — but with the platforms interleaved, a warning css
        // raised could be flushed, and thrown on, while scss or js was being written, where the
        // top-level `warnings: 'error'` still applies. Which platform got the blame came down to
        // how the file writes happened to interleave.
        //
        // Building sequentially keeps each warning with the platform that caused it.
        for (const name of Object.keys(config.platforms)) {
            await sd.buildPlatform(name);
        }
    }

    console.log('\n==============================================');
    console.log('\nBuild completed!');
};
