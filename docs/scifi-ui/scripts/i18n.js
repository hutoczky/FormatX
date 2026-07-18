(function () {
  'use strict';

  const STORAGE_KEY = 'formatx-language';
  const SUPPORTED = new Set(['hu', 'en']);
  const TRANSLATIONS = [
    ['Ugrás a tartalomra', 'Skip to content'],
    ['Menü', 'Menu'],
    ['Fő navigáció', 'Main navigation'],
    ['Sötét', 'Dark'],
    ['Világos', 'Light'],
    ['Megjelenés', 'Appearance'],
    ['Mobil megjelenés', 'Mobile appearance'],
    ['FormatX Suite Pro főoldal', 'FormatX Suite Pro home'],
    ['Vissza a főoldalra', 'Back to home'],
    ['Vissza a licencekhez', 'Back to licences'],
    ['Jogi és támogatási linkek', 'Legal and support links'],
    ['Aktuális kiadás', 'Current release'],
    ['FormatX alapelvek', 'FormatX principles'],

    ['TERMÉK', 'PRODUCT'],
    ['PLATFORMOK', 'PLATFORM'],
    ['TECHNOLÓGIA', 'TECHNOLOGY'],
    ['BIZTONSÁG', 'SECURITY'],
    ['ÁRAK', 'PRICING'],
    ['BELÉPÉS A PLATFORMRA', 'ENTER PLATFORM'],
    ['MODULÁRIS OPERÁCIÓS PLATFORM', 'MODULAR OPERATING PLATFORM'],
    ['Precíz munkára építve.', 'Built for precision.'],
    ['A jövőre tervezve.', 'Designed for the future.'],
    ['Többplatformos ökoszisztéma technikusoknak, alkotóknak és szakembereknek, akik teljes irányítást igényelnek.', 'A cross-platform ecosystem engineered for technicians, creators, and professionals who demand complete control.'],
    ['BELÉPÉS A RENDSZERBE', 'ENTER THE SYSTEM'],
    ['RENDSZERBEMUTATÓ', 'WATCH SYSTEM DEMO'],
    ['FORMATX MAG ONLINE', 'FORMATX CORE ONLINE'],
    ['TECHNIKUSI FELÜLET // 2041', 'TECHNICIAN INTERFACE // 2041'],
    ['FORMATX RENDSZERFELÜLET', 'FORMATX SYSTEM INTERFACE'],
    ['Magmodul / Technológiai előnézet', 'Core Module / Technology Preview'],
    ['Mag', 'Core'],
    ['Platformok', 'Platforms'],
    ['Technológia', 'Technology'],
    ['Kiadás', 'Release'],
    ['Biztonság', 'Security'],
    ['Árazás', 'Pricing'],
    ['MAG ÁLLAPOTA', 'CORE STATUS'],
    ['MODULSZINKRON', 'MODULE SYNC'],
    ['Kvantumbiztos kiadási integritás', 'Quantum-safe release integrity'],
    ['MAGMOTOR', 'CORE ENGINE'],
    ['moduláris operációs platform', 'modular operating platform'],
    ['BIZTONSÁGI RÁCS', 'SECURITY GRID'],
    ['AKTÍV', 'ACTIVE'],
    ['TELEMETRIA', 'TELEMETRY'],
    ['VALÓS IDEJŰ', 'REAL-TIME'],
    ['kitalált érték nélküli rendszeradat', 'zero-fiction system data'],
    ['TÖBB PLATFORM', 'CROSS PLATFORM'],
    ['Egy rendszer. Minden környezet.', 'One system. Every environment.'],
    ['MODULÁRIS TERVEZÉS', 'MODULAR BY DESIGN'],
    ['Veled együtt fejlődik.', 'Built to evolve with you.'],
    ['BIZTONSÁG ELSŐKÉNT', 'SECURITY FIRST'],
    ['Védelem minden rétegben.', 'Protection at every layer.'],
    ['VALÓS IDEJŰ VEZÉRLÉS', 'REAL-TIME CONTROL'],
    ['Azonnali rálátás. Teljes irányítás.', 'Instant insight. Total command.'],

    ['Ellenőrzött GitHub Release', 'Verified GitHub Release'],
    ['ELLENŐRZÖTT GITHUB KIADÁS', 'VERIFIED GITHUB RELEASE'],
    ['ELLENŐRZÖTT V92 TARTALÉK', 'VERIFIED V92 FALLBACK'],
    ['Kiadási központ →', 'Release center →'],
    ['Valós rendszeradat', 'Real system data'],
    ['A felület csak mérhető állapotot jelenít meg.', 'The interface only displays measurable states.'],
    ['Biztonságos megerősítés', 'Safe confirmation'],
    ['Kritikus művelet előtt egyértelmű célazonosítás.', 'Clear target identification before critical operations.'],
    ['Nyílt kiadási lánc', 'Open release chain'],
    ['GitHub Release, SHA256 és verziókövetés.', 'GitHub Releases, SHA256 and version tracking.'],
    ['Platformnatív működés', 'Platform-native operation'],
    ['Az operációs rendszerhez igazított adatforrások.', 'Data sources adapted to the operating system.'],

    ['PLATFORMMÁTRIX', 'PLATFORM MATRIX'],
    ['Egy közös kezelőfelület. Három natív rendszerprofil.', 'One unified interface. Three native system profiles.'],
    ['A FormatX nem egyetlen platform logikáját másolja mindenhová: a munkafolyamat egységes, az adatforrás és az útvonalkezelés operációs rendszerhez igazodik.', 'FormatX does not copy one platform model everywhere: the workflow is unified while data sources and path handling are adapted to each operating system.'],
    ['Windows kiadás', 'Windows Edition'],
    ['Meghajtóbetűjelek, Windows fájlválasztó, natív rendszeradatok és x86_64 / ARM64 indítás.', 'Drive letters, Windows file picker, native system data and x86_64 / ARM64 launch.'],
    ['Meghajtóleltár', 'Drive inventory'],
    ['Natív telepítési utak', 'Native installation paths'],
    ['Rendszerdiagnosztika', 'System diagnostics'],
    ['Linux / Bazzite kiadás', 'Linux / Bazzite Edition'],
    ['Flatpak, rpm-ostree, Steam / Proton, Wayland és Linux meghajtódiagnosztika.', 'Flatpak, rpm-ostree, Steam / Proton, Wayland and Linux drive diagnostics.'],
    ['Bazzite-kompatibilitás', 'Bazzite compatibility'],
    ['Immutable rendszerismeret', 'Immutable system awareness'],
    ['Linux eszközadatok', 'Linux device data'],
    ['macOS kiadás', 'macOS Edition'],
    ['macOS könyvtárválasztás, platformhoz igazított útvonalak és Intel / Apple Silicon profil.', 'macOS folder selection, platform-specific paths and Intel / Apple Silicon profiles.'],
    ['Natív mappaválasztás', 'Native folder selection'],
    ['Intel és Apple Silicon', 'Intel and Apple Silicon'],
    ['Platformhelyes utak', 'Platform-correct paths'],

    ['TECHNIKUSI MODULOK', 'TECHNICIAN MODULES'],
    ['Komoly rendszereszközök egy átlátható vezérlőmátrixban.', 'Professional system tools in a clear control matrix.'],
    ['A hangsúly nem a látványelemen, hanem az ellenőrizhető döntésen van. A 2041-es arculat minden esetben a működést teszi érthetőbbé.', 'The focus is not decoration but verifiable decisions. The 2041 visual language always makes operation easier to understand.'],
    ['Meghajtókezelés', 'Drive management'],
    ['Platformhelyes leltár, eszközazonosítás és megerősítés a kritikus műveletek előtt.', 'Platform-correct inventory, device identification and confirmation before critical operations.'],
    ['Telepítőmag', 'Deployment core'],
    ['Szabványos célmappa-választás, előellenőrzés, újrapróbálás és ellenőrzött csomagtelepítés.', 'Standard target-folder selection, preflight checks, retry logic and verified package deployment.'],
    ['Diagnosztika', 'Diagnostics'],
    ['Valós CPU-, memória-, hálózati és tárhelyadatok; hiányzó mérésnél egyértelmű N/A állapot.', 'Real CPU, memory, network and storage data; clear N/A state when a measurement is unavailable.'],
    ['Kétpaneles fájlkezelő', 'Dual-pane file manager'],
    ['Másolás, mozgatás, törlés és mappakezelés a gazdarendszer útvonalaihoz igazítva.', 'Copy, move, delete and folder management adapted to the host system paths.'],
    ['Biztonságos shell', 'Secure shell'],
    ['Védett műveletek, jogosultsági megerősítés és naplózható parancsvégrehajtás.', 'Protected operations, privilege confirmation and auditable command execution.'],
    ['Frissítési rendszer', 'Update system'],
    ['Ed25519 és SHA256 ellenőrzés, automatikus keresés és kézi kiadásellenőrzés.', 'Ed25519 and SHA256 verification, automatic lookup and manual release checking.'],

    ['KITALÁLT ÉRTÉK NÉLKÜLI TELEMETRIA', 'ZERO-FICTION TELEMETRY'],
    ['A rendszer nem talál ki adatot, csak azért, hogy szebb legyen a képernyő.', 'The system never invents data just to make the screen look better.'],
    ['Ha egy szenzor, meghajtó vagy hálózati adatforrás nem érhető el, a FormatX N/A vagy „Nem elérhető” állapotot jelez. A professzionális felület alapja a megbízható információ.', 'When a sensor, drive or network data source is unavailable, FormatX displays N/A or “Not available”. Reliable information is the foundation of a professional interface.'],
    ['hamis helyettesítő érték helyett', 'instead of a fabricated fallback value'],
    ['operációs rendszerből olvasott állapot', 'state read from the operating system'],
    ['visszakövethető műveleti lánc', 'traceable operation chain'],
    ['FormatX rendszerkonzol előnézet', 'FormatX system console preview'],
    ['Áttekintés', 'Overview'],
    ['Hardver', 'Hardware'],
    ['Meghajtók', 'Drives'],
    ['Hálózat', 'Network'],
    ['Napló', 'Log'],
    ['CPU állapot', 'CPU status'],
    ['Elérhető', 'Available'],
    ['Memóriaforrás', 'Memory source'],
    ['Valós mérés', 'Real measurement'],
    ['Hálózati kapcsolat', 'Network connection'],
    ['Aktív', 'Active'],
    ['Hiányzó szenzor', 'Missing sensor'],

    ['ELLENŐRZÖTT KIADÁSI CSATORNA', 'VERIFIED RELEASE CHANNEL'],
    ['Egy ellenőrzött csomag minden támogatott platformhoz.', 'One verified package for every supported platform.'],
    ['A stabil kiadás közvetlenül a hivatalos FormatX-Updates GitHub Release csatornából érkezik.', 'The stable release comes directly from the official FormatX-Updates GitHub Release channel.'],
    ['UNIVERZÁLIS ARCHÍVUM', 'UNIVERSAL ARCHIVE'],
    ['A ZIP tartalmazza a Windows, Linux / Bazzite és macOS indítókat, a platformonkénti binárisokat, a QML felületet, a telepítőt és a frissítési metaadatokat.', 'The ZIP contains Windows, Linux / Bazzite and macOS launchers, platform binaries, the QML interface, installer and update metadata.'],
    ['Verzió', 'Version'],
    ['Méret', 'Size'],
    ['Forrás', 'Source'],
    ['Profil', 'Profile'],
    ['Univerzális csomag letöltése', 'Download universal package'],
    ['Kiadási részletek', 'Release details'],
    ['INTEGRITÁSELLENŐRZÉS', 'INTEGRITY CHECK'],
    ['Ellenőrzőösszeg másolása', 'Copy checksum'],
    ['A linket a hivatalos FormatX-Updates kiadásból ellenőrizzük.', 'The link is verified against the official FormatX-Updates release.'],
    ['JavaScript nélkül a beépített, ellenőrzött V92 link használható.', 'Without JavaScript, the built-in verified V92 link remains available.'],

    ['LICENCMÁTRIX', 'LICENSE MATRIX'],
    ['Válaszd ki a technikusi kapacitáshoz illő hozzáférést.', 'Choose the access level that matches your technician capacity.'],
    ['Egyszeri havi vagy éves banki átutalás HUF-ban vagy EUR-ban, fix összegű QR-adatokkal és kézi jóváírás-ellenőrzéssel.', 'One-time monthly or annual bank transfer in HUF or EUR, with fixed-amount QR data and manual credit verification.'],
    ['BETÖLTÉS', 'LOADING'],
    ['Licencadatok előkészítése…', 'Preparing licence data…'],
    ['A csomagok rövidesen megjelennek.', 'Plans will appear shortly.'],
    ['Fizetési alapelvek', 'Payment principles'],
    ['✓ 5 napos próbaidő', '✓ 5-day trial'],
    ['✓ HUF és EUR banki fizetés', '✓ HUF and EUR bank payment'],
    ['✓ Nincs automatikus terhelés', '✓ No automatic charges'],
    ['✓ Kézi tranzakció-ellenőrzés', '✓ Manual transaction verification'],
    ['PRÓBAHOZZÁFÉRÉS', 'TRIAL ACCESS'],
    ['5 nap teljes hozzáférés', '5 days full access'],
    ['Próbáld ki a többplatformos technikusi munkafolyamatot a licenc kiválasztása előtt.', 'Explore the cross-platform technician workflow before choosing a licence.'],
    ['Csomag letöltése', 'Download package'],
    ['HUF / EUR banki fizetés', 'HUF / EUR bank payment'],
    ['1 technikus, legfeljebb 10 rendszer. Éves díj: 199 000 Ft vagy 547 €.', '1 technician, up to 10 systems. Annual: 199 000 Ft or 547 €.'],
    ['3 technikus, legfeljebb 50 rendszer. Éves díj: 499 000 Ft vagy 1 373 €.', '3 technicians, up to 50 systems. Annual: 499 000 Ft or 1 373 €.'],
    ['5 technikus, legfeljebb 150 rendszer. Éves díj: 999 000 Ft vagy 2 748 €.', '5 technicians, up to 150 systems. Annual: 999 000 Ft or 2 748 €.'],

    ['BIZALMI ARCHITEKTÚRA', 'TRUST ARCHITECTURE'],
    ['A 2041-es megjelenés mögött ellenőrizhető biztonsági lánc működik.', 'A verifiable security chain operates behind the 2041 interface.'],
    ['A letöltés, a fizetés és a licencaktiválás külön ellenőrzési pontokon halad át. A látvány nem helyettesíti a technikai bizonyítékot.', 'Download, payment and licence activation pass through separate verification points. Visual design never replaces technical evidence.'],
    ['Aláírt frissítés', 'Signed update'],
    ['Ed25519 és SHA256 ellenőrzés.', 'Ed25519 and SHA256 verification.'],
    ['Fix fizetési összeg', 'Fixed payment amount'],
    ['A csomag és deviza alapján rögzített HUF vagy EUR ár.', 'Fixed HUF or EUR price based on plan and currency.'],
    ['Kézi jóváhagyás', 'Manual approval'],
    ['A licenc csak a valódi banki jóváírás ellenőrzése után aktív.', 'The licence becomes active only after the real bank credit is verified.'],
    ['Nyílt projektállapot', 'Open project status'],
    ['GitHub kiadások, hibajegyek és verziókövetés.', 'GitHub releases, issues and version tracking.'],

    ['FORMATX PROJEKT', 'FORMATX PROJECT'],
    ['Jövőorientált felület, mai rendszereken működő eszközök.', 'A future-facing interface with tools that work on today’s systems.'],
    ['A FormatX Suite Pro cross-platform technikusi alkalmazás meghajtókezeléshez, rendszerdiagnosztikához, telepítéshez és karbantartási műveletekhez. A közös QML felület platformonként natív adatforrásokat és útvonalkezelést használ.', 'FormatX Suite Pro is a cross-platform technician application for drive management, system diagnostics, deployment and maintenance. Its shared QML interface uses native data sources and path handling on each platform.'],
    ['A 2041-es arculat a rendszer hosszú távú irányát fejezi ki: gyorsan értelmezhető állapotok, mélységet adó holografikus rétegek és professzionális, zavarmentes kezelhetőség.', 'The 2041 visual language expresses the system’s long-term direction: rapidly understandable states, depth-enhancing holographic layers and professional distraction-free usability.'],
    ['GitHub projekt →', 'GitHub project →'],
    ['Összes kiadás →', 'All releases →'],
    ['Visszajelzés és támogatás →', 'Feedback and support →'],
    ['Cross-platform technikusi rendszer valós rendszeradatokkal, ellenőrzött kiadásokkal és biztonságos munkafolyamatokkal.', 'Cross-platform technician system with real system data, verified releases and safe workflows.'],
    ['Rendszer', 'System'],
    ['Funkciók', 'Features'],
    ['Letöltés', 'Download'],
    ['Licencek', 'Licences'],
    ['Csomagok', 'Plans'],
    ['HUF / EUR fizetés', 'HUF / EUR payment'],
    ['Licenctámogatás', 'Licence support'],
    ['Bizalom', 'Trust'],
    ['Felhasználási feltételek', 'Terms of use'],
    ['Adatvédelem', 'Privacy'],
    ['Nyitott hibajegyek', 'Open issues'],
    ['2041-es tervezési nyelv · Valós működés · Ellenőrizhető adatok', '2041 design language · Real operation · Verifiable data'],
    ['Vissza a tetejére ↑', 'Back to top ↑'],

    ['HUF / EUR banki átutalás', 'HUF / EUR bank transfer'],
    ['FIX HUF VAGY EUR ÖSSZEG', 'FIXED HUF OR EUR AMOUNT'],
    ['Közvetlen banki átutalás QR-kóddal', 'Direct bank transfer with QR code'],
    ['HUF-fizetésnél RFC 8905 szerinti payto: QR, EUR-fizetésnél pedig EPC SEPA átutalási QR készül. A kiválasztott csomaghoz rögzített összeg és egyedi rendelési azonosító tartozik.', 'For HUF payments, an RFC 8905 payto: QR is generated; for EUR payments, an EPC SEPA transfer QR is generated. Each selected plan receives a fixed amount and a unique order reference.'],
    ['RENDELÉS', 'ORDER'],
    ['Összegzés', 'Summary'],
    ['Csomag', 'Plan'],
    ['Időtartam', 'Duration'],
    ['Havi hozzáférés', 'Monthly access'],
    ['Deviza', 'Currency'],
    ['Fizetendő', 'Amount due'],
    ['Technikus', 'Technicians'],
    ['Géplimit', 'Device limit'],
    ['Azonosító', 'Reference'],
    ['A licenc a beérkezett banki átutalás kézi ellenőrzése után aktiválódik. Az összeget és a közleményt változtatás nélkül add meg.', 'The licence is activated after manual verification of the incoming bank transfer. Enter the amount and reference without changes.'],
    ['1. LÉPÉS', 'STEP 1'],
    ['2. LÉPÉS', 'STEP 2'],
    ['3. LÉPÉS', 'STEP 3'],
    ['Rendelési adatok', 'Order details'],
    ['Hozzáférési idő', 'Access period'],
    ['1 hónap — egyszeri fizetés', '1 month — one-time payment'],
    ['1 év — egyszeri fizetés', '1 year — one-time payment'],
    ['Fizetési deviza', 'Payment currency'],
    ['Magyar forint (HUF)', 'Hungarian forint (HUF)'],
    ['Euró (EUR / SEPA)', 'Euro (EUR / SEPA)'],
    ['Cégnév vagy tevékenységnév', 'Company or activity name'],
    ['Kapcsolattartó neve', 'Contact name'],
    ['E-mail-cím', 'Email address'],
    ['Számlázási cím', 'Billing address'],
    ['Adószám — opcionális', 'Tax number — optional'],
    ['Belső hivatkozás — opcionális', 'Internal reference — optional'],
    ['Elfogadom a', 'I accept the'],
    ['felhasználási feltételeket', 'terms of use'],
    ['és az', 'and the'],
    ['adatkezelési tájékoztatót', 'privacy notice'],
    ['Tudomásul veszem, hogy ez egyszeri banki átutalás, és a licenc csak a jóváírás kézi ellenőrzése után aktiválódik.', 'I understand that this is a one-time bank transfer and that the licence is activated only after manual verification of the credit.'],
    ['Bankszámla ellenőrzése…', 'Checking bank account…'],
    ['Mégsem', 'Cancel'],
    ['Banki átutalás', 'Bank transfer'],
    ['Fix összegű banki átutalási adatok QR-kódja', 'QR code containing fixed-amount bank transfer data'],
    ['A QR-kód a kiválasztott fix összeget, az IBAN-t és a közleményt tartalmazza.', 'The QR code contains the selected fixed amount, IBAN and payment reference.'],
    ['Mindig ellenőrizd az alábbi adatokat jóváhagyás előtt.', 'Always verify the following details before approval.'],
    ['Kedvezményezett', 'Beneficiary'],
    ['HUF számlaszám', 'HUF account number'],
    ['Levelező bank BIC (ha kért)', 'Correspondent bank BIC (if requested)'],
    ['Összeg', 'Amount'],
    ['Banki alkalmazás megnyitása', 'Open banking app'],
    ['SEPA átutalás megnyitása', 'Open SEPA transfer'],
    ['Átutalási adatok másolása', 'Copy transfer details'],
    ['Új rendelés', 'New order'],
    ['Átutalás visszajelzése', 'Report transfer'],
    ['A visszajelzés nem aktivál automatikusan licencet. Az adminisztrátor előbb ellenőrzi, hogy a pontos összeg és közlemény megérkezett-e a bankszámlára.', 'The report does not activate a licence automatically. The administrator first verifies that the exact amount and reference reached the bank account.'],
    ['Rendelési azonosító', 'Order reference'],
    ['Utaló neve', 'Payer name'],
    ['Vásárló e-mail-címe', 'Buyer email address'],
    ['Banki tranzakció hivatkozása', 'Bank transaction reference'],
    ['Megjegyzés — opcionális', 'Message — optional'],
    ['Hozzájárulok, hogy az adatokat az átutalás beazonosításához és a licenc aktiválásához kezeljék.', 'I consent to the processing of these data to identify the transfer and activate the licence.'],
    ['Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR'],
    ['Rendelés előkészítése…', 'Preparing order…'],
    ['Átutalási adatok elkészültek', 'Transfer details ready'],
    ['Banki átutalás nincs konfigurálva', 'Bank transfer is not configured'],
    ['A banki átutalás nincs engedélyezve.', 'Bank transfer is not enabled.'],
    ['Töltsd ki a kötelező rendelési adatokat.', 'Complete the required order details.'],
    ['Az átutalási QR és a másolható banki adatok elkészültek. Az összeget és a közleményt változtatás nélkül add meg.', 'The transfer QR and copyable bank details are ready. Enter the amount and reference without changes.'],
    ['Az átutalási adatok a vágólapra kerültek.', 'Transfer details copied to the clipboard.'],
    ['A másolás nem sikerült. Jelöld ki kézzel az átutalási adatokat.', 'Copying failed. Select the transfer details manually.'],
    ['A HUF banki átutalás és az EUR SEPA QR-fizetés aktív. Jóváhagyás előtt mindig ellenőrizd az adatokat.', 'HUF bank transfer and EUR SEPA QR payment are active. Always verify the details before approval.'],
    ['A QR-kód EPC SEPA átutalási adatot tartalmaz: EUR-összeg, IBAN, BIC, kedvezményezett és közlemény.', 'The QR code contains EPC SEPA transfer data: EUR amount, IBAN, BIC, beneficiary and reference.'],
    ['EPC SEPA QR: a támogatás bankonként eltérhet. Jóváhagyás előtt ellenőrizd az EUR-összeget, az IBAN-t és a közleményt.', 'EPC SEPA QR support may vary by bank. Verify the EUR amount, IBAN and reference before approval.'],
    ['A QR-kód a kiválasztott fix HUF-összeget, az IBAN-t és a közleményt tartalmazza.', 'The QR code contains the selected fixed HUF amount, IBAN and payment reference.'],
    ['Ez nem qvik-QR. A banki alkalmazás automatikus kitöltése nem garantált; mindig ellenőrizd az adatokat.', 'This is not a qvik QR. Automatic completion by the banking app is not guaranteed; always verify the details.'],
    ['A visszajelzés előkészítése folyamatban van…', 'Preparing the payment report…'],
    ['A levelezőprogram megnyílt az előre kitöltött visszajelzéssel. Az e-mailt még el kell küldeni.', 'The mail application opened with the pre-filled report. You still need to send the email.'],
    ['A visszajelzés rögzítve lett. A licenc a beérkezett banki átutalás kézi ellenőrzése után aktiválódik.', 'The report was recorded. The licence is activated after manual verification of the incoming bank transfer.'],
    ['Töltsd ki a visszajelző űrlap kötelező mezőit.', 'Complete all required payment report fields.'],

    ['Támogatás', 'Support'],
    ['SEGÍTSÉG ÉS VISSZAJELZÉS', 'HELP AND FEEDBACK'],
    ['Hibajelentéshez, fejlesztési javaslathoz és licencigényhez válaszd a megfelelő nyilvános csatornát.', 'Choose the appropriate public channel for bug reports, development suggestions and licence requests.'],
    ['TECHNIKAI HIBA', 'TECHNICAL ISSUE'],
    ['GitHub hibajegy', 'GitHub issue'],
    ['Írd le az operációs rendszert, a FormatX verzióját, a pontos lépéseket és a kapott hibaüzenetet. Bizalmas adatot ne csatolj.', 'Describe the operating system, FormatX version, exact steps and error message. Do not attach confidential data.'],
    ['Új hibajegy nyitása', 'Open new issue'],
    ['ISMERT HIBÁK', 'KNOWN ISSUES'],
    ['Nyitott bejelentések', 'Open reports'],
    ['Beküldés előtt ellenőrizd, hogy a jelenséget már jelentette-e más. A meglévő hibajegy kiegészíthető új reprodukciós adattal.', 'Before submitting, check whether the issue has already been reported. Existing issues can be supplemented with new reproduction details.'],
    ['Hibajegyek megtekintése', 'View issues'],
    ['Licencigény', 'Licence request'],
    ['A licenctípust, a gépek számát és a kívánt felhasználási módot add meg. Licenckulcsot vagy gépazonosítót nyilvános hibajegybe ne írj.', 'Specify the licence type, number of systems and intended use. Never post a licence key or device identifier in a public issue.'],
    ['Licencigény indítása', 'Start licence request'],
    ['Gyors ellenőrzés hibajelentés előtt', 'Quick checks before reporting a bug'],
    ['Ellenőrizd, hogy a legújabb stabil kiadást használod.', 'Verify that you are using the latest stable release.'],
    ['Hasonlítsd össze a letöltött ZIP SHA256 értékét a kiadási oldalon látható ellenőrzőösszeggel.', 'Compare the downloaded ZIP SHA256 value with the checksum shown on the release page.'],
    ['Csatold a releváns naplórészletet, de távolítsd el belőle a személyes vagy titkos adatokat.', 'Attach the relevant log excerpt, but remove personal or secret data.'],

    ['JOGI INFORMÁCIÓ', 'LEGAL INFORMATION'],
    ['A FormatX Suite Pro licencek közvetlen HUF vagy EUR banki átutalással vásárolhatók meg. A weboldal nem kezel bankkártyaadatot.', 'FormatX Suite Pro licences can be purchased by direct HUF or EUR bank transfer. The website does not process bank card data.'],
    ['Fizetés és hozzáférési idő', 'Payment and access period'],
    ['A havi csomag egy hónapos, az éves csomag egyéves hozzáférést biztosít egyszeri átutalás ellenében. Nincs automatikus megújítás vagy ismétlődő terhelés.', 'The monthly plan provides one month and the annual plan one year of access for a one-time transfer. There is no automatic renewal or recurring charge.'],
    ['A vásárló HUF vagy EUR devizát választhat. Mindkét devizához előre rögzített csomagár tartozik; a rendszer nem végez fizetés közbeni élő devizaátváltást.', 'The buyer may choose HUF or EUR. Each currency has predefined plan prices; the system does not perform live currency conversion during payment.'],
    ['A kiválasztott összeget, a kedvezményezett IBAN-ját és a rendelési azonosítót a rendszer a csomag, az időtartam és a deviza alapján állítja össze. A közleményt változtatás nélkül kell megadni.', 'The selected amount, beneficiary IBAN and order reference are generated from the plan, duration and currency. The payment reference must be entered without changes.'],
    ['QR-kód', 'QR code'],
    ['HUF-fizetésnél a QR-kód RFC 8905 szerinti payto: fizetési adatot tartalmaz. Ez nem qvik-QR, ezért a mobilbankok automatikus kitöltési támogatása eltérhet.', 'For HUF payments, the QR code contains RFC 8905 payto: payment data. It is not a qvik QR, so automatic completion support varies between mobile banks.'],
    ['EUR-fizetésnél a QR-kód EPC SEPA Credit Transfer adatot tartalmaz: kedvezményezett, IBAN, BIC, rögzített EUR-összeg és FormatX rendelési azonosító. A banki alkalmazás támogatása ebben az esetben is eltérhet.', 'For EUR payments, the QR code contains EPC SEPA Credit Transfer data: beneficiary, IBAN, BIC, fixed EUR amount and FormatX order reference. Banking app support may also vary.'],
    ['A vásárlónak jóváhagyás előtt mindig ellenőriznie kell a kedvezményezettet, az IBAN-t, a devizát, az összeget és a közleményt.', 'Before approval, the buyer must always verify the beneficiary, IBAN, currency, amount and payment reference.'],
    ['Licencaktiválás', 'Licence activation'],
    ['A licenc nem aktiválódik pusztán a vásárlói visszajelzés alapján. Az üzemeltető kézzel ellenőrzi a bankszámlán jóváírt devizát, összeget és közleményt, majd jóváhagyja a rendelést és létrehozza a licenckulcsot.', 'The licence is not activated solely from the buyer’s report. The operator manually verifies the credited currency, amount and reference, then approves the order and creates the licence key.'],
    ['Programcsomag és biztonságos használat', 'Software package and safe use'],
    ['A letöltött csomag használatára a csomagban található licencfeltételek érvényesek. A meghajtó- és rendszerkezelési műveletek adatvesztést okozhatnak. Művelet előtt ellenőrizd a célmeghajtót, készíts mentést, és csak olyan rendszeren dolgozz, amelyhez megfelelő jogosultságod van.', 'Use of the downloaded package is governed by the licence terms included with it. Drive and system operations can cause data loss. Verify the target drive, create a backup and work only on systems for which you have proper authorization.'],
    ['A letöltés sértetlenségét a közzétett SHA256 ellenőrzőösszeggel kell ellenőrizni.', 'Verify download integrity using the published SHA256 checksum.'],
    ['Éles értékesítés', 'Live sales'],
    ['A végleges értékesítés megkezdése előtt ezt az oldalt teljes, jogilag ellenőrzött üzemeltetői, számlázási, teljesítési, elállási, hibakezelési és visszatérítési szabályokkal kell kiegészíteni.', 'Before final sales begin, this page must be completed with legally reviewed operator, billing, fulfilment, withdrawal, fault-handling and refund rules.'],
    ['Licencvásárlás', 'Buy licence'],

    ['A FormatX weboldal nem kér és nem tárol bankkártyaszámot, lejárati adatot vagy CVC-kódot. A fizetés HUF vagy EUR banki átutalással történik.', 'The FormatX website does not request or store card numbers, expiry data or CVC codes. Payment is made by HUF or EUR bank transfer.'],
    ['Rendelési adatok', 'Order data'],
    ['A rendelés előkészítéséhez a weboldal céges vagy tevékenységi nevet, kapcsolattartói nevet, e-mail-címet, számlázási címet, opcionális adószámot és belső hivatkozást kérhet.', 'To prepare an order, the website may request a company or activity name, contact name, email address, billing address, optional tax number and internal reference.'],
    ['GitHub Pages statikus működés esetén ezek az adatok a böngészőben maradnak. A fizetési visszajelzés gomb a felhasználó saját levelezőprogramjában készít elő egy e-mailt; az adat csak akkor kerül elküldésre, amikor a felhasználó az e-mailt ténylegesen elküldi.', 'In static GitHub Pages mode, these data remain in the browser. The payment report button prepares an email in the user’s own mail application; data are sent only when the user actually sends the email.'],
    ['Szerveres rendeléskövetés bekapcsolása esetén az adatokat a rendelés nyilvántartásához, az átutalás beazonosításához, a licenc aktiválásához, a számlázási egyeztetéshez és az ügyfélszolgálati kapcsolattartáshoz használjuk.', 'When server-side order tracking is enabled, the data are used to record the order, identify the transfer, activate the licence, reconcile billing and provide customer support.'],
    ['Banki átutalás és QR-kód', 'Bank transfer and QR code'],
    ['A HUF vagy EUR QR-kód a nyilvános kedvezményezetti adatokat, a kiválasztott fix összeget, a devizát és az egyedi rendelési azonosítót tartalmazza. EUR esetén EPC SEPA Credit Transfer formátum készül.', 'The HUF or EUR QR code contains public beneficiary data, the selected fixed amount, currency and unique order reference. For EUR, an EPC SEPA Credit Transfer format is generated.'],
    ['A QR-kép elkészítéséhez a böngésző ezt a nyilvános fizetési adatot továbbíthatja a QuickChart QR-szolgáltatásnak. A QR-adat nem tartalmaz bankkártyaadatot, bejelentkezési adatot vagy FormatX adatbázis-hozzáférést.', 'To generate the QR image, the browser may send these public payment data to the QuickChart QR service. The QR data contain no bank card data, login credentials or FormatX database access.'],
    ['A fizetés visszajelzésekor a rendelési azonosító, a deviza, az összeg, az utaló neve, a vásárló e-mail-címe, a banki tranzakció hivatkozása és az opcionális megjegyzés szerepelhet az elküldött e-mailben vagy a konfigurált rendelési adatbázisban.', 'When reporting payment, the order reference, currency, amount, payer name, buyer email, bank transaction reference and optional message may appear in the sent email or configured order database.'],
    ['Helyi és külső szolgáltatások', 'Local and external services'],
    ['A megjelenési mód választását a böngésző helyi tárhelye őrizheti meg. A legújabb kiadás megjelenítéséhez az oldal lekérheti a nyilvános GitHub Releases metaadatot. Szerveres rendeléskövetés használatakor a rendelési adatok a konfigurált Supabase adatbázisban tárolhatók.', 'The browser may store the selected appearance mode locally. To display the latest release, the site may retrieve public GitHub Releases metadata. When server-side order tracking is used, order data may be stored in the configured Supabase database.'],
    ['A végleges értékesítés előtt ezt az oldalt teljes, jogilag ellenőrzött adatkezelői adatokkal, jogalapokkal, megőrzési időkkel, érintetti jogokkal és adatfeldolgozói felsorolással kell kiegészíteni.', 'Before final sales, this page must be completed with legally reviewed controller details, legal bases, retention periods, data-subject rights and a list of processors.']
  ];

  const EXACT = new Map();
  TRANSLATIONS.forEach(function (pair) {
    EXACT.set(pair[0], pair);
    EXACT.set(pair[1], pair);
  });

  const META = {
    'index.html': {
      hu: ['FormatX Suite Pro | Technikusi felület 2041', 'FormatX Suite Pro: többplatformos technikusi rendszer valós rendszeradatokkal, ellenőrzött kiadásokkal és HUF/EUR fizetéssel.'],
      en: ['FormatX Suite Pro | Technician Interface 2041', 'FormatX Suite Pro: a cross-platform technician system with real system data, verified releases and HUF/EUR payments.']
    },
    'checkout.html': {
      hu: ['Banki átutalás | FormatX Suite Pro', 'FormatX Suite Pro licencvásárlás közvetlen, fix összegű HUF vagy EUR banki átutalással és QR-kóddal.'],
      en: ['Bank transfer | FormatX Suite Pro', 'Purchase a FormatX Suite Pro licence by direct fixed-amount HUF or EUR bank transfer and QR code.']
    },
    'support.html': {
      hu: ['Támogatás | FormatX Suite Pro', 'FormatX Suite Pro támogatás, hibajelentés és licencigény.'],
      en: ['Support | FormatX Suite Pro', 'FormatX Suite Pro support, bug reporting and licence requests.']
    },
    'terms.html': {
      hu: ['Felhasználási feltételek | FormatX Suite Pro', 'A FormatX Suite Pro weboldal, HUF/EUR licencvásárlás és letöltés felhasználási feltételei.'],
      en: ['Terms of use | FormatX Suite Pro', 'Terms of use for the FormatX Suite Pro website, HUF/EUR licence purchases and downloads.']
    },
    'privacy.html': {
      hu: ['Adatvédelem | FormatX Suite Pro', 'A FormatX Suite Pro weboldal és HUF/EUR banki átutalásos licencvásárlás adatkezelési tájékoztatója.'],
      en: ['Privacy | FormatX Suite Pro', 'Privacy notice for the FormatX Suite Pro website and HUF/EUR bank-transfer licence purchases.']
    }
  };

  let language = resolveLanguage();
  let applying = false;

  function resolveLanguage() {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED.has(query)) return query;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.has(stored)) return stored;
    } catch (_) {
      // Storage is optional.
    }
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function preserveSpace(original, translated) {
    const leading = original.match(/^\s*/u)?.[0] || '';
    const trailing = original.match(/\s*$/u)?.[0] || '';
    return leading + translated + trailing;
  }

  function exact(value, targetLanguage) {
    const pair = EXACT.get(value);
    if (!pair) return value;
    return targetLanguage === 'hu' ? pair[0] : pair[1];
  }

  function dynamic(value, targetLanguage) {
    const rules = targetLanguage === 'en' ? [
      [/^Közlemény:\s*(.+)$/u, function (match) { return 'Reference: ' + match[1]; }],
      [/^A fix (HUF|EUR)-összegű átutalási adatok előkészítése folyamatban van…$/u, function (match) { return 'Preparing fixed ' + match[1] + ' transfer details…'; }],
      [/^A fizetés nem indult el:\s*(.+)$/u, function (match) { return 'Payment could not be started: ' + exact(match[1], 'en'); }],
      [/^A visszajelzés nem készíthető elő:\s*(.+)$/u, function (match) { return 'The report could not be prepared: ' + exact(match[1], 'en'); }],
      [/^Közvetlen GitHub Pages mód aktív\.\s*(.*)$/u, function (match) { return 'Direct GitHub Pages mode is active. ' + match[1]; }],
      [/^A szerveres rendeléskövetés jelenleg nem elérhető\.$/u, function () { return 'Server-side order tracking is currently unavailable.'; }],
      [/^A rendelés most közvetlen, statikus módban folytatódik\.$/u, function () { return 'The order is continuing in direct static mode.'; }],
      [/^Rendelési azonosító:\s*(.+)$/u, function (match) { return 'Order reference: ' + match[1]; }],
      [/^Csomag:\s*(.+)$/u, function (match) { return 'Plan: ' + match[1]; }],
      [/^Időtartam:\s*(.+)$/u, function (match) { return 'Duration: ' + match[1]; }],
      [/^Deviza:\s*(.+)$/u, function (match) { return 'Currency: ' + match[1]; }],
      [/^Összeg:\s*(.+)$/u, function (match) { return 'Amount: ' + match[1]; }]
    ] : [
      [/^Reference:\s*(.+)$/u, function (match) { return 'Közlemény: ' + match[1]; }],
      [/^Preparing fixed (HUF|EUR) transfer details…$/u, function (match) { return 'A fix ' + match[1] + '-összegű átutalási adatok előkészítése folyamatban van…'; }],
      [/^Payment could not be started:\s*(.+)$/u, function (match) { return 'A fizetés nem indult el: ' + exact(match[1], 'hu'); }],
      [/^The report could not be prepared:\s*(.+)$/u, function (match) { return 'A visszajelzés nem készíthető elő: ' + exact(match[1], 'hu'); }],
      [/^Direct GitHub Pages mode is active\.\s*(.*)$/u, function (match) { return 'Közvetlen GitHub Pages mód aktív. ' + match[1]; }],
      [/^Server-side order tracking is currently unavailable\.$/u, function () { return 'A szerveres rendeléskövetés jelenleg nem elérhető.'; }],
      [/^The order is continuing in direct static mode\.$/u, function () { return 'A rendelés most közvetlen, statikus módban folytatódik.'; }],
      [/^Order reference:\s*(.+)$/u, function (match) { return 'Rendelési azonosító: ' + match[1]; }],
      [/^Plan:\s*(.+)$/u, function (match) { return 'Csomag: ' + match[1]; }],
      [/^Duration:\s*(.+)$/u, function (match) { return 'Időtartam: ' + match[1]; }],
      [/^Currency:\s*(.+)$/u, function (match) { return 'Deviza: ' + match[1]; }],
      [/^Amount:\s*(.+)$/u, function (match) { return 'Összeg: ' + match[1]; }]
    ];

    for (const rule of rules) {
      const match = value.match(rule[0]);
      if (match) return rule[1](match);
    }
    return value;
  }

  function translate(value, targetLanguage) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return value;
    const translated = dynamic(exact(trimmed, targetLanguage), targetLanguage);
    return translated === trimmed ? value : preserveSpace(value, translated);
  }

  function skipped(element) {
    return Boolean(element?.closest('script, style, noscript, code, pre, [data-i18n-control], [data-i18n-skip]'));
  }

  function translateAttributes(element, targetLanguage) {
    ['aria-label', 'title', 'alt', 'placeholder'].forEach(function (name) {
      if (!element.hasAttribute?.(name)) return;
      const before = element.getAttribute(name);
      const after = translate(before, targetLanguage);
      if (after !== before) element.setAttribute(name, after);
    });
  }

  function translateNode(node, targetLanguage) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (skipped(node.parentElement)) return;
      const before = node.nodeValue;
      const after = translate(before, targetLanguage);
      if (after !== before) node.nodeValue = after;
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) return;
    if (node.nodeType === Node.ELEMENT_NODE && skipped(node)) return;
    if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(node, targetLanguage);

    node.querySelectorAll?.('*').forEach(function (element) {
      if (!skipped(element)) translateAttributes(element, targetLanguage);
    });

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      if (skipped(textNode.parentElement)) continue;
      const before = textNode.nodeValue;
      const after = translate(before, targetLanguage);
      if (after !== before) textNode.nodeValue = after;
    }
  }

  function pageName() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function upsertMeta(property, content) {
    let element = document.querySelector('meta[property="' + property + '"]');
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    element.content = content;
  }

  function upsertAlternate(hreflang, href) {
    let link = document.querySelector('link[rel="alternate"][hreflang="' + hreflang + '"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function updateMeta(targetLanguage) {
    const meta = META[pageName()] || META['index.html'];
    document.title = meta[targetLanguage][0];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = meta[targetLanguage][1];
    document.documentElement.lang = targetLanguage;
    upsertMeta('og:title', meta[targetLanguage][0]);
    upsertMeta('og:description', meta[targetLanguage][1]);
    upsertMeta('og:locale', targetLanguage === 'hu' ? 'hu_HU' : 'en_US');

    const base = new URL(window.location.href);
    base.searchParams.delete('lang');
    const hu = new URL(base.href);
    hu.searchParams.set('lang', 'hu');
    const en = new URL(base.href);
    en.searchParams.set('lang', 'en');
    upsertAlternate('hu', hu.href);
    upsertAlternate('en', en.href);
    upsertAlternate('x-default', base.href);
  }

  function updateLinks(targetLanguage) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return;
        url.searchParams.set('lang', targetLanguage);
        link.href = url.pathname + url.search + url.hash;
      } catch (_) {
        // Invalid links are ignored.
      }
    });
  }

  function ensureStylesheet() {
    if (document.querySelector('link[data-formatx-language-style]')) return;
    const ownScript = document.currentScript
      || Array.from(document.scripts).find(function (script) { return /\/i18n\.js(?:\?|$)/.test(script.src); });
    const href = ownScript?.src
      ? new URL('../styles/language.css?v=20260718-bilingual-2', ownScript.src).href
      : './styles/language.css?v=20260718-bilingual-2';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.formatxLanguageStyle = 'true';
    document.head.appendChild(link);
  }

  function makeControl(extraClass) {
    const control = document.createElement('div');
    control.className = 'language-control' + (extraClass ? ' ' + extraClass : '');
    control.dataset.i18nControl = 'true';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Language / Nyelv');
    control.innerHTML = '<button type="button" data-language-choice="hu" title="Magyar">HU</button><button type="button" data-language-choice="en" title="English">EN</button>';
    control.addEventListener('click', function (event) {
      const button = event.target.closest('[data-language-choice]');
      if (button) setLanguage(button.dataset.languageChoice, true);
    });
    return control;
  }

  function installControls() {
    ensureStylesheet();
    const headerActions = document.querySelector('.header-actions');
    const legalHeader = document.querySelector('.legal-header-inner');
    const nav = document.getElementById('primary-nav');

    if (headerActions && !headerActions.querySelector('.language-control')) {
      headerActions.insertBefore(makeControl('desktop-language-control'), headerActions.firstChild);
    } else if (legalHeader && !legalHeader.querySelector('.language-control')) {
      const theme = legalHeader.querySelector('.theme-control');
      legalHeader.insertBefore(makeControl('legal-language-control'), theme || null);
    }
    if (nav && !nav.querySelector('.mobile-language-control')) {
      nav.appendChild(makeControl('mobile-language-control'));
    }
  }

  function updateControls(targetLanguage) {
    document.querySelectorAll('[data-language-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.languageChoice === targetLanguage));
    });
  }

  function setLanguage(targetLanguage, persist) {
    if (!SUPPORTED.has(targetLanguage)) return;
    language = targetLanguage;
    applying = true;

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, targetLanguage);
      } catch (_) {
        // Persistence is optional.
      }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', targetLanguage);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    updateMeta(targetLanguage);
    translateNode(document.body, targetLanguage);
    updateControls(targetLanguage);
    updateLinks(targetLanguage);
    applying = false;
    window.dispatchEvent(new CustomEvent('formatx:languagechange', { detail: { language: targetLanguage } }));
  }

  const observer = new MutationObserver(function (records) {
    if (applying) return;
    records.forEach(function (record) {
      if (record.type === 'characterData') {
        translateNode(record.target, language);
      } else {
        record.addedNodes.forEach(function (node) {
          translateNode(node, language);
        });
      }
    });
  });

  window.FormatXI18n = {
    getLanguage: function () { return language; },
    setLanguage: setLanguage,
    translateDocument: function () { setLanguage(language, false); },
    t: function (hu, en) { return language === 'hu' ? hu : en; }
  };

  installControls();
  setLanguage(language, false);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
}());
