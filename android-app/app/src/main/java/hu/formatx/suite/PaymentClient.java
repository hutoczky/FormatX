package hu.formatx.suite;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

final class PaymentClient {
    private static final String API_ROOT = "https://formatxsuite.formatx.workers.dev/api";

    PaymentData createCheckout(String planId, String cycle, String currency, String name,
                               String email, String address, String orderReference,
                               long expectedAmount) throws Exception {
        JSONObject payload = new JSONObject();
        payload.put("plan_id", planId);
        payload.put("billing_cycle", cycle);
        payload.put("currency", currency);
        payload.put("company_name", name);
        payload.put("contact_name", name);
        payload.put("email", email);
        payload.put("billing_address", address);
        payload.put("tax_number", "");
        payload.put("purchase_order", "FormatX Android");
        payload.put("order_reference", orderReference);
        payload.put("payment_method", "EUR".equals(currency) ? "sepa_credit_transfer_qr" : "direct_bank_transfer_qr");
        JSONObject response = postJson(API_ROOT + "/create-checkout-session", payload);
        return PaymentData.fromJson(response, expectedAmount, orderReference);
    }

    boolean confirmPayment(PaymentData data, String payerName, String email, String transactionReference,
                           String planId, String cycle) throws Exception {
        JSONObject payload = new JSONObject();
        payload.put("order_reference", data.reference);
        payload.put("payer_name", payerName);
        payload.put("buyer_email", email);
        payload.put("transfer_reference", transactionReference);
        payload.put("message", "FormatX Android app");
        payload.put("plan_id", planId);
        payload.put("billing_cycle", cycle);
        payload.put("amount", String.valueOf(data.amount));
        payload.put("currency", data.currency);
        return postJson(API_ROOT + "/payment-confirmation", payload).optBoolean("ok", false);
    }

    private JSONObject postJson(String endpoint, JSONObject payload) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(endpoint).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(12000);
        connection.setDoOutput(true);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        try (OutputStream output = connection.getOutputStream()) {
            output.write(payload.toString().getBytes(StandardCharsets.UTF_8));
        }
        int code = connection.getResponseCode();
        InputStream stream = code >= 200 && code < 300 ? connection.getInputStream() : connection.getErrorStream();
        String text = readAll(stream);
        connection.disconnect();
        if (code < 200 || code >= 300) throw new IllegalStateException("HTTP " + code + ": " + text);
        return new JSONObject(text);
    }

    private static String readAll(InputStream input) throws Exception {
        if (input == null) return "{}";
        StringBuilder result = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) result.append(line);
        }
        return result.toString();
    }
}
