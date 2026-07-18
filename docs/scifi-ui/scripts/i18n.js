(function () {
  'use strict';

  const STORAGE_KEY = 'formatx-language';
  const SUPPORTED = new Set(['hu', 'en']);
  let currentLanguage = resolveLanguage();
  let translating = false;

  const pairs = [
    ['Ugrás a tartalomra', 'Skip to content'],
    ['Menü', 'Menu'],
    ['Sötét', 'Dark'],
    ['Világos', 'Light'],
    ['Megjelenés', 'Appearance'],
    ['Mobil megjelenés', 'Mobile appearance'],
    ['FormatX Suite Pro főoldal', 'FormatX Suite Pro home'],
    ['Vissza a főoldalra', 'Back to home'],
    ['Vissza a licencekhez', 'Back to licences'],
    ['Jogi és támogatási linkek', 'Legal and support links'],

    ['PRODUCT', 'PRODUCT'],
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
    ['ONLINE', 'ONLINE'],
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

    ['Aktuális kiadás', 'Current release'],
    ['Ellenőrzött GitHub Release', 'Verified GitHub Release'],
    ['ELLENŐRZÖTT GITHUB KIADÁS', 'VERIFIED GITHUB RELEASE'],
    ['Kiadási központ →', 'Release center →'],
    ['FormatX alapelvek', 'FormatX principles'],
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

  const pairByText = new Map();
  pairs.forEach(function (pair) {
    pairByText.set(pair[0], pair);
    pairByText.set(pair[1], pair);
  });

  const pageMeta = {
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

  function preserveWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return leading + translated + trailing;
  }

  function translateInterpolated(value, language) {
    const rules = language === 'en' ? [
      [/^Közlemény:\s*(.+)$/u, 'Reference: $1'],
      [/^A fix (HUF|EUR)-összegű átutalási adatok előkészítése folyamatban van…$/u, 'Preparing fixed $1 transfer details…'],
      [/^A fizetés nem indult el:\s*(.+)$/u, 'Payment could not be started: $1'],
      [/^A visszajelzés nem készíthető elő:\s*(.+)$/u, 'The report could not be prepared: $1'],
      [/^Közvetlen GitHub Pages mód aktív\.(.*)$/u, 'Direct GitHub Pages mode is active.$1'],
      [/^Rendelési azonosító:\s*(.+)$/u, 'Order reference: $1'],
      [/^Csomag:\s*(.+)$/u, 'Plan: $1'],
      [/^Időtartam:\s*(.+)$/u, 'Duration: $1'],
      [/^Deviza:\s*(.+)$/u, 'Currency: $1'],
      [/^Összeg:\s*(.+)$/u, 'Amount: $1']
    ] : [
      [/^Reference:\s*(.+)$/u, 'Közlemény: $1'],
      [/^Preparing fixed (HUF|EUR) transfer details…$/u, 'A fix $1-összegű átutalási adatok előkészítése folyamatban van…'],
      [/^Payment could not be started:\s*(.+)$/u, 'A fizetés nem indult el: $1'],
      [/^The report could not be prepared:\s*(.+)$/u, 'A visszajelzés nem készíthető elő: $1'],
      [/^Direct GitHub Pages mode is active\.(.*)$/u, 'Közvetlen GitHub Pages mód aktív.$1'],
      [/^Order reference:\s*(.+)$/u, 'Rendelési azonosító: $1'],
      [/^Plan:\s*(.+)$/u, 'Csomag: $1'],
      [/^Duration:\s*(.+)$/u, 'Időtartam: $1'],
      [/^Currency:\s*(.+)$/u, 'Deviza: $1'],
      [/^Amount:\s*(.+)$/u, 'Összeg: $1']
    ];

    for (const rule of rules) {
      if (rule[0].test(value)) return value.replace(rule[0], rule[1]);
    }
    return value;
  }

  function translateText(value, language) {
    const trimmed = value.trim();
    if (!trimmed) return value;
    const pair = pairByText.get(trimmed);
    if (pair) return preserveWhitespace(value, language === 'hu' ? pair[0] : pair[1]);
    const interpolated = translateInterpolated(trimmed, language);
    return interpolated === trimmed ? value : preserveWhitespace(value, interpolated);
  }

  function shouldSkip(element) {
    if (!element) return false;
    return Boolean(element.closest('script, style, noscript, code, pre, [data-i18n-control], [data-i18n-skip]'));
  }

  function translateAttributes(element, language) {
    ['aria-label', 'title', 'alt', 'placeholder'].forEach(function (attribute) {
      if (!element.hasAttribute?.(attribute)) return;
      const current = element.getAttribute(attribute);
      const translated = translateText(current, language);
      if (translated !== current) element.setAttribute(attribute, translated);
    });
  }

  function translateSubtree(root, language) {
    if (!root) return;
    translating = true;
    try {
      if (root.nodeType === Node.TEXT_NODE) {
        if (!shouldSkip(root.parentElement)) root.nodeValue = translateText(root.nodeValue, language);
        return;
      }

      if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
      if (root.nodeType === Node.ELEMENT_NODE && shouldSkip(root)) return;

      if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root, language);
      root.querySelectorAll?.('*').forEach(function (element) {
        if (!shouldSkip(element)) translateAttributes(element, language);
      });

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!shouldSkip(node.parentElement)) node.nodeValue = translateText(node.nodeValue, language);
      }
    } finally {
      queueMicrotask(function () { translating = false; });
    }
  }

  function pageName() {
    const name = window.location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function updateMeta(language) {
    const meta = pageMeta[pageName()] || pageMeta['index.html'];
    document.title = meta[language][0];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = meta[language][1];
    document.documentElement.lang = language;
  }

  function updateInternalLinks(language) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return;
        url.searchParams.set('lang', language);
        link.href = url.pathname + url.search + url.hash;
      } catch (_) {
        // Invalid links are ignored.
      }
    });
  }

  function styleControls() {
    if (document.getElementById('formatx-language-style')) return;
    const style = document.createElement('style');
    style.id = 'formatx-language-style';
    style.textContent = `
      .language-control{display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid rgba(88,238,255,.24);border-radius:9px;background:rgba(3,13,22,.72);box-shadow:inset 0 0 18px rgba(88,238,255,.04)}
      .language-control button{min-width:38px;min-height:31px;padding:0 9px;color:#86a7b6;border:0;border-radius:6px;background:transparent;font:700 10px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.09em;cursor:pointer}
      .language-control button[aria-pressed="true"]{color:#041119;background:linear-gradient(110deg,#58eeff,#84b8ff 52%,#c46dff);box-shadow:0 0 18px rgba(88,238,255,.2)}
      .mobile-language-control{display:none;margin-top:10px}
      .legal-header-inner .language-control{margin-left:auto}
      @media(max-width:980px){.header-actions>.language-control{display:none}.mobile-language-control{display:inline-flex}.legal-header-inner{gap:10px;flex-wrap:wrap}.legal-header-inner .language-control{order:3;margin-left:0}.legal-header-inner .theme-control{order:4}}
      @media(max-width:560px){.legal-header-inner .legal-home-link{order:2}.legal-header-inner .language-control{order:3}.language-control button{min-width:42px}}
    `;
    document.head.appendChild(style);
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
    styleControls();
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

  function updateControls(language) {
    document.querySelectorAll('[data-language-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.languageChoice === language));
    });
  }

  function setLanguage(language, persist) {
    if (!SUPPORTED.has(language)) return;
    currentLanguage = language;
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch (_) {
        // Persistence is optional.
      }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    updateMeta(language);
    translateSubtree(document.body, language);
    updateControls(language);
    updateInternalLinks(language);
    window.dispatchEvent(new CustomEvent('formatx:languagechange', { detail: { language: language } }));
  }

  const observer = new MutationObserver(function (records) {
    if (translating) return;
    records.forEach(function (record) {
      if (record.type === 'characterData') {
        translateSubtree(record.target, currentLanguage);
      } else {
        record.addedNodes.forEach(function (node) {
          translateSubtree(node, currentLanguage);
        });
      }
    });
  });

  window.FormatXI18n = {
    getLanguage: function () { return currentLanguage; },
    setLanguage: setLanguage,
    translateDocument: function () { setLanguage(currentLanguage, false); },
    t: function (hu, en) { return currentLanguage === 'hu' ? hu : en; }
  };

  installControls();
  setLanguage(currentLanguage, false);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
}());
