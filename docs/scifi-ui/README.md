# FormatX Suite Pro weboldal

A `hutoczky.github.io/FormatX/` címen megjelenő statikus projekt- és letöltési oldal forrása.

## Kiadási adatforrás

Az oldal egyszer, betöltéskor olvassa a `hutoczky/FormatX-Updates` legújabb nyilvános GitHub Release metaadatát. Nem használ kliensoldali tokent, és nem végez időzített hálózati lekérdezést.

Az élő metaadat csak akkor írhatja felül a beépített V92 tartalékot, ha:

- stabil, nem piszkozat és nem előzetes kiadás;
- a címke `vNN` vagy `VNN` alakú;
- pontosan illeszkedő `FormatX-Suite-Pro-VNN.zip` asset tartozik hozzá;
- a letöltési URL a hivatalos `hutoczky/FormatX-Updates` GitHub Release útvonalra mutat.

API- vagy hálózati hiba esetén az ellenőrzött V92 URL és SHA256 marad látható.

## Helyi futtatás

```bash
python3 -m http.server 8000 --directory docs
```

Ezután nyisd meg a `http://127.0.0.1:8000/` címet.

## Ellenőrzés

```bash
node --check docs/scifi-ui/scripts/site.js
git diff --check
```

Kézi ellenőrzés szükséges sötét és világos témában, valamint asztali és mobil nézetben. A fő letöltési gomb végső céljának a `FormatX-Updates` aktuális, univerzális ZIP assetjére kell mutatnia.

## Közzététel

A GitHub Pages a repository `master` branchének `/docs` könyvtárából szolgálja ki az oldalt. A gyökérút a `scifi-ui/` oldalra irányít át.
