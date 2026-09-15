# FormatX Suite Pro — nyilvános technikai bizonyítékriport

**Frissítve:** 2026-09-02  
**Nyilvános oldal:** https://formatxsuite.com/  
**Forrás és CI:** https://github.com/hutoczky/FormatX/actions

## 1. Termék- és platformállapot

A FormatX Suite Pro aktuális termékállapota **Full release / teljes kiadás**, 5 napos próbalicenccel.

- Linux / Bazzite — elsődleges, támogatott natív platform.
- Windows — támogatott natív platform.
- Android — támogatott natív platform; a hivatalos teljes kiadás és a külön Native béta csatorna nem azonos.
- Web — technikai előnézet; nem végez natív meghajtóírást vagy formázást.
- macOS — tervezett.
- iOS / iPadOS — tervezett.

A „Full release” termékstátusz és a külön, bizonyítékhoz kötött „Stable” minősítés nem ugyanaz. A publikus platformigazság irányadó forrása a `platform-status.json`, a kiadási csomagé a `current-release.json`.

## 2. P0 production minőségkapu

A production P0 csak tényleges, elmentett CI/Lighthouse artifact alapján minősíthető. A production URL minden mérésnél `https://formatxsuite.com/`; cache-busting query használható, de nem változtathatja meg az alkalmazás működését.

Kötelező P0 szerződés desktopon és mobilon, külön-külön **három egymást követő production futásban**:

- Lighthouse Performance: **100**
- Lighthouse Accessibility: **100**
- Lighthouse Best Practices: **100**
- Lighthouse SEO: **100**
- Largest Contentful Paint: **< 2,0 s**
- Cumulative Layout Shift: **< 0,05**
- Interaction to Next Paint field cél: **< 200 ms**, lehetőleg **< 150 ms**
- TTFB: a technikailag indokolt minimumon
- kritikus render-blocking, unused JS/CSS és hosszú main-thread regresszió: nincs elfogadva

**Aktuális P0 mérési állapot: pending / not verified.**

A fenti státusz csak akkor cserélhető mért PASS eredményre, ha a megfelelő production deploy SHA-hoz tartozó CI-futás három desktop és három mobil Lighthouse riportja, valamint a kapcsolódó security/readiness bizonyíték rendelkezésre áll. Korábbi, enyhébb küszöbértékkel készült sikeres futás nem minősül a jelenlegi P0 szerződés teljesítésének.

Az INP field metrika. Lighthouse navigation vagy TBT eredmény önmagában nem bizonyít production INP PASS állapotot. Hiteles CrUX/RUM/field adat hiányában az INP állapota `pending / not verified` marad.

## 3. Valódi 3D MAG

A production MAG aktuális vizuális authority rétege natív WebGL renderelést és progresszív fallback rétegeket használ. A vizuális identitás, MAG-sziluett, glow és Living System koncepció performance-optimalizálás miatt nem távolítható el.

P0 szerződés:

- WebGL inicializáció hibája nem teheti használhatatlanná az oldalt;
- gyengébb vagy WebGL nélküli környezetben Canvas/CSS fallback marad használható;
- JavaScript nélkül a fő tartalom és bizonyítéki réteg továbbra is olvasható;
- `prefers-reduced-motion` támogatás nem törheti el a layoutot;
- háttérbe került vagy nem látható renderfelület nem tarthat fenn indokolatlan teljes terhelésű animációs ciklust;
- desktop és mobil kompozíció regresszióvédelme kötelező.

A konkrét WebGL/Canvas/no-JS PASS állapot csak az adott production SHA-hoz tartozó böngészős bizonyíték alapján publikálható.

## 4. Live OS és Operational Twin

A P0 optimalizálás nem távolíthatja el és nem gyengítheti a következő működést:

- magyar és angol természetesnyelv-parancs kezelés;
- valós böngésződiagnosztika;
- storage topology megjelenítés;
- Live OS grafikus/Canvas fallback;
- Operational Twin / Project Simulator;
- Discover → Plan → Lock → Execute → Verify workflow;
- audit/report export;
- veszélyes vagy bizonytalan műveletnél fail-closed viselkedés.

A kijelzett teljesítményadatok nem helyettesítik a valós felhasználói RUM/field mérést. Hiányzó field adatot a FormatX nem jelöl sikeresnek.

## 5. Termékbizonyíték és kiadási integritás

A kiadás, digest, platformállapot, tesztmátrix és ismert korlátozások külön nyilvános rekordokból ellenőrizhetők.

- Bizonyítéki központ: https://formatxsuite.com/scifi-ui/verification.html
- Tesztmátrix: https://formatxsuite.com/scifi-ui/test-matrix.html
- Ismert hibák: https://formatxsuite.com/scifi-ui/known-issues.html
- Biztonság: https://formatxsuite.com/scifi-ui/security.html

A jelenlegi kiadáshoz SHA-256 digest publikált. Külön detached signature asset jelenleg nincs publikálva; ezt a felület nem állítja teljesítettnek.

## 6. Moderált felhasználói értékelés

A főoldali értékelő 1–5 közötti pontokat fogad az alábbi területekre:

- összbenyomás;
- használhatóság;
- teljesítmény;
- dizájn;
- funkciók.

A beküldések alapállapota `pending`. A nyilvános átlag kizárólag `approved` állapotú, moderált értékelésekből készül. A függőben lévő vagy elutasított bejegyzések nem számítanak bele. A szöveges visszajelzés és az opcionális e-mail-cím nem jelenik meg a nyilvános összesítő API-ban.

A moderáció védett tulajdonosi felületen történik. A kapcsolati e-mail nem nyilvános, a felhasználói szöveg pedig nem futtatható HTML-ként.

## 7. Adatvédelmi határ

A Live OS helyi parancsértelmezési rétege nem küldi a beírt parancsot külső AI-szolgáltatásnak. A weboldal csak a böngésző által ténylegesen elérhető képességeket mérheti; mély operációsrendszer- vagy hardveradatot nem találhat ki.

A visszajelző a visszaélések korlátozásához egyirányú hálózati azonosító-lenyomatot és technikai kérésadatokat kezelhet. A kapcsolatfelvételi e-mail opcionális és nem nyilvános.

Adatvédelem: https://formatxsuite.com/scifi-ui/privacy.html

## 8. Teljes oldal audit és regresszióvédelem

A production P0 ellenőrzésnek legalább az alábbiakat kell bizonyítania:

- publikus HTML-oldalak helyi hivatkozásai és assetjei épek;
- nincs saját 404, broken asset vagy hibás belső link;
- nincs duplikált HTML-azonosító;
- képek és interaktív elemek accessible name/alt/label szerződése helyes;
- nincs CSP-vel ütköző inline eseménykezelő;
- release/platform igazság konzisztens;
- tranzakciós oldalak indexelési szerződése helyes;
- desktop és mobil Chromium nézetekben nincs horizontal overflow;
- keyboard navigation, focus-visible, reduced motion és 200% zoom működik;
- desktop hero, mobile hero, MAG, MAG glow/silhouette, HU/EN, Proof Layer, Live OS, pricing, downloads, Project Simulator és footer vizuális regresszióvédett.

Safari/iOS csak valódi Safari/fizikai vagy hiteles Safari futtatókörnyezetből jelölhető PASS-nak. Ennek hiányában az állapot: `requires physical/Safari verification`.

## 9. SEO, canonical és publikus útvonalak

A kanonikus production origin: **https://formatxsuite.com/**. A `www.formatxsuite.com` legacy host a non-www kanonikus originre irányít. A homepage aliasok és publikus rövid útvonalak nem hozhatnak létre redirect loopot vagy felesleges redirect chain-t.

A P0 SEO szerződés része:

- title és meta description;
- canonical;
- HU/EN/x-default hreflang;
- Open Graph és Twitter/X metadata;
- sitemap.xml és robots.txt;
- strukturált JSON-LD;
- helyes heading hierarchy;
- crawlable statikus tartalom;
- valódi belső linkek és indexelhetőség.

## 10. Security minimum

A production P0 nem lazíthatja a security policy-t Lighthouse-pontért. Kötelező minimum:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`;
- `X-Content-Type-Options: nosniff`;
- clickjacking-védelem `X-Frame-Options: DENY` és/vagy megfelelő CSP `frame-ancestors 'none'` szerződéssel;
- `Content-Security-Policy` szigorú, legalább `object-src 'none'` és `frame-ancestors 'none'`;
- indokolt `Cross-Origin-Opener-Policy`;
- felesleges `X-Powered-By` nincs.

A security PASS csak live response-header bizonyítékból publikálható.

## 11. Nyílt bizonyítékhiányok

Jelenlegi P0 állapotban különösen nem állítható ellenőrzöttnek addig, amíg nincs friss production artifact:

- desktop Lighthouse 100/100/100/100 ×3;
- mobile Lighthouse 100/100/100/100 ×3;
- LCP <2,0 s és CLS <0,05 mind a hat futásban;
- production INP <200 ms hiteles field adaton;
- teljes P0 böngésző-, accessibility-, responsive-, fallback- és regressziómátrix;
- Safari/iOS valódi ellenőrzés.

További nyílt bizonyítékhiány:

- független szakmai termékteszt;
- hitelesített ügyfélesettanulmány;
- Awwwards- vagy más zsűridíj;
- minden támogatott platformra és hardverre kiterjedő végponttól végpontig valós eszközteszt;
- detached signature asset a jelenlegi kiadáshoz.

Ezeket a FormatX nem állítja teljesítettnek addig, amíg ellenőrizhető bizonyíték nem áll rendelkezésre.
