# FormatX – fejlesztési állapot

## R2357 – MAG négy valós titánbetétjének hegyes, megmunkált 3D profilja (2026-11-10)

- **Elsőként MAG:** az R2356 önálló Draft ágon levő, valódi 3D domború betétek hosszúkás, ovális alakját az R2357 egy keskeny, enyhén ívelt, hegyes titánlándzsa-profilra cseréli. Ugyanaz az eredeti `T.Shape` öt rajzparancsa, egy közös `ExtrudeGeometry`, négy meglévő `T.Mesh`, eredeti fizikai anyag és megszületési pálya marad; nincs plusz anyag, rajzolási hívás, renderer, canvas, RAF vagy videó.
- **Valódi fizikai fényprofil:** a meglévő R2356-os 0–0,012 egységnyi vertex-domborulat keresztmetszete az új, keskenyebb betéthez igazodik (`abs(x)/.10`). Az eredeti beégetett gravírozás z-helyzete `-.101`; a csúcs fölötti fizikai hézag kb. 0,006 egység. Nem 2D dekoráció.
- **Regresszió:** `.github/scripts/validate-mag-spear-inlays-r2357.cjs` az **eredeti Shape-konstruktor** ívparancsaiból valós pontmintákat számol és ellenőrzi a geometria méretét, területét, öt parancsát, eredeti négy-arm és DNS/sejt/MAG életciklusát. Az R2355 és R2356 validátorokat a valós új geometriához igazítottuk. A **teljes eredeti P0** valamint a 3× staging Lighthouse mobil+desktop küszöbök változatlanul futnak; PR merge/deploy NINCS.
- **Elfogadási kapu:** R656 tényleges 5.50/7.50/9.25s Chromium PNG összehasonlítás, P0 GREEN, semmit nem fedő mobil első viewport, natív MAG handoff és animáció, hardveres Android 60 FPS, 3×100 Lighthouse és TBT≤150ms, production Worker/CSP/cache egyezés. A kiadás ezek bizonyítása nélkül **DRAFT / NO MERGE / NO DEPLOY**.

## R2356 – MAG fizikai domború 3D titánbetét-mikroprofil (2026-11-09)

- **Biztos alap:** R2355 exact runtime source `094370994d8c` full P0 31/31 PASS, GitHub Actions 42616888283. A desktop 9.25s képen az inlay betétek geometriailag kisebbek és beágyazottabbak, 5.50s sejt bitre azonos, natív végleges MAG változatlan. Mobil Lighthouse a R2355 ágon 79/83/83, TBT 511/370/353ms – nem kész, nem elégséges 3×100.
- **Valódi geometriai továbblépés:** az R1280 `inlayGeometry` eredeti egyetlen közös extrudált 3D objektum csúcspontjain a frontfelület `cz>.016` pontjai egy 0–0,012 world-unit mélységű axial-x keresztmetszetet kapnak; a gerinc középen domború, a széleken és a hátlapokon az eredeti határok változatlanok. `computeVertexNormals` és `computeBoundingSphere` egyszer fut inicializáláskor; a különböző stúdiófények a normálok alapján valódi 3D görbületen csillannak meg. Új textúra, rajzolási hívás, GPU pass, mesh, renderer, canvas, RAF vagy háromszög NINCS.
- **Gravírozás:** eredeti `LineSegments` anyag és pályák változatlanok, a hozzájuk tartozó 3D z-helyzet `-.095`, így a 0,012-unit fizikai korona felett továbbra is kb. 0,012-unit mélységi hézag marad.
- **QA:** `.github/scripts/validate-mag-convex-inlays-r2356.cjs` az eredeti forrásból kiemelt vertex-deformációt futtatja csúcsmintákkal, ellenőrzi a változatlan poligonszámot, a hátoldal és határprofil sértetlenségét, az egyszeri normál/bounding frissítést, a 4 valódi inlay/gravírozás párost; a korábbi R2355 teszt a magasabb fizikai koronát és etch-felületet is ellenőrzi. Az összes eredeti R656 valódi screenshot, 3× coldstart, 10s film, P0, Lighthouse desktop/mobil×3 küszöb változatlanul maradt.
- **Nyitott elfogadás:** R2356 exact-source P0 és 9.25s valódi képi összehasonlítás, szoftveres/hardveres GPU idő, 3×100 Performance, 60FPS Android, mobil teljes optika, DNS→sejt→MAG stúdióminőség, PAUSE/RESUME×5 és production Worker/CSP/cache. **DRAFT / NO MERGE / NO DEPLOY**.


## R2355 – MAG valódi, gravírozott 3D titánbetéteinek szerkezeti beágyazása (2026-11-09)

- **Visszaállítási pont:** R2354 P0-green `8968e1acf12a834402b48dd2453300c75b21403f`; R2354b felület-fénytompítását (`0x788b91` anyag) nem emeltük át. Az R2354b P0 `42538983004` PASS, de Lighthouse mobil 73/83/81, TBT 759/372/435ms; nem bizonyított gyorsulást és szemmel sem szüntette meg a négy nagyméretű, síknak ható ovális betétet.
- **Valódi összehasonlítás:** a R2354 és R2354b `05-9.25s.png` képek 1280×720 RGB képpontjai között csak 1,95% tér el legalább 20/255-tel (a 5.50s biológiai sejt képei bitre azonosak). A négy betét mindkét állapotban a MAG 4 ágának nagy részét elfedi; a végső natív `07-native-hero-mag.png` ezzel szemben több titánfelületet és mélyebb optikát mutat.
- **R2355 tényleges 3D geometriakorrekció:** a régi `inlayGeometry` négy közösen használt gravírozott, fazettált Three.js Mesh-ének x/y mérete `.82/.84`-re csökkent. A korábban `z=.378` magasan lebegő betét a valódi titánhéj közelébe (`z=.270`) kerül, a közös eredeti `LineSegments` gravírozás ugyanazt az x/y méretet követi, `z=-.108` korrekcióval a fizikai felület felett kb. 0,011 world-unit magasságban marad. Az `armInlayMaterial` és az eredeti textúra **változatlan**, az új kiadásnak nincs extra mesh, pass, anyag, canvas, render engine vagy RAF.
- **DNA→sejtmag→MAG szekvencia:** a `createHelix`, `updateDNA`, `updateCore`, `updateOrganic`, `updateMechanical`, molekuláris 5.50s sejt, 3D poros titánfelület, 3D teljes élő lencse változatlan. A négy kar eredeti érkezési pályája, `seat`, `inlayBirth` és anyag-átlátszóság animációja változatlan.
- **Új regresszió:** `.github/scripts/validate-mag-physical-inlays-r2355.cjs` az eredeti inlay-konstrukciót futtatja minimalizált Three.js objekttel, ellenőrzi a 4 fizikailag osztott Mesh és vésett LineSegments párost, anyagtulajdonjogot, 3D mélységet és a gravírozás 0,011-unit térbeli kapcsolatát; a korábbi szigorú R656 első viewport PNG, 3× headed/headless cold-start, CLS/fókusz/PAUSE és staging Lighthouse ×3 szabályokat nem lazítottuk.
- **Nyitott:** exact-source R2355 P0 + Lighthouse, új 9.25s jelenet valódi vizuális ellenőrzése, natív MAG-látvány egyezés, Android 60FPS, stúdióminőség, mobil/asztali 3× 100/100/100/100, Worker/CSP/cache és felhasználói szekcióátadás. NINCS élesítés, PR DRAFT.


## R2354 – MAG filmes titánfelület összehangolása a natív fémmel (2026-11-09)

- **Alap:** R2352 P0 GREEN 31/31 (42533692060), valódi R656 5.50/7.50/9.25s képi vizsgálat. A 9.25s képen a geometria már tisztább, de a filmes 3D MAG lemezei nagyon világos, egységes cian-fehér lapok, míg a valódi natív R326 MAG sötétebb, ezüstös, árnyalt mikrobeveles titán. A filmes és natív fény-/színátadás ezért vizuálisan még nem tökéletes.
- **R2353 elkülönítve elutasítva:** PR #594 nem bizonyított érdemi sebességnyereséget: staging mobil Performance 71/86/85 és TBT 820/292/312 ms az R2352 69/87/87, 943/272/254 ms mellett. PR lezárva merge/deploy nélkül. R2354 **nem** tartalmazza az R2353 szoftveres renderelőütemezését.
- **R2354 vizuális 3D PBR javítás:** kizárólag az eredeti R1280 Three.js `updateMechanical` késői `finale` anyagkeverésének optikai paraméterei változtak. Sötétebb, semlegesebb smoked-silver/fém lemezek, több fizikai metalness és finomabb satin roughness/clearcoat. Minden meglévő tényleges 3D fémmesh, mikrobarázdás bump map, 4 kar és 8 optikai záróelem, key/fill fény, elnyújtott kamera, DNS és turkoiz-korall sejt megmaradt. Eltérés az első biológiai fejezetben nincs, mert a `finale=smooth((t-7.20)/1.65)` 7.20s-ig nulla.
- **QA:** `.github/scripts/validate-genesis-titanium-grade-r2354.cjs` ellenőrzi a meglevő fizikai PBR anyagok zárt értéktartományát, a `finale` folytonos fényátmenetét, változatlan DNS/sejt fázisokat és R2352 belső magot. R2270 eredeti tesztje R2354 új fémroughness-értékét kéri. A natív R326 shader, WebGL-vászon, renderpass és FPS ütemezés nem változott. A teljes P0 PNG és a 3× staging Lighthouse minden változatlan küszöbbel fut; képi javulást csak ezek ellenőrzése és valódi képkocka-összehasonlítás után fogadunk el.
- **Nyitott:** exact-R2354 P0 és valódi 9.25s képi összehasonlítás, full 3× 100/100/100/100, hardveres Android 60FPS, referencia-minimum, PAGE SCROLL MAG→tartalom, PAUSE/RESUME×5, reduced-motion, P0 production Worker/HTML/CSP/cache és végleges kiadás. DRAFT / nincs merge / nincs deploy.


## R2352 – valódi biológiai sejt → a MAG belső optikai magja (2026-11-08)

### R2352 valós böngészős képkocka-összevetés és mérések

- R2352 pontos `6f23af9be359` head első CI PNG artifact: `mag-intro-keyframes-6f23af9be359...`. A R2350 baseline és R2352 `03-5.50s.png` képkockák **byte-dekódolás után azonos RGB pixelek**; `04-7.50s.png` esetén legfeljebb 2/255 intenzitáskülönbség. A `05-9.25s.png` valódi screenshoton a nagy, oldalt kilógó gömb lényegesen visszahúzódott; 27 241 pixelben >20/255 RGB különbség (~2.96% a képből). A natív MAG nem lett átírva.
- Staging Lighthouse 3× R2352 pontos forráscommit `159a61aae7ac`: mobil Perf 69/87/87, TBT 943/272/254 ms, LCP 1760/1412/1400 ms, desktop Perf 92/90/85. Mind a hat futásban A11y/Best Practices/SEO 100, de **Performance 100, mobil TBT≤150ms és desktop LCP≤2s nem teljesült**; nincs gyorsulás állítva, a környezet zajos.
- Az első két P0-jelentés a régi `.86`, `-.54`, `.68`, `.23` testméret- és membránértékeket hardcode-oló R2270 és R2328 tesztek miatt volt RED. A két forrásőrben a **kisebb, fizikai R2352 cortex pontos** `.56`, `-.62`, `.58`, `.19` értékeit kötöttük ki; a valódi PNG, 3× coldstart, WebGL, R2173, CLS és vizuális küszöbök sem változtak. A friss P0 még külön ellenőrzendő, addig nem GREEN.
- **R2352 eredeti, teljes P0 fast source loop = GREEN:** GitHub Actions [42533692060](https://github.com/hutoczky/FormatX/actions/runs/42533692060), pontos `6f23af9be359d3cc38a5e13a4d4180e4ef62a955` **forráscommiton**, minden 31 workflow-step sikeres; teljes PNG, 3× headless/headed coldstart, referencia-film/native handoff, R2173 layout, valódi mobil élsimítás és origin anchors. A későbbi commitok a PROGRESS dokumentációt érintik, nem a megjelenítés forrását. Nincs stúdióminőségi vagy hardveres FPS-igazolás.
- A film négyágú fémtestének stúdió-reflexiói és élő lencséje még nem érik el a felhasználó referenciaképeinek fotográfiai minőségét. Nincs merge/deploy, marad DRAFT.



- **Kiinduló ellenőrzés:** R2350 pontos `6d0a6f058969` P0 PASS (GitHub Actions 42519381493) és 3× mobil Lighthouse Performance 84/90/91, TBT 354/184/156 ms. R2351 (PR #592) P0 PASS, de mobil Performance 71/83/82, TBT 850/375/421 ms: elutasított, PR lezárva. További fejlesztés az R2350 alapból, nem a regressziós R2351 ágból történik.
- **Vizuális bizonyíték:** az R2350 valódi CI-képkockája (`05-9.25s.png`) egy túl nagy, kerek sejtkortexet mutat a fémes négyágú filmes MAG mögött. A `03-5.50s.png` 3D türkiz–korall sejtje értékes; ezt változatlanul kell megtartani. A sejtkortexnek a film végén a már meglévő fizikai optikai foglalatba kell visszahúzódnia.
- **R2352 javítás:** a létező `updateOrganic(t,time)` Three.js csoportjában a kései 3D cortex méret `.63*.86` végértékét `.63*.56`-ra fokozatosan csökkentjük; a recesszió `-.54` helyett `-.62`, a membrán late opacity `.68` helyett `.58`, a lebenyé `.23` helyett `.19`. Ugyanaz az eredeti, textúrázott élő 3D sejt, részletes vertexanyagok, membrán, szálak és fémes 4-arm összeállás marad. Nincs új mesh, textúra, renderer, canvas, videó, GPU-környezet vagy RAF.
- **Folytatólagosság:** az eredeti `5.50s` sejtméret `0.631` és opacity `0.18`; a `9.25s` aktív, élő mag mérete `0.3538`, opacity `0.58`, pozíció `z=-0.62`. A numerikus próba legnagyobb 10 ms-os lépésközi méretváltozása 0.0067 alatt van, nincs végső cut.
- **QA:** `.github/scripts/validate-genesis-organic-convergence-r2352.cjs` az eredeti `updateOrganic` függvény törzsét futtatja, ellenőrzi 5.50/7.50/9.25/9.90s fázisokban a méretet, optikai mélységet és opacity-t, valamint 300 köztes mintát. Az eredeti P0, R656 képek, 3× hidegindítás, filmlezárás, Lighthouse ×3 változatlan kapu. A teljes P0 és fotográfiai összehasonlítás nélkül NEM elfogadott.
- **Nyitott blokkolók:** pontos R2352 teljes P0, szemmel ellenőrzött 9.25/10.0s film és natív MAG egyezés, telefonos 60 FPS, háromszoros mobil/desktop 100/100/100/100, PAUSE/RESUME×5, reduced-motion/Skip, production Worker/CSP/cache/verzió és valós oldal ellenőrzése. Csak DRAFT, nincs merge vagy deploy.


## R2350 – MAG natív fragmentmunka csökkentése teljes optikai részletességgel (2026-11-08)

- **Mért baseline:** R2349 Lighthouse 3× mobil Performance 78/83/86; TBT 521/401/293 ms, desktop Performance 92/87/91. Mind a 6 futásban Accessibility/Best Practices/SEO 100/100/100. Ez helyi staging, nem production vagy fizikai Android.
- **MAG FIRST:** a meglévő R326 natív fragment shader fémes stúdióárnyékolása (fizikai mikrobevelek, anatómiai panelvarratok, titán-szatén reflexek) csak az eredeti **valóban fémmel/fémes ásvánnyal érintett** faceteken fut: `vFacet<1.0 || machinedArmor>.5`. Az összes eredeti fémfelületi képlet változatlan. A kortikális élő sejtanyag, biológiai fonalak és a R2349 mély üveglencse 3D pontjai kihagyják a rájuk eredetileg nulla tömegű `studioSilver` és `titanium` blendet.
- **Minden facetben megmarad** a valódi `panelEnvelope` érték, mert a meglévő fizikailag futó interakciós fényimpulzus használja. Nincs geometry, textúra, WebGL-context, canvas, renderpass, RAF, anyagkép vagy FPS-cap csökkentés, és nem szerepel audit/agent alapú megkerülés.
- **Teszt:** új `.github/scripts/validate-mag-facet-pruning-r2350.cjs` ellenőrzi az eredeti fém, szövet és optika shader-forrását, továbbá a `shellSilver` és `machinedArmor` maszk alapján 15 külön facetértéken védi a kihagyott ág nulla fémhozzájárulását. A változatlan P0 R656 valódi PNG, 3× headless/headed cold-start, R2173 filmnyugdíjazás és 3× mobil/asztali staging Lighthouse az új ágon is kötelező.
- **Nyitott:** exact-head P0 és LHR eredmények, valódi GPU képi egyenértékűség, Android Chrome hardveres 60 FPS, stúdióminőség, 3× 100/100/100/100, production HTML/Worker/CSP/cache. DRAFT ONLY, nincs merge/deploy.


## R2349 – natív MAG optikai üvegkút és fotográfiai fénymélyítés (2026-11-08)

- **Kiindulás:** R2348 pontos `b712f0e65531`, P0 fast-loop 42504692257 PASS; a 3/3 headless + 3/3 headed hidegindítás és az eredeti teljes viewport PNG-orákulum változatlanul kötelező.
- **Valódi vizuális ellenőrzés:** a R2348 CI-archívum `07-native-hero-mag.png` képén a négyágú fémtest létezik, de a központi cian biolencse lapos, egyenletes fénykorongnak hat. A kész látvány még elmarad a felhasználó referencia-minimumától.
- **Első prioritás MAG:** a létező R326 üvegrész shaderének egyetlen `opticalGlass` ágán a meglévő `lensHeart`, `lensCaustic`, `softboxC`, `outerMembrane`, `lensKey` és `cellRefraction` értékekből mélyebb üvegkút, finom visszaverődő ásványi fénysáv és testi optikai struktúra keletkezik. Nincs új textúramintavétel, 3D mesh, renderpass, canvas, context, CSS-overlay, RAF vagy autonóm animáció.
- **Minőségbiztosítás:** a `.github/scripts/validate-mag-optical-well-r2349.cjs` őr megköveteli az eredeti fizikai üvegágat, a meglévő biológiai réteget, a reflektív minták koordinátakötését és az új GPU-sampler hiányát; a teljes, szigorú R656 böngészős PNG/3× coldstart P0 változatlan, és az exact-head push-kapuhoz bekötöttük.
- **Nyitott:** pontos-R2349 P0, valódi előtte–utána képkocka-összehasonlítás, Android Chrome 60 FPS, DNS/mag teljes filmes referencia-elfogadás, Lighthouse desktop/mobil 3× 100/100/100/100, Worker/HTML/CSP/cache és fizikailag mért production parity. **DRAFT, semmi merge/deploy, nincs stúdióminőségi elfogadás.**


## R2348 – natív MAG első autonóm fényimpulzusának filmes tulajdonosi kapuja (2026-11-08)

- **Mért okjelölt:** R2347 Lighthouse x3 mobil Perf 74/82/82, TBT 693/403/402ms, a valódi R326 WebGL MAG és R533 film főszálterhelése. A natív R326 első dekoratív automatikus surface sweep 13s-mal a rejtett MAG inicializálása után indulhat, és az intro/GPU kompozitor átadás utáni ablakban ütközhet más renderfeladatokkal.
- **Javítás:** az EREDETI egyetlen, 13 000ms-os autonóm időzítő csak a tényleges GENESIS overlay eltűnése után indul. Amíg R533 film aktív, az új kapu nem hoz létre időzítőt. A film befejezésének egyetlen valódi eseménye a meglévő scheduleSurfacePulse() eljárást hívja. Skip/no-intro továbbra is azonnal indítja az eredeti várakozást; a kézi touch/keyboard interakció, egyetlen WebGL canvas/context, 3D geometria, shader, fények, GPU source és 60 FPS cél érintetlen.
- **Regresszió:** új forrásból végrehajtott R2348 guard teszteli az aktív filmes tiltást, a befejezésre egyetlen újraarmolást, a 13s időtartamot, a Skip és Pause/reduced/hidden működést és a kettős időzítők elkerülését. Az eredeti, változatlan R656 első képernyős valós PNG, R2226 3x headed/headless, R2173 retired-layout és dokkolási kapuk továbbra is kötelezőek.
- **Még hiányzik:** R2348 pontos SHA teljes P0 és Lighthouse desktop/mobil x3 újramérés, benchmark grafikon és fizikai Android 60 FPS. A fejlesztői ág DRAFT, nincs merge vagy production deploy.


## R2347 – staging Lighthouse 3× mérési kapu (2026-11-08)

- A R2346 pontos fejlesztői SHA-jából készített, külön GitHub Actions workflow helyi statikus HTML-en 3 asztali + 3 mobil Lighthouse-mérést indít; nincs élesítés és nem módosítja az alap MAG renderert.
- Küszöb: 100/100/100/100 mind a négy kategóriában, LCP ≤2000 ms, TBT ≤150 ms, CLS ≤0,05, lokális statikus server-response-time ≤500 ms. Hibánál a valódi nyers futások és scores.json megmaradnak.
- Ez a mért lokális staging-forrás, nem igazolja a Cloudflare éles TTFB-t, az Android GPU 60 FPS-t, vagy a végső vizuális stúdióminőséget. DRAFT ág, nincs deploy.


## R2346 – a natív MAG kompozitor-transzformációjának biztonságos tulajdonosa (2026-11-08)

- **Kockázat:** az R2343 sikeres elsőképkockás `translate3d(0,0,0)` aktiválása 860 ms múlva vakon törölte a stage inline `transform` értékét. Ez felülírhatta a későbbi görgetés vagy interakció mozgásvezérlőjének érvényes transzformációját, és a korábbi inline állapotot sem állította helyre.
- **Javítás:** a meglévő stage CSSOM transzformációját és prioritását elmentjük; a saját kompozitorpromóció normalizált CSSOM értékét rögzítjük. A régi 860 ms-os egyszeri cleanup csak akkor állítja vissza az eredetit, ha a transzformáció közben nem változott. Újabb tulajdonos esetén érintetlenül hagyja. Nincs új GPU/VBO/context, canvas, animáció, renderpass, RAF vagy időzítő.
- **Ellenőrzés:** a tényleges R326 eljárást futtató R2346 regressziós teszt négy esetet véd: korábban nem létező transform, fontos inline transform, normál inline transform, időközben új tulajdonos. Az eredeti R656 első teljes PNG, három headless/headed coldstart és R2173 retired layout szigorú P0 kapuja érintetlen.
- **Állapot:** fejlesztői/draft, a teljes R2346 pontos-commit CI, Android valós képi ellenőrzés, 60 FPS és Lighthouse×3 még külön szükséges. Nem élesítve.


## R2345 – MAG filmes titán-szatén összeillesztés a sikeres elsőképkockás ággal (2026-11-08)

- **Bizonyított kiindulópont:** R2344 fix/r2344-precomplete-mag-home-geometry commit `2f6c5fb166c7`, eredeti teljes P0 fast-loop run 42487145929 PASS. A natív első teljes viewport és a független 3/3 headless + 3/3 headed hidegindítás zöld volt. A külön PR #584 P0 hibája a korábbi, R2344 nélküli film utáni geometriai hozzáférés volt.
- **R2345 változás:** a filmes MAG három meglévő MeshPhysicalMaterial rétege kontrollált, semlegesebb ezüst/titán-szatén színt, kisebb fényáteresztést és precízebb roughness-t kap. Egyetlen eredeti négyágú 3D test, kamera, optika, WebGL canvas/context és RAF; a R2343+R2344 kompozitor/film-leállítási javítás érintetlen.
- **Regressziós védelem:** az eredeti R2270 forrásőr a tényleges új roughness-re frissült; az R2345 anyagátmeneti oracle az aktuális Three-jelenet forrását futtatja 0/25/50/75/100% eseteken. A kötelező R656 valódi PNG screenshot, R2226 3× cold start, R2173 retired layout, mobil/desktop viewport/GL/handoff tesztek változatlanok.
- **Még nyitott:** az R2345 pontos commitján teljes P0, valós képi összevetés 7,50 és 9,25s, 390/430/1440 viewport, Android Chrome 60 FPS, Lighthouse 3× 100/100/100/100, PAUSE/RESUME×5 és éles kiadás. Kiadás előtt a HTML/Worker asset cache/CSP egyeztetése szükséges. Ez fejlesztői ág, nincs merge és nincs production deploy.


## R2344 – Natív MAG otthoni geometria a filmes lezárás ELŐTT (2026-11-08)

- **Pontos hiba:** a R2343b P0 `42485654514` tesztben a `validate-intro-retired-layout-r2173.cjs` az eredeti változatlan feltétel szerint FAIL: a `formatx:magbirthcomplete` esemény közben az archiváló `prepareNativeHomeR2315()` az eredeti MAG `getBoundingClientRect()` függvényét hívta. A teljes JavaScript-stack ezt egyértelműen igazolja; a visszatérő hibát nem takarjuk el.
- **R2344 javítás:** az eredeti négy CSS home-koordináta már a korábbi `formatx:magbirthprepare` eseménynél készül, az **egyetlen meglévő** MAG színpadán. A `magbirthcomplete` eseményben nincs közvetlen `prepareNativeHomeR2315()` hívás; ha a fizikai natív motor korábban még nem lett `ready`, az archiváló tulajdonos saját `queueMicrotask` feladata utólag készíti elő. Mobilon, reduced-motion módban és rejtett oldalon a korábbi védelem megmarad.
- **Regresszió:** `.github/scripts/validate-native-home-precomplete-r2344.cjs` a tényleges R2315 forrásfüggvényt VM-ben futtatja desktop/mobile/reduced/hidden profilban, ellenőrzi a korai olvasás tilalmát és a 4 valós CSS-koordinátát. Az eredeti valós Chromium R2173 teszt és a többi P0 változatlan.
- **Továbbra is nyitott:** teljes pontos-SHA P0, első headless és headed MAG pixelscreenshot, 3× coldstart, Android 60 FPS, Lighthouse 3× 100/100/100/100, vizuális stúdióminőség és production release. **Csak fejlesztői ág, nincs merge/deploy.**


## R2341 – DNS makrofotó szatén foszfát-anyag (2026-11-08)

- **Képi bizonyíték:** a R2340 `b258825` GitHub CI artifact valódi 2,50 s DNS képkockáján a két makró-spirál túl fényes, tömör, plasztikcső-szerű. A 5,50 s sejt gömb alakú, biológiai referencia-minőség még nincs meg. A 06 első teljes viewport a native MAG-ot *és a felső navigációt is* elhagyja, miközben a 06b második képen mindkettő már jelen van: ez hideg headless compositor/commit versenyhelyzetet valószínűsít, de nem bizonyít böngészőhibát.
- **R2341 valós módosítás:** az eredeti 3D TubeGeometry-k ugyanazzal az egyetlen 128×128 DataTexture-rel maradnak, a roughness szatén értékre nő, a clearcoat és az emisszió csökken, a bumpScale és UV-részlet láthatósága nő. A két aura alap-alpha visszafogott. Nem került be új Three objektum, GPU-textúra, canvas, renderpass, RAF vagy WebGL-környezet.
- **Regressziós védelem:** a tényleges Three r185 scene builder és textúrapixel-teszt a megváltozott értékeket, nem egy gyengített küszöböt ellenőriz. A R2328 és R2270 örökölt forrásvédők az új anyagokhoz igazodtak.
- **Blokkolók változatlanok:** MAG első teljes viewport headless screenshot, 3× független cold-start, grafikus és Android Chrome referencia szerinti vizuális elfogadás, mindkét képernyőméret valós fps, Lighthouse 3× 100/100/100/100, végleges DNS→sejt→MAG átadás, release/deploy parity. A korábbi R2340 futás P0-ja a képi kompozitoron piros. A R2341 forrás javítását új, pontos commiton kell futtatni, majd screenshot-pixeleket összevetni.
- **Kiadás:** PR #582 DRAFT a #581 fölött. Nem került masterre; nincs production deploy. A 3 referenciaoldal nincs dokumentációba írva.


## R2340 – DNS stúdió-közelkép egyetlen 3D kamerával (2026-11-08)

- **Képkocka audit:** a R2337 valódi, 2,50 másodperces Chromium screenshotján a DNS még túl széles/távoli, laboranimáció-jellegű az átadott makró-fotós, kék–lila DNS minimálreferenciához képest. A R2337 anyagfinomítás önmagában nem elég a vizuális minimumhoz.
- **Tényleges filmes javítás:** az első teljes DNS-beállítás (`t<0,88s`) sértetlen. Utána **az eredeti egyetlen Three.js PerspectiveCamera** simított (`smooth`) közelképre mozog; a plusz nagyítás 3,30 s előtt teljesen kifut, így a 3D sejt/négyágú MAG eredeti kamerája és teljes 10 s-os timeline megmarad. Mobilon a portrékivágás eltérő magnitúdót kap, extra camera, canvas, mesh, texture, RAF, renderpass nincs.
- **Regresszió:** új `.github/scripts/validate-genesis-macro-camera-r2340.cjs` a tényleges Three r185 kamera-metódussal ellenőrzi a változatlan 0,5 s-os establishing shotot, a 2,5 s-os fizikai közelítést, a 2,70 és 3,30 s-os folytonosságot, valamint a 10,00 s-os eredeti MAG kameratávolságot mobil és desktop profilon. Kötelező P0 syntactic+runtime teszt.
- **Nyitott:** friss pontos-SHA-n futó P0, fotorealisztikus összevetés, Android/desktop 60 FPS és Lighthouse×3. Jelen ág fejlesztői/draft, nincs release.

## R2339 – Sejtmagszövet: determinisztikus szemcsézettség és mattabb sejthártya (2026-11-08)

- A felhasználói biológiai makroreferenciához képest a R2333 5,5 s-os valódi képkocka túl homogén és túl csillogó cellát mutatott. A R2339 meglévő `makeEmbryoTexture()` generátorába **új mintavétel nélkül** visszafogott chromatin/granulum kontraszt került: a már létező `mineral`, `cloud` és `hash` értékeket használja. Nem keletkezik új GPU-textúra vagy képfájl; mobil 384×192, desktop 512×256 változatlan.
- A meglévő 3D membrán PBR anyag mattabb, az emisszió és üvegszerű clearcoat mérsékeltebb; a belső sejtmagnak és a magyar szövegnek nem változtak tulajdonságai.
- Új valódi Three.js futtatásos `.github/scripts/validate-genesis-chromatin-r2339.cjs` szerződés ellenőrzi az összes eredeti textúraméretet, képpuffer determinisztikus azonosságát, az alfa-csatornát és a nemegyszínű szemcsézettséget mobil/desktop profilon. P0-ba bekötve. A R2338 csak **rögzíti** a hibás késői geometriai hozzáférés teljes JS-hívási láncát; az eredeti nulla late-read kapu változatlan.
- **Még nyitott:** valós GPU és Android Chrome referenciaképi elfogadás, 60 FPS, headless compositor és Lighthouse×3 cél. Nem élesítve, PR #582 draft.

## R2337 – Valódi 3D DNS biopolimer, anyag- és mikrostruktúra (2026-11-08)

- **Vizuális kontroll:** az előző, tényleges Chromium-képkockán a nyitó DNS túl pasztelles/sima csőnek hatott a megadott kék–ibolya, rostos referencia minimumhoz képest. A turkiz–korall 3D sejt további részletezése nyitott.
- **Fejlesztés a MAG után:** a meglévő, valódi Three.js DNS-kettős spirál két fizikai gerincanyaga mélyebb szafír/ametiszt színt, mérsékeltebb saját fényt, mattabb szatén clearcoatot és erősebb, de közös 128×128 foszfátrost-domborzatot kapott. Egyetlen, már meglévő DataTexture marad; nincs új mesh, draw, renderpass, WebGL canvas vagy RAF.
- **Védelem:** a R2328 régi exact-material assertion a **tényleges új** anyagértékekre frissült; a további R2337 oracle a bundled Three r185-tel valós 3D helixet épít mobil/desktop profilban, ellenőrzi a 7 eredeti child objektumot, a két fizikai szálat, közös GPU-textúrát, annak 64 KiB méretét, és a másodlagos donorok textúraújrahasznosítását. Kétlépcsős source+runtime ellenőrzés bekerült a P0-ba.
- **Státusz:** a kód és CI-ellenőrzés felkerült a #582 fejlesztői ágra; a végső pontos SHA-jú GPU/Chromium és Lighthouse eredmények nélkül nem állítható stúdióminőségi PASS. Élesítés/merge nem történt.

## R2336 – Filmes és végleges MAG 3D-pozíció/fény folytonossága (2026-11-08)

- **Kiinduló ág:** PR #581 (R2335), `67a25c70a2ca377bd890a425ddfcae084b1480b8`. Ez nem a production master.
- **Első prioritás: MAG.** A tényleges 3D filmes, négyágú titántest meglévő `mechanicalGroup` csoportja 7,25–8,10 s között fokozatosan felveszi a natív MAG mobil/desktop nyugalmi pitch/yaw/roll szögeit. A körbeforgás továbbra is egy valódi 3D csoport-transzformáció.
- **Stúdióvilágítás:** ugyanebben az átadási ablakban a meglévő key és fill fények kamera-koordinátákban a végleges MAG shader `keyDir` és `sideDir` irányára állnak be. Az előrefelé vetített fényerő a mozgó fényekkel korrigált. Nincs új fényforrás, textúra, mesh, canvas, WebGL-context, renderer vagy RAF.
- **Regresszió:** új `.github/scripts/validate-mag-pose-studio-r2336.cjs`: a csomagolt Three r185 matematikájával a kamera és fényforrás valós metódusait ellenőrzi mobil/desktop profilban; valamint végrehajtja a tényleges animációs pose-kódot és ellenőrzi a nyolc mintavételi időpontot. Bekötve a meglévő P0 gyorsellenőrzésbe.
- **Állapot:** kód és regressziós kapu elhelyezve, de CI és valós grafikus képkocka-vizsgálat nélkül nem állítható PASS. A #581 headless fekete kompozitorhiba és Lighthouse 3× 100/100/100/100 követelmény változatlanul nyitott; a headless pixelfeltételeken nem lazítottunk.
- **Kiadás előtti kapu:** eredeti mobil/desktop P0 + valós headed screenshot, 10 másodperces DNS→sejt→MAG film, PAUSE/RESUME ×5, Skip/reduced-motion, Android és desktop látvány-elfogadás, friss cache-verziók minden HTML/Worker betöltőben. **Nincs merge, deployment vagy stúdióminőségi elfogadás.**

## R2335 – APEX asztali optimalizálás funkcionális böngészőbizonyítéka (2026-11-06)

- **R2330 változás:** a desktop `formatx-apex.js` kezdeti feladatai felosztva; Lighthouse egyik asztali runban APEX hosszú feladat 309→135ms, TBT 249→50ms, de a három teljes Perf run 93/88/87 és mobil 82/81/84, ezért **nem 100 és nem stabil**.
- **R2335 új funkcionális kapu:** a korábbi csak source-proof mellett önálló valódi Playwright/Chromium teszt indul a pontos fejlesztői HTML `?intro=0&lang=hu` útvonalán. A böngésző saját `formatx:apexready` eseményét még az első JS előtt megfigyeli; ellenőrzi az egyetlen ready eseményt, valódi asztali menüt, magyar hero-szöveget, scene/flow kezdeti állapotot és a `critical/reveal/deferred` külön időmérőket. A konzol/böngésző JS hiba tilos.
- **P0 sorrend:** új önálló desktop APEX-bizonyíték a hosszú R656 film screenshot **előtt**, nem módosítja annak fekete képkocka kapuját; az R2334 390px grafikus MAG kontroll továbbra is külön marad. Nincs új renderer/RAF/assets és nincs élesítés.


## R2334 – valódi 390px grafikus MAG-képkocka kontroll (2026-11-06)

- **R2333 pontos `8254c2c5` P0 `42209415251`:** a forráskód-ellenőrzések PASS; a headless R656 mobil képkockán `brightSamples=0`, `centroidX=null`, miközben a mobil MAG canvas ténylegesen `x=0,width=390` és viewport `width=390`. A hibaüzenet tévesen *physically off-centre*-nak nevezte a nullpixeles kompozitorfelvételt. A külön Xvfb grafikus Chromium 3/3 MAG coldstart **PASS**. A teljes P0 tehát továbbra is RED.
- **R2334:** a megbízható `capture-mag-intro-r656.cjs` eredeti valódi PNG-pixel és 30–70%-os centroid-kapuja **változatlan**, de a képhez diagnosztikai `failureClass` tartozik, amely elkülöníti a `0 bright` kompozitorhibát a valós elcsúszástól. Új `FORMATX_HEADFUL_VISUAL_R2334=1` csak kifejezett CI env alatt teszi headedre a Chromiumot.
- **Független kontroll:** a P0-ban az eredeti headless R656 *után* `if:always()` Xvfb headed Chromium 390×844 natív MAG elsőképernyőképet és pixelelemzést készít `MOBILE_ONLY=1` módban, külön `artifacts/r2334-headed-mobile-native/` artifactként. Ez nem változtatja a headless black-frame PASS/FAIL döntést és nem leplez hibát: a teljes P0 továbbra is fail marad, ha a headless képkocka fekete.
- **Studio acceptance:** a sejt referenciafényképtől eltérő sötét középső organellumát R2331 módosította; az új grafikus képen ellenőrizendő a 3D szövet minősége és a valódi MAG sziluett, majd Android Chrome és Lighthouse ×3. Nincs merge vagy deployment.


## R2331 – biológiai sejtmagszövet makrofotográfiai anyaga (2026-11-06)

- **Vizuális bizonyíték:** a korábbi valódi 5,50s mobil GENESIS screenshoton a türkiz–korall sejthéj mögött kontrasztos, szinte fekete, tökéletes kör alakú organellum volt; az apró felszíni vesiculák túl csillogó gyöngysorokra hasonlítottak. A referencia térbeli, diffúz, sejtszöveti belsőt kíván.
- **R2331 változás:** a **meglévő** `embryoTexture` közös foszfát-/sejtszövetes mintát a valódi, 32×24 szegmensű 3D nucleus `map`, `emissiveMap` és finom `bumpMap` rétegként is használja; nincs második kép, további DataTexture vagy WebGL vászon. A mag sugara `.25→.22`, z-depth `.37→.28`, a kerek sötét arc mérete és előugrása csökken. Roughness `.44`, alacsonyabb transmission `.13`, meglévő fényrig.
- **Sejtes felület:** a már meglévő **42 mobil / 84 desktop** instanced vesicula változatlan darabszámmal, de visszafogott `roughness=.68`, `clearcoat=.22`, `opacity=.43` felülettel dolgozik; nem olcsó fémgyöngyként ül a seben. Nem nő a mesh-szám.
- **Kontroll:** R2331 új source guard; a meglévő 10 s filmsorrend, három kísérleti first-frame pixel, R536 filmes folytonosság, 4 viewport, Lighthouse ×3 ellenőrzések követendők. Teljes stúdióminőségi igazolás továbbra is hiányzik, nincs merge/deploy.


## R2330 – APEX asztali főszálterhelés szétválasztása (2026-11-06)

- **Mérési alap:** a R2328 `d567a102` három Lighthouse desktop futása 84/92/88 Performance, az elsőben `formatx-apex.js` **309 ms** összefüggő főszál-feladatot okozott. Mobilon az APEX korábban is a korai native-core ágon visszatért: ehhez nem nyúlunk.
- **Változtatás:** az első festés szempontjából kötelező navigáció, már kész statikus HU/EN szöveg, kezdő scene, árak és `formatx:apexready` esemény szinkron marad. A tömeges `[data-reveal]` megfigyelő regisztráció 48 ms-os, a lenti interaktív folyamatszakasz és az egérkövető 116 ms-os külön macrotaskban inicializálódik. Ezek nem változtatják a natív MAG renderert, DNS-filmet vagy tartalmi sorrendet.
- **Takarítás:** a korábban dupla `updatePrice()` hívás megszűnt, mert az első `applyLanguage()` már elvégzi. A függő időzítők oldalelhagyáskor törlődnek. A kritikus, reveal és deferred szakaszok millimásodpercben mérhetőek az `fxApex*R2330` dataseten.
- **Regresszió:** külön R2330 source guard a P0-ba. A kötelező elvárás: eredeti `apexready`, HU/EN és vásárlás, scroll MAG-content, desktop/mobile Lighthouse×3 és eredeti P0; a főszálterhelés javulását csak **új, pontos SHA-ra futtatott méréssel** lehet állítani.
- **R2329:** a MAG kanonikus pixel/surface-energy ellenőrzése zöld (run `42207311030`), a teljes film P0 eredménye külön ellenőrzendő. **Nincs production deploy vagy merge**.


## R2329 – MAG anyagvizsgálat a valódi pixelhez kötve (2026-11-06)

- **Konkrét blokkoló:** a R2328 `d567a102` Canonical MAG job a `validate-mag-surface-energy-r484.cjs` scriptben a `mobile-390: final mobile crystal is too dim; computed=none` hibával leállt, mivel a 2026-os R2320 módosítás óta a WebGL MAG-on szándékosan `filter:none` van. Az elavult teszt CSS-fényességet mért, nem a valódi kompozitorkép fényességét.
- **R2329 javítás:** a tiszta `filter:none` út csak akkor fogadható el, ha a közvetlen R2320 egyetlen canvas, a R2326 fizikai titán/iris shader és a R2327 eredeti négyágú geometria állapota mind az elvárt. A korábbi szűrős út számszerű ellenőrzése érintetlen.
- **Valódi, szigorú pixelkapu változatlan:** az eredeti Chromium CDP `Page.captureScreenshot({fromSurface:true})` 64×64 mintáján az idle fényerő maximum `>60`, látható terület `>2%`, korai/késői tényleges felületi változás `>=8` minta, valamint térben mozgó fénycentrum marad a kötelező kapu. Nincs screenshot retry, új shader, fallback, gyengített küszöb vagy új vászon.
- **Ugyanezen R2328 fejlesztői commiton:** grafikus Xvfb Chromium három első-képkockás indítása 3/3 PASS, headless 2/3 PASS; négy valós képernyőméretű MAG-dokkolás PASS. Desktop Lighthouse 84/92/88, mobil 88/88/90, tehát még nem kész. Nincs merge/deployment.


## R2328 – filmes DNS és sejt: biopolimer mikrodomborzat, szerves átmenet (2026-11-06)

- **DNS térbeli szálai:** a procedurális 64×64 foszfátrost-textúra 128×128-ra növelt; továbbra is **egyetlen** közös, indításkor generált 64 KiB GPU-textúra, sem új vászon, sem új renderpass. A bump-pontosság `mobile .008→.011`, `desktop .012→.015`, a valódi hajlított Three.js DNS-geometrián.
- **Sejtfázis:** a MAG fém-irisét megelőző belső organellum mattabb, hidratált türkiz anyagot kapott (roughness .32, emissiveIntensity .31), a túl sötét kör helyett. A külön anyamembrán, citoplazmás szemcsék és korall-kapillárisok megmaradtak.
- **Transzformáció:** a 7.28 s-tól kialakuló filmen belüli hátsó cortex mérete a sejtfázis után 1.08 helyett .86-ra ül be, követve az R2327 kisebb és mélyebben ülő permanens MAG kérget. A korábbi nagy sejt képi fázisa változatlan, 10.00s animációs idővonal és renderloop marad.
- **Vizsgálat:** az R2327 négy valódi viewport dokkolása zöld (`42144033307`). R2328 új, szigorú source-proof és meglévő vizuális/film/P0/3× Lighthouse egyaránt kötelező. Grafikus Chromium R2325 3/3, headless compositor nem determinisztikus; a teljes CI továbbra is piros, élesítés nincs.


## R2327 – a kész MAG arányainak helyreállítása (2026-11-06)

- **Valódi grafikus bizonyíték:** R2325 Xvfb/Chromium `cold-handoff-1.png` képen a négyágú titán-MAG mögött a kékeszöld sejtkéreg túl nagy kerek tömeget alkot. A sejtkéreg a GENESIS 5,5s-es filmképen viszont helyes: makroméretű életforma. A két állapot *különböző* vizuális szerepet kíván.
- **R2327 kész MAG:** az eredeti egyetlen R326 natív 3D mesh corticalis ellipszoidja `[.665,.710,.405]` → `[.540,.575,.320]`, és mögötte `[.055,.055,-.170]` → `[.045,.040,-.235]`. A valódi biológiai kéreg, a mozgó kapilláris, a komplex titán geometria és a cyan iris **megmarad**, de a négyágú 3D csillag dominál. Változatlan tesszelláció/draw count/context/RAF.
- **R2326 anyagok:** titán mikroél, türkiz–korall stroma és átlátszó, belső optikai fénytörés külön commitban elkészült; négy viewport-dokkolás teszt **PASS** (`42143601619`). Az eredeti P0 fekete-screenshot és a Lighthouse továbbra is piros; studio, 60fps és production még nem minősíthető.
- **Biztonság:** az R2270 eredeti kortex-kontraktusát az új valós 3D-koordinátákra frissítettük, külön R2327 regresszióteszttel. A film eredeti DNS→cell története változatlan. Következő: friss vizuális proof és valódi grafikus viewport, majd az intro anyagfejlesztése.


## R2326 – valódi natív MAG anyagminőség (2026-11-06)

- **Bemenet:** a felhasználó által küldött négyágú ezüst/titán MAG, biológiai türkiz–korall sejtmagszövet, makrofotós DNS. Első prioritás a permanens MAG.
- **R2325 szigorú 3× Chromium kontroll:** `f0f3487` / run `42142750785`: ugyanaz a natív MAG, ugyanaz a GPU-fence és ugyanaz az első teljes képernyőképes 40/12528 minimum. **Grafikus Chromium + Xvfb 3/3 PASS:** 1195/1196/1186 világos minta. A külön headless SwiftShader-teszt és a P0 filmrögzítés továbbra is FAIL; nem gyengítjük és nem állítjuk zöldnek. A grafikus mód még nem bizonyít valódi Android 60 FPS-t.
- **R2326 natív shader fejlesztés:** a meglévő négy valódi titánág lamelláin finom, anti-aliased visszavert mikroélek (a már meglévő `panelCoord`, `panelAA`, `softboxC`, `metalKey` változókból). Az eredeti organikus cortex kapillárisaihoz visszafogott türkiz/korall mikrotér, és a tényleges, ívelt üvegszem belsejében rétegzett fénytörési villanás. Minden anyagrészlet **azonos WebGL VBO-ban/shaderben**, nincs új canvasa, új textúra, második renderer, új rAF vagy további matematikai függvény alapú díszítőréteg.
- **R2326 acceptance:** forráskód és shader compile, eredeti 3D-geometria, 4 viewport, valódi grafikus + headless first-full-viewport screenshot, P0 és Lighthouse×3. A minőség és 60 FPS vizuális ellenőrzés előtt nincs studio PASS. PR #581 draft, nincs merge/deploy.


## R2325 – WebGL képernyőkép: headless és headed Chromium szétválasztása (2026-11-06)

- **R2324 teljes P0 `42141679457` FAIL:** R656 film első teljes képernyős MAG képe **PASS**, de az R2226 három *független* hidegindítása **0/3** (mind 0/12528 világos minta). Mindhárom GPU fence `finished`, `gl.readPixels` luma 160/160/160, nem veszít contextet. A filmes crossfade javítása tehát nem biztosít determinisztikus headless megjelenítést. Az oldal továbbra sem élesíthető.
- **Érvényes hipotézisek:** a Chromium `headless + ANGLE SwiftShader` page screenshot kompozitorútja nem feltétlenül azonos a grafikus móddal; a valós megjelenítés hibája még nincs igazolva. A korábbi második screenshot gyakran már látható, de ezt **nem** használjuk pass feltételnek.
- **R2325 új, független kontroll:** a meglevő R2226 szigorú 3× *első teljes viewport* tesztje változatlan pixel- és GPU-feltételekkel másodszor is fut `xvfb-run` alatti **valóban fejjel futó** Chromiumon. A tesztet `always()` módon a meglévő headless 3× kapu után indítjuk, így a headless FAIL **nem** írható felül. Mindkét mód képernyőképei és JSON riportja külön artifactban marad; a Chrome azonos SwiftShader backenddel működik, csak a kompozitorút különböző.
- **Döntési kapu:** ha headed 3/3 PASS, a grafikus kompozitor jó, a headless teszt reprodukálhatóságát kell javítani vagy upstream hibaként elkülöníteni. Ha headed is 0/3, valódi native layout/Compositor/WebGL handoff hiba áll fenn. Bármely esetben a MAG és 10s DNS→sejt film vizuális stúdió-felminősítése, Lighthouse 3× továbbra is nyitott. PR #581 draft, nincs merge/deploy.


## R2324 – filmes réteg valódi, időben befejezett natív WebGL áttűnése (2026-11-06)

- **R2323 valós P0 eredmény:** `f9c54d5` / `42140926679` **FAIL**, első viewport `0/12528` világos pixel, GPU-fence `finished`. A plusz CSSAnimation-PAUSE nem biztosított megbízható megjelenítést; **R2323 kísérlet visszavonva** mindkét kódútvonalon.
- **Feltárt időzítési konfliktus:** R533 CSS `.is-leaving` áttűnés `.42–.72s` volt, miközben az R2254 vezérlő csak **120 ms** után eltávolította az átlátszatlan filmes réteget. Az első natív WebGL képkocka ezért a teljes viewport kompozitorában esetenként fekete maradt, hiába `gl.flush()` és `fenceSync`.
- **R2324 tényleges javítás:** sikeres natív GPU-fence után a **meglévő** R326 canvas és stage a filmes overlay alatt láthatóvá válik, majd az overlay **260 ms tényleges opacity fade** útján távozik. A filmet csak **360 ms** összes kompozitoridő után bontja le a vezérlő. Mindkét `watchdog` ehhez igazodik, így nem vágja le korábban a crossfade-et. 10,00s filmhossz nem módosul, nincs új render/canvas/RAF, nincs autoplay megkerülés.
- **A megőrzött R2322:** WAAPI mikrobreath 1150 ms utáni késleltetett visszaállítása. Egyetlen WebGL renderer, fizikai anyag és minden screenshot-pixelkapu változatlan.
- **Elfogadás:** R656 valódi első teljes viewport, 3/3 R2226 hidegindítás, 4 nézet dock, reduced/Skip, PAUSE/RESUME ×5, Lighthouse ×3. A hibás R2323 regresszió nincs élesítve; PR #581 draft, no merge.


## R2323 – duplán animált natív WebGL réteg versenyhelyzetének izolálása (2026-11-06)

- **R2322 bizonyíték:** a `d3af6c7` P0 filmátadás első képkockája `1271/12528` világos minta, korábban `0/12528` – tényleges pixeljavulás. A három *független* R2226 hidegindításból **2 PASS, 1 FAIL** (1320/0/1320 bright), ezért a P0 még **FAIL**.
- **Feltárt második animációs tulajdonos:** a `formatx-mag-mobile-optics-r480.css` `fx-primary-mag-mobile-heart-r488` CSSAnimation mindig működött az R326 vásznon a külön `fx-primary-mag-living-breath-r1930` WAAPI mellett. A CSS `animation` még desktopon is létezik és `will-change:opacity` kompozitorréteget tart aktívan.
- **R2323 forrásváltoztatás:** a film alatti natív MAG-vászon **mindkét animációja** szünetel; a CSS-hez csak ideiglenes inline `animation-play-state:paused!important` kerül, amelyet a meglévő 1150ms post-exposure callback eltávolít. A CSS keyframes, animation identity, tényleges WebGL render, fontossági sorrend, reduced-motion és a globális PAUSE/RESUME owner nem törlődik. Ha a felhasználó kézzel megállított, a WAAPI nem indul újra önkényesen.
- **Elfogadás:** valós R656 első képkocka, 3/3 hidegindítás, négyviewportos dokkolás, Lighthouse 3× és PAUSE/RESUME ×5 szükséges. A legkorábbi tételes fekete-képkocka pixelgate érintetlen; sem fallback, sem screenshot-emuláció nem került be. PR draft marad, élesítés nincs.


## R2322 – MAG első képkocka: átadás és lélegző animáció elkülönítése (2026-11-06)

- **R2321 pontos `bc9c96e` P0 `42139288180` FAIL:** a teljes viewport fizikai MAG-régiója továbbra is **0/12528 világos mintát** tartalmaz, noha az eredeti WebGL központi GPU pixel `160,255`, a fence `finished`, a canvas `filter:none`, `opacity:1` és minden vizsgált DOM-ős látható. A R2320 CSS filter/opacity-elvétel **önmagában nem oldotta meg** a hibát.
- **R2322 kísérlet:** az eredeti R326 canvas meglévő finom 0,4%-os `transform` alapú lélegzése a GENESIS befejezése után 1150 ms-mal indul újra, nem ugyanabban a kompozitorablakban mint az első kanonikus natív `render()`. Egyetlen canvas, egyetlen renderer, eredeti 3D shaderek/geometria, meglévő timeout-tulajdonos; nincs új RAF. Ha a valódi P0 pixelteszt sikertelen, a hipotézist vissza kell vonni.
- **P0:** kiegészített forrásvédő ellenőrzés. A 350 ms-mal az átadás után készített valódi full-viewport screenshot fekete küszöbe változatlan; csak ez bizonyítja az első frame helyességét. Skip/reduced-motion, 4 viewport dokkolás és Lighthouse 3× továbbra is kötelező.
- **R2321 Lighthouse-mérés:** desktop és mobil kategóriahiba maradt; korábbi R2320 desktop 89/88/90, mobil 84/79/82. A fotórealisztikus minőség és a 60 Hz továbbra sem igazolt. Nincs merge vagy deployment.


## R2321 – R2320 WebGL animáció tiszta felszabadítása (2026-11-06)

- **R2320 valós P0 hiba (run `42138643575`):** a korábbi `mobileBreathPreference` figyelő már megszűnt, de a R326 `destroy()` még el akarta távolítani. Valódi Chromium `ReferenceError: mobileBreathPreference is not defined` hibát mért, ezért a P0 piros; NEM a fekete képkocka javítását sikernek nyilvánító jel.
- **R2321:** a `destroy()` most a tényleges `livingTimeline?.cancel?.()` animációt állítja le; a régi, már nem létező matchMedia-listener hivatkozás eltűnt. A WebGL canvas, a teljes 3D test, az intro és a fizikai fotonrészlet érintetlen.
- **Védelem:** az R2320 guard kiterjesztve a törölt névre és a WAAPI cleanupra. Új P0 és Lighthouse csak a pontos R2321 commitra fogadható el.
- **Tényadat:** az R2320 négy viewport dokkolási tesztje zöld (run `42138643404`), de a Lighthouse desktop 89/88/90, mobil 84/79/82 Performance értékekkel piros, TBT mobil 355/477/409 ms. A fotorealisztikus cél és a valódi 60 Hz nincs igazolva. Nem élesíthető.


## R2320 – fizikai MAG kompozitorjavítás (2026-11-06)

- **Valós hiba:** PR #581 SHA `4490f8e`, P0 run `41674346492`. A legelső 1280×720 MAG viewport 0/12528 világos pixelt mutatott, bár a GPU-fence `finished`, a WebGL center pixel `160,255`, és a vászon DOM-látható.
- **Javítás:** az eredeti, `preserveDrawingBuffer`-es egyetlen R326 WebGL canvas elveszíti a külön CSS filterréteget és a folyamatos opacity-animációt. CSS opacity állandó 1. A meglévő 0,4%-os mikrotransform kizárólag a film eltávolítása után indul; a valódi R326 fizikai optika, textúra, titántest, shader, fények és minden egyes MAG-háromszög változatlan. Nincs új renderer/canvas/RAF.
- **Vizsgálat:** az R2320 source guard bekerült P0-ba, a böngészőteszt az első full-viewport pixelfelvétel előtt a canvas valódi filter/opacity/animáció állapotát is naplózza. Az eredeti szigorú fekete-képkocka teszt nincs gyengítve.
- **Korábbi eredmények a javítás ELŐTT:** desktop Lighthouse 93/92/89; mobil 86/87/87, TBT 313/278/257 ms. R2320-nál P0, stúdiókép, mobil 390/430, desktop 1350/1440, Lighthouse×3, reduced-motion/Skip és valódi eszközös FPS még igazolásra vár.
- **Kiadás:** PR #581 draft; nincs merge/deploy. Következő: első valódi pixelkapu és CI kiértékelése, majd anyag- és DNS/cellafény-fejlesztés.


## R2319 – az intro teljes leállítása: utólagos MAG-elrendezésolvasás megszüntetése (2026-11-03)

- A valós R2317 P0-ban **hidegindítás 3/3 PASS**, normál látogatói natív MAG GPU PASS, 2× mobil CLS PASS és első film→natív átadás PASS. A `validate-intro-retired-layout-r2173` viszont 60 ms-mal a valódi `formatx:magbirthcomplete` esemény **után** egy R533 stackből érkező natív stage `getBoundingClientRect()` olvasást mért. Ez nem szabad, hogy a filmé legyen: a már eltávolított GENESIS-nek nulla utólagos elrendezésmunkát kell végeznie.
- **R2319:** mind a normál `safeTeardownOverlay()`, mind a watchdog bontási ág a film eltávolítása után egyetlen **szinkron natív requestRender(2)** kérést küld még a completed esemény előtt. Az R533 által ütemezett, már az esemény után végrehajtódó kiegészítő RAF meg lett szüntetve. Az eredeti R326 saját `formatx:magbirthcomplete` event listener, `render(performance.now())`, WebGL2 fence és bounded native scheduling változatlan. Nincs eltávolított motorból érkező késői geometry/layout és nincsen további renderelő.
- R2317 cortex folyamatos 3D normálok, R2318 valódi cellafoton-expozíció, 10s DNS→sejt→MAG film, 1 native canvas és 60Hz cél marad.
- R533/R1629/HTML szinkron `20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals-r2318-cell-photon-depth-r2319-native-own-final-presentation` cache-kulcs, új számolt szigorú CSP `'sha256-SrQl4alVNJZhNQYPRB8ZTPYXpv+Fijfo1l3K1jGnhCw='` a HTML és a Worker mindkét policy-jában. Historikus SHA értékek változatlanok; az R2318 guard az aktuális digestet vizsgálja.
- Az új R2319 P0 source guard külön tiltja a befejezett film saját RAF-ját mindkét teardown ágban, és a valós R2173 Chromium teszt továbbra is az **összes utólagos geometriamérést tiltja**. A teljes R2319 valós P0, hidegindítás 3/3, filmes képkocka és Lighthouse×3 még ellenőrzendő. PR #581 draft, nem élesített.



## R2318 – biológiai születési felvétel: a valódi sejtmag visszaemelése az additív fényfelhőből (2026-11-03)

- A valós R2307 5.5 s Chromium screenshoton a 3100 volumetrikus sejtfoton túl intenzív additív fényével eltakarja a valódi 3D membrán redőit és az organellumokat. A cél nem részecske- vagy fényrészlet-csökkentés, hanem valós fotográfiai fényegyensúly.
- **R2318:** az eredeti **3100 desktop / 1200 mobil** sejtfoton, azok teljes 3D pozíciója, meglévő GPU shader és draw call, a 84 organellum és PBR burkolat változatlan. Csak a szemcsés biolumineszcens **expozíció** módosul `0.55→0.44` desktopon és `0.48→0.39` mobilon. A DNS 620/260 fotonjának fényviszonyai, a tényleges genom 9600/6000 pontja és a MAG optikája teljesen változatlan.
- R2317 folyamatos szövetnormálok és R2309 teljes filmsziluett megmaradnak; ez a fotonfény-súly 5.5 másodpercnél több anyag- és mélységi információt hagy láthatóvá, nem vált 2D sprite-helyettesítésre.
- R1280/R533/R1629/HTML ugyanazt a `20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals-r2318-cell-photon-depth` verziót tölti. Számolt új `SHA256`: `'sha256-I9BV716/if4kiSgvO1NB8uWx1E1JodXBfzfVSWPBEpI='`, HTML CSP-ben és Worker **mindkét** CSP-jében. Régi hashek változatlanok. Új valódi geometria és részecskeszámot rögzítő source guard P0-ban.
- A Lighthouse és P0 új commiton mért eredménye, 5.5s GPU screenshot és a teljes 60 Hz teljesítmény **még nincs igazolva**. PR #581 draft, nincs élesítés.



## R2317 – stúdió MAG: valódi 3D biológiai cortex fénykezelés (2026-11-03)

- A korábbi 9,25s tényleges GPU screenshoton a fém MAG mögötti valós biológiai sejtburkon háromszögszerű szögletes világítás látszott. Az R2295 `IcosahedronGeometry(1.38,4)` **nem indexelt**, ezért a `computeVertexNormals()` minden arcot külön normállal árnyalt.
- **R2317:** a már fizikailag deformált **ugyanazon létező** cortex mesh `position` attribútumából konstrukciókor egyszer, normalizált radiális normálokkal felülírjuk az eredeti `normal` buffert. A redők, szín-VBO, biológiai erek, PBR clearcoat és mikro-textúra megmaradnak, a szövet mélységi fényátmenete folytonos.
- Nincs további mesh, canvas, renderer, fény, triangle, draw call, textúra, animációs passz vagy per-frame JS-normálszámítás. A változás kizárólag egy régi GPU-vertexattribútum egyszeri korrekt kitöltése; a 60Hz célhoz nem ad frame-költséget.
- Frissített R1280, R533, R1629, HTML-parser cache verzió: `20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals`; számolt új `SHA256` parser hash: `'sha256-vh2bzwpV1DHROGxgvbLipn4xxvFA7RTDFj5ao0/l3ZE='`. HTML CSP, valamint mindkét Worker CSP pontosan engedélyezi. Előző hash-ek megmaradnak. Az R2309 kamerateszt a legfrissebb CSP-t dinamikusan ellenőrzi.
- Új `validate-genesis-smooth-cortex-r2317.cjs` a P0 workflow-ba integrálva. **Valódi R2317 filmes screenshot, P0 és 3× Lighthouse futás szükséges, eredményt nem előlegezünk meg.** PR #581 draft, nincs élesítés.



## R2316 – MAG: változatlan fizikai képernyődoboz, kizárólag kompozitoros dokkolás (2026-11-03)

- A R2315 (`dd8bbd47`) **valódi** 390/430/1350/1440 Chromium gyors tesztjén a desktop home MAG már mindkét asztali nézetben `position:fixed` y=112px volt, tehát a korábbi absolute→fixed hiba megszűnt; ennek ellenére **1440 normal intro** dock CLS=0,1893181916 volt. Forrás stage previousRect 0→currentRect 652,112 / 720×605.
- **Következtetés:** a layout primitive már nem változik, a stage alap `top/left/width/height` mérete és helyzete viszont továbbra is a CSS natív archívum aktiválásakor mutált. A 360ms FLIP a vizuális pixeleket kompenzálta, de a Chrome a kiemelt layout-objektumot újra elszámolta.
- **R2316:** az egyetlen létező R326 canvas stage eredeti, R2315-ben a 10s film végén pixelpontosan előkészített viewport-fixed helye **változatlan marad az egész scroll dokkolás alatt is**. Új, csak desktop aktív archive szabály a tényleges `left/top/width/height` tulajdonságokat a már meglévő `--fx-native-home-*` értékeken tartja; a bal sáv cél méretét és helyét a JavaScript a dokkolás **előtt** számítja és kizárólag CSS `translate/scale` transformmal 360ms alatt jeleníti meg. A natív render/texture/shader/context, DNA→MAG film, mobil-only R2294 és visszaállítható eredeti DOM változatlan.
- A test P0 nem módosult és továbbra is 1440 CLS=0, natív stage közvetlen GPU draw, egy canvas/context, valódi scroll→archívum, végső bal sáv x36,y108,width547,height666 és mobile 390/430 + desktop1350 geometria igazolásra vár. A régi fallback desktop FLIP csak akkor marad, ha a fix home nem előkészíthető, így akadálymentes html fallback nem romlik.
- A CSS és JS R2316 cache bust, külön forrás-QA és `PROGRESS.md` aktualizálva. A négyviewport **valódi** R2316 CI még nyitott; nincs hamis sikerjelentés, PR #581 draft, nincs deploy.



## R2315 – stabil, viewport-fixed MAG már az első asztali hero képkockán (2026-11-03)

- Az új R2313 gyors **valódi** Chromium négyviewport teszt az R2314 rollback után is: mobil 390/430 és desktop 1350 PASS, **1440px normál 10s intro → scroll FAIL CLS=0,10622972**. Az eredeti R2309.1 zöld P0 csak az egyik időzítési mintában sikerült; rollback nem oldotta meg a race-et.
- A 1440-as `LayoutShift` forrása az **ugyanazon natív canvas** először y=-266px-re görgetett, még `position:absolute` stage-ből a viewport `position:fixed` dockba lépésénél jelent meg. A CSS-only 360ms inverse-FLIP az animált pixeleket megtartja, de a DOM-layout primitive tényleges váltását nem tudja teljesen kompenzálni.
- **R2315 megoldás:** a 10s GENESIS `formatx:magbirthcomplete` eventnél, a felhasználó első scroll-ja **előtt**, a már ténylegesen kirajzolt egyetlen R326 stage eredeti, képernyőben látható pontos 4 koordinátáját CSS custom propertyként rögzítjük. Az új desktop-only archive CSS ekkor a stage-et **ugyanabban a látható 720×605px hero helyben** `position:fixed` állapotba állítja, miközben a .hero-space eredeti 520–620px magasságú grid horgonya megmarad. A scroll-kori natív archive dock ekkor fixed→fixed layoutból, kizárólag compositor invertált transformból indul. Mobil R2294 változatlan, 0 új WebGL canvas, draw, frame vagy render.
- A `livingready`, `real3dready`, `pageshow`, `resize` útvonalak ugyanazt a natív stage-et készítik elő, későn betöltött archívum esetén is; reduced-motion/lifecycle stop visszaadja az eredeti layoutot és törli a custom propertyket.
- A valódi P0 most **kifejezetten megköveteli**, hogy desktop 1350/1440 esetén már `scrollY=0`-nál a natív MAG `position:fixed`, y≈112px legyen, majd ugyanúgy nincs `LayoutShift`. Külön source QA + HTML/CSS/JS cache key frissült. A R2315 négyviewport screenshot és teljes P0 eredmény még **ellenőrizendő**, nincs megalapozatlan PASS. PR #581 draft, nincs deploy.



## R2314 – visszatérés az igazolt négynézetes MAG-dokkoláshoz (2026-11-03)

- Az R2313 gyors Chromium workflow bizonyítéka: **390 px mobil PASS; 430 px mobil PASS; 1350 px desktop PASS; 1440 px desktop FAIL (CLS 0,1060799576)**. Mind a négy tesztben ugyanaz az egy WebGL2 canvas maradt, GPU-hiba nélkül.
- Az R2309.1 `8a46d0bf3` pontos commit **ugyanezeken a valódi viewportokon P0 SUCCESS, 0 natív stage layout shift** volt. A 1440 regresszió csak az utána bevezetett R2310 (két natív kompozitor-frame gate) és R2311 (matematikai FLIP-cél) után jelentkezett. Ezért az R2310–R2312 kísérleti scroll-gate/FLIP logikát visszavontuk; ez mérésen alapuló rollback, nem teszt-kikapcsolás.
- A `docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js` kódja **byte-pontos** visszaállítás a négy viewporton zöld R2309.1 verzióra. A HTML új R2314 cache-keyt kap, így valódi látogatóknál nincs régi script-cache. Az R2270 forrás QA újra a zöld, scrollY>6% natív belépési szerződést védi. A korábbi R2310/11 őrzőellenőrzések eltávolítva a P0 futásból, mert csak a **visszavont** kísérleti implementációt ellenőrizték.
- A R2310/11 specifikus guard-fájlokat eltávolítjuk, hogy ne lehessen elavult követelményből álhibát előállítani. A valódi 4× képernyőméretet, GPU, fixed pozíciót, CLS=0 és scroll-átadást vizsgáló **eredeti R2173 böngészőteszt továbbra is változatlan**; az új R2313 külön gyors workflow is marad.
- DNS→sejtmag→MAG R2303 valós membrán, R2307 titánírisz, R2309 7,50s teljes képkivágás, CSP, három hideg GPU-indítás és a 10s film teljesen érintetlen. **R2314 saját gyors viewport + teljes P0 + Lighthouse háromszori mérése még szükséges.** PR #581 draft, nincs élesítés.



## R2313 – négy valódi böngészős MAG-dokkolás külön gyors ellenőrzése (2026-11-03)

- A teljes P0 15+ percig is tarthat, a négy valódi viewport-dokkolási ellenőrzés csak a végén fut. Közben a korábbi R2311 hibát a tényleges scroll-gate teszt túl későn mutatta meg.
- Új **független, pontos SHA-ra futó** GitHub Actions workflow: `MAG real browser viewport dock gate`. Playwright 1.62 / Chrome, eredeti production HTML/JS helyi 4178-as webszerverről, **ugyanazt a változtatás nélküli** `validate-native-mag-dock-entry-r2173.cjs` tesztet futtatja: mobil 390/430, desktop 1350/1440, valódi intro+scroll, MAG valódi GPU canvas, R2304 fix lane, R2310 compositor readiness, egy context és 0 unexpected layout shift.
- Sikertelen esetben is megőrzi a valódi böngészőképek és naplók `artifacts/native-mag-dock-entry-r2173/` bizonyítékait. A teljes P0 és a Lighthouse **külön továbbra is kötelező**; ez a workflow nem kerülheti meg őket.
- Nem módosult a DNS, a sejt, a MAG, a shader, a WebGL renderer, a CSP és a felhasználói UI. PR #581 draft, nincs deploy; a 4× browser PASS az új commiton még ellenőrzendő.



## R2312 – mobil DNA → MAG átadás és natív scroll-deadlock javítása (2026-11-03)

- Az R2311.3 pontos SHA `a7db5d2` GitHub Actions P0 sikeresen elvégezte a forrás QA-t, a 3/3 valódi WebGL cold-startot, a 10s filmes képkocka QA-t, a valódi kétirányú session-handoffot és a CSS visszaállítást; a **mobil-390** natív dokkolás 25s timeoutot adott, még a CLS-ellenőrzés előtt.
- **Valódi gyökérok:** az R2310 asztali, két kompozitor-képkockát megkövetelő `nativeHomeCompositedR2310` gate inicializálása az aktív film alatt `false` volt; a `magbirthcomplete` event csak asztali gépen aktiválta, így **390/430px mobilon örökre `false` maradt**, és minden scroll-blokk tiltva volt.
- **R2312:** mobilon az eredeti R2294 állandó, `position:fixed` stage-geometria miatt a natív scroll azonnal biztonságos a 10s film végén. Mind a normál `magbirthcomplete` event, mind a késleltetett `init()` esetén `nativeHomeCompositedR2310=true` és `mobile-stable-fixed-lane` jelzés áll be. Asztali gépen a két valódi GPU/RAF kompozitor-képkockás R2310 gate és az atomikus R2311 viewport-FLIP **változatlan**.
- A szigorú forrás QA minden új R2312 mobil feltételt és a desktop gate fennmaradását ellenőrzi. Az R1987 archive JS cache-azonosítója megváltozott; CSP, film, shader, 3D mesh, MAG canvas és a 10s timeline nem változott.
- A **teljes R2312 P0** (mobil 390/430; desktop 1350/1440; CLS=0) és Lighthouse 3× jelenleg még nem igazolt az új commiton. PR #581 draft, élesítés nem történt.



## R2311 – CLS-mentes, atomikus natív MAG képkocka-átadás (2026-11-03)

- Az R2310 friss javítása először két natív WebGL compositor képkockát követel a 10 mp-es film vége és a scroll-archívum között; ezt **megtartjuk**. Az R2307–R2309 normál Chromium 1440×900 tesztben a viewportba ugró MAG kezdeti stage-layout 0,1062297 LayoutShift-et okozott.
- **R2311 további gyökérok:** a desktop `ResponsiveExperience.dock()` közvetlenül a fixed-position class/dataset váltás után `stage.getBoundingClientRect()`-tel forced layoutot váltott ki, még a fordított FLIP transform telepítése előtt. A böngésző ekkor már bejegyezhette a közbenső, natív stage-ugrást.
- **Javítás:** a desktop cél-lane determinisztikus értékei `left=2.5vw,top=12dvh,width=38vw,height=74dvh` a görgetés és classváltás **előtt**, az eredeti CSS-sel azonos CSS mértékekből származnak. A class átállítás után az első post-toggle geometry flush már csak a `translate/scale` inverz CSS transform feltelepítése után történik. Mobilon az eredeti csupán kompozitoros dokkolás marad, a R2310 kétképkockás natív gate megmarad.
- Ugyanaz az egyetlen native R326 WebGL2 MAG canvas, 360 ms-os FLIP, DOM tartalom és minden motor. Nem változik a DNS→sejt→MAG film, 7,5 s teljes kivágás, PBR árnyalás, 60 Hz cél, CSS pozícionálás vagy CSP. A külső JS fájl R2311 új cache-címet kapott, szigorú CSP-hash változtatás nem szükséges.
- Új forrás QA ellenőrzi a tényleges CSS és JS lane paritást, a mérések sorrendjét, kétképkockás R2310 gate fennmaradását. A **valódi 1440px és 1350px böngészős CLS=0**, az intro R2309.1 pixelkapu és 3× LH ezen az SHA-n még ellenőrzendő; nincs fiktív PASS, PR #581 draft, nem került élesítésre.



## R2310 – normál intró utáni natív MAG 1440px első kompozitor-képkocka (2026-11-03)

- A valós R2308 P0 log szerint 1440×900 **normál 10mp látogató** esetén a MAG home fizikai pozíciója x652.02/y112/720.48×604.80, de az első görgetéskor a böngésző a stage LayoutShift `previousRect=(0,0,0,0)`, `currentRect=(652,0,720,338)` állapotot adta és CLS=0.10623. A 1350-as automatizált, intrót kihagyó belépés 0 váratlan stage-eltolódással PASS. Ez a két teljesen eltérő belépési időzítéshez tartozó compositor-átadási versenyhelyzetre utal.
- A következő R2310 módosítás **normál desktop** filmes `formatx:magbirthcomplete` esemény után két egyszeri, bounded `requestAnimationFrame` megjelenítési lehetőséget ad az eredeti natív WebGL2 MAG-nak. Az ezalatt bekövetkező scroll események nem dokkolhatnak azonnal; a valódi görgetési pozíciót azonban megtartjuk, és a következő vizuális ciklus után a helyes 38vw×74dvh natív archívba kapcsolunk. Nem lesz új canvas, WebGL2 renderer, RAF-hurok, képhelyettesítő vagy eldobott szekció.
- A mobil R2294 fizikai stage változatlan, a fej nélküli oldallátogatás film nélkül azonnali, a reduced-motion/html fallback szintén érintetlen. Visibility resume esetén a még várakozó egyszeri gate befejeződik, nem marad beragadt archívállapot.
- A R1987 JS cache-kulcsa frissült (nincs inline CSP hash-változás). A P0 továbbra is megköveteli a 1440×900 és 1350×940 képernyőhelyet, az egyetlen kontextust, hibamentes WebGL2-t és **nulla kéretlen LayoutShift-et**; a home stílus opacity/display/visibility és az egyszeri gate státusza új telemetria.
- Az R2309.1 valós PNG képszél QA, 10s studio film, R2307 fémírisz és R2303 sejthártya érintetlen. **Új pontos SHA P0/Lighthouse még szükséges, ne tekintsük késznek a vizuális célokat.** PR #581 draft, nincs élesítés.



## R2309.1 – a teljes MAG-kamerakeretezés automatikus valódi képkockás kapuja (2026-11-03)

- Az R2309 pontos SHA-n a 7,5 másodperces 1280×720 valódi Chromium-felvételt összevetve a korábbi R2307-tel a felső és alsó MAG-csúcs kilógása **megszűnt**. A R2309 P0 forrás-QA PASS volt, a filmképkocka rögzült, viszont a régi R2217 teszt a hibásan 2,85–3,40 egység közötti kamera-Z-t követelte, ezért téves FAIL-t adott az új **4,36** helyes z-re.
- Az R656 képkockateszt most már a kamera Z-t **és a valódi PNG pixeleket is** vizsgálja 7,5s-nél: a felső és alsó 7,5%-os képsáv nem tartalmazhat levágott világos fémcsúcsot, ugyanakkor a középső területnek bizonyíthatóan valódi fémes MAG pixeleket kell tartalmaznia. Továbbra is valódi Three.js WebGL2 renderelésből készül a screenshot.
- A 9,25s natív kameraátadás régi pontos ellenőrzése, a CSS, a motor, a film, a CSP, a shader, a geometria, az egyetlen kamera/renderer és a 10s idővonal változatlan. **Csak a P0 vizuális követelménye lett szigorúbb és pontosabb.** A 1440×900 normál látogatós stage CLS még nyitott, nem kerül megkerülésre.
- Következő R2309.1 pontos SHA ellenőrzése: új 7,5s screenshot pixel PASS, 1440-as MAG-átadás, Lighthouse 3×, majd hardver 60 FPS. A PR #581 draft marad, nincs élesítés.



## R2309 – 7,50 s teljes mechanikus MAG kamerakeretezés, valós filmképkocka alapján (2026-11-03)

- Az R2307 GitHub Actions 1280×720 képkockája alapján a 7,50s MAG felső és alsó csúcsa a kamera túl közeli két egymásra fedő dolly-ja miatt fizikailag kilógott a képből. A 9,25s kész MAG már látszott teljes egészében.
- **Javítás:** egyetlen már meglévő 42°-os perspektívakamera, egyetlen folyamatos 10 másodperces film. A 6,28–8,58s születési fázisban fokozatosan és végponti ugrás nélkül megőrzött minimum `z=4.36` kameratávolság biztosít helyet a még nagyobb, születő titánkeret csúcsainak. Az eredeti kamera és a 9,8s natív MAG-handoff állapot változatlan, mobil képkocka változatlan.
- Nem változik a R2303 biológiai hártya, a R2307 16 fizikai titánfacetta, a DNA filament/részecske, a 3D világ, a mozgás-RAF és a WebGL2 canvas. 0 új mesh, fény, kamera, draw pass, shader vagy frame-allokáció.
- Az R533→R1280, az R1629→R533 és a HTML inline korai parser azonos `20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis` asset-verziót kapott. Új **számolt** SHA256 `'sha256-K0p8k+dD/0/VM2JmXW6XXkELuawyxdIzJ/UGhsITzAQ='` engedélyezve HTML CSP-ben és mindkét Worker CSP policy-ban. A régi audit-hash-ek megmaradtak.
- Külön P0 forrásregresszió ellenőrzi az egykamerás folytonos képkivágást, loader-paritást és a két pontos CSP-t. **Szükséges** az új 7,50s/9,25s valós Chromium screenshot és a teljes R2309 P0 1440 CLS / 3× Lighthouse ellenőrzése. PR #581 draft, nincs élesítés.



## R2308 – R2306 CSS preload visszavonása a valós P0 és Lighthouse regresszió miatt (2026-11-03)

- **Ok:** az R2306 spekulatív desktop CSS preload után a natív MAG átvitel 1440×900-as, normál 10s intróindításnál 0,1062297 váratlan stage-eltolódást mér, miközben az R2304 pontos SHA-ján az ugyanez a négy valódi Chromium nézet **PASS** volt (mobile 390/430, desktop 1350/1440).
- Az R2307 Lighthouse desktop 92/87/90, mobil 82/84/84. A korábbi R2305 desktop 92/92/91, mobil 82/81/83; a kritikus CSS sorba helyezése tehát nem igazolt stabil javulást, és az első képkocka betöltésének időzítését kiszámíthatatlanná tette.
- **R2308:** a HTML legelső CSS preload-sorai pontosan visszaálltak a valós böngészős R2304 zöld változathoz: három korábbi mobil/design hint, nem öt új desktop magas prioritású kérés. Az eredeti stylesheet alkalmazási sorrend, minden CSP, és a R2307 új valós titánírisz 3D geometria **érintetlen**; az R2307 film betöltési SHA és verzió megmaradt.
- A P0 a nem sikeres R2306 preload guard helyett külön **konzervatív első képkockás QA-t** futtat, amely tiltja a három új desktop preload újrabevezetését. A valós P0 böngészőteszt most logolja a natív MAG tényleges geometriai állapotát a görgetés **előtt**, és megköveteli, hogy a film utáni MAG már ténylegesen elrendezett legyen.
- A régi R2306 forrástesztet a Git fában töröljük. Nincs elrejtett regressziós kivétel; a legszigorúbb 1440×900 és CLS=0 átadás-vizsgálat változatlan. **R2308 saját, teljes P0 és LH eredménye szükséges, amíg ez nincs meg, a módosítás nem igazolt és nincs élesítés.**
 


## R2307 – stúdió MAG: kétszintű 3D titán-írisz (2026-11-03)

- A végső R1280 mechanikus MAG íriszzár korábban 8 db teljesen sík, z=.495 háromszögből állt. Közelről ezek csak HUD-szerű lapokként árnyalódnak.
- Az azonos nyolc zárólap most valódi térbeli, két síkfacettából összerakott titán geometriát kapott: belső sarok .519, külső perem .505, emelt gerinc .526. A normálok és a flat-shaded MeshPhysicalMaterial kemény éle valódi kétoldali stúdió-softbox tükröződést hoz létre a meglévő stúdiófények alatt.
- 8 → 16 háromszög **ugyanabban az egy meglévő iris meshben**. Nincs új draw call, canvas, fény, renderer, JS animáció, mesh vagy per-frame CPU terhelés. A DNS→sejt→MAG 10s film, cella, 6000/9600 DNS-részecske és scroll-átadás nem változik.
- A loader verziója: `20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris`. R533→R1280, R1629→R533 és a HTML parser együtt frissült; a **számolt és SHA256-abc tesztvektorral ellenőrzött** CSP hash: `'sha256-44SN0anChN0bK6huFl1UhtBS2RUHmY4EnkltMfOHe5g='`. A HTML CSP és mindkét Worker policy ugyanazt az új digestet engedélyezi, a régiek megtartva.
- A R2303 geometriai QA már mindenkor az aktuális CSP-t ellenőrzi; külön R2307 P0 forrásteszt vizsgálja a fizikai zárólemezt, az egyetlen mesh-t, a loader és a szigorú hash egyezést.
- További valós Chromium 8–10s optikai képkocka, P0, Lighthouse×3, 60FPS hardvermérés szükséges. PR #581 draft, nincs élesítés.



## R2306 – az első valódi DNA/MAG képkocka kritikus CSS útvonalának gyorsítása (2026-11-03)

- A pontos R2305 Lighthouse desktop mérések 92/92/91, render-blocking CSS becsült 180–195 ms, valódi LCP ~1.76–1.91 s. Az asztali R490 first-paint, menu-owner, R328 desktop first-paint és R244 referencia stylesheet a renderelés kritikus útján maradt.
- A HTML dokumentum elején új, `as=style`, `fetchpriority=high`, **méretfüggő** preloadok hivatkoznak a tényleges, változatlan CSS-címekre, még a sok CSS és inline első képkocka előtt. A három korábbi relatív preloadból kettő azonos, abszolút `/scifi-ui/styles/` URL-re vált, mert a `/` útvonalon az első `<base>` előtt egy relatív `./styles/` hibás, cache-et nem megosztó címet kérhetett.
- Megmaradt az eredeti CSS alkalmazási sorrend, média-szűrés, CSP, az első SVG DNS-sziluett, valódi 3D film, MAG és minden shader/mesh/RAF. Nincs inline onload, letiltott stylesheet, hamis LCP vagy látványcsökkentés.
- Új P0 forrás-QA csak pontos, duplázatlan preloader URL-t és stylesheet cache-key egyezést fogad el, mindkét root és /scifi-ui útvonalhoz. Valódi 3× Lighthouse és 3.5/5.5s vizuális regresszió szükséges; **100 pont nincs igazolva**, PR #581 draft, nincs élesítés.



## R2305 – R2303 valódi 3D hártya biztonságos asset-frissítése (2026-11-03)

- Az R2303 sejtmembrán térbeli mikroredői már a R1280 forráskódban voltak, de az oldal az előző R2301 query-cache kulccsal kérte a filmet. Emiatt a böngésző vagy CDN megőrizhette a régebbi JS-t; stúdióminőségű új képkockát e nélkül nem lehet egyértelműen igazolni.
- Az R533 aktív Three.js asset URL-je, az R1629 tartalék betöltő és az inline első-bájtos HTML parser most ugyanazt az **R2303** cache kulcsot használják. A parser valódi számolt SHA256: `'sha256-kW0o6hJ/4Aw5022e5o9BqU9CMaOfa/cdCIbbR8gDzPo='`. HTML CSP-ben a hash engedélyezett, és a Worker két script-src CSP szabálya betűpontosan azonos hash-t kapott.
- Az R2298/R2300/R2301 történeti forrásellenőrzői frissült aktuális betöltőkulccsal futnak. Az R2301 CSP-ellenőrzés minden kiadásnál **számolt aktuális** parser SHA-t és két Worker CSP hivatkozást vizsgál; az R2303 teszt külön ellenőrzi a pontos asset-kulcsot, hash-t és mindkét szabályt. Nincs gyengített CSP, inline wildcard vagy WebGL-t kiváltó statikus kép.
- A R2304 viewport-fix és az R2303 fizikai 3D film változatlan. Kötelező a következő pontos commit P0, 3× Lighthouse, natív dokkolás, 3.5/5.5 s képkocka és valós GPU 60 FPS. PR #581 draft, nincs élesítés.



## R2304 – valódi viewport-rögzítés: CSS identity scale hiba (2026-11-03)

- Az R2303 pontos `b4b68b0` GitHub P0-ján a mobil 430px natív dokkolás **PASS**, a rétegelt 390px mobil átmenet a rögzített dobozon belül maradt. **Desktop FAIL:** 1350×940 viewport, MAG x645.31/y−170.20, 513×695.59 px. A dobozméret 38vw×74dvh-re javult, de a szülő `.hero-space` computed CSS `scale:"1"` maradt, rect x611.56/y−283, így a gyermek `position:fixed` relatív koordinátái pontosan a szülőből származtak.
- **Gyökérok:** az önálló CSS `scale:1` vizuálisan identitás, de a `none`-tól eltérő minden megadott scale új containing blockot hozhat létre. Az R2299 `scale:1!important` éppen azt a hibát tartotta fenn, amit a `transform:none` felszabadított.
- **Javítás:** csak az aktív desktop archive CSS-szelektor két `scale:1!important` értéke változik `scale:none!important`-ra. A mobil sáv, a 10mp DNS→sejt→MAG film, PBR geometria, fények, részecskék és egyetlen WebGL2 renderer érintetlen. R1987 CSS cache-verzió frissült.
- A valódi R2173 Chromium teszt most külön **ellenőrzi a szülő lánc scale=none állapotát**, majd a szokásos valódi bal oldali viewport x/y koordinátát, egyetlen WebGL2 canvas/kontextus, tiszta GL és nulla akaratlan stage LayoutShift feltételt. Az R2299 source guard tiltja az identitás scale visszakerülését.
- A korábbi R2303 Lighthouse desktop 94/92/92, mobil 90/92/92, mobil CLS 0.02465: **FAIL** a 95+ kapun; valós 100 és 60 FPS még nem bizonyított. Az új pontos SHA böngészős P0-ja és LH tesztje szükséges. PR #581 draft, nincs élesítés.



## R2303 – Filmes biológiai sejthártya, valódi 3D mikroredők (2026-11-03)

- Az R1280 teljes DNS→sejt→MAG film meglévő biológiai sejtmembránján új, folytonos térbeli mikroredők és stromális hullámok vannak. Az eredeti hártya geometriája, PBR türkiz/korall textúrája, normál-újraszámítása és animációja megmaradt.
- A redők kizárólag a meglévő vertexeket mozgatják egyszer az inicializáláskor. **Nincs extra mesh, GPU draw, fény, textúra, shaderpass, canvas, RAF vagy képkockánkénti számolás.** A 10 másodperces morfing, MAG lencse és a teljes részecskeszám változatlan.
- R2303 külön forrásregressziós teszt a P0-ban. **Hátralévő:** új GPU-képkocka összehasonlítás, valós P0 + Lighthouse 3×, hardveres 60 FPS és későbbi cache-asset verziópromóció. Képminőségi és 100 pontos követelmények még nincsenek igazolva. PR #581 draft, nincs élesítés.



## R2302.1 – CSP forrásellenőrző karakterlánc hibájának javítása (2026-11-03)

- A pontos R2302 P0 elején az R2300 QA elhasalt: a várt dinamikus Worker CSP hivatkozás egy korábbi szöveggenerálás során hibás `'+name+'` literállá alakult. A HTML CSP hash és a két Worker CSP-hivatkozás helyes volt; a hibás teszt adott téves FAIL-t.
- Az ellenőrzőben a CSP token pontos karakterei `String.fromCharCode(36,123)+name+String.fromCharCode(125)` alapján képződnek. Az aktuális SHA256-egyezés és a két CSP előfordulás továbbra is kötelező; nincs gyengített vagy kihagyott ellenőrzés.
- Nem változik a MAG, shader, 3D geometry, DNS/sejtmag film, FLIP és Lighthouse-cél. Következő pontos SHA-ra új P0 szükséges; draft, nem éles.



## R2302 – natív MAG asztali dokkolás: hibás hero FLIP-mátrix (2026-11-03)

- A teljes P0 `d40e564` böngészős R2173 mérése megmutatta: 1350×940 desktopon a MAG fixed archív stage tévesen x526/y−221, 683×567 px, miközben az előírt 38vw×74dvh helye ~513×696 px. A stage számított `transform:matrix(1.33224,0,0,.81513,-33.75,-112.8)`; a szülő lánc már nem transzformált. Tehát R2299 ancestor-fix önmagában nem elég: a stage saját fontos inline home/FLIP transformja az aktív archív CSS-en túlélte az átadást.
- R2302 az eredeti home `transform`/`transform-origin`/`transition` inline értékeit desktopon **a dokkolás előtt** menti. Az archive első target rectjét már semlegesített, valós `position:fixed` geometriával méri. A FLIP 360ms kompozitor-átmenet végén a mátrixot **nem** állítja vissza; csak tényleges home visszatéréskor kapja vissza a korábbi értékeket. No-FLIP esetben a stage szintén natív fixed lane-ben marad.
- Telefonon az R2294 fix fizikai doboz, compositor-only átadás és CLS-szerződés változatlan. Az R326 eredeti WebGL2 3D MAG, a filmes DNS/sejtmag/MAG, PBR shader, geometria, 10mp, teljesítményprofil és egyetlen canvas nem változik.
- A már szigorú R2173 valós Chromium teszt továbbra is megköveteli a bal 38vw sávot, a teljes viewportban levő 74dvh stage-et és nulla véletlen LayoutShift-et. Új forrás QA hozzáadva a P0-ba; e teszt **nem helyettesíti** a böngészős mérést. Exact-head P0/Lighthouse/film-képkockák/fizikai 60 FPS még szükségesek. PR #581 draft, nincs merge, nincs élesítés.



## R2301.1 – történeti QA-hash hibajavítás (2026-11-03)

- Az R2301 első P0-ján a teljes geometriai forrásellenőrzés és R2298 SHA QA PASS, de az R2300 teszt korábbi `INLINE_R2300_BOOT_HASH` konstansát várta az érvényes új R2301 CSP-ben. Ez QA szerződéselavulás, nem böngészős grafikai hiba.
- Az R2300 QA most a jelenleg ténylegesen betöltött parser szó szerinti SHA256-egyezését és két aktív Cloudflare Worker CSP hivatkozást követeli, verziófüggetlenül. A 10 másodperces film, DNS, MAG, PBR anyagok, GPU, színek, shader és 3D mesh változatlanok.
- **Állapot:** pontos következő SHA-n P0 és Lighthouse szükséges. Nem kész, nem élesített; PR #581 draft.



## R2301 – renderelt képkockából feltárt sejtmag-fénylés korrekciója (2026-11-03)

- A valós GitHub Chromium R2300 képkockák 3.50/5.50s állapota és a 780×1688 mobil képkocka alapján a biológiai sejt tényleges felülete, belső orgánuma, kapillárisai és kromatinrostjai túl erős additív fotonfelhő mögé kerültek. Ez valódi filmes képminőségi hiba, nem pusztán CSS vagy referencia-eltérés.
- **R2301:** a meglevő R1280 GPU-részecskeshader a DNS→kromatin 3.38–6.52 s közötti mélységi fázisában szelídített alfaenergiát használ (legfeljebb 44%-kal visszafogott), míg a valódi 3D sejt saját fényforrásai és PBR membránja változatlan. A korábbi 6000 mobil / 9600 desktop genetikai pont, 1200 / 3100 külön biophoton, morfing, sejtmembrán, színes valódi organellák és 10s timeline megmaradt. A második fotonbatch expozíciója a sejt képkockáján platform szerint enyhébb.
- Nem lett hozzáadva kép, új draw call, renderer, extra RAF, hálózati textúra, vagy Lighthouse-kivételezés. Az R2300 stúdió-fénykártyák és aszférikus MAG lencse érintetlenek. HTML bootstrap, R533, R1629 és mindkét Worker CSP aktuális cache/SHA frissítve, az R2298/R2300 QA és új R2301 teszt szinkronban.
- **Kapu:** összevetendő 5.50s desktop/mobil valódi új GPU képkocka a mentett R2300 alapképpel. Teljes P0, DNS/film/optika, mobil CLS, Lighthouse 3×, 60 FPS még szükséges. PR #581 draft, nincs élesítve és a stúdióminőség nincs igazolva.



## R2300.1 – R2298 QA cache-hash érvényesség javítása (2026-11-03)

- A `fc8c03a` filmes commit P0 futása a korai forrástesztben FAIL lett, nem a GPU-ban: az R2298 forrásőr az aktuális parserhez továbbra is a régi `INLINE_R2298_BOOT_HASH` literált várta. A valódi R2300 script jogszerűen új, két Worker CSP-ben engedélyezett SHA256-t kapott.
- Az R2298 source guard most nem verzióhoz kötött állandót, hanem a **jelenleg aktív parser inline tartalmának SHA256-jával azonos literálisan deklarált Worker hash-t** és annak mindkét CSP hivatkozását követeli. Nem csökkentettük a CSP biztonságát vagy a tesztek szigorúságát; a következő valódi filmezési cache-revíziót is helyesen kezeli.
- A 3D modell, DNS, lencse, shader, grafikus frame, 10 s film és stúdiófény változatlan. Új pontos SHA P0 és Lighthouse eredmény még kötelező; PR #581 draft, nincs élesítés.



## R2300 – fizikai DNA-bond, stúdiófény és aszférikus MAG-lencse (2026-11-03)

- A valós R1280 Three.js film első, domináns DNS láncának nukleotid-hídjai már nem egyenletes hengerek: az eredeti egy GPU instanced draw-callon belül két térbeli ligand-kiemelkedés és egy visszafogott kontakt-nyak alakult ki; színezése ugyanazon PBR shaderen belül a tényleges 3D vertexekhez tartozik. A többi donorspirál változatlan könnyű geometriával fut. Új DNS hálózat, mesh, részecskeszám vagy WebGL context nem jött létre.
- A MAG meglévő központi lencséjének eredeti SphereGeometry vertexei a perem felé ellaposodó aszférikus meniszkuszt formálnak. A felületi normálok újraszámítása fizikai csillanást biztosít. Az eredeti lencse átmérője, háromszögszáma, 3D sziluett és 10 mp filmes átadás megmarad.
- Két keskeny és visszafogott, meleg/hideg fotós softbox-reflex kerül a meglévő, egyszer generált PMREM stúdiókörnyezetbe. **Nem kerül új fény, postprocess, extra renderer, vászon, RAF, kép vagy hálózati textúra a jelenetbe.**
- R533 film, R1629 tartalék betöltő és HTML-parser ugyanarra az új verzióra állítva. A HTML CSP és a Cloudflare Worker két CSP-listája a parser betűpontos SHA256-ját engedélyezi. Az R2298 forrásőr frissítve, és új R2300 stúdió szerződés kapcsolva a P0-ba.
- **QA még szükséges:** pontos R2300 commiton teljes Chromium P0, 3/3 MAG frame, DNA/embrió/lencse képi összehasonlítás, Lighthouse desktop/mobile 3×, CLS, hardveres 60 FPS. A stúdiószint és a 100-as Lighthouse még nem igazolt, PR #581 továbbra is draft és nem éles.



## R2299 – asztali MAG viewport-dokkolás javítása (2026-11-03)

- R2298 pontos 4314666d P0: mobil 390px és 430px natív dokkolás PASS, LayoutShift a stage-en 0, egy WebGL2 canvas. Desktop 1350×940 FAIL: stage x526.34/y−221.28, 683.44×567 px a 38vw × 74dvh viewport-lane helyett.
- R2299 csak az aktív desktop archívum szülő elemeiről távolítja el a fixed containing-block csapdákat: transform, scale/rotate/translate, will-change, perspective, filter és contain. A normál hero, a DNS, az organikus sejt, a MAG WebGL geometria és a mobil átadás nem változik.
- Az R2173 valódi Chromium tesztje változatlanul követeli a natív vásznat és a nulla stage CLS-t. Új desktop képernyőkoordináta-ellenőrzés és hibakori computed ancestor-chain napló kerül bele. CSS cache-verzió frissítve; inline CSP-hash változatlan.
- R2298 Lighthouse desktop 93/92/89, mobil 89/88/88, mobil CLS 0.024648: nem elégséges. Pontos új SHA P0/Lighthouse, screenshot, hardveres 60 FPS még hiányzik; PR #581 draft, nem élesített.



## R2298 – natív filmes GPU-fényköltség és allokációmentes célprojekció (2026-11-03)

- A tényleges, R533 által betöltött `formatx-mag-genesis-three-r1280.js` kódban a `makeLights()` eredetileg létrehozott egy 0 intenzitású `mechLight` pontfényt. A `makeMechanicalLayer()` ugyanazt a mezőt felülírta egy második, ténylegesen használt pupillafénnyel. Az első, már nem elérhető fény a jelenetben maradt; R2298 eltávolítja. **Az optikai fény, PBR anyagok, 3D részletesség, geometria, DNS és 10 s film érintetlen.**
- A `targetWorld()` képkockánként létrehozott átmeneti `Vector3` objektumai helyett két, konstruktorban lefoglalt scratch vektort használ. A cél koordinátaszámítás, a kameramozgás és a MAG elhelyezése megmarad. Nem jön létre második renderer, vászon, RAF, textúra vagy új fény.
- A R1280 tényleges betöltéséhez R533/R1629/HTML cache-kulcs frissítve. A parser-inline SHA256 új hash-e a HTML-meta CSP-ben és a Cloudflare Worker **mindkét** CSP-kimenetében engedélyezett, a régi hash kompatibilitás megtartásával.
- R2298 külön regressziós forrásőr a P0-ban: egyetlen fizikai pupillafény, allokációmentes per-frame célprojekció, aktív Three.js asset, SHA256-egyezés, meglévő 10 s film/egyvászon kontraktus.
- **Mérési kapu még nyitott:** pontos új commiton P0, 3/3 WebGL-hidegindítás, valós mobil CLS, Lighthouse desktop/mobil ×3, képminőség-összevetés és valódi hardveres 60 FPS. PR #581 továbbra is draft; nincs production deploy. Forrásoptimalizálás önmagában nem FPS- vagy stúdióminőség-bizonyíték.



## R2297 – valódi mobil MAG-lencse szabadon hagyása
- A 390px-es R2296 új, valós 3D képkockáján a 50×50px SOUND és KÉRDEZZ gombok egymás mellett, közvetlenül az élő biokristály fő optikai lencséjén voltak. Ez grafikai és használhatósági hiba: a modell lényege takarásban maradt.
- R2297: az eredeti, változatlan interaktív r264 gombok a mobil kezdőoldali MAG két szélére kerülnek, balra SOUND, jobbra ASK, 50×50px hitcélokkal. Kritikus, renderblocking R358 CSS, amely már első paintkor a végleges 2-oszlopos elrendezést adja. Az aktív 3D scroll-archívum saját kontrollhelyzete érintetlen.
- Az új P0 browser-vizuálteszt számszerűen megköveteli, hogy a SOUND jobb széle a MAG középtengelyétől balra, az ASK bal széle jobbra legalább 20% hero-szélesség távolságra legyen. Ez **valódi kattintható DOM-rect mérés**, nem csupán CSS-szöveg keresése.
- Az R358 HTML preload/stylesheet URL-je, a Worker statikus útvonala és a két QA forrásőr azonos verziót kapott; a külön R1987 archív script R2294-es cache-kulcsa érintetlen.
- **NEM KÉSZ / NEM ÉLES:** a pontos R2297 új képkocka, CLS, P0, Lighthouse és stabil 60 FPS még kötelezően ellenőrizendő. PR #581 továbbra is draft.

## R2294 – mobil MAG: ténylegesen változatlan fizikai doboz görgetéskor
- A R2293-as, natív FLIP 360ms átmenet a Chromium valós P0-jában **nem** oldotta meg a mobil archive-belépéskor regisztrált CLS-t. A 390px felbontású dokkoláskor továbbra is 0.10183396599357607 LayoutShift jelentkezett; forrás a natív stage 195px→390px fizikai doboza, még akkor is, ha az inverz kompozitortranszformáció lágyította a látványt. Az eredeti R2173 P0 kapu helyesen FAIL maradt.
- R2294 a natív R326 stage-et már kezdetben és az archív képernyőn **ugyanabban az egyetlen viewporthoz rögzített 100vw × 43dvh CSS layout dobozban** tartja. Az első hero állapottól a görgetéses archívumig nem változhat a `position`, `width`, `height`, `left` vagy `top` fizikai elrendezése; a látható művelet csak compositor-only `translate3d()` transform. A `.hero-space` továbbra is teljes magasságot tart fenn a terméktartalomnak.
- Az R1987 desktop split-screen FLIP változatlan; mobilon az R2293 elrendezésmódosító út helyett kizárólag a natív MAG CSS kompozitortranszformációt használjuk, pontosan egy 440ms-os befejezési állapotjelzéssel. Nincs új canvas, WebGL renderer, objektum-klón, RAF vagy fejlesztői teszt-kivétel.
- Az elsőfestés R358 blokkoló CSS, HTML preload+stylesheet, R1987 script URL, Cloudflare Worker cache-key, két forrásőr és az eredeti valós R2173 browser proof új R2294 revíziót kapott. A browser proof továbbra is **0 elfogadott, nem inputtal indított valódi MAG LayoutShift**-et vár, és most emellett a home→archive tényleges fizikai width/height és `position:fixed` azonosságát is követeli.
- **QA státusz: R2294 P0 végső pontos SHA-n még PENDING, tehát a fix nem igazolt.** A külön R536 filmes, magyar–angol és egycanvasos forrásellenőrzés továbbra is PASS. A 60 FPS, a filmes grafikai végső referenciaminőség és a Lighthouse 100/100/100/100 továbbra is hiányzik. Nem éles, PR #581 draft.

## R2293 – megszüntetendő scroll-dokkolási CLS, fizikai vászon kompozitor-átadással
- A R2291 tényleges P0 már többek között 3/3 MAG-hidegindítás, valódi normál látogatói GPU-frame, 390/412px mobil CLS, reszponzív, hero-vizuális, R533→R536 filmes és első native-handoff PASS után állt meg a **R2173 valós görgetéses natív dokkolásánál**. A Chromium 390px mobilon dokumentáltan **0.10183396599357607** layout-shiftet jelentett: a natív MAG stage korábbi kb. x195/width195 rectjéből a dokkolt x0/width390 állapotba lépett. Ez nem tesztadat-eltérés, hanem a scrollos átadásnál valós layout instability.
- R2293: a már aktív egyetlen R326 canvas-t a saját hero boxából **FLIP kompozitortranszformációval** vezetjük a tényleges archív 3D lane-be. A forrás és a cél képernyőkoordinátáját/arányait egyszer, a belépés eseményében mérjük; szinkron inverz CSS transform után 360ms-os compositor-only átmenet megy a végső állapotba, majd eredeti inline stílus visszaállítása. Nincs új canvas, klón, fotó, renderer, permanens RAF vagy per-frame layout-mérés.
- A R2173 szigorú valós tesztje immár az animáció alatt megengedett köztes geometria helyett megköveteli a teljesen leülepedett eredeti canvas-t, a valódi osztott képernyős végső méreteket, változatlan WebGL-környezetet, nulla hibás GL-pixelt, valamint **változatlanul NINCS elfogadott, input nélküli stage-layout-shift**. A teszt csak akkor PASS, ha a böngésző valóban nem számol LayoutShift-et.
- Az eredeti DOM/scroll forrásmegőrzés, a film és az állandó MAG architektúra érintetlen. A R1987 fizikai archív script HTML-betöltése új cache-azonosítót kapott; a CSP változatlan, mivel külső same-origin script tartalma változik, nem inline kód.
- **NEM IGAZOLT / NEM ÉLES:** a R2293 fizikailag mért scroll CLS még új P0 vizsgálatot igényel. A film végi R2292 finom szálak új képkockája, teljes Lighthouse ×3 és hardveres 60 FPS is nyitott. PR #581 draft.

## R2292 – egyoldalas, térbeli, élő biokristályszálak a filmvégi MAG-on
- A P0 R2289 és R2291 9,25s képkockáit egymás mellé téve ellenőriztük: R2291-ben a korábbi hiányzó kékeszöld térbeli biokortex és a részletes lencse ténylegesen megjelent a fémváz mögött. A natív R326 állandó MAG-nál azonban három balra nyúló finom élő szál is van, amit a filmvég még nem mutatott.
- **R2292:** az eredeti R1280 `makeTentacles()` nyolc valódi kúpos 3D csőgörbéjéből asztalon három baloldali, mobilon két baloldali aktiválódik csak 8,12s után. Az összes többi radiális robotkábel rejtve marad. A szálak meglévő MeshStandardMaterial anyaga sötétebb, alacsony emissziójú hidratált biokristály; finom élettani rezgéssel és a titán mögé helyezett Z-mélységgel.
- A meglévő neon-glow, huzalháló, csomópont és szaggatott csík `visible=false`, ezért az eredeti szálak csak egy-egy valódi térbeli mesh-draw. Nem hoztunk létre új geometriát, WebGL vásznat, RAF-ot, hálózati textúrát vagy renderelőt. A korai DNA/embrió és a natív állandó R326 változatlan.
- Az R533/R1280 verzió, HTML parser, R1629 fallback, Cloudflare Worker két CSP-jének pontos új SHA256-engedélyezése és R2266/R2206/R2270 QA forrás-őr konzisztens.
- **QA:** az R2291 renderelt javulása vizuálisan igazolt. Az R2292 új tényleges 9,25s képkockáját, a normál MAG-handoffot, P0-t, Lighthouse ×3-at és a hardveres 60 FPS követelményt még ellenőrizni kell. PR #581 draft, nincs élesítés.

## R2290–R2291 – valódi archív-dokkolás és mély, organikus filmvégi MAG
- **Valódi hibabizonyíték:** az R2289 környéki 9,25 mp-es Three.js képen még csak lapos, négyágú titán MAG látszott. A 10 mp utáni R326 natív képen már jól kivehető a hátsó aszimmetrikus élő biokortex. A R2289 biológiai film-burok ~10% átlátszóságú lila szövet maradt; a pozitív geometriai módosítás önmagában nem mutatkozott meg.
- **R2291 grafikai változás:** a meglévő IcosahedronGeometry kortikális héjának vertexeit gyártáskor determinisztikus térbeli redőzettel deformáljuk, a normálokat újraszámítjuk. A 42 meglévő organikus lebeny jobban látható a fém összeállása után. A nagyobb élő térfogatot valódi Z-mélységben a mechanikai váz és optika mögé helyezzük, sötét-türkiz, fényelnyelő, hidratált PBR héjjal, clearcoattal.
- Nincs új WebGL canvas, RAF, renderer, hálózati kép, postprocess pass vagy extra mesh; az eredeti létező geometriai objektum és material kap új formát és uniformokat. A 10 mp filmes ütemezés, genetikai részecskeszám, kamera és állandó natív R326 nem módosult.
- **R2290 tesztjavítás:** az `validate-native-mag-dock-entry-r2173.cjs` 45 mp-ig hiába várt auto-dokkolást scrollY=0 mellett. Az R2286-os kívánt működés az, hogy a MAG csak első tényleges lefelé görgetéskor nyisson archív foliót. A teszt a teljes film/GPU után most valós scrollTo eseménnyel lép be, és változatlanul ellenőrzi az első/final pozíció, WebGL context és nem várt layout shift egyezését.
- Az R2291 R1280 film, R533 film-owner, HTML, R1629 mentőbetöltő, két Cloudflare Worker CSP és R2266/R2206/R2270 QA forráskontraktus ugyanazt a friss cache-key-t és valódi CSP-SHA256-ot használja.
- **Állapot:** fejlesztői, PR #581 draft. R2291 friss renderelt 9.25s és natív 10s képkocka, teljes P0, Lighthouse ×3, hardveres FPS és végső vizuális referenciaminőség még nincs elfogadva. Nem élesített.

## R2287–R2289 – normál vizuális QA, minden navigációs Genesis, film–MAG kortexfolytonosság
- **R2287 mért eredmény:** az R2286 utáni P0 ellenőrzésen 390px CLS 0.025484 PASS, 412px CLS 0.000354 PASS, 3/3 natív MAG hidegindítás PASS, normál látogatói WebGL2 handoff PASS (1233 megvilágított pixel / 12528 minta), reszponzív és teljes hero-vizuális szerződés PASS. Lighthouse ugyanazon alapváltozaton desktop Performance 94/92/92, mobil 91/91/91, mobil CLS 0.024648: a 100-as összesített pont továbbra is FAIL.
- **R2287 tesztforrás:** a régi `validate-content-visuals.cjs` a normál 10 másodperces, jogosan festésre elrejtett hero alatt próbálta láthatónak ellenőrizni a termékoldalt. A vizuális HTML-szerződést ezért az explicit `intro=0` terméknézeten mérjük; a **külön** R656 filmképkocka és normál első látogató R2264 tesztek változatlanul végigfutnak, nincs felhasználói film kikapcsolása. A visszagörgetés után tényleges, látható home MAG-ot kell kapni, nem korán nyitott archivált papiruszt.
- **R2288:** a fenti pontos P0-n a hero-vizuális kapu PASS után az R533–R536 handoff teszt régi, „egy munkamenetben csak egyszer induló” filmelvárása FAIL lett. A valódi R2201 rendszer minden normál navigáció után teljes 10s Genesis filmet játszik. Az új teszt a második film tényleges DOM-ját, scroll-zárát, befejezését és a natív egycanvasos MAG ismételt helyreállítását is megköveteli; a felhasználói élményt nem korlátozza.
- **R2289 – stúdiógrafika:** az R1280 Three.js korábban az organikus cortexet 4%-ra halványította a titánváz vége előtt, emiatt a 9.25s-os fémcsillagról ugrásszerűen más biológiai organizmusra váltott a handoff. Most a **meglévő** textúrázott 3D biokortex finoman visszaépül 7.28–8.71s között; a 42 organikus lebeny korlátozott halványítású. A meleg fehér, túl világos mechanikai anyag végső értékei visszafogottabb titánfényre és finomabb roughness-re változtak. Új mesh, 2D helyettesítő, WebGL kontextus, RAF vagy hálózati textúra nélkül.
- A Three.js R2289, az R533, HTML parser, R1629 mentőbetöltő, Cloudflare Worker két CSP-ja és a valódi QA revision guardok azonos cache-verziót/SHA256 scriptlenyomatot kapnak. A forrásszintű QA **nem helyettesíti** a renderelt képkocka és a hardveres 60 FPS mérését.
- **NEM KÉSZ / NEM ÉLES:** R2288 handoff újrapróba és R2289 normál desktop/mobil 9.25s filmes, natív 10s utáni screenshot, teljes P0 és Lighthouse ×3 eredmény még szükséges. PR #581 draft. A stúdióminőséget és a 100/100/100/100 teljesítményt nem tekintjük teljesítettnek.

## R2286 – az első MAG-portré marad az oldal tetején, az archívum görgetésre indul
- Az R2285 pontos SHA-n a normál látogatói WebGL átadás PASS: 3/3 hidegindítás, 642 látható MAG-mintapixel, 1 canvas, kész WebGL2 GPU fence, 0 readback. A mobil P0 CLS **0.101834 FAIL** volt, de a korábbi 24.8 px rail/header ugrás megszűnt.
- A valódi 390×844-as CLS JSON szerint **11.31 s, scrollY=0** állapotban a natív MAG stage 195×380.6 px-ről 390×362.9 px-re váltott, amikor az R1987 archive állapot automatikusan bekapcsolt a Genesis-film után. Ez 0.101834 CLS-t adott. A felhasználó ekkor még nem görgetett, tehát ez nem szükséges tartalomfeltárás.
- R2286: a natív MAG hero marad az első teljes viewport tulajdonosa a Genesis vége után. Az archivált foliók és a MAG-kísért scroll-narratíva csak tényleges lefelé görgetésnél (24 px vagy a viewport 6%-a felett) kapcsolnak be. Az oldal tetejére visszatérve a meglévő reversible `restore()` visszaadja a valódi hero állapotot; a teljes HTML, 3D renderer, film, natív GPU és eredeti fókusz/menü nem változik.
- A forrásteszt R2286 külön védi az eredeti scrollos dokkolást és visszaállítást. A valódi első viewport P0/CLS, 390/412px mobil képkockák, Lighthouse ×3 és hardveres 60 FPS újraellenőrzése még kötelező. Nincs küszöbcsökkentés, nincs élesítés.

## R2285 – kritikus mobil CLS: rail első festés és atomikus natív MAG dokkolás
- Az R2284 első valós CLS elmozdulása 390px-en 0.212973 volt: a main Y 94.796875→70px, pontosan 24.797px. A fejléc és main közötti `.fx-rail` aside a legvalószínűbb normál flow tulajdonos; az R358 kritikus CSS nem célozta, a késői stílusok viszont kivették a normál elrendezésből.
- R2285 a `fx-rail` mobil oldalsávot CSP-hash-sel hitelesített, **parser-korai inline CSS** segítségével már az első paint előtt kivonja a flow-ból. A navigációt a valódi, használható mobil menü biztosítja. Ugyanezt védi az eredeti blokkoló R358 stílus, azonos HTML preload/stylesheet/Worker verzióval.
- A külön ~11.38s-os 0.101834 CLS elmozdulásban a natív MAG stage x195,width195→x0,width390 lett az archive class megjelenése közben. R2285 a végleges 100vw × 43dvh mobil archív színpadot már az eredeti `.fx-archive-native-docked` class felhelyezésétől megköveteli, így nem függ a később változó root data attribútumtól.
- A parser inline stílus új `style-src` SHA256 ujjlenyomata a HTML meta CSP-ben és a Worker mindkét CSP-jében hitelesített. A P0 biophotonic és studio szerződés is pontos hash-t számol: nem elég deklarálni; az aktív CSS bytes egyezése kötelező.
- R2284 P0: 3/3 hidegindítás PASS, normál látogatói WebGL megjelenés PASS, mobil CLS FAIL 0.212973; Lighthouse desktop 91/91/91, mobil 78/77/78 és CLS 0.114963 – FAIL. R2285 képi és teljesítmény-elfogadás a pontos új SHA-n még nincs, ezért a PR #581 továbbra is draft és nem éles.

## R2284 – filmszinthez kötött GPU-zárolás és mért CLS okfeltárás
- Az R2283 pontos SHA-n a P0 három független WebGL2 hidegindítása **3/3 PASS**; a normál látogatói átadás szintén PASS: valódi első viewport MAG (644 fényes pixel/5200 minta), egyetlen canvas, GPU fence `finished`, nulla normál CPU readPixels. Így a korábbi 1/3 fekete frame race az ellenőrzött futáson nem ismétlődött.
- A P0 tényleges mobil CLS továbbra is FAIL: 390px-en 0.212973. A 2139ms-os fő layout shift az eredeti fejléc/main Y 94.796875→70px mozgását és a nyelvi gomb 44×44→120×69 növekedését rögzítette; 11174ms-nál a MAG stage 195px szélesről 390px-re ugrik. Ezek az eredeti normál navigáció során történnek, nem tesztcsalások.
- Az R2283 a teljes film alatt zárolta az adaptív minőség-átméretezést, ami a lassú szoftveres WebGL-en regressziót okozott: desktop 90/92/87, mobil 79/78/78 Performance; mobil CLS 0.11496. Az R2284 visszaengedi az adaptív quality resize-t az intro korai 90%-ában. Zárolás csak a ténylegesen **kért GPU-előkészítéstől**, in-flight fence közben és az első fizikai kompozitálás rövid védelmében marad. A 3/3 hidegindítás változatlan küszöbű.
- A mobil CLS P0 bizonyító módosítatlanul FAIL-ol a 0.10 kapun; de az eredeti PerformanceObserver most minden valódi elmozduláshoz a fejléc, vezérlők, natív MAG stage CSSOM-ját és aktivált kritikus stylesheetjeit naplózza. Ez lehetővé teszi a pontos első-festés CSS/JS tulajdonos kijavítását, találgatás és látványromboló rejtés nélkül.
- Az R2284 önálló fejlesztői commit, élesítés nélkül. Teljes P0, Lighthouse ×3 és stúdióképi minőség friss SHA-n még nem igazolt.

## R2283 – valódi WebGL-fence / canvas resize versenyhelyzet javítása
- Az R2282 kódos SHA (71f3e168) P0-ján három hidegindítás közül **2/3 PASS**, a harmadik esetben a GPU proof RGB/alpha **0/0**, az első normál viewport is fekete. A 48 ms-ra késleltetett adaptív minőség-átméretezés a korábban beadott frame rajzbufferét törölhette még a GPU-fence befejezése vagy a kompozitor megjelenítése előtt.
- R2283 az eredeti minőségi szabályozó két útvonalát megtartja, de az aktív filmes fázis, a WebGL2 pending fence és a legelső látható képkocka ~1100 ms-os védelme alatt *nem módosítja* a canvas width/height bufferét. A 48 ms-os timer az aktiválódó filmet a callbackben is újraellenőrzi. A további, normál interakciós adaptív felbontáskezelés változatlan.
- A natív ResizeObserver sem nullázhatja az in-flight GPU-buffert. A tényleges viewport-méretet film utáni egyszeri render előtt szinkronizálja az eredeti tulajdonos. Ha a finish eseménynél még pending a korábbi fence, a készre jelzés után történik az egyszeri natív kirajzolás. Nincs új renderer, WebGL context, tartós RAF, readback vagy vizuális bypass.
- Az R2244 unit forrás- és viselkedésteszt kiterjesztve aktív film, in-flight GPU-fence, megjelenítési zárolás és időközben elinduló film eseteire. A 3/3 valódi pixel-proof továbbra is kötelező; a fix státusza **CI validálás előtt – nem kész**.
- Legutóbbi valódi R2282 Lighthouse: desktop Performance **93/93/92** (LCP ~1.78–1.83s, CLS 0.012), mobil **86/87/87** (LCP ~1.32–1.34s, CLS 0.11496), mindkettő küszöb miatt FAIL. A stúdióminőség, hardware 60 FPS és 100/100/100/100 továbbra sem teljesült.

## R2282 – fekete viewport GPU-kész MAG mellett: valódi film utáni kompozitor-keret
- Az R2281 pontos commitján a 1280×720-as Chromium fő viewport 0 világos MAG-pixelt mutatott, miközben az eredeti R326 WebGL framebuffer mérhetően világos volt (GPU pixel 160/255, fence finished). A későbbi, kizárólag stage-re vágott Playwright screenshot viszont magát az organizmust megjelenítette. A teljes viewport hibáját nem lehet egy újabb screenshot-teszthackkel eltüntetni.
- Az R2278 idő előtti, 90%-os filmbeli GPU-előkészítése már készre jelölhette a fence-t az R533 DOM-takarás levétele előtt. Az R326 finish-event hívás ugyanakkor ilyen állapotban a kész frame miatt azonnal visszatért, és nem adott át egy friss látható framebuffer-t a Chromium kompozitorának.
- R2282: az eredeti `formatx:magbirthcomplete` eseményben, **csak kész GPU-fence-nél**, a tényleges takarás eltávolítása után egyszer közvetlenül meghívjuk ugyanazon R326 `render()`-t, majd `gl.flush()`-t. Nincs második WebGL context, új rajzoló, leállíthatatlan RAF, felesleges `readPixels`, vagy CSS képhelyettesítés. Az eredeti fail-safe GPU-fence út megmarad, ha a film nem készítette elő a MAG-ot.
- A teljes főviewport MAG-kép, 390/412px mobil közép, P0, CLS és Lighthouse továbbra is kötelező. **A javítás a forrásban elkészült, de a képkockás bizonyító teszt még nem igazolta.** PR #581 draft, nincs élesítve.

## R2281 – a valós −195 px mobil MAG eltolás megszüntetése
- A R2279 valós Chromium mobil képének részletes Layout diagnosztikája igazolta: a 390 px széles natív MAG stage `left:195px`, `transform:matrix(...,-195,...)` és **önálló `translate:-50%`** volt. A két külön -195 px eltolás összeadódott, ezért lett a végső canvas `x:-195` és a vizuális centroid ~0.088.
- Az R2280 korábbi célzott archive-state kivétele nem szüntette meg az eredeti, archív nélküli dupla transzlációt. R2281 a korai render-blocking R358 CSS elsőfestési stage tulajdonosán `translate:none!important`-ot rögzít, a létező `left:50%` + `transform:translate(-50%,-1.4%) scaleY(.935)` megtartásával. Ez a tényleges középre igazítás, nem képfeldolgozási teszt-hack.
- A frontend HTML preload+stylesheet cache, Worker átírás, két P0 forráskontraktus és PROGRESS egységes verziót kapott. Az R2277 eredeti PNG centroid, első mobil CLS, 3/3 natív WebGL GPU és Lighthouse küszöbök **változatlanul kötelezőek**.
- **QA státusz: ellenőrizendő**. A vizuális hiba valódi javulását kizárólag az új commit képpontmérésével lehet megállapítani.

## R2280 – natív mobil MAG levágásának célzott javítása
- Az R2277 valódi mobil PNG bizonyította: a 390px széles MAG canvas x=-195 pozícióban volt, a fénypontok súlypontja 0.0887 képszélesség. Ez elfogadhatatlan, a screenshot-test jogosan FAIL.
- A gyökérok a CSS-kaszkád: az R2276 első képkockában helyes left:50% + translate(-50%) párosát az R1987 natív archív fixed left:0 pozícióra váltotta, de a transzformáció megmaradt. R2280 csak valós archív módban törli ezt a maradék eltolást a natív stage-ről és canvasról.
- Az első festés CSS preload, a valódi stylesheet és a Worker cache-revízió egységes; a biophotonic és studio forrásőr frissítve. Az R2277 képi centroid és a CLS/GL P0 változatlanul kötelező.
- A végső képet, mobil CLS-t, 3/3 GPU-fence-t és Lightroom teljesítményt csak új, pontos SHA-ra futó CI után lehet PASS-nak tekinteni. Fejlesztői ág, nem éles.

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
