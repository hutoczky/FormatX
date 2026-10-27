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

### 2026-10-27 – S5 GPU bufferfeltöltés mérési szakasz

- A `bc0bcd80` utáni futások: production `40417872551` **PASS**, mobil MAG vizuális bizonyítás `40417872598` **PASS**, canonical MAG runtime `40417872554` **PASS**, R2103 `40417872454` **PASS**, R2104 `40417872575` **PASS**, Lighthouse `40417872797` **FAIL**.
- `c1b32b5`: az R326 `finishBoot` függvényben külön `performance.measure('formatx:r326:buffer-upload-r2203')` és `data-fx-core-buffer-upload-ms-r2203` / `root.dataset.fxCoreBufferUploadMsR2203` mérés készült. Nem hív `gl.finish()`-t, így a JS oldali feltöltési hívások idejét méri, nem a teljes aszinkron GPU-végrehajtást.
- A korábbi `formatx:r326:geometry-build-r2202` és az új `buffer-upload-r2203` együtt szétválasztja a CPU-s geometriaépítés és a JS/WebGL feltöltés idejét. **Egyik méréshez sem áll rendelkezésre még új összehasonlítható trace-eredmény; CI futtatás ellenőrzendő.**
- Következő: Chrome Performance trace és mobil Lighthouse regresszió a két mérés alapján; csak bizonyítottan domináns fázist optimalizálj. Ne rontsd a MAG geometriáját vagy a Genesis vizuális követelményeit.

### 2026-10-27 – S5 tényleges R326 memóriaoptimalizálás

- A `6483a880` utáni CI-ben production `40418671237` **PASS**, mobil MAG vizuális `40418671233` **PASS**, R2103 `40418671151` **PASS**, R2104 `40418671156` **PASS**. A Lighthouse `40418671133` **FAIL** (az új R2204 optimalizálás előtti mérés).
- `1993e3a`: a WebGL `bufferData` hívások után `geometry.arrays.length=0` elengedi a hét CPU-s `Float32Array` referenciát. A további kódrészletek csak `geometry.count`, `geometry.topology`, `geometry.tendrils`, `geometry.microFibers` mezőket használják; ezek megmaradnak.
- Várható hatás: kevesebb tartós CPU memória / GC nyomás; **még nincs mért Lighthouse vagy memóriaérték, ezért nincs bizonyított pontszámjavulás**. Új CI kötelező.
- A `Validate organism-first FormatX main site` workflow Chromium telepítési hibája külön infrastruktúra-ügy maradt.
- Következő: ellenőrizd a `1993e3a` és jelen PROGRESS commit CI-ját, különösen R326 runtime és mobil screenshot regresszió; hasonlítsd össze a Lighthouse méréseket, majd a geometriaépítés és bufferfeltöltés külön profilozását.

### 2026-10-27 – S5 Chromium CI-telepítés javítása

- `87ad770d` utáni workflow-k: production `40419243757` **PASS**, mobil vizuális `40419243758` **PASS**, R2103 `40419243955` **PASS**; az első lekérdezéskor több további futás még folyamatban volt.
- A `Validate organism-first FormatX main site` `40419243789` továbbra is **FAIL** az `Install Chromium` lépésnél. A workflow közvetlenül a repo gyökerében futtatta a `npm install --no-save playwright@1.55.0` parancsot.
- `5f75ffb`: a Chromium Playwright telepítése izolált `$RUNNER_TEMP/formatx-organism-browser` prefixbe került, Playwright `1.62.0` verzióval; a teszt `NODE_PATH` környezeti változón keresztül találja meg. A böngészőteszt és elfogadási állítások változatlanok.
- Ez **telepítési hiba elleni javítás**, még nem bizonyított CI PASS. Következő: ellenőrizd az új `Validate organism-first` workflow teljes futását, és ha átjut a telepítésen, a tényleges vizuális teszt eredményét is.

### 2026-10-27 – CI státusz és filmes időtengely audit

- A `da5f18a` commit GitHub Actions futásaiban production `40419629655` **PASS**, mobil MAG vizuális `40419629693` **PASS**, R2103 `40419629647` **PASS**, R2104 `40419629866` **PASS**, teljesítményforrás-szerződések `40419629724` **PASS**.
- A javított organism-main workflow `40419629737` a lekérdezéskor az `Install Chromium` lépésben **in_progress**; a tényleges vizuális teszt még nem indult el. PASS státuszt nem kap.
- A `GENESIS-CINEMATIC-ACCEPTANCE.md` 0–3 s DNS, 3–7 s morph, 7–11 s nucleus, 11–14 s reveal felosztást követel. A tényleges `formatx-mag-genesis-three-r1280.js` `render(r,time)` függvényében `const t=clamp(r)*10` szerepel. A teljes filmes szekvencia 10 s belső időre van kalibrálva; a 14 s elfogadási dokumentum ettől eltér.
- **Nem javítható** kizárólag `*10` → `*14` cserével: előbb az R533 szekvenciavezérlő időskáláját, a kamera- és részecske-kulcsképeket, a CSS-átmeneteket és a screenshot-assert időpontokat együtt kell feltérképezni.
- Következő: ellenőrizd a Chromium telepítés befejezését; Lighthouse új eredményeit; készíts explicit R533 ↔ R1280 filmes időtengelyt, és egyetlen konzisztens storyboard-kontraktust.

### 2026-10-27 – Organism panel close hit-test regresszió

- A Chromium-telepítési javítás után a `40419629737` workflow már eljutott a `Test desktop and mobile organism interactions` lépésig, de az **FAIL**.
- Letöltött bizonyíték: `formatx-organism-main-evidence`, artifact `12697182887`, `organism-main-report.json`. Desktop: `navigation-start`, `site-ready`, `initial-state`, `pricing-panel-open`, `currency-updated` mind sikeres. A következő `.fx-organism-console-close` Playwright kattintás 30 másodperc után timeoutolt; az elem látható/engedélyezett/stabil, de a kattintás nem fejeződik be.
- `31f4f8a`: közvetlenül a kattintás előtt `document.elementFromPoint` alapján ellenőrizzük a tényleges hit-targetet és naplózzuk a gomb/overlay pozícióját; a timeout 10 s. A teszt nem erőlteti a kattintást és nem kerüli meg a hibát.
- Következő: új artifact `desktop: close-hit-test` adatából azonosítsd az esetleges eltakaró réteget, és **az éles CSS/JS interakciót** javítsd; majd desktop+mobil organism CI PASS szükséges.

### 2026-10-27 – R2206 fullscreen panel hidden CSS javítás

- A `40420345381` organism-main workflow a lekérdezéskor már a tényleges desktop/mobil böngészőtesztet futtatta, de végső eredmény még nem állt rendelkezésre.
- A `docs/scifi-ui/styles/organism-interface-layering.css` `.fx-organism-interface-ready .fx-organism-console { display:block !important; }` szabályának specifikussága megegyezik a `organism-interface.css` `.fx-organism-console[hidden] { display:none !important; }` szabályával. Ha a layering CSS később töltődik be, a panel `hidden` állapota vizuálisan felülírható.
- `ead5af38`: explicit `.fx-organism-interface-ready .fx-organism-console[hidden] { display:none !important; }` szabály beépítve. Ez **valódi CSS szemantikai hibát javít**, de önmagában még nem bizonyítja, hogy az előző Playwright-kattintási timeout egyetlen oka ez volt.
- Következő: organism-main desktop+mobile CI, screenshot/overlay regresszió, Lighthouse összehasonlítás. Hibás futás esetén a `31f4f8a` hit-test diagnosztikát olvasd ki, és a tényleges eltakaró réteget javítsd.

### 2026-10-27 – Organism CI PASS és vizuális rejtés regressziós kapu

- A `40420345381` organism-first workflow **SUCCESS** (desktop+mobile browser interaction), artifact `12696882988`. Ez az első megerősített teljes PASS a Chromium telepítési hiba javítása után, még az `ead5af38` CSS javítás előtti commiton.
- `a8e67e2`: a desktop organism-main teszt a kezdetben `hidden` és a bezárás után `hidden` konzolra egyaránt `getComputedStyle(...).display === 'none'` assertet tartalmaz. Így a korábban elrejtettnek jelölt, de CSS miatt még kirajzolt overlay többé nem számít sikeres tesztnek.
- Következő: új CI ellenőrzés az `ead5af38` és `a8e67e2` módosításokra; mobilon ugyanezen CSS-rejtés regressziós ellenőrzés, Lighthouse.
- A 14 s storyboard eltérés és a Lighthouse ≥0,95 kapu továbbra is nyitott.

### 2026-10-27 – R2208 mobilos fullscreen overlay regresszió

- `dd7fa40` commit workflow `40420610562` organism-main a lekérdezéskor **in_progress**; Lighthouse `40420610629` még **pending**. Az új szigorúbb desktop CSS ellenőrzésre nincs még PASS bizonyíték.
- `0601f2e`: a 390×844 mobil érintéses organism-main tesztben is ellenőrizzük a `getComputedStyle(#fx-organism-console).display === 'none'` feltételt a kezdeti `hidden` állapotban és a bezáró `tap()` után.
- A mobilon elfedő fullscreen réteg többé nem mehet át a teszten pusztán `element.hidden===true` értékkel. A teszt nem használ `force` kattintást.
- Következő: új desktop+mobile organism CI PASS, majd Lighthouse; szükség esetén az `organism-main-report.json` és failure screenshot alapján javítás.

### 2026-10-27 – Mobil overlay nyitás/zárás CSS háromállapotú kapu

- `deaee6b2` commit organism-main `40420711411` a lekérdezéskor még az asztali/mobil böngészőtesztet futtatta; nem jelenthető PASS.
- A `formatx-mag-birth-live-r533.js` tényleges `DURATION=10000` ms, az R1280 Three.js `render(r,time)` pedig `t=clamp(r)*10`. Így az időzítési eltérés a vezérlőben és a renderelőben egyaránt megerősített. A 14 másodperces átállás koordinált storyboard-változtatás, nem puszta egyértékes csere.
- `ea64486`: a 390×844 mobilos organism-main teszt most már a **nyitott** panel CSS-kijelzését is ellenőrzi, a kezdeti rejtett és a bezárás utáni rejtett állapot mellett. Ezzel a `hidden → visible → hidden` vizuális állapotgép ténylegesen tesztelt.
- Következő: CI és Lighthouse eredmények ellenőrzése, majd R533/R1280 szinkronizált 14 s storyboard implementáció előkészítése.

### 2026-10-27 – R2209 Playwright stabilitási hiba bizonyítéka

- A `40420836368` organism-first workflow **FAIL**, artifact `12697229052` (`organism-main-report.json`). Desktop: `hidden-console-css=none`, `pricing-panel-open`, `currency-updated` mind PASS.
- A `desktop: close-hit-test` eredmény: `x=1341`, `y=65.390625`, `hitTag=BUTTON`, `hitClass=fx-organism-console-close`, `buttonIsHit=true`, `pointerEvents=auto`. Tehát a gomb **nincs eltakarva** a mért ponton.
- A `locator.click` **10 másodpercig** a `waiting for element to be visible, enabled and stable` állapotban marad. A kiváltó ok még nem bizonyított; a CSS `hidden` javítás ezt önmagában nem oldotta meg.
- `8ac1893`: a kattintás előtt 12 `requestAnimationFrame` alatt mintavételezi a gomb bounding-box koordinátáit, valamint a szülő panel `animation` és `transform` állapotát. Az új `desktop: close-motion` artifact alapján dönthető el, kell-e animációs stabilizálás az éles CSS-ben.
- A teszt továbbra sem használ erőltetett kattintást. Következő: friss artifact és célzott CSS/JS javítás, teljes desktop+mobil PASS.

### 2026-10-27 – R2210 fullscreen panel hit-target stabilizálás

- `95bf8f95`: az éles `organism-interface-layering.css` `fx-console-fullscreen-enter` animációjából eltávolítottam a teljes dialog `scale(1.018) → scale(1)` transzformációját és `blur(5px) → blur(0)` filterét; az `opacity` áttűnés megmaradt.
- Indok: a teljes dialogot mozgató/torzító animáció a benne lévő bezárógomb kattintási téglalapját is változtatja. Az új megoldás a panel geometriai helyzetét stabilan tartja, csökkenti az animációs renderköltséget, és megtartja a vizuális áttűnést.
- **Nem igazolt még**, hogy a korábbi Playwright `stable` timeout kizárólag ettől szűnik meg. A `8ac1893` pozíciómintavételező teszt és az új desktop+mobil CI ezt ellenőrzi.
- A Genesis 14 s filmes időtengelye továbbra is nyitott, a PR draft marad.

### 2026-10-27 – R2211 valós 3D sejtmag látványfejlesztés

- `d1c7422`: az éles honlapot kiszolgáló `docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js` `makeEmbryoFilm()` része új, térbeli sejtmag-belsőt kapott: 3 cyan/coral/violet `TorusGeometry` kromatingyűrű, külön áttetsző külső fényburok `SphereGeometry`, közös organellum-középpont, fényáteresztő `AdditiveBlending`.
- A `render` biológiai fázisa az új elemek opacitását a már meglévő `visible=appear*dissolve` időablakhoz köti. A mechanikus MAG fázisban így eltűnnek a biológiai részek, és a korábbi időzítés megmarad.
- `6f29288`: a gyűrűk forgása abszolút `time` alapú, tehát nem képkockánként összeadott, eltérő FPS mellett sem gyorsul/lassul.
- **Nem végleges vizuális elfogadás:** a változtatás éles renderelő-kód, de képi screenshot-összehasonlítás és új CI szükséges. A PR továbbra is draft, az éles `master` ág változatlan.
- Következő: `node --check`, MAG vizuális CI, mobil/desktop screenshots és a sejtmag megfelelő kompozíciójának ellenőrzése; utána további felületi réteg/anyag finomítás.

### 2026-10-27 – R2212 biológiai sejtmag perem és mélységi olvashatóság

- `8709795`: a tényleges Three.js `makeEmbryoFilm()` renderelőben két finom, egymást metsző, türkiz és korall színű membránkontúr épül fel 3D `TorusGeometry` geometriával. A kontúrok a sejt pulzusával együtt lélegeznek, lassú abszolút idejű forgással, az eddigi biológiai `visible` időablakhoz kötött opacitással.
- A külső sejtmembrán átlátszósága `.86` → `.76`, hogy a korábban hozzáadott belső nukleoluszgyűrűk ténylegesen jobban átsejljenek. A textúra és a fizikai membránanyag változatlan.
- A membránkontúr geometriája mobilon 72, desktopon 112 szegmens; nincs extra utófeldolgozási/bloom passz és nincs frame-enkénti új geometriaallokáció.
- **Ellenőrzés nyitott:** ezen a commiton nincs még sikeres CI és tényleges mobil/desktop WebGL screenshot vizuális összehasonlítás. A `master` nem változott; nem nevezhető végleges stúdióminőségű késznek.
- Következő: MAG visual proof és R1280 syntax ellenőrzés, képkockák összehasonlítása a biológiai fázisban, utána szükség szerinti színtér/kompozíció javítás.

### 2026-10-27 – R2213 Genesis production CI regresszió javítása

- `40421736983` production workflow **FAIL**, job `121917752647`, konkrét hiba: `R2201 cinematic stage missing: this.embryoMaterial.opacity=.86*visible`. Az új, tudatosan átlátszóbb R2212 membránérték `.76`, ezért a régi literális forráskontraktus hibás.
- `877ccba`: a `.github/scripts/validate-genesis-visual-r2201.cjs` elvárt értéke `.76`; emellett a teszt ellenőrzi a háromdimenziós nukleoluszgyűrűk, membránkontúrok és pulzáló halo meglétét is.
- Következő: új production és P0 CI eredmények ellenőrzése. A tesztmódosítás nem helyettesíti a WebGL screenshot alapú minőségi ellenőrzést, ezért a sejtmag még nem tekinthető késznek.

### 2026-10-27 – R2214 második gyártási regresszió

- `40422021258` production workflow **FAIL**, job `121918595911`: a `validate-biophotonic-genesis-r2199.cjs` továbbra is a régi `this.embryoMaterial.opacity=.86*visible;` kódrészletet követelte. Az előző R2201 kontraktus javítása után ez volt a következő tényleges blokkoló.
- `d32f4f1`: a biophotonic WebGL kontraktus most a tudatosan megváltoztatott `.76` membrán-opacitást ellenőrzi. Az organellum és a DNA/photonic egyéb kontraktusai változatlanok.
- Több CI ellenőrzés már PASS az előző commiton (mobil MAG visual proof, R2103, R2104, production architecture, bilingual, web performance contract, hero/nav). **Production még nem PASS**; következő friss futás eredménye szükséges.

### 2026-10-27 – R2215 Genesis chronology és intro-route CI

- `40422525883` production **FAIL**, job `121920164759`: `validate-cinematic-origin-r2188.cjs` régi `.86` membránértéket követelt, miközben az új renderelő `.76` értéket használ.
- `8af9afd`: a chronology forráskontraktus frissítve a tényleges `.76` biológiai membránra.
- `7a9b3f6`: az `validate-intro-three-route-r2143.cjs` ellenőrzésében is megtörtént ugyanennek az elavult értéknek a cseréje; az R2201 és R2199 tesztek már korábban frissültek.
- `40422525819` organism-main **FAIL** a desktop+mobile interakciós lépésben. A pontos új okhoz a futás JSON artifactjának vizsgálata szükséges; a production hibától külön kell kezelni.
- Következő: új CI és organikus panel browser artifact elemzése, valódi Genesis screenshot, nem kizárólag literális kódellenőrzés.

### 2026-10-27 – R2216 éles production PASS és Playwright hibabizonyíték

- `40422759877`: **production workflow SUCCESS** a `03c97a23` fejlesztési ágon; nem jelenti a `master` vagy a nyilvános weboldal frissítését.
- `40422759926`: mobile MAG visual proof **SUCCESS**; `40422759839` mobile/production architecture **SUCCESS**; `40422759920` site integrity **SUCCESS**; `40422759765` bilingual coverage **SUCCESS**; `40422760009` performance contracts **SUCCESS**.
- A korábbi `40422525819` organism-main failure artifact `12697982051` JSON diagnosztikája: a close gomb közepét valóban a `BUTTON.fx-organism-console-close` foglalja el, `pointerEvents:auto`, a 12 animációs képkocka összes bounding-box mintája **azonos** `[1314,38.39]`, `shellTransform:none`. A korábbi animációs pozíció-instabilitás hipotézist a mérések **nem támasztják alá**.
- Playwright click napló: `visible, enabled and stable`, `scrolling into view done`, majd **`performing click action` után 10s timeout**. Következő célzott vizsgálat: event-loop blokkolás és a `organism-interface.js` close eseménykezelő, illetve Chromium performance trace. **Nem szabad** a kattintást `force:true`/DOM `.click()` megkerüléssel elfedni.
- `40422759821` új organism-main ellenőrzés lekérdezéskor még **in_progress**. A sejtmag screenshotos elfogadása és 14s storyboard összehangolása továbbra is nyitott.

### 2026-10-27 – R2216 erőforrás-felszabadítás és CI állapot

- A `03c97a2` commit futásainál production `40422759877` **PASS**, organism-main `40422759821` **PASS**, canonical MAG runtime `40422759914` **PASS**, mobile visual proof `40422759926` **PASS**. Lighthouse, P0 és néhány más workflow **cancelled**; ezeket nem szabad PASS-nak minősíteni.
- A valós `r1280` renderer `destroy()` metódusa eddig minden mesh geometriájára külön `dispose()`-t hívott. Az új nukleoluszgyűrűk és membránkontúrok azonos geometriát osztanak meg.
- `7fbb889`: `Set` alapú deduplikációval minden közösen használt Three.js geometria és anyag egyszer szabadul fel. Az élő renderelési képkockák nem változnak.
- A sejtmag megjelenésének végső vizuális összehasonlítása és a 14s storyboard eltérés továbbra is nyitott. Új CI eredmények szükségesek az R2216 commitra.

### 2026-10-27 – R2217 CI diagnosztika tényleges artifact alapján

- `a950136` commit: production, canonical MAG, R2103, R2104, P0, public integrity és mobile MAG proof **PASS**. Organism-main `40448487560` **FAIL**; Lighthouse `40448487648` **FAIL**.
- Az organism-main artifact `12709182793` `organism-main-report.json` fájlját megvizsgáltuk: desktop site-ready, initial-state, hidden-console-css és pricing-panel-open PASS, majd az **EUR currency button** Playwright kattintása `Timeout 30000ms` miatt megállt, mert nem lett stabil. Ez nem a korábbi close-button hiba.
- `73d5b92`: a teszt 12 animation frame-en keresztül rögzíti az EUR gomb pozícióját/méretét, a valódi `elementFromPoint` hit targetet, a panel CSS animációját és transzformációját. A kattintás timeoutja 10s a gyorsabb és pontosabb CI-visszajelzéshez. **Ez diagnosztika, nem állítjuk, hogy a hiba javult.**
- Lighthouse futás 40448487648 mind desktop, mind mobile küszöbellenőrzésen FAIL; a részletes JSON audit további elemzése szükséges, az elvárt ≥0.95 nem teljesült.
- Következő: új organism-main artifact alapján célzott CSS/runtime javítás, Lighthouse JSON részletes bottleneck-elemzés, valódi 3D nucleus képkockák vizsgálata.

### 2026-10-27 – R2218 pricing scroll stabilizálás

- `40452452338` production PASS; `40452452154` mobile MAG visual proof PASS; `40452452253` organism-main és `40452452206` Lighthouse az ellenőrzéskor még in_progress/pending, ezért nincs új PASS állítás.
- `36f6972`: az organism-main Playwright desktop EUR gomb előtt `scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})` hívással kifejezetten a belső pricing panelt állítja stabil, középre igazított pozícióba. A 12-frame hit-test diagnosztika megmarad.
- Ez célzott interakciós tesztstabilizálás, nem a Genesis vizuális minőség elfogadása. Új CI szükséges, a 0.95 Lighthouse kapu változatlan.

### 2026-10-27 – R2219 DNS → sejtmag → MAG audit és új regressziós kapu

- Ellenőrizve: a felhasználó által említett `477b7e95`, `7e69e573`, `641bca1d` R2125 commitok léteznek a GitHubban. A jelenlegi feature branch élő r1280 kódja **nem** tartalmazza az R2125 `stage1` változóját, mert a későbbi r1280 implementáció `updateCore()` útvonala már `coreGroup.visible=visible>.002`, `t<2.52 → sc=.001`, `appear=smooth((t-3.28)/1.02)` feltételekkel dolgozik. Nem szabad a régi R2125 patch-et vakon újra alkalmazni.
- A valós GPU `makeGenomeParticles()` 6000/9600 részecskét hoz létre; párosított DNS-bázisok egyazon kromatin-pontot és MAG-kar útvonalat kapnak. Ez forráskód-audit, **nem** vizuális bizonyíték.
- `f8ca393`: új `.github/scripts/validate-genesis-dna-first-r2219.cjs` determinisztikus forrás/idővonal regressziós teszt. 0–3.28 s között a biológiai mag rejtett, 3.8–4.5 s körül látható; ellenőrzi a paired particle alapinvariánsokat és az elavult korai mechanikai mag kikapcsolását.
- `e21b735`: az új teszt bekötve a P0 fast source loop CI-be. **Új CI eredmény még szükséges**, a WebGL képkockák és a 14s storyboard továbbra is nyitottak.
- Következő: P0 futás tényleges PASS, 0/1/3/4.5/7/10 s WebGL képkockák, majd koherens 14s idővonal és produkciós vizuális jóváhagyás. Éles deploy/merge nincs engedélyezve.

### 2026-10-27 – R2220 koherens Genesis elfogadási történet

- `1611cfe`: `docs/scifi-ui/GENESIS-CINEMATIC-ACCEPTANCE.md` átvezetve a tényleges `DURATION=10000` és `t=clamp(r)*10` idővonalra. A korábbi 14 másodperces specifikáció tévesen a sejtmagot írta végső hero elemnek, szemben a kifejezett DNS → sejtmag → MAG igénnyel.
- Az új négy fejezet: 0–3.28 s DNS, 3.28–5.66 s sejtmag, 5.58–8.45 s MAG-összeállás, 8.45–10 s kész MAG hero-handoff. A dokumentáció változott, nem a film futásideje.
- A `6aecd79` commit CI-futásainak jelentős része még folyamatban volt a lekérdezéskor; a `f8ca393` R2219 teszt új P0 eredménye továbbra is ellenőrizendő.
- Vizuális WebGL elfogadás, mobil kontextus-helyreállítás, Lighthouse és élesítés továbbra is nyitott. A projekt nem release-ready.

### 2026-10-27 – R2221 élő kromatin és regresszió

- A `aaacbf1` commit 16 workflow-jából **15 PASS**, egyedül Lighthouse `40452959456` **FAIL**. P0 `40452959495`, production `40452959422`, organism-main `40452959444`, R2103 és R2104 mobil, MAG runtime és mobile visual proof PASS.
- `0b8a67b`: az éles `r1280` GPU vertex shaderben a kondenzálódott kromatin sejtmag középpontja körül ±2.3% lassú, közös térfogati pulzust kap. A `condense*(1-assemble)` envelope a DNS kezdetén és a mechanikus MAG végállapotában zéró; nem okoz végponti remegést, és nem ad hozzá draw callt vagy CPU-geometriafeltöltést.
- `fd0536d`: R2219 forrás- és idővonal teszt kiegészítve az új shader- és pulzus-envelope invariánsokkal. Az új commitokra a CI PASS még ellenőrizendő.
- Következő: Lighthouse mért auditok optimalizálása; 0/3/4.5/6.5/9.5 s valós WebGL screenshot; kontextusvesztés/fallback tesztek; release csak igazolt elfogadási kapukkal.

### 2026-10-27 – R2222 organism-main CI konkrét hibaok

- A `29aace7` commit 16 workflow-jából 14 PASS, organism-main `40468368048` FAIL, Lighthouse `40468368052` FAIL. P0 `40468368039` PASS, production `40468368029` PASS, R2103/R2104 PASS, mobile MAG visual proof PASS.
- Az organism-main `122069191527` job logja szerint az EUR gomb `locator.click` művelete **sikeresen megtörtént** (`click action done`), a teszt azonban utána `waiting for scheduled navigations to finish` állapotban időtúllépett. A korábbi pozíciódiagnosztika szerint a gomb állandó koordinátán volt, tehát a hiba nem instabil gombpozíció.
- `780531d`: az EUR kattintás `noWaitAfter:true` opciót kapott, az utána következő ár- és checkout-URL ellenőrzések változatlanul megmaradtak. Új CI PASS még nem igazolt.
- Lighthouse továbbra is FAIL, a teljesítményoptimalizálás és a tényleges Genesis WebGL vizuális jóváhagyás nyitott.

### 2026-10-27 – R2223 háromtengelyes biológiai membránmozgás

- `e2b6cc0` commit ellenőrzésekor production `40483657157` és organism-main `40483657135` még futott, Lighthouse `40483657049` szintén folyamatban; korai PASS státusz nem adható.
- `d5cbe75`: az éles r1280 renderelő két eltérő síkban elhelyezett, áttetsző sejtmembrán-pereme lassú, fáziseltolt X/Y/Z tengelyű precessziót kapott. A meglévő 3D geometriák és anyagok újrafelhasználásával történik, új draw call vagy képkockánkénti allokáció nélkül.
- `41c5bc3`: az R2219 P0 teszt az új membránprecesszió mindhárom tengelyét forrásinvariánsként ellenőrzi.
- Az új módosítások CI státusza ellenőrizendő. A fotórealisztikus látvány és a Lighthouse 0.95 továbbra sem igazolt; PR marad draft.

## 6. Ismert hibák és kockázatok

1. **Rendezve a specifikációban, vizuálisan még ellenőrizendő:** a 14 s/10 s eltérés a R2220 acceptance-dokumentumban feloldva a valós 10 s DNS → sejtmag → MAG narratívával.
2. **Magas:** a vizuális minőség és a GPU-kompatibilitás nem ellenőrzött.
3. **Közepes:** külön R2126 prototípus redundáns a fejlettebb r1280 részecskerendszer mellett; nem szabad vakon bekötni.
4. **Közepes:** a meglévő CI sok régebbi renderelőfájlt ellenőriz, az aktuális r1280 explicit syntax checkje külön igazolandó.

## 7. Következő végrehajtandó feladat

**S2:** R2103 és R2104 mobil fallback tesztek PASS a `5a7937c9` commiton. **S5:** az R326 CPU geometriaépítés (`74871d9`) és WebGL bufferfeltöltés (`c1b32b5`) külön mérhető; a redundáns CPU vertex-tömbök felszabadítása (`1993e3a`) implementálva, regressziós CI és új Lighthouse összehasonlítás szükséges. Módosítás után teljes mobil+desktop Lighthouse és funkcionális regresszió. A 0,95 Performance küszöb változatlan. Ne merge-elj, amíg a teljes vizuális és Lighthouse kapuk nem sikeresek.

**Folytatási szabály:** minden új munkamenet elején olvasd ezt a fájlt, csak az itt nyitott tételeket folytasd. A PASS státusz kizárólag ténylegesen lefuttatott teszthez rendelhető.
