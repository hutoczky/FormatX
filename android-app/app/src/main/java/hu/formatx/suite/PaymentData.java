package hu.formatx.suite;

import org.json.JSONObject;

import java.util.Locale;
import java.util.regex.Pattern;

final class PaymentData {
    private static final Pattern ORDER_REFERENCE_PATTERN = Pattern.compile("^FX-\\d{8}-[A-F0-9]{24}$");
    private static final Pattern LEGACY_ORDER_REFERENCE_PATTERN = Pattern.compile("^FX-\\d{10,}-[A-F0-9-]{8,}$");

    final long amount;
    final String currency;
    final String holder;
    final String localAccount;
    final String iban;
    final String bic;
    final String correspondentBic;
    final String reference;
    final String paymentUri;

    PaymentData(long amount, String currency, String holder, String localAccount, String iban,
                String bic, String correspondentBic, String reference, String paymentUri) {
        this.amount = amount;
        this.currency = currency;
        this.holder = holder;
        this.localAccount = localAccount;
        this.iban = iban;
        this.bic = bic;
        this.correspondentBic = correspondentBic;
        this.reference = reference;
        this.paymentUri = paymentUri;
    }

    static PaymentData fromJson(JSONObject response, long expectedAmount, String expectedReference) throws Exception {
        long amount = Math.round(response.getDouble("amount"));
        String reference = response.getString("order_reference").trim().toUpperCase(Locale.ROOT);
        boolean secureServerReference = ORDER_REFERENCE_PATTERN.matcher(reference).matches();
        boolean matchingLegacyReference = expectedReference != null
                && expectedReference.equals(reference)
                && LEGACY_ORDER_REFERENCE_PATTERN.matcher(reference).matches();
        if (amount != expectedAmount || (!secureServerReference && !matchingLegacyReference)) {
            throw new IllegalStateException("Unexpected server amount or order reference");
        }

        JSONObject account = response.getJSONObject("account");
        String currency = response.getString("currency");
        String iban = "EUR".equals(currency) ? account.getString("eur_iban") : account.getString("iban");
        return new PaymentData(
                amount,
                currency,
                account.getString("holder"),
                account.optString("local_huf_account", ""),
                iban,
                account.getString("bic"),
                account.optString("correspondent_bic", ""),
                reference,
                response.getString("payment_uri")
        );
    }
}
