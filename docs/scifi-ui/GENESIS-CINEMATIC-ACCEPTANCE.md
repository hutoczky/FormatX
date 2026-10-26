# FormatX Genesis – cinematic acceptance gates

## Kötelező narratíva

1. **DNA / birth (0–3 s):** a képernyő középpontjában egy jól felismerhető, mélységgel rendelkező, két spirálszálból és keresztkötésekből álló DNS-hélix jelenik meg. Filmes makrókamera, térbeli megvilágítás és finom részecskék.
2. **Morphogenesis (3–7 s):** a DNS folytonosan részecskékre bomlik; ugyanazok a részecskék interpolálnak egy zárt, organikus maggá. Nem megengedett az egyszerű áttűnés két egymástól független modell között.
3. **Nucleus (7–11 s):** a létrejött sejtmag térfogatos, türkiz-kék, pulzáló, belső narancs/rózsaszín aktív gócokkal, parallaxissal és jól olvasható sziluettel. Nem fémes négyágú csillag.
4. **Reveal (11–14 s):** kameramozgás után a FormatX felület finoman megjelenik, a mag a fő hero elem marad. A navigáció nem takarhatja el.

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
