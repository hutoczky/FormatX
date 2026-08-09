# FormatX Suite Pro — nyilvános technikai bizonyítékriport

**Frissítve:** 2026-08-10  
**Nyilvános oldal:** https://www.formatxsuite.com/  
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

## 2. Kötelező webes minőségkapuk

A production jelölt csak akkor tekinthető webes szempontból ellenőrzöttnek, ha a konfigurált Lighthouse-kapuk teljesülnek. A jelenlegi workflow desktop és mobil profilon is három-három futást végez.

- Performance: legalább 90
- Accessibility: 100-as célkapu
- Best Practices: 100-as célkapu
- SEO: 100-as célkapu
- Largest Contentful Paint: legfeljebb 2,5 másodperc
- Cumulative Layout Shift: legfeljebb 0,10
- Szerverválaszidő: legfeljebb 600 ms

A 2026-08-10-én ellenőrzött production deploy desktop és mobil Lighthouse-kapui sikeresen lefutottak. Ezek laboratóriumi minimumkapuk; nem garantálnak minden valódi eszközön és hálózaton azonos pontszámot.

## 3. Valódi 3D MAG

A production MAG aktuális vizuális authority rétege a **reference-lock v30**, natív, indexelt WebGL2 rendereléssel.

Ellenőrzött szerződés:

- egyetlen production WebGL2 render ownership;
- valódi indexelt háromszöggeometria és mélységteszt;
- négycsúcsú, konkáv kristálytest;
- áttetsző cián/kék/ibolya üveg- és filamentrétegek;
- mozgó fehér-cián belső reaktor és 3D gyűrűk;
- nincs raszterkép vagy `drawImage()` alapú 3D-szimuláció;
- mobil és desktop külön kompozíciós ellenőrzés;
- `prefers-reduced-motion` támogatás;
- adaptív render scale és **60+ FPS cél**, de nem minden hardverre garantált eredmény.

A WebGPU v29 külön `?webgpu=1` előnézeti csatorna. Normál production betöltéskor nem veheti át automatikusan a v30 authority szerepét. A korábbi v27 cinematic réteg nyugdíjazott, és nem része a production hot pathnak.

## 4. Live OS interaktív réteg

A CI és a böngészős tesztek ellenőrzik többek között:

- desktop és mobil Chromium működést;
- magyar és angol kezelőfelületet és nyelvváltást;
- valós böngésző-, kijelző-, hálózati és WebGL-képességadatokat;
- kérésre betöltődő grafikus/diagnosztikai rétegeket;
- WebGL nélküli tartalék megjelenítést, ahol az adott modul támogatja;
- vízszintes túlcsordulás hiányát;
- csökkentett mozgási módot;
- a bizonyítéki, ismert hibák, licenc-, adatvédelmi és támogatási oldalak navigációját.

A kijelzett teljesítményadatok nem helyettesítik a valós felhasználói RUM/field mérést. Field INP vagy minden eszközre garantált 120 FPS nincs állítva.

## 5. Termékbizonyíték és kiadási integritás

A kiadás, digest, platformállapot, tesztmátrix és ismert korlátozások külön nyilvános rekordokból ellenőrizhetők.

- Bizonyítéki központ: https://www.formatxsuite.com/scifi-ui/verification.html
- Tesztmátrix: https://www.formatxsuite.com/scifi-ui/test-matrix.html
- Ismert hibák: https://www.formatxsuite.com/scifi-ui/known-issues.html
- Biztonság: https://www.formatxsuite.com/scifi-ui/security.html

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

Adatvédelem: https://www.formatxsuite.com/scifi-ui/privacy.html

## 8. Teljes oldal audit és folytonos görgetés

A nyilvános felület statikus és böngészős integritáskapuja ellenőrzi többek között:

- a publikus HTML-oldalak helyi hivatkozásait és assetjeit;
- a duplikált HTML-azonosítókat;
- a képek alternatív szövegét;
- a külső lapnyitások `noopener` védelmét;
- a CSP-vel ütköző inline eseménykezelőket;
- a release/platform igazság konzisztenciáját;
- a tranzakciós oldalak `noindex` védelmét;
- a letöltési fallback útvonalakat;
- desktop és mobil Chromium nézeteket;
- nyelvváltást és vízszintes túlcsordulást.

A jelenlegi görgető vezérlő **`seamless-v7`**. Natív wheel-, touch- és billentyűzetes inputot használ; scroll snap és kényszerített görgetésátvétel nélkül. Az oldal végén Hero-alapú vizuális híd tartja meg a képi folytonosságot. A teljes oldal nem kerül klónozásra.

## 9. Letöltési és publikus útvonalak

A fő letöltési útvonalak saját, ellenőrzött FormatX végpontot használnak. A kliens nem találhat ki kiadási verziót vagy digestet, ha a hiteles metaadat nem érhető el.

A fő publikus rövid útvonalak kanonikus átirányítást kapnak, többek között:

- `/downloads/`;
- `/support.html`;
- `/privacy.html`;
- `/terms.html`;
- `/verification.html`;
- `/test-matrix.html`;
- `/known-issues.html`.

A nem `www` fődomain a kanonikus `www.formatxsuite.com` címre kerül.

## 10. Nyílt bizonyítékhiányok

Jelenleg nincs publikálva:

- független szakmai termékteszt;
- hitelesített ügyfélesettanulmány;
- Awwwards- vagy más zsűridíj;
- minden támogatott platformra és hardverre kiterjedő végponttól végpontig valós eszközteszt;
- detached signature asset a jelenlegi kiadáshoz;
- minden eszközre garantált 60 vagy 120 FPS field eredmény.

Ezeket a FormatX nem állítja teljesítettnek addig, amíg ellenőrizhető bizonyíték nem áll rendelkezésre.
