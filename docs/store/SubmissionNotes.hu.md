# Benyújtási megjegyzések (HU)

runFullTrust indoklás:
A FormatX WinUI 3 + MSIX csomagolt, teljes?trust asztali alkalmazás. A runFullTrust kizárólag a hagyományos Win32 API?k (lemez?enumeráció, írás/ellenõrzés, WMI/S.M.A.R.T lekérdezés) használatához szükséges. Nem telepít drivert, nem emel privilégiumot a Store?csatornán, és minden destruktív mûvelet több?lépcsõs megerõsítést igényel.

Tesztelési útmutató:
- "Secure Erase" demó meghajtóval; több menet opciók.
- ISO?USB: minta ISO és dry?run (nem destruktív) üzem.
- Partíciós terv: elõnézet, megerõsítés, rollback.

Biztonság:
- Nincs driver telepítés.
- Store csatornán nincs privilégiumemelés.
- Minden érzékeny mûvelet explicit megerõsítést igényel.
