import build from '../packages/tokens-builder/build.js';
import { cpSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';

await build([
    {
        name: 'design-tokens',
        buildPath: [
            `packages/design-tokens/web/properties/**/*.json5`,
            `packages/design-tokens/web/components/**/*.json5`
        ],
        outputPath: 'dist/design-tokens/web/'
    }
]);

const prepareTokens = (pkg) => {
    cpSync(`packages/${pkg}`, `dist/${pkg}`, { recursive: true });

    copyFileSync('./LICENSE', `dist/${pkg}/LICENSE`);
};

const updateVersion = (pkg, version) => {
    const packageContent = JSON.parse(readFileSync(`dist/${pkg}/package.json`, 'utf8'));
    packageContent.version = version;

    writeFileSync(`dist/${pkg}/package.json`, JSON.stringify(packageContent, undefined, 2));
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
