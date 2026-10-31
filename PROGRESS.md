# FormatX – fejlesztési állapot

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
