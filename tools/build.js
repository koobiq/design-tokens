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

const { copySync, copyFileSync, writeFileSync, readFileSync, renameSync } = require('fs-extra');

const prepareTokens = (package) => {
    copySync(`packages/${package}`, `dist/${package}`);

    copyFileSync('./LICENSE', `dist/${package}/LICENSE`);
}

const updateVersion = (package, version) => {
    const packageContent = JSON.parse(readFileSync(`dist/${package}/package.json`, 'utf8'));
    packageContent.version = version;

    writeFileSync(`dist/${package}/package.json`, JSON.stringify(packageContent, undefined, 2))
}

const updateTokensPackage = () => {
    const packagePath = 'dist/design-tokens/package.json';
    const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
    const exportsConfig = {
        ...packageContent.exports,
        './*': {
            require: './web/js/*',
            import: './web/js/*',
            default: './*'
        },
        '.': {
            require: './web/js/index.cjs',
            import: './web/js/index.mjs',
            default: './web/js/index.mjs'
        }
    }

    packageContent.types = "web/index.d.ts";
    packageContent.module = "web/js/index.mjs";
    packageContent.exports = exportsConfig;

    writeFileSync(packagePath, JSON.stringify(packageContent, undefined, 2))
}

const currentVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;

prepareTokens('design-tokens');
prepareTokens('tokens-builder');

updateVersion('tokens-builder', currentVersion);
updateVersion('design-tokens', currentVersion);

renameSync('dist/design-tokens/web/js/index.js', 'dist/design-tokens/web/js/index.mjs');
updateTokensPackage();
