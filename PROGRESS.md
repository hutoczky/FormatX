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
| `node --check` a jelenlegi módosításokon | NEM FUTTATOTT | A connector nem futtat lokális Node parancsot |
| GitHub Actions a PR head SHA-n | NINCS IGAZOLT FUTÁS | A head SHA-n végzett workflow-lekérdezés üres listát adott; a PASS nem állítható |
| Desktop/mobil WebGL screenshot | NEM FUTTATOTT | Böngészős bizonyíték hiányzik |
| Lighthouse | NEM FUTTATOTT | Mérési riport hiányzik |
| Éles telepítés | NEM TÖRTÉNT MEG | Draft PR, nincs merge |

## 6. Ismert hibák és kockázatok

1. **Kritikus:** a 14 másodperces elfogadási narratíva nem egyezik a 10 másodperces implementációval.
2. **Magas:** a vizuális minőség és a GPU-kompatibilitás nem ellenőrzött.
3. **Közepes:** külön R2126 prototípus redundáns a fejlettebb r1280 részecskerendszer mellett; nem szabad vakon bekötni.
4. **Közepes:** a meglévő CI sok régebbi renderelőfájlt ellenőriz, az aktuális r1280 explicit syntax checkje külön igazolandó.

## 7. Következő végrehajtandó feladat

**S1:** adj a PR-hoz explicit `node --check docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js` és `node --check docs/scifi-ui/scripts/genesis-cinematic-morph-r2126.js` CI-kaput; ellenőrizd a workflow futásának eredményét. Ha a teszt hibás, javítsd és dokumentáld a hibalogsorokat. Ezután S2 képkockás vizuális vizsgálat.

**Folytatási szabály:** minden új munkamenet elején olvasd ezt a fájlt, csak az itt nyitott tételeket folytasd. A PASS státusz kizárólag ténylegesen lefuttatott teszthez rendelhető.
