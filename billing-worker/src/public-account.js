const ACCOUNT_ROOT = '/account';
const ACCOUNT_API = '/api/account';
const SESSION_COOKIE = 'fx_user_session';
const PASSWORD_ITERATIONS = 600_000;
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;
const MAX_BODY_BYTES = 16 * 1024;
let schemaPromise = null;

const encoder = new TextEncoder();

export async function handlePublicAccountRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === ACCOUNT_ROOT) {
    return Response.redirect(new URL(ACCOUNT_ROOT + '/' + url.search, request.url).toString(), 308);
  }

  if (path === ACCOUNT_ROOT + '/login' || path === ACCOUNT_ROOT + '/register') {
    const target = new URL(ACCOUNT_ROOT + '/', request.url);
    target.search = url.search;
    target.searchParams.set('mode', path.endsWith('/register') ? 'register' : 'login');
    return Response.redirect(target.toString(), 302);
  }

  if (path === ACCOUNT_ROOT + '/' && (request.method === 'GET' || request.method === 'HEAD')) {
    return serveAccountAsset(request, env, '/account/index.html', 'text/html; charset=utf-8', true);
  }
  if (path === ACCOUNT_ROOT + '/account.css' && (request.method === 'GET' || request.method === 'HEAD')) {
    return serveAccountAsset(request, env, '/account/account.css', 'text/css; charset=utf-8');
  }
  if (path === ACCOUNT_ROOT + '/account.js' && (request.method === 'GET' || request.method === 'HEAD')) {
    return serveAccountAsset(request, env, '/account/account.js', 'text/javascript; charset=utf-8');
  }

  if (!path.startsWith(ACCOUNT_API + '/')) return null;
  if (!env.LICENSE_DB) return json({ ok:false, error:'account_database_unavailable' }, 503);

  await ensureSchema(env.LICENSE_DB);

  if (path === ACCOUNT_API + '/me' && request.method === 'GET') {
    const session = await readSession(request, env.LICENSE_DB);
    if (!session) return json({ ok:true, authenticated:false });
    return json({
      ok:true,
      authenticated:true,
      user:{ id:session.user_id, email:session.email, display_name:session.display_name },
      remember:Boolean(session.remember),
      expires_at:session.expires_at,
    });
  }

  if (path === ACCOUNT_API + '/register' && request.method === 'POST') {
    const blocked = await enforceMutationOrigin(request);
    if (blocked) return blocked;
    const limited = await rateLimit(request, env, 'register');
    if (limited) return limited;
    return registerAccount(request, env.LICENSE_DB);
  }

  if (path === ACCOUNT_API + '/login' && request.method === 'POST') {
    const blocked = await enforceMutationOrigin(request);
    if (blocked) return blocked;
    const limited = await rateLimit(request, env, 'login');
    if (limited) return limited;
    return loginAccount(request, env.LICENSE_DB);
  }

  if (path === ACCOUNT_API + '/logout' && request.method === 'POST') {
    const blocked = await enforceMutationOrigin(request);
    if (blocked) return blocked;
    return logoutAccount(request, env.LICENSE_DB);
  }

  return json({ ok:false, error:'not_found' }, 404);
}

export async function requireDownloadAccount(request, env) {
  if (!env.LICENSE_DB) {
    return new Response('A felhasználói fiókszolgáltatás jelenleg nem érhető el.', {
      status:503,
      headers:{ 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' },
    });
  }

  const token = cookieValue(request.headers.get('Cookie') || '', SESSION_COOKIE);
  if (token) {
    await ensureSchema(env.LICENSE_DB);
    const session = await readSession(request, env.LICENSE_DB);
    if (session) return null;
  }

  const url = new URL(request.url);
  const next = safeNext(url.pathname + url.search);
  const target = new URL(ACCOUNT_ROOT + '/', url.origin);
  target.searchParams.set('mode', 'login');
  target.searchParams.set('next', next);
  target.searchParams.set('reason', 'download');
  return Response.redirect(target.toString(), 302);
}

async function serveAccountAsset(request, env, path, contentType, html=false) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
    return new Response('A FormatX fiókfelület jelenleg nem érhető el.', {
      status:503,
      headers:{ 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' },
    });
  }
  const assetUrl = new URL(path, request.url);
  const upstream = await env.ASSETS.fetch(new Request(assetUrl, { method:request.method, headers:request.headers }));
  if (!upstream.ok) return upstream;
  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', html ? 'no-store, max-age=0' : 'public, max-age=300');
  headers.set('X-Content-Type-Options','nosniff');
  if (html) headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status:upstream.status,
    statusText:upstream.statusText,
    headers,
  });
}

async function registerAccount(request, db) {
  const body = await readJson(request);
  if (!body) return json({ ok:false, error:'invalid_json' }, 400);

  const displayName = cleanText(body.display_name, 120);
  const email = normaliseEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const remember = body.remember === true;
  const consent = body.privacy_consent === true;

  if (!displayName || displayName.length < 2) return json({ ok:false, error:'invalid_name' }, 400);
  if (!validEmail(email)) return json({ ok:false, error:'invalid_email' }, 400);
  if (!validPassword(password)) return json({ ok:false, error:'weak_password' }, 400);
  if (!consent) return json({ ok:false, error:'privacy_consent_required' }, 400);

  const existing = await db.prepare('SELECT id FROM public_accounts WHERE email = ?1 LIMIT 1').bind(email).first();
  if (existing) return json({ ok:false, error:'email_already_registered' }, 409);

  const id = crypto.randomUUID();
  const salt = randomBytes(24);
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  const now = new Date().toISOString();

  try {
    await db.prepare(
      `INSERT INTO public_accounts
       (id,email,display_name,password_salt,password_hash,password_iterations,status,created_at,updated_at,last_login_at,privacy_accepted_at,terms_accepted_at)
       VALUES (?1,?2,?3,?4,?5,?6,'active',?7,?7,?7,?7,?7)`
    ).bind(id,email,displayName,base64url(salt),base64url(hash),PASSWORD_ITERATIONS,now).run();
  } catch (error) {
    if (/unique|constraint/i.test(String(error?.message || error))) {
      return json({ ok:false, error:'email_already_registered' }, 409);
    }
    throw error;
  }

  return createSessionResponse(request, db, { id, email, display_name:displayName }, remember, 201);
}

async function loginAccount(request, db) {
  const body = await readJson(request);
  if (!body) return json({ ok:false, error:'invalid_json' }, 400);

  const email = normaliseEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const remember = body.remember === true;

  if (!validEmail(email) || !password) return json({ ok:false, error:'invalid_credentials' }, 401);

  const account = await db.prepare(
    `SELECT id,email,display_name,password_salt,password_hash,password_iterations,status
     FROM public_accounts WHERE email = ?1 LIMIT 1`
  ).bind(email).first();

  if (!account || account.status !== 'active') {
    await slowFailure();
    return json({ ok:false, error:'invalid_credentials' }, 401);
  }

  const salt = base64urlDecode(account.password_salt);
  const expected = base64urlDecode(account.password_hash);
  const derived = await derivePassword(password, salt, Number(account.password_iterations) || PASSWORD_ITERATIONS, expected.length);
  if (!constantTimeEqual(derived, expected)) {
    return json({ ok:false, error:'invalid_credentials' }, 401);
  }

  await db.prepare('UPDATE public_accounts SET last_login_at = ?1, updated_at = ?1 WHERE id = ?2')
    .bind(new Date().toISOString(), account.id).run();

  return createSessionResponse(request, db, account, remember, 200);
}

async function createSessionResponse(request, db, account, remember, status) {
  const rawToken = randomToken(32);
  const tokenHash = await sha256Hex(rawToken);
  const now = new Date();
  const ttlMs = remember ? REMEMBER_DAYS * 86400000 : SESSION_HOURS * 3600000;
  const expires = new Date(now.getTime() + ttlMs);
  const userAgentHash = await sha256Hex(request.headers.get('User-Agent') || '');

  await db.prepare(
    `INSERT INTO public_account_sessions
     (id,account_id,token_hash,remember,created_at,last_seen_at,expires_at,user_agent_hash,revoked_at)
     VALUES (?1,?2,?3,?4,?5,?5,?6,?7,NULL)`
  ).bind(crypto.randomUUID(),account.id,tokenHash,remember?1:0,now.toISOString(),expires.toISOString(),userAgentHash).run();

  const headers = new Headers({
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
  });
  headers.append('Set-Cookie', sessionCookie(rawToken, remember, Math.floor(ttlMs/1000)));
  return new Response(JSON.stringify({
    ok:true,
    authenticated:true,
    user:{ id:account.id, email:account.email, display_name:account.display_name },
    remember,
    expires_at:expires.toISOString(),
  }), { status, headers });
}

async function logoutAccount(request, db) {
  const token = cookieValue(request.headers.get('Cookie') || '', SESSION_COOKIE);
  if (token) {
    const tokenHash = await sha256Hex(token);
    await db.prepare('UPDATE public_account_sessions SET revoked_at = ?1 WHERE token_hash = ?2 AND revoked_at IS NULL')
      .bind(new Date().toISOString(), tokenHash).run();
  }
  const headers = new Headers({
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
  });
  headers.append('Set-Cookie', clearSessionCookie());
  return new Response(JSON.stringify({ ok:true, authenticated:false }), { status:200, headers });
}

async function readSession(request, db) {
  const token = cookieValue(request.headers.get('Cookie') || '', SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await db.prepare(
    `SELECT s.id AS session_id,s.account_id AS user_id,s.remember,s.expires_at,
            a.email,a.display_name,a.status
     FROM public_account_sessions s
     JOIN public_accounts a ON a.id=s.account_id
     WHERE s.token_hash=?1 AND s.revoked_at IS NULL
     LIMIT 1`
  ).bind(tokenHash).first();
  if (!row || row.status !== 'active') return null;

  const expires = Date.parse(row.expires_at || '');
  if (!Number.isFinite(expires) || expires <= Date.now()) {
    await db.prepare('UPDATE public_account_sessions SET revoked_at=?1 WHERE id=?2')
      .bind(new Date().toISOString(), row.session_id).run();
    return null;
  }

  await db.prepare('UPDATE public_account_sessions SET last_seen_at=?1 WHERE id=?2')
    .bind(new Date().toISOString(), row.session_id).run();
  return row;
}

async function ensureSchema(db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async()=>{
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS public_accounts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_iterations INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login_at TEXT,
        privacy_accepted_at TEXT NOT NULL,
        terms_accepted_at TEXT NOT NULL
      )`
    ).run();
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS public_account_sessions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        remember INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        user_agent_hash TEXT,
        revoked_at TEXT,
        FOREIGN KEY(account_id) REFERENCES public_accounts(id) ON DELETE CASCADE
      )`
    ).run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_public_account_sessions_account ON public_account_sessions(account_id,expires_at)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_public_account_sessions_token ON public_account_sessions(token_hash)').run();
  })().catch(error=>{ schemaPromise=null; throw error; });
  return schemaPromise;
}

async function enforceMutationOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const url = new URL(request.url);
  if (origin === url.origin) return null;
  return json({ ok:false, error:'origin_not_allowed' }, 403);
}

async function rateLimit(request, env, action) {
  const limiter = env.PUBLIC_API_RATE_LIMIT || env.PROJECT_AI_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') return null;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await sha256Hex('formatx-account|' + action + '|' + ip);
  const result = await limiter.limit({ key:key.slice(0,32) });
  if (result.success) return null;
  return json({ ok:false, error:'rate_limited' }, 429, { 'Retry-After':'60' });
}

async function readJson(request) {
  const length = Number(request.headers.get('Content-Length') || '0');
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) return null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return null;
    return JSON.parse(text || '{}');
  } catch (_) {
    return null;
  }
}

function json(payload, status=200, extra={}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      ...extra,
    },
  });
}

function cleanText(value,max) {
  return String(value || '').trim().replace(/\s+/g,' ').slice(0,max);
}
function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0,254);
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
function validPassword(value) {
  return typeof value === 'string' && value.length >= 10 && value.length <= 128;
}
function safeNext(value) {
  const raw = String(value || '');
  return /^\/download\/(?:multiplatform|android|android-native-beta)(?:\?.*)?$/.test(raw)
    ? raw
    : '/scifi-ui/downloads/';
}

function sessionCookie(token, remember, maxAge) {
  const parts = [
    SESSION_COOKIE + '=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ];
  if (remember) parts.push('Max-Age=' + maxAge);
  return parts.join('; ');
}
function clearSessionCookie() {
  return SESSION_COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
function cookieValue(header, name) {
  for (const part of String(header || '').split(';')) {
    const [key,...rest] = part.trim().split('=');
    if (key === name) {
      try { return decodeURIComponent(rest.join('=')); } catch (_) { return rest.join('='); }
    }
  }
  return '';
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}
function randomToken(length) {
  return base64url(randomBytes(length));
}
async function derivePassword(password, salt, iterations, length=32) {
  const key = await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name:'PBKDF2', hash:'SHA-256', salt, iterations },
    key,
    length*8
  ));
}
async function sha256Hex(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
}
function constantTimeEqual(a,b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array) || a.length !== b.length) return false;
  let diff=0;
  for(let i=0;i<a.length;i++) diff |= a[i]^b[i];
  return diff===0;
}
function base64url(bytes) {
  let binary='';
  for(const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function base64urlDecode(value) {
  const normal=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  const padded=normal+'='.repeat((4-normal.length%4)%4);
  const binary=atob(padded);
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
async function slowFailure() {
  const dummySalt = encoder.encode('formatx-account-invalid-login');
  await derivePassword('invalid-login-placeholder',dummySalt,50_000,32);
}
