# FormatX Billing Worker

Cloudflare Worker alapú, valódi Revolut Pro fizetési linkes checkout a FormatX Suite Pro oldalhoz.

A Worker a `../docs` statikus tartalmát és a `/api/*` végpontokat egyetlen origin alatt szolgálja ki. A böngésző a kiválasztott csomaghoz tartozó, fix összegű Revolut Pro fizetési linkből QR-kódot készít.

## Fontos működési korlát

A Revolut Pro fizetési link nem Merchant API-integráció és nem automatikusan megújuló előfizetés.

- A havi link egy havi hozzáférés egyszeri díja.
- Az éves link egy éves hozzáférés egyszeri díja.
- A Revolut Pro tranzakciót kézzel kell ellenőrizni.
- A licencet csak kézi admin-jóváhagyás aktiválja.

Ez a megoldás a Revolut Pro fizetésfogadási funkciójára épül. Személyes `revolut.me` linket nem fogad el.

## Éles végpontok

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/payment-confirmation`
- `GET /api/session-status?session_id=FX-...`
- `POST /api/admin/approve-revolut-payment`
- `POST /api/license/verify`

## A hat Revolut Pro fizetési link

A Revolut app Pro részében hozz létre hat, HUF-ban rögzített összegű, újra felhasználható fizetési linket:

| Változó | Összeg |
|---|---:|
| `REVOLUT_PAYMENT_LINK_BUSINESS_LITE_MONTHLY` | 19 900 Ft |
| `REVOLUT_PAYMENT_LINK_BUSINESS_LITE_ANNUAL` | 199 000 Ft |
| `REVOLUT_PAYMENT_LINK_BUSINESS_PRO_MONTHLY` | 49 900 Ft |
| `REVOLUT_PAYMENT_LINK_BUSINESS_PRO_ANNUAL` | 499 000 Ft |
| `REVOLUT_PAYMENT_LINK_TECHNICIAN_TEAM_MONTHLY` | 99 900 Ft |
| `REVOLUT_PAYMENT_LINK_TECHNICIAN_TEAM_ANNUAL` | 999 000 Ft |

A Worker csak ilyen alakú linket fogad el:

```text
https://checkout.revolut.com/payment-link/...
```

A személyes `revolut.me` link szándékosan tiltott.

## Biztonsági működés

A checkout csak akkor engedélyezett, ha minden kötelező feltétel teljesül:

- `PAYMENT_PROVIDER=revolut_pro`
- `PAYMENT_MODE=live`
- `REVOLUT_PRO_ACCOUNT_APPROVED=true`
- mind a hat Revolut Pro fizetési link érvényes
- Supabase kapcsolat aktív
- `LICENSE_SECRET` legalább 32 karakter
- `ADMIN_DEBUG_TOKEN` legalább 24 karakter
- valós üzemeltetői és jogi adatok beállítva
- `LEGAL_DOCUMENTS_APPROVED=true`

Hiányos konfigurációnál a Worker `503` választ ad, a frontend pedig letiltja a fizetési gombot.

## Titkok

A következőket Cloudflare secretként add meg:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put LICENSE_SECRET
npx wrangler secret put ADMIN_DEBUG_TOKEN
```

A fizetési linkek nem titkos API-kulcsok, de célszerű Cloudflare változóként kezelni őket.

## Supabase

Futtasd a `supabase-schema.sql` fájlt a Supabase SQL Editorban.

A fizetés indításakor a Worker `pending_payment` állapotú rendelést rögzít. A vásárló fizetés után visszajelzést küld, amely `awaiting_manual_review` állapotba kerül.

## Kézi jóváhagyás

Miután a Revolut Pro alkalmazásban ellenőrizted a tranzakciót, hívd meg:

```bash
curl -X POST "https://SAJAT-WORKER/api/admin/approve-revolut-payment" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Debug-Token: SAJAT_EROS_ADMIN_TOKEN" \
  -d '{
    "order_reference": "FX-20260718-ABC123",
    "revolut_transaction_id": "REVOLUT_TRANZAKCIO_AZONOSITO"
  }'
```

A jóváhagyás:

1. fizetettnek jelöli a rendelést;
2. létrehozza a licenckulcsot;
3. beállítja az egyhavi vagy egyéves érvényességet;
4. naplózza az admin-jóváhagyást.

## Telepítés

```bash
npm ci
npx wrangler deploy
```

Ellenőrzés:

```text
https://SAJAT-WORKER/api/health
```

Az éles állapot feltétele:

```json
{
  "ok": true,
  "provider": "revolut_pro",
  "mode": "live",
  "live_ready": true,
  "manual_verification_required": true
}
```
