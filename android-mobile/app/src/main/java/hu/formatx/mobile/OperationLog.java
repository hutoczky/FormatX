package hu.formatx.mobile;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

public final class OperationLog {
    private static final String FILE_NAME = "formatx-native-operations.jsonl";
    private static final Object LOCK = new Object();

    private OperationLog() {}

    public static void append(Context context, String action, String status, String details) {
        synchronized (LOCK) {
            try {
                JSONObject item = new JSONObject();
                item.put("timestamp", Instant.now().toString());
                item.put("action", action == null ? "" : action);
                item.put("status", status == null ? "" : status);
                item.put("details", details == null ? "" : details);
                File file = new File(context.getFilesDir(), FILE_NAME);
                try (FileOutputStream output = new FileOutputStream(file, true)) {
                    output.write(item.toString().getBytes(StandardCharsets.UTF_8));
                    output.write('\n');
                }
            } catch (Exception ignored) {
                // Logging must never crash a storage operation.
            }
        }
    }

    public static String recent(Context context, int maximumLines) {
        synchronized (LOCK) {
            File file = new File(context.getFilesDir(), FILE_NAME);
            if (!file.isFile()) return "";
            Deque<String> lines = new ArrayDeque<>();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                    new FileInputStream(file), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (lines.size() >= maximumLines) lines.removeFirst();
                    lines.addLast(line);
                }
            } catch (Exception error) {
                return error.getMessage() == null ? "Could not read log" : error.getMessage();
            }

            StringBuilder output = new StringBuilder();
            for (String line : lines) {
                try {
                    JSONObject item = new JSONObject(line);
                    output.append(item.optString("timestamp"))
                            .append(" · ")
                            .append(item.optString("action"))
                            .append(" · ")
                            .append(item.optString("status"));
                    String details = item.optString("details");
                    if (!details.trim().isEmpty()) output.append(" · ").append(details);
                    output.append('\n');
                } catch (Exception ignored) {
                    output.append(line).append('\n');
                }
            }
            return output.toString();
        }
    }

    public static void exportCsv(Context context, Uri targetUri) throws IOException {
        synchronized (LOCK) {
            File file = new File(context.getFilesDir(), FILE_NAME);
            ContentResolver resolver = context.getContentResolver();
            try (OutputStream raw = resolver.openOutputStream(targetUri, "w");
                 BufferedWriter writer = raw == null ? null : new BufferedWriter(
                         new OutputStreamWriter(raw, StandardCharsets.UTF_8))) {
                if (writer == null) throw new IOException("Could not create CSV file");
                writer.write("timestamp,action,status,details\n");
                if (!file.isFile()) return;
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                        new FileInputStream(file), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        try {
                            JSONObject item = new JSONObject(line);
                            writer.write(csv(item.optString("timestamp")));
                            writer.write(',');
                            writer.write(csv(item.optString("action")));
                            writer.write(',');
                            writer.write(csv(item.optString("status")));
                            writer.write(',');
                            writer.write(csv(item.optString("details")));
                            writer.write('\n');
                        } catch (Exception ignored) {
                            writer.write(csv(line));
                            writer.write(",,,\n");
                        }
                    }
                }
            }
        }
    }

    public static boolean clear(Context context) {
        synchronized (LOCK) {
            File file = new File(context.getFilesDir(), FILE_NAME);
            return !file.exists() || file.delete();
        }
    }

    private static String csv(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return '"' + safe + '"';
    }
}
