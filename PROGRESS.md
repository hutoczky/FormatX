# FormatX – fejlesztési állapot

## R2278 – stúdió Genesis végén korai valódi GPU-képkocka
- Az R2275 c74ab580 P0 normál Chromiumban a 3 MAG hidegindításból kettőnél FAIL: 4.2s után, még a WebGL2 fence elkészülte előtt a film levette a takarást. Ez valódi időzítési hiba, nem érvényes stúdió elfogadás.
- Az R2278 a 10s filmes történet 90%-ától, csak kész WebGL2 MAG esetén, egyszer meghívja a meglévő formátumú native `formatx:magbirthprepare` eseményt. A valódi fence így még a film utolsó másodperce alatt elindulhat. A finish() eredeti eseménye továbbra is helyreállítási útvonal. A 4.2s fail-open korlát, tiltott diagnosztikai readback és egyetlen canvas változatlan.
- A HTML parser, az R1629 tartalék script, a Cloudflare Worker mindkét CSP-je és a pontos új SHA256-engedélyezés ugyanahhoz a verziózott R533 ownerhez igazodik.
- Az R2277 képi centrálás-ellenőrzés és az R2276 visszaállított mobil középpontja a fejlesztői ágon marad. Az R2278 friss teljes P0, 390/412px vizuális képkocka és Lighthouse ×3 eredményei szükségesek, nincs végső stúdióminőségi jóváhagyás.

## R2276 – kritikus mobil MAG középre igazítás
- A R2275 valós mobil Chromium állóképein a MAG nagy része a bal oldalon kívülre került. A korábbi R2274 CSS tévesen a natív WebGL stage eredeti `left:50%` / `translateX(-50%)` kompenzációját `left:0`-ra cserélte. A mobil screenshot ugyan nem tudott helyes vizuális oracle-ként elbukni, de a kép valóban hibás volt.
- R2276 ugyanabban a renderblocking első-festés CSS-ben visszaállítja az eredeti R303 vizuális képernyőközép szerződést: 100vw szélességű stage, 50%-os eredet, valós -50% kompenzáció, megtartott 0.935 vertikális vágás. A stabil 70px fejléc és három fix vezérlő megmarad.
- Az eredeti mobil viewporton a R2273 előtti ágon a MAG középen volt. R2276-ot új, valódi 390px képkockával és elsőfestés CLS-sel kötelező igazolni. Képi PASS és végleges stúdióminőség még NINCS kijelentve.
- HTML előtöltés és blokkoló mobile-first-paint CSS, valamint a Worker azonos frissített cache-azonosítót használ; a fejlesztés továbbra is csak draft PR, nem live.

## R2275 – valódi élő MAG kortikális stúdióanyag és organikus test
- A 2026.11.01-i R2273 képfelvételen a natív MAG még geometrikusan tökéletes, fehér gömb volt négy fényes titánkarral. A konkrét ok: a régi anyagshader a később hozzáadott R2273 kortikális geometriát is 84%-os ezüstlemezes színnel felülírta.
- R2275 az ezüst felületet a tényleges eredeti ásványi testre korlátozza, a titán négy karját enyhén sötétebb fémre hangolja, a sejtkortex pedig külön anyag-ágban mély füstüveg, rétegzett türkiz biokémiai erezet és visszafogott korall-organella fényt kap. Mindez az eredeti, **egyetlen** fragment shader és WebGL draw call része.
- A korábbi tökéletes ellipszoid térbeli, determinisztikus, a sarkoknál folytonos szerves lebenydeformációt kap; a szoftver/mobil/asztali tesszelláció továbbra is korlátos. Nincs extra rajzfelület, kirenderelt kép, shader-program vagy RAF.
- A P0 forráskontraktus külön védi a biokortex geometriáját, saját stúdióanyagát és azt, hogy az eredeti szem, a film és a tartalom-feltáró natív MAG változatlanul egy rendszer maradjon.
- **Előző vizuális R2273 verzió elutasítva mint stúdió-minőség**. R2275 még QA előtt; csak valódi screenshot + GLSL + Lighthouse és 60 FPS után lehet késznek minősíteni.

## R2274 – mobil első képkocka CLS: fejléc és natív MAG stabil elhelyezése
- A normál R2272 P0 biztonságos 3/3 WebGL MAG hidegindítást és külön PASS 0 readback / 1 canvas / 972 látható pixel vizsgálatot adott. A külön mobil CLS ellenőrzés viszont **0.213962 FAIL**.
- A P0 valódi 390x844-es layout-shift JSON-ja kimutatta, hogy 2068 ms körül a főtartalom Y 94.796875→70px-re mozdult, a nyelvi vezérlő 42x40→120x69, a menü 50x54→98x69 méretre ugrott. Később 11055ms körül a natív WebGL canvas X 195→0 és szélessége 195→390 lett.
- Az R2274 a valóban kritikus, renderblocking mobil elsőfestés CSS végére helyezett, magasabb szelektorspecifikusságú végleges geometriát. A fejléc és mindhárom vezérlő 70px-es mobil sávban stabil, a MAG stage/canvas már a kezdeti képkockától a teljes 390px-es szélességet használja.
- A meglévő vizuális gép, WebGL shader, film és a scrollon átadott natív tartalom működése megmarad; nem alkalmazunk Lighthouse-specifikus vizuális bypass-t vagy rejtést. HTML preload és stylesheet valamint Worker cache-kulcs együtt frissítve.
- **Elvárt valós ellenőrzés:** friss R2274 390/412px normál 10s film CLS és natív screenshot, Lighthouse Desktop/Mobile ×3. Nem tekintjük megoldottnak a friss böngészőteszt bizonyítéka nélkül.

## R2273 – geometriai stúdiófelhozatal: biokortex és élő filamentumok
- A korábbi R2270 képi archívumon a MAG még szabályos, négyágú, lapos emblémaként hatott. R2273: a négy, megmunkált titán kar mögé egy valódi, árnyékolt konvex biologikus 3D kortikális tömeg kerül, amely a köztes negatív teret kitölti, és nem takarja el a központi üveglencsét.
- Valódi, finoman hullámzó, vékony organikus nyúlványok a meglévő R326 attribútum-pufferekből: 3 a szoftveres tesztrendernél, 4 mobilon, 6 asztali profilon. A nyúlványok a GPU vertex shaderben mozognak, nem új CPU/RAF ciklusban. Ugyanaz az egyetlen natív vászon és anyagshader.
- A GPU-tesszellációs sűrűség a szoftver/mobil/asztali profil szerint korlátozott. A négyágú eredeti signature váz, fizikailag mély üveglencse, a film és az átadott tartalomvezérlés érintetlen.
- Ez a commit egy vizuális iteráció, **nem elfogadott végleges stúdiókép**. A forrás-, WebGL-pixel, reszponzív, CLS és Lighthouse-teszteket az új pontos SHA-n meg kell ismételni; a valós artefaktumból kell eldönteni, hogy a kitöltött sziluett valóban közelít-e a referenciához.

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
