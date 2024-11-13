const StyleDictionary = require('style-dictionary');
const getPlatformConfig = require('./configs');

// ==== Include custom transforms ====
require('./transforms/attribute/md-typography')(StyleDictionary);
require('./transforms/attribute/typography')(StyleDictionary);
require('./transforms/attribute/palette')(StyleDictionary);
require('./transforms/attribute/prefix')(StyleDictionary);
require('./transforms/attribute/font')(StyleDictionary);
require('./transforms/attribute/theme')(StyleDictionary);
require('./transforms/attribute/scss-value')(StyleDictionary);

// ==== Include custom filters ====
require('./filters/palette')(StyleDictionary);
require('./filters/css-variables')(StyleDictionary);
require('./filters/color')(StyleDictionary);
require('./filters/typography')(StyleDictionary);
require('./filters/md-typography')(StyleDictionary);

// ==== Include custom transform groups ====
require('./transformGroups/scss')(StyleDictionary);
require('./transformGroups/css')(StyleDictionary);
require('./transformGroups/ts')(StyleDictionary);

// ==== Include custom formats ====
require('./formats/typography')(StyleDictionary);
require('./formats/palette')(StyleDictionary);
require('./formats/variables')(StyleDictionary);

// ==== Run build ====
console.log('Build started...');
console.log('==============================================');

module.exports = (themeConfig) => {
    StyleDictionary.registerFileHeader({
        name: 'customHeader',
        fileHeader: () => [`Do not edit directly`]
    });
    console.log('themeConfig: ', themeConfig);

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
        process.exit(0);
    }

    themeConfig.map((platform) => {
        // APPLY THE CONFIGURATION
        // Very important: the registration of custom transforms
        // needs to be done _before_ applying the configuration
        const StyleDictionaryExtended = StyleDictionary.extend(getPlatformConfig(platform));

        // FINALLY, BUILD ALL THE PLATFORMS
        StyleDictionaryExtended.buildAllPlatforms();
    });

    console.log('\n==============================================');
    console.log('\nBuild completed!');
};
