'use strict';

const http = require('node:http');

const UPSTREAM_HOST = '127.0.0.1';
const UPSTREAM_PORT = 8787;
const LISTEN_HOST = '127.0.0.1';
const LISTEN_PORT = 8788;
const CANONICAL = '<https://formatxsuite.com/>; rel="canonical"';

const server = http.createServer((request, response) => {
  const headers = { ...request.headers, host: `${UPSTREAM_HOST}:${UPSTREAM_PORT}` };
  const upstream = http.request({
    hostname: UPSTREAM_HOST,
    port: UPSTREAM_PORT,
    method: request.method,
    path: request.url,
    headers,
  }, upstreamResponse => {
    const nextHeaders = { ...upstreamResponse.headers };
    const contentType = String(nextHeaders['content-type'] || '');
    if (contentType.includes('text/html') && new URL(request.url, 'http://candidate.local').pathname === '/') {
      nextHeaders.link = CANONICAL;
      nextHeaders['x-formatx-candidate-proxy'] = 'canonical-header-normalizer-only';
    }
    response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.statusMessage, nextHeaders);
    upstreamResponse.pipe(response);
  });
  upstream.on('error', error => {
    if (!response.headersSent) response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(`Production candidate proxy upstream error: ${error.message}`);
  });
  request.pipe(upstream);
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(`FormatX Lighthouse production-candidate proxy ready on http://${LISTEN_HOST}:${LISTEN_PORT}/`);
});

function shutdown() { server.close(() => process.exit(0)); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
