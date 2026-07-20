const REQUIRED_LEGAL_FIELDS = [
  'MERCHANT_LEGAL_NAME',
  'MERCHANT_ADDRESS',
  'MERCHANT_TAX_ID',
  'SUPPORT_EMAIL',
];

export function isSalesLegallyReady(env) {
  if (String(env.LEGAL_DOCUMENTS_APPROVED || '').toLowerCase() !== 'true') {
    return false;
  }

  return REQUIRED_LEGAL_FIELDS.every((name) => {
    const value = env[name];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

export function createSalesUnavailableJson() {
  return new Response(JSON.stringify({
    error: 'sales_temporarily_unavailable',
    message: 'Az új licencvásárlás a jogi és adatkezelési dokumentumok véglegesítéséig nem indítható.',
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '86400',
    },
  });
}

export function createSalesUnavailablePage() {
  const html = `<!doctype html>
<html lang="hu" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <title>Licencvásárlás előkészítés alatt | FormatX Suite Pro</title>
  <link rel="stylesheet" href="/scifi-ui/styles/site.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Ugrás a tartalomra</a>
  <main id="main-content" class="legal-main">
    <article class="content-width legal-document">
      <p class="eyebrow">ÉRTÉKESÍTÉSI ÁLLAPOT</p>
      <h1>Az új licencvásárlás átmenetileg nem indítható</h1>
      <p class="legal-lead">A FormatX bemutatóoldala és a próbaverzió elérhető, de az éles fizetési folyamat a teljes üzemeltetői, fogyasztóvédelmi és adatkezelési dokumentáció véglegesítéséig zárolva marad.</p>
      <p><strong>English:</strong> New licence purchases are temporarily disabled until the merchant, consumer-information and privacy documentation is complete.</p>
      <div class="legal-actions">
        <a class="button primary" href="/">Vissza a főoldalra</a>
        <a class="button secondary" href="/scifi-ui/support.html">Támogatás</a>
        <a class="button secondary" href="/scifi-ui/terms.html">Feltételek</a>
      </div>
    </article>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '86400',
    },
  });
}

export async function annotateHealthResponse(response, salesReady) {
  const contentType = response.headers.get('Content-Type') || '';
  if (!response.ok || !contentType.includes('application/json')) {
    return response;
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify({
    ...payload,
    live_ready: salesReady ? payload.live_ready : false,
    legal_documents_approved: salesReady,
  }), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
