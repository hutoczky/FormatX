# FormatX Suite Pro — Release information

Ez a fájl nem tartalmaz kézzel karbantartott aktuális verziószámot vagy fix kiadási URL-t.

Az aktuális hivatalos kiadás adatai:

- [`docs/scifi-ui/data/current-release.json`](docs/scifi-ui/data/current-release.json)
- hivatalos kiadási tár: `hutoczky/FormatX-Updates`
- szinkronizálás: [`.github/workflows/sync-current-release.yml`](.github/workflows/sync-current-release.yml)

## Állapot

- Bazzite / Linux: **Full release**, elsődleges rendszer és támogatási irány
- Windows: **Full release**, támogatott másodlagos platform
- Közös asztali csomag: **Full multiplatform release**
- Android: **Full release**, külön telepíthető csomag
- Web: **Technical preview**
- macOS: **Planned**
- iOS / iPadOS: **Planned**

A Bazzite/Linux és a Windows ugyanabból a hivatalos multiplatform csomagból telepíthető. Az Android külön hivatalos letöltési csatornát használ. Az első használat **5 napos próbalicenccel** indul.

A **Full release** kereskedelmi/termékállapot és a **Stable** bizonyítéki minősítés két külön fogalom. Stable csak akkor állítható egy platformról, ha a `stable-gate.json` szerinti, nyilvánosan visszakövethető tesztbizonyítékok teljesülnek. Az irányadó platformforrás: [`docs/scifi-ui/data/platform-status.json`](docs/scifi-ui/data/platform-status.json).

A publikus weboldal nem talál ki kiadási adatot. A verzió, kiadási dátum, csomag URL-je és digestje a szinkronizált hivatalos metaadatból származik. Hiányzó checksum asset, aláírás vagy tesztbizonyíték hiányként jelenik meg, nem sikeres ellenőrzésként.

## Minden nyilvános kiadás kötelező elemei

- pontos kiadási dátum;
- platform- és státuszcímke;
- kiadási megjegyzések;
- ismert hibák és korlátozások;
- letöltési URL;
- elérhető ellenőrzőösszeg vagy digest;
- aláírási bizonyíték, ha ténylegesen közzétették;
- tesztmátrix-hivatkozás;
- korábbi kiadás vagy visszaállítási út, ha elérhető.

A hiányzó elemet a weboldal nem helyettesíti kitalált adattal.

## Nyilvános bizonyíték

- [Bizonyítéki központ](https://www.formatxsuite.com/scifi-ui/verification.html)
- [Tesztmátrix](https://www.formatxsuite.com/scifi-ui/test-matrix.html)
- [Ismert hibák](https://www.formatxsuite.com/scifi-ui/known-issues.html)
- [Stable kapu](docs/scifi-ui/data/stable-gate.json)
