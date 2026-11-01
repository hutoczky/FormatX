# FormatX – fejlesztési állapot

## R2271–R2272 – stúdió Genesis anyagjavítás + tesztellentmondás feloldása
- Az R2270 natív MAG shader a négyágú testet és a titánpaneleket ugyanabban a GPU-draw callban organikusan meghajlítja. A vasaltnak ható, sűrű négyzetrácsot ívelt, szélesebb lemezek és finom fotonikus szövet váltják fel.
- A Genesis eredeti, valódi Three.js dupla DNS-láncának anyaga R2271-ben kevésbé neon-emisszív; a PBR clearcoat és a biopolimer mikrodomborzat több szerepet kap. A sejthártya két tengelyen ismétlődő textúrája varratmentes, a korall-metabolikus foltok és a szemcsék kevésbé túlvezéreltek.
- Az R2271 renderelő cache-kulcsa és a tényleges R533 parser, R1629 tartalék útvonal, HTML és két Cloudflare Worker CSP pontos SHA256-hash-e konzisztensen frissült. Sem a genetikai részecskék száma, sem az intro idővonala, sem a natív egycanvasos MAG architektúra nem változott.
- Az R2270 P0-n a három hidegindítás WebGL2 GPU fence + valódi képpont ellenőrzése 3/3 PASS, a forrásellenőrzés PASS; a normál látogatói ellenőrzés FAIL volt. R2272 javította az okot: két egymásnak ellentmondó film-ellenőrzés közül a régi, kizárólag Three.js-t engedő feltétel véletlenül bent maradt, ezt eltávolítottuk. Az új filmkompetencia-ellenőrzés, natív GPU-fence, egyetlen canvas és képi bizonyítás megmaradt.
- A teljes mobil CLS, Lighthouse 100/100/100/100, valódi eszközös stabil 60 FPS és a végső képi stúdióminőség **még nem igazolt**; a PR #581 továbbra is draft és nem élesített.

## R2270 – organikus MAG: formaplasztika, titánfelület, fotonikus szövet (fejlesztői)
- A 2026.11.01-i 1c3ecfb CI-n a natív MAG három egymást követő hidegindítása 3/3 PASS, de a normál látogató ellenőrzése FAIL maradt. Ok: a screenshot-teszt egyetlen RAF-mintában követelte a 10 mp-es overlay és a renderer-állapot egyidejű fennállását, amit a 4 magos SwiftShader CI nem garantál. R2270 a tartós renderer-fajtát ellenőrzi, utána külön megköveteli a teljes natív MAG képkockát, GPU fence-t, egyetlen vásznat és nulla produkciós readbacket.
- A megőrzött natív R326 GPU-bufferek és draw call mellett a 3D vertex shader egyforma, determinisztikus organikus elhajlítást ad a biokristály testnek és a titánereknek; a recessed üveglencse és a mechanikai illesztés merev marad.
- A fotókon túl szabályos négyzetes panelezést szélesebb, ívelt anatómiai titánlemezek váltják fel. A meglévő fénykártyák mellett nagyon visszafogott gyöngyház-visszfény és energiaszövet jelenik meg, további renderer, FPS-limit, CSS filter, textúraletöltés vagy külön vászon nélkül.
- Új kiegészítő shader-forrásellenőrzés R2270 a P0 mátrixban. Ez csak forráskontraktus: a WebGL fordítás és valódi screenshot bizonyításának helyét nem veheti át.
- **NEM kész:** az R2270 vizuális, böngészős és desktop/mobil Lighthouse ×3 eredményei még nincsenek meg, stúdióminőséget vagy 60 FPS-t nem igazolunk. A legutóbbi 1c3ecfb Lighthouse FAIL desktop 92/92/91, mobile 81/82/84, CLS 0.107664.

## R2269 – valódi képellenőrzés és energiaosztályhoz kötött film
- A b958763 pontos commiton a teljes P0: 3/3 hidegindításos natív MAG-megjelenés, GPU fence, egy canvas PASS; a normál látogatói filmellenőrzés FAIL. Naplózott ok: a CI valóban korlátozott CPU/RAM osztályba került, és az R533 a megőrzött CONSTRAINED referenciarenderre váltott. Ez nem HeadlessChrome alapú megkülönböztetés.
- A normál látogatói teszt most a böngésző valós hardwareConcurrency/deviceMemory értékét rögzíti. Erős hardveren teljes fizikai Three.js GENESIS szükséges; gyenge osztályban kizárólag a valódi hardver-alapú R649 adaptáció megengedett. Mindkét útvonalon ugyanaz a natív, egycanvasos MAG, nulla blocking readPixels és a valódi első teljes viewport pixelteszt kötelező.
- A 2026-10-31-i R2266 képi ZIP 08/09 nevű mobil állóképei DNS-filmet mutattak a native MAG helyett, mert a régi automatikus Lighthouse/Playwright skip már nem él. Az új mobil **képkocka-bizonyító** explicit intro=0 paraméterrel valódi natív WebGL MAG-ot rögzít, és hibázik, ha filmes overlay marad. A külön normál látogatói filmteszt változatlanul URL-paraméter nélkül fut.
- A b958763 valódi desktop Lighthouse Performance: **93/88/90**, mobil **79/80/78**. Mobil CLS 0.107664, TBT 410.85/378.33/430.48 ms. Mindkét teljes sebességi workflow FAIL. Még nincs stúdiókép- vagy stabil 60 FPS-elfogadás.

## R2268 – filmes CI szerződés és új exact-head mérési kapuk
- A #581 korábbi `26d89d1` commitján a nyelvi és a public integrity CI PASS, de az R536 filmes teszt egy 2026.10.13-as R487 cache-verzióhoz kötött, elavult ellenőrzés miatt FAIL volt.
- A 2026.11.01-i R2268 test-korrekció a tényleges HTML R487 betöltő URL-jét ellenőrzi a Cloudflare Worker valós cache-URL-jével együtt. A `12295f1` SHA-n: **R536 PASS, i18n PASS, public integrity PASS**.
- A P0 és a Lighthouse workflow korábban kizárólag az R2266 szülőágra volt beállítva a push-eseményeknél; ez az R2267-es ág teljesítménymérését nem indította. Ezen a fejlesztői ágon mindkét workflow push eseménye most az R2267-es ágat is figyeli. Küszöb, ellenőrzés, timeout nem lett csökkentve.
- Új P0 és desktop ×3/mobil ×3 teljes Lighthouse eredmény még nem áll rendelkezésre; a korábbi R2266 méréseket nem szabad az új MAG/GENESIS képi bizonyításának tekinteni.

Utolsó fejlesztési szakasz: **R2267 – valódi 3D Genesis a normál headless látogatóknál**

## Elkészült (forráskód)
- A 2026-10-31-i R2266 Chrome P0 run 3/3 valódi MAG-felvételt igazolt, de a normál, paraméter nélküli látogató GENESIS tesztje 60 másodperc után időtúllépett.
- A R533 film a HeadlessChrome user-agent alapján korábban R649 referenciaképes fallbackre váltott. Ez nem a hardver valós mérőszáma. Az R2267 eltávolítja ezt a külön útvonalat.
- A ténylegesen korlátozott CPU/RAM-ú eszközök CONSTRAINED fallbackje, a teljes MAG-geometria, a shaderszint, az eredeti GENESIS idővonal és a tartalom-morfózis érintetlen.
- HTML parser + R1629 tartalék betöltő film-URL-je, a HTML CSP és a Cloudflare Worker mindkét CSP-je összehangolt, pontos SHA256 hash-sel.
- R2266 forrásregressziós ellenőrző frissítve; normál látogató teszt hiba esetén a renderelő, tulajdonos, GPU és DOM állapotot is naplózza.

## Utolsó hiteles teljes látogatói CI (R2266 / 2026-10-31)
- Desktop Lighthouse ×3: Performance 93/92/92. Mobil ×3: 84/88/87. Mobil CLS 0,107664; a cél nem teljesült.
- A normál látogató 3D filmteszt FAIL, 60 másodperces timeout; a 3/3 valódi MAG első viewport teszt PASS.

## Még hiányzik
- Az R2267 pontos fejlesztési SHA-n böngészős P0, normál fizikai GENESIS → MAG első képkocka és Lighthouse ×3 Desktop/Mobile validáció.
- Mobil CLS 0,05 alá javítása, stúdióképi összehasonlítás, valódi hardveres 60 FPS bizonyítása.
- PR #580 → #577 függőség konfliktusának feloldása; ne élesíts bizonyítás nélkül.

**Kiadás:** fejlesztői ág. Nincs összevonva vagy élesítve, nincs kész.

---

Utolsó fejlesztési szakasz: **R2266 / valódi látogatói és Lighthouse-mérés egységesítése**

## Elkészült
- A DNS → valódi 3D sejtmag → megmunkált titán-MAG filmes sorrend megmaradt.
- A MAG ugyanannak az élő rendszernek a központja; a szakaszok fokozatos feltárását a natív rendszer vezérli.
- A teljes P0-folyamat korábbi, **R2265** forrásverziója sikeresen lefutott.
- A különálló R2265 Lighthouse-mérések: asztali Performance **79/91/91**, mobil **95/95/94**. Ezek **nem** bizonyítják a teljes 3D látogatói út teljesítményét, mert a korábbi kód Lighthouse-felismerésnél több renderelési és filmes alrendszert kihagyott.
- **R2266:** a főoldali 3D MAG, a fizikai GENESIS film, az élő rendszer vezérlői, a kritikus stílusok és a tartalomkezelés nem választhat Lighthouse-specifikus, statikus/könnyített útvonalat.
- A régi automatizált regressziós forgatókönyvekhez szükséges kifejezetten kért tesztparaméterek megmaradtak.
- Az eredeti MAG WebGL-vásznát, háromszög-geometriáját, anyagshaderét, GPU fence-ének logikáját és a fizikai részletességet nem cseréltük le.
- A betöltési cache-azonosítók és a pontos HTML/Cloudflare CSP-ellenőrzőösszeg frissítve.
- R2266 forrásparitás-ellenőrző bekerült a GitHub P0 tesztmátrixába.

## Még hiányzik
- Az R2266-os **teljes**, valódi élményre vonatkozó desktop ×3 és mobil ×3 Lighthouse-mérés végleges eredménye.
- Az R2266-os teljes P0/Chromium-film, három valódi MAG hidegindítás, mobil tartalomfeltárás, hozzáférhetőség és vizuális validáció.
- Stabil mobil és asztali teljesítmény, valódi eszközös 60 FPS-vizsgálat, és a filmes látvány végleges stúdióminőségi jóváhagyása.
- A #580-as PR függőségi konfliktusának feloldása a #577-es alapággal.

## Ellenőrzések és hibák
- A régebbi, Lighthouse-specifikus statikus renderelési útvonal nem szolgáltathat alapot egy valós 3D MAG-ra vonatkozó teljesítményállításhoz.
- R2266 közbeni NET böngészős teszt egy `ORGANISM_VALIDATION is not defined` hibát jelzett; a változó deklarációját visszaállítottuk a `living-architecture.js` fájlban.
- Az új R2266-ra vonatkozó CI-ellenőrzések még **nincsenek jóváhagyva**. Az új forrásverziót nem szabad késznek nyilvánítani korábbi SHA eredményeiből.

## Következő lépések
1. R2266 pontos GitHub SHA szerinti P0- és Lighthouse-eredmények feldolgozása.
2. Új regressziók javítása (GENESIS, Magyar/Angol, árképzés, NAV, mobil, WebGL).
3. Valódi látogatói útvonalon mért TBT, Speed Index és GPU-indítás optimalizálása a részletesség csökkentése nélkül.
4. Film utáni valódi MAG és görgetésre feltáruló tartalom vizuális ellenőrzése asztali és mobil Chromiumban.
5. Konfliktus feloldása, majd **csak sikeres ellenőrzés után** összevonás és élesítés.

**Kiadási állapot:** fejlesztői ág, draft PR. **Nem élesített, nem kész.**
