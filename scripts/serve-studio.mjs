/**
 * @module scripts/serve-studio
 * @description Small local static server for the studio and HTTP-only failure-injection checks.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
};

/** Starts a loopback-only server with an optional ephemeral port.
 * @param {number} [port=4173] Requested local port; zero selects a free port.
 * @returns {Promise<Object>} Server handle, base URL, and asynchronous close method.
 */
export async function startStudioServer(port = 4173) {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const file = path.resolve(
        root,
        '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname),
      );
      const relative = path.relative(root, file);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !types[path.extname(file)]) {
        response.writeHead(404).end('Not found');
        return;
      }
      const bytes = await fs.readFile(file);
      response
        .writeHead(200, { 'content-type': types[path.extname(file)], 'cache-control': 'no-store' })
        .end(bytes);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return {
    server,
    url: 'http://127.0.0.1:' + server.address().port + '/',
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const running = await startStudioServer(Number(process.env.PORT ?? process.argv[2] ?? 4173));
  console.log('Style Studio: ' + running.url);
}
