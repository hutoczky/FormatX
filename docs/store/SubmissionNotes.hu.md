# Beny�jt�si megjegyz�sek (HU)

runFullTrust indokl�s:
A FormatX WinUI 3 + MSIX csomagolt, teljes?trust asztali alkalmaz�s. A runFullTrust kiz�r�lag a hagyom�nyos Win32 API?k (lemez?enumer�ci�, �r�s/ellen�rz�s, WMI/S.M.A.R.T lek�rdez�s) haszn�lat�hoz sz�ks�ges. Nem telep�t drivert, nem emel privil�giumot a Store?csatorn�n, �s minden destrukt�v m�velet t�bb?l�pcs�s meger�s�t�st ig�nyel.

Tesztel�si �tmutat�:
- "Secure Erase" dem� meghajt�val; t�bb menet opci�k.
- ISO?USB: minta ISO �s dry?run (nem destrukt�v) �zem.
- Part�ci�s terv: el�n�zet, meger�s�t�s, rollback.

Biztons�g:
- Nincs driver telep�t�s.
- Store csatorn�n nincs privil�giumemel�s.
- Minden �rz�keny m�velet explicit meger�s�t�st ig�nyel.
