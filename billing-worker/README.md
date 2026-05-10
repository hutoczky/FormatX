# FormatX Billing Worker

Cloudflare Worker API a GitHub Pages alapú FormatX Suite Pro checkout flow-hoz.

## Végpontok

- `POST /api/create-checkout-session`
- `POST /api/webhook`
- `GET /api/session-status?session_id=...`
- `POST /api/license/verify`
- `GET /api/admin/debug`

## Supabase

A szükséges táblaséma a `supabase-schema.sql` fájlban található.

## Lokális fejlesztés

1. Másold a `.dev.vars.example` fájlt `.dev.vars` néven.
2. Töltsd ki a Stripe / Supabase / licenc változókat.
3. Futtasd: `npm run dev`
