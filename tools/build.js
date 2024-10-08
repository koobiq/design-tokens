const build = require('../packages/tokens-builder/build');

build([
    {
        name: 'design-tokens',
        buildPath: [
            `packages/design-tokens/web/properties/**/*.json5`,
            `packages/design-tokens/web/components/**/*.json5`
        ],
        outputPath: 'dist/design-tokens/web/'
    }
]);

const { copySync, copyFileSync, writeFileSync, readFileSync } = require('fs-extra');

const prepareTokens = (package) => {
    copySync(`packages/${package}`, `dist/${package}`);

    copyFileSync('./LICENSE', `dist/${package}/LICENSE`);
};

const updateVersion = (package, version) => {
    const packageContent = JSON.parse(readFileSync(`dist/${package}/package.json`, 'utf8'));
    packageContent.version = version;

    writeFileSync(`dist/${package}/package.json`, JSON.stringify(packageContent, undefined, 2));
};

const updateTokensPackage = () => {
    const packagePath = 'dist/design-tokens/package.json';
    const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
    const exportsConfig = {
        ...packageContent.exports,
        './*': {
            default: './*'
        },
        '.': {
            types: './web/js/index.d.ts',
            require: './web/js/index.js',
            import: './web/js/index.mjs'
        }
    };

    packageContent.types = 'web/js/index.d.ts';
    packageContent.main = 'web/js/index.js';
    packageContent.module = 'web/js/index.mjs';
    packageContent.exports = exportsConfig;

    writeFileSync(packagePath, JSON.stringify(packageContent, undefined, 2));
};

const currentVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;

prepareTokens('design-tokens');
prepareTokens('tokens-builder');

updateVersion('tokens-builder', currentVersion);
updateVersion('design-tokens', currentVersion);

updateTokensPackage();
