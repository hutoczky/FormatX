# FormatX Billing Worker

Cloudflare Worker alapú, közvetlen banki átutalásos checkout a FormatX Suite Pro oldalhoz.

A Worker a `../docs` statikus tartalmát és a `/api/*` végpontokat egyetlen origin alatt szolgálja ki. A kiválasztott csomag árát szerveroldalon rögzíti, majd RFC 8905 szerinti `payto:` fizetési adatot ad vissza. A frontend ebből QR-kódot készít.

## Fontos QR-korlát

A generált QR **nem qvik-QR**. A qvik kereskedői QR-t csak megfelelően csatlakozott és tanúsított fizetési szolgáltató vagy aggregátor állíthatja elő.

A `payto:` QR a következő adatokat tartalmazza:

- kedvezményezett IBAN;
- kedvezményezett neve;
- BIC;
- kiválasztott, fix HUF-összeg;
- egyedi FormatX rendelési azonosító.

A mobilbankok `payto:` támogatása eltérhet. Ezért a felület a QR mellett minden átutalási adatot kiír és másolhatóvá tesz. A vásárlónak jóváhagyás előtt ellenőriznie kell az adatokat.

## Fix csomagárak

| Csomag | Havi | Éves |
|---|---:|---:|
| Business Lite | 19 900 Ft | 199 000 Ft |
| Business Pro | 49 900 Ft | 499 000 Ft |
| Technician Team | 99 900 Ft | 999 000 Ft |

Az összeget kizárólag a Worker választja ki a csomagazonosító és a számlázási ciklus alapján. A böngésző által küldött tetszőleges összeg nem használható.

## Deviza

A checkout jelenleg kizárólag HUF-fizetést enged. Az EUR IBAN konfigurálható, de EUR-fizetési mód csak külön, előre rögzített EUR árlista után kapcsolható be. Élő árfolyamból számított, változó összeg nincs használatban.

## Éles végpontok

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/payment-confirmation`
- `GET /api/session-status?session_id=FX-...`
- `POST /api/admin/approve-bank-transfer`
- `POST /api/license/verify`

## Kötelező bankszámla-változók

- `PAYMENT_PROVIDER=bank_transfer`
- `PAYMENT_MODE=live`
- `PAYMENT_ACCOUNT_CONFIRMED=true`
- `BANK_ACCOUNT_HOLDER`
- `BANK_LOCAL_HUF_ACCOUNT`
- `BANK_IBAN_HUF`
- `BANK_IBAN_EUR`
- `BANK_BIC`
- `BANK_CORRESPONDENT_BIC`

A Worker induláskor ellenőrzi:

- a magyar IBAN hosszát és MOD-97 ellenőrzőösszegét;
- a belföldi, 24 számjegyű számlaszám formátumát;
- a BIC-kódok szerkezetét;
- a live fizetési módot és a számla megerősítését.

## Supabase és licenckezelés

A QR-kódos átutalási adatok Supabase nélkül is létrehozhatók. Az alábbi funkciókhoz viszont szükséges a Supabase kapcsolat:

- rendelés rögzítése;
- fizetési visszajelzés;
- rendelési állapot lekérése;
- kézi jóváhagyás;
- licenckulcs létrehozása.

Futtasd a `supabase-schema.sql` fájlt a Supabase SQL Editorban.

A következőket Cloudflare secretként add meg:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put LICENSE_SECRET
npx wrangler secret put ADMIN_DEBUG_TOKEN
```

## Kézi jóváhagyás

Miután a bankszámlán ellenőrizted a pontos összeget és a FormatX rendelési azonosítót, hívd meg:

```bash
curl -X POST "https://SAJAT-WORKER/api/admin/approve-bank-transfer" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Debug-Token: SAJAT_EROS_ADMIN_TOKEN" \
  -d '{
    "order_reference": "FX-20260718-ABC123",
    "bank_transaction_id": "BANKI_TRANZAKCIO_AZONOSITO"
  }'
```

A jóváhagyás:

1. fizetettnek jelöli a rendelést;
2. létrehozza a licenckulcsot;
3. beállítja az egyhavi vagy egyéves érvényességet;
4. naplózza az adminisztrátori jóváhagyást.

## Telepítés

```bash
npm ci
npx wrangler deploy
```

Ellenőrzés:

```text
https://SAJAT-WORKER/api/health
```

A megfelelő alapválasz:

```json
{
  "ok": true,
  "provider": "bank_transfer",
  "mode": "live",
  "live_ready": true,
  "qvik": false,
  "qr_format": "payto-rfc8905",
  "manual_verification_required": true
}
```
