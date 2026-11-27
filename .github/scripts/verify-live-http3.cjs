const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const hosts = ['formatxsuite.com', 'www.formatxsuite.com'];
  const modes = [
    { name: 'HTTP/2 fallback', args: ['--disable-quic'], protocol: 'h2' },
    { name: 'HTTP/3 QUIC', args: ['--enable-quic', '--origin-to-force-quic-on=' + hosts.map(h => h + ':443').join(',')], protocol: 'h3' },
  ];
  const failures = [];
  for (const mode of modes) {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, headless: true, args: mode.args });
    try {
      for (const host of hosts) {
        const context = await browser.newContext();
        try {
          const page = await context.newPage();
          const cdp = await context.newCDPSession(page);
          await cdp.send('Network.enable');
          const observed = [];
          cdp.on('Network.responseReceived', e => {
            if (e.type === 'Document') observed.push({ url: e.response.url, protocol: e.response.protocol, status: e.response.status });
          });
          const response = await page.goto('https://' + host + '/api/net/ping?transport=' + Date.now(), { waitUntil: 'load', timeout: 25000 });
          assert.equal(response.status(), 200);
          const payload = JSON.parse(await response.text());
          assert.equal(payload.ok, true);
          const actual = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.nextHopProtocol);
          const sameHost = observed.some(e => new URL(e.url).hostname === host && (e.protocol === mode.protocol || (mode.protocol === 'h3' && /^h3-/.test(e.protocol))));
          console.log(JSON.stringify({ host, mode: mode.name, actual, edgeProtocol: payload.protocol, observed }));
          assert(sameHost, host + ' did not independently negotiate ' + mode.protocol);
          assert(actual === mode.protocol || (mode.protocol === 'h3' && /^h3-/.test(actual)), 'Unexpected navigation protocol: ' + actual);
        } catch (error) {
          failures.push(host + ' ' + mode.name + ': ' + error.message);
        } finally { await context.close(); }
      }
    } finally { await browser.close(); }
  }
  assert.equal(failures.length, 0, failures.join('\n'));
})().catch(error => { console.error(error); process.exitCode = 1; });
