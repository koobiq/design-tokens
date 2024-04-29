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
}

const updateVersion = (package, version) => {
    const packageContent = JSON.parse(readFileSync(`dist/${package}/package.json`, 'utf8'));
    packageContent.version = version;

    writeFileSync(`dist/${package}/package.json`, JSON.stringify(packageContent, undefined, 2))
}

const currentVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;

prepareTokens('design-tokens');
prepareTokens('tokens-builder');

updateVersion('tokens-builder', currentVersion);
updateVersion('design-tokens', currentVersion);
