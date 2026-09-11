#!/usr/bin/env node
/**
 * Static server for the token playground. No dependencies — the playground is deliberately
 * framework-free so it can be lifted into the docs site as-is.
 *
 *   yarn playground            # http://localhost:4321
 *   PORT=5000 yarn playground
 *
 * Serves tools/playground at / and the built tokens at /tokens.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.resolve(HERE, '../../dist/design-tokens/web');
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.json5': 'text/plain; charset=utf-8'
};

if (!fs.existsSync(path.join(TOKENS, 'index.bundled.css'))) {
    console.error('✖ Tokens are not built yet. Run `yarn build` first.');
    process.exit(1);
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const isTokens = url.pathname.startsWith('/tokens/');
    const root = isTokens ? TOKENS : HERE;
    const relative = isTokens ? url.pathname.slice('/tokens/'.length) : url.pathname.slice(1) || 'index.html';
    const file = path.join(root, relative);

    // Keep the server inside the two directories it is meant to expose.
    if (!file.startsWith(root + path.sep) && file !== path.join(root, relative)) {
        res.writeHead(403).end('Forbidden');

        return;
    }

    fs.readFile(file, (err, body) => {
        if (err) {
            res.writeHead(404, { 'content-type': 'text/plain' }).end(`Not found: ${url.pathname}`);

            return;
        }

        res.writeHead(200, {
            'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
            'cache-control': 'no-store'
        }).end(body);
    });
});

server.listen(PORT, () => {
    console.log(`Koobiq token playground → http://localhost:${PORT}`);
    console.log('Serving tokens from dist/design-tokens/web — rerun `yarn build` after editing sources.');
});
