const fs = require('fs');
const path = require('node:path');

const HEADER = '/**\n * Do not edit directly\n */\n';

/**
 * Generates a pair of consumer entry points for a CSS platform:
 *
 *   index.css — thin file that `@import`s every curated token file
 *   index.bundled.css — the same files concatenated into a single stylesheet
 *
 * The list of files to include (and where the index is written) is read from the
 * platform's `index` config so each track can curate its own aggregate set:
 *
 *   css: {
 *       transformGroup: 'kbq/css',
 *       actions: ['kbq/css-index'],
 *       index: {
 *           dir: 'css',                 // where index files are written (relative to buildPath)
 *           files: ['css/font.css', …]  // token files to include (relative to buildPath)
 *       },
 *       files: [ … ]
 *   }
 */
module.exports = (StyleDictionary) => {
    StyleDictionary.registerAction({
        name: 'kbq/css-index',
        do: (_dictionary, config) => {
            if (!config.index) {
                return;
            }

            const { dir = '', files } = config.index;
            const buildPath = config.buildPath;
            const indexDir = path.join(buildPath, dir);

            const imports = files
                .map((dest) => path.relative(indexDir, path.join(buildPath, dest)).split(path.sep).join('/'))
                .map((rel) => `@import '${rel.startsWith('../') ? rel : `./${rel}`}';`)
                .join('\n');

            fs.writeFileSync(path.join(indexDir, 'index.css'), `${HEADER}\n${imports}\n`);

            // Merge all declarations into one block per selector, so `:root` / `.kbq-light` /
            // `.kbq-dark` aren't repeated. On duplicate properties the last one wins, matching
            // the `@import` order in index.css.
            const blockRegex = /([^{}]+)\{([^}]*)\}/g;
            const selectors = [];
            const declsBySelector = new Map();

            for (const dest of files) {
                const content = fs.readFileSync(path.join(buildPath, dest), 'utf8');
                let match;

                while ((match = blockRegex.exec(content)) !== null) {
                    const selector = match[1].trim();

                    if (!declsBySelector.has(selector)) {
                        selectors.push(selector);
                        declsBySelector.set(selector, new Map());
                    }

                    const decls = declsBySelector.get(selector);

                    for (const rawLine of match[2].split('\n')) {
                        const line = rawLine.trim();

                        if (!line) {
                            continue;
                        }

                        const property = line.match(/^(--[\w-]+)\s*:/);
                        // Re-insert so the last declaration wins and keeps its position.
                        const key = property ? property[1] : `@line-${decls.size}`;

                        decls.delete(key);
                        decls.set(key, line);
                    }
                }
            }

            const bundled = selectors
                .map((selector) => {
                    const body = [...declsBySelector.get(selector).values()].map((line) => `  ${line}`).join('\n');

                    return `${selector} {\n${body}\n}`;
                })
                .join('\n\n');

            fs.writeFileSync(path.join(indexDir, 'index.bundled.css'), `${HEADER}\n${bundled}\n`);
        },
        undo: () => {}
    });
};
