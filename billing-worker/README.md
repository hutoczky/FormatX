# FormatX Billing Worker

Cloudflare Worker API a GitHub Pages alapú FormatX Suite Pro éles Stripe Checkout folyamatához.

A publikus oldal nem kezel kártyaadatot. A Worker minden fizetési próbálkozáshoz új Stripe Checkout Sessiont készít, a frontend pedig ennek a HTTPS címét jeleníti meg QR-kódként és megnyitható fizetési gombként.

## Végpontok

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/webhook`
- `GET /api/session-status?session_id=...`
- `POST /api/license/verify`
- `GET /api/admin/debug`

## Biztonsági működés

- A publikus checkout kizárólag `PAYMENT_MODE=live` állapotot fogad el.
- A böngésző kizárólag Stripe HTTPS checkout URL-ből készít QR-kódot.
- Hiányzó konfiguráció esetén a rendszer leáll; nem szimulál sikeres fizetést.
- A Stripe titkos kulcs, webhook secret, Supabase service-role kulcs és licenctitok kizárólag Cloudflare Worker secret lehet.
- A GitHub Pages build a Worker publikus API-címét a `FORMATX_BILLING_API_BASE` repository variable értékéből írja a `docs/scifi-ui/billing-config.json` fájlba.

## Supabase

A szükséges táblaséma a `supabase-schema.sql` fájlban található.

## Lokális teszt

1. Másold a `.dev.vars.example` fájlt `.dev.vars` néven.
2. Hagyd a lokális környezetet `PAYMENT_MODE=test` módban.
3. Töltsd ki a Stripe tesztkulcsokat, a Supabase adatokat és a lokális URL-eket.
4. Futtasd: `npm install`
5. Futtasd: `npm test`
6. Futtasd: `npm run dev`

## Élesítés

1. Hozd létre a Stripe élő termékeket és a hat élő Price ID-t.
2. Állítsd be a Cloudflare Worker titkokat:
   - `PAYMENT_SECRET_KEY`
   - `PAYMENT_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LICENSE_SECRET`
3. Állítsd be a Worker további környezeti értékeit:
   - `SUPABASE_URL`
   - `PAYMENT_SUCCESS_URL`
   - `PAYMENT_CANCEL_URL`
   - `FRONTEND_URL`
   - `WORKER_BASE_URL`
   - `SUPPORT_EMAIL`
   - `TERMS_URL`
   - `PRIVACY_URL`
   - a hat `STRIPE_PRICE_ID_*` érték
4. Telepítsd a Workert: `npm run deploy`
5. A Stripe Dashboardban irányítsd a webhookot a Worker `/api/webhook` végpontjára.
6. A GitHub repository `FORMATX_BILLING_API_BASE` változója legyen a Worker teljes HTTPS API-címe, például `https://<worker-domain>/api`.
7. Futtasd újra a GitHub Pages workflow-t.

Éles kártyaterhelés addig nem indulhat, amíg a Worker nem jelent `live` módot, és a teljes élő konfiguráció nem áll rendelkezésre.
