# FormatXSuite – PROGRESS.md

Utolsó ellenőrzés: 2026-10-26
Fejlesztési ág: `feature/genesis-cinematic-20261026`
PR: https://github.com/hutoczky/FormatX/pull/578
Állapot: **FOLYAMATBAN – NEM RELEASE-READY**

## 1. Ellenőrzött projektállapot

- Éles belépési pont: `docs/scifi-ui/index.html` → `formatx-intro-bootstrap-r1629.js` → `formatx-mag-birth-live-r533.js`.
- A tényleges 3D tulajdonos: `docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js`, `window.FormatXMagGenesisThreeR1360` interfésszel.
- A régebbi `r700` **nem** az éles intro tulajdonosa.
- A meglévő `makeGenomeParticles()` GPU-shaderrel interpolál DNS → sejtmagnak megfelelő kromatin → négy MAG-kar között, asztali gépen 9600, mobilon 6000 részecskével.
- Az intro jelenleg `t=clamp(r)*10` időzítést használ. A `docs/scifi-ui/GENESIS-CINEMATIC-ACCEPTANCE.md` ezzel szemben 14 másodperces, 7–11 s organikus sejtmag-fejezetet ír elő. **Nyitott elfogadási eltérés.**
- A különálló `genesis-cinematic-morph-r2126.js` prototípus NINCS bekötve az oldalba; nem tekinthető kész funkciónak.

## 2. Elkészült, forráskódban ellenőrzött módosítások

- [x] A tényleges r1280 renderelő azonosítása.
- [x] A DNS nyitójelenetében a központi test kezdeti méretének minimalizálása.
- [x] A központi test méretugrásának eltávolítása a 2,52 s átmenetnél.
- [x] A genetikai részecskék első képkockás láthatósági feltételének és shaderfényének javítása.
- [x] A DNS → embrió és a sejtrétegek időzítésének összehangolása.
- [x] A MAG-karokra érkező részecskék végső mélységi remegésének megszüntetése.
- [x] Külön 8192 részecskés kísérleti shader-modul létrehozása és WebGL1 `gl_VertexID` javítása; **nem integrált**.

## 3. Hiányzó funkciók / elfogadási kapuk

- [ ] A 10 s/14 s idővonal eltérésének feloldása, az elvárt organikus sejtmag és MAG végállapot egyeztetése.
- [ ] Azonos részecskék folytonos DNS → sejtmag → MAG útjának képkockánkénti vizuális igazolása.
- [ ] A DNS első képkockás olvashatósága és a központi test tényleges rejtettsége ellenőrzött képernyőképekkel.
- [ ] Stúdióminőségű megvilágítás, optika, térbeli sziluett és átmenetek referencia-összevetése.
- [ ] Mobil WebGL context lost/restored, reduced-motion és fallback teszt.
- [ ] 360×800, 390×844, 412×915, 768×1024, 1440×900 képernyőméretek, cold/warm load, 30 s stabil futás.
- [x] Az aktív r1280 és az R2126 explicit szintaktikai CI-kapujának hozzáadása (workflow-módosítás, nem teszteredmény).
- [ ] Szintaktikai teszt, projekt preflight, CI és vizuális regresszió PASS.
- [ ] Lighthouse mobil/desktop mérések és elfogadási küszöbök dokumentálása.
- [ ] Jóváhagyott merge, éles deploy, éles URL smoke-test és visszagörgetési terv.

## 4. Végrehajtható szakaszok

1. **S0 – Audit:** belépési pontok, elfogadási eltérések, függőségek. Kimenet: ez a PROGRESS.md.
2. **S1 – Forrásminőség:** syntax check és determinisztikus idővonal-ellenőrzés. Csak sikeres teszt után commit.
3. **S2 – DNS-születés:** első képkocka, két spirálszál, térbeli geometria. Teszt: 0 / 1 / 3 s screenshot.
4. **S3 – Valódi morfózis:** DNS → kromatin → organikus sejtmag; részecskeazonosság. Teszt: shader- és vizuális képkockák.
5. **S4 – MAG-összeállás:** négy kar, mechanika, optika, hero-handoff. Teszt: 5–10 s keyframe összevetés.
6. **S5 – Reszponzivitás és stabilitás:** öt viewport, fallback, reduced-motion, context recovery.
7. **S6 – Release:** CI PASS, kézi vizuális jóváhagyás, merge, deploy és éles smoke-test.

## 5. Teszteredmények

| Vizsgálat | Állapot | Bizonyíték |
|---|---|---|
| Forrás- és belépésipont-audit | PASS (statikus) | GitHub fájltartalom ellenőrizve |
| Módosítások GitHubra mentése | PASS | PR #578 commitjai |
| `node --check` a jelenlegi módosításokon | PASS (CI P0 fast source loop) | Run 40408446602, targeted job 121872481885 sikeres; explicit r1280/R2126 ellenőrzés |
| GitHub Actions a PR head SHA-n | RÉSZLEGES / FAIL | Runok 40408446602 PASS; 40408446493, 40408446951, 40408446484, 40408446653, 40408446692 FAIL |
| Desktop/mobil WebGL screenshot | NEM FUTTATOTT | Böngészős bizonyíték hiányzik |
| Lighthouse | NEM FUTTATOTT | Mérési riport hiányzik |
| Éles telepítés | NEM TÖRTÉNT MEG | Draft PR, nincs merge |

### 2026-10-26 – CI hibatriázs

- **PASS:** P0 fast source loop, run `40408446602`, job `121872481885`.
- **FAIL:** production candidate run `40408446493`, job `121872184333`: `R2201 cinematic stage missing: const appear=smooth((t-3.52)/.76)` – elavult, szövegillesztésre épülő tesztelvárás. A teszt a jelenlegi `3.28 / 1.02` átmenetre frissítve, commit `ad49f21d`; új CI eredmény még szükséges.
- **FAIL:** mobilos R2104 run `40408446484` és R2103 run `40408446653`: `R2104 cinema material did not render in original phone canvas`. **Valós, nyitott vizuális regresszió; nem megoldott.**
- **FAIL:** organism-main run `40408446951`: Chromium telepítési lépés; környezeti hibának tűnik, részletes log szükséges.
- **FAIL:** Lighthouse CI run `40408446692`: mind desktop, mind mobil lépés hibás; pontszámok és részletes okok további vizsgálata szükséges.

### 2026-10-26 – S1 folytatás

- Újabb production CI run `40409528623` hibája: `Three.js storyboard: const appear=smooth((t-3.52)/.76)`. Az R2182 storyboard, R2188 cinematic origin és R2143 route ellenőrzéseket az aktív `3.28 / 1.02` időzítéshez igazítottam (`3ac501fd`, `cefb8aa7`, `27d356da`). **Új CI PASS még nem igazolt.**
- A mobilos runok `40409528612` és `40409528701` továbbra is hibásak: `R2104 cinema material did not render in original phone canvas`. Ez nem tesztidőzítés-problémaként kezelendő; renderelési vizsgálat szükséges.
- Következő: új CI futás ellenőrzése, majd mobil canvas screenshot és a tényleges pixel/anyag megjelenítés diagnosztikája.

### 2026-10-26 – Új CI ellenőrzés

- Run `40409996865`: P0 fast source loop **PASS**.
- Run `40409996879`: canonical content, evidence és visual contracts **PASS**.
- Run `40409996845`: production preflight **FAIL**, pontosan `Three.js storyboard: const grow=smooth((t-3.76)/.72)`. Az R2182 storyboard teszt organikus és sejt növekedési időzítése frissítve (`041130c8`); újrafutási eredmény még nincs.
- Run `40409996995` és `40409996863`: mobil MAG canvas **FAIL**, változatlan, nyitott renderelési hiba.
- Run `40409996876`: Chromium telepítés **FAIL**.
- Run `40409996898`: Lighthouse desktop/mobil **FAIL**.

### 2026-10-26 – S2 mobilos fallback hiba okának azonosítása

- Legutóbbi production run `40412250658`: **PASS**; P0 run `40412250668`: **PASS**.
- R2104 job `121885928928`: 4,40 s-nél a `fxMagFallbackMaterialR2104` értéke üres. A `formatx-mag-reference-film-r649.js` forrás szerint a fémes MAG szándékosan csak `t>5.58` után jelenik meg; az eredeti teszt tévesen a biológiai szakaszban is fémanyagot követelt. A teszt most 4,40 s-nél a fém hiányát, 8,50 s-nél a fém jelenlétét ellenőrzi, commit `00aef867`.
- A fallback loader aktuális `r2182-studio-depth-first-genome` verzióját is a tényleges betöltési állapothoz igazítottam; a korábbi `r2113` ellenőrzés elavult.
- **Új CI-futás szükséges**; a módosított tesztet még nem minősítjük PASS-nak. A Lighthouse és a Chromium telepítés hibái nyitottak.

### 2026-10-26 – S2 mobil PASS, S5 Lighthouse mérési alapvonal

- PR head `5a7937c9` CI: R2104 run `40413514780` **PASS**, R2103 run `40413514570` **PASS**, production `40413514555` **PASS**, P0 `40413515096` lekérdezéskor még folyamatban volt.
- Lighthouse run `40413514815`, job `121891259179`: **FAIL**, valódi mérési küszöbök, nem pusztán környezeti hiba.
- **Desktop Performance:** 0,89 / 0,89 / 0,91; LCP 1667 / 1750 / 1721 ms; TBT 111 / 16 / 26 ms. Performance követelmény ≥0,95.
- **Mobil Performance:** 0,83 / 0,81 / 0,83; FCP 1839 / 1845 / 1823 ms; TBT 364 / 427 / 365 ms; Speed Index 6648 / 6697 / 6638 ms. Hibás küszöbök: Performance, FCP, TBT.
- Következő mérésalapú optimalizálás: mobil JS main-thread hosszú feladatok és TBT, első render/FCP, Speed Index; desktop LCP és Speed Index. **Nem szabad a CI-küszöböket lejjebb venni.**

### 2026-10-26 – S5 forrásaudit, optimalizálási döntés

- A `75204ec7` utáni futásokban a production `40414573072` **PASS**, a mobilos R2103/R2104 és Lighthouse munkafolyamatok a lekérdezés pillanatában **in_progress**; az új Lighthouse pontszámokat még nem lehet sikeresnek állítani.
- Az éles HTML forrásban legalább 26 külön `<script defer>` szerepel; a `defer` szkriptek a HTML feldolgozása után, a DOMContentLoaded előtt hajtódnak végre. A mobilos TBT lehetséges forrása a nagy mennyiségű kezdő JS; **hipotézis, nem profilozással igazolt ok**.
- A mobilos referenciafilm forrása 41 654 karakter. A 2D canvas fallback már tartalmaz pixelbudgetet, DPR-korlátot és futásidejű visszavételt; ennek vak eltávolítása tilos.
- A `Validate organism-first FormatX main site` futás `40414573164` **FAIL** a Chromium telepítés lépésénél, nem a film vizuális assertjénél.
- **Következő végrehajtás:** a Lighthouse JSON trace-ből a hosszú feladatok (long tasks), script evaluation és render-blocking erőforrások pontos rangsorolása; csak ezután egyetlen, nem kritikus JS betöltésének késleltetése, azonnali mobil+desktop Lighthouse és teljes regressziós CI teszttel. 0,95 küszöböt nem szabad csökkenteni.

### 2026-10-26 – S5 Lighthouse JSON-riportok tényleges elemzése

- Letöltöttem a `40414747601` futás `lighthouse-results` artifactját (`12695102114`), mindkét profil részletes LHR JSON-ját elemeztem.
- **Mobil, vizsgált első futás:** Performance **0,72**; `formatx-crystal-organism-r326.js` long task **303,775 ms** és **252,733 ms**; ugyanennek a scriptnek a bootup auditban **1795,676 ms total**, ebből **251,834 ms scripting**. A main thread **5561,187 ms**, ebből **1783,345 ms Style & Layout**. Ez az elsődleges célpont.
- **Desktop, vizsgált első futás:** Performance **0,84**; `formatx-mini-mag-assistant-r459.js` long task **171 ms**, `formatx-crystal-organism-r326.js` long task **111 ms**. A main thread **1544,985 ms**, ebből **375,824 ms Style & Layout**.
- **Render blocking, mobil:** `formatx-genesis-studio-r2160.css` **721 ms**, `formatx-dna-first-frame-r2181.css` **871 ms** potenciális audit késleltetés. Mobil LCP render delay **1842,418 ms (99%)**; desktop LCP render delay **1713,599 ms (93%)**.
- Ezek a **legelső** LHR futás értékei, nem a három mérés átlaga. A pontszámokat nem szabad más futásból vett 0,81–0,83 értékekkel összekeverni.
- **Következő konkrét kódmunka:** `formatx-crystal-organism-r326.js` hosszú inicializációs/renderelési feladatainak vizsgálata és felosztása; a mini-assistant induláskori munkájának késleltetése csak akkor, ha az elsődleges UI és accessibility szerződések megmaradnak. Minden módosítást Lighthouse és funkcionális regresszió kövessen. A CSS-t nem szabad vakon deferredre váltani, mert a DNA első képkockája kritikus.

### 2026-10-27 – S5 R326 geometria profilozási kapu

- Az `f864368c` utáni GitHub Actions futásban (`40416915379`) production **PASS**, mobil R2103 (`40416915378`) **PASS**, R2104 (`40416915366`) **PASS**, P0 (`40416915375`) **PASS**; Lighthouse (`40416915350`) továbbra is **FAIL**.
- Az R326 forrásban a `finishBoot(program)` szinkron módon építi a teljes `buildOrganismGeometry(softwareRenderer)` geometriát, majd GPU buffereket tölt fel. Ez alkalmas a hosszú main-thread feladatok előidézésére, de az ok-okozat még mérendő.
- `74871d9`: nem invazív mérés hozzáadva: `document.documentElement.dataset.fxCoreGeometryBuildMsR2202` és `performance.measure('formatx:r326:geometry-build-r2202')`. A geometriát, a tesszellációt és a renderelést nem változtattam. **Új CI még nem ellenőrzött.**
- Következő: valódi mobil és desktop trace-ben hasonlítsd össze a `geometry-build-r2202` időt a teljes long taskkal; ha a geometria dominál, bontsd kisebb aszinkron feladatokra vagy dolgozz ki worker-alapú adatgenerálást; GPU uploadot a WebGL főszálon tartsd. A Lighthouse ≥0,95 változatlan.

## 6. Ismert hibák és kockázatok

1. **Kritikus:** a 14 másodperces elfogadási narratíva nem egyezik a 10 másodperces implementációval.
2. **Magas:** a vizuális minőség és a GPU-kompatibilitás nem ellenőrzött.
3. **Közepes:** külön R2126 prototípus redundáns a fejlettebb r1280 részecskerendszer mellett; nem szabad vakon bekötni.
4. **Közepes:** a meglévő CI sok régebbi renderelőfájlt ellenőriz, az aktuális r1280 explicit syntax checkje külön igazolandó.

## 7. Következő végrehajtandó feladat

**S2:** R2103 és R2104 mobil fallback tesztek PASS a `5a7937c9` commiton. **S5:** az R326 geometriaépítés időmérése bekerült (`74871d9`); ellenőrizd a CI-t és a `formatx:r326:geometry-build-r2202` trace-mérést, majd bizonyított szűk keresztmetszetre készíts optimalizálást. Módosítás után teljes mobil+desktop Lighthouse és funkcionális regresszió. A 0,95 Performance küszöb változatlan. Ne merge-elj, amíg a teljes vizuális és Lighthouse kapuk nem sikeresek.

**Folytatási szabály:** minden új munkamenet elején olvasd ezt a fájlt, csak az itt nyitott tételeket folytasd. A PASS státusz kizárólag ténylegesen lefuttatott teszthez rendelhető.
