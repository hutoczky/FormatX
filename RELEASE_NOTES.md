# FormatX Suite Pro — Release information

Ez a fájl nem tartalmaz kézzel karbantartott aktuális verziószámot vagy fix kiadási URL-t.

Az aktuális hivatalos kiadás adatai:

- [`docs/scifi-ui/data/current-release.json`](docs/scifi-ui/data/current-release.json)
- hivatalos kiadási tár: `hutoczky/FormatX-Updates`
- szinkronizálás: [`.github/workflows/sync-current-release.yml`](.github/workflows/sync-current-release.yml)

## Állapot

- Bazzite / Linux: **Public beta**, elsődleges rendszer és támogatási irány
- Windows: **Public beta**, támogatott másodlagos platform
- Közös asztali csomag: **Multiplatform public beta**
- Android: **Public beta**, külön telepíthető csomag
- Web: **Technical preview**
- macOS: **Planned**
- iOS / iPadOS: **Planned**

A Bazzite/Linux és a Windows ugyanabból a hivatalos multiplatform csomagból telepíthető. Jelenleg egyik platform sem Stable. Az irányadó forrás: [`docs/scifi-ui/data/platform-status.json`](docs/scifi-ui/data/platform-status.json).

A publikus weboldal nem jelenít meg belső komponens-, loader- vagy buildverziókat. A kiadási azonosító a háttérben kizárólag szinkronizálási, integritási és hibakeresési célra marad meg.

## Minden nyilvános kiadás kötelező elemei

- pontos kiadási dátum;
- platform- és státuszcímke;
- kiadási megjegyzések;
- ismert hibák;
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
