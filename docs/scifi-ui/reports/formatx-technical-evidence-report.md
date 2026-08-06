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

## 5. Adatvédelmi határ

A Live OS parancsértelmezése helyben fut. A beírt parancsot nem küldi külső AI-szolgáltatásnak. A weboldal csak a böngésző által ténylegesen elérhető képességeket méri, és nem talál ki mély operációsrendszer-adatokat.

A visszajelző a visszaélések korlátozásához egyirányú hálózati azonosító-lenyomatot és technikai kérésadatokat kezelhet. A kapcsolatfelvételi e-mail opcionális, nem nyilvános.

Adatvédelem: https://www.formatxsuite.com/scifi-ui/privacy.html

## 6. Nyílt bizonyítékhiányok

Jelenleg nincs publikálva:

- független szakmai termékteszt;
- hitelesített ügyfélesettanulmány;
- Awwwards- vagy más zsűridíj;
- minden támogatott platformra kiterjedő valós hardverteszt;
- minden eszközre garantált 120 FPS eredmény.

Ezeket a FormatX nem állítja teljesítettnek addig, amíg ellenőrizhető külső bizonyíték nem áll rendelkezésre.
