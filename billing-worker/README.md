# FormatX Billing Worker

Cloudflare Worker alapú, éles Stripe Checkout és licencaktiválás a FormatX Suite Pro oldalhoz.
A Worker a `../docs` statikus tartalmát és a `/api/*` végpontokat egyetlen origin alatt szolgálja ki, ezért a frontend `/api` beállítása működik.

## Éles végpontok

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/webhook`
- `GET /api/session-status?session_id=...`
- `POST /api/license/verify`
- `GET /api/admin/debug`

## Biztonsági működés

Az éles checkout csak akkor engedélyezett, ha minden kötelező Stripe-, Supabase-, HTTPS-, kereskedői és jogi változó megfelelően be van állítva. Hiányos konfigurációnál a Worker `503` választ ad, a frontend pedig letiltja a fizetési gombot. A böngésző nem kér és nem továbbít kártyaszámot, lejáratot vagy CVC-kódot.

## Kötelező előkészítés

1. Töltsd ki végleges, valós üzemeltetői adatokkal az `docs/scifi-ui/terms.html` és `docs/scifi-ui/privacy.html` oldalakat.
2. Hozd létre a Stripe éles termékeket és árakat.
3. Hozd létre a Supabase táblákat a `supabase-schema.sql` alapján.
4. Állítsd be a Cloudflare Worker titkokat és változókat.
5. Csak jogi ellenőrzés után állítsd `LEGAL_DOCUMENTS_APPROVED=true` értékre.

## Titkok és változók

A titkokat `wrangler secret put NÉV` paranccsal add meg:

- `PAYMENT_SECRET_KEY` — `sk_live_...`
- `PAYMENT_WEBHOOK_SECRET` — `whsec_...`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LICENSE_SECRET` — legalább 32 karakter
- `ADMIN_DEBUG_TOKEN`

További kötelező változók:

- `PAYMENT_SUCCESS_URL`
- `PAYMENT_CANCEL_URL`
- `FRONTEND_URL`
- `WORKER_BASE_URL`
- `SUPABASE_URL`
- `SUPPORT_EMAIL`
- `TERMS_URL`
- `PRIVACY_URL`
- `LEGAL_DOCUMENTS_APPROVED`
- `MERCHANT_LEGAL_NAME`
- `MERCHANT_ADDRESS`
- `MERCHANT_TAX_ID`
- a hat `STRIPE_PRICE_ID_*` változó

## Telepítés

```bash
npm ci
npx wrangler deploy
```

A weboldal ezután a Worker origin alatt érhető el, például:

```text
https://formatx-billing-worker.<workers-subdomain>.workers.dev/scifi-ui/
```

Ellenőrzés:

```text
https://formatx-billing-worker.<workers-subdomain>.workers.dev/api/health
```

Az `ok: true`, `mode: "live"` és `live_ready: true` együtt jelenti, hogy az éles fizetés engedélyezhető.
