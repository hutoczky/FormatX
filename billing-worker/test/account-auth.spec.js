import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:test';
import { handlePublicAccountRequest, requireDownloadAccount } from '../src/public-account.js';

function request(path, init={}) {
  return new Request('https://formatxsuite.com'+path, { headers:{ Origin:'https://formatxsuite.com', ...(init.headers||{}) }, ...init });
}
async function register(email='user@example.com', remember=true) {
  const response=await handlePublicAccountRequest(request('/api/account/register',{
    method:'POST',
    body:JSON.stringify({display_name:'Teszt Felhasználó',email,password:'FormatX-Test-Password-2026',remember,privacy_consent:true}),
    headers:{'Content-Type':'application/json',Origin:'https://formatxsuite.com'}
  }),env);
  return response;
}
describe('public account download gate',()=>{
  it('registers securely and creates a persistent cookie only when requested',async()=>{
    const response=await register('remember@example.com',true);
    expect(response.status).toBe(201);
    const cookie=response.headers.get('Set-Cookie')||'';
    expect(cookie).toContain('fx_user_session=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=');
  });
  it('keeps non-remembered login as a browser-session cookie',async()=>{
    const response=await register('session@example.com',false);
    expect(response.status).toBe(201);
    expect(response.headers.get('Set-Cookie')||'').not.toContain('Max-Age=');
  });
  it('redirects anonymous download attempts to account login',async()=>{
    const response=await requireDownloadAccount(request('/download/multiplatform'),env);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/account/');
    expect(response.headers.get('Location')).toContain('next=');
  });
  it('allows an authenticated account through the download gate',async()=>{
    const response=await register('download@example.com',true);
    const cookie=(response.headers.get('Set-Cookie')||'').split(';')[0];
    const gate=await requireDownloadAccount(request('/download/multiplatform',{headers:{Cookie:cookie}}),env);
    expect(gate).toBeNull();
  });
});
