import { describe, expect, it } from 'vitest';
import { handleSpeedTestRequest, SPEEDTEST_LIMITS } from '../src/speedtest-api.js';

describe('FormatX native speed test API', () => {
  it('ignores unrelated routes', async () => {
    const response = await handleSpeedTestRequest(new Request('https://formatxsuite.com/api/health'), {});
    expect(response).toBeNull();
  });

  it('returns a one-byte no-store ping response', async () => {
    const response = await handleSpeedTestRequest(new Request('https://formatxsuite.com/api/speedtest/ping'), {});
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('X-FormatX-Speedtest')).toBe('r1800-edge');
    expect((await response.arrayBuffer()).byteLength).toBe(1);
  });

  it('caps download payloads and streams the requested bytes', async () => {
    const requested = 192 * 1024;
    const response = await handleSpeedTestRequest(
      new Request(`https://formatxsuite.com/api/speedtest/download?bytes=${requested}`),
      {},
    );
    expect(response.status).toBe(200);
    expect(Number(response.headers.get('Content-Length'))).toBe(requested);
    expect((await response.arrayBuffer()).byteLength).toBe(requested);

    const capped = await handleSpeedTestRequest(
      new Request('https://formatxsuite.com/api/speedtest/download?bytes=999999999'),
      {},
    );
    expect(Number(capped.headers.get('Content-Length'))).toBe(SPEEDTEST_LIMITS.maxDownloadBytes);
  });

  it('counts upload bytes without persisting payload data', async () => {
    const payload = new Uint8Array(256 * 1024);
    const response = await handleSpeedTestRequest(new Request('https://formatxsuite.com/api/speedtest/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: payload,
    }), {});
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.received_bytes).toBe(payload.byteLength);
  });

  it('rejects oversized declared uploads', async () => {
    const response = await handleSpeedTestRequest(new Request('https://formatxsuite.com/api/speedtest/upload', {
      method: 'POST',
      headers: { 'Content-Length': String(SPEEDTEST_LIMITS.maxUploadBytes + 1) },
      body: new Uint8Array([1]),
    }), {});
    expect(response.status).toBe(413);
  });

  it('rejects cross-site browser requests', async () => {
    const response = await handleSpeedTestRequest(new Request('https://formatxsuite.com/api/speedtest/ping', {
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    }), {});
    expect(response.status).toBe(403);
  });
});
