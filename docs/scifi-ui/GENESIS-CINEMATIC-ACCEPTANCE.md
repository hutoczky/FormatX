# FormatX Genesis – cinematic acceptance gates

## Kötelező narratíva – R2220, 10 másodperces valós film

Az éles intro vezérlője `formatx-mag-birth-live-r533.js` jelenleg `DURATION = 10000` értékkel fut, és a tényleges Three.js renderelő `t=clamp(r)*10` leképezést használ. A korábbi 14 másodperces leírás nem felelt meg a működő filmnek és tévesen a sejtmagot jelölte végső hero elemnek. A felhasználó kifejezett elvárása: **DNS → biológiai sejtmag → mechanikus MAG**. Az elfogadási idővonal ezért a valós 10 másodperces filmet rögzíti; a film hossza később csak külön mért és tesztelt módosítással növelhető.

1. **DNS / születés (0–3,28 s):** felismerhető, térbeli kettős hélix, keresztkötésekkel és világító bázispárokkal. A központi mechanikus MAG-test és az organikus mag az első képkockákon **nem látható**. A genetikai részecskék első képkockától jelen vannak.
2. **Biológiai sejtmag (3,28–5,66 s):** ugyanazon 6000 mobil / 9600 desktop genetikai részecske folytonosan kondenzálódik térbeli kromatinná. Türkiz membrán, korall/rózsaszín aktív gócok, pulzáló belső nukleolusz és parallaxissal olvasható sziluett. A sejtmag a 3,28 s után fokozatosan válik láthatóvá, majd az 5,66 s utáni átmenetben elhalványul. Egyszerű, egymástól független objektumok közti áttűnés önmagában **nem elegendő**.
3. **MAG megszületése (5,58–8,45 s):** a párosított DNS-részecskék azonos kromatin-kiindulópontjukról a négy MAG-karba interpolálnak, miközben a mechanikai burkolat és a központi optika fokozatosan aktiválódik. A MAG nem jelenhet meg kész tárgyként a DNS nyitójelenetében.
4. **Hero-handoff (8,45–10 s):** kontrollált kameramozgás és fényátmenet után a kész, négykarú MAG lesz a fő hero elem; a FormatX felület láthatóvá válik, a navigáció nem takarhatja el.

**Időhatár-átfedések:** a sejtmag és a MAG átmenete szándékosan átfed 5,58–5,66 s között. Az időpontok a jelenlegi implementációból származó elfogadási célok, nem automatikusan sikeres vizuális teszteredmények.

## Vizuális referencia

A felhasználó által megadott DNS és fluoreszkáló sejtmag képei a minimum elvárt művészeti irányt adják, nem automatikus minőségigazolást. Az Igloo Inc. szintjének elérése csak kézi vizuális összevetéssel ítélhető meg.

## Kötelező műszaki kapuk

- Desktop: 6000–10000 morfológiailag következetes részecske, GPU buffer attribútumokkal, determinisztikus időzítéssel.
- Mobil: adaptív pixel ratio és részecskeszám, `prefers-reduced-motion` tiszteletben tartása, WebGL context lost/restored kezelés.
- 360–430 px szélességen a teljes DNS és mag látható, nincs túlméretes üres függőleges sáv, szövegütközés vagy vízszintes scroll.
- A hero kezdeti betöltése nem blokkolhatja a navigációt; hibás WebGL esetén szöveges/álló alternatíva jelenik meg.
- Teszt: 360x800, 390x844, 412x915, 768x1024, 1440x900; cold/warm load és legalább 30 s futás.
- Lighthouse mobil és desktop: Performance, Accessibility, Best Practices, SEO külön méréssel; a 100/100 csak tényleges mérési eredménnyel állítható.
- Google Ads optimalizálási pontszám nem egyenlő a Lighthouse pontszámmal, nem garantálható forráskód alapján.

## Release szabály

A Genesis változtatások először külön ágon készüljenek, szintaktikai ellenőrzéssel és vizuális regressziós tesztekkel. Élesítés csak sikeres teszt és jóváhagyás után.
