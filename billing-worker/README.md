# FormatX HUF/EUR banki átutalásos checkout

A FormatX Suite Pro közvetlen banki átutalásos checkoutja két működési módot és két devizát támogat:

- **HUF:** RFC 8905 szerinti `payto:` QR-adat;
- **EUR:** EPC069-12 v3.1 szerinti SEPA Credit Transfer QR-adat;
- **GitHub Pages statikus mód:** backend nélkül is elkészíti a fix összeget és a QR-kódot;
- **Cloudflare Worker mód:** szerveroldalon zárolja az összeget, rendelést tárolhat és licencet aktiválhat.

## Statikus GitHub Pages mód

Ha az `/api/health` végpont nem érhető el, a checkout automatikusan statikus módra vált. Ebben a módban:

- a hivatalos oldalon tárolt fix HUF- vagy EUR-csomagárból készül a QR;
- a kedvezményezett bankszámlaadatai közvetlenül a checkout-kódból kerülnek megjelenítésre;
- a fizetési visszajelzés a vásárló saját levelezőprogramjában előkészített e-mailként nyílik meg;
- automatikus rendeléskövetés és licencaktiválás nincs;
- a beérkezett devizát, összeget és közleményt kézzel kell ellenőrizni.

A statikus oldal kliensoldali kódja módosítható, ezért kizárólag a ténylegesen jóváírt, hivatalos csomagárnak megfelelő átutalás fogadható el.

## Worker mód

A Worker a `../docs` statikus tartalmát és a `/api/*` végpontokat egyetlen origin alatt szolgálja ki. A kiválasztott csomag árát szerveroldalon, a csomagazonosító, az időtartam és a deviza alapján rögzíti.

## QR-formátumok

### HUF

A HUF QR `payto:` adatot tartalmaz:

- kedvezményezett IBAN;
- kedvezményezett neve;
- BIC;
- fix HUF-összeg;
- egyedi FormatX rendelési azonosító.

Ez nem qvik-QR. A mobilbankok `payto:` támogatása eltérhet.

### EUR

Az EUR QR EPC SEPA Credit Transfer adatot tartalmaz:

- `BCD` szolgáltatásazonosító;
- SCT átutalástípus;
- kedvezményezett BIC-je és IBAN-ja;
- kedvezményezett neve;
- fix EUR-összeg;
- FormatX rendelési azonosító szabad szöveges közleményként.

Az EPC-adat legfeljebb 331 bájt lehet; ezt a Worker ellenőrzi. A banki alkalmazások EPC QR-támogatása eltérhet, ezért minden adat külön is látható és másolható.

## Fix csomagárak

| Csomag | Havi HUF | Éves HUF | Havi EUR | Éves EUR |
|---|---:|---:|---:|---:|
| Business Lite | 19 900 Ft | 199 000 Ft | 55 € | 547 € |
| Business Pro | 49 900 Ft | 499 000 Ft | 137 € | 1 373 € |
| Technician Team | 99 900 Ft | 999 000 Ft | 275 € | 2 748 € |

Az EUR-árak fix kereskedelmi árak. Fizetés közben nincs élő devizaátváltás vagy automatikus árfolyam-frissítés.

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

- mindkét magyar IBAN hosszát és MOD-97 ellenőrzőösszegét;
- a belföldi, 24 számjegyű HUF-számlaszám formátumát;
- a BIC-kódok szerkezetét;
- a live fizetési módot és a számla megerősítését.

## Supabase és licenckezelés

A QR-kódos átutalási adatok Supabase nélkül is létrehozhatók. Az alábbi funkciókhoz viszont szükséges a Supabase kapcsolat:

- rendelés rögzítése;
- szerveres fizetési visszajelzés;
- rendelési állapot lekérése;
- kézi adminisztrátori jóváhagyás;
- licenckulcs létrehozása.

Az EUR-rendelés tényleges összege és devizája a rendelés `metadata` mezőjében is tárolódik; a meglévő `amount_huf` mező a HUF árlista szerinti referenciaértéket őrzi.

Futtasd a `supabase-schema.sql` fájlt a Supabase SQL Editorban.

A következőket Cloudflare secretként add meg:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put LICENSE_SECRET
npx wrangler secret put ADMIN_DEBUG_TOKEN
```

## Kézi jóváhagyás Worker módban

Miután a bankszámlán ellenőrizted a devizát, a pontos összeget és a FormatX rendelési azonosítót, hívd meg:

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
4. naplózza az adminisztrátori jóváhagyást és a rendelés devizáját.

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
  "supported_currencies": ["HUF", "EUR"],
  "qvik": false,
  "qr_formats": {
    "HUF": "payto-rfc8905",
    "EUR": "epc069-12-v3.1"
  },
  "manual_verification_required": true
}
```
