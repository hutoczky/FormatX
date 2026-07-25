package hu.formatx.mobile;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.documentfile.provider.DocumentFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public final class MainActivity extends Activity {
    private static final String USB_PERMISSION_ACTION = "hu.formatx.mobile.USB_PERMISSION";
    private static final String PREFERENCES = "formatx-native-settings";
    private static final int CURRENT_VERSION_CODE = 110;

    private static final int REQUEST_IMAGE = 1001;
    private static final int REQUEST_LEFT_TREE = 1002;
    private static final int REQUEST_RIGHT_TREE = 1003;
    private static final int REQUEST_CREATE_ZIP = 1004;
    private static final int REQUEST_OPEN_ZIP = 1005;
    private static final int REQUEST_INTEGRITY_DATA = 1006;
    private static final int REQUEST_PUBLIC_KEY = 1007;
    private static final int REQUEST_SIGNATURE = 1008;
    private static final int REQUEST_EXPORT_LOG = 1009;

    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean cancellation = new AtomicBoolean(false);

    private SharedPreferences preferences;
    private boolean hungarian;
    private boolean dark;
    private boolean receiverRegistered;
    private boolean operationRunning;

    private FrameLayout content;
    private TextView headerState;
    private TextView globalMessage;
    private ProgressBar globalProgress;
    private Button cancelButton;

    private Uri selectedImageUri;
    private Uri integrityDataUri;
    private Uri integrityPublicKeyUri;
    private Uri integritySignatureUri;

    private final List<UsbDevice> usbDevices = new ArrayList<>();
    private UsbDevice selectedUsbDevice;
    private Runnable pendingUsbPermissionAction;

    private DocumentFile leftDirectory;
    private DocumentFile rightDirectory;
    private DocumentFile leftSelection;
    private DocumentFile rightSelection;
    private DocumentFile pendingZipSource;
    private DocumentFile pendingUnzipTarget;
    private List<DocumentFile> leftItems = new ArrayList<>();
    private List<DocumentFile> rightItems = new ArrayList<>();

    private final BroadcastReceiver usbPermissionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (!USB_PERMISSION_ACTION.equals(intent.getAction())) return;
            UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
            boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);
            Runnable action = pendingUsbPermissionAction;
            pendingUsbPermissionAction = null;
            if (granted && device != null && action != null) {
                action.run();
            } else {
                showStatus(t("Az USB-hozzáférést nem engedélyezted.", "USB access was not granted."), 0);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        preferences = getSharedPreferences(PREFERENCES, MODE_PRIVATE);
        hungarian = "hu".equals(preferences.getString("language", defaultLanguage()));
        dark = resolveDarkMode(preferences.getString("theme", "system"));
        applyWindowAppearance();
        registerUsbReceiver();
        restoreDirectories();
        setContentView(buildShell());
        showDashboard();
        OperationLog.append(this, "app_start", "ok", "FormatX Native Android 1.1.0");
    }

    private View buildShell() {
        LinearLayout root = vertical();
        root.setBackgroundColor(backgroundColor());

        LinearLayout header = horizontal();
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(18), dp(14), dp(18), dp(12));
        header.setBackground(panelBackground(0xFF091A34, 0xFFF4F7FB, accentColor(), 0));

        LinearLayout brand = vertical();
        TextView title = text("FORMATX", 20, true);
        title.setLetterSpacing(0.12f);
        brand.addView(title);
        TextView subtitle = muted(t("NATÍV ANDROID · 1.1.0", "NATIVE ANDROID · 1.1.0"), 10);
        subtitle.setLetterSpacing(0.10f);
        brand.addView(subtitle);
        header.addView(brand, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));

        headerState = muted(t("KÉSZENLÉT", "READY"), 10);
        headerState.setGravity(Gravity.END);
        header.addView(headerState);
        root.addView(header, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        content = new FrameLayout(this);
        root.addView(content, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1
        ));

        LinearLayout operationBar = vertical();
        operationBar.setPadding(dp(14), dp(8), dp(14), dp(8));
        operationBar.setBackgroundColor(dark ? 0xFF051024 : 0xFFF0F4FA);
        globalProgress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        globalProgress.setMax(100);
        globalProgress.setProgressTintList(ColorStateList.valueOf(accentColor()));
        globalProgress.setProgressBackgroundTintList(ColorStateList.valueOf(dark ? 0xFF173150 : 0xFFD7E0EC));
        operationBar.addView(globalProgress, match(dp(5)));

        LinearLayout statusRow = horizontal();
        statusRow.setGravity(Gravity.CENTER_VERTICAL);
        globalMessage = muted(t("Nincs aktív művelet.", "No active operation."), 11);
        statusRow.addView(globalMessage, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        cancelButton = compactButton(t("LEÁLLÍTÁS", "CANCEL"), view -> cancellation.set(true));
        cancelButton.setVisibility(View.GONE);
        statusRow.addView(cancelButton);
        operationBar.addView(statusRow);
        root.addView(operationBar);

        HorizontalScrollView navScroll = new HorizontalScrollView(this);
        navScroll.setHorizontalScrollBarEnabled(false);
        LinearLayout nav = horizontal();
        nav.setPadding(dp(8), dp(7), dp(8), dp(9));
        nav.setBackgroundColor(dark ? 0xFF020814 : 0xFFFFFFFF);
        nav.addView(navButton("⌂", t("Kezdőlap", "Home"), view -> showDashboard()));
        nav.addView(navButton("⇩", "ISO → USB", view -> showIsoUsb()));
        nav.addView(navButton("▥", t("Fájlok", "Files"), view -> showFileManager()));
        nav.addView(navButton("◉", t("USB-eszközök", "USB tools"), view -> showUsbTools()));
        nav.addView(navButton("✓", t("Integritás", "Integrity"), view -> showIntegrity()));
        nav.addView(navButton("⚙", t("Beállítások", "Settings"), view -> showSettings()));
        navScroll.addView(nav);
        root.addView(navScroll, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        return root;
    }

    private void showDashboard() {
        LinearLayout page = page(t("Natív technikusi központ", "Native technician centre"),
                t("Ez az alkalmazás nem weboldalt jelenít meg. A műveleteket közvetlenül az Android végzi.",
                        "This application does not display a website. Android executes the operations directly."));

        LinearLayout modules = vertical();
        modules.addView(actionCard("⇩", "ISO → USB",
                t("Rendszerkép vizsgálata, SHA-256, OTG USB-írás és visszaellenőrzés.",
                        "Image inspection, SHA-256, OTG USB writing and read-back verification."),
                view -> showIsoUsb()));
        modules.addView(actionCard("▥", t("Kétpaneles fájlkezelő", "Dual-pane file manager"),
                t("SAF-alapú másolás, áthelyezés, törlés, mappa, ZIP és kibontás.",
                        "SAF-based copy, move, delete, folders, ZIP and extraction."),
                view -> showFileManager()));
        modules.addView(actionCard("◉", t("USB-vizsgálat és törlés", "USB scan and erase"),
                t("Nyers felületi olvasás, gyors metaadat-törlés és teljes felülírás.",
                        "Raw surface read, quick metadata erase and full overwrite."),
                view -> showUsbTools()));
        modules.addView(actionCard("✓", t("Integritás", "Integrity"),
                t("SHA-256, ISO/MBR/GPT/El Torito elemzés és Ed25519-ellenőrzés.",
                        "SHA-256, ISO/MBR/GPT/El Torito inspection and Ed25519 verification."),
                view -> showIntegrity()));
        page.addView(modules);

        TextView diagnostics = outputText();
        diagnostics.setText(DeviceDiagnostics.collect(this, hungarian));
        Button refresh = primaryButton(t("DIAGNOSZTIKA FRISSÍTÉSE", "REFRESH DIAGNOSTICS"),
                view -> diagnostics.setText(DeviceDiagnostics.collect(this, hungarian)));
        page.addView(section(t("Rendszerdiagnosztika", "System diagnostics"), refresh, diagnostics));

        TextView limitation = muted(t(
                "Az Android biztonsági modellje miatt a telefon belső fizikai lemeze, SMART-parancsai, NTFS/ReFS formázása és rendszerpartíciói nem érhetők el normál alkalmazásból. A nyers lemezfunkciók kizárólag támogatott OTG USB-tárolón működnek.",
                "Android's security model does not expose the phone's internal physical disk, SMART commands, NTFS/ReFS formatting or system partitions to a normal app. Raw disk functions operate only on supported OTG USB storage."), 12);
        page.addView(warningCard(limitation));
        setPage(page);
    }

    private void showIsoUsb() {
        LinearLayout page = page("ISO → USB",
                t("Rendszerképet ír egy támogatott OTG USB-tároló teljes blokkeszközére.",
                        "Writes a system image to the complete block device of supported OTG USB storage."));

        TextView imageState = outputText();
        imageState.setText(selectedImageUri == null
                ? t("Nincs kiválasztott rendszerkép.", "No image selected.")
                : IntegrityTools.displayName(getContentResolver(), selectedImageUri));

        LinearLayout imageActions = buttonRow();
        imageActions.addView(primaryButton(t("KÉP KIVÁLASZTÁSA", "SELECT IMAGE"),
                view -> openDocument(REQUEST_IMAGE, new String[]{"application/x-iso9660-image", "application/octet-stream", "*/*"})));
        imageActions.addView(secondaryButton(t("ELEMZÉS", "INSPECT"), view -> inspectSelectedImage(imageState)));
        imageActions.addView(secondaryButton("SHA-256", view -> hashSelectedImage(imageState)));
        page.addView(section(t("Forráskép", "Source image"), imageActions, imageState));

        Spinner usbSpinner = spinner();
        Button refreshUsb = secondaryButton(t("USB-LISTA FRISSÍTÉSE", "REFRESH USB LIST"),
                view -> refreshUsbSpinner(usbSpinner));
        refreshUsbSpinner(usbSpinner);
        page.addView(section(t("Cél USB-tároló", "Target USB storage"), refreshUsb, usbSpinner));

        CheckBox verify = new CheckBox(this);
        verify.setText(t("Írás után teljes visszaellenőrzés", "Full read-back verification after writing"));
        verify.setTextColor(textColor());
        verify.setChecked(true);
        page.addView(verify);

        TextView warning = muted(t(
                "A művelet a kiválasztott USB teljes tartalmát felülírja. A telefon belső tárhelye nem választható célként.",
                "The operation overwrites the complete selected USB device. Internal phone storage cannot be selected as a target."), 12);
        page.addView(warningCard(warning));

        Button write = dangerButton(t("ISO ÍRÁSA AZ USB-RE", "WRITE IMAGE TO USB"), view -> {
            if (selectedImageUri == null) {
                toast(t("Előbb válassz rendszerképet.", "Select an image first."));
                return;
            }
            selectedUsbDevice = selectedUsbFrom(usbSpinner);
            if (selectedUsbDevice == null) {
                toast(t("Nincs kiválasztott támogatott USB-tároló.", "No supported USB storage is selected."));
                return;
            }
            confirmDestructive(
                    t("USB teljes felülírása", "Overwrite complete USB device"),
                    t("Írd be: TÖRLÉS. Csak ezután indul el a nyers lemezírás.",
                            "Type: ERASE. Raw disk writing starts only after this confirmation."),
                    hungarian ? "TÖRLÉS" : "ERASE",
                    () -> runUsbTask("iso_write", selectedUsbDevice, device -> {
                        UsbOperations.ImageWriteResult result = UsbOperations.writeImage(
                                this,
                                selectedImageUri,
                                device,
                                verify.isChecked(),
                                cancellation,
                                this::postProgress
                        );
                        OperationLog.append(this, "iso_write", "ok",
                                RawUsbMassStorageDevice.displayName(selectedUsbDevice)
                                        + " · " + result.sourceBytes + " B · " + result.sourceSha256);
                        postStatus(t("Az ISO-írás sikeresen elkészült.", "Image writing completed successfully."), 100);
                    })
            );
        });
        page.addView(write, spacedMatch());
        setPage(page);
    }

    private void inspectSelectedImage(TextView output) {
        if (selectedImageUri == null) {
            toast(t("Nincs kiválasztott fájl.", "No file is selected."));
            return;
        }
        execute("image_inspect", () -> {
            IntegrityTools.ImageInfo info = IntegrityTools.inspectImage(this, selectedImageUri);
            ui.post(() -> output.setText(info.summary(hungarian)));
        });
    }

    private void hashSelectedImage(TextView output) {
        if (selectedImageUri == null) {
            toast(t("Nincs kiválasztott fájl.", "No file is selected."));
            return;
        }
        execute("sha256", () -> {
            String hash = IntegrityTools.sha256(this, selectedImageUri,
                    (processed, total) -> postProgress(percent(processed, total),
                            "SHA-256 · " + UsbOperations.humanBytes(processed)));
            ui.post(() -> output.append("\n\nSHA-256\n" + hash));
            OperationLog.append(this, "sha256", "ok", hash);
        });
    }

    private void showFileManager() {
        LinearLayout page = page(t("Kétpaneles fájlkezelő", "Dual-pane file manager"),
                t("A felhasználó által jóváhagyott mappákkal dolgozik. Nincs teljes tárhely-hozzáférési engedély.",
                        "Works with folders approved by the user. It does not request unrestricted storage access."));

        LinearLayout pickers = buttonRow();
        pickers.addView(primaryButton(t("BAL MAPPA", "LEFT FOLDER"), view -> openTree(REQUEST_LEFT_TREE)));
        pickers.addView(primaryButton(t("JOBB MAPPA", "RIGHT FOLDER"), view -> openTree(REQUEST_RIGHT_TREE)));
        page.addView(pickers);

        TextView leftSelected = muted(selectionText(leftSelection), 11);
        ListView leftList = createFileList();
        bindPane(leftList, true, leftSelected);
        LinearLayout leftHeader = buttonRow();
        leftHeader.addView(secondaryButton("← " + t("FEL", "UP"), view -> goParent(true)));
        leftHeader.addView(secondaryButton("+ " + t("MAPPA", "FOLDER"), view -> promptFolder(true)));
        page.addView(section("A · " + directoryName(leftDirectory), leftHeader, leftSelected, leftList));

        TextView rightSelected = muted(selectionText(rightSelection), 11);
        ListView rightList = createFileList();
        bindPane(rightList, false, rightSelected);
        LinearLayout rightHeader = buttonRow();
        rightHeader.addView(secondaryButton("← " + t("FEL", "UP"), view -> goParent(false)));
        rightHeader.addView(secondaryButton("+ " + t("MAPPA", "FOLDER"), view -> promptFolder(false)));
        page.addView(section("B · " + directoryName(rightDirectory), rightHeader, rightSelected, rightList));

        LinearLayout transfer = buttonRow();
        transfer.addView(primaryButton("A → B", view -> transferSelection(true, false)));
        transfer.addView(primaryButton("B → A", view -> transferSelection(false, false)));
        transfer.addView(secondaryButton(t("A → B ÁTHELYEZÉS", "MOVE A → B"), view -> transferSelection(true, true)));
        transfer.addView(secondaryButton(t("B → A ÁTHELYEZÉS", "MOVE B → A"), view -> transferSelection(false, true)));
        page.addView(transfer);

        LinearLayout tools = buttonRow();
        tools.addView(dangerButton(t("A TÖRLÉSE", "DELETE A"), view -> deleteSelection(true)));
        tools.addView(dangerButton(t("B TÖRLÉSE", "DELETE B"), view -> deleteSelection(false)));
        tools.addView(secondaryButton(t("A → ZIP", "ZIP A"), view -> createZipFrom(true)));
        tools.addView(secondaryButton(t("B → ZIP", "ZIP B"), view -> createZipFrom(false)));
        tools.addView(secondaryButton(t("ZIP → A", "UNZIP TO A"), view -> selectZipFor(false)));
        tools.addView(secondaryButton(t("ZIP → B", "UNZIP TO B"), view -> selectZipFor(true)));
        page.addView(tools);

        TextView note = muted(t(
                "Mappa megnyitása: koppintás. Mappa kijelölése másoláshoz: hosszan nyomás. Fájl kijelölése: koppintás.",
                "Open a folder: tap. Select a folder for operations: long press. Select a file: tap."), 11);
        page.addView(note);
        setPage(page);
    }

    private void bindPane(ListView list, boolean left, TextView selectionLabel) {
        DocumentFile directory = left ? leftDirectory : rightDirectory;
        List<DocumentFile> items = directory == null ? new ArrayList<>() : StorageTools.sortedChildren(directory);
        if (left) leftItems = items; else rightItems = items;
        List<String> labels = new ArrayList<>();
        for (DocumentFile item : items) {
            labels.add((item.isDirectory() ? "▣  " : "•  ") + StorageTools.describe(item));
        }
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, labels) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                TextView view = (TextView) super.getView(position, convertView, parent);
                view.setTextColor(textColor());
                view.setTextSize(13);
                view.setPadding(dp(12), dp(9), dp(12), dp(9));
                return view;
            }
        };
        list.setAdapter(adapter);
        list.setOnItemClickListener((parent, view, position, id) -> {
            DocumentFile item = items.get(position);
            if (item.isDirectory()) {
                if (left) {
                    leftDirectory = item;
                    leftSelection = null;
                } else {
                    rightDirectory = item;
                    rightSelection = null;
                }
                showFileManager();
            } else {
                if (left) leftSelection = item; else rightSelection = item;
                selectionLabel.setText(selectionText(item));
            }
        });
        list.setOnItemLongClickListener((parent, view, position, id) -> {
            DocumentFile item = items.get(position);
            if (left) leftSelection = item; else rightSelection = item;
            selectionLabel.setText(selectionText(item));
            return true;
        });
    }

    private void goParent(boolean left) {
        DocumentFile current = left ? leftDirectory : rightDirectory;
        DocumentFile parent = current == null ? null : current.getParentFile();
        if (parent != null && parent.canRead()) {
            if (left) leftDirectory = parent; else rightDirectory = parent;
            showFileManager();
        }
    }

    private void promptFolder(boolean left) {
        DocumentFile directory = left ? leftDirectory : rightDirectory;
        if (directory == null) {
            toast(t("Előbb válassz mappát.", "Select a folder first."));
            return;
        }
        EditText input = dialogInput(t("Új mappa", "New folder"));
        new AlertDialog.Builder(this)
                .setTitle(t("Mappa létrehozása", "Create folder"))
                .setView(input)
                .setPositiveButton(t("LÉTREHOZÁS", "CREATE"), (dialog, which) -> execute("create_folder", () -> {
                    StorageTools.createFolder(directory, input.getText().toString());
                    ui.post(this::showFileManager);
                }))
                .setNegativeButton(t("MÉGSE", "CANCEL"), null)
                .show();
    }

    private void transferSelection(boolean fromLeft, boolean move) {
        DocumentFile source = fromLeft ? leftSelection : rightSelection;
        DocumentFile destination = fromLeft ? rightDirectory : leftDirectory;
        if (source == null || destination == null) {
            toast(t("A forráskijelölés és a célmappa is szükséges.",
                    "A source selection and destination folder are required."));
            return;
        }
        execute(move ? "move" : "copy", () -> {
            StorageTools.copy(this, source, destination, move, message -> postProgress(0, message));
            if (fromLeft) leftSelection = null; else rightSelection = null;
            OperationLog.append(this, move ? "move" : "copy", "ok", source.getName());
            ui.post(this::showFileManager);
        });
    }

    private void deleteSelection(boolean left) {
        DocumentFile selected = left ? leftSelection : rightSelection;
        if (selected == null) {
            toast(t("Nincs kijelölt elem.", "No item is selected."));
            return;
        }
        confirmDestructive(
                t("Elem törlése", "Delete item"),
                t("A kijelölt elem és minden almappája törlődik. Írd be: TÖRLÉS",
                        "The selected item and all subfolders will be deleted. Type: ERASE"),
                hungarian ? "TÖRLÉS" : "ERASE",
                () -> execute("delete", () -> {
                    if (!StorageTools.deleteRecursive(selected)) throw new Exception("Delete failed");
                    if (left) leftSelection = null; else rightSelection = null;
                    OperationLog.append(this, "delete", "ok", selected.getName());
                    ui.post(this::showFileManager);
                })
        );
    }

    private void createZipFrom(boolean left) {
        pendingZipSource = left ? leftSelection : rightSelection;
        if (pendingZipSource == null) {
            toast(t("Nincs kijelölt elem.", "No item is selected."));
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                .addCategory(Intent.CATEGORY_OPENABLE)
                .setType("application/zip")
                .putExtra(Intent.EXTRA_TITLE, safeFileName(pendingZipSource.getName()) + ".zip");
        startActivityForResult(intent, REQUEST_CREATE_ZIP);
    }

    private void selectZipFor(boolean rightTarget) {
        pendingUnzipTarget = rightTarget ? rightDirectory : leftDirectory;
        if (pendingUnzipTarget == null) {
            toast(t("Előbb válassz célmappát.", "Select a destination folder first."));
            return;
        }
        openDocument(REQUEST_OPEN_ZIP, new String[]{"application/zip", "application/octet-stream"});
    }

    private void showUsbTools() {
        LinearLayout page = page(t("USB-vizsgálat és törlés", "USB scan and erase"),
                t("Csak támogatott USB Mass Storage / SCSI Bulk-Only OTG-eszközzel működik.",
                        "Works only with supported USB Mass Storage / SCSI Bulk-Only OTG devices."));

        Spinner usbSpinner = spinner();
        refreshUsbSpinner(usbSpinner);
        Button refresh = secondaryButton(t("USB-LISTA FRISSÍTÉSE", "REFRESH USB LIST"),
                view -> refreshUsbSpinner(usbSpinner));
        page.addView(section(t("USB-eszköz", "USB device"), refresh, usbSpinner));

        TextView info = outputText();
        Button query = primaryButton(t("ESZKÖZADATOK LEKÉRÉSE", "READ DEVICE INFO"), view -> {
            selectedUsbDevice = selectedUsbFrom(usbSpinner);
            runUsbTask("usb_info", selectedUsbDevice, device -> {
                String result = RawUsbMassStorageDevice.displayName(device.getUsbDevice()) + "\n"
                        + t("Blokkméret: ", "Block size: ") + device.getBlockSize() + " B\n"
                        + t("Kapacitás: ", "Capacity: ") + UsbOperations.humanBytes(device.getCapacityBytes());
                ui.post(() -> info.setText(result));
            });
        });
        page.addView(section(t("Blokkeszköz-adatok", "Block-device information"), query, info));

        EditText scanAmount = editText(t("Vizsgálandó MB; 0 = teljes eszköz", "MB to scan; 0 = full device"));
        scanAmount.setInputType(InputType.TYPE_CLASS_NUMBER);
        scanAmount.setText("1024");
        Button scan = primaryButton(t("FELÜLETI OLVASÁSI TESZT", "SURFACE READ TEST"), view -> {
            selectedUsbDevice = selectedUsbFrom(usbSpinner);
            long mib = parseLong(scanAmount.getText().toString(), 1024L);
            long bytes = mib <= 0 ? 0 : mib * 1024L * 1024L;
            runUsbTask("surface_scan", selectedUsbDevice, device -> {
                UsbOperations.ScanResult result = UsbOperations.surfaceScan(
                        device, bytes, cancellation, this::postProgress);
                String summary = t("Sikeres vizsgálat: ", "Successful scan: ")
                        + UsbOperations.humanBytes(result.scannedBytes)
                        + String.format(Locale.ROOT, " · %.2f MiB/s", result.mibPerSecond);
                ui.post(() -> info.setText(summary));
                OperationLog.append(this, "surface_scan", "ok", summary);
            });
        });
        page.addView(section(t("Felületi vizsgálat", "Surface scan"), scan, scanAmount));

        Spinner eraseMode = spinner();
        eraseMode.setAdapter(simpleAdapter(new String[]{
                t("Gyors metaadat-törlés: első és utolsó 16 MB", "Quick metadata erase: first and last 16 MB"),
                t("Teljes nullás felülírás", "Full zero overwrite"),
                t("Teljes véletlen felülírás", "Full random overwrite")
        }));
        Button erase = dangerButton(t("USB TÖRLÉS INDÍTÁSA", "START USB ERASE"), view -> {
            selectedUsbDevice = selectedUsbFrom(usbSpinner);
            UsbOperations.EraseMode mode = eraseMode.getSelectedItemPosition() == 1
                    ? UsbOperations.EraseMode.FULL_ZERO
                    : eraseMode.getSelectedItemPosition() == 2
                    ? UsbOperations.EraseMode.FULL_RANDOM
                    : UsbOperations.EraseMode.QUICK_METADATA;
            confirmDestructive(
                    t("Visszavonhatatlan USB-törlés", "Irreversible USB erase"),
                    t("Írd be: TÖRLÉS. Flash-tárolón a vezérlő kopáskiegyenlítése miatt egyetlen felülírás nem jelent minden esetben laboratóriumi szintű megsemmisítést.",
                            "Type: ERASE. Because flash controllers use wear levelling, a single overwrite is not always equivalent to laboratory-grade destruction."),
                    hungarian ? "TÖRLÉS" : "ERASE",
                    () -> runUsbTask("usb_erase", selectedUsbDevice, device -> {
                        UsbOperations.erase(device, mode, cancellation, this::postProgress);
                        OperationLog.append(this, "usb_erase", "ok",
                                RawUsbMassStorageDevice.displayName(device.getUsbDevice()) + " · " + mode);
                    })
            );
        });
        page.addView(section(t("Adattörlés", "Data erase"), erase, eraseMode));
        setPage(page);
    }

    private void showIntegrity() {
        LinearLayout page = page(t("Integritás-ellenőrzés", "Integrity verification"),
                t("A vizsgálat helyben fut. A kiválasztott fájl nem kerül feltöltésre.",
                        "Verification runs locally. The selected file is not uploaded."));

        TextView dataState = outputText();
        dataState.setText(uriName(integrityDataUri));
        LinearLayout dataButtons = buttonRow();
        dataButtons.addView(primaryButton(t("FÁJL KIVÁLASZTÁSA", "SELECT FILE"),
                view -> openDocument(REQUEST_INTEGRITY_DATA, new String[]{"*/*"})));
        dataButtons.addView(secondaryButton("SHA-256", view -> {
            if (integrityDataUri == null) {
                toast(t("Nincs kiválasztott fájl.", "No file is selected."));
                return;
            }
            execute("integrity_sha256", () -> {
                String hash = IntegrityTools.sha256(this, integrityDataUri,
                        (processed, total) -> postProgress(percent(processed, total), "SHA-256"));
                ui.post(() -> dataState.setText(uriName(integrityDataUri) + "\n\nSHA-256\n" + hash));
            });
        }));
        dataButtons.addView(secondaryButton(t("KÉPELEMZÉS", "IMAGE INSPECTION"), view -> {
            if (integrityDataUri == null) return;
            execute("integrity_inspect", () -> {
                IntegrityTools.ImageInfo info = IntegrityTools.inspectImage(this, integrityDataUri);
                ui.post(() -> dataState.setText(info.summary(hungarian)));
            });
        }));
        page.addView(section(t("Vizsgált fájl", "Data file"), dataButtons, dataState));

        TextView keyState = muted(t("Nyilvános kulcs: ", "Public key: ") + uriName(integrityPublicKeyUri), 11);
        TextView signatureState = muted(t("Aláírás: ", "Signature: ") + uriName(integritySignatureUri), 11);
        LinearLayout signatureButtons = buttonRow();
        signatureButtons.addView(secondaryButton(t("ED25519 KULCS", "ED25519 KEY"),
                view -> openDocument(REQUEST_PUBLIC_KEY, new String[]{"*/*"})));
        signatureButtons.addView(secondaryButton(t("ALÁÍRÁS", "SIGNATURE"),
                view -> openDocument(REQUEST_SIGNATURE, new String[]{"*/*"})));
        signatureButtons.addView(primaryButton(t("ELLENŐRZÉS", "VERIFY"), view -> {
            if (integrityDataUri == null || integrityPublicKeyUri == null || integritySignatureUri == null) {
                toast(t("A fájl, a nyilvános kulcs és az aláírás is szükséges.",
                        "The data file, public key and signature are all required."));
                return;
            }
            execute("ed25519_verify", () -> {
                boolean valid = IntegrityTools.verifyEd25519(
                        this, integrityDataUri, integrityPublicKeyUri, integritySignatureUri);
                String result = valid
                        ? t("ÉRVÉNYES ED25519 ALÁÍRÁS", "VALID ED25519 SIGNATURE")
                        : t("HIBÁS ED25519 ALÁÍRÁS", "INVALID ED25519 SIGNATURE");
                OperationLog.append(this, "ed25519_verify", valid ? "valid" : "invalid", uriName(integrityDataUri));
                postStatus(result, valid ? 100 : 0);
            });
        }));
        page.addView(section("Ed25519", signatureButtons, keyState, signatureState));
        setPage(page);
    }

    private void showSettings() {
        LinearLayout page = page(t("Beállítások és napló", "Settings and log"),
                t("A nyelv, a téma, a frissítés és a helyi műveleti napló kezelése.",
                        "Language, theme, updates and the local operation log."));

        Spinner language = spinner();
        language.setAdapter(simpleAdapter(new String[]{"Magyar", "English"}));
        language.setSelection(hungarian ? 0 : 1);
        Spinner theme = spinner();
        theme.setAdapter(simpleAdapter(new String[]{
                t("Rendszer", "System"),
                t("Sötét", "Dark"),
                t("Világos", "Light")
        }));
        String currentTheme = preferences.getString("theme", "system");
        theme.setSelection("dark".equals(currentTheme) ? 1 : "light".equals(currentTheme) ? 2 : 0);
        Button apply = primaryButton(t("BEÁLLÍTÁSOK ALKALMAZÁSA", "APPLY SETTINGS"), view -> {
            preferences.edit()
                    .putString("language", language.getSelectedItemPosition() == 0 ? "hu" : "en")
                    .putString("theme", theme.getSelectedItemPosition() == 1 ? "dark"
                            : theme.getSelectedItemPosition() == 2 ? "light" : "system")
                    .apply();
            recreate();
        });
        page.addView(section(t("Megjelenés", "Appearance"), apply, language, theme));

        TextView updateState = outputText();
        updateState.setText(t("Natív Android-verzió: 1.1.0 (110)", "Native Android version: 1.1.0 (110)"));
        Button checkUpdate = primaryButton(t("FRISSÍTÉS ELLENŐRZÉSE", "CHECK FOR UPDATE"), view -> execute("update_check", () -> {
            UpdateClient.Result result = UpdateClient.fetch();
            ui.post(() -> {
                String text = t("Elérhető verzió: ", "Available version: ") + result.versionName
                        + " (" + result.versionCode + ")\nSHA-256: " + result.sha256 + "\n\n" + result.notes;
                updateState.setText(text);
                if (result.versionCode > CURRENT_VERSION_CODE) {
                    new AlertDialog.Builder(this)
                            .setTitle(t("Frissítés érhető el", "Update available"))
                            .setMessage(text)
                            .setPositiveButton(t("APK LETÖLTÉSE", "DOWNLOAD APK"), (dialog, which) -> {
                                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(result.apkUrl));
                                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                                startActivity(intent);
                            })
                            .setNegativeButton(t("KÉSŐBB", "LATER"), null)
                            .show();
                }
            });
        }));
        page.addView(section(t("Frissítés", "Update"), checkUpdate, updateState));

        TextView log = outputText();
        log.setText(OperationLog.recent(this, 100));
        LinearLayout logButtons = buttonRow();
        logButtons.addView(secondaryButton(t("NAPLÓ FRISSÍTÉSE", "REFRESH LOG"),
                view -> log.setText(OperationLog.recent(this, 100))));
        logButtons.addView(primaryButton(t("CSV EXPORT", "EXPORT CSV"), view -> {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                    .addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("text/csv")
                    .putExtra(Intent.EXTRA_TITLE, "formatx-native-log.csv");
            startActivityForResult(intent, REQUEST_EXPORT_LOG);
        }));
        logButtons.addView(dangerButton(t("NAPLÓ TÖRLÉSE", "CLEAR LOG"), view -> confirmDestructive(
                t("Napló törlése", "Clear log"),
                t("Írd be: TÖRLÉS", "Type: ERASE"),
                hungarian ? "TÖRLÉS" : "ERASE",
                () -> {
                    OperationLog.clear(this);
                    log.setText("");
                }
        )));
        page.addView(section(t("Helyi műveleti napló", "Local operation log"), logButtons, log));

        TextView about = muted(t(
                "FormatX Native Android 1.1.0\nCsomag: hu.formatx.mobile\nNincs WebView. Nincs MANAGE_EXTERNAL_STORAGE. Nyers írás csak OTG USB-tárolóra.",
                "FormatX Native Android 1.1.0\nPackage: hu.formatx.mobile\nNo WebView. No MANAGE_EXTERNAL_STORAGE. Raw writes target OTG USB storage only."), 12);
        page.addView(warningCard(about));
        setPage(page);
    }

    private void refreshUsbSpinner(Spinner spinner) {
        String previous = selectedUsbDevice == null ? null : selectedUsbDevice.getDeviceName();
        usbDevices.clear();
        usbDevices.addAll(RawUsbMassStorageDevice.discover(this));
        List<String> names = new ArrayList<>();
        for (UsbDevice device : usbDevices) names.add(RawUsbMassStorageDevice.displayName(device));
        if (names.isEmpty()) names.add(t("Nincs támogatott OTG USB-tároló", "No supported OTG USB storage"));
        spinner.setAdapter(simpleAdapter(names.toArray(new String[0])));
        if (previous != null) {
            for (int index = 0; index < usbDevices.size(); index++) {
                if (previous.equals(usbDevices.get(index).getDeviceName())) {
                    spinner.setSelection(index);
                    break;
                }
            }
        }
        spinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                selectedUsbDevice = position >= 0 && position < usbDevices.size() ? usbDevices.get(position) : null;
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
                selectedUsbDevice = null;
            }
        });
    }

    private UsbDevice selectedUsbFrom(Spinner spinner) {
        int position = spinner.getSelectedItemPosition();
        return position >= 0 && position < usbDevices.size() ? usbDevices.get(position) : null;
    }

    private void runUsbTask(String actionName, UsbDevice usbDevice, UsbTask task) {
        if (usbDevice == null) {
            toast(t("Nincs kiválasztott USB-tároló.", "No USB storage is selected."));
            return;
        }
        UsbManager manager = (UsbManager) getSystemService(Context.USB_SERVICE);
        Runnable start = () -> execute(actionName, () -> {
            try (RawUsbMassStorageDevice device = RawUsbMassStorageDevice.open(this, usbDevice)) {
                task.run(device);
            }
        });
        if (manager.hasPermission(usbDevice)) {
            start.run();
            return;
        }
        pendingUsbPermissionAction = start;
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags |= PendingIntent.FLAG_MUTABLE;
        PendingIntent permissionIntent = PendingIntent.getBroadcast(
                this, 0, new Intent(USB_PERMISSION_ACTION).setPackage(getPackageName()), flags);
        manager.requestPermission(usbDevice, permissionIntent);
        showStatus(t("USB-hozzáférési engedélyre vár.", "Waiting for USB permission."), 0);
    }

    private void execute(String actionName, ThrowingTask task) {
        if (operationRunning) {
            toast(t("Már fut egy művelet.", "Another operation is already running."));
            return;
        }
        operationRunning = true;
        cancellation.set(false);
        ui.post(() -> {
            cancelButton.setVisibility(View.VISIBLE);
            headerState.setText(t("MŰVELET FUT", "OPERATION RUNNING"));
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            showStatus(t("Művelet előkészítése…", "Preparing operation…"), 0);
        });
        executor.execute(() -> {
            try {
                task.run();
                if (!cancellation.get()) {
                    OperationLog.append(this, actionName, "ok", "");
                    postStatus(t("Művelet kész.", "Operation completed."), 100);
                }
            } catch (Exception error) {
                String message = error.getMessage() == null ? error.getClass().getSimpleName() : error.getMessage();
                OperationLog.append(this, actionName, cancellation.get() ? "cancelled" : "error", message);
                postStatus((cancellation.get()
                        ? t("Művelet leállítva: ", "Operation cancelled: ")
                        : t("Hiba: ", "Error: ")) + message, 0);
            } finally {
                operationRunning = false;
                ui.post(() -> {
                    cancelButton.setVisibility(View.GONE);
                    headerState.setText(t("KÉSZENLÉT", "READY"));
                    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                });
            }
        });
    }

    private void postProgress(int percent, String message) {
        ui.post(() -> showStatus(message, percent));
    }

    private void postStatus(String message, int percent) {
        ui.post(() -> showStatus(message, percent));
    }

    private void showStatus(String message, int percent) {
        if (globalMessage != null) globalMessage.setText(message);
        if (globalProgress != null) globalProgress.setProgress(Math.max(0, Math.min(100, percent)));
    }

    private void confirmDestructive(String title, String message, String expected, Runnable action) {
        EditText input = dialogInput(expected);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
        new AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .setView(input)
                .setPositiveButton(t("MEGERŐSÍTÉS", "CONFIRM"), (dialog, which) -> {
                    if (expected.equals(input.getText().toString().trim())) {
                        action.run();
                    } else {
                        toast(t("A megerősítő szöveg nem egyezik.", "The confirmation text does not match."));
                    }
                })
                .setNegativeButton(t("MÉGSE", "CANCEL"), null)
                .show();
    }

    private void openDocument(int requestCode, String[] mimeTypes) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT)
                .addCategory(Intent.CATEGORY_OPENABLE)
                .setType(mimeTypes.length == 1 ? mimeTypes[0] : "*/*")
                .putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(intent, requestCode);
    }

    private void openTree(int requestCode) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                        | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                        | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                        | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(intent, requestCode);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        persistUri(uri, data.getFlags());
        switch (requestCode) {
            case REQUEST_IMAGE:
                selectedImageUri = uri;
                showIsoUsb();
                break;
            case REQUEST_LEFT_TREE:
                leftDirectory = DocumentFile.fromTreeUri(this, uri);
                preferences.edit().putString("leftTree", uri.toString()).apply();
                leftSelection = null;
                showFileManager();
                break;
            case REQUEST_RIGHT_TREE:
                rightDirectory = DocumentFile.fromTreeUri(this, uri);
                preferences.edit().putString("rightTree", uri.toString()).apply();
                rightSelection = null;
                showFileManager();
                break;
            case REQUEST_CREATE_ZIP:
                DocumentFile zipSource = pendingZipSource;
                pendingZipSource = null;
                if (zipSource != null) execute("zip", () -> StorageTools.zip(
                        this, zipSource, uri, message -> postProgress(0, message)));
                break;
            case REQUEST_OPEN_ZIP:
                DocumentFile unzipTarget = pendingUnzipTarget;
                pendingUnzipTarget = null;
                if (unzipTarget != null) execute("unzip", () -> {
                    StorageTools.unzip(this, uri, unzipTarget, message -> postProgress(0, message));
                    ui.post(this::showFileManager);
                });
                break;
            case REQUEST_INTEGRITY_DATA:
                integrityDataUri = uri;
                showIntegrity();
                break;
            case REQUEST_PUBLIC_KEY:
                integrityPublicKeyUri = uri;
                showIntegrity();
                break;
            case REQUEST_SIGNATURE:
                integritySignatureUri = uri;
                showIntegrity();
                break;
            case REQUEST_EXPORT_LOG:
                execute("log_export", () -> OperationLog.exportCsv(this, uri));
                break;
            default:
                break;
        }
    }

    private void persistUri(Uri uri, int flags) {
        int takeFlags = flags & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        try {
            getContentResolver().takePersistableUriPermission(uri, takeFlags);
        } catch (Exception ignored) {
            // Some providers grant only temporary access.
        }
    }

    private void restoreDirectories() {
        try {
            String left = preferences.getString("leftTree", "");
            String right = preferences.getString("rightTree", "");
            if (left != null && !left.trim().isEmpty()) leftDirectory = DocumentFile.fromTreeUri(this, Uri.parse(left));
            if (right != null && !right.trim().isEmpty()) rightDirectory = DocumentFile.fromTreeUri(this, Uri.parse(right));
        } catch (Exception ignored) {
            leftDirectory = null;
            rightDirectory = null;
        }
    }

    private void registerUsbReceiver() {
        IntentFilter filter = new IntentFilter(USB_PERMISSION_ACTION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(usbPermissionReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(usbPermissionReceiver, filter);
        }
        receiverRegistered = true;
    }

    @Override
    protected void onDestroy() {
        cancellation.set(true);
        executor.shutdownNow();
        if (receiverRegistered) {
            try {
                unregisterReceiver(usbPermissionReceiver);
            } catch (Exception ignored) {
                // Receiver may already have been removed by the system.
            }
        }
        super.onDestroy();
    }

    private void setPage(LinearLayout page) {
        content.removeAllViews();
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.addView(page);
        content.addView(scroll, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
    }

    private LinearLayout page(String title, String lead) {
        LinearLayout page = vertical();
        page.setPadding(dp(16), dp(22), dp(16), dp(30));
        TextView heading = text(title, 28, true);
        page.addView(heading);
        TextView description = muted(lead, 14);
        LinearLayout.LayoutParams descriptionParams = spacedMatch();
        descriptionParams.topMargin = dp(8);
        descriptionParams.bottomMargin = dp(20);
        page.addView(description, descriptionParams);
        return page;
    }

    private View actionCard(String icon, String title, String description, View.OnClickListener listener) {
        LinearLayout card = horizontal();
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setPadding(dp(16), dp(15), dp(14), dp(15));
        card.setBackground(panelBackground(dark ? 0xFF081A35 : 0xFFFFFFFF,
                dark ? 0xFF081A35 : 0xFFFFFFFF, accentColor(), dp(16)));
        TextView iconView = text(icon, 26, true);
        iconView.setTextColor(accentColor());
        iconView.setGravity(Gravity.CENTER);
        card.addView(iconView, new LinearLayout.LayoutParams(dp(48), dp(48)));
        LinearLayout copy = vertical();
        copy.setPadding(dp(12), 0, dp(8), 0);
        copy.addView(text(title, 16, true));
        copy.addView(muted(description, 12));
        card.addView(copy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView arrow = text("→", 22, false);
        arrow.setTextColor(accentColor());
        card.addView(arrow);
        card.setOnClickListener(listener);
        card.setClickable(true);
        card.setFocusable(true);
        LinearLayout.LayoutParams params = spacedMatch();
        params.bottomMargin = dp(10);
        card.setLayoutParams(params);
        return card;
    }

    private LinearLayout section(String title, View... children) {
        LinearLayout card = vertical();
        card.setPadding(dp(15), dp(14), dp(15), dp(15));
        card.setBackground(panelBackground(dark ? 0xFF07172E : 0xFFFFFFFF,
                dark ? 0xFF07172E : 0xFFFFFFFF, dark ? 0xFF24496F : 0xFFD4DFEC, dp(16)));
        TextView heading = text(title, 16, true);
        heading.setTextColor(accentColor());
        card.addView(heading);
        for (View child : children) {
            LinearLayout.LayoutParams params = spacedMatch();
            params.topMargin = dp(10);
            card.addView(child, params);
        }
        LinearLayout.LayoutParams outer = spacedMatch();
        outer.bottomMargin = dp(14);
        card.setLayoutParams(outer);
        return card;
    }

    private View warningCard(View contentView) {
        LinearLayout card = vertical();
        card.setPadding(dp(14), dp(13), dp(14), dp(13));
        card.setBackground(panelBackground(
                dark ? 0xFF2A2110 : 0xFFFFF7E5,
                dark ? 0xFF2A2110 : 0xFFFFF7E5,
                0xFFFFB74D,
                dp(14)
        ));
        card.addView(contentView);
        LinearLayout.LayoutParams params = spacedMatch();
        params.topMargin = dp(12);
        params.bottomMargin = dp(12);
        card.setLayoutParams(params);
        return card;
    }

    private LinearLayout buttonRow() {
        LinearLayout row = horizontal();
        row.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        row.setBaselineAligned(false);
        return row;
    }

    private Button navButton(String icon, String label, View.OnClickListener listener) {
        Button button = new Button(this);
        button.setText(icon + "\n" + label);
        button.setTextSize(10);
        button.setTextColor(textColor());
        button.setAllCaps(false);
        button.setGravity(Gravity.CENTER);
        button.setMinWidth(dp(92));
        button.setMinHeight(dp(58));
        button.setPadding(dp(8), dp(4), dp(8), dp(4));
        button.setBackgroundTintList(ColorStateList.valueOf(dark ? 0xFF07172E : 0xFFF2F6FB));
        button.setOnClickListener(listener);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(98), dp(62));
        params.setMargins(dp(3), 0, dp(3), 0);
        button.setLayoutParams(params);
        return button;
    }

    private Button primaryButton(String label, View.OnClickListener listener) {
        return styledButton(label, accentColor(), dark ? 0xFF00131D : Color.WHITE, listener);
    }

    private Button secondaryButton(String label, View.OnClickListener listener) {
        return styledButton(label, dark ? 0xFF173758 : 0xFFE4ECF5, textColor(), listener);
    }

    private Button dangerButton(String label, View.OnClickListener listener) {
        return styledButton(label, dark ? 0xFF7A2430 : 0xFFD73346, Color.WHITE, listener);
    }

    private Button compactButton(String label, View.OnClickListener listener) {
        Button button = styledButton(label, dark ? 0xFF27384D : 0xFFDCE5F0, textColor(), listener);
        button.setMinHeight(dp(34));
        button.setTextSize(10);
        return button;
    }

    private Button styledButton(String label, int background, int foreground, View.OnClickListener listener) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(foreground);
        button.setTextSize(11);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setAllCaps(false);
        button.setMinHeight(dp(46));
        button.setBackgroundTintList(ColorStateList.valueOf(background));
        button.setOnClickListener(listener);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, dp(8), dp(7));
        button.setLayoutParams(params);
        return button;
    }

    private Spinner spinner() {
        Spinner spinner = new Spinner(this, Spinner.MODE_DROPDOWN);
        spinner.setPopupBackgroundDrawable(panelBackground(
                dark ? 0xFF0B213F : 0xFFFFFFFF,
                dark ? 0xFF0B213F : 0xFFFFFFFF,
                accentColor(),
                dp(10)
        ));
        return spinner;
    }

    private ArrayAdapter<String> simpleAdapter(String[] values) {
        return new ArrayAdapter<String>(this, android.R.layout.simple_spinner_dropdown_item, values) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                TextView view = (TextView) super.getView(position, convertView, parent);
                view.setTextColor(textColor());
                view.setTextSize(13);
                view.setPadding(dp(10), dp(10), dp(10), dp(10));
                return view;
            }

            @Override
            public View getDropDownView(int position, View convertView, ViewGroup parent) {
                TextView view = (TextView) super.getDropDownView(position, convertView, parent);
                view.setTextColor(textColor());
                view.setBackgroundColor(dark ? 0xFF0B213F : 0xFFFFFFFF);
                view.setPadding(dp(12), dp(12), dp(12), dp(12));
                return view;
            }
        };
    }

    private EditText editText(String hint) {
        EditText input = new EditText(this);
        input.setHint(hint);
        input.setHintTextColor(mutedColor());
        input.setTextColor(textColor());
        input.setTextSize(13);
        input.setSingleLine(true);
        input.setPadding(dp(12), dp(10), dp(12), dp(10));
        input.setBackground(panelBackground(
                dark ? 0xFF061329 : 0xFFF7FAFD,
                dark ? 0xFF061329 : 0xFFF7FAFD,
                dark ? 0xFF31577E : 0xFFCCD9E7,
                dp(10)
        ));
        return input;
    }

    private EditText dialogInput(String hint) {
        EditText input = editText(hint);
        input.setSelectAllOnFocus(true);
        input.setPadding(dp(16), dp(12), dp(16), dp(12));
        return input;
    }

    private ListView createFileList() {
        ListView list = new ListView(this);
        list.setDividerHeight(1);
        list.setDivider(new android.graphics.drawable.ColorDrawable(dark ? 0xFF1B3553 : 0xFFDDE5EF));
        list.setBackgroundColor(dark ? 0xFF041025 : 0xFFF8FAFD);
        list.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(260)
        ));
        return list;
    }

    private TextView outputText() {
        TextView output = text("", 12, false);
        output.setTypeface(Typeface.MONOSPACE);
        output.setTextIsSelectable(true);
        output.setPadding(dp(12), dp(12), dp(12), dp(12));
        output.setBackground(panelBackground(
                dark ? 0xFF020B19 : 0xFFF4F7FB,
                dark ? 0xFF020B19 : 0xFFF4F7FB,
                dark ? 0xFF1C3A5D : 0xFFD7E0EC,
                dp(10)
        ));
        return output;
    }

    private TextView text(String value, int sizeSp, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextColor(textColor());
        view.setTextSize(sizeSp);
        view.setTypeface(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL);
        view.setLineSpacing(0, 1.14f);
        return view;
    }

    private TextView muted(String value, int sizeSp) {
        TextView view = text(value, sizeSp, false);
        view.setTextColor(mutedColor());
        return view;
    }

    private LinearLayout vertical() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    private LinearLayout horizontal() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        return layout;
    }

    private GradientDrawable panelBackground(int darkColor, int lightColor, int strokeColor, int radius) {
        GradientDrawable background = new GradientDrawable();
        background.setColor(dark ? darkColor : lightColor);
        background.setCornerRadius(radius);
        if (strokeColor != 0) background.setStroke(dp(1), strokeColor);
        return background;
    }

    private LinearLayout.LayoutParams match(int height) {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, height);
    }

    private LinearLayout.LayoutParams spacedMatch() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private int backgroundColor() {
        return dark ? 0xFF020814 : 0xFFF1F5FA;
    }

    private int textColor() {
        return dark ? 0xFFF4F8FF : 0xFF132338;
    }

    private int mutedColor() {
        return dark ? 0xFFAAB9CC : 0xFF53667D;
    }

    private int accentColor() {
        return dark ? 0xFF42DDFF : 0xFF087AA5;
    }

    private String t(String hu, String en) {
        return hungarian ? hu : en;
    }

    private String defaultLanguage() {
        return Locale.getDefault().getLanguage().equalsIgnoreCase("hu") ? "hu" : "en";
    }

    private boolean resolveDarkMode(String theme) {
        if ("dark".equals(theme)) return true;
        if ("light".equals(theme)) return false;
        int mode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return mode == Configuration.UI_MODE_NIGHT_YES;
    }

    private void applyWindowAppearance() {
        getWindow().setStatusBarColor(dark ? 0xFF020814 : 0xFFFFFFFF);
        getWindow().setNavigationBarColor(dark ? 0xFF020814 : 0xFFFFFFFF);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int visibility = getWindow().getDecorView().getSystemUiVisibility();
            if (dark) visibility &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            else visibility |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            getWindow().getDecorView().setSystemUiVisibility(visibility);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int visibility = getWindow().getDecorView().getSystemUiVisibility();
            if (dark) visibility &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            else visibility |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            getWindow().getDecorView().setSystemUiVisibility(visibility);
        }
    }

    private String directoryName(DocumentFile directory) {
        if (directory == null) return t("nincs kiválasztva", "not selected");
        String name = directory.getName();
        return name == null ? directory.getUri().toString() : name;
    }

    private String selectionText(DocumentFile selection) {
        return selection == null
                ? t("Nincs kijelölt elem.", "No item selected.")
                : t("Kijelölve: ", "Selected: ") + StorageTools.describe(selection);
    }

    private String uriName(Uri uri) {
        return uri == null ? t("nincs kiválasztva", "not selected")
                : IntegrityTools.displayName(getContentResolver(), uri);
    }

    private String safeFileName(String name) {
        if (name == null || name.trim().isEmpty()) return "FormatX-archive";
        return name.replace('/', '_').replace('\\', '_');
    }

    private long parseLong(String value, long fallback) {
        try {
            return Long.parseLong(value.trim());
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private int percent(long current, long total) {
        if (total <= 0) return 0;
        return (int) Math.max(0, Math.min(100, Math.round((double) current * 100.0 / total)));
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    @FunctionalInterface
    private interface ThrowingTask {
        void run() throws Exception;
    }

    @FunctionalInterface
    private interface UsbTask {
        void run(RawUsbMassStorageDevice device) throws Exception;
    }
}
