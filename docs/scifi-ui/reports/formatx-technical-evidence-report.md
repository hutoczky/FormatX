# FormatX Suite Pro — nyilvános technikai bizonyítékriport

**Frissítve:** 2026-08-06  
**Nyilvános oldal:** https://www.formatxsuite.com/  
**Forrás és CI:** https://github.com/hutoczky/FormatX/actions

## 1. Kötelező webes minőségkapuk

A production jelölt csak akkor tekinthető ellenőrzöttnek, ha a konfigurált Lighthouse-kapuk teljesülnek:

- Performance: legalább 90
- Accessibility: legalább 95
- Best Practices: legalább 95
- SEO: legalább 90
- Largest Contentful Paint: legfeljebb 2,5 másodperc
- Cumulative Layout Shift: legfeljebb 0,10
- Szerverválaszidő: legfeljebb 600 ms

Ezek minimumkövetelmények. Nem garantálnak minden eszközön és hálózaton azonos pontszámot.

## 2. Live OS interaktív réteg

A CI ellenőrzi:

- desktop és mobil böngészős működés;
- magyar és angol természetes nyelvű parancsokat;
- valós böngésző-, kijelző-, hálózati és WebGL-képességadatokat;
- kérésre betöltődő Three.js tárolótérképet;
- WebGL nélküli Canvas tartalék módot;
- vízszintes túlcsordulás hiányát;
- csökkentett mozgási módot;
- a bizonyítékközpont megnyitását.

A 120 FPS élmény nem garantált. A kijelzőtől, GPU-tól, operációs rendszertől és böngészőtől függ.

## 3. Termékbizonyíték

A főoldalon publikált alkalmazásképek a működő FormatX Suite Pro felületéből származnak. A kiadás, digest, aláírás-elérhetőség, platformállapot, tesztmátrix és ismert korlátozások külön nyilvános rekordokban ellenőrizhetők.

- Bizonyítéki központ: https://www.formatxsuite.com/scifi-ui/verification.html
- Tesztmátrix: https://www.formatxsuite.com/scifi-ui/test-matrix.html
- Ismert hibák: https://www.formatxsuite.com/scifi-ui/known-issues.html
- Biztonság: https://www.formatxsuite.com/scifi-ui/security.html

## 4. Moderált felhasználói értékelés

A főoldali értékelő 1–5 közötti pontokat fogad az alábbi területekre:

- összbenyomás;
- használhatóság;
- teljesítmény;
- dizájn;
- funkciók.

A beküldések alapállapota `pending`. A nyilvános átlag kizárólag `approved` állapotú, moderált értékelésekből készül. A függőben lévő vagy elutasított bejegyzések nem számítanak bele. A szöveges visszajelzés és az opcionális e-mail-cím nem jelenik meg a nyilvános összesítő API-ban.

A moderáció a Cloudflare Access e-mail-kódos védelemmel ellátott tulajdonosi központban történik:

- admin oldal: `/fx-owner-license/feedback.html`;
- állapotok: `pending`, `approved`, `rejected`;
- műveletek: jóváhagyás, elutasítás, visszaállítás és végleges törlés;
- a kapcsolati e-mail és a közzétételi engedély kizárólag az adminnak látható;
- a felhasználói szöveg HTML-ként nem hajtódik végre.

A production D1 adatbázis verziózott, helyreállításra képes sémafolyamatot használ. Ha a korábbi `user_feedback` tábla nem felel meg a kanonikus sémának, a Worker új táblát épít, a meglévő rekordokat ellenőrzött alapértékekkel átmásolja, majd újra létrehozza a szükséges indexeket. Sikertelen helyreállításkor kontrollált 503-as JSON-válasz és incidensazonosító készül, nem nyers HTTP 500 hibaoldal.

## 5. Adatvédelmi határ

A Live OS parancsértelmezése helyben fut. A beírt parancsot nem küldi külső AI-szolgáltatásnak. A weboldal csak a böngésző által ténylegesen elérhető képességeket méri, és nem talál ki mély operációsrendszer-adatokat.

A visszajelző a visszaélések korlátozásához egyirányú hálózati azonosító-lenyomatot és technikai kérésadatokat kezelhet. A kapcsolatfelvételi e-mail opcionális, nem nyilvános.

Adatvédelem: https://www.formatxsuite.com/scifi-ui/privacy.html

## 6. Teljes oldal audit és folytonos görgetés

A nyilvános felület statikus integritáskapuja ellenőrzi:

- a publikus HTML-oldalak helyi hivatkozásait és assetjeit;
- a duplikált HTML-azonosítókat;
- a képek alternatív szövegét;
- a külső lapnyitások `noopener` védelmét;
- a CSP-vel ütköző inline eseménykezelőket;
- a letöltési fallback útvonalakat;
- a Hordozható telepítő rasztermentes SVG-jét;
- a főoldal statikus, kereshető kategóriaszemantikáját.

A `seamless-v6` görgető natív wheel-, touch- és billentyűzetes inputot használ. Az oldal végén egy inaktív, Hero-only vizuális híd tartja meg a képi folytonosságot, majd a rendszer az azonos relatív vizuális pozícióra vált. A teljes oldal nem kerül klónozásra. Mobilon a böngésző címsávjának magasságváltozása nem építi újra a hidat; újraépítés csak valódi szélesség- vagy tájolásváltozáskor történik.

## 7. Letöltési és publikus útvonalak

A letöltési oldal JavaScript nélkül is a legfrissebb GitHub Release oldalra mutat. Hiteles kiadási metaadat esetén a kliens közvetlen kiadási csomagra frissítheti a hivatkozást.

A fő publikus rövid útvonalak 308-as kanonikus átirányítást kapnak, többek között:

- `/downloads/`;
- `/support.html`;
- `/privacy.html`;
- `/terms.html`;
- `/verification.html`;
- `/test-matrix.html`;
- `/known-issues.html`.

A nem `www` domain publikus GET és HEAD kérései a kanonikus `www.formatxsuite.com` címre kerülnek.

## 8. Nyílt bizonyítékhiányok

Jelenleg nincs publikálva:

- független szakmai termékteszt;
- hitelesített ügyfélesettanulmány;
- Awwwards- vagy más zsűridíj;
- minden támogatott platformra kiterjedő valós hardverteszt;
- minden eszközre garantált 120 FPS eredmény.

Ezeket a FormatX nem állítja teljesítettnek addig, amíg ellenőrizhető külső bizonyíték nem áll rendelkezésre.
