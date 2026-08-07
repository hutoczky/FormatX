const REQUIRED_LEGAL_FIELDS = [
  'MERCHANT_LEGAL_NAME',
  'MERCHANT_ADDRESS',
  'MERCHANT_TAX_ID',
  'INVOICE_PROVIDER_NAME',
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
    message: 'Az új licencvásárlás a teljes üzemeltetői, számlázási és jogi adatok jóváhagyásáig nem indítható.',
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
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Licencvásárlás előkészítés alatt | FormatX Suite Pro</title>
  <link rel="stylesheet" href="/scifi-ui/styles/site.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Ugrás a tartalomra</a>
  <main id="main-content" class="legal-main">
    <article class="content-width legal-document">
      <p class="eyebrow">ÉRTÉKESÍTÉSI ÁLLAPOT · TELJES KIADÁS</p>
      <h1>Az új licencvásárlás átmenetileg nem indítható</h1>
      <p class="legal-lead">A FormatX teljes kiadása és az 5 napos próbalicenc letölthető marad. Az új fizetős licencvásárlás viszont addig zárolva van, amíg a teljes üzemeltetői cím, adószám, számlázási szolgáltató és a szükséges jogi adatok jóváhagyása nem teljes.</p>
      <p><strong>English:</strong> The FormatX full release and its 5-day trial licence remain available. New paid licence purchases stay disabled until the complete merchant address, tax ID, invoicing provider and required legal information have been approved.</p>
      <div class="legal-actions">
        <a class="button primary" href="/scifi-ui/downloads/">Letöltések és platformállapot</a>
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
    sales_ready: Boolean(salesReady),
    legal_documents_approved: salesReady,
    required_legal_fields: REQUIRED_LEGAL_FIELDS,
  }), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}