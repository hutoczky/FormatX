# FormatX webes licenckezelő – éles telepítés

## Végleges címek

- Nyilvános honlap: `https://www.formatxsuite.com/`
- Rejtett tulajdonosi admin: `https://www.formatxsuite.com/fx-owner-license/`
- Aktiválás: `POST https://www.formatxsuite.com/api/license/activate`
- Ellenőrzés: `POST https://www.formatxsuite.com/api/license/check`
- Deaktiválás: `POST https://www.formatxsuite.com/api/license/deactivate`
- Állapot: `GET https://www.formatxsuite.com/api/license/health`

A licenckezelő nem használ külön aldomaint, és nem jelenik meg a nyilvános menüben vagy sitemapben.

## Elkészült funkciók

- Trial, Pro, Technician, Business, Lifetime és Owner licenc generálása;
- ügyfélnév, e-mail, lejárat, eszközlimit és belső megjegyzés;
- a teljes licenckulcs csak létrehozáskor vagy helyettesítő licenc kiadásakor látható;
- kulcs és teljes aktiválási üzenet másolása;
- előre kitöltött e-mail megnyitása a helyi levelezőprogramban;
- kereshető licencnyilvántartás;
- módosítás, felfüggesztés, újraaktiválás és visszavonás;
- visszavonási ok és auditnapló;
- helyettesítő licenc generálása;
- eszközaktiválás, géplimit és eszközleválasztás;
- nyers eszközazonosító helyett HMAC-lenyomat;
- IP-alapú, HMAC-anonimizált kéréskorlátozás;
- Cloudflare Access JWT-ellenőrzés;
- vészhelyzeti helyi jelszavas belépés PBKDF2-SHA-256 védelemmel;
- D1 adatbázis és verziózott migráció.

## Biztonsági modell

1. A `/fx-owner-license/*` útvonalat Cloudflare Access védi.
2. Csak a tulajdonosi e-mail-cím szerepel az Allow szabályban.
3. Az elsődleges bejelentkezés egyszer használatos e-mail-kóddal történik.
4. A Worker önállóan ellenőrzi az Access JWT aláírását, issuerét, audience értékét és az admin e-mail allowlistet.
5. A teljes licenckulcs nem kerül olvasható formában a D1 adatbázisba; csak `HMAC-SHA-256` lenyomat és az utolsó négy karakter marad meg.
6. A `LICENSE_PEPPER`, a munkamenettitok és a tartalék jelszó rekordja Cloudflare Worker Secret.
7. A böngészős adminmódosításokat Origin-ellenőrzés, SameSite cookie és helyi belépésnél CSRF-token védi.
8. Minden adminművelet auditálódik.

## Egyparancsos telepítés Bazzite alatt

A repository gyökerében:

```bash
cd /run/media/system/500GB_HDD/bazzite-project/billing-worker
bash scripts/deploy-license-center-live.sh
```

A script:

- ellenőrzi a Cloudflare API-tokent;
- lefuttatja a teszteket;
- létrehozza vagy megkeresi a D1 adatbázist;
- létrehozza a Zero Trust szervezetet, ha még nincs;
- létrehozza az egyszer használatos e-mail-kódos Identity Providert;
- létrehozza vagy frissíti a rejtett Access alkalmazást;
- kizárólag a tulajdonosi e-mailt engedélyezi;
- beállítja a D1 bindingot;
- létrehozza a Worker secreteket, de nem naplózza azokat;
- lefuttatja a D1 migrációt;
- dry-runt és éles Workert telepít;
- ellenőrzi az API-t és az adminvédelmet.

A script a Cloudflare API-tokent csak memóriában használja. A token nem kerül repositoryba vagy állandó fájlba.

## Belépés

Elsődleges:

1. Nyisd meg: `https://www.formatxsuite.com/fx-owner-license/`
2. Add meg: `hutoczky@gmail.com`
3. A Cloudflare e-mailben egyszer használatos kódot küld.
4. A kód megadása után megnyílik az adminfelület.

A script létrehoz egy kizárólag a tulajdonos által olvasható tartalék fájlt:

```text
~/FormatX-licenc-admin-belepes.txt
```

Ez a vészhelyzeti helyi jelszót tartalmazza, `chmod 600` jogosultsággal. Nem szabad GitHubra, Drive-ra vagy chatbe feltölteni.

## Cloudflare API-token jogosultságai

A telepítéshez minimálisan:

- Workers Scripts: Edit
- Workers Routes: Edit
- D1: Edit
- Access: Apps and Policies Write
- Access: Organizations, Identity Providers, and Groups Write
- Zone: Read

A tokent csak a helyi terminál kérésére add meg.

## Visszaállítás

A nyilvános honlap és a licenckezelő ugyanabban a `formatx` Workerben működik, de elkülönített útvonalakon. A licencközpont hibája esetén a nyilvános oldal többi útvonala a meglévő production Workerhez kerül továbbításra.

A D1 adatbázis rendszeresen exportálandó. A `LICENSE_PEPPER` elvesztése esetén a már kiadott kulcsok nem ellenőrizhetők, ezért ezt a Cloudflare secretet tilos forgatni egyszerű újratelepítéskor. A telepítő csak akkor hozza létre, ha még nincs beállítva.
