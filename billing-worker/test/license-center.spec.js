import { describe, expect, it } from 'vitest';
import { handleLicenseCenterRequest } from '../src/license-center.js';

const baseEnv = {
  LICENSE_DB: {},
  LICENSE_PEPPER: 'test-pepper-that-is-longer-than-thirty-two-characters',
  ADMIN_EMAILS: 'owner@example.com',
};

describe('FormatX website license center', () => {
  it('leaves unrelated website requests to the existing production worker', async () => {
    const response = await handleLicenseCenterRequest(new Request('https://www.formatxsuite.com/'), baseEnv);
    expect(response).toBeNull();
  });

  it('returns a public license API health response', async () => {
    const response = await handleLicenseCenterRequest(new Request('https://www.formatxsuite.com/api/license/health'), baseEnv);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe('formatx-license-center');
  });

  it('serves the hidden fallback owner login without exposing it on the public home page', async () => {
    const response = await handleLicenseCenterRequest(new Request('https://www.formatxsuite.com/fx-owner-license/login', {
      headers: { Accept: 'text/html' },
    }), baseEnv);
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    expect(await response.text()).toContain('Tulajdonosi licenckezelő');
  });

  it('redirects an unauthenticated admin page request to the hidden login path', async () => {
    const response = await handleLicenseCenterRequest(new Request('https://www.formatxsuite.com/fx-owner-license/', {
      headers: { Accept: 'text/html' },
    }), baseEnv);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/fx-owner-license/login');
  });
});
