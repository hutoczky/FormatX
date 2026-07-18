# FormatX banki átutalásos checkout

A FormatX Suite Pro közvetlen banki átutalásos checkoutja két működési módot támogat:

1. **GitHub Pages statikus mód** — backend nélkül is megjeleníti a fix HUF-összeget, az átutalási adatokat és a QR-kódot.
2. **Cloudflare Worker mód** — szerveroldalon rögzíti az összeget, rendelést tárolhat, fizetési visszajelzést fogadhat és licencet aktiválhat.

## Statikus GitHub Pages mód

Ha az `/api/health` végpont nem érhető el, a checkout automatikusan statikus módra vált. Ebben a módban:

- a hivatalos oldalon tárolt fix csomagárakból készül a QR;
- a kedvezményezett bankszámlaadatai közvetlenül a checkout-kódból kerülnek megjelenítésre;
- a fizetési visszajelzés a vásárló saját levelezőprogramjában előkészített e-mailként nyílik meg;
- automatikus rendeléskövetés és licencaktiválás nincs;
- a beérkezett összeget és közleményt kézzel kell ellenőrizni.

A statikus oldal kliensoldali kódja módosítható, ezért kizárólag a ténylegesen jóváírt, hivatalos csomagárnak megfelelő átutalás fogadható el.

## Worker mód

A Worker a `../docs` statikus tartalmát és a `/api/*` végpontokat egyetlen origin alatt szolgálja ki. A kiválasztott csomag árát szerveroldalon rögzíti, majd RFC 8905 szerinti `payto:` fizetési adatot ad vissza.

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

Worker módban az összeget kizárólag a szerver választja ki a csomagazonosító és a számlázási ciklus alapján. Statikus módban az oldal beépített árlistája alapján készül a QR, a beérkező összeg pedig kézi ellenőrzés alá esik.

## Deviza

A checkout jelenleg kizárólag HUF-fizetést enged. Az EUR IBAN konfigurálható, de EUR-fizetési mód csak külön, előre rögzített EUR árlista után kapcsolható be. Élő árfolyamból számított, változó összeg nincs használatban.

## Éles végpontok

- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/payment-confirmation`
- `GET /api/session-status?session_id=FX-...`
- `POST /api/admin/approve-bank-transfer`
- `POST /api/license/verify`

## Kötelező Worker-változók

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
- szerveres fizetési visszajelzés;
- rendelési állapot lekérése;
- kézi adminisztrátori jóváhagyás;
- licenckulcs létrehozása.

Futtasd a `supabase-schema.sql` fájlt a Supabase SQL Editorban.

A következőket Cloudflare secretként add meg:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put LICENSE_SECRET
npx wrangler secret put ADMIN_DEBUG_TOKEN
```

## Kézi jóváhagyás Worker módban

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

## Worker telepítése

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
