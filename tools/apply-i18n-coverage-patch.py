#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
i18n_path = root / 'docs/scifi-ui/scripts/i18n.js'
audit_path = root / 'tools/validate-site-i18n.py'
text = i18n_path.read_text(encoding='utf-8')

marker = "  const TRANSLATIONS = [\n"
patch_marker = "    // SOURCE_AND_DYNAMIC_COVERAGE_PATCH\n"

pairs = r'''    // SOURCE_AND_DYNAMIC_COVERAGE_PATCH
    ['FormatX Suite Pro | Technician Interface 2041', 'FormatX Suite Pro | Technician Interface 2041'],
    ['Banki átutalás | FormatX Suite Pro', 'Bank transfer | FormatX Suite Pro'],
    ['Támogatás | FormatX Suite Pro', 'Support | FormatX Suite Pro'],
    ['Felhasználási feltételek | FormatX Suite Pro', 'Terms of use | FormatX Suite Pro'],
    ['Adatvédelem | FormatX Suite Pro', 'Privacy | FormatX Suite Pro'],
    ['A TECHNIKUSI MUNKAFELÜLET 2041-ES SZABVÁNYA', 'THE 2041 STANDARD FOR TECHNICIAN WORKSPACES'],
    ['Felmér. Rendszerez. Biztonságosan végrehajt.', 'Assess. Organize. Execute safely.'],
    ['Cross-platform technikusi rendszer meghajtókezeléshez, telepítéshez, fájlműveletekhez és valós rendszerdiagnosztikához — látványos díszadatok helyett ellenőrizhető állapotokkal.', 'A cross-platform technician system for drive management, deployment, file operations and real system diagnostics — with verifiable states instead of decorative fake data.'],
    ['stabil csomag letöltése', 'download stable package'],
    ['Rendszermodulok megnyitása', 'Open system modules'],
    ['Fő képességek', 'Core capabilities'],
    ['Valós hardvertelemetria', 'Real hardware telemetry'],
    ['Cross-platform vezérlés', 'Cross-platform control'],
    ['Ellenőrzött kiadási lánc', 'Verified release chain'],
    ['FormatX Core Engine rendszeráttekintés', 'FormatX Core Engine system overview'],
    ['FORMATX MAGMOTOR', 'FORMATX CORE ENGINE'],
    ['Technikusi vezérlőmátrix', 'Technician Control Matrix'],
    ['Rendszermodulok', 'System modules'],
    ['Fájlkezelő', 'File manager'],
    ['Frissítés', 'Update'],
    ['Platformlefedettség', 'Platform coverage'],
    ['Adatintegritás', 'Data integrity'],
    ['Kiadási metaadat és fájlellenőrzés', 'Release metadata and file verification'],
    ['Rendszermodul', 'System module'],
    ['egységes munkafolyamat', 'unified workflow'],
    ['aláírt ellenőrzés', 'signed verification'],
    ['Mérési elv', 'Measurement principle'],
    ['nincs kitalált érték', 'no fabricated values'],
    ['Leltár · Célzár · Megerősítés', 'Inventory · Target lock · Confirmation'],
    ['Előellenőrzés · Telepítés · Ellenőrzés', 'Preflight · Deploy · Verify'],
    ['CPU · Memória · Hálózat · Tárhely', 'CPU · Memory · Network · Storage'],
    ['Másolás · Mozgatás · Rendezés', 'Copy · Move · Organize'],
    ['Védelem · Megerősítés · Naplózás', 'Guard · Confirm · Audit'],
    ['Aláírás · Hash · Kiadás', 'Sign · Hash · Release'],
    ['FORMATX // RENDSZERMEGFIGYELŐ', 'FORMATX // SYSTEM OBSERVATORY'],
    ['NAPLÓ', 'LOG'],
    ['Technikusi felület // 2041', 'Technician Interface // 2041'],
    ['Többplatformos', 'Cross-platform'],
    ['. Tudomásul veszem, hogy ez egyszeri banki átutalás, és a licenc csak a jóváírás kézi ellenőrzése után aktiválódik.', '. I understand that this is a one-time bank transfer and that the licence is activated only after manual verification of the credit.'],
    ['HUF-fizetésnél RFC 8905 szerinti', 'For HUF payments, an RFC 8905'],
    ['QR, EUR-fizetésnél pedig EPC SEPA átutalási QR készül. A kiválasztott csomaghoz rögzített összeg és egyedi rendelési azonosító tartozik.', 'QR is generated; for EUR payments, an EPC SEPA transfer QR is generated. Each selected plan receives a fixed amount and a unique order reference.'],
    ['HUF-fizetésnél a QR-kód RFC 8905 szerinti', 'For HUF payments, the QR code contains RFC 8905'],
    ['fizetési adatot tartalmaz. Ez nem qvik-QR, ezért a mobilbankok automatikus kitöltési támogatása eltérhet.', 'payment data. It is not a qvik QR, so automatic completion support varies between mobile banks.'],
    ['ÜZLETI / TULAJDONOS', 'BUSINESS / OWNER'],
    ['A HUF- és EUR-QR a beépített, ellenőrzött bankszámlaadatokkal készül; a fizetés és a licencellenőrzés kézi.', 'The HUF and EUR QR codes use the built-in verified bank account data; payment and licence verification are manual.'],
    ['A közvetlen HUF/EUR banki átutalás nincs teljesen konfigurálva.', 'Direct HUF/EUR bank transfer is not fully configured.'],
    ['A HUF/EUR banki átutalási backend nincs teljesen konfigurálva.', 'The HUF/EUR bank-transfer backend is not fully configured.'],
    ['A fizetési visszajelzés adatbázisa nincs konfigurálva.', 'The payment-report database is not configured.'],
    ['A rendelési azonosító nem található.', 'The order reference was not found.'],
    ['A vásárlói e-mail nem egyezik a rendelésben megadott címmel.', 'The buyer email does not match the address provided with the order.'],
    ['A visszajelzett deviza nem egyezik a rendeléssel.', 'The reported currency does not match the order.'],
    ['A visszajelzett összeg nem egyezik a rendeléssel.', 'The reported amount does not match the order.'],
    ['Nem éles banki átutalási válasz érkezett.', 'A non-live bank-transfer response was received.'],
    ['A rendelési azonosító eltér.', 'The order reference does not match.'],
    ['A fizetési adatok hiányosak, vagy az összeg/deviza eltér.', 'Payment details are incomplete or the amount/currency does not match.'],
'''

if patch_marker not in text:
    if marker not in text:
        raise SystemExit('TRANSLATIONS marker not found')
    text = text.replace(marker, marker + pairs, 1)

text = text.replace(
    "return 'Direct GitHub Pages mode is active. ' + match[1];",
    "return 'Direct GitHub Pages mode is active. ' + exact(match[1].trim(), 'en');"
)
text = text.replace(
    "return 'Közvetlen GitHub Pages mód aktív. ' + match[1];",
    "return 'Közvetlen GitHub Pages mód aktív. ' + exact(match[1].trim(), 'hu');"
)

i18n_path.write_text(text, encoding='utf-8')

audit = audit_path.read_text(encoding='utf-8')
audit = audit.replace(
    '"Hutóczky József", "REVOHUHB", "CHASDEFX",',
    '"Hutóczky József", "REVOHUHB", "CHASDEFX", "X",'
)
audit = audit.replace(
    're.compile(r"^\\d+\\s*(MiB|GiB|Ft|€)?$"),',
    're.compile(r"^\\d+(?:[.,]\\d+)?\\s*(MiB|GiB|Ft|€)?$"),'
)
audit_path.write_text(audit, encoding='utf-8')
