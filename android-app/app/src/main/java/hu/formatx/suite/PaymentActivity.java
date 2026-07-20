package hu.formatx.suite;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.text.NumberFormat;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class PaymentActivity extends Activity {
    private static final Uri SUPPORT_URI = Uri.parse("https://www.formatxsuite.com/support.html");

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final PaymentClient paymentClient = new PaymentClient();

    private boolean english;
    private Spinner planSpinner;
    private Spinner cycleSpinner;
    private Spinner currencySpinner;
    private TextView regularPrice;
    private TextView finalPrice;
    private TextView discountLabel;
    private TextView status;
    private EditText nameInput;
    private EditText emailInput;
    private EditText addressInput;
    private Button prepareButton;
    private LinearLayout paymentPanel;
    private TextView amountValue;
    private TextView holderValue;
    private TextView accountValue;
    private TextView ibanValue;
    private TextView bicValue;
    private TextView referenceValue;
    private EditText transactionInput;
    private Button confirmationButton;
    private PaymentData paymentData;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xFF020711);
        getWindow().setNavigationBarColor(0xFF020711);
        english = "en".equalsIgnoreCase(getIntent().getStringExtra("lang"));
        setContentView(createContent());
        applyInitialSelection();
        updatePrice();
    }

    @Override
    protected void onDestroy() {
        executor.shutdownNow();
        super.onDestroy();
    }

    private View createContent() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(0xFF020711);

        LinearLayout root = vertical();
        root.setPadding(dp(20), dp(24), dp(20), dp(40));
        scroll.addView(root, matchWrap());

        TextView eyebrow = text(t("ANDROIDOS GYORSFIZETÉS", "ANDROID QUICK PAYMENT"), 12, 0xFF13D9FF, true);
        eyebrow.setLetterSpacing(0.18f);
        root.addView(eyebrow);
        root.addView(text("FormatX Suite Pro", 30, 0xFFEAFBFF, true));
        root.addView(text(t(
                "A teljes weboldal megmarad, de a fizetéshez nem kell ugyanazon a telefonon QR-kódot beolvasni. Az app kimásolja a pontos adatokat, majd megnyitja a banki alkalmazást.",
                "The complete website remains available, but payment does not require scanning a QR code on the same phone. The app copies the exact details and opens the banking app."
        ), 15, 0xFFBBD7E4, false), top(8));

        LinearLayout card = card();
        root.addView(card, top(20));
        card.addView(label(t("Csomag", "Plan")));
        planSpinner = spinner(new String[] { "Business Lite", "Business Pro", "Technician Team" });
        card.addView(planSpinner);
        card.addView(label(t("Időtartam", "Duration")));
        cycleSpinner = spinner(new String[] { t("Havi", "Monthly"), t("Éves", "Annual") });
        card.addView(cycleSpinner);
        card.addView(label(t("Deviza", "Currency")));
        currencySpinner = spinner(new String[] { "HUF", "EUR" });
        card.addView(currencySpinner);

        regularPrice = text("", 14, 0xFF7893A2, false);
        regularPrice.setPaintFlags(regularPrice.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
        card.addView(regularPrice, top(18));
        finalPrice = text("", 32, 0xFF13D9FF, true);
        card.addView(finalPrice);
        discountLabel = text("", 14, 0xFFB67CFF, true);
        card.addView(discountLabel);

        nameInput = input(t("Név vagy cégnév", "Name or company"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
        emailInput = input(t("E-mail-cím", "Email address"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        addressInput = input(t("Számlázási cím", "Billing address"), InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        root.addView(nameInput, top(12));
        root.addView(emailInput, top(10));
        root.addView(addressInput, top(10));

        prepareButton = button(t("Fizetés előkészítése", "Prepare payment"), true);
        root.addView(prepareButton, top(18));
        prepareButton.setOnClickListener(view -> preparePayment());

        status = text("", 14, 0xFFBBD7E4, false);
        root.addView(status, top(12));

        paymentPanel = card();
        paymentPanel.setVisibility(View.GONE);
        root.addView(paymentPanel, top(20));
        paymentPanel.addView(text(t("ÁTUTALÁSI ADATOK", "TRANSFER DETAILS"), 12, 0xFF13D9FF, true));
        amountValue = detail(paymentPanel, t("Összeg", "Amount"));
        holderValue = detail(paymentPanel, t("Kedvezményezett", "Beneficiary"));
        accountValue = detail(paymentPanel, t("HUF számlaszám", "HUF account"));
        ibanValue = detail(paymentPanel, "IBAN");
        bicValue = detail(paymentPanel, "BIC / SWIFT");
        referenceValue = detail(paymentPanel, t("Közlemény", "Reference"));

        Button copy = button(t("Adatok másolása", "Copy details"), false);
        paymentPanel.addView(copy, top(14));
        copy.setOnClickListener(view -> copyDetails(true));

        Button bank = button(t("Másolás és banki app megnyitása", "Copy and open banking app"), true);
        paymentPanel.addView(bank, top(10));
        bank.setOnClickListener(view -> openBankingApp());

        transactionInput = input(t("Banki tranzakció hivatkozása", "Bank transaction reference"), InputType.TYPE_CLASS_TEXT);
        paymentPanel.addView(transactionInput, top(14));
        confirmationButton = button(t("Fizetést elküldtem", "I sent the payment"), false);
        paymentPanel.addView(confirmationButton, top(10));
        confirmationButton.setOnClickListener(view -> confirmPayment());

        TextView warning = text(t(
                "A licenc az átutalás kézi ellenőrzése után aktiválódik. Jóváhagyás előtt ellenőrizd az összeget, az IBAN-t és a közleményt.",
                "The licence activates after manual transfer verification. Check the amount, IBAN and reference before approval."
        ), 12, 0xFFFFC979, false);
        paymentPanel.addView(warning, top(14));

        Button support = button(t("Támogatás megnyitása", "Open support"), false);
        paymentPanel.addView(support, top(10));
        support.setOnClickListener(view -> openSupport());

        AdapterView.OnItemSelectedListener listener = new AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(AdapterView<?> parent, View view, int position, long id) { updatePrice(); }
            @Override public void onNothingSelected(AdapterView<?> parent) { }
        };
        planSpinner.setOnItemSelectedListener(listener);
        cycleSpinner.setOnItemSelectedListener(listener);
        currencySpinner.setOnItemSelectedListener(listener);
        return scroll;
    }

    private void applyInitialSelection() {
        String requestedPlan = valueOr(getIntent().getStringExtra("plan"), "business_pro");
        for (int i = 0; i < PriceCatalog.PLANS.length; i++) {
            if (PriceCatalog.PLANS[i].id.equals(requestedPlan)) planSpinner.setSelection(i);
        }
        cycleSpinner.setSelection("annual".equals(valueOr(getIntent().getStringExtra("cycle"), "monthly")) ? 1 : 0);
        currencySpinner.setSelection("EUR".equalsIgnoreCase(valueOr(getIntent().getStringExtra("currency"), "HUF")) ? 1 : 0);
    }

    private void updatePrice() {
        if (finalPrice == null) return;
        paymentData = null;
        paymentPanel.setVisibility(View.GONE);
        PriceCatalog.Plan plan = selectedPlan();
        regularPrice.setText(t("Eredeti ár: ", "Regular price: ") + money(plan.original(annual(), eur()), eur()));
        finalPrice.setText(money(plan.price(annual(), eur()), eur()));
        discountLabel.setText(annual()
                ? t("Éves kedvezmény: 30%", "Annual discount: 30%")
                : t("Egységes kedvezményes havi ár", "Unified discounted monthly price"));
    }

    private void preparePayment() {
        String name = nameInput.getText().toString().trim();
        String email = emailInput.getText().toString().trim();
        String address = addressInput.getText().toString().trim();
        if (name.isEmpty() || address.isEmpty() || !email.contains("@")) {
            toast(t("Töltsd ki a nevet, az e-mail-címet és a számlázási címet.", "Enter your name, email and billing address."));
            return;
        }

        PriceCatalog.Plan plan = selectedPlan();
        String cycle = annual() ? "annual" : "monthly";
        String currency = eur() ? "EUR" : "HUF";
        long expected = plan.price(annual(), eur());
        String orderReference = createReference();
        prepareButton.setEnabled(false);
        status.setText(t("A szerveroldalon rögzített összeg ellenőrzése…", "Checking the server-locked amount…"));

        executor.execute(() -> {
            try {
                PaymentData result = paymentClient.createCheckout(
                        plan.id, cycle, currency, name, email, address, orderReference, expected
                );
                runOnUiThread(() -> showPayment(result));
            } catch (Exception error) {
                runOnUiThread(() -> {
                    prepareButton.setEnabled(true);
                    status.setText(t(
                            "A fizetési adatok nem készültek el. Ellenőrizd az internetkapcsolatot, majd próbáld újra.",
                            "Payment details could not be prepared. Check your connection and try again."
                    ));
                });
            }
        });
    }

    private void showPayment(PaymentData result) {
        paymentData = result;
        prepareButton.setEnabled(true);
        prepareButton.setText(t("Új fizetés előkészítése", "Prepare another payment"));
        status.setText(t("Az összeg és a közlemény szerveroldalon ellenőrizve.", "The amount and reference were verified by the server."));
        amountValue.setText(money(result.amount, "EUR".equals(result.currency)));
        holderValue.setText(result.holder);
        accountValue.setText(result.localAccount.isEmpty() ? "—" : result.localAccount);
        ibanValue.setText(groupIban(result.iban));
        bicValue.setText(result.correspondentBic.isEmpty() ? result.bic : result.bic + " · " + result.correspondentBic);
        referenceValue.setText(result.reference);
        paymentPanel.setVisibility(View.VISIBLE);
    }

    private void copyDetails(boolean notify) {
        if (paymentData == null) return;
        String details = t("Kedvezményezett: ", "Beneficiary: ") + paymentData.holder + "\n"
                + t("HUF számlaszám: ", "HUF account: ") + paymentData.localAccount + "\n"
                + "IBAN: " + paymentData.iban + "\n"
                + "BIC / SWIFT: " + paymentData.bic + "\n"
                + t("Összeg: ", "Amount: ") + money(paymentData.amount, "EUR".equals(paymentData.currency)) + "\n"
                + t("Közlemény: ", "Reference: ") + paymentData.reference;
        ClipboardManager clipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        clipboard.setPrimaryClip(ClipData.newPlainText("FormatX payment", details));
        if (notify) toast(t("Az adatok a vágólapra kerültek.", "Details copied."));
    }

    private void openBankingApp() {
        if (paymentData == null) return;
        copyDetails(false);
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(paymentData.paymentUri));
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(Intent.createChooser(intent, t("Banki alkalmazás", "Banking app")));
        } catch (ActivityNotFoundException error) {
            toast(t(
                    "A telefon nem talált kompatibilis banki alkalmazást. Az adatok ki vannak másolva; nyisd meg kézzel a bankod appját.",
                    "No compatible banking app was found. The details are copied; open your banking app manually."
            ));
        }
    }

    private void openSupport() {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, SUPPORT_URI);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            toast(t("Nem található webböngésző.", "No web browser is available."));
        }
    }

    private void confirmPayment() {
        if (paymentData == null) return;
        String transaction = transactionInput.getText().toString().trim();
        if (transaction.isEmpty()) {
            toast(t("Add meg a banki tranzakció hivatkozását.", "Enter the bank transaction reference."));
            return;
        }
        confirmationButton.setEnabled(false);
        status.setText(t("A fizetési visszajelzés elküldése…", "Sending payment confirmation…"));
        PriceCatalog.Plan plan = selectedPlan();
        String cycle = annual() ? "annual" : "monthly";
        executor.execute(() -> {
            try {
                boolean sent = paymentClient.confirmPayment(
                        paymentData,
                        nameInput.getText().toString().trim(),
                        emailInput.getText().toString().trim(),
                        transaction,
                        plan.id,
                        cycle
                );
                runOnUiThread(() -> {
                    confirmationButton.setEnabled(true);
                    status.setText(sent
                            ? t("A visszajelzés rögzítve. A licenc az ellenőrzés után aktiválódik.", "Confirmation recorded. The licence activates after verification.")
                            : t("A szerver nem fogadta el a visszajelzést.", "The server did not accept the confirmation."));
                });
            } catch (Exception error) {
                runOnUiThread(() -> {
                    confirmationButton.setEnabled(true);
                    status.setText(t("A visszajelzés küldése sikertelen.", "Could not send the confirmation."));
                });
            }
        });
    }

    private PriceCatalog.Plan selectedPlan() {
        return PriceCatalog.PLANS[planSpinner.getSelectedItemPosition()];
    }

    private boolean annual() { return cycleSpinner.getSelectedItemPosition() == 1; }
    private boolean eur() { return currencySpinner.getSelectedItemPosition() == 1; }

    private String createReference() {
        return "FX-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String money(long amount, boolean euro) {
        NumberFormat format = NumberFormat.getIntegerInstance(english ? Locale.US : new Locale("hu", "HU"));
        return euro ? "€" + format.format(amount) : format.format(amount) + " Ft";
    }

    private String groupIban(String value) {
        return value.replaceAll("(.{4})(?!$)", "$1 ");
    }

    private String t(String hu, String en) { return english ? en : hu; }
    private String valueOr(String value, String fallback) { return value == null || value.isEmpty() ? fallback : value; }

    private LinearLayout vertical() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    private LinearLayout card() {
        LinearLayout layout = vertical();
        layout.setPadding(dp(18), dp(18), dp(18), dp(18));
        GradientDrawable background = new GradientDrawable();
        background.setColor(0xD90B1723);
        background.setStroke(dp(1), 0x6613D9FF);
        background.setCornerRadius(dp(18));
        layout.setBackground(background);
        return layout;
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setLineSpacing(0, 1.14f);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    private TextView label(String value) {
        TextView view = text(value, 12, 0xFF8FB4C6, true);
        view.setPadding(0, dp(12), 0, dp(5));
        return view;
    }

    private EditText input(String hint, int inputType) {
        EditText view = new EditText(this);
        view.setHint(hint);
        view.setHintTextColor(0xFF7893A2);
        view.setTextColor(0xFFEAFBFF);
        view.setInputType(inputType);
        view.setSingleLine(false);
        view.setPadding(dp(14), dp(12), dp(14), dp(12));
        GradientDrawable background = new GradientDrawable();
        background.setColor(0xCC07111C);
        background.setStroke(dp(1), 0x5513D9FF);
        background.setCornerRadius(dp(12));
        view.setBackground(background);
        return view;
    }

    private Spinner spinner(String[] values) {
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, values);
        Spinner spinner = new Spinner(this);
        spinner.setAdapter(adapter);
        return spinner;
    }

    private Button button(String value, boolean primary) {
        Button button = new Button(this);
        button.setText(value);
        button.setTextColor(primary ? 0xFF00141E : 0xFFEAFBFF);
        button.setAllCaps(false);
        GradientDrawable background = new GradientDrawable();
        background.setColor(primary ? 0xFF13D9FF : 0x3313D9FF);
        background.setStroke(dp(1), 0xAA13D9FF);
        background.setCornerRadius(dp(14));
        button.setBackground(background);
        return button;
    }

    private TextView detail(LinearLayout parent, String heading) {
        TextView label = label(heading);
        parent.addView(label);
        TextView value = text("—", 16, 0xFFEAFBFF, true);
        value.setTextIsSelectable(true);
        parent.addView(value);
        return value;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private LinearLayout.LayoutParams top(int margin) {
        LinearLayout.LayoutParams params = matchWrap();
        params.topMargin = dp(margin);
        return params;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
