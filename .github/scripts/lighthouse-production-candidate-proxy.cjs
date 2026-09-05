'use strict';

const http = require('node:http');

const UPSTREAM_HOST = '127.0.0.1';
const UPSTREAM_PORT = 8787;
const LISTEN_HOST = '127.0.0.1';
const LISTEN_PORT = 8788;
const CANONICAL = '<https://formatxsuite.com/>; rel="canonical"';
const MAX_RETRIES = 2;
const RETRY_STATUS = new Set([502, 503, 504]);
const RETRY_ERRORS = new Set(['ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'ETIMEDOUT']);
const agent = new http.Agent({ keepAlive: true, maxSockets: 32, maxFreeSockets: 8, timeout: 15000 });

function normalizedLinkHeader(value) {
  const parts = String(value || '')
    .split(/,(?=\s*<)/)
    .map(item => item.trim())
    .filter(Boolean)
    .filter(item => !/\brel\s*=\s*["']?canonical["']?/i.test(item));
  return [CANONICAL, ...parts].join(', ');
}
function retryableMethod(method) { return method === 'GET' || method === 'HEAD'; }
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const server = http.createServer((request, response) => {
  const requestBody = [];
  request.on('data', chunk => requestBody.push(chunk));
  request.on('end', () => {
    const body = Buffer.concat(requestBody);
    const forward = async attempt => {
      if (response.writableEnded) return;
      const headers = { ...request.headers, host: `${UPSTREAM_HOST}:${UPSTREAM_PORT}` };
      delete headers.connection;

      const upstream = http.request({
        hostname: UPSTREAM_HOST,
        port: UPSTREAM_PORT,
        method: request.method,
        path: request.url,
        headers,
        agent,
      }, upstreamResponse => {
        const chunks = [];
        upstreamResponse.on('data', chunk => chunks.push(chunk));
        upstreamResponse.on('end', async () => {
          const status = upstreamResponse.statusCode || 502;
          if (retryableMethod(request.method) && RETRY_STATUS.has(status) && attempt < MAX_RETRIES) {
            console.warn(`[candidate-proxy] retry ${attempt + 1}/${MAX_RETRIES} for ${request.method} ${request.url}: upstream HTTP ${status}`);
            await delay(80 * (attempt + 1));
            return forward(attempt + 1);
          }
          const nextHeaders = { ...upstreamResponse.headers };
          const contentType = String(nextHeaders['content-type'] || '');
          if (contentType.includes('text/html') && new URL(request.url, 'http://candidate.local').pathname === '/') {
            nextHeaders.link = normalizedLinkHeader(nextHeaders.link);
            nextHeaders['x-formatx-candidate-proxy'] = 'canonical-header-normalizer-only';
          }
          delete nextHeaders['content-length'];
          const payload = Buffer.concat(chunks);
          if (!response.headersSent) response.writeHead(status, upstreamResponse.statusMessage, nextHeaders);
          if (request.method === 'HEAD') response.end();
          else response.end(payload);
        });
      });
      upstream.setTimeout(15000, () => upstream.destroy(Object.assign(new Error('upstream timeout'), { code: 'ETIMEDOUT' })));
      upstream.on('error', async error => {
        if (retryableMethod(request.method) && RETRY_ERRORS.has(error.code) && attempt < MAX_RETRIES) {
          console.warn(`[candidate-proxy] retry ${attempt + 1}/${MAX_RETRIES} for ${request.method} ${request.url}: ${error.code || error.message}`);
          await delay(80 * (attempt + 1));
          return forward(attempt + 1);
        }
        console.error(`[candidate-proxy] terminal upstream error for ${request.method} ${request.url}:`, error);
        if (!response.headersSent) response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
        response.end(`Production candidate proxy upstream error: ${error.message}`);
      });
      if (body.length) upstream.end(body);
      else upstream.end();
    };
    void forward(0);
  });
});

server.keepAliveTimeout = 5000;
server.headersTimeout = 20000;
server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(`FormatX Lighthouse production-candidate proxy ready on http://${LISTEN_HOST}:${LISTEN_PORT}/`);
});

function shutdown() {
  agent.destroy();
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
