# 🧊 FormatX Suite Pro

Moduláris, auditálható technikusi platform meghajtókezeléshez, rendszerdiagnosztikához, telepítéshez és ellenőrizhető karbantartáshoz.

## Nyilvános termékállapot

**Aktuális kiadás:** FormatX Suite Pro V92  
**Összesített állapot:** **Public beta / Nyilvános béta**  
**Licenc:** 5 napos próbalicenc, majd választott fizetős hozzáférés  
**Aktiválás:** a banki jóváírás és a rendelési azonosító kézi ellenőrzése után  
**Automatikus megújítás:** nincs

> Jelenleg egyik platform sem kap **Stable** címkét. A Stable állapot csak a nyilvános tesztmátrix, a kiadási bizonyítékok és az elfogadási feltételek teljesítése után használható.

## Egységes platformállapot

| Platform | Állapot | Verzió / irány | Mit jelent? |
|---|---|---|---|
| Windows | **Public beta** | V92 | A jelenlegi asztali kiadás Windows-specifikus WinUI 3 és lemezkezelő komponenseket használ. Nyilvánosan tesztelhető, de még nem stabil végleges kiadás. |
| Linux / Bazzite | **Development** | Native target | Az elsődleges célplatform natív kiadása aktív fejlesztés alatt áll. |
| macOS | **Planned** | Roadmap | Natív nyilvános csomag még nincs. |
| Web | **Technical preview** | Browser experience | Az Organizmus-UI, projekt-szimulátor és licencfelület technikai előnézet; nem helyettesíti a natív rendszereszközöket. |
| Android | **Public beta** | 1.0.4–1.0.6 | Közvetlenül telepíthető APK nyilvános teszteléshez; még nem végleges Play Áruház-kiadás. |
| iOS / iPadOS | **Planned** | Roadmap | Jelenleg nincs letölthető vagy tesztelhető csomag. |

A géppel olvasható, irányadó állapotforrás: [`docs/scifi-ui/data/platform-status.json`](docs/scifi-ui/data/platform-status.json).

## Fő funkciók

- ISO → USB írás GPT/MBR sémával és opcionális visszaellenőrzéssel
- Gyors és mély formázás: NTFS, FAT32, exFAT, ReFS, EXT4
- Partíciótervezés előnézettel és támogatott esetben visszavonással
- Biztonságos törlés többlépcsős célmeghajtó-védelemmel
- SMART- és felszíni vizsgálat
- Rendszerinformációk: CPU, RAM, GPU, lemezek, hálózat, szenzoradatok
- Kétpaneles fájlkezelő
- Magyarázó és döntéstámogató AI-réteg; veszélyes műveletet nem indít önállóan

## Letöltés és kiadási bizonyíték

- [Egységes letöltési és platformállapot-oldal](https://www.formatxsuite.com/scifi-ui/downloads/)
- [V92 kiadási oldal](https://github.com/hutoczky/FormatX-Updates/releases/tag/v92)
- [Release notes](./RELEASE_NOTES.md)

A letöltött csomag használata előtt ellenőrizd a közzétett SHA-256 összeget és az elérhető aláírási bizonyítékot. A nyilvános tesztmátrixban külön kell rögzíteni az operációs rendszert, verziót, hardvert, funkciót, teszteredményt és ismert korlátozást.

## Támogatás

- E-mail: [hutoczky@gmail.com](mailto:hutoczky@gmail.com)
- [Támogatási oldal](https://www.formatxsuite.com/scifi-ui/support.html)
- [Nyilvános hibajegyek](https://github.com/hutoczky/FormatX/issues)

A GitHub hibajegy nem az egyetlen támogatási út. Bizalmas rendelési, licenc- vagy személyes adatot e-mailben vagy a honlapon megjelölt privát csatornán küldj.

## Licenc

A projekt a **FormatX Custom License – Non-Redistributable Edition** alatt érhető el. A szoftver és a forráskód másolása, módosítása, közzététele, továbbértékesítése vagy terjesztése a szerző előzetes írásos engedélye nélkül tilos.

- [LICENSE](./LICENSE)
- [Részletes licenc a FormatX honlapján](https://www.formatxsuite.com/scifi-ui/license.html)
- [Felhasználási feltételek](https://www.formatxsuite.com/scifi-ui/terms.html)
- [Adatkezelési tájékoztató](https://www.formatxsuite.com/scifi-ui/privacy.html)
